"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, Check, Lock, Moon, Sparkles, Sun } from "lucide-react";
import { SacredButton } from "@/components/ui/sacred-button";
import { SacredCorners, SacredDivider, SacredMark } from "@/components/ui/sacred-mark";
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

function HeroVisual() {
  return (
    <div className="relative mx-auto mb-5 h-[5.5rem] w-[5.5rem]" aria-hidden>
      <div className="absolute inset-2 rounded-full bg-brand-purple/25 blur-2xl" />
      <div className="relative h-full w-full">
        <div className="absolute left-3 top-2 h-7 w-7 rotate-[-14deg] rounded-md bg-gradient-to-br from-amber-200/35 to-amber-600/15 shadow-sm" />
        <div className="absolute right-2 top-4 h-6 w-6 rotate-12 rounded-md bg-gradient-to-br from-brand-purple-light/40 to-brand-purple/20" />
        <div className="absolute bottom-2 left-5 h-5 w-5 rotate-6 rounded-md bg-gradient-to-br from-purple-200/30 to-purple-500/15" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-amber-100/75 animate-float" strokeWidth={1.25} />
        </div>
      </div>
    </div>
  );
}

type SectionIconKind = "sun" | "moon" | "rising" | "sparkle";

function getSectionIconKind(heading: string): SectionIconKind {
  if (heading.includes("จันทร์")) return "moon";
  if (heading.includes("อาทิตย์") || heading.includes("ลักษณะ")) return "sun";
  if (heading.includes("ลัคนา") || heading.includes("ภาพลักษณ์")) return "rising";
  return "sparkle";
}

function SectionIconBadge({ heading, index = 0 }: { heading: string; index?: number }) {
  const kind = getSectionIconKind(heading);
  const delay = `${index * 0.35}s`;
  const iconProps = {
    className: "section-icon-mark h-3.5 w-3.5 shrink-0 text-amber-200/88 animate-twinkle",
    strokeWidth: 1.55,
    style: { "--twinkle-duration": "3.2s", "--twinkle-delay": delay } as React.CSSProperties,
  };

  if (kind === "sun") return <Sun {...iconProps} fill="currentColor" fillOpacity={0.15} />;
  if (kind === "moon") return <Moon {...iconProps} fill="currentColor" fillOpacity={0.12} />;
  if (kind === "rising") return <ArrowUp {...iconProps} />;
  return <Sparkles {...iconProps} fill="currentColor" fillOpacity={0.18} />;
}

function SectionBlock({
  tab,
  showHero,
}: {
  tab: FortuneTab;
  showHero?: boolean;
}) {
  return (
    <div>
      {showHero && <HeroVisual />}
      <h2
        className={cn(
          "font-sacred mb-5 text-center text-[1.3rem] leading-snug text-white/95",
          !showHero && "mt-1"
        )}
      >
        {tab.heroTitle}
      </h2>

      <div className="space-y-3.5">
        {tab.sections.map((section, sectionIndex) => (
          <article key={section.heading}>
            <h3 className="flex items-center gap-2 text-[13px] font-semibold leading-snug text-white/93">
              <SectionIconBadge heading={section.heading} index={sectionIndex} />
              <span>{section.heading}</span>
            </h3>
            <p className="mt-1 pl-[22px] text-[13px] leading-[1.7] text-purple-100/72">
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
      <h2 className="font-sacred text-center text-[1.15rem] text-white/90">{premium.heroTitle}</h2>
      {premium.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="mb-2 text-[13px] font-semibold text-white/88">{section.heading}</h3>
          <p className="text-[13px] leading-[1.9] text-purple-100/65">{section.content}</p>
        </div>
      ))}
      <div className="rounded-xl bg-white/[0.04] p-4">
        <p className="text-[13px] leading-[1.9] text-purple-100/58">{premium.summary}</p>
      </div>
    </>
  );

  return (
    <section id="fortune-premium" className="relative mt-8">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-amber-200/15 bg-white/[0.03]",
          !unlocked && "min-h-[32rem]"
        )}
      >
        <SacredCorners className="text-amber-200/25" />
        <div className="pointer-events-none absolute inset-3 rounded-2xl border border-brand-purple-light/12" />

        {!unlocked && (
          <div
            className="absolute inset-0 select-none px-5 py-5 blur-[6px] opacity-35"
            aria-hidden
          >
            <div className="space-y-5">{previewContent}</div>
          </div>
        )}

        {unlocked ? (
          <div className="relative z-[1] space-y-5 p-5">{previewContent}</div>
        ) : (
          <div className="relative z-[2] flex min-h-[32rem] flex-col items-center justify-center px-6 py-10">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-purple-deep/20 via-brand-purple-dark/30 to-brand-purple-deep/20" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,rgba(168,85,247,0.16),transparent_70%)]" />

            <div className="relative flex w-full flex-col items-center">
              <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-amber-200/22" />
                <div className="absolute inset-[5px] rounded-full border border-brand-purple-light/18" />
                <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-amber-200/10" />
                <Lock className="relative h-5 w-5 text-amber-100/80" strokeWidth={1.25} />
                <SacredMark
                  size="xs"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 text-amber-200/35"
                />
                <SacredMark
                  size="xs"
                  className="absolute -right-2 top-1/2 -translate-y-1/2 text-amber-200/35"
                />
              </div>

              <SacredDivider className="mb-5 w-24 opacity-80" />

              <div className="mb-5 max-w-[280px] text-center">
                <h3 className="font-sacred mb-2 text-[1.15rem] leading-snug text-white/95">
                  {premium.heroTitle}
                </h3>
                <p className="text-[12px] leading-[1.75] text-purple-200/62">{premium.teaser}</p>
              </div>

              <ul className="mb-5 w-full max-w-[260px] space-y-2">
                {bullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-left text-[11px] leading-snug text-purple-200/60"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200/60" strokeWidth={2} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <SacredButton type="button" onClick={onUnlock} disabled={unlocking} className="max-w-[260px]">
                {unlocking ? "กำลังเปิด..." : `ปลดล็อค ${FORTUNE_UNLOCK_PRICE} บาท`}
              </SacredButton>

              <p className="mt-3 text-[10px] tracking-wide text-purple-400/42">
                ครั้งเดียว · อ่านได้ทันที
              </p>
              <p className="mt-1 text-[10px] tracking-wide text-purple-400/35">
                เฉพาะ{nickname} · {readingTitle}
              </p>

              <SacredDivider className="mt-5 w-16 opacity-60" />
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
    <div className="pb-6">
      <header className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] text-purple-200/55">
          <SacredMark size="sm" className="text-brand-purple-light/70" />
          <span className="tracking-[0.2em]">ดูดวงเฉพาะบุคคล</span>
          <SacredMark size="sm" className="text-brand-purple-light/70" />
        </div>
        <p className="mb-2 text-[10px] tracking-wide text-purple-400/45">{readingOption.title}</p>
        <h1 className="font-sacred text-[1.5rem] leading-tight text-white/95">{result.title}</h1>
        <p className="mt-2 text-xs text-purple-300/45">{profile.realName}</p>
      </header>

      <div>
        {result.tabs.map((tab, index) => (
          <section key={tab.id} id={`fortune-section-${index}`} className={cn(index > 0 && "mt-8")}>
            <SectionBlock tab={tab} showHero={index === 0} />
          </section>
        ))}
      </div>

      {result.premium && (
        <PremiumBlurSection
          premium={result.premium}
          unlocked={unlocked}
          unlocking={unlocking}
          onUnlock={handleUnlockStart}
          readingTitle={readingOption.title}
          readingType={type}
          nickname={profile.nickname}
        />
      )}

      <footer className="mt-8 space-y-4 text-center">
        <SaveReadingForm token={shareToken ?? null} />
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-purple-400/45 transition-colors hover:text-purple-200/70"
          >
            ดูดวงใหม่
          </button>
        )}
        <div className="flex items-center justify-center gap-3 text-[11px]">
          <Link href="/reading" className="text-purple-400/40 hover:text-purple-200/65">
            เลือกการ์ดอื่น
          </Link>
          <span className="text-purple-600/40">·</span>
          <Link href="/#fortune" className="text-purple-400/40 hover:text-purple-200/65">
            กลับหน้าแรก
          </Link>
        </div>
        <p className="text-[10px] text-purple-500/30">{FORTUNE_DISCLAIMER} · {APP_NAME}</p>
      </footer>
    </div>
  );
}
