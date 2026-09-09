"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

/** Hero banner — left editorial copy, deity art by gender flush right */
export function FortuneResultHero({
  realName,
  nickname,
  gender,
  headline = "อย่ารีบเกิน จังหวะตัวเอง",
  subline,
  quote,
  tip,
  className,
}: {
  realName: string;
  nickname: string;
  gender?: string;
  birthDate?: string;
  powerScore?: number;
  headline?: string;
  subline?: string;
  quote?: string;
  tip?: string;
  className?: string;
}) {
  // Prefer nickname so profile edits show on the card immediately
  const displayName =
    (nickname || "").trim() || (realName || "").trim() || "สมาชิก";
  const dateLabel = formatHeroDate();
  const support =
    (quote || "").trim() ||
    "ค่อย ๆ ก้าว ในจังหวะที่ใช่สำหรับคุณ";
  const footerTip =
    (tip || "").trim() ||
    (subline || "").trim() ||
    "วันนี้ ให้เวลากับตัวเองอีกนิด";

  const isMale = (gender || "").toLowerCase() === "male";
  // New filenames force a hard cache miss (browser + Next)
  const heroSrc = isMale
    ? "/images/bg/hero-male-sage-0909b.jpg"
    : "/images/bg/hero-female-guanyin-0909.jpg";
  // New male sage matches female layout — figure right, bright copy left
  const objectPosition = isMale ? "70% 32%" : "70% 28%";

  // Same type scale for both genders (new male art has open left like woman)
  const headlineClass =
    "mt-3 max-w-[56%] text-[1.55rem] font-bold leading-[1.3] tracking-tight text-[#1E1744]";
  const supportClass =
    "mt-2.5 max-w-[54%] text-[13px] font-medium leading-relaxed text-[#3F3768]";
  const footerClass = "text-[12px] font-semibold leading-snug text-[#3F3768]";

  return (
    <section
      className={cn(
        "dd-result-hero no-sky-lift relative mx-3 mt-3 min-h-[272px] w-[calc(100%-1.5rem)] overflow-hidden rounded-[22px]",
        className
      )}
    >
      {/* Deity art — male sage / Guanyin for female & other */}
      <div className="pointer-events-none absolute inset-0">
        {/* native img avoids Next image optimizer cache */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={heroSrc}
          src={heroSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover dd-hero-drift"
          style={{ objectPosition }}
          draggable={false}
        />
      </div>

      <div className="relative z-10 flex min-h-[272px] flex-col px-3.5 pb-4 pt-2.5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/reading"
            className="inline-flex items-center gap-1 outline-none transition active:opacity-60 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
            aria-label="กลับ"
          >
            <ChevronLeft className="h-5 w-5 text-[#2C2458]" strokeWidth={2.3} />
            <span className="text-[12px] font-bold tracking-[0.22em] text-[#C9A227]">
              DOODUANG
            </span>
          </Link>
          <p className="pt-0.5 text-[12px] font-semibold text-[#3A3270]">
            สวัสดี คุณ{displayName}
          </p>
        </div>

        {/* Tag + date */}
        <div className="mt-6 flex max-w-[58%] flex-wrap items-center gap-2">
          <span className="dd-pill-breathe dd-lilac-glass-pill rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#4A3A8A]">
            ดวงประจำวัน
          </span>
          <span className="h-3 w-px shrink-0 bg-[#9B90C8]" aria-hidden />
          <span className="text-[12px] font-semibold text-[#4A4278]">
            {dateLabel}
          </span>
        </div>

        {/* Headline block */}
        <h2 className={headlineClass}>{headline}</h2>
        <div
          className="mt-2 h-[2px] w-9 rounded-full bg-[#C9A227] dd-gold-pulse"
          aria-hidden
        />
        <p className={supportClass}>{support}</p>

        {/* Tip row */}
        <div className="mt-auto max-w-[58%] border-t border-[#9B90C8]/55 pt-3">
          <div className="flex items-center gap-2">
            <FortuneIcon
              name="sparkle"
              size={15}
              plain
              className="fortune-spark shrink-0"
            />
            <span
              className="h-3 w-px shrink-0 bg-[#C9A227]/55"
              aria-hidden
            />
            <p className={footerClass}>{footerTip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
