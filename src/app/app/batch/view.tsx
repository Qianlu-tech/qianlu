"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";

type Row = { wallet: string; amount: number; asset: string };

const SAMPLE: Row[] = [
  { wallet: "0x71b3…44dE", amount: 8420, asset: "USDT" },
  { wallet: "0x4a2f…91Ab", amount: 12600, asset: "FDUSD" },
  { wallet: "0x8e02…03cF", amount: 3150, asset: "USDT" },
  { wallet: "0xc104…77f1", amount: 9800, asset: "USDC" },
  { wallet: "0x9c4f…aa20", amount: 5400, asset: "USDT" },
  { wallet: "0x33ad…b7e9", amount: 21750, asset: "FDUSD" },
];

export default function BatchView() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [sent, setSent] = useState(false);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const fee = total * 0.002;

  function onFile(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) {
    const f =
      "dataTransfer" in e
        ? (e as React.DragEvent).dataTransfer.files?.[0]
        : (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (!f) return;
    f.text().then((text) => {
      const parsed = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(","))
        .filter((c) => c.length >= 2 && !/wallet/i.test(c[0]))
        .map((c) => ({
          wallet: c[0].trim(),
          amount: parseFloat(c[1]) || 0,
          asset: (c[2]?.trim() || "USDT").toUpperCase(),
        }));
      if (parsed.length) {
        setRows(parsed);
        setSent(false);
      }
    });
  }

  return (
    <section className="px-6 pt-32 pb-16">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("batch.eyebrow")}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">{t("batch.title")}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{t("batch.sub")}</p>
            </div>
            <button
              onClick={() => { setRows(SAMPLE); setSent(false); }}
              className="rounded-full glass px-5 py-2.5 text-xs font-semibold"
            >
              {t("batch.loadSample")}
            </button>
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
                  <div className="font-display text-lg font-semibold">{t("batch.previewTitle")}</div>
                  <div className="mt-3 overflow-hidden rounded-2xl glass">
                    <div className="grid grid-cols-12 border-b border-border/60 px-4 py-3 font-mono text-[10px] tracking-widest text-muted-foreground">
                      <div className="col-span-1">#</div>
                      <div className="col-span-6">{t("batch.colWallet")}</div>
                      <div className="col-span-3 text-right">{t("batch.colAmount")}</div>
                      <div className="col-span-2 text-right">{t("batch.colAsset")}</div>
                    </div>
                    {rows.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-12 items-center border-b border-border/40 px-4 py-3 last:border-0"
                      >
                        <div className="col-span-1 font-mono text-xs text-muted-foreground">{i + 1}</div>
                        <div className="col-span-6 font-mono text-sm">{r.wallet}</div>
                        <div className="col-span-3 text-right font-mono text-sm font-semibold">
                          ${r.amount.toLocaleString()}
                        </div>
                        <div className="col-span-2 text-right font-mono text-xs">{r.asset}</div>
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
                <Stat l={t("batch.recipients")} v={String(rows.length)} />
                <Stat l={t("batch.total")} v={`$${total.toLocaleString()}`} />
                <Stat l={t("batch.estFee")} v={`$${fee.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                <div className="rounded-2xl glass-amber p-4">
                  <div className="font-mono text-[10px] tracking-widest text-foreground/70">{t("batch.gasSaved")}</div>
                  <div className="mt-1 font-display text-3xl font-semibold ink-text">−40%</div>
                </div>
              </div>

              <button
                onClick={() => rows.length && setSent(true)}
                disabled={!rows.length || sent}
                className="mt-auto w-full rounded-full py-3.5 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
                }}
              >
                {sent ? t("batch.sent") : `${t("batch.execBtn")} →`}
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

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl glass px-4 py-3">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{l}</span>
      <span className="font-mono text-lg font-semibold">{v}</span>
    </div>
  );
}
