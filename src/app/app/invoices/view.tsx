"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/qianlu/Reveal";
import { AppSubnav } from "@/components/qianlu/AppSubnav";
import { useI18n } from "@/lib/i18n";
import { useInvoices } from "@/lib/queries";
import type { InvoiceRow } from "@/lib/api";

const INV = [
  { id: "QL-0834", to: "0x71b3…44dE", amt: 12480, asset: "USDT", status: "due", days: 4 },
  { id: "QL-0833", to: "0x4a2f…91Ab", amt: 8200, asset: "FDUSD", status: "paid", days: 0 },
  { id: "QL-0821", to: "0x8e02…03cF", amt: 24500, asset: "USDT", status: "financed", days: 22 },
  { id: "QL-0817", to: "0xc104…77f1", amt: 5640, asset: "USDC", status: "due", days: 11 },
  { id: "QL-0810", to: "0x9c4f…aa20", amt: 41200, asset: "USDT", status: "overdue", days: -3 },
] as const;

const COLORS: Record<string, string> = {
  paid: "text-jade",
  due: "text-primary",
  financed: "text-foreground/70",
  overdue: "text-destructive",
};

export default function InvoicesView() {
  const { t } = useI18n();
  const rows = useInvoices(INV as unknown as InvoiceRow[]);
  return (
    <section className="px-6 pt-32 pb-12">
      <AppSubnav />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("invoices.eyebrow")}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">{t("invoices.title")}</h1>
              <p className="mt-2 text-muted-foreground">{t("invoices.sub")}</p>
            </div>
            <button className="rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.58 0.16 65))" }}>
              {t("invoices.newBtn")}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="glass mt-10 rounded-[2rem] overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-4 font-mono text-[10px] tracking-widest text-muted-foreground border-b border-border/60">
              <div className="col-span-2">{t("invoices.colId")}</div>
              <div className="col-span-4">{t("invoices.colPayer")}</div>
              <div className="col-span-2 text-right">{t("invoices.colAmount")}</div>
              <div className="col-span-2">{t("invoices.colAsset")}</div>
              <div className="col-span-2 text-right">{t("invoices.colStatus")}</div>
            </div>
            {rows.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 items-center px-6 py-5 border-b border-border/40 last:border-0 hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="col-span-2 font-mono text-sm">
                  <Link href={`/pay/${r.id}`} className="hover:text-primary">{r.id}</Link>
                </div>
                <div className="col-span-4 font-mono text-sm text-muted-foreground">{r.to}</div>
                <div className="col-span-2 text-right font-mono text-sm font-semibold">${r.amt.toLocaleString()}</div>
                <div className="col-span-2 font-mono text-xs">{r.asset}</div>
                <div className={`col-span-2 text-right font-mono text-xs font-semibold uppercase tracking-widest ${COLORS[r.status]}`}>
                  {t(`invoices.status.${r.status}`)} {r.days !== 0 && <span className="opacity-60">· {Math.abs(r.days)}d</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
