"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { APP_BRAND_MARK } from "@/lib/site";
import { cn } from "@/lib/utils";

function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

/** Hero banner — full-bleed Mae art, gold headline, sharp copy */
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
  const displayName =
    (nickname || "").trim() || (realName || "").trim() || "สมาชิก";
  const dateLabel = formatHeroDate();
  const support =
    (quote || "").trim() || "ค่อย ๆ ก้าว ในจังหวะที่ใช่สำหรับคุณ";
  const footerTip =
    (tip || "").trim() ||
    (subline || "").trim() ||
    "วันนี้ ให้เวลากับตัวเองอีกนิด";

  const isMale = (gender || "").toLowerCase() === "male";
  const heroSrc = isMale
    ? "/images/bg/hero-male-sage-0909b.jpg"
    : "/images/bg/hero-mae-elder.png";
  const objectPosition = isMale ? "68% 30%" : "78% 38%";

  return (
    <section
      className={cn(
        "dd-result-hero no-sky-lift relative mx-3 mt-3 min-h-[268px] w-[calc(100%-1.5rem)] overflow-hidden rounded-[22px]",
        className
      )}
      style={{
        background: "#101827",
        boxShadow:
          "inset 0 0 0 1px rgba(213,177,111,0.48), 0 14px 36px rgba(0,0,0,0.32)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
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

      <div className="relative z-10 flex min-h-[268px] flex-col px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/reading"
            className="inline-flex items-center gap-1 outline-none transition active:opacity-60 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/4"
            aria-label="กลับ"
          >
            <ChevronLeft className="h-5 w-5 text-[#f7f4ec]/85" strokeWidth={2.3} />
            <span className="text-[12px] font-bold tracking-[0.2em] text-[#d5b16f]">
              {APP_BRAND_MARK}
            </span>
          </Link>
          <p className="pt-0.5 text-[12px] font-medium text-[#f7f4ec]/70">
            สวัสดี คุณ{displayName}
          </p>
        </div>

        <div className="mt-6 flex max-w-[62%] flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#e8d19a]"
            style={{
              background: "rgba(16,24,39,0.55)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
            }}
          >
            ดวงประจำวัน
          </span>
          <span
            className="h-3 w-px shrink-0 bg-[rgba(213,177,111,0.4)]"
            aria-hidden
          />
          <span className="text-[12px] font-medium text-[#f7f4ec]/70">
            {dateLabel}
          </span>
        </div>

        <h2 className="mae-gold-text mt-3.5 max-w-[64%] font-sans text-[1.5rem] font-bold leading-[1.28] tracking-tight">
          {headline}
        </h2>
        <div
          className="mt-2.5 h-[3px] w-11 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #d5b16f 0%, rgba(213,177,111,0.25) 100%)",
          }}
          aria-hidden
        />
        <p className="mt-3 max-w-[58%] text-[13.5px] font-medium leading-relaxed text-[#f7f4ec]/88">
          {support}
        </p>

        <div
          className="mt-auto max-w-[62%] pt-3.5"
          style={{
            borderTop: "1px solid rgba(213,177,111,0.28)",
          }}
        >
          <div className="flex items-center gap-2">
            <FortuneIcon
              name="sparkle"
              size={15}
              plain
              className="fortune-spark shrink-0"
            />
            <span
              className="h-3 w-px shrink-0 bg-[rgba(213,177,111,0.45)]"
              aria-hidden
            />
            <p className="text-[12px] font-semibold leading-snug text-[#e8d19a]">
              {footerTip}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
