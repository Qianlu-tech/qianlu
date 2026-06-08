"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

const ITEMS = [
  { to: "/app", key: "dashboard" },
  { to: "/app/pay", key: "send" },
  { to: "/app/batch", key: "batch" },
  { to: "/app/invoices", key: "invoices" },
  { to: "/app/financing", key: "financing" },
  { to: "/app/documents", key: "documents" },
  { to: "/app/settlement", key: "settlement" },
  { to: "/app/token", key: "token" },
] as const;

/**
 * Secondary navigation for the dashboard (/app/*) area.
 * Horizontally scrollable pill bar with a liquid active indicator.
 */
export function AppSubnav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="mx-auto mb-8 max-w-7xl">
      <div className="glass flex items-center gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((item) => {
          const active =
            item.to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`relative z-10 shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
                active ? "text-primary-foreground" : "text-foreground/65 hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="subnav-pill"
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))",
                    boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.55), 0 8px 24px -8px oklch(0.72 0.17 70 / 0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
                />
              )}
              {t(`nav.${item.key}`)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
