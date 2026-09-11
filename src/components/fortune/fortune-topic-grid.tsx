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

/** 2×2 daily aspect cards — dark navy + gold rim */
export function FortuneTopicGrid({
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  focus,
  gender,
  className,
  from = "reading",
  unlocked: _unlocked = true,
}: {
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
  from?: "reading" | "premium";
  unlocked?: boolean;
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
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-wide text-[#d5b16f]">
            ดวงรายวัน 4 ด้าน
          </h2>
          <div
            className="mt-1.5 h-px w-8 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(213,177,111,0.9), transparent)",
            }}
            aria-hidden
          />
        </div>
        <Link
          href={aspectHref("career")}
          className="mb-0.5 inline-flex items-center gap-0.5 text-[12px] font-medium text-[#d5b16f] outline-none transition hover:text-[#e8d19a] active:opacity-70 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
        >
          ดูทั้งหมด
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {domains.map((d) => (
          <Link
            key={d.domainId}
            href={aspectHref(d.domainId)}
            className="mae-aspect-card group relative flex min-h-[108px] flex-col gap-2 px-3 pb-3 pt-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            aria-label={`อ่านดวง${d.name}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <FortuneIcon
                  name={d.icon}
                  size={44}
                  plain
                  className="relative"
                />
              </span>
              <span className="mae-aspect-chevron !h-7 !w-7">
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
            </span>
            <div className="min-w-0 w-full">
              <p className="mae-aspect-title text-[14px] font-semibold tracking-tight">
                {d.name}
              </p>
              <p className="mae-aspect-body mt-1 line-clamp-2 text-[11.5px] leading-[1.45]">
                {d.blurb}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
