"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  buildPremiumValuePack,
  type WeekStatus,
} from "@/lib/fortune/build-premium-value-pack";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<WeekStatus, string> = {
  good: "bg-[#5B8C5A]",
  steady: "bg-[#9B7FE8]",
  rest: "bg-[#C9A227]/70",
};

const STATUS_LABEL: Record<WeekStatus, string> = {
  good: "จังหวะดี",
  steady: "มั่นคง",
  rest: "พักได้",
};

const TONE_RING: Record<string, string> = {
  high: "from-[#7B5FD4] to-[#9B7FE8]",
  mid: "from-[#8B7CC8] to-[#B8A9E8]",
  low: "from-[#A89878] to-[#C9B896]",
};

/** Compact premium value cards — long copy lives on detail routes */
export function FortunePremiumValueSection({
  birthDate,
  nickname,
  birthTime,
  focus,
  gender,
  className,
}: {
  birthDate: string;
  nickname: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
}) {
  const pack = useMemo(
    () =>
      buildPremiumValuePack({
        birthDate,
        nickname,
        birthTime,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, focus, gender]
  );

  const today = pack.outlook[0]!;
  const weekToday = pack.week[0]!;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="px-0.5">
        <h2 className="dd-section-title text-[17px] font-semibold">
          สำหรับคุณโดยเฉพาะ
        </h2>
      </div>

      {/* Today + this week — compact side-by-side */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/premium/outlook"
          className="fortune-glass rounded-[16px] px-3 py-3 outline-none transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[15px] font-semibold text-[#2C2458]">วันนี้</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#7B5FD4]" strokeWidth={2.2} />
          </div>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br leading-none text-white",
                TONE_RING[today.tone]
              )}
            >
              <span className="text-[15px] font-bold">{today.score}</span>
              <span className="text-[9px] font-semibold opacity-85">/12</span>
            </span>
            <p className="min-w-0 line-clamp-2 text-[14px] leading-snug text-[#6B6490]">
              {today.copy.doHint}
            </p>
          </div>
        </Link>

        <Link
          href="/premium/week"
          className="fortune-glass rounded-[16px] px-3 py-3 outline-none transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-[15px] font-semibold text-[#2C2458]">สัปดาห์นี้</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#7B5FD4]" strokeWidth={2.2} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                STATUS_DOT[weekToday.status]
              )}
            />
            <span className="text-[14px] font-semibold text-[#241C4F]">
              {weekToday.weekdayShort} · {STATUS_LABEL[weekToday.status]}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-[#6B6490]">
            {weekToday.copy.tip}
          </p>
        </Link>
      </div>
    </section>
  );
}
