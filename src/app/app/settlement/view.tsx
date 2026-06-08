"use client";

import { motion } from "motion/react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";

const RECORDS = [
  { date: "2026-05-21", from: "0x9c4f…E1a2", to: "0x71b3…44dE", amt: 8420, asset: "USDT", tx: "0xd14a…f0b9" },
  { date: "2026-05-21", from: "0x9c4f…E1a2", to: "0x4a2f…91Ab", amt: 12600, asset: "FDUSD", tx: "0x77c0…2a1e" },
  { date: "2026-05-20", from: "0x9c4f…E1a2", to: "0x8e02…03cF", amt: 3150, asset: "USDT", tx: "0x1b9d…ce40" },
  { date: "2026-05-20", from: "0x33ad…b7e9", to: "0x9c4f…E1a2", amt: 21750, asset: "FDUSD", tx: "0xa0f2…7731" },
  { date: "2026-05-19", from: "0x9c4f…E1a2", to: "0xc104…77f1", amt: 9800, asset: "USDC", tx: "0x5e88…b0c2" },
  { date: "2026-05-19", from: "0x9c4f…E1a2", to: "0x9c4f…aa20", amt: 5400, asset: "USDT", tx: "0xf3a7…1d56" },
];

export default function SettlementView() {
  const { t } = useI18n();
  const stats = t("settlement.stats") as { l: string; v: string }[];
  const lifecycle = t("settlement.lifecycle") as string[];

  function exportCsv() {
    const header = ["date", "sender", "receiver", "amount", "asset", "tx_hash", "status"];
    const lines = RECORDS.map((r) => [r.date, r.from, r.to, r.amt, r.asset, r.tx, "settled"].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "qianlu-settlement.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="px-6 pt-32 pb-16">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("settlement.eyebrow")}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
                {t("settlement.titleA")} <span className="ink-text italic">{t("settlement.titleEm")}</span>
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{t("settlement.sub")}</p>
            </div>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("settlement.exportBtn")}
            </button>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="glass rounded-3xl p-6">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{s.l}</div>
                <div className="mt-2 font-display text-3xl font-semibold">{s.v}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Records table */}
          <Reveal className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("settlement.recordsTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("settlement.recordsSub")}</div>

              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-12 border-b border-border/60 px-3 py-3 font-mono text-[10px] tracking-widest text-muted-foreground">
                    <div className="col-span-2">{t("settlement.colDate")}</div>
                    <div className="col-span-2">{t("settlement.colSender")}</div>
                    <div className="col-span-2">{t("settlement.colReceiver")}</div>
                    <div className="col-span-2 text-right">{t("settlement.colAmount")}</div>
                    <div className="col-span-2">{t("settlement.colTx")}</div>
                    <div className="col-span-2 text-right">{t("settlement.colStatus")}</div>
                  </div>
                  {RECORDS.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-12 items-center border-b border-border/40 px-3 py-3.5 last:border-0 hover:bg-foreground/[0.02]"
                    >
                      <div className="col-span-2 font-mono text-xs text-muted-foreground">{r.date}</div>
                      <div className="col-span-2 font-mono text-xs">{r.from}</div>
                      <div className="col-span-2 font-mono text-xs">{r.to}</div>
                      <div className="col-span-2 text-right font-mono text-sm font-semibold">${r.amt.toLocaleString()}</div>
                      <div className="col-span-2 font-mono text-xs text-primary">{r.tx}</div>
                      <div className="col-span-2 text-right">
                        <span className="rounded-full bg-jade/15 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-jade">
                          {t("settlement.statusSettled")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* opBNB lifecycle log */}
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("settlement.logTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("settlement.logSub")}</div>
              <ol className="relative mt-6 space-y-6 pl-6">
                <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                {lifecycle.map((step, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-6 top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-background" />
                    </span>
                    <div className="font-semibold text-sm capitalize">{step}</div>
                    <div className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      opBNB · 0x{(i + 3).toString(16)}a{i}…{(i * 7 + 11).toString(16)}c
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
