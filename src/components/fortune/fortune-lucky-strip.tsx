"use client";

import { useMemo } from "react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  buildDailyReadingPack,
} from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

/** Lucky colors + numbers — dark navy + gold rim */
export function FortuneLuckyStrip({
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  focus,
  gender,
  className,
  seed: _seed,
}: {
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
  seed?: string;
}) {
  const lucky = useMemo(() => {
    const pack = buildDailyReadingPack({
      birthDate,
      nickname,
      birthTime,
      focus,
      gender,
    });
    return pack.lucky;
  }, [birthDate, nickname, birthTime, focus, gender]);

  const [c0, c1] = lucky.colors;

  return (
    <section
      className={cn(
        "mae-aspect-card grid w-full grid-cols-2 items-center px-2.5 py-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-col items-center justify-center px-2 text-center">
        <p className="mae-aspect-title text-[11px] font-medium tracking-wide">
          สีมงคลวันนี้
        </p>
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5">
          {[c0, c1].map((c) => (
            <span key={c!.name} className="inline-flex items-center gap-1.5">
              <span
                className="h-[18px] w-[18px] shrink-0 rounded-full"
                style={{
                  background: c!.hex,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 1px rgba(213,177,111,0.35)",
                }}
                aria-hidden
              />
              <span className="text-[13.5px] font-semibold tracking-tight text-[#f7f4ec]">
                {c!.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-center justify-center border-l border-[rgba(213,177,111,0.28)] px-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <FortuneIcon name="clover" size={18} plain className="shrink-0" />
          <p className="mae-aspect-title text-[11px] font-medium tracking-wide">
            เลขนำโชค
          </p>
        </div>
        <p className="mt-2 text-[1.35rem] font-semibold tracking-[0.14em] text-[#f7f4ec]">
          {lucky.numbers.join(" · ")}
        </p>
      </div>
    </section>
  );
}
