"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/qianlu/Reveal";
import { useI18n } from "@/lib/i18n";

export default function HomeView() {
  return (
    <div className="relative">
      <Hero />
      <BrushDivider />
      <Stats />
      <Corridors />
      <HowItWorks />
      <FeeCalc />
      <Modules />
      <CtaBand />
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const vidY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] pt-36 pb-20 px-6 overflow-hidden">
      {/* Full-bleed looping background video */}
      <motion.div style={{ y: vidY }} className="pointer-events-none absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover opacity-[0.5] mix-blend-multiply"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        {/* Silk veil so the cream theme + ink text stay legible over the video */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 60% at 50% 38%, oklch(0.975 0.022 88 / 0.55), oklch(0.975 0.022 88 / 0.86) 70%, oklch(0.975 0.022 88 / 0.96) 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[var(--silk)]" />
      </motion.div>

      <motion.div style={{ y, scale, opacity }} className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono tracking-[0.2em] text-foreground/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-jade animate-pulse-glow" />
            {t("home.badge")}
          </motion.div>

          {/* Chinese ink characters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 0.9, 0.3, 1] }}
            className="mt-8 font-brush text-[clamp(4rem,16vw,12rem)] leading-none ink-text select-none"
            aria-hidden
          >
            {t("home.brush")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-2 font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1.05] tracking-tight max-w-4xl"
          >
            {t("home.titleA")}
            <br />
            <span className="ink-text italic">{t("home.titleEm")}</span> {t("home.titleB")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9 }}
            className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground"
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/app"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))",
                boxShadow:
                  "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 14px 40px -12px oklch(0.72 0.17 70 / 0.6)",
              }}
            >
              <span className="relative z-10">{t("common.openDashboard")}</span>
              <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
              <span className="absolute inset-0 animate-shimmer opacity-50" />
            </Link>
            <Link
              href="/verify"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-foreground/80 hover:text-foreground"
            >
              {t("common.verifyDocument")}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.25em] text-foreground/50"
          >
            <span>BSC</span><span>·</span><span>opBNB</span><span>·</span>
            <span>VENUS</span><span>·</span><span>GREENFIELD</span><span>·</span>
            <span>CHAINLINK</span><span>·</span><span>FDUSD</span>
          </motion.div>
        </div>

        {/* Brand banner card */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 0.9, 0.3, 1] }}
          className="relative mx-auto mt-20 max-w-6xl"
        >
          <div className="glass overflow-hidden rounded-[2rem] p-2">
            <img src="/qianlu-banner.png" alt="Qianlu — Thousand Routes" className="w-full rounded-[1.6rem] select-none" draggable={false} />
          </div>
          <div className="absolute -inset-2 -z-10 rounded-[2.4rem] opacity-60 blur-3xl"
            style={{ background: "radial-gradient(60% 50% at 50% 50%, oklch(0.72 0.17 70 / 0.45), transparent 70%)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function BrushDivider() {
  return (
    <div className="mx-auto my-12 max-w-5xl px-6">
      <svg viewBox="0 0 1200 30" className="w-full h-6 opacity-70">
        <defs>
          <linearGradient id="bg1" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.17 70)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.72 0.17 70)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.72 0.17 70)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 15 C300 5, 900 25, 1200 15" stroke="url(#bg1)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Stats() {
  const { t } = useI18n();
  const stats = t("home.stats") as { v: string; l: string }[];
  return (
    <section className="px-6">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="glass rounded-[2rem] p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
              {stats.map((s, i) => (
                <div key={i} className="px-6 py-8 text-center">
                  <div className="font-display text-4xl md:text-5xl font-semibold ink-text">{s.v}</div>
                  <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Corridors() {
  const { t } = useI18n();
  const corridors = t("home.corridors") as { from: string; to: string; asset: string; vol: string; fee: string }[];
  return (
    <section className="px-6 pt-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader
            eyebrow={t("home.corridorsEyebrow")}
            title={t("home.corridorsTitle")}
            sub={t("home.corridorsSub")}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {corridors.map((c, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group glass relative overflow-hidden rounded-3xl p-6 transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between text-xs font-mono tracking-widest text-muted-foreground">
                  <span>{t("home.corridorLabel")} · {String(i + 1).padStart(2, "0")}</span>
                  <span className="rounded-full glass-amber px-2 py-0.5 text-[10px]">{c.asset}</span>
                </div>
                <div className="mt-6 flex items-center gap-3 font-display text-2xl">
                  <span>{c.from}</span>
                  <Arrow />
                  <span>{c.to}</span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("home.vol30d")}</div>
                    <div className="font-mono text-lg font-semibold">{c.vol}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("home.fee")}</div>
                    <div className="font-mono text-lg font-semibold text-primary">{c.fee}</div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: "radial-gradient(closest-side, oklch(0.72 0.17 70 / 0.35), transparent 70%)" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 60 16" className="h-3 flex-1 text-primary/80">
      <line x1="0" y1="8" x2="56" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <polyline points="50,3 58,8 50,13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const steps = t("home.steps") as { n: string; t: string; d: string }[];
  return (
    <section className="px-6 pt-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader eyebrow={t("home.howEyebrow")} title={t("home.howTitle")} />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="glass rounded-3xl p-7 h-full">
                <div className="font-brush text-5xl ink-text leading-none">{s.n}</div>
                <div className="mt-5 font-display text-2xl font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeeCalc() {
  const { t } = useI18n();
  const [amount, setAmount] = useState(50000);
  const swift = amount * 0.045;
  const qianlu = amount * 0.002;
  const save = swift - qianlu;
  return (
    <section className="px-6 pt-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="glass rounded-[2rem] p-8 md:p-12">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">{t("home.feeEyebrow")}</div>
                <h3 className="mt-3 font-display text-4xl md:text-5xl font-medium">
                  {t("home.feeTitleA")} <span className="ink-text">{t("home.feeTitleEm")}</span>{t("common.period")}
                </h3>
                <p className="mt-4 text-muted-foreground max-w-md">
                  {t("home.feeDesc")}
                </p>
                <div className="mt-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs tracking-widest text-muted-foreground">{t("home.feeVolume")}</span>
                    <span className="font-mono text-xl font-semibold">${amount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min={1000} max={500000} step={1000}
                    value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-3 w-full accent-[oklch(0.72_0.17_70)]"
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <Row label={t("home.feeSwift")} value={`$${swift.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} dim />
                <Row label={t("home.feeQianlu")} value={`$${qianlu.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent />
                <div className="glass-amber rounded-2xl p-5">
                  <div className="font-mono text-[10px] tracking-widest text-foreground/70">{t("home.feeSave")}</div>
                  <div className="mt-1 font-display text-4xl font-semibold ink-text">
                    ${save.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-1 font-mono text-xs text-foreground/60">
                    {t("home.feeFootnote")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ label, value, dim, accent }: { label: string; value: string; dim?: boolean; accent?: boolean }) {
  return (
    <div className={`glass rounded-2xl px-5 py-4 flex items-center justify-between ${dim ? "opacity-70" : ""}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-lg font-semibold ${accent ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function Modules() {
  const { t } = useI18n();
  const items = t("home.modules") as { t: string; d: string }[];
  return (
    <section className="px-6 pt-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeader eyebrow={t("home.modulesEyebrow")} title={t("home.modulesTitle")} />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((m, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="glass rounded-3xl p-8 flex items-start gap-5 h-full">
                <img src="/qianlu-logo.png" className="h-12 w-12 shrink-0" alt="" />
                <div>
                  <div className="font-display text-2xl font-semibold">{m.t}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const { t } = useI18n();
  return (
    <section className="px-6 pt-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] glass-amber p-10 md:p-16 text-center">
            <div className="font-brush text-7xl ink-text">{t("home.ctaBrush")}</div>
            <h3 className="mt-4 font-display text-4xl md:text-5xl font-medium">
              {t("home.ctaTitle")}
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              {t("home.ctaDesc")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className="rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-colors">
                {t("common.launchDemo")}
              </Link>
              <Link href="/pay" className="glass rounded-full px-6 py-3.5 text-sm font-semibold">
                {t("common.tryPay")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-3xl">
      <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl md:text-5xl font-medium leading-[1.1]">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground max-w-xl">{sub}</p>}
    </div>
  );
}
