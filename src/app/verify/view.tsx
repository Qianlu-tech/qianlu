"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/qianlu/Reveal";
import { useI18n } from "@/lib/i18n";

export default function VerifyView() {
  const { t } = useI18n();
  const [step, setStep] = useState<"idle" | "hashing" | "done">("idle");
  const [file, setFile] = useState<string | null>(null);

  function onDrop(e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) {
    const f =
      "dataTransfer" in e
        ? (e as React.DragEvent).dataTransfer.files?.[0]
        : (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (!f) return;
    setFile(f.name);
    setStep("hashing");
    setTimeout(() => setStep("done"), 1400);
  }

  return (
    <section className="px-6 pt-36 pb-20">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-primary">{t("verify.eyebrow")}</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium">
              {t("verify.titleA")} <span className="ink-text italic">{t("verify.titleEm")}</span>{t("common.period")}
            </h1>
            <p className="mt-3 text-muted-foreground">{t("verify.sub")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onDrop(e); }}
            className="mt-12 block glass cursor-pointer rounded-[2rem] border-2 border-dashed border-primary/40 p-12 text-center transition-colors hover:border-primary"
          >
            <input type="file" className="hidden" onChange={onDrop} />
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl glass-amber">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="font-display text-2xl">{file ?? t("verify.dropHint")}</div>
            <div className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">{t("verify.dropSub")}</div>
          </label>
        </Reveal>

        {step !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="glass mt-6 rounded-[2rem] p-8"
          >
            <Line k={t("verify.localHash")} v={step === "done" ? "0x8a4f…b201" : t("verify.computing")} />
            <Line k={t("verify.greenfieldCid")} v="bnbgf://Qm…7Ydz" />
            <Line k={t("verify.easAttestation")} v={step === "done" ? "0xeas…04ce ✓" : "—"} accent={step === "done"} />
            <div className={`mt-6 rounded-2xl p-5 ${step === "done" ? "glass-amber" : "glass"}`}>
              <div className="font-mono text-[10px] tracking-widest text-foreground/70">{t("verify.result")}</div>
              <div className="mt-1 font-display text-3xl font-semibold">
                {step === "done" ? t("verify.authentic") : t("verify.hashing")}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Line({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{k}</span>
      <span className={`font-mono text-sm ${accent ? "text-primary font-semibold" : ""}`}>{v}</span>
    </div>
  );
}
