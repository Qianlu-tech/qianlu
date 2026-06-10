"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { toast } from "sonner";
import { Reveal } from "@/components/qianlu/Reveal";
import { useI18n } from "@/lib/i18n";
import { useWallet, formatAddress } from "@/lib/wallet";
import { useTransfer, humanizeError } from "@/lib/use-payments";
import { txUrl } from "@/lib/chain";
import { api, apiEnabled, invoicesApi, type Asset } from "@/lib/api";

const ASSETS: Asset[] = ["USDT", "FDUSD", "USDC"];

/**
 * Public, no-auth invoice payment surface. Used by /pay (demo) and /pay/:id
 * (shared link). Wallet-to-wallet on BSC — a plain BEP-20 transfer to the
 * invoice's address, no fee, then recorded via POST /invoices/:id/pay.
 */
export function InvoicePay({
  id = "QL-0834",
  amount = 12480,
  from = "0x9c4f…E1a2",
  to = "0x71b3…44dE",
  asset: invoiceAsset,
}: {
  id?: string;
  amount?: number;
  from?: string;
  to?: string;
  asset?: Asset;
}) {
  const { t } = useI18n();
  const { isConnected } = useAccount();
  const { connect } = useWallet();
  const transfer = useTransfer();

  const [asset, setAsset] = useState<Asset>(
    invoiceAsset && ASSETS.includes(invoiceAsset) ? invoiceAsset : "USDT",
  );
  const [phase, setPhase] = useState<"idle" | "preflight" | "sign" | "mining" | "sent" | "error">("idle");
  const [record, setRecord] = useState<"idle" | "offline" | "recording" | "paid" | "lagging" | "failed">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A real invoice carries a full address; the demo fallback is truncated.
  const payable = isAddress(to);
  const busy = phase === "preflight" || phase === "sign" || phase === "mining";
  const sent = phase === "sent";

  useEffect(() => {
    if (phase === "error" && error) toast.error(error);
  }, [phase, error]);

  async function pay() {
    setError(null);
    try {
      const hash = await transfer({ to, amount, asset }, (p, h) => {
        if (p === "mining" && h) setTxHash(h);
        setPhase(p);
      });
      setTxHash(hash);
      setPhase("sent");
      void recordInvoice(hash);
    } catch (err) {
      setError(humanizeError(err));
      setPhase("error");
    }
  }

  async function recordInvoice(hash: string) {
    if (!apiEnabled()) {
      setRecord("offline");
      return;
    }
    setRecord("recording");
    try {
      await invoicesApi.pay(id, hash);
    } catch (e) {
      console.error("[invoice] failed to record", e);
      setRecord("failed");
      return;
    }
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      try {
        const inv = await api.invoice(id);
        if ((inv.status || "").toLowerCase() === "paid") {
          setRecord("paid");
          return;
        }
      } catch {
        /* transient — keep polling */
      }
    }
    setRecord("lagging");
  }

  function buttonLabel() {
    if (sent) return "✓ Paid";
    if (!isConnected) return "Connect wallet to pay";
    if (phase === "preflight") return "Checking balance…";
    if (phase === "sign") return "Confirm in your wallet…";
    if (phase === "mining") return "Paying…";
    return `${t("pay.payBtn")} ${amount.toLocaleString()} ${asset} →`;
  }

  function onClick() {
    if (sent || busy) return;
    if (!isConnected) {
      connect();
      return;
    }
    if (payable) void pay();
  }

  return (
    <section className="px-6 pt-36 pb-20">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("pay.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
              {t("pay.title")} #{id}
            </h1>
            <p className="mt-3 text-muted-foreground">{t("pay.sub")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass mt-12 rounded-[2rem] p-8 md:p-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("pay.from")}</div>
                <div className="mt-1 font-mono text-sm">{formatAddress(from) || from}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("pay.to")}</div>
                <div className="mt-1 font-mono text-sm">{formatAddress(to) || to}</div>
              </div>
            </div>

            <div className="my-8 text-center">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("pay.amountDue")}</div>
              <div className="mt-2 font-display text-6xl font-semibold ink-text">${amount.toLocaleString()}</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">{t("pay.settlesNote")}</div>
            </div>

            <div className="flex justify-center gap-1 rounded-full glass p-1 mx-auto w-fit">
              {ASSETS.map((a) => (
                <button
                  key={a}
                  onClick={() => !busy && !sent && setAsset(a)}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold ${
                    asset === a ? "text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {asset === a && (
                    <motion.span
                      layoutId="asset-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))" }}
                    />
                  )}
                  {a}
                </button>
              ))}
            </div>

            {/* No fee — recipient receives the full amount. */}
            <div className="mt-8 space-y-2">
              <Row k={t("pay.recipientReceives")} v={`${amount.toLocaleString()} ${asset}`} accent />
              <Row k={t("pay.settlement")} v={t("pay.settlementValue")} />
            </div>

            <button
              onClick={onClick}
              disabled={sent || busy || (isConnected && !payable)}
              className="mt-8 w-full rounded-full py-4 font-semibold text-primary-foreground disabled:opacity-50 transition-opacity"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
              }}
            >
              {buttonLabel()}
            </button>

            {isConnected && !payable && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                This is a demo invoice — open a real /pay/&lt;id&gt; link to pay on-chain.
              </p>
            )}

            {txHash && (
              <div className="mt-4 text-center">
                <a
                  href={txUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] tracking-wide text-primary hover:underline"
                >
                  {formatAddress(txHash, 10, 8)} ↗ View on BscScan
                </a>
                <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">{recordLine(record)}</p>
              </div>
            )}

            <div className="mt-4 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              {t("pay.footnote")}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function recordLine(record: string): string {
  switch (record) {
    case "recording":
      return "Recording payment…";
    case "paid":
      return "✓ Invoice marked paid";
    case "lagging":
      return "On-chain ✓ — awaiting confirmation";
    case "failed":
      return "On-chain ✓ — couldn't update the invoice; funds moved, verify on BscScan";
    default:
      return "";
  }
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl glass px-4 py-3">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className={`font-mono text-sm font-semibold ${accent ? "text-primary" : ""}`}>{v}</span>
    </div>
  );
}
