"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MysticBackground } from "@/components/fortune/mystic-background";
import { FortuneCategoryCard } from "@/components/fortune/fortune-category-card";
import { HOME_CATEGORY_OPTIONS } from "@/lib/fortune/zodiac";
import { FORTUNE_DISCLAIMER } from "@/lib/site";
import { cn } from "@/lib/utils";

function RevealBlock({
  visible,
  delay,
  children,
  className,
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal-up", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function CategorySelect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full overflow-y-auto">
      <MysticBackground />

      <div className="relative z-10 min-h-full px-5 py-6 pb-10">
        <RevealBlock visible={mounted} delay={0}>
          <Link
            href="/#fortune"
            className="inline-flex items-center gap-1.5 text-xs text-purple-100/60 hover:text-purple-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับ
          </Link>
        </RevealBlock>

        <RevealBlock visible={mounted} delay={80} className="text-center mt-6 mb-8">
          <Sparkles className="h-6 w-6 text-brand-purple-light mx-auto mb-4 animate-float" />
          <p className="text-purple-100/65 text-xs tracking-[0.3em] uppercase mb-3">
            เลือกด้านที่อยากรู้
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">เลือกการ์ดดวงชะตา</h1>
          <p className="text-purple-200/65 text-sm leading-relaxed">
            แตะการ์ดที่เรียกหาคุณ แล้วกรอกข้อมูลเพื่อเปิดดวง
          </p>
        </RevealBlock>

        <div className="grid grid-cols-2 gap-4">
          {HOME_CATEGORY_OPTIONS.map((option, index) => (
            <FortuneCategoryCard
              key={option.id}
              option={option}
              index={index}
              visible={mounted}
            />
          ))}
        </div>

        <RevealBlock visible={mounted} delay={620} className="mt-8 text-center">
          <p className="text-purple-100/55 text-xs tracking-wide">
            {FORTUNE_DISCLAIMER}
          </p>
        </RevealBlock>
      </div>
    </div>
  );
}
