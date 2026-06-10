"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, CartesianGrid,
} from "recharts";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { useWallet, formatAddress } from "@/lib/wallet";
import { useDashboardStats, useDashboardActivity, useVolume, useCorridors } from "@/lib/queries";

const VOL = Array.from({ length: 30 }, (_, i) => ({
  d: i + 1,
  v: 80 + Math.sin(i / 3) * 30 + i * 4 + (i % 4 === 0 ? 18 : 0),
}));
const CORR = [
  { n: "HK→SG", v: 184 },
  { n: "SZ→BK", v: 96 },
  { n: "TW→VN", v: 62 },
  { n: "AE→IN", v: 148 },
  { n: "KR→ID", v: 41 },
  { n: "JP→TH", v: 73 },
];

export default function DashboardView() {
  const { t } = useI18n();
  const stats = useDashboardStats(t("dashboard.stats") as { l: string; v: string; d: string }[]);
  const activity = useDashboardActivity(t("dashboard.activity") as { t: string; d: string; k: string }[]);
  const vol = useVolume(VOL);
  const corr = useCorridors(CORR);

  return (
    <section className="px-6 pt-32 pb-12">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <Header />
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <StatCard {...s} />
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <PanelHead title={t("dashboard.volumeTitle")} sub={t("dashboard.volumeSub")} />
              <div className="h-64 mt-4">
                <ResponsiveContainer>
                  <AreaChart data={vol} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.72 0.17 70)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="oklch(0.72 0.17 70)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" stroke="oklch(0.45 0.04 70)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.45 0.04 70)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "oklch(0.99 0.01 85)", border: "1px solid oklch(0.86 0.13 82 / 0.5)", borderRadius: 12, fontFamily: "var(--font-mono)" }} />
                    <Area type="monotone" dataKey="v" stroke="oklch(0.58 0.16 65)" strokeWidth={2.5} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 h-full">
              <PanelHead title={t("dashboard.quickSendTitle")} sub={t("dashboard.quickSendSub")} />
              <QuickSend />
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass rounded-3xl p-6">
              <PanelHead title={t("dashboard.heatmapTitle")} sub={t("dashboard.heatmapSub")} />
              <div className="h-56 mt-4">
                <ResponsiveContainer>
                  <BarChart data={corr}>
                    <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.86 0.05 80 / 0.5)" />
                    <XAxis dataKey="n" stroke="oklch(0.45 0.04 70)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.45 0.04 70)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "oklch(0.99 0.01 85)", border: "1px solid oklch(0.86 0.13 82 / 0.5)", borderRadius: 12, fontFamily: "var(--font-mono)" }} />
                    <Bar dataKey="v" fill="oklch(0.72 0.17 70)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 h-full">
              <PanelHead title={t("dashboard.activityTitle")} sub={t("dashboard.activitySub")} />
              <ul className="mt-4 space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl glass p-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse-glow" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{a.t}</div>
                      <div className="font-mono text-xs text-muted-foreground truncate">{a.d}</div>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{a.k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Header() {
  const { t } = useI18n();
  const { address, isConnected } = useWallet();
  const display = isConnected && address ? formatAddress(address) : "0x9c4f…E1a2";
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("dashboard.eyebrow")}</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
          {t("dashboard.welcome")} <span className="font-mono text-2xl md:text-3xl">{display}</span>
        </h1>
      </div>
      <div className="flex gap-2">
        <Link href="/app/invoices" className="glass rounded-full px-5 py-2.5 text-xs font-semibold">{t("common.newInvoice")}</Link>
        <Link href="/app/documents" className="rounded-full px-5 py-2.5 text-xs font-semibold text-primary-foreground"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
          {t("common.attestDocument")}
        </Link>
      </div>
    </div>
  );
}

function StatCard({ l, v, d }: { l: string; v: string; d: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-3xl p-6">
      <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{l}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{v}</div>
      <div className="mt-1 font-mono text-xs text-primary">{d}</div>
    </motion.div>
  );
}

function PanelHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <div className="font-display text-xl font-semibold">{title}</div>
      {sub && <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{sub}</div>}
    </div>
  );
}

function QuickSend() {
  const { t } = useI18n();
  return (
    <div className="mt-4 space-y-3">
      <Field label={t("dashboard.fRecipient")} mono placeholder="0x… or Basename" />
      <div className="grid grid-cols-3 gap-2">
        <Field label={t("dashboard.fAmount")} mono placeholder="0.00" />
        <Field label={t("dashboard.fAsset")} value="USDT" mono />
        <Field label={t("dashboard.fFee")} value="0.20%" mono />
      </div>
      <button className="w-full rounded-full py-3 font-semibold text-primary-foreground"
        style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
        {t("dashboard.sendArrow")}
      </button>
      <div className="font-mono text-[10px] tracking-widest text-center text-muted-foreground">
        {t("dashboard.settlesIn")}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, mono }: { label: string; placeholder?: string; value?: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-xl glass px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}
