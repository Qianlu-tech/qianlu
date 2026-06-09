"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const SOCIALS = [
  { label: "X (Twitter)", href: "https://x.com/qianlubnb", Icon: XIcon },
  // TODO: replace with the real Telegram invite link once provided.
  { label: "Telegram", href: "#", Icon: TelegramIcon },
  { label: "GitHub", href: "https://github.com/Qianlu-tech/qianlu", Icon: GitHubIcon },
] as const;

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
              <div className="mt-6 flex items-center gap-3">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full glass text-foreground/70 transition-colors hover:text-primary"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
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
