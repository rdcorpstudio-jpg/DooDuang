"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { cn } from "@/lib/utils";

/** Self snapshot from zodiac deep bank — dark navy + gold rim */
export function FortuneFreeSelfIntro({
  nickname,
  birthDate = "2000-01-01",
  birthTime,
  focus,
  gender,
  premium = false,
  className,
  seed: _seed,
}: {
  nickname: string;
  birthDate?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  premium?: boolean;
  className?: string;
  /** @deprecated */
  seed?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const copy = useMemo(() => {
    const analysis = analyzeFortune({
      birthDate,
      nickname,
      birthTime,
      focus,
      gender,
    });
    const deep = pickZodiacDeep(analysis.zodiac.id);
    const strengths = deep.strength
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2);
    return {
      teaser: deep.personality,
      full: premium
        ? [deep.personality, deep.shadow, deep.loveStyle, deep.workStyle, deep.advice]
            .filter(Boolean)
            .join(" ")
        : [deep.personality, deep.advice].filter(Boolean).join(" "),
      strengths: strengths.length ? strengths : ["โฟกัสได้ดี", "จริงจัง"],
    };
  }, [birthDate, nickname, birthTime, focus, gender, premium]);

  const name = nickname.replace(/^คุณ\s*/, "").trim();

  return (
    <section className={cn("mae-aspect-card px-3.5 py-3.5", className)}>
      <h2 className="mae-aspect-title text-[15px] font-semibold tracking-wide">
        {premium ? "เข้าใจตัวเองเชิงลึก" : "รู้จักตัวเองเบื้องต้น"}
      </h2>
      <p className="mt-2.5 text-[14px] leading-[1.7] text-[#f7f4ec]/80">
        {name ? (
          <span className="font-semibold text-[#f7f4ec]">คุณ{name} — </span>
        ) : (
          <span className="font-semibold text-[#f7f4ec]">คุณ — </span>
        )}
        {expanded ? copy.full : copy.teaser}
      </p>
      {!expanded ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full px-2.5 py-1 text-[12px] font-medium text-[#e8d19a]"
              style={{
                background: "rgba(213,177,111,0.1)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 py-2 text-[13px] font-medium tracking-wide text-[#e8d19a] outline-none transition hover:text-[#f7f4ec] active:opacity-80 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
      >
        <span className="underline decoration-[#d5b16f]/45 underline-offset-[5px]">
          {expanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
          strokeWidth={2.4}
        />
      </button>
    </section>
  );
}
