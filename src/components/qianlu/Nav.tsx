"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { WalletButton } from "@/components/qianlu/WalletButton";

const NAV = [
  { to: "/", key: "home" },
  { to: "/app", key: "dashboard" },
  { to: "/app/invoices", key: "invoices" },
  { to: "/app/financing", key: "financing" },
  { to: "/app/documents", key: "documents" },
  { to: "/verify", key: "verify" },
] as const;

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`relative flex items-center rounded-full glass p-0.5 ${className}`}>
      {(["en", "zh"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`relative z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              active ? "text-primary-foreground" : "text-foreground/60 hover:text-foreground"
            }`}
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-full"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))",
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.55)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {l === "en" ? "EN" : "中"}
          </button>
        );
      })}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <motion.nav
        layout
        className={`mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full px-3 py-2 transition-all duration-500 ${
          scrolled ? "glass shadow-xl" : "glass"
        }`}
        style={{ borderRadius: 9999 }}
      >
        <Link href="/" className="flex items-center gap-2 pl-2 pr-3">
          <img src="/qianlu-logo.png" alt="Qianlu" className="h-9 w-9 -my-1 select-none" draggable={false} />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold tracking-tight">Qianlu</span>
            <span className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground -mt-0.5">
              千路 · THOUSAND ROUTES
            </span>
          </div>
        </Link>

        {/* Desktop nav with liquid pill indicator */}
        <ul className="relative hidden md:flex items-center gap-1 rounded-full p-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to} className="relative">
                <Link
                  href={item.to}
                  className={`relative z-10 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-primary-foreground" : "text-foreground/75 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.72 0.17 70), oklch(0.86 0.13 82))",
                        boxShadow:
                          "inset 0 1px 0 oklch(1 0 0 / 0.55), 0 8px 24px -8px oklch(0.72 0.17 70 / 0.55)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
                    />
                  )}
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 pr-1">
          <LangToggle className="hidden sm:flex" />
          <WalletButton className="hidden sm:inline-flex" />
          <button
            aria-label="Menu"
            className="md:hidden h-9 w-9 grid place-items-center rounded-full glass"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-[1.5px] w-4 bg-foreground/80" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="md:hidden mx-auto mt-2 max-w-7xl glass rounded-3xl p-2"
          >
            <ul>
              {[
                ...NAV,
                { to: "/app/pay", key: "send" },
                { to: "/app/batch", key: "batch" },
                { to: "/app/settlement", key: "settlement" },
                { to: "/app/token", key: "token" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    href={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm hover:bg-foreground/5"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <WalletButton onAction={() => setOpen(false)} />
              <LangToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
