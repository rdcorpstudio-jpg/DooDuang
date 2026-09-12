"use client";

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

/** Hero banner — wide landscape tarot plate */
export function FortuneResultHero({
  realName,
  nickname,
  gender: _gender,
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

  const heroSrc = "/images/bg/hero-tarot-celestial.webp?v=tarot1";

  return (
    <section
      className={cn(
        "dd-result-hero no-sky-lift relative mx-3 mt-3 aspect-[2.15/1] min-h-[188px] w-[calc(100%-1.5rem)] overflow-hidden rounded-[20px]",
        className
      )}
      style={{
        border: "1.5px solid transparent",
        background:
          "linear-gradient(#101827, #101827) padding-box, linear-gradient(145deg, #fff8e4 0%, #e2c787 40%, #d5b16f 65%, #b8924f 100%) border-box",
        boxShadow: "0 14px 36px rgba(0,0,0,0.32)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={heroSrc}
          src={heroSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover dd-hero-drift"
          style={{ objectPosition: "88% 52%" }}
          draggable={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(90deg,
                rgba(8,12,22,0.86) 0%,
                rgba(10,16,28,0.62) 38%,
                rgba(12,18,32,0.22) 62%,
                transparent 82%
              ),
              linear-gradient(180deg,
                rgba(8,12,22,0.22) 0%,
                transparent 32%,
                transparent 68%,
                rgba(8,12,22,0.42) 100%
              )
            `,
          }}
        />
      </div>

      <div className="relative z-10 flex h-full min-h-[188px] flex-col justify-between px-3.5 py-3">
        {/* Top: badge + date | greeting */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#e8d19a]"
              style={{
                background: "rgba(16,24,39,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
              }}
            >
              ดวงประจำวัน
            </span>
            <span
              className="hidden h-2.5 w-px shrink-0 bg-[rgba(213,177,111,0.4)] xs:block sm:block"
              aria-hidden
            />
            <span className="dd-hero-shadow text-[11px] font-medium text-[#f7f4ec]/85">
              {dateLabel}
            </span>
          </div>
          <p className="dd-hero-shadow shrink-0 text-right text-[11px] font-medium text-[#f7f4ec]/85">
            สวัสดี คุณ{displayName}
          </p>
        </div>

        {/* Middle: headline + support — left column clear of art */}
        <div className="mt-2 max-w-[64%] flex-1">
          <h2 className="mae-gold-text font-sans text-[1.22rem] font-bold leading-[1.28] tracking-tight sm:text-[1.28rem]">
            {headline}
          </h2>
          <p className="dd-hero-shadow mt-1.5 text-[12.5px] font-medium leading-snug text-[#f7f4ec]/92">
            {support}
          </p>
        </div>

        {/* Bottom tip */}
        <div
          className="max-w-[68%] pt-2"
          style={{
            borderTop: "1px solid rgba(213,177,111,0.28)",
          }}
        >
          <div className="flex items-start gap-1.5 pt-1.5">
            <FortuneIcon
              name="sparkle"
              size={13}
              plain
              className="fortune-spark mt-0.5 shrink-0"
            />
            <p className="dd-hero-shadow text-[11px] font-semibold leading-snug text-[#e8d19a]">
              {footerTip}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
