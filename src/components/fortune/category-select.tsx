"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_100%,rgba(124,58,237,0.22),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col px-5 pb-5 pt-3">
        <Reveal visible={mounted} delay={0} className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-0.5 text-[15px] font-medium text-white/55 transition-opacity active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            กลับ
          </Link>
        </Reveal>

        <Reveal visible={mounted} delay={70} className="mt-5 shrink-0">
          <p className="text-[13px] text-white/40">สำรวจ</p>
          <h1 className="mt-1 text-[1.75rem] font-semibold tracking-tight text-white">
            หมวดดวงทั้งหมด
          </h1>
        </Reveal>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-2">
          {HOME_CATEGORY_OPTIONS.map((option, index) => (
            <FortuneCategoryCard
              key={option.id}
              option={option}
              index={index}
              visible={mounted}
            />
          ))}
        </div>

        <Reveal visible={mounted} delay={380} className="shrink-0 pt-2 text-center">
          <p className="text-[11px] tracking-wide text-white/28">{FORTUNE_DISCLAIMER}</p>
        </Reveal>
      </div>
    </div>
  );
}
