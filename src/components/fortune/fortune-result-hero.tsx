"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft } from "lucide-react";
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

/** Daily greeting hero — free overview */
export function FortuneResultHero({
  realName,
  nickname,
  headline = "ค่อย ๆ ตั้งหลัก แล้วไปต่อ",
  subline = "วันนี้เริ่มจากเรื่องสำคัญทีละอย่าง จะเดินได้นิ่งขึ้น",
  className,
}: {
  realName: string;
  nickname: string;
  birthDate?: string;
  powerScore?: number;
  headline?: string;
  subline?: string;
  className?: string;
}) {
  const displayName = realName.trim() || nickname;
  const dateLabel = formatPredictionDate();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-0.5">
        <Link
          href="/reading"
          className="inline-flex items-center gap-0.5 justify-self-start text-[14px] font-medium text-[#F4BC52]/85 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#46DDED]/45 active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          กลับ
        </Link>
        <p className="text-center font-sacred text-[13px] font-normal tracking-[0.28em] text-[#F4BC52]/95">
          DOODUANG
        </p>
        <span className="justify-self-end" aria-hidden />
      </div>

      <div className="relative px-0.5 pb-2 pt-1">
        <section
          className="relative overflow-hidden rounded-[20px] border border-white/10 px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          style={{
            backgroundImage: "url(/images/mascot/hero-deities.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "72% center",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A1020]/75 via-[#0A1020]/35 to-transparent"
          />
          <div className="relative z-[1] min-w-0 max-w-[22rem]">
            <p className="text-[13px] leading-snug text-[#F7F8FF] drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              สวัสดี คุณ{displayName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#E8EEF8] drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0 text-[#7EE9F5]"
                strokeWidth={1.9}
              />
              <span>คำทำนายสำหรับ {dateLabel}</span>
            </p>
            <h2 className="font-sacred mt-2.5 text-[1.55rem] font-normal leading-[1.35] tracking-wide text-[#F7F8FF] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {headline}
            </h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#F0F4FC] drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
              {subline}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
