"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import {
  useWallet,
  formatAddress,
  explorerAddressUrl,
  TARGET_CHAIN,
  NoWalletError,
} from "@/lib/wallet";

/**
 * Connect / connected / wrong-network wallet control for BNB Smart Chain.
 * Used in the desktop nav and the mobile menu (pass a matching `className`).
 */
export function WalletButton({
  className = "",
  onAction,
}: {
  className?: string;
  onAction?: () => void;
}) {
  const { t } = useI18n();
  const { address, status, isConnected, isCorrectChain, connect, disconnect, switchToBnb } =
    useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dot = <span className="h-1.5 w-1.5 rounded-full bg-jade animate-pulse-glow" />;

  async function handleConnect() {
    try {
      await connect();
      toast.success(t("common.walletConnected"));
      onAction?.();
    } catch (err) {
      if (err instanceof NoWalletError) {
        toast.error(t("common.noWallet"));
      } else if ((err as { code?: number })?.code !== 4001) {
        // 4001 = user rejected; stay quiet for that.
        toast.error((err as Error)?.message ?? "Connection failed");
      }
    }
  }

  async function handleSwitch() {
    try {
      await switchToBnb();
    } catch (err) {
      if ((err as { code?: number })?.code !== 4001) {
        toast.error((err as Error)?.message ?? "Network switch failed");
      }
    }
  }

  // --- Connected but on the wrong network ---
  if (isConnected && !isCorrectChain) {
    return (
      <button
        onClick={handleSwitch}
        className={`inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-xs font-semibold tracking-wide text-destructive-foreground transition-colors hover:opacity-90 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" />
        {t("common.switchToBnb")}
      </button>
    );
  }

  // --- Connected on BNB Chain ---
  if (isConnected && address) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-semibold tracking-wide text-background transition-colors hover:bg-foreground ${className}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {dot}
          <span className="font-mono">{formatAddress(address)}</span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl glass p-1.5 text-sm shadow-xl"
          >
            <div className="px-3 py-2">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {TARGET_CHAIN.chainName}
              </div>
              <div className="mt-0.5 font-mono text-xs">{formatAddress(address, 10, 6)}</div>
            </div>
            <button
              role="menuitem"
              onClick={() => {
                navigator.clipboard?.writeText(address);
                toast.success(t("common.copied"));
                setOpen(false);
              }}
              className="block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-foreground/5"
            >
              {t("common.copyAddress")}
            </button>
            <a
              role="menuitem"
              href={explorerAddressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-foreground/5"
            >
              {t("common.viewOnBscScan")}
            </a>
            <button
              role="menuitem"
              onClick={() => {
                disconnect();
                setOpen(false);
                onAction?.();
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-destructive transition-colors hover:bg-destructive/10"
            >
              {t("common.disconnect")}
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Disconnected ---
  return (
    <button
      onClick={handleConnect}
      disabled={status === "connecting"}
      className={`inline-flex items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-semibold tracking-wide text-background transition-colors hover:bg-foreground disabled:opacity-60 ${className}`}
    >
      {dot}
      {status === "connecting" ? t("common.connecting") : t("common.connectWallet")}
    </button>
  );
}
