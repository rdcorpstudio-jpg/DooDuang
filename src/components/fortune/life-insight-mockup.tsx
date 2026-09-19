"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FortuneResultHero } from "@/components/fortune/fortune-result-hero";
import { FortunePromoSplitBanner } from "@/components/fortune/fortune-promo-split-banner";
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
import { MoreDetails } from "@/components/ui/more-details";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  buildDailyReadingPack,
  monthScoreForDate,
} from "@/lib/fortune/build-daily-pack";
import { FORTUNE_DISCLAIMER } from "@/lib/site";
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
  /** Paid unlock only — /premium is the daily home, not a membership pass */
  const contentUnlocked = unlocked;
  const hero = HERO_SETS[hashSeed(`${seed}-hero`) % HERO_SETS.length]!;
  /** Free = birth date only; paid extras only after unlock */
  const typedFocus = contentUnlocked
    ? (focus as FortuneFocus | undefined)
    : undefined;
  const deepTime = contentUnlocked ? birthTime : undefined;
  const deepPlace = contentUnlocked ? birthPlace : undefined;
  const displayName = (nickname || "").trim() || (realName || "").trim() || "สมาชิก";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#self-intro") return;
    const t = window.setTimeout(() => {
      const target = document.getElementById("self-intro");
      const fold = target?.closest("details");
      if (fold) fold.open = true;
      target?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 160);
    return () => window.clearTimeout(t);
  }, [seed]);

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
        "fortune-free-page dd-page-live mx-auto w-full min-w-0 max-w-3xl space-y-3.5 px-1 sm:px-2",
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
          zodiac={pack.analysis.zodiac}
          headline={hero.headline}
          quote={hero.quote}
          tip={hero.tip}
        />
      </div>

      <div
        className="fortune-reveal px-3"
        style={{ "--fortune-delay": "120ms" } as CSSProperties}
      >
        <FortuneTopicGrid
          nickname={nickname}
          birthDate={birthDate}
          birthTime={deepTime}
          birthPlace={deepPlace}
          focus={typedFocus}
          gender={gender}
          from={isPremiumPage ? "premium" : "reading"}
          unlocked={contentUnlocked}
        />
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <Link
            href={`/reading/tarot?seed=${encodeURIComponent(seed)}`}
            className="flex min-h-[4.5rem] flex-col justify-center rounded-[18px] px-3 py-3 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40"
            style={{
              background: "linear-gradient(165deg, #1a2234 0%, #121826 100%)",
              border: "1px solid rgba(213, 177, 111, 0.45)",
            }}
          >
            <p className="text-[14px] font-bold text-white">ไพ่รายวัน</p>
            <p className="mt-0.5 text-[11px] text-white/65">เปิดไพ่วันนี้</p>
          </Link>
          <Link
            href="/menu"
            className="flex min-h-[4.5rem] flex-col justify-center rounded-[18px] px-3 py-3 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40"
            style={{
              background: "linear-gradient(165deg, #1a2234 0%, #121826 100%)",
              border: "1px solid rgba(213, 177, 111, 0.45)",
            }}
          >
            <p className="text-[14px] font-bold text-white">เมนูทั้งหมด</p>
            <p className="mt-0.5 text-[11px] text-white/65">เลือกเรื่องอื่น</p>
          </Link>
        </div>
      </div>

      {!isPremiumPage && unlocked ? (
        <div
          className="fortune-reveal px-3"
          style={{ "--fortune-delay": "160ms" } as CSSProperties}
        >
          <Link
            href="/premium"
            className="group flex items-center gap-3 rounded-[18px] px-3.5 py-3.5 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            style={{
              border: "1.5px solid transparent",
              background:
                "linear-gradient(165deg, #1c2738 0%, #141c2b 48%, #101827 100%) padding-box, linear-gradient(145deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 55%, #b8924f 78%, #f0dc9e 100%) border-box",
              boxShadow:
                "0 12px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,248,228,0.08)",
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.22), rgba(213,177,111,0.1) 60%, transparent)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
              }}
            >
              <FortuneIcon name="sparkle" size={22} plain />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mae-gold-text block text-[14px] font-semibold tracking-wide">
                เปิดหน้าพรีเมียม
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-[#e8d19a]/75">
                ปฏิทินเต็ม · จังหวะเดือน · เนื้อหาปลดล็อก
              </span>
            </span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition group-hover:brightness-110 group-active:scale-95"
              style={{
                background:
                  "linear-gradient(145deg, #efe0b8 0%, #d5b16f 55%, #b8924f 100%)",
                boxShadow: "0 4px 12px rgba(184,146,79,0.35)",
              }}
            >
              <ArrowRight className="h-4 w-4 text-[#101827]" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      ) : null}

      <div
        className="fortune-reveal px-3 pb-4"
        style={{ "--fortune-delay": "200ms" } as CSSProperties}
      >
        <MoreDetails title="อ่านราศี พิธี และแนวโน้มเดือน">
          <FortunePromoSplitBanner unlocked={contentUnlocked} />
          {contentUnlocked ? (
            <FortunePremiumValueSection
              birthDate={birthDate}
              nickname={nickname}
              birthTime={deepTime}
              birthPlace={deepPlace}
              focus={typedFocus}
              gender={gender}
            />
          ) : null}
          <FortuneFreeZodiacToday
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            birthPlace={deepPlace}
            focus={typedFocus}
            gender={gender}
            unlocked={unlocked}
            deep={contentUnlocked}
            onUnlock={onUnlock}
          />
          <FortuneLuckyStrip
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            birthPlace={deepPlace}
            focus={typedFocus}
            gender={gender}
          />
          <FortuneExtraReadings
            seed={seed}
            unlocked={contentUnlocked}
            onUnlock={onUnlock}
          />
          <FortuneCalendarShirtPreview
            seed={seed}
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            birthPlace={deepPlace}
            focus={typedFocus}
            gender={gender}
            unlocked={contentUnlocked}
            onUnlock={onUnlock}
          />
          <FortuneFreeMonthTrend
            seed={seed}
            birthDate={birthDate}
            nickname={nickname}
            birthTime={deepTime}
            birthPlace={deepPlace}
            focus={typedFocus}
            gender={gender}
            points={monthPoints}
            unlocked={contentUnlocked}
            onUnlock={onUnlock}
          />
          <div id="self-intro" className="scroll-mt-4">
            {contentUnlocked ? (
              <FortunePremiumSelfDeep
                seed={seed}
                nickname={nickname}
                birthDate={birthDate}
                birthTime={deepTime}
                birthPlace={deepPlace}
                focus={typedFocus}
                gender={gender}
              />
            ) : (
              <FortuneFreeSelfIntro
                seed={seed}
                nickname={nickname}
                birthDate={birthDate}
                birthTime={deepTime}
                birthPlace={deepPlace}
                focus={typedFocus}
                gender={gender}
                premium={contentUnlocked}
              />
            )}
          </div>
          {contentUnlocked ? (
            <FortunePremiumRituals
              birthDate={birthDate}
              nickname={nickname}
              birthTime={deepTime}
              birthPlace={deepPlace}
              focus={typedFocus}
              gender={gender}
            />
          ) : null}
        </MoreDetails>
        <MoreDetails title="อ่านข้อควรรู้ก่อนใช้คำทำนาย" className="mt-2.5">
          <p className="text-[12px] leading-relaxed text-[#c5cdd9]/80">
            {FORTUNE_DISCLAIMER}
          </p>
        </MoreDetails>
      </div>
    </div>
  );
}
