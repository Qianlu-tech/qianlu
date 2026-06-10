"use client";

import { useState } from "react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTokenOverview } from "@/lib/queries";
import type { TokenTier, TokenUtility, TokenDist } from "@/lib/api";

const DIST_COLORS = ["oklch(0.72 0.17 70)", "oklch(0.86 0.13 82)", "oklch(0.58 0.16 65)", "oklch(0.62 0.11 175)"];

export default function TokenView() {
  const { t } = useI18n();
  const [staked, setStaked] = useState(10000);
  const { tiers, utility, dist } = useTokenOverview({
    tiers: t("token.tiers") as TokenTier[],
    utility: t("token.utility") as TokenUtility[],
    dist: t("token.dist") as TokenDist[],
  });

  // current fee from staked amount
  const feePct = staked >= 100000 ? 0.08 : staked >= 10000 ? 0.12 : staked >= 1000 ? 0.16 : 0.2;

  return (
    <section className="px-6 pt-32 pb-16">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("token.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
              {t("token.titleA")} <span className="ink-text italic">{t("token.titleEm")}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("token.sub")}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Stake card */}
          <Reveal>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("token.yourStake")}</div>
              <div className="mt-6 rounded-2xl glass-amber p-5 text-center">
                <div className="font-mono text-[10px] tracking-widest text-foreground/70">{t("token.staked")}</div>
                <div className="mt-1 font-display text-4xl font-semibold ink-text">{staked.toLocaleString()}</div>
                <div className="font-mono text-xs text-foreground/60">QLU</div>
              </div>
              <input
                type="range" min={0} max={150000} step={1000}
                value={staked} onChange={(e) => setStaked(Number(e.target.value))}
                className="mt-5 w-full accent-[oklch(0.72_0.17_70)]"
              />
              <div className="mt-4 flex items-center justify-between rounded-2xl glass px-4 py-3">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("token.feeTier")}</span>
                <span className="font-mono text-lg font-semibold text-primary">{feePct.toFixed(2)}%</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-full py-2.5 text-xs font-semibold text-primary-foreground"
                  style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
                  {t("token.stakeBtn")}
                </button>
                <button className="rounded-full glass py-2.5 text-xs font-semibold">{t("token.unstakeBtn")}</button>
              </div>
            </div>
          </Reveal>

          {/* Revenue share */}
          <Reveal delay={0.05}>
            <div className="glass rounded-3xl p-6 h-full flex flex-col">
              <div className="font-display text-xl font-semibold">{t("token.claimTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("token.claimSub")}</div>
              <div className="my-auto py-8 text-center">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("token.claimable")}</div>
                <div className="mt-1 font-display text-5xl font-semibold ink-text">$1,284</div>
                <div className="font-mono text-xs text-muted-foreground">FDUSD</div>
              </div>
              <button className="w-full rounded-full py-3 font-semibold text-primary-foreground"
                style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
                {t("token.claimBtn")} →
              </button>
            </div>
          </Reveal>

          {/* Fee tiers */}
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("token.tiersTitle")}</div>
              <div className="mt-5 space-y-3">
                {tiers.map((tier) => (
                  <div key={tier.stake} className="flex items-center justify-between rounded-2xl glass px-4 py-3">
                    <span className="font-mono text-sm font-semibold">{tier.stake}</span>
                    <span className="font-mono text-xs text-primary">{tier.off}</span>
                    <span className="font-mono text-xs text-muted-foreground">{tier.pay}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Utility + distribution */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("token.utilityTitle")}</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {utility.map((u) => (
                  <div key={u.t} className="rounded-2xl glass p-4">
                    <div className="font-display text-lg font-semibold">{u.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{u.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("token.distTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">100,000,000 QLU</div>
              <div className="h-52 mt-4">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={dist} dataKey="v" nameKey="l" innerRadius="55%" outerRadius="100%" paddingAngle={2} stroke="none">
                      {dist.map((_, i) => (
                        <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "oklch(0.99 0.01 85)", border: "1px solid oklch(0.86 0.13 82 / 0.5)", borderRadius: 12, fontFamily: "var(--font-mono)" }}
                      formatter={(v: number, n: string) => [`${v}%`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-2">
                {dist.map((d, i) => (
                  <li key={d.l} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: DIST_COLORS[i % DIST_COLORS.length] }} />
                      {d.l}
                    </span>
                    <span className="font-mono font-semibold">{d.v}%</span>
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
