"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  FortuneIcon,
  type FortuneIconName,
} from "@/components/fortune/fortune-icon";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { useDragScroll } from "@/hooks/use-drag-scroll";
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

/** ดวงแต่ละด้าน — center-snap carousel matching mock */
export function FortuneTopicGrid({
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  birthPlace,
  focus,
  gender,
  className,
  from = "reading",
  unlocked: _unlocked = true,
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

  const aspectHref = (id: string) =>
    `/reading/aspect?id=${id}&from=${from}`;

  const { ref: scrollerRef } = useDragScroll();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      if (!cards.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [domains.length]);

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="mae-gold-text px-0.5 text-[15px] font-semibold tracking-wide">
        ดวงแต่ละด้าน
      </h2>

      <div
        ref={scrollerRef}
        className="topic-aspect-scroll no-tap -mx-3 flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain py-1 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          touchAction: "pan-x pan-y",
          WebkitOverflowScrolling: "touch",
          paddingLeft: "7%",
          paddingRight: "7%",
          scrollPaddingLeft: "7%",
          scrollPaddingRight: "7%",
        }}
      >
        {domains.map((d) => (
          <Link
            key={d.domainId}
            href={aspectHref(d.domainId)}
            className="relative flex h-[112px] w-[82%] max-w-[340px] shrink-0 snap-center items-center gap-2.5 rounded-[20px] px-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40"
            style={{ ...CARD_SHELL, scrollSnapStop: "always" }}
            aria-label={`อ่านดวง${d.name}`}
          >
            <span className="relative flex h-[64px] w-[58px] shrink-0 items-center justify-center">
              <FortuneIcon name={d.icon} size={52} plain className="relative" />
            </span>

            <span className="flex min-w-0 flex-1 flex-col justify-center py-2.5">
              <p className="text-[1.05rem] font-bold leading-none tracking-tight text-white">
                {d.name}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-white/82">
                {d.blurb}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold tracking-wide text-[#e8d19a]">
                อ่านคำทำนาย
                <span aria-hidden>→</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5" aria-hidden>
        {domains.map((d, i) => (
          <span
            key={d.domainId}
            className={cn(
              "h-[6px] w-[6px] rounded-full transition-colors duration-200",
              i === active ? "bg-[#f0d078]" : "bg-white/22"
            )}
          />
        ))}
      </div>
    </section>
  );
}
