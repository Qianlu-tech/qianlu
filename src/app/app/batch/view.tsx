"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { useTransfer, recordPayment, humanizeError } from "@/lib/use-payments";
import { isAssetConfigured } from "@/lib/tokens";
import { txUrl } from "@/lib/chain";
import { formatAddress } from "@/lib/wallet";
import type { Asset } from "@/lib/api";

const ASSETS = ["USDT", "FDUSD", "USDC"];
type RowStatus = "queued" | "sending" | "sent" | "failed" | "invalid";
type Row = { wallet: string; amount: number; asset: Asset; valid: boolean; status: RowStatus; txHash?: string; error?: string };

function parseRows(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(","))
    .filter((c) => c.length >= 2 && !/wallet/i.test(c[0]))
    .map((c) => {
      const wallet = c[0].trim();
      const amount = parseFloat(c[1]) || 0;
      const asset = (c[2]?.trim() || "USDT").toUpperCase() as Asset;
      const valid = isAddress(wallet) && amount > 0 && ASSETS.includes(asset) && isAssetConfigured(asset);
      return { wallet, amount, asset, valid, status: (valid ? "queued" : "invalid") as RowStatus };
    });
}

export default function BatchView() {
  const { t } = useI18n();
  const transfer = useTransfer();
  const [rows, setRows] = useState<Row[]>([]);
  const [armed, setArmed] = useState(false);
  const [running, setRunning] = useState(false);

  const valid = rows.filter((r) => r.valid);
  const invalidCount = rows.length - valid.length;
  const sentCount = rows.filter((r) => r.status === "sent").length;
  const totals = valid.reduce<Record<string, number>>((m, r) => {
    m[r.asset] = (m[r.asset] || 0) + r.amount;
    return m;
  }, {});
  const totalsLabel =
    Object.entries(totals)
      .map(([a, v]) => `${v.toLocaleString()} ${a}`)
      .join(" · ") || "—";

  function onFile(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) {
    const f =
      "dataTransfer" in e
        ? (e as React.DragEvent).dataTransfer.files?.[0]
        : (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (!f) return;
    f.text().then((text) => {
      const parsed = parseRows(text);
      if (parsed.length) {
        setRows(parsed);
        setArmed(false);
      } else {
        toast.error("No valid rows found. Expected: wallet, amount, asset");
      }
    });
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function execute() {
    if (!valid.length || running) return;
    if (!armed) {
      setArmed(true); // first click arms; second click sends (real-funds confirm)
      return;
    }
    setRunning(true);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.valid || r.status === "sent") continue;
      updateRow(i, { status: "sending", error: undefined });
      try {
        const hash = await transfer({ to: r.wallet, amount: r.amount, asset: r.asset });
        updateRow(i, { status: "sent", txHash: hash });
        void recordPayment(hash, r.wallet, r.amount, r.asset);
      } catch (err) {
        updateRow(i, { status: "failed", error: humanizeError(err) });
      }
    }
    setRunning(false);
    setArmed(false);
  }

  const remaining = valid.length - sentCount;
  const execLabel = running
    ? `Sending… (${sentCount}/${valid.length})`
    : armed
    ? `Confirm — send ${remaining} transfer${remaining === 1 ? "" : "s"}`
    : t("batch.execBtn");

  return (
    <section className="px-6 pt-32 pb-16">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("batch.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">{t("batch.title")}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("batch.sub")}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Upload + preview */}
          <Reveal className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFile(e); }}
                className="block cursor-pointer rounded-2xl border-2 border-dashed border-primary/40 p-8 text-center transition-colors hover:border-primary"
              >
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl glass-amber">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="font-display text-xl">{t("batch.dropHint")}</div>
                <div className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">{t("batch.dropSub")}</div>
              </label>

              {rows.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg font-semibold">{t("batch.previewTitle")}</div>
                    {invalidCount > 0 && (
                      <div className="font-mono text-[10px] tracking-widest text-destructive">
                        {invalidCount} invalid row{invalidCount === 1 ? "" : "s"} skipped
                      </div>
                    )}
                  </div>
                  <div className="mt-3 overflow-hidden rounded-2xl glass">
                    <div className="grid grid-cols-12 border-b border-border/60 px-4 py-3 font-mono text-[10px] tracking-widest text-muted-foreground">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">{t("batch.colWallet")}</div>
                      <div className="col-span-2 text-right">{t("batch.colAmount")}</div>
                      <div className="col-span-1 text-right">{t("batch.colAsset")}</div>
                      <div className="col-span-3 text-right">STATUS</div>
                    </div>
                    {rows.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`grid grid-cols-12 items-center border-b border-border/40 px-4 py-3 last:border-0 ${
                          r.valid ? "" : "opacity-50"
                        }`}
                      >
                        <div className="col-span-1 font-mono text-xs text-muted-foreground">{i + 1}</div>
                        <div className="col-span-5 truncate font-mono text-sm">{r.wallet}</div>
                        <div className="col-span-2 text-right font-mono text-sm font-semibold">
                          {r.amount.toLocaleString()}
                        </div>
                        <div className="col-span-1 text-right font-mono text-xs">{r.asset}</div>
                        <div className="col-span-3 text-right">
                          <StatusCell row={r} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-muted-foreground">{t("batch.empty")}</p>
              )}
            </div>
          </Reveal>

          {/* Summary */}
          <Reveal delay={0.05}>
            <div className="glass rounded-3xl p-6 h-full flex flex-col">
              <div className="space-y-3">
                <Stat l={t("batch.recipients")} v={String(valid.length)} />
                <Stat l={t("batch.total")} v={totalsLabel} />
                <div className="rounded-2xl glass-amber p-4">
                  <div className="font-mono text-[10px] tracking-widest text-foreground/70">HOW IT SENDS</div>
                  <div className="mt-1 text-sm leading-relaxed text-foreground/80">
                    Each recipient is a separate BSC transfer. You approve one wallet prompt per row — real funds move
                    immediately.
                  </div>
                </div>
                {armed && !running && (
                  <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                    This sends real {totalsLabel} across {remaining} transfer{remaining === 1 ? "" : "s"}. Click again to
                    confirm.
                  </div>
                )}
              </div>

              <button
                onClick={execute}
                disabled={!valid.length || running}
                className="mt-auto w-full rounded-full py-3.5 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
                style={{
                  background: armed
                    ? "linear-gradient(135deg, oklch(0.62 0.2 25), oklch(0.52 0.18 20))"
                    : "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
                }}
              >
                {execLabel} {!running && !armed && "→"}
              </button>
              <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-muted-foreground">
                {t("batch.execNote")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StatusCell({ row }: { row: Row }) {
  if (row.status === "invalid")
    return <span className="font-mono text-[10px] tracking-widest text-destructive">INVALID</span>;
  if (row.status === "sending")
    return <span className="font-mono text-[10px] tracking-widest text-primary animate-pulse">SENDING…</span>;
  if (row.status === "failed")
    return (
      <span className="font-mono text-[10px] tracking-widest text-destructive" title={row.error}>
        FAILED
      </span>
    );
  if (row.status === "sent")
    return row.txHash ? (
      <a
        href={txUrl(row.txHash)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[10px] tracking-widest text-jade hover:underline"
      >
        ✓ {formatAddress(row.txHash, 6, 4)} ↗
      </a>
    ) : (
      <span className="font-mono text-[10px] tracking-widest text-jade">✓ SENT</span>
    );
  return <span className="font-mono text-[10px] tracking-widest text-muted-foreground">QUEUED</span>;
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl glass px-4 py-3">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{l}</span>
      <span className="font-mono text-sm font-semibold text-right">{v}</span>
    </div>
  );
}
