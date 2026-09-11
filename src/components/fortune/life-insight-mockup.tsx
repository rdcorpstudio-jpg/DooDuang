"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { FortuneResultHero } from "@/components/fortune/fortune-result-hero";
import { FortuneTopicGrid } from "@/components/fortune/fortune-topic-grid";
import { FortuneLuckyStrip } from "@/components/fortune/fortune-lucky-strip";
import { FortuneFreeMonthTrend } from "@/components/fortune/fortune-free-month-trend";
import { FortuneFreeSelfIntro } from "@/components/fortune/fortune-free-self-intro";
import { FortuneFreeZodiacToday } from "@/components/fortune/fortune-free-zodiac-today";
import { FortuneCalendarShirtPreview } from "@/components/fortune/fortune-calendar-shirt-preview";
import { FortuneExtraReadings } from "@/components/fortune/fortune-extra-readings";
import { FortunePremiumSelfDeep } from "@/components/fortune/fortune-premium-self-deep";
import { FortunePremiumValueSection } from "@/components/fortune/fortune-premium-value-section";
import { FortunePremiumRituals } from "@/components/fortune/fortune-premium-rituals";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  buildDailyReadingPack,
  monthScoreForDate,
} from "@/lib/fortune/build-daily-pack";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const HERO_SETS = [
  {
    headline: "อย่ารีบเกิน จังหวะตัวเอง",
    quote: "ค่อย ๆ ก้าว ในจังหวะที่ใช่สำหรับคุณ",
    tip: "วันนี้ ให้เวลากับตัวเองอีกนิด",
  },
  {
    headline: "โฟกัสสิ่งที่สำคัญจริง ๆ",
    quote: "ใจนิ่งก่อน แล้วค่อยลงมือ",
    tip: "วันนี้ เลือกเรื่องเดียวให้จบ",
  },
  {
    headline: "ค่อย ๆ ตั้งหลัก แล้วไปต่อ",
    quote: "ทุกวันยังมีทางที่ดีขึ้น",
    tip: "วันนี้ พักให้พอ แล้วค่อยเดินต่อ",
  },
] as const;

interface LifeInsightMockupProps {
  seed: string;
  birthDate: string;
  nickname: string;
  realName?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: string;
  gender?: string;
  readingTitle?: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
  variant?: "free" | "premium";
  className?: string;
}

/** Daily dashboard — hero → zodiac → 4 aspects → lucky → unlock */
export function LifeInsightMockup({
  seed,
  birthDate,
  nickname,
  realName,
  birthTime,
  birthPlace,
  focus,
  gender,
  unlocked = false,
  unlocking = false,
  onUnlock,
  variant = "free",
  className,
}: LifeInsightMockupProps) {
  const isPremiumPage = variant === "premium";
  /** Premium tab OR paid unlock on free result */
  const contentUnlocked = isPremiumPage || unlocked;
  const hero = HERO_SETS[hashSeed(`${seed}-hero`) % HERO_SETS.length]!;
  /** Free = birth date only; premium extras only on premium page */
  const typedFocus = isPremiumPage
    ? (focus as FortuneFocus | undefined)
    : undefined;
  const deepTime = isPremiumPage ? birthTime : undefined;
  const deepPlace = isPremiumPage ? birthPlace : undefined;
  const displayName = (nickname || "").trim() || (realName || "").trim() || "สมาชิก";

  const analyzeInput = useMemo(
    () => ({
      birthDate,
      nickname,
      birthTime: deepTime,
      birthPlace: deepPlace,
      focus: typedFocus,
      gender,
    }),
    [birthDate, nickname, deepTime, deepPlace, typedFocus, gender]
  );

  const pack = useMemo(
    () => buildDailyReadingPack(analyzeInput),
    [analyzeInput]
  );

  const dailyDescription = pack.zodiacDaily.vibe;

  const monthPoints = useMemo(() => {
    const now = new Date();
    const curIdx = now.getMonth();
    const curYear = now.getFullYear();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curYear, curIdx - 2 + i, 1);
      const monthIndex = d.getMonth();
      const yearCe = d.getFullYear();
      return {
        monthIndex,
        yearCe,
        score: monthScoreForDate(analyzeInput, yearCe, monthIndex),
      };
    });
  }, [analyzeInput]);

  return (
    <div
      className={cn(
        "fortune-free-page dd-page-live mx-auto w-full min-w-0 max-w-[480px] space-y-3.5",
        className
      )}
    >
      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "40ms" } as CSSProperties}
      >
        <FortuneResultHero
          realName={displayName}
          nickname={nickname}
          gender={gender}
          headline={hero.headline}
          subline={dailyDescription}
          quote={hero.quote}
          tip={hero.tip}
        />
      </div>

      {isPremiumPage ? (
        <div
          className="fortune-reveal px-3"
          style={{ "--fortune-delay": "95ms" } as CSSProperties}
        >
          <FortunePremiumValueSection
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            focus={typedFocus}
            gender={gender}
          />
        </div>
      ) : null}

      {!isPremiumPage && unlocked ? (
        <div
          className="fortune-reveal px-3"
          style={{ "--fortune-delay": "80ms" } as CSSProperties}
        >
          <Link
            href="/premium"
            className="group flex items-center gap-3 rounded-[18px] px-3.5 py-3.5 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            style={{
              background: "#141c2b",
              boxShadow:
                "inset 0 0 0 1px rgba(213,177,111,0.28), 0 10px 28px rgba(0,0,0,0.22)",
            }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)]">
              <FortuneIcon name="sparkle" size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-[#f7f4ec]">
                เปิดหน้าพรีเมียม
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-[#f7f4ec]/65">
                ปฏิทินเต็ม · จังหวะเดือน · เนื้อหาปลดล็อก
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)] transition group-active:scale-95">
              <FortuneIcon name="arrow-right" size={18} />
            </span>
          </Link>
        </div>
      ) : null}

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "120ms" } as CSSProperties}
      >
        <FortuneFreeZodiacToday
          birthDate={birthDate}
          nickname={nickname}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
          unlocked={unlocked}
          deep={isPremiumPage}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "180ms" } as CSSProperties}
      >
        <FortuneTopicGrid
          nickname={nickname}
          birthDate={birthDate}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
          from={isPremiumPage ? "premium" : "reading"}
          unlocked={contentUnlocked || unlocked}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "220ms" } as CSSProperties}
      >
        <FortuneLuckyStrip
          birthDate={birthDate}
          nickname={nickname}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "260ms" } as CSSProperties}
      >
        <FortuneExtraReadings
          seed={seed}
          unlocked={contentUnlocked || unlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "300ms" } as CSSProperties}
      >
        <FortuneCalendarShirtPreview
          seed={seed}
          birthDate={birthDate}
          nickname={nickname}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
          unlocked={contentUnlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "340ms" } as CSSProperties}
      >
        <FortuneFreeMonthTrend
          seed={seed}
          birthDate={birthDate}
          nickname={nickname}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
          points={monthPoints}
          unlocked={contentUnlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "380ms" } as CSSProperties}
      >
        <FortuneFreeSelfIntro
          seed={seed}
          nickname={nickname}
          birthDate={birthDate}
          birthTime={deepTime}
          focus={typedFocus}
          gender={gender}
          premium={isPremiumPage}
        />
      </div>

      {isPremiumPage ? (
        <div
          className="fortune-reveal px-3"
          style={{ "--fortune-delay": "500ms" } as CSSProperties}
        >
          <FortunePremiumSelfDeep
            seed={seed}
            nickname={nickname}
            birthDate={birthDate}
            birthTime={deepTime}
            focus={typedFocus}
            gender={gender}
          />
        </div>
      ) : null}

      {isPremiumPage ? (
        <div
          className="fortune-reveal px-3 pb-2"
          style={{ "--fortune-delay": "560ms" } as CSSProperties}
        >
          <FortunePremiumRituals
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            focus={typedFocus}
            gender={gender}
          />
        </div>
      ) : null}
    </div>
  );
}
