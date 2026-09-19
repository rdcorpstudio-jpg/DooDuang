"use client";

import { useEffect, useState } from "react";
import { FortuneCategoryCard } from "@/components/fortune/fortune-category-card";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
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
    <div className="relative h-full overflow-hidden text-white">
      <MaePageBackground />

      <div className="relative z-10 flex h-full flex-col px-5 pb-5 pt-5 sm:px-6">
        <Reveal visible={mounted} delay={0} className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <MaeBrandLink />
          </div>
        </Reveal>

        <Reveal visible={mounted} delay={70} className="mt-5 shrink-0">
          <p className="text-[15.5px] font-medium text-[#e8d19a]">สำรวจ</p>
          <h1 className="mae-gold-text mt-1 text-[1.75rem] font-bold tracking-tight">
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
          <p className="text-[15.5px] font-medium tracking-wide text-[rgba(186,204,230,0.7)]">
            {FORTUNE_DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
