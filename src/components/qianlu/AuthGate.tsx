"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";

/**
 * Gates the dashboard (`/app/*`). The flow:
 *   1. Disconnected  → "Connect your wallet" → opens the AppKit wallet picker.
 *   2. Connected, unsigned → "Confirm in your wallet" (the SIWE signature prompt
 *      from src/lib/wallet.tsx is up); wrong network → switch-chain prompt.
 *   3. Connected + signed (JWT issued) → renders the dashboard with real data.
 *
 * Unauthenticated users never see the dashboard's data — no demo numbers leak.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { status, isConnected, isCorrectChain, connect, switchToBnb, disconnect } = useWallet();
  const { isReconnecting, isConnecting } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Signed in → show the app.
  if (isConnected) return <>{children}</>;

  // Still resolving connection (SSR/hydration or wagmi reconnecting a stored
  // session) → neutral loader, so a returning user doesn't flash "Connect".
  if (!mounted || isReconnecting) {
    return (
      <GateShell>
        <Spinner />
      </GateShell>
    );
  }

  // Wallet connected but not yet authorized (signature pending) or on the wrong
  // chain. status === "connecting" means connected-but-not-signed.
  if (status === "connecting" || isConnecting) {
    if (!isCorrectChain) {
      return (
        <GateShell title={t("common.switchToBnb")} desc={t("common.gateSwitchDesc")}>
          <PrimaryButton onClick={() => switchToBnb()}>{t("common.switchToBnb")}</PrimaryButton>
          <GhostButton onClick={() => disconnect()}>{t("common.disconnect")}</GhostButton>
        </GateShell>
      );
    }
    return (
      <GateShell title={t("common.gateAuthorizing")} desc={t("common.gateAuthorizingDesc")}>
        <Spinner />
        <GhostButton onClick={() => disconnect()}>{t("common.disconnect")}</GhostButton>
      </GateShell>
    );
  }

  // Disconnected → connect CTA (opens the wallet picker → sign → dashboard).
  return (
    <GateShell title={t("common.gateTitle")} desc={t("common.gateDesc")}>
      <PrimaryButton onClick={connect}>{t("common.connectWallet")}</PrimaryButton>
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
        BSC · opBNB · NO KYC
      </div>
    </GateShell>
  );
}

function GateShell({ title, desc, children }: { title?: string; desc?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="grid min-h-[80svh] place-items-center px-6 pb-20 pt-36">
      <div className="glass w-full max-w-md rounded-[2rem] p-8 text-center">
        <img src="/qianlu-logo.png" alt="Qianlu" className="mx-auto h-14 w-14 select-none" draggable={false} />
        <div className="mt-4 select-none font-brush text-5xl leading-none ink-text" aria-hidden>
          {t("home.brush")}
        </div>
        {title && <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>}
        {desc && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{desc}</p>}
        <div className="mt-7 flex flex-col items-center gap-3">{children}</div>
      </div>
    </section>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
      style={{
        background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
        boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-jade animate-pulse-glow" />
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Spinner() {
  return <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />;
}
