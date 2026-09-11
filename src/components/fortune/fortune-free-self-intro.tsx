"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
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
        className="mt-3 flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
        style={{
          background: "rgba(255,255,255,0.04)",
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)]">
          <BookOpen className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-[#f7f4ec]">
          {expanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#d5b16f]/80 transition-transform",
            expanded && "rotate-180"
          )}
          strokeWidth={2.2}
        />
      </button>
    </section>
  );
}
