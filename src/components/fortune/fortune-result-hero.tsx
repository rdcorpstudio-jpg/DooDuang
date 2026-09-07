"use client";

import Image from "next/image";
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

/** Daily greeting hero with mascot — free overview */
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
        <p className="text-center text-[11px] font-medium tracking-[0.42em] text-[#F4BC52]/90">
          DOODUANG
        </p>
        <span className="justify-self-end" aria-hidden />
      </div>

      <div className="relative px-0.5 pb-2 pt-1">
        <section
          className="relative overflow-visible rounded-[18px] px-4 py-4"
          style={{
            border: "1px solid rgba(154,184,220,0.18)",
            backgroundImage: [
              "linear-gradient(105deg, rgba(12,20,39,0.92) 0%, rgba(12,20,39,0.55) 42%, transparent 68%)",
              "radial-gradient(ellipse at 88% 30%, rgba(241,109,181,0.28), transparent 52%)",
              "linear-gradient(110deg, #0C1427 0%, #152044 42%, #3A2158 72%, #5A2A58 100%)",
            ].join(", "),
            boxShadow: "0 8px 22px rgba(3, 8, 24, 0.28)",
          }}
        >
          <div className="relative z-[1] grid grid-cols-[1.35fr_0.75fr] items-center gap-1">
            <div className="min-w-0 pr-1">
              <p className="text-[13px] leading-snug text-[#F7F8FF]/90">
                สวัสดี คุณ{displayName}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9AB8DC]">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#46DDED]" strokeWidth={1.9} />
                <span>คำทำนายสำหรับ {dateLabel}</span>
              </p>
              <h2 className="mt-2.5 text-[20px] font-bold leading-[1.35] tracking-tight text-[#F7F8FF]">
                {headline}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#9AB8DC]">
                {subline}
              </p>
            </div>
            <div className="min-h-[7.5rem]" aria-hidden />
          </div>

          <div
            className="fortune-mascot-float pointer-events-none absolute -bottom-2 -right-1 z-[2] h-[9.5rem] w-[9.5rem] sm:h-[10.5rem] sm:w-[10.5rem]"
            data-slot="daily-hero-illustration"
          >
            <Image
              src="/images/mascot/daily-hero.png"
              alt=""
              width={512}
              height={512}
              priority
              quality={100}
              unoptimized
              className="h-full w-full object-contain object-bottom"
              style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.35))" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
