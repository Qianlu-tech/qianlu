"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  BNB Smart Chain config                                             */
/* ------------------------------------------------------------------ */

type ChainConfig = {
  chainId: number;
  hexId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

const CHAINS: Record<number, ChainConfig> = {
  56: {
    chainId: 56,
    hexId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  97: {
    chainId: 97,
    hexId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
};

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
export const TARGET_CHAIN: ChainConfig = CHAINS[TARGET_CHAIN_ID] ?? CHAINS[56];

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

/** UTF-8 → 0x-hex so personal_sign renders the message readably in the wallet. */
function utf8ToHex(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let hex = "0x";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
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
  return `${TARGET_CHAIN.blockExplorerUrls[0]}/address/${addr}`;
}

/* ------------------------------------------------------------------ */
/*  Minimal EIP-1193 typing                                            */
/* ------------------------------------------------------------------ */

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { providers?: Eip1193Provider[] };
  }
}

function getEthereum(): Eip1193Provider | null {
  if (typeof window === "undefined" || !window.ethereum) return null;
  // If several wallets are injected, prefer MetaMask, else the first.
  const eth = window.ethereum;
  if (eth.providers?.length) {
    return eth.providers.find((p) => p.isMetaMask) ?? eth.providers[0];
  }
  return eth;
}

export class NoWalletError extends Error {
  constructor() {
    super("No injected wallet found");
    this.name = "NoWalletError";
  }
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
  hasWallet: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBnb: () => Promise<void>;
};

const WalletContext = createContext<WalletValue | null>(null);

async function ensureBnbChain(eth: Eip1193Provider): Promise<void> {
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: TARGET_CHAIN.hexId }],
    });
  } catch (err) {
    // 4902 = chain not added to the wallet yet → add it, then it's selected.
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: TARGET_CHAIN.hexId,
            chainName: TARGET_CHAIN.chainName,
            nativeCurrency: TARGET_CHAIN.nativeCurrency,
            rpcUrls: TARGET_CHAIN.rpcUrls,
            blockExplorerUrls: TARGET_CHAIN.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [hasWallet, setHasWallet] = useState(false);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      // Send the user somewhere they can install a wallet.
      if (typeof window !== "undefined") {
        window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
      }
      throw new NoWalletError();
    }
    setStatus("connecting");
    try {
      // 1. Ask the wallet to authorize this site (account access). Only prompts
      //    the first time / after the site is forgotten.
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const account = accounts[0];
      if (!account) throw new Error("No account authorized");

      // 2. Make sure we're on BNB Smart Chain.
      await ensureBnbChain(eth);
      const cid = (await eth.request({ method: "eth_chainId" })) as string;

      // 3. Authenticate the session with a signature (SIWE-style). personal_sign
      //    ALWAYS prompts, so connecting is a real, explicit authorization — not
      //    a silent reconnect. Backend hook: POST /auth/verify { address, message,
      //    signature } -> JWT (see backend.md §5).
      const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const issuedAt = new Date().toISOString();
      const message = buildSignInMessage(account, nonce, issuedAt);
      await eth.request({ method: "personal_sign", params: [utf8ToHex(message), account] });

      setAddress(account);
      setChainId(parseInt(cid, 16));
      setStatus("connected");
      writeSession({ address: account, issuedAt });
    } catch (err) {
      setStatus("disconnected");
      clearSession();
      throw err;
    }
  }, []);

  const switchToBnb = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) throw new NoWalletError();
    await ensureBnbChain(eth);
    const cid = (await eth.request({ method: "eth_chainId" })) as string;
    setChainId(parseInt(cid, 16));
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setStatus("disconnected");
    clearSession();
    // Best-effort: revoke permissions where supported (MetaMask) so the next
    // connect re-prompts for account access too.
    const eth = getEthereum();
    eth?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }).catch(() => {});
  }, []);

  // Detect wallet, eager-reconnect if previously connected, and subscribe to events.
  useEffect(() => {
    const eth = getEthereum();
    setHasWallet(!!eth);
    if (!eth) return;

    let active = true;

    const init = async () => {
      try {
        const session = readSession();
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
        if (!active) return;
        // Only restore a session that was actually authorized (signed) for the
        // account the wallet currently exposes — never silently reconnect w/o auth.
        if (session && accounts[0] && accounts[0].toLowerCase() === session.address.toLowerCase()) {
          const cid = (await eth.request({ method: "eth_chainId" })) as string;
          if (!active) return;
          setAddress(accounts[0]);
          setChainId(parseInt(cid, 16));
          setStatus("connected");
        } else if (session) {
          clearSession();
        }
      } catch {
        /* ignore silent reconnect failures */
      }
    };
    init();

    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      const session = readSession();
      if (!accounts || accounts.length === 0) {
        // Wallet locked or all accounts disconnected.
        setAddress(null);
        setStatus("disconnected");
        clearSession();
      } else if (session && accounts[0].toLowerCase() === session.address.toLowerCase()) {
        setAddress(accounts[0]);
        setStatus("connected");
      } else {
        // Switched to an account that hasn't authorized — require sign-in again.
        setAddress(null);
        setStatus("disconnected");
        clearSession();
      }
    };
    const onChainChanged = (...args: unknown[]) => {
      const hexId = args[0] as string;
      setChainId(parseInt(hexId, 16));
    };

    eth.on?.("accountsChanged", onAccountsChanged);
    eth.on?.("chainChanged", onChainChanged);

    return () => {
      active = false;
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const value = useMemo<WalletValue>(
    () => ({
      address,
      chainId,
      status,
      isConnected: status === "connected" && !!address,
      isCorrectChain: chainId === TARGET_CHAIN.chainId,
      hasWallet,
      connect,
      disconnect,
      switchToBnb,
    }),
    [address, chainId, status, hasWallet, connect, disconnect, switchToBnb],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
