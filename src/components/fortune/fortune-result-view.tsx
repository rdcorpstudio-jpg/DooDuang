"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SaveReadingForm } from "@/components/fortune/save-reading-form";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
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

function FortuneResultViewInner({
  profile,
  readingOption,
  type,
  shareToken,
}: FortuneResultViewProps) {
  const router = useRouter();
  const storageKey = getUnlockStorageKey(type, profile);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const seed = `${type}-${profile.realName}-${profile.nickname}-${profile.birthDate}-${profile.gender}`;

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

  useStripePaymentReturn(() => {
    handlePaid();
  });

  return (
    <div className="relative mx-auto w-full max-w-[480px] pb-12">
      <LifeInsightMockup
        seed={seed}
        birthDate={profile.birthDate}
        nickname={profile.nickname}
        realName={profile.realName}
        gender={profile.gender}
        readingTitle={readingOption.title}
        unlocked={unlocked}
        unlocking={false}
        onUnlock={() => setPayOpen(true)}
        variant="free"
      />

      {!unlocked ? (
        <div className="fortune-reveal mt-4 px-3">
          <FortunePaymentSheet
            open
            variant="inline"
            onClose={() => {}}
            onPaid={handlePaid}
            returnPath="/premium"
          />
        </div>
      ) : null}

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/premium"
      />

      <footer className="mt-8 space-y-4 px-1 text-center">
        <div className="no-print">
          <SaveReadingForm token={shareToken ?? null} />
        </div>

        <div className="no-print flex items-center justify-center gap-3 text-[14px]">
          <Link href="/reading" className="text-[#c084fc]">
            ดูดวงอีกครั้ง
          </Link>
          <span className="text-white/25">·</span>
          <Link href="/" className="text-[#c084fc]">
            กลับหน้าแรก
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function FortuneResultView(props: FortuneResultViewProps) {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <FortuneResultViewInner {...props} />
    </Suspense>
  );
}
