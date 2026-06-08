"use client";

import { motion } from "motion/react";

/**
 * Animated silk-road backdrop. Looping video (provided) softly tinted,
 * over a gold silk gradient, with drifting amber blobs and a paper grain.
 */
export function SilkBackground({ video = true }: { video?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden silk-gradient">
      {video && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.38] mix-blend-multiply"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/media/qianlu-bg.webm" type="video/webm" />
          <source src="/media/qianlu-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Drifting amber sun blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-40 -right-40 h-[55rem] w-[55rem] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.86 0.13 82 / 0.55), transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-20rem] left-[-15rem] h-[45rem] w-[45rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.72 0.17 70 / 0.35), transparent 70%)",
        }}
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Paper grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.65  0 0 0 0 0.45  0 0 0 0 0.1  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Silk veil top → bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.96_0.04_85/0.6)]" />
    </div>
  );
}
