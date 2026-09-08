"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { cn } from "@/lib/utils";

function formatPredictionDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

/** Hero — text left, Guanyin open on the right */
export function FortuneResultHero({
  realName,
  nickname,
  headline = "โฟกัสสิ่งที่สำคัญจริง ๆ",
  subline = "วันนี้เหมาะกับการตั้งสติก่อนลงมือ — จัดลำดับสิ่งสำคัญ แล้วเดินทีละก้าวอย่างมั่นคง",
  quote = "ทุกวันคือโอกาสที่ดีขึ้น",
  className,
}: {
  realName: string;
  nickname: string;
  birthDate?: string;
  powerScore?: number;
  headline?: string;
  subline?: string;
  quote?: string;
  className?: string;
}) {
  const displayName = realName.trim() || nickname;
  const dateLabel = formatPredictionDate();
  const cleanQuote = quote.replace(/^[*“”\s]+|[*“”\s]+$/g, "");

  return (
    <div className={cn("sky-copy relative", className)}>
      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-0.5">
        <Link
          href="/reading"
          className="result-hero-copy inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#7B6BB0]/35 active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          กลับ
        </Link>
        <span className="justify-self-center" aria-hidden />
        <span className="justify-self-end" aria-hidden />
      </div>

      <div className="relative mt-1 flex min-h-[268px] flex-col pb-1 pt-2">
        <div className="relative z-10 max-w-[62%] pr-1">
          <p className="result-hero-copy text-[15px] leading-snug text-[#2C2458]">
            <span className="font-bold">สวัสดี</span>{" "}
            <span className="font-medium">คุณ{displayName}</span>
          </p>

          <p className="result-hero-copy mt-1.5 flex items-center gap-1.5 text-[12px] text-[#6B6490]">
            <FortuneIcon name="calendar" size={18} className="shrink-0" />
            <span>{dateLabel}</span>
          </p>

          <h2 className="result-hero-copy mt-3.5 text-[1.7rem] font-bold leading-[1.2] tracking-tight text-[#241C4F]">
            {headline}
          </h2>
          <p className="result-hero-copy mt-1.5 text-[12px] font-medium tracking-wide text-[#8A7FB8]">
            ดูดวงวันนี้ · แนวทางสำหรับคุณ
          </p>
          <p className="result-hero-copy mt-1.5 text-[13px] leading-[1.65] text-[#4F4778]">
            {subline}
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[19rem] flex-col items-center gap-1.5 pt-5">
          <div className="flex w-full items-center gap-1.5">
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(201,162,39,0.8))",
              }}
            />
            <FortuneIcon name="sparkle" size={14} className="shrink-0" />
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, rgba(201,162,39,0.8), transparent)",
              }}
            />
          </div>
          <p className="result-hero-copy text-center text-[12px] font-medium tracking-wide text-[#5A4F88]">
            “ {cleanQuote} ”
          </p>
        </div>
      </div>
    </div>
  );
}
