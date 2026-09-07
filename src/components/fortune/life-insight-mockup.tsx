"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { FortuneResultHero } from "@/components/fortune/fortune-result-hero";
import { FortuneDailyInsights } from "@/components/fortune/fortune-daily-insights";
import { FortuneTopicGrid } from "@/components/fortune/fortune-topic-grid";
import { FortuneLuckyExtras } from "@/components/fortune/fortune-lucky-extras";
import { FortuneFreeMonthTrend } from "@/components/fortune/fortune-free-month-trend";
import { FortuneFreeSelfIntro } from "@/components/fortune/fortune-free-self-intro";
import { FortuneFreeZodiacToday } from "@/components/fortune/fortune-free-zodiac-today";
import { FortuneAuspiciousCalendar } from "@/components/fortune/fortune-auspicious-calendar";
import { FortuneUnlockBanner } from "@/components/fortune/fortune-unlock-banner";
import { FortunePremiumReport } from "@/components/fortune/fortune-premium-report";
import { REFERENCE_YEAR_SCORES } from "@/components/fortune/life-cycle-graph";
import type { PremiumFortune } from "@/lib/fortune/extended";
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
    headline: "ค่อย ๆ ตั้งหลัก แล้วไปต่อ",
    subline: "วันนี้เริ่มจากเรื่องสำคัญทีละอย่าง จะเดินได้นิ่งขึ้น",
  },
  {
    headline: "โฟกัสสิ่งที่สำคัญจริง ๆ",
    subline: "ลดสิ่งรบกวน แล้วลงมือกับเรื่องหลักให้จบหนึ่งอย่าง",
  },
  {
    headline: "จังหวะดีเมื่อไม่เร่งเกินตัว",
    subline: "วันนี้เหมาะกับการจัดลำดับและพักให้พอระหว่างทาง",
  },
] as const;

interface LifeInsightMockupProps {
  seed: string;
  birthDate: string;
  nickname: string;
  realName?: string;
  readingTitle?: string;
  unlocked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
  premium?: PremiumFortune | null;
  className?: string;
}

/** Free daily dashboard (+ premium report when unlocked) */
export function LifeInsightMockup({
  seed,
  birthDate,
  nickname,
  realName,
  unlocked = false,
  unlocking = false,
  onUnlock,
  premium,
  className,
}: LifeInsightMockupProps) {
  const hero = HERO_SETS[hashSeed(`${seed}-hero`) % HERO_SETS.length]!;

  const monthPoints = useMemo(() => {
    const now = new Date();
    const curIdx = now.getMonth();
    const curYear = now.getFullYear();
    const prev = new Date(curYear, curIdx - 1, 1);
    const prevIdx = prev.getMonth();
    const prevYear = prev.getFullYear();
    // Use existing monthly reference series (by calendar month) — not seed-random
    const prevScore = REFERENCE_YEAR_SCORES[prevIdx] ?? 6;
    const curScore = REFERENCE_YEAR_SCORES[curIdx] ?? 6;
    return [
      { monthIndex: prevIdx, yearCe: prevYear, score: prevScore },
      { monthIndex: curIdx, yearCe: curYear, score: curScore },
    ];
  }, []);

  return (
    <div
      className={cn(
        "fortune-free-page mx-auto w-full max-w-[480px] space-y-3.5",
        className
      )}
    >
      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "40ms" } as CSSProperties}
      >
        <FortuneResultHero
          realName={realName ?? nickname}
          nickname={nickname}
          headline={hero.headline}
          subline={hero.subline}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "120ms" } as CSSProperties}
      >
        <FortuneDailyInsights seed={seed} />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "160ms" } as CSSProperties}
      >
        <FortuneFreeZodiacToday
          birthDate={birthDate}
          nickname={nickname}
          seed={seed}
          unlocked={unlocked}
          onUnlock={onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "200ms" } as CSSProperties}
      >
        <FortuneTopicGrid seed={seed} />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "280ms" } as CSSProperties}
      >
        <FortuneLuckyExtras seed={seed} />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "360ms" } as CSSProperties}
      >
        <FortuneFreeMonthTrend
          points={monthPoints}
          unlocked={unlocked}
          onUnlock={onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "440ms" } as CSSProperties}
      >
        <FortuneFreeSelfIntro seed={seed} nickname={nickname} />
      </div>

      {!unlocked ? (
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "480ms" } as CSSProperties}
        >
          <FortuneAuspiciousCalendar
            seed={seed}
            unlocked={false}
            onUnlock={onUnlock}
            variant="teaser"
          />
        </div>
      ) : null}

      {!unlocked ? (
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "520ms" } as CSSProperties}
        >
          <FortuneUnlockBanner
            unlocked={unlocked}
            unlocking={unlocking}
            onUnlock={onUnlock}
          />
        </div>
      ) : (
        <div
          className="fortune-reveal pt-2"
          style={{ "--fortune-delay": "520ms" } as CSSProperties}
        >
          <FortunePremiumReport
            seed={seed}
            birthDate={birthDate}
            nickname={nickname}
            premium={premium}
          />
        </div>
      )}
    </div>
  );
}
