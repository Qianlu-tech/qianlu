"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * iOS 26 "liquid glass" jelly transition: scale, blur, and a spring
 * that overshoots like a soft jelly snap. Wrapped in AnimatePresence
 * keyed on pathname so route swaps morph through the same surface.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, scale: 0.96, filter: "blur(14px)", y: 16 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 1.03, filter: "blur(18px)", y: -10 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 24,
          mass: 0.9,
          opacity: { duration: 0.35 },
          filter: { duration: 0.45 },
        }}
        className="relative"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
