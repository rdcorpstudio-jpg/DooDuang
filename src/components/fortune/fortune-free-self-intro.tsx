"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { cn } from "@/lib/utils";

/** Self snapshot from zodiac deep bank */
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
    <section
      className={cn(
        "fortune-glass rounded-[18px] px-3.5 py-3.5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <FortuneIcon name="sparkle" size={28} />
        <h2 className="dd-section-title text-[17px] font-semibold">
          {premium ? "เข้าใจตัวเองเชิงลึก" : "รู้จักตัวเองเบื้องต้น"}
        </h2>
      </div>
      <p className="mt-2.5 text-[15px] leading-[1.75] text-[#4A4278]">
        {name ? `คุณ${name} — ` : "คุณ — "}
        {expanded ? copy.full : copy.teaser}
      </p>
      {!expanded ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[#B9A4F0]/35 bg-[#B9A4F0]/18 px-2.5 py-1 text-[13px] font-medium text-[#5B45B8]"
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
        className="dd-gold-glass-btn mt-3 flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/45">
          <BookOpen className="h-4 w-4 text-[#8A6A12]" strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-[#5C4810]">
          {expanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#8A6A12] transition-transform",
            expanded && "rotate-180"
          )}
          strokeWidth={2.2}
        />
      </button>
    </section>
  );
}
