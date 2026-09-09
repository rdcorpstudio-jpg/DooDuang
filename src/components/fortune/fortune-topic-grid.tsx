"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

const DOMAIN_META = [
  { aspectId: "work" as const, domainId: "career" as const, icon: "career" as FortuneIconName },
  { aspectId: "money" as const, domainId: "money" as const, icon: "finance" as FortuneIconName },
  { aspectId: "love" as const, domainId: "love" as const, icon: "love" as FortuneIconName },
  { aspectId: "health" as const, domainId: "health" as const, icon: "health" as FortuneIconName },
] as const;

/** 2×2 daily aspect cards — free blurb teaser; detail page soft-locks deep copy */
export function FortuneTopicGrid({
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  focus,
  gender,
  className,
  from = "reading",
  unlocked = true,
}: {
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
  /** Where “กลับ” on aspect page should go */
  from?: "reading" | "premium";
  /** When false, blur longer blurbs like daily tarot soft-lock */
  unlocked?: boolean;
  /** @deprecated kept for call-site compat */
  seed?: string;
  realName?: string;
}) {
  const pack = useMemo(
    () =>
      buildDailyReadingPack({
        birthDate,
        nickname,
        birthTime,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, focus, gender]
  );

  const domains = DOMAIN_META.map((m) => {
    const row = pack.aspects.find((a) => a.id === m.aspectId)!;
    return {
      ...m,
      name: row.name,
      blurb: row.blurb,
    };
  });

  const aspectHref = (id: string) =>
    `/reading/aspect?id=${id}&from=${from}`;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 px-0.5">
        <h2 className="dd-section-title text-[17px] font-semibold tracking-wide">
          ดวงรายวัน 4 ด้าน
        </h2>
        <Link
          href={aspectHref("career")}
          className="inline-flex items-center gap-0.5 text-[13px] text-[#6B6490] outline-none transition active:opacity-70 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
        >
          ดูทั้งหมด
          <FortuneIcon name="arrow-right" size={22} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {domains.map((d) => (
          <Link
            key={d.domainId}
            href={aspectHref(d.domainId)}
            className="fortune-glass relative flex min-h-[100px] items-center gap-2.5 rounded-[18px] px-3 py-3.5 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4"
            aria-label={`อ่านดวง${d.name}`}
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <FortuneIcon name={d.icon} size={52} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#2C2458]">{d.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#5E5688]">
                {d.blurb}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 ring-1 ring-[#7B6BB0]/18">
              <ChevronRight className="h-5 w-5 text-[#7B5FD4]" strokeWidth={2.4} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
