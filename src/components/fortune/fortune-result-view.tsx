"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_NAME, FORTUNE_DISCLAIMER } from "@/lib/site";
import { SaveReadingForm } from "@/components/fortune/save-reading-form";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { getUnlockStorageKey, type ExtendedFortuneResult } from "@/lib/fortune/extended";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import type { FortuneProfile } from "@/lib/fortune/engine";
import type { ReadingOption } from "@/lib/fortune/zodiac";

interface FortuneResultViewProps {
  result: ExtendedFortuneResult;
  profile: FortuneProfile;
  readingOption: ReadingOption;
  type: string;
  shareToken?: string | null;
  onRetry?: () => void;
  showBackLink?: boolean;
}

export function FortuneResultView({
  result: _result,
  profile,
  readingOption,
  type,
  shareToken,
  onRetry,
  showBackLink: _showBackLink = true,
}: FortuneResultViewProps) {
  const router = useRouter();
  const storageKey = getUnlockStorageKey(type, profile);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const seed = `${type}-${profile.realName}-${profile.nickname}-${profile.birthDate}-${profile.gender}`;

  useEffect(() => {
    setUnlocked(
      isPremiumUnlocked({
        birthDate: profile.birthDate,
        nickname: profile.nickname,
      }) ||
        (() => {
          try {
            return sessionStorage.getItem(storageKey) === "1";
          } catch {
            return false;
          }
        })()
    );
  }, [storageKey, profile.birthDate, profile.nickname]);

  function handlePaid() {
    setPremiumUnlocked({
      birthDate: profile.birthDate,
      nickname: profile.nickname,
    });
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    setPayOpen(false);
    router.push("/premium");
  }

  return (
    <div className="relative mx-auto w-full max-w-[480px] pb-12">
      <LifeInsightMockup
        seed={seed}
        birthDate={profile.birthDate}
        nickname={profile.nickname}
        realName={profile.realName}
        readingTitle={readingOption.title}
        unlocked={unlocked}
        unlocking={false}
        onUnlock={() => setPayOpen(true)}
      />

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
      />

      <footer className="mt-8 space-y-4 px-1 text-center">
        <div className="no-print">
          <SaveReadingForm token={shareToken ?? null} />
        </div>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="no-print text-[15px] text-white/45 hover:text-white/75"
          >
            ดูดวงใหม่
          </button>
        ) : null}
        <div className="no-print flex items-center justify-center gap-3 text-[14px]">
          <Link href="/reading" className="text-[#c084fc]">
            ดูดวงอีกครั้ง
          </Link>
          <span className="text-white/25">·</span>
          <Link href="/" className="text-[#c084fc]">
            กลับหน้าแรก
          </Link>
        </div>
        <p className="text-[13px] text-white/30">
          {FORTUNE_DISCLAIMER} · {APP_NAME}
        </p>
      </footer>
    </div>
  );
}
