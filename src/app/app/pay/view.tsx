"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { usePaymentsRecents } from "@/lib/queries";
import { useSendPayment } from "@/lib/use-payments";
import { formatAddress } from "@/lib/wallet";
import { txUrl } from "@/lib/chain";
import type { Asset } from "@/lib/api";

const ASSETS: Asset[] = ["USDT", "FDUSD", "USDC"];

export default function SendView() {
  const { t } = useI18n();
  const recents = usePaymentsRecents([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<Asset>("USDT");

  const { phase, record, txHash, error, send, reset } = useSendPayment();

  const amt = parseFloat(amount) || 0;
  const ready = !!recipient && amt > 0;
  const busy = phase === "preflight" || phase === "sign" || phase === "mining";
  const sent = phase === "sent";

  useEffect(() => {
    if (phase === "error" && error) toast.error(error);
  }, [phase, error]);

  function sendAnother() {
    reset();
    setRecipient("");
    setAmount("");
  }

  function buttonLabel() {
    if (sent) return "✓ Sent";
    if (phase === "preflight") return "Checking balance…";
    if (phase === "sign") return "Confirm in your wallet…";
    if (phase === "mining") return t("sendpage.sendingBtn");
    return ready ? `${t("sendpage.sendBtn")} ${amount || "0"} ${asset} →` : t("sendpage.sendBtn");
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
            {sent ? (
              <SentCard
                amount={amount}
                asset={asset}
                recipient={recipient}
                txHash={txHash}
                record={record}
                onAgain={sendAnother}
                t={t}
              />
            ) : (
              <>
                {/* Recipient — wallet only */}
                <label className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  {t("sendpage.recipient")}
                </label>
                <input
                  className="mt-2 w-full rounded-xl glass px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={t("sendpage.recipientPlaceholder")}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={busy}
                  spellCheck={false}
                />

                {recents.length > 0 && (
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
                        {formatAddress(r)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Amount + asset */}
                <label className="mt-6 block font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  {t("sendpage.amount")}
                </label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={busy}
                    className="flex-1 rounded-xl glass px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="flex overflow-hidden rounded-xl glass">
                    {ASSETS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAsset(a)}
                        disabled={busy}
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

                {/* Estimate — no fee: recipient gets the full amount */}
                {amt > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-2">
                    <Row k={t("sendpage.recipientReceives")} v={`${amt} ${asset}`} accent />
                    <Row k={t("sendpage.settlement")} v={t("sendpage.settlementValue")} />
                  </motion.div>
                )}

                {phase === "error" && error && (
                  <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
                )}

                <button
                  onClick={() => ready && send({ to: recipient, amount, asset })}
                  disabled={!ready || busy}
                  className="mt-7 w-full rounded-full py-3.5 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                    boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
                  }}
                >
                  {buttonLabel()}
                </button>

                <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-muted-foreground">
                  {t("sendpage.footnote")}
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SentCard({
  amount,
  asset,
  recipient,
  txHash,
  record,
  onAgain,
  t,
}: {
  amount: string;
  asset: string;
  recipient: string;
  txHash: string | null;
  record: string;
  onAgain: () => void;
  t: (k: string) => string;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-jade/15 text-2xl text-jade">✓</div>
      <div className="mt-4 font-display text-2xl font-semibold">
        Sent {amount} {asset}
      </div>
      <div className="mt-1 font-mono text-xs text-muted-foreground">to {formatAddress(recipient)}</div>

      {txHash && (
        <a
          href={txUrl(txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block break-all rounded-xl glass px-4 py-2.5 font-mono text-xs text-primary hover:underline"
        >
          {formatAddress(txHash, 10, 8)} ↗ View on BscScan
        </a>
      )}

      <p className="mt-4 font-mono text-[11px] tracking-wide text-muted-foreground">{recordLine(record)}</p>

      <button onClick={onAgain} className="mt-6 w-full rounded-full glass py-3 text-sm font-semibold hover:text-primary">
        {t("sendpage.sendBtn")} another →
      </button>
    </motion.div>
  );
}

function recordLine(record: string): string {
  switch (record) {
    case "recording":
      return "Recording payment…";
    case "settled":
      return "✓ Settled — added to your dashboard";
    case "lagging":
      return "On-chain ✓ — awaiting backend confirmation";
    case "failed":
      return "On-chain ✓ — couldn't record it; your funds moved, verify on BscScan";
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
