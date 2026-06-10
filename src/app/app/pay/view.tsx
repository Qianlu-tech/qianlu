"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { usePaymentsRecents } from "@/lib/queries";

const RECENTS = ["0x71b3…44dE", "0x4a2f…91Ab", "0x8e02…03cF"];

export default function SendView() {
  const { t } = useI18n();
  const recents = usePaymentsRecents(RECENTS);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"USDT" | "FDUSD" | "USDC">("USDT");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const amt = parseFloat(amount) || 0;
  const fee = amt * 0.002;
  const net = amt - fee;
  const ready = !!recipient && amt > 0;

  function submit() {
    if (!ready) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1300);
  }

  return (
    <section className="px-6 pt-32 pb-16">
      <AppSubnav />
      <div className="mx-auto max-w-md">
        <Reveal>
          <div className="mb-6">
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("sendpage.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl font-medium">{t("sendpage.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("sendpage.sub")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="glass rounded-[2rem] p-6 md:p-8">
            {/* Recipient — wallet only */}
            <label className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              {t("sendpage.recipient")}
            </label>
            <input
              className="mt-2 w-full rounded-xl glass px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={t("sendpage.recipientPlaceholder")}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {t("sendpage.quickRecipients")}
              </span>
              {recents.map((r) => (
                <button
                  key={r}
                  onClick={() => setRecipient(r)}
                  className="rounded-full glass px-2.5 py-1 font-mono text-[11px] hover:text-primary"
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Amount + asset */}
            <label className="mt-6 block font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              {t("sendpage.amount")}
            </label>
            <div className="mt-2 flex gap-3">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 rounded-xl glass px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex overflow-hidden rounded-xl glass">
                {(["USDT", "FDUSD", "USDC"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAsset(a)}
                    className={`px-3 text-xs font-bold transition-colors ${
                      asset === a ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                    style={
                      asset === a
                        ? { background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))" }
                        : undefined
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            {amt > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-2"
              >
                <Row k={`${t("sendpage.feeRow")} (0.20%)`} v={`${fee.toFixed(2)} ${asset}`} />
                <Row k={t("sendpage.recipientReceives")} v={`${net.toFixed(2)} ${asset}`} accent />
                <Row k={t("sendpage.settlement")} v={t("sendpage.settlementValue")} />
              </motion.div>
            )}

            <button
              onClick={submit}
              disabled={!ready || sending || sent}
              className="mt-7 w-full rounded-full py-3.5 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
              }}
            >
              {sent
                ? "✓ TX 0x9af3…2c10"
                : sending
                ? t("sendpage.sendingBtn")
                : `${t("sendpage.sendBtn")} ${amount || "0"} ${asset} →`}
            </button>

            <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-muted-foreground">
              {t("sendpage.footnote")}
            </p>
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
