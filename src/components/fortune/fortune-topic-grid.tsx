"use client";

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

const DOMAIN_META = [
  {
    aspectId: "work" as const,
    domainId: "career" as const,
    icon: "career" as FortuneIconName,
  },
  {
    aspectId: "money" as const,
    domainId: "money" as const,
    icon: "finance" as FortuneIconName,
  },
  {
    aspectId: "love" as const,
    domainId: "love" as const,
    icon: "love" as FortuneIconName,
  },
  {
    aspectId: "health" as const,
    domainId: "health" as const,
    icon: "health" as FortuneIconName,
  },
] as const;

const CARD_SHELL: CSSProperties = {
  background: "linear-gradient(165deg, #1a2234 0%, #121826 100%)",
  border: "1px solid rgba(213, 177, 111, 0.45)",
  boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
};

/** Explore job cards — 2x2 on the hub first screen. */
export function FortuneTopicGrid({
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  birthPlace,
  focus,
  gender,
  className,
  from = "reading",
}: {
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  birthPlace?: string;
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
        birthPlace,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, birthPlace, focus, gender]
  );

  const domains = useMemo(
    () =>
      DOMAIN_META.map((m) => {
        const row = pack.aspects.find((a) => a.id === m.aspectId)!;
        return {
          ...m,
          name: row.name,
          blurb: (row.blurb || row.title || "").trim(),
        };
      }),
    [pack.aspects]
  );

  const aspectHref = (id: string) => `/reading/aspect?id=${id}&from=${from}`;

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="mae-gold-text px-0.5 text-[15px] font-semibold tracking-wide">
        เลือกเรื่องที่อยากรู้
      </h2>

      <div className="grid grid-cols-2 gap-2.5">
        {domains.map((d) => (
          <Link
            key={d.domainId}
            href={aspectHref(d.domainId)}
            className="flex min-h-[7.5rem] flex-col items-start rounded-[18px] px-3 py-3 text-left outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40"
            style={CARD_SHELL}
            aria-label={`อ่านดวง${d.name}`}
          >
            <FortuneIcon name={d.icon} size={36} plain />
            <p className="mt-2 overflow-visible text-[15px] font-bold leading-snug tracking-tight text-white">
              {d.name}
            </p>
            <p className="mt-1.5 text-[12px] leading-[1.65] text-white/75">
              {d.blurb}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
