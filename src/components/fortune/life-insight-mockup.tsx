"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { FortuneResultHero } from "@/components/fortune/fortune-result-hero";
import { FortuneTopicGrid } from "@/components/fortune/fortune-topic-grid";
import { FortuneFreeMonthTrend } from "@/components/fortune/fortune-free-month-trend";
import { FortuneFreeSelfIntro } from "@/components/fortune/fortune-free-self-intro";
import { FortuneFreeZodiacToday } from "@/components/fortune/fortune-free-zodiac-today";
import { FortuneCalendarShirtPreview } from "@/components/fortune/fortune-calendar-shirt-preview";
import { FortuneExtraReadings } from "@/components/fortune/fortune-extra-readings";
import { FortuneUnlockBanner } from "@/components/fortune/fortune-unlock-banner";
import { FortunePremiumSelfDeep } from "@/components/fortune/fortune-premium-self-deep";
import { REFERENCE_YEAR_SCORES } from "@/components/fortune/life-cycle-graph";
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
  /** Has paid entitlement (free page shows CTA to /premium) */
  unlocked?: boolean;
  onUnlock?: () => void;
  unlocking?: boolean;
  /** free = teasers only; premium = full unlocked dashboard on /premium tab */
  variant?: "free" | "premium";
  className?: string;
}

/** Daily dashboard — free teasers, or full premium on the premium tab */
export function LifeInsightMockup({
  seed,
  birthDate,
  nickname,
  realName,
  unlocked = false,
  unlocking = false,
  onUnlock,
  variant = "free",
  className,
}: LifeInsightMockupProps) {
  const isPremiumPage = variant === "premium";
  const contentUnlocked = isPremiumPage;
  const hero = HERO_SETS[hashSeed(`${seed}-hero`) % HERO_SETS.length]!;

  const monthPoints = useMemo(() => {
    const now = new Date();
    const curIdx = now.getMonth();
    const curYear = now.getFullYear();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curYear, curIdx - (5 - i), 1);
      const monthIndex = d.getMonth();
      return {
        monthIndex,
        yearCe: d.getFullYear(),
        score: REFERENCE_YEAR_SCORES[monthIndex] ?? 6,
      };
    });
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

          {isPremiumPage ? (
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "70ms" } as CSSProperties}
        >
          <div className="fortune-glass flex items-center gap-2.5 rounded-[16px] px-3.5 py-2.5">
            <span className="fortune-spark flex h-7 w-7 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/4">
              <Crown className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.9} />
            </span>
            <p className="text-[13px] font-medium text-[#F7F8FF]">
              โหมดพรีเมียม · ปลดล็อกครบแล้ว
            </p>
          </div>
        </div>
      ) : null}

      {!isPremiumPage && unlocked ? (
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "80ms" } as CSSProperties}
        >
          <Link
            href="/premium"
            className="fortune-glass flex items-center gap-3 rounded-[18px] px-3.5 py-3 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(160deg, rgba(244,188,82,0.28), rgba(244,188,82,0.08))",
                boxShadow: "inset 0 0 0 1px rgba(244,188,82,0.45)",
              }}
            >
              <Crown className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#F7F8FF]">
                <Sparkles className="h-3.5 w-3.5 text-[#F4BC52]" />
                เปิดหน้าพรีเมียม
              </span>
              <span className="mt-0.5 block text-[12px] text-[#9AB8DC]">
                ปฏิทินเต็ม · จังหวะเดือน · เนื้อหาปลดล็อก — ที่แท็บพรีเมียม
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "120ms" } as CSSProperties}
      >
        <FortuneFreeZodiacToday
          birthDate={birthDate}
          nickname={nickname}
          seed={seed}
          unlocked={unlocked}
          deep={isPremiumPage}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "200ms" } as CSSProperties}
      >
        <FortuneTopicGrid />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "240ms" } as CSSProperties}
      >
        <FortuneExtraReadings
          seed={seed}
          unlocked={contentUnlocked || unlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "280ms" } as CSSProperties}
      >
        <FortuneCalendarShirtPreview
          seed={seed}
          unlocked={contentUnlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "320ms" } as CSSProperties}
      >
        <FortuneFreeMonthTrend
          seed={seed}
          points={monthPoints}
          unlocked={contentUnlocked}
          onUnlock={isPremiumPage ? undefined : onUnlock}
        />
      </div>

      <div
        className="fortune-reveal"
        style={{ "--fortune-delay": "440ms" } as CSSProperties}
      >
        <FortuneFreeSelfIntro
          seed={seed}
          nickname={nickname}
          premium={isPremiumPage}
        />
      </div>

      {isPremiumPage ? (
        <div
          className="fortune-reveal"
          style={{ "--fortune-delay": "500ms" } as CSSProperties}
        >
          <FortunePremiumSelfDeep seed={seed} nickname={nickname} />
        </div>
      ) : null}

      {!isPremiumPage && !unlocked ? (
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
      ) : null}
    </div>
  );
}
