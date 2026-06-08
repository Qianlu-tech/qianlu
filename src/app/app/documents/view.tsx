"use client";

import { motion } from "motion/react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";

export default function DocumentsView() {
  const { t } = useI18n();
  const stored = t("documents.stored") as { k: string; v: string }[];
  const docs = t("documents.docs") as { name: string; type: string; hash: string; time: string }[];

  return (
    <section className="px-6 pt-32 pb-12">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("documents.eyebrow")}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
                {t("documents.titleA")} <span className="ink-text">{t("documents.titleEm")}</span>{t("common.period")}
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{t("documents.sub")}</p>
            </div>
            <button className="rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
              {t("documents.attestBtn")}
            </button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <Reveal>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("documents.storedTitle")}</div>
              <ul className="mt-4 space-y-3 text-sm">
                {stored.map((r) => (
                  <li key={r.k} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                    <span className="text-muted-foreground">{r.k}</span>
                    <span className={`font-mono font-semibold ${r.v === "✓" ? "text-jade" : "text-destructive"}`}>{r.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("documents.recentTitle")}</div>
              <div className="mt-4 grid gap-3">
                {docs.map((d, i) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-2xl glass p-4"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl glass-amber">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{d.name}</div>
                      <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{d.type}</div>
                    </div>
                    <div className="font-mono text-xs">{d.hash}</div>
                    <div className="font-mono text-[10px] text-muted-foreground tabular-nums w-10 text-right">{d.time}</div>
                    <div className="rounded-full bg-jade/15 px-2.5 py-1 text-[10px] font-mono font-semibold tracking-widest text-jade">EAS ✓</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
