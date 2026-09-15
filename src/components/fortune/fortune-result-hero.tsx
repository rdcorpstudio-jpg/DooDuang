"use client";

import { Sparkles } from "lucide-react";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
import type { ZodiacInfo } from "@/lib/fortune/zodiac";
import { cn } from "@/lib/utils";

function formatHeroDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

/** Daily hero — clean Type-1: greeting · framed insight · tip line */
export function FortuneResultHero({
  realName,
  nickname,
  gender: _gender,
  zodiac,
  headline = "อย่ารีบเกิน จังหวะตัวเอง",
  quote,
  tip,
  className,
}: {
  realName: string;
  nickname: string;
  gender?: string;
  birthDate?: string;
  powerScore?: number;
  zodiac?: ZodiacInfo;
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
    (quote || "").trim() || "ค่อย ๆ ก้าวในจังหวะของคุณ";
  const tipLine =
    (tip || "").trim() || "วันนี้ ให้เวลากับตัวเองอีกนิด";
  const initial = displayName.slice(0, 1) || "ม";

  return (
    <section
      className={cn(
        "dd-result-hero no-sky-lift relative mx-3 mt-3 space-y-2.5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-0.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-[#101827]"
          style={{
            background:
              "linear-gradient(145deg, #fff8e4 0%, #e8d19a 40%, #d5b16f 100%)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
          }}
          aria-hidden
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[13px] font-semibold tracking-wide text-white">
            สวัสดี คุณ{displayName}
          </p>
          <p className="dd-hero-shadow mt-0.5 text-[11px] text-[#f7f4ec]/55">
            {dateLabel}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-white/90">
          <Sparkles className="h-3.5 w-3.5 text-[#d5b16f]" strokeWidth={2} />
          วันนี้
        </span>
      </div>

      {/* Insight card — compact widget size */}
      <div
        className="relative flex items-center gap-2 overflow-hidden rounded-[16px] px-3 py-2.5"
        style={{
          background:
            "linear-gradient(165deg, #1a2438 0%, #121a2c 55%, #0e1524 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(213,177,111,0.58), inset 0 0 0 2px rgba(255,248,228,0.08), 0 8px 20px rgba(0,0,0,0.24)",
        }}
      >
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[10.5px] font-medium tracking-wide text-white/68">
            ดวงวันนี้
            {zodiac ? (
              <>
                <span className="mx-1 text-white/28">•</span>
                ราศี{zodiac.thaiName}
              </>
            ) : null}
          </p>

          <h2 className="mae-gold-text mt-1 font-sans text-[1.05rem] font-bold leading-[1.25] tracking-tight sm:text-[1.1rem]">
            {headline}
          </h2>

          <p className="dd-hero-shadow mt-1 text-[12px] font-medium leading-snug text-white/82">
            {support}
          </p>

          {zodiac?.dateRange ? (
            <p className="mt-1.5 text-[10px] leading-snug text-white/42">
              {zodiac.dateRange}
            </p>
          ) : null}
        </div>

        {zodiac ? (
          <div className="relative flex w-[96px] shrink-0 items-center justify-center self-center">
            <ZodiacSignImage
              sign={zodiac.id}
              variant="orb"
              size={88}
              alt={`ราศี${zodiac.thaiName}`}
              className="relative drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>
        ) : null}
      </div>

      {/* Tip line */}
      <p className="flex items-center gap-1.5 px-0.5 text-[12.5px] leading-snug text-white/88">
        <span className="text-[#d5b16f]" aria-hidden>
          ✦
        </span>
        {tipLine}
      </p>
    </section>
  );
}
