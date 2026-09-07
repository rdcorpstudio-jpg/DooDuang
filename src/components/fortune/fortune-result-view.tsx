"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { APP_NAME, FORTUNE_DISCLAIMER } from "@/lib/site";
import { SaveReadingForm } from "@/components/fortune/save-reading-form";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { getUnlockStorageKey, type ExtendedFortuneResult } from "@/lib/fortune/extended";
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
  result,
  profile,
  readingOption,
  type,
  shareToken,
  onRetry,
  showBackLink: _showBackLink = true,
}: FortuneResultViewProps) {
  const storageKey = getUnlockStorageKey(type, profile);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const seed = `${type}-${profile.realName}-${profile.nickname}-${profile.birthDate}-${profile.gender}`;

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(storageKey) === "1");
    } catch {
      setUnlocked(false);
    }
  }, [storageKey]);

  function handlePaid() {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    setPayOpen(false);
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
        premium={result.premium}
      />

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
      />

      <footer className="mt-8 space-y-4 px-1 text-center">
        {unlocked ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#9AB8DC]/25 bg-[#121D36] px-4 py-3 text-[15px] font-semibold text-[#F7F8FF] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#46DDED]/45"
          >
            <Printer className="h-4 w-4 text-[#46DDED]" strokeWidth={1.9} />
            พิมพ์ / บันทึกเป็น PDF
          </button>
        ) : null}

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
