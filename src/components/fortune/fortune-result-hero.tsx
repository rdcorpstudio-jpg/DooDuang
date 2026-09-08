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

/** Daily greeting hero — quiet luxury */
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
          className="inline-flex items-center gap-0.5 justify-self-start text-[14px] font-medium text-[#F4BC52] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#F4BC52]/35 active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          กลับ
        </Link>
        <p className="text-center font-sacred text-[12px] font-normal tracking-[0.32em] text-[#F4BC52]">
          DOODUANG
        </p>
        <span className="justify-self-end" aria-hidden />
      </div>

      <div className="relative px-0.5 pb-1 pt-0.5">
        <section
          className="relative min-h-[168px] overflow-hidden rounded-[22px] border border-white/10"
          style={{
            backgroundImage: "url(/images/mascot/hero-deities.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "78% center",
            boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.72) 42%, rgba(10,14,26,0.28) 68%, rgba(10,14,26,0.12) 100%)",
            }}
          />
          <div className="relative z-[1] flex min-h-[168px] flex-col justify-end px-4 py-4">
            <p className="text-[12px] font-medium tracking-wide text-[#F4BC52]/90">
              สวัสดี คุณ{displayName}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#B7C3D8]">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0 text-[#9EB0C8]"
                strokeWidth={1.9}
              />
              <span>{dateLabel}</span>
            </p>
            <h2 className="font-sacred mt-2.5 max-w-[15.5rem] text-[1.55rem] font-normal leading-[1.3] tracking-wide text-[#F5F7FC]">
              {headline}
            </h2>
            <p className="mt-2 max-w-[16.5rem] text-[13px] leading-[1.65] text-[#C5D0E2]">
              {subline}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
