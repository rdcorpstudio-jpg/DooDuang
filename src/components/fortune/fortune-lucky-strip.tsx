"use client";

import { useMemo } from "react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  buildDailyReadingPack,
} from "@/lib/fortune/build-daily-pack";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

/** Lucky colors + numbers — from day tone analysis */
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
  /** @deprecated */
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
        "fortune-glass grid grid-cols-2 items-center rounded-[18px] px-2 py-3.5",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center px-2 text-center">
        <p className="text-[13px] font-semibold text-[#5E5688]">สีมงคลวันนี้</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {[c0, c1].map((c) => (
            <span key={c!.name} className="inline-flex items-center gap-1.5">
              <span
                className="h-6 w-6 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(123,107,176,0.28)]"
                style={{ background: c!.hex }}
                aria-hidden
              />
              <span className="text-[15px] font-semibold text-[#2C2458]">
                {c!.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center border-l border-[#7B6BB0]/22 px-2 text-center">
        <p className="inline-flex items-center justify-center gap-1 text-[13px] font-semibold text-[#5E5688]">
          <FortuneIcon name="clover" size={20} />
          เลขนำโชค
        </p>
        <p className="mt-1.5 text-[1.4rem] font-bold tracking-[0.08em] text-[#2C2458]">
          {lucky.numbers.join(" · ")}
        </p>
      </div>
    </section>
  );
}
