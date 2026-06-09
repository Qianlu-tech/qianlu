"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc, bscTestnet, type AppKitNetwork } from "@reown/appkit/networks";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";

/* ------------------------------------------------------------------ */
/*  BNB Smart Chain config + AppKit / wagmi setup                      */
/* ------------------------------------------------------------------ */

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const CHAIN_META: Record<number, { chainId: number; chainName: string; blockExplorer: string }> = {
  56: { chainId: 56, chainName: "BNB Smart Chain", blockExplorer: "https://bscscan.com" },
  97: { chainId: 97, chainName: "BNB Smart Chain Testnet", blockExplorer: "https://testnet.bscscan.com" },
};
export const TARGET_CHAIN = CHAIN_META[TARGET_CHAIN_ID] ?? CHAIN_META[56];

// Networks offered in the modal (mainnet first, testnet available).
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, bscTestnet];
export const defaultNetwork = TARGET_CHAIN_ID === 97 ? bscTestnet : bsc;

// wagmi adapter that powers AppKit. Constructed once at module load.
export const wagmiAdapter = new WagmiAdapter({ projectId, networks, ssr: true });
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export const appKitMetadata = {
  name: "Qianlu",
  description: "Anonymous trade finance on BNB Chain",
  url: typeof window !== "undefined" ? window.location.origin : "https://qianlu.app",
  icons: ["https://qianlu.app/qianlu-logo.png"],
};

/* ------------------------------------------------------------------ */
/*  Session + SIWE helpers                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "qianlu-wallet-session";
type WalletSession = { address: string; issuedAt: string };

function readSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WalletSession) : null;
  } catch {
    return null;
  }
}
function writeSession(s: WalletSession) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

/** SIWE-style sign-in message the user authorizes with personal_sign. */
function buildSignInMessage(address: string, nonce: string, issuedAt: string): string {
  const domain = typeof window !== "undefined" ? window.location.host : "qianlu";
  return [
    `${domain} wants you to sign in with your BNB Chain wallet:`,
    address,
    "",
    "Sign to authorize Qianlu. This is off-chain and costs no gas.",
    "",
    `Chain ID: ${TARGET_CHAIN.chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

/** Truncate an address for display: 0x9c4f…E1a2 */
export function formatAddress(addr?: string | null, head = 6, tail = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** Block-explorer URL for an address on the active chain. */
export function explorerAddressUrl(addr: string): string {
  return `${TARGET_CHAIN.blockExplorer}/address/${addr}`;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type WalletStatus = "disconnected" | "connecting" | "connected";

type WalletValue = {
  address: string | null;
  chainId: number | null;
  status: WalletStatus;
  isConnected: boolean;
  isCorrectChain: boolean;
  /** Opens the AppKit modal (pick wallet — extensions, mobile, QR). */
  connect: () => void;
  disconnect: () => Promise<void>;
  switchToBnb: () => Promise<void>;
};

const WalletContext = createContext<WalletValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected: walletConnected, chainId } = useAccount();
  const { open } = useAppKit();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  const [signedAddress, setSignedAddress] = useState<string | null>(null);
  const prompting = useRef(false);

  // After a wallet connects via the modal, authorize the session with a
  // signature (SIWE-style). Restores silently if already signed for this account.
  // Backend hook: POST /auth/verify { address, message, signature } -> JWT.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!walletConnected || !address) {
        setSignedAddress(null);
        return;
      }
      const session = readSession();
      if (session && session.address.toLowerCase() === address.toLowerCase()) {
        if (!cancelled) setSignedAddress(address);
        return;
      }
      if (prompting.current) return;
      prompting.current = true;
      try {
        const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const issuedAt = new Date().toISOString();
        const message = buildSignInMessage(address, nonce, issuedAt);
        await signMessageAsync({ message });
        if (cancelled) return;
        writeSession({ address, issuedAt });
        setSignedAddress(address);
      } catch {
        // Rejected the signature → don't leave a half-connected wallet around.
        clearSession();
        setSignedAddress(null);
        try {
          await disconnectAsync();
        } catch {
          /* ignore */
        }
      } finally {
        prompting.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected, address]);

  const connect = useCallback(() => {
    open();
  }, [open]);

  const disconnect = useCallback(async () => {
    clearSession();
    setSignedAddress(null);
    try {
      await disconnectAsync();
    } catch {
      /* ignore */
    }
  }, [disconnectAsync]);

  const switchToBnb = useCallback(async () => {
    await switchChainAsync({ chainId: TARGET_CHAIN.chainId });
  }, [switchChainAsync]);

  const isAuthed =
    walletConnected && !!address && signedAddress?.toLowerCase() === address.toLowerCase();
  const status: WalletStatus = isAuthed ? "connected" : walletConnected ? "connecting" : "disconnected";

  const value = useMemo<WalletValue>(
    () => ({
      address: address ?? null,
      chainId: chainId ?? null,
      status,
      isConnected: !!isAuthed,
      isCorrectChain: chainId === TARGET_CHAIN.chainId,
      connect,
      disconnect,
      switchToBnb,
    }),
    [address, chainId, status, isAuthed, connect, disconnect, switchToBnb],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
