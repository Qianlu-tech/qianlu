"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative mt-32">
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <img src="/qianlu-logo.png" alt="" className="h-10 w-10" />
                <div>
                  <div className="font-display text-2xl font-semibold leading-none">Qianlu</div>
                  <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mt-1">
                    千路 · THOUSAND ROUTES
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm text-muted-foreground leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-3">
                {t("common.platform")}
              </div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/app" className="hover:text-primary">{t("nav.dashboard")}</Link></li>
                <li><Link href="/app/pay" className="hover:text-primary">{t("nav.send")}</Link></li>
                <li><Link href="/app/invoices" className="hover:text-primary">{t("nav.invoices")}</Link></li>
                <li><Link href="/app/financing" className="hover:text-primary">{t("nav.financing")}</Link></li>
                <li><Link href="/app/documents" className="hover:text-primary">{t("nav.documents")}</Link></li>
                <li><Link href="/app/settlement" className="hover:text-primary">{t("nav.settlement")}</Link></li>
                <li><Link href="/app/token" className="hover:text-primary">{t("nav.token")}</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-3">
                {t("common.builtOn")}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>BNB Smart Chain</li>
                <li>opBNB · L2</li>
                <li>Venus Protocol</li>
                <li>BNB Greenfield</li>
                <li>Chainlink · FDUSD</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>{t("footer.rights")}</div>
            <div className="font-mono tracking-widest">v0.1 · MAY 2026</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
