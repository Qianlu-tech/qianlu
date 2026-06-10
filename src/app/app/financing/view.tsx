"use client";

import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import {
  ResponsiveContainer, RadialBar, RadialBarChart, PolarAngleAxis,
} from "recharts";
import { useFinancingPositions } from "@/lib/queries";
import type { FinancingPosition } from "@/lib/api";

const POSITIONS: FinancingPosition[] = [
  { id: "QL-0821", coll: "$24,500 USDT-INV", bor: "$15,190 USDT", apy: "5.4%" },
  { id: "QL-0799", coll: "$48,000 FDUSD-INV", bor: "$29,760 USDT", apy: "5.1%" },
  { id: "QL-0782", coll: "$12,400 USDT-INV", bor: "$7,440 USDT", apy: "5.4%" },
];

export default function FinancingView() {
  const { t } = useI18n();
  const positions = useFinancingPositions(POSITIONS);
  return (
    <section className="px-6 pt-32 pb-12">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("financing.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
              {t("financing.titleA")} <span className="ink-text italic">{t("financing.titleEm")}</span>
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("financing.sub")}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("financing.healthTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("financing.healthSub")}</div>
              <div className="relative h-56 mt-2">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ name: "ltv", value: 62, fill: "oklch(0.72 0.17 70)" }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "oklch(0.93 0.025 85)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center font-display text-4xl font-semibold ink-text">62%</div>
              </div>
              <div className="mt-2 text-center font-mono text-[10px] tracking-widest text-jade">{t("financing.healthSafe")}</div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 h-full">
              <div className="font-display text-xl font-semibold">{t("financing.positionsTitle")}</div>
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{t("financing.positionsSub")}</div>
              <div className="mt-6 grid gap-3">
                {positions.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 items-center rounded-2xl glass px-5 py-4 gap-2">
                    <div className="col-span-2 font-mono text-sm">{p.id}</div>
                    <div className="col-span-4 font-mono text-xs text-muted-foreground">{p.coll}</div>
                    <div className="col-span-3 font-mono text-sm">{p.bor}</div>
                    <div className="col-span-2 font-mono text-sm text-primary">{p.apy} APY</div>
                    <div className="col-span-1 text-right">
                      <button className="rounded-full glass-amber px-3 py-1 text-[10px] font-semibold tracking-widest">{t("common.repay")}</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { l: t("financing.totalSupplied"), v: "$84,900" },
                  { l: t("financing.totalBorrowed"), v: "$52,390" },
                  { l: t("financing.netApy"), v: "5.32%" },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl glass-amber p-4">
                    <div className="font-mono text-[10px] tracking-widest text-foreground/70">{s.l}</div>
                    <div className="mt-1 font-display text-2xl font-semibold">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
