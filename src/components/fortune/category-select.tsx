"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { MysticBackground } from "@/components/fortune/mystic-background";
import { FortuneCategoryCard } from "@/components/fortune/fortune-category-card";
import { Reveal } from "@/components/ui/reveal";
import { HOME_CATEGORY_OPTIONS } from "@/lib/fortune/zodiac";
import { FORTUNE_DISCLAIMER } from "@/lib/site";

export function CategorySelect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full overflow-hidden">
      <MysticBackground />

      <div className="relative z-10 flex h-full flex-col px-4 pb-3.5 pt-3">
        <Reveal visible={mounted} delay={0} className="shrink-0">
          <Link
            href="/#fortune"
            className="inline-flex items-center gap-0.5 text-[15px] font-medium text-[#c084fc] transition-opacity active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            กลับ
          </Link>
        </Reveal>

        <Reveal
          visible={mounted}
          delay={80}
          variant="glow"
          className="relative mt-2.5 shrink-0 overflow-hidden text-center"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,196,176,0.2)_0%,rgba(168,85,247,0.1)_45%,transparent_70%)] blur-xl"
            aria-hidden
          />

          <div className="relative z-[1]">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#e8c4b0]/35 bg-[#e8c4b0]/10 px-3 py-1">
              <Sparkles className="h-3 w-3 text-[#e8c4b0]" strokeWidth={1.8} />
              <span className="text-[11px] font-semibold tracking-[0.12em] text-[#e8c4b0]">
                เลือกด้านที่อยากรู้
              </span>
            </div>

            <h1 className="font-sacred text-[1.5rem] leading-tight tracking-wide text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.28)]">
              เลือกการ์ดดวงชะตา
            </h1>

            <div className="mx-auto mt-2 flex max-w-[10rem] items-center gap-2.5" aria-hidden>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8c4b0]/50 to-transparent" />
              <span className="h-1 w-1 rotate-45 bg-[#e8c4b0]" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8c4b0]/50 to-transparent" />
            </div>

            <p className="mt-1.5 px-2 text-[12px] leading-snug text-white/50">
              แตะการ์ดที่เรียกหาคุณ แล้วกรอกข้อมูลเพื่อเปิดดวง
            </p>
          </div>
        </Reveal>

        <div className="mb-3 mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3">
          {HOME_CATEGORY_OPTIONS.map((option, index) => (
            <FortuneCategoryCard
              key={option.id}
              option={option}
              index={index}
              visible={mounted}
            />
          ))}
        </div>

        <Reveal visible={mounted} delay={400} className="shrink-0 text-center">
          <p className="text-[11px] tracking-wide text-white/30">{FORTUNE_DISCLAIMER}</p>
        </Reveal>
      </div>
    </div>
  );
}
