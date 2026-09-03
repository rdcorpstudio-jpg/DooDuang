"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, Check, Lock, Moon, Sparkles, Sun } from "lucide-react";
import { SacredButton } from "@/components/ui/sacred-button";
import { FORTUNE_UNLOCK_PRICE, APP_NAME, FORTUNE_DISCLAIMER } from "@/lib/site";
import { SaveReadingForm } from "@/components/fortune/save-reading-form";
import {
  getUnlockStorageKey,
  type ExtendedFortuneResult,
  type FortuneTab,
  type PremiumFortune,
} from "@/lib/fortune/extended";
import type { FortuneProfile } from "@/lib/fortune/engine";
import type { ReadingOption } from "@/lib/fortune/zodiac";
import { Reveal, useRevealMounted } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

interface FortuneResultViewProps {
  result: ExtendedFortuneResult;
  profile: FortuneProfile;
  readingOption: ReadingOption;
  type: string;
  shareToken?: string | null;
  onRetry?: () => void;
}

const PAYWALL_BULLETS: Record<string, [string, string, string]> = {
  love: [
    "ช่วงเวลาแห่งความรัก 6 เดือนข้างหน้า",
    "สัญญาณจากคนพิเศษที่กำลังเข้ามา",
    "คำแนะนำเฉพาะหัวใจของคุณ",
  ],
  career: [
    "แผนการงาน 6 เดือนที่ควรรู้",
    "ช่วงเวลาทองและคนสำคัญ",
    "กลยุทธ์ที่เหมาะกับเส้นทางของคุณ",
  ],
  money: [
    "จังหวะลาภและรายได้ที่กำลังมา",
    "ช่วงเวลาที่ควรลงทุนหรือออม",
    "กลยุทธ์การเงินเฉพาะคุณ",
  ],
  overall: [
    "จุดเปลี่ยนสำคัญในชีวิต 6 เดือนข้างหน้า",
    "บทเรียนและโอกาสที่จักรวาลเตรียมไว้",
    "คำทำนายเฉพาะเส้นทางของคุณ",
  ],
  daily: [
    "ดวงรายวันละเอียด 7 วันข้างหน้า",
    "ช่วงเวลามงคลที่ควรใช้ให้คุ้ม",
    "สิ่งที่ควรทำและควรหลีกเลี่ยง",
  ],
  health: [
    "ช่วงที่ต้องดูแลสุขภาพเป็นพิเศษ",
    "กิจกรรมเสริมพลังกายและใจ",
    "ทิศทางสมดุลที่เหมาะกับคุณ",
  ],
  tarot: [
    "ไพ่เชิงลึก 12 ใบที่ยังไม่เปิด",
    "ความท้าทายและคำแนะนำจากไพ่",
    "ทิศทางที่ไพ่ชี้ให้คุณโดยเฉพาะ",
  ],
};

type SectionIconKind = "sun" | "moon" | "rising" | "sparkle";

function getSectionIconKind(heading: string): SectionIconKind {
  if (heading.includes("จันทร์")) return "moon";
  if (heading.includes("อาทิตย์") || heading.includes("ลักษณะ")) return "sun";
  if (heading.includes("ลัคนา") || heading.includes("ภาพลักษณ์")) return "rising";
  return "sparkle";
}

function SectionIconBadge({ heading }: { heading: string; index?: number }) {
  const kind = getSectionIconKind(heading);
  const iconProps = {
    className: "h-3.5 w-3.5 text-[#e8c4b0]",
    strokeWidth: 1.5,
  };

  const icon =
    kind === "sun" ? (
      <Sun {...iconProps} />
    ) : kind === "moon" ? (
      <Moon {...iconProps} />
    ) : kind === "rising" ? (
      <ArrowUp {...iconProps} />
    ) : (
      <Sparkles {...iconProps} />
    );

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
      {icon}
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto mb-6 h-[8.5rem] w-[8.5rem]" aria-hidden>
      {/* Soft gold–purple bloom */}
      <div className="absolute inset-[-8%] rounded-full bg-[radial-gradient(circle,rgba(232,196,176,0.35)_0%,rgba(168,85,247,0.22)_45%,transparent_70%)] blur-2xl" />

      {/* Wide outer dashed orbit */}
      <div className="intro-portal-spin-reverse absolute inset-0 rounded-full border border-dashed border-[#e8c4b0]/28" />
      {/* Solid mid orbit */}
      <div className="intro-portal-spin absolute inset-[12%] rounded-full border border-[#e8c4b0]/35" />

      {/* Floating tarot-like chips */}
      <div className="absolute left-[6%] top-[18%] h-9 w-7 -rotate-12 rounded-lg border border-[#e8c4b0]/40 bg-gradient-to-br from-[#e8c4b0]/45 to-[#7c3aed]/30 shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
      <div className="absolute right-[4%] top-[22%] h-8 w-6 rotate-[16deg] rounded-lg border border-white/25 bg-gradient-to-br from-[#c084fc]/50 to-[#581c87]/35 shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
      <div className="absolute bottom-[12%] left-[28%] h-6 w-5 rotate-6 rounded-md border border-white/20 bg-gradient-to-br from-white/30 to-purple-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.3)]" />

      {/* Center emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#e8c4b0]/40 bg-gradient-to-b from-[#4a2d78]/90 to-[#1a0f30] shadow-[0_0_32px_rgba(232,196,176,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]" />
          <span className="absolute inset-[5px] rounded-full border border-[#e8c4b0]/20" />
          <Sparkles
            className="relative z-[1] h-7 w-7 animate-float text-[#e8c4b0] drop-shadow-[0_0_14px_rgba(232,196,176,0.9)]"
            strokeWidth={1.35}
          />
        </div>
      </div>
    </div>
  );
}

function ResultHeroHeader({
  categoryTitle,
  title,
}: {
  categoryTitle: string;
  title: string;
}) {
  return (
    <header className="relative mb-10 overflow-hidden pt-2 text-center">
      {/* Soft luminous bloom */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,196,176,0.28)_0%,rgba(168,85,247,0.18)_45%,transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="relative z-[1]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8c4b0]/35 bg-[#e8c4b0]/10 px-4 py-1.5 shadow-[0_0_20px_rgba(232,196,176,0.15)] backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#e8c4b0]" strokeWidth={1.8} />
          <span className="text-[13px] font-semibold tracking-[0.14em] text-[#e8c4b0]">
            {categoryTitle}
          </span>
        </div>

        <HeroVisual />

        <h1 className="font-sacred mx-auto max-w-[20rem] text-[1.85rem] leading-[1.35] tracking-wide text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.35)] sm:text-[2.05rem]">
          {title}
        </h1>

        <div className="mx-auto mt-4 flex max-w-[14rem] items-center justify-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8c4b0]/55 to-transparent" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#e8c4b0] shadow-[0_0_10px_rgba(232,196,176,0.8)]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8c4b0]/55 to-transparent" />
        </div>
      </div>
    </header>
  );
}

function SectionBlock({ tab }: { tab: FortuneTab }) {
  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mb-2.5 flex items-center justify-center gap-2.5" aria-hidden>
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#e8c4b0]/45" />
          <span className="h-1 w-1 rotate-45 bg-[#e8c4b0]/80" />
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#e8c4b0]/45" />
        </div>
        <h2 className="text-[18px] font-semibold leading-snug tracking-tight text-white">
          {tab.heroTitle}
        </h2>
      </div>

      <div className="space-y-3">
        {tab.sections.map((section) => (
          <article
            key={section.heading}
            className="relative overflow-hidden rounded-[20px] border border-white/12 bg-[#1c1430]/90 px-4 py-4 sm:px-5 sm:py-5"
          >
            <span
              className="pointer-events-none absolute inset-y-3 left-0 w-px bg-gradient-to-b from-transparent via-[#e8c4b0]/45 to-transparent"
              aria-hidden
            />
            <h3 className="flex items-center gap-3 text-[15px] font-semibold leading-snug text-white">
              <SectionIconBadge heading={section.heading} />
              <span>{section.heading}</span>
            </h3>
            <p className="mt-3 text-[14px] leading-[1.8] text-white/70">
              {section.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PremiumBlurSection({
  premium,
  unlocked,
  unlocking,
  onUnlock,
  readingTitle,
  readingType,
  nickname,
}: {
  premium: PremiumFortune;
  unlocked: boolean;
  unlocking: boolean;
  onUnlock: () => void;
  readingTitle: string;
  readingType: string;
  nickname: string;
}) {
  const bullets = PAYWALL_BULLETS[readingType] ?? PAYWALL_BULLETS.overall;

  const previewContent = (
    <>
      <h2 className="text-center text-[18px] font-semibold text-white">{premium.heroTitle}</h2>
      {premium.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="mb-2 text-[15px] font-semibold text-white">{section.heading}</h3>
          <p className="text-[14px] leading-[1.8] text-white/65">{section.content}</p>
        </div>
      ))}
      <p className="text-[14px] leading-[1.8] text-white/55">{premium.summary}</p>
    </>
  );

  return (
    <section id="fortune-premium" className="relative mt-10">
      <div
        className={cn(
          "relative overflow-hidden rounded-[22px] border border-white/12 bg-[#1c1430]/90",
          !unlocked && "min-h-[30rem]"
        )}
      >
        {!unlocked && (
          <div className="absolute inset-0 select-none px-6 py-6 opacity-25 blur-[5px]" aria-hidden>
            <div className="space-y-5">{previewContent}</div>
          </div>
        )}

        {unlocked ? (
          <div className="relative z-[1] space-y-5 px-5 py-6">{previewContent}</div>
        ) : (
          <div className="relative z-[2] flex min-h-[30rem] flex-col items-center justify-center px-5 py-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/45" />

            <div className="relative flex w-full flex-col items-center px-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8c4b0]/30 bg-[#e8c4b0]/10">
                <Lock className="h-5 w-5 text-[#e8c4b0]" strokeWidth={1.5} />
              </div>

              <h3 className="mb-2 text-center text-[18px] font-semibold leading-snug text-white">
                {premium.heroTitle}
              </h3>
              <p className="mb-5 text-center text-[14px] leading-relaxed text-white/55">
                {premium.teaser}
              </p>

              <ul className="mb-6 w-full space-y-2.5">
                {bullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-left text-[14px] leading-snug text-white/65"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e8c4b0]" strokeWidth={2} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <SacredButton type="button" onClick={onUnlock} disabled={unlocking}>
                {unlocking ? "กำลังเปิด..." : `ปลดล็อค ${FORTUNE_UNLOCK_PRICE} บาท`}
              </SacredButton>

              <p className="mt-3 text-[12px] text-white/40">ครั้งเดียว · อ่านได้ทันที</p>
              <p className="mt-1 text-[12px] text-white/30">
                เฉพาะ{nickname} · {readingTitle}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function FortuneResultView({
  result,
  profile,
  readingOption,
  type,
  shareToken,
  onRetry,
}: FortuneResultViewProps) {
  const mounted = useRevealMounted(60);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const storageKey = getUnlockStorageKey(type, profile);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function handleUnlock() {
    sessionStorage.setItem(storageKey, "1");
    setUnlocked(true);
    setUnlocking(false);
  }

  function handleUnlockStart() {
    setUnlocking(true);
    window.setTimeout(handleUnlock, 800);
  }

  return (
    <div className="relative w-full pb-10">
      <Reveal visible={mounted} delay={0} variant="glow">
        <ResultHeroHeader
          categoryTitle={readingOption.title}
          title={result.title}
        />
      </Reveal>

      <div>
        {result.tabs.map((tab, index) => (
          <Reveal
            key={tab.id}
            visible={mounted}
            delay={160 + index * 120}
            className={cn(index > 0 && "mt-8")}
          >
            <section id={`fortune-section-${index}`}>
              <SectionBlock tab={tab} />
            </section>
          </Reveal>
        ))}
      </div>

      {result.premium && (
        <Reveal visible={mounted} delay={320 + result.tabs.length * 80} variant="scale">
          <PremiumBlurSection
            premium={result.premium}
            unlocked={unlocked}
            unlocking={unlocking}
            onUnlock={handleUnlockStart}
            readingTitle={readingOption.title}
            readingType={type}
            nickname={profile.nickname}
          />
        </Reveal>
      )}

      <Reveal visible={mounted} delay={420 + result.tabs.length * 80}>
        <footer className="mt-10 space-y-4 text-center">
          <SaveReadingForm token={shareToken ?? null} />
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-[15px] text-white/45 transition-colors hover:text-white/75"
            >
              ดูดวงใหม่
            </button>
          ) : null}
          <div className="flex items-center justify-center gap-3 text-[14px]">
            <Link href="/reading" className="text-[#c084fc] hover:text-[#e9d5ff]">
              เลือกการ์ดอื่น
            </Link>
            <span className="text-white/25">·</span>
            <Link href="/" className="text-[#c084fc] hover:text-[#e9d5ff]">
              กลับหน้าแรก
            </Link>
          </div>
          <p className="text-[13px] text-white/30">
            {FORTUNE_DISCLAIMER} · {APP_NAME}
          </p>
        </footer>
      </Reveal>
    </div>
  );
}
