"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Heart, Moon, Sparkles } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { cn } from "@/lib/utils";

function firstSentence(text: string, max = 42): string {
  const t = text.trim();
  if (!t) return "";
  const cut = t.search(/[.。]/);
  if (cut > 12 && cut <= max + 8) return t.slice(0, cut).trim();
  if (t.length <= max) return t;
  const soft = t.lastIndexOf(" ", max);
  return (soft > 18 ? t.slice(0, soft) : t.slice(0, max)).trim();
}

function splitAdviceTips(advice: string, max = 3): string[] {
  const bySpace = advice
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);
  if (bySpace.length >= 2) return bySpace.slice(0, max);
  const byDot = advice
    .split(/[.。]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byDot.length >= 2) return byDot.slice(0, max);
  return bySpace.length ? bySpace.slice(0, max) : [advice.trim()].filter(Boolean);
}

function MiniCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-[16px] px-3 py-3"
      style={{
        background: "rgba(16,24,39,0.72)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.14)] text-[#d5b16f]">
          {icon}
        </span>
        <p className="text-[13px] font-semibold text-[#d5b16f]">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-[1.65] text-[#f7f4ec]/78">{body}</p>
    </div>
  );
}

/**
 * รู้จักตัวเองเบื้องต้น — โครงอ่านง่าย: สรุป · เสน่ห์/ในใจ · เคล็ดลับ · คำคม
 */
export function FortuneFreeSelfIntro({
  nickname,
  birthDate = "2000-01-01",
  birthTime,
  birthPlace,
  focus,
  gender,
  className,
  premium = false,
}: {
  nickname: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: FortuneFocus;
  gender?: string;
  /** true = หัวข้อ「เชิงลึก」หลังสมัครพรีเมียม */
  premium?: boolean;
  className?: string;
  /** @deprecated unused — callers may still pass */
  seed?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const copy = useMemo(() => {
    const analysis = analyzeFortune({
      birthDate,
      nickname,
      birthTime,
      birthPlace,
      focus,
      gender,
    });
    const deep = pickZodiacDeep(analysis.zodiac.id);
    const strengths = deep.strength
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean);
    const headline =
      firstSentence(deep.personality, 36) ||
      strengths[0] ||
      "มีจุดแข็งที่ชัดของตัวเอง";
    const tips = splitAdviceTips(deep.advice, 3);
    const quote =
      tips[tips.length - 1] ||
      firstSentence(deep.advice, 48) ||
      "ค่อย ๆ ก้าว ในจังหวะที่ใช่สำหรับคุณ";

    return {
      headline,
      body: deep.personality,
      charm: deep.loveStyle || strengths.slice(0, 2).join(" · "),
      inner: deep.shadow,
      tips: tips.slice(0, 3),
      quote,
    };
  }, [birthDate, nickname, birthTime, birthPlace, focus, gender]);

  const name = nickname.replace(/^คุณ\s*/, "").trim();

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-1.5 px-0.5">
        <Sparkles className="h-3.5 w-3.5 text-[#d5b16f]" strokeWidth={1.8} />
        <p className="text-[12px] font-semibold tracking-wide text-[#d5b16f]">
          อ่านตัวตนของคุณ
        </p>
      </div>

      <div className="mae-aspect-card rounded-[20px] px-3.5 py-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.18), rgba(213,177,111,0.08) 55%, transparent)",
              boxShadow:
                "inset 0 0 0 1px rgba(213,177,111,0.45), 0 6px 16px rgba(0,0,0,0.22)",
            }}
          >
            <FortuneIcon name="profile" size={26} plain />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mae-aspect-title text-[15px] font-semibold tracking-wide">
              {premium ? "รู้จักตัวเองเชิงลึก" : "รู้จักตัวเองเบื้องต้น"}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-[#f7f4ec]">
              คุณ{name || "—"}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-snug text-[#f7f4ec]">
              {copy.headline}
            </p>
            {!expanded ? (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.65] text-[#f7f4ec]/72">
                {copy.body}
              </p>
            ) : null}
          </div>
        </div>

        {expanded ? (
          <>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-[#f7f4ec]/78">
              {copy.body}
            </p>

            <div className="mt-3.5 space-y-2.5">
              <MiniCard
                icon={<Heart className="h-3.5 w-3.5" strokeWidth={1.9} />}
                title="เสน่ห์ของคุณ"
                body={copy.charm}
              />
              <MiniCard
                icon={<Moon className="h-3.5 w-3.5" strokeWidth={1.9} />}
                title="สิ่งที่อยู่ในใจ"
                body={copy.inner}
              />
            </div>

            <div className="mt-4">
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="text-[#d5b16f]">✦</span>
                <p className="text-[13px] font-semibold text-[#d5b16f]">
                  ลองดูแลตัวเองแบบนี้
                </p>
              </div>
              <ul className="space-y-2">
                {copy.tips.map((tip, i) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2.5 rounded-[14px] px-2.5 py-2.5"
                    style={{
                      background: "rgba(16,24,39,0.55)",
                      boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                    }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums text-[#101827]"
                      style={{
                        background:
                          "linear-gradient(165deg, #fff8e4, #d5b16f 70%)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-0.5 text-[13px] font-medium leading-snug text-[#f7f4ec]/88">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative mt-3.5 overflow-hidden rounded-[16px] px-3.5 py-4 text-center"
              style={{
                background: "rgba(16,24,39,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
              }}
            >
              <span
                className="pointer-events-none absolute left-3 top-1 select-none font-sacred text-[2.6rem] leading-none text-[#d5b16f]/25"
                aria-hidden
              >
                “
              </span>
              <p className="relative text-[14px] font-semibold leading-[1.65] text-[#e8d19a]">
                {copy.quote}
              </p>
            </div>
          </>
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
      </div>
    </section>
  );
}
