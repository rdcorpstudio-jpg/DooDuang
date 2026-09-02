"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { MysticBackground } from "@/components/fortune/mystic-background";
import { SacredCorners, SacredDivider, SacredMark } from "@/components/ui/sacred-mark";

const MESSAGES = [
  "จักรวาลกำลังรับฟัง...",
  "พลังดวงชะตากำลังเผย...",
  "การ์ดกำลังเปิดเผยความหมาย...",
  "คำทำนายใกล้จะปรากฏ...",
];

interface FortuneLoadingProps {
  nickname: string;
  categoryTitle: string;
}

export function FortuneLoading({ nickname, categoryTitle }: FortuneLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden px-6">
      <MysticBackground intensity="soft" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(251,191,36,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-brand-purple-deep/40 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-[280px] rounded-2xl sacred-surface sacred-card px-6 py-8 text-center backdrop-blur-sm">
        <SacredCorners className="text-amber-200/30" />
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-brand-purple-light/14" />

        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-brand-purple-light/30 bg-brand-purple-light/12 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.2)]">
          <Moon className="h-[18px] w-[18px] stroke-[1.5]" fill="currentColor" fillOpacity={0.15} />
        </div>

        <p className="mb-6 text-[10px] uppercase tracking-[0.42em] text-amber-200/45">
          พิธีเปิดการ์ด
        </p>

        <div className="relative mx-auto mb-6 flex h-[132px] w-[132px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-200/10 animate-ring-pulse" />
          <div className="absolute inset-3 rounded-full border border-purple-400/10" />

          <div className="fortune-card-loading relative flex h-[108px] w-[76px] flex-col items-center justify-between rounded-xl border border-brand-purple-light/30 bg-gradient-to-b from-brand-purple-deep/80 via-brand-purple-dark/60 to-brand-purple-deep/70 py-3 shadow-[0_0_28px_rgba(168,85,247,0.25)]">
            <SacredMark size="xs" className="text-amber-200/40" />
            <div className="flex flex-col items-center gap-1.5">
              <Moon className="h-4 w-4 text-amber-100/70 stroke-[1.25]" />
              <span className="text-[9px] font-medium tracking-widest text-white/85">
                {categoryTitle}
              </span>
            </div>
            <SacredMark size="xs" className="text-amber-200/40" />
          </div>
        </div>

        <SacredDivider className="mb-4" />

        <p className="mb-1 text-[10px] tracking-[0.2em] text-purple-300/45">ถวายแด่</p>
        <h2 className="mb-5 text-xl font-semibold tracking-wide text-white/95">{nickname}</h2>

        <div className="mb-5 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="loading-dot-sacred h-1 w-1 rounded-full bg-amber-200/70"
              style={{ animationDelay: `${i * 0.22}s` }}
            />
          ))}
        </div>

        <p
          key={messageIndex}
          className="fortune-loading-text mx-auto min-h-[1.25rem] text-sm tracking-wide text-purple-200/60"
        >
          {MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
