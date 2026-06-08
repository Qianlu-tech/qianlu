"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/qianlu/Reveal";
import { useI18n } from "@/lib/i18n";

/**
 * Public, no-auth invoice payment surface. Used by both /pay (demo)
 * and /pay/:id (shared payment link). Wallet-to-wallet, no recipient account.
 */
export function InvoicePay({
  id = "QL-0834",
  amount = 12480,
  from = "0x9c4f…E1a2",
  to = "0x71b3…44dE",
}: {
  id?: string;
  amount?: number;
  from?: string;
  to?: string;
}) {
  const { t } = useI18n();
  const [asset, setAsset] = useState<"USDT" | "FDUSD" | "USDC">("USDT");
  const [sent, setSent] = useState(false);
  const fee = amount * 0.002;
  const net = amount - fee;

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
                <div className="mt-1 font-mono text-sm">{from}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("pay.to")}</div>
                <div className="mt-1 font-mono text-sm">{to}</div>
              </div>
            </div>

            <div className="my-8 text-center">
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("pay.amountDue")}</div>
              <div className="mt-2 font-display text-6xl font-semibold ink-text">
                ${amount.toLocaleString()}
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">{t("pay.settlesNote")}</div>
            </div>

            <div className="flex justify-center gap-1 rounded-full glass p-1 mx-auto w-fit">
              {(["USDT", "FDUSD", "USDC"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={`relative rounded-full px-5 py-2 text-xs font-semibold ${
                    asset === a ? "text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {asset === a && (
                    <motion.span layoutId="asset-pill" className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))" }} />
                  )}
                  {a}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-2">
              <Row k={t("pay.feeRow")} v={`${fee.toFixed(2)} ${asset}`} />
              <Row k={t("pay.recipientReceives")} v={`${net.toFixed(2)} ${asset}`} accent />
              <Row k={t("pay.settlement")} v={t("pay.settlementValue")} />
            </div>

            <button
              onClick={() => setSent(true)}
              disabled={sent}
              className="mt-8 w-full rounded-full py-4 font-semibold text-primary-foreground disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
              }}
            >
              {sent ? t("pay.sentBtn") : `${t("pay.payBtn")} ${amount.toLocaleString()} ${asset} →`}
            </button>

            <div className="mt-4 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              {t("pay.footnote")}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl glass px-4 py-3">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className={`font-mono text-sm font-semibold ${accent ? "text-primary" : ""}`}>{v}</span>
    </div>
  );
}
