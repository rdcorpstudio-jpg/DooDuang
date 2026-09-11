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
  steady: "bg-[#d5b16f]",
  rest: "bg-[#e8d19a]/70",
};

const STATUS_LABEL: Record<WeekStatus, string> = {
  good: "จังหวะดี",
  steady: "มั่นคง",
  rest: "พักได้",
};

const TONE_RING: Record<string, string> = {
  high: "from-[#8a6a28] to-[#d5b16f]",
  mid: "from-[#6a5840] to-[#c4a86a]",
  low: "from-[#5a5040] to-[#a89870]",
};

/** Compact premium value cards — dark navy + gold */
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
        <h2 className="text-[15px] font-semibold tracking-wide text-[#d5b16f]">
          สำหรับคุณโดยเฉพาะ
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/premium/outlook"
          className="mae-aspect-card px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="mae-aspect-title text-[15px] font-semibold">วันนี้</p>
            <span className="mae-aspect-chevron !h-7 !w-7">
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br leading-none text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                TONE_RING[today.tone]
              )}
            >
              <span className="text-[15px] font-bold">{today.score}</span>
              <span className="text-[9px] font-semibold opacity-85">/12</span>
            </span>
            <p className="mae-aspect-body min-w-0 line-clamp-2 text-[13px] leading-snug">
              {today.copy.doHint}
            </p>
          </div>
        </Link>

        <Link
          href="/premium/week"
          className="mae-aspect-card px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="mae-aspect-title text-[15px] font-semibold">สัปดาห์นี้</p>
            <span className="mae-aspect-chevron !h-7 !w-7">
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                STATUS_DOT[weekToday.status]
              )}
            />
            <span className="text-[13.5px] font-semibold text-[#f7f4ec]">
              {weekToday.weekdayShort} · {STATUS_LABEL[weekToday.status]}
            </span>
          </div>
          <p className="mae-aspect-body mt-1.5 line-clamp-2 text-[13px] leading-snug">
            {weekToday.copy.tip}
          </p>
        </Link>
      </div>
    </section>
  );
}
