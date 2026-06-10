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
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount, useDisconnect, useSignMessage, useSwitchChain } from "wagmi";
import { apiEnabled, authApi, setToken, clearToken, hasValidToken, ApiError } from "./api";

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

/** Build a sign-in message locally (used only when no backend is configured). */
function buildLocalMessage(address: string): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return buildSignInMessage(address, nonce, new Date().toISOString());
}

/** Did the user dismiss the wallet signature prompt (vs. a real failure)? */
function isUserRejection(err: unknown): boolean {
  const e = err as { code?: number; name?: string; message?: string } | null;
  return e?.code === 4001 || /reject|denied|cancell?ed/i.test(e?.name ?? e?.message ?? "");
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
  const queryClient = useQueryClient();
  const router = useRouter();

  const [signedAddress, setSignedAddress] = useState<string | null>(null);
  const prompting = useRef(false);

  // When the authenticated identity changes (sign-in completes, account switch,
  // disconnect), refetch all queries so authed endpoints pick up — or drop — the
  // JWT. Without this, data fetched before sign-in resolves to the placeholder
  // fallback (401 → catch) and never refetches once the token lands.
  useEffect(() => {
    queryClient.invalidateQueries();
  }, [signedAddress, queryClient]);

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
      // Public payment links (/pay, /pay/:id) are no-auth: a payer just connects
      // a wallet to pay. Don't force a SIWE sign-in, don't redirect into /app,
      // and don't disconnect them if they decline to sign. (/app/* stays gated —
      // "/app/pay" doesn't match "/pay".)
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/pay")) {
        return;
      }
      // Restore silently only if we ALSO still hold a non-expired JWT — a stored
      // session with a stale/missing token would 401 every authed call and fall
      // back to placeholder data. Otherwise drop through and re-sign.
      const session = readSession();
      if (session && session.address.toLowerCase() === address.toLowerCase() && hasValidToken()) {
        if (!cancelled) setSignedAddress(address);
        return;
      }
      if (prompting.current) return;
      prompting.current = true;
      const backendAuth = apiEnabled();
      try {
        // 1. Message to sign. With the backend live we MUST sign its issued nonce
        //    — a locally-built message can't be verified server-side (unknown
        //    nonce → 401), which previously left the user "connected" with no JWT
        //    and silently rendered placeholder data.
        const message = backendAuth
          ? (await authApi.nonce(address, chainId ?? TARGET_CHAIN.chainId)).message
          : buildLocalMessage(address);

        // 2. Sign it (wallet prompt — this is the explicit authorization).
        const signature = await signMessageAsync({ message });
        if (cancelled) return;

        // 3. Exchange the signature for a JWT. If this fails we are NOT signed in
        //    — let it throw so the catch cleans up rather than faking a session.
        if (backendAuth) {
          setToken((await authApi.verify(address, message, signature)).token);
        }

        if (cancelled) return;
        writeSession({ address, issuedAt: new Date().toISOString() });
        setSignedAddress(address);
        // Fresh sign-in (not a silent restore) → take the user to the app.
        router.push("/app");
      } catch (err) {
        // Either the user dismissed the prompt, or backend auth failed. Don't
        // leave a half-connected (token-less) session that renders demo data.
        clearSession();
        clearToken();
        setSignedAddress(null);
        if (!isUserRejection(err)) {
          // Surface the real reason instead of silently degrading to mock data.
          const reason =
            err instanceof ApiError
              ? `${err.code} (${err.status})`
              : (err as Error)?.message ?? "unknown error";
          console.error("[wallet] SIWE sign-in failed:", err);
          toast.error(`Wallet sign-in failed — ${reason}`);
        }
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
    clearToken();
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
