"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { PremiumDeepenForm } from "@/components/fortune/premium-deepen-form";
import { PremiumSalesPage } from "@/components/fortune/premium-sales-page";
import { isPremiumUnlocked } from "@/lib/fortune/premium-unlock";
import {
  hydrateFortuneProfileFromWizard,
  needsPremiumDeepen,
  readFortuneProfile,
  writeFortuneProfile,
  WIZARD_CACHE_KEY,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";

type WizardProfile = {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: string;
};

function readWizardProfile(): WizardProfile | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      step?: string;
      profile?: WizardProfile;
    };
    if (
      parsed?.step === "result" &&
      parsed.profile?.nickname &&
      parsed.profile?.birthDate
    ) {
      return parsed.profile;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function mergeProfile(): FortuneUserProfile | null {
  hydrateFortuneProfileFromWizard();
  const stored = readFortuneProfile();
  const wizard = readWizardProfile();
  if (!stored && !wizard) return null;
  if (stored && wizard) {
    // Prefer stored deepen fields; refresh names/date from latest wizard if present
    return writeFortuneProfile({
      ...stored,
      realName: wizard.realName || stored.realName,
      nickname: wizard.nickname || stored.nickname,
      birthDate: wizard.birthDate || stored.birthDate,
      gender: (wizard.gender || stored.gender) as FortuneUserProfile["gender"],
    });
  }
  if (stored) return stored;
  if (!wizard) return null;
  return writeFortuneProfile({
    realName: wizard.realName,
    nickname: wizard.nickname,
    birthDate: wizard.birthDate,
    gender: (wizard.gender || "") as FortuneUserProfile["gender"],
  });
}

/**
 * Bottom-nav พรีเมียม:
 * locked → sales
 * unlocked → deepen form (if needed) → fully unlocked daily UI
 */
export function PremiumHomePage({
  forceUnlocked = false,
  previewSeed,
}: {
  forceUnlocked?: boolean;
  previewSeed?: string;
} = {}) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(forceUnlocked);
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);
  const [showDeepen, setShowDeepen] = useState(false);

  useEffect(() => {
    const next = mergeProfile();
    setProfile(next);
    const isUnlocked =
      forceUnlocked ||
      isPremiumUnlocked(
        next ? { birthDate: next.birthDate, nickname: next.nickname } : null
      );
    setUnlocked(isUnlocked);
    setShowDeepen(isUnlocked && needsPremiumDeepen(next));
    setReady(true);
  }, [forceUnlocked]);

  const seed = useMemo(() => {
    if (previewSeed) return previewSeed;
    if (!profile) return "premium-guest";
    return `overall-${profile.realName}-${profile.nickname}-${profile.birthDate}-${profile.gender}-${profile.birthTime ?? ""}-${profile.birthPlace ?? ""}`;
  }, [previewSeed, profile]);

  if (!ready) {
    return (
      <AnimatedPage className="mx-auto w-full max-w-[480px] px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
        กำลังเปิด…
      </AnimatedPage>
    );
  }

  if (!unlocked) {
    return (
      <Suspense fallback={null}>
        <PremiumSalesPage
          onUnlocked={() => {
            const next = mergeProfile();
            setProfile(next);
            setUnlocked(true);
            setShowDeepen(needsPremiumDeepen(next));
          }}
        />
      </Suspense>
    );
  }

  if (!profile && !forceUnlocked) {
    return (
      <AnimatedPage className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 pb-6 pt-8">
        <section className="fortune-glass rounded-[20px] px-4 py-6 text-center">
          <Sparkles
            className="mx-auto h-8 w-8 text-[#F4BC52]"
            strokeWidth={1.7}
          />
          <h1 className="font-sacred mt-3 text-[1.6rem] text-[#F7F8FF]">
            ยังไม่มีข้อมูลดวง
          </h1>
          <p className="mx-auto mt-2 max-w-[18rem] text-[14px] leading-relaxed text-[#9AB8DC]">
            ดูดวงฟรีก่อนหนึ่งครั้ง แล้วกลับมาที่แท็บพรีเมียม
          </p>
          <Link
            href="/reading"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-3.5 text-[15px] font-semibold text-[#1A1208]"
            style={{
              background:
                "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
            }}
          >
            เริ่มดูดวง
          </Link>
        </section>
      </AnimatedPage>
    );
  }

  if (showDeepen && profile) {
    return (
      <AnimatedPage className="mx-auto flex min-h-[70dvh] w-full max-w-[480px] items-center px-3 pb-10 pt-4">
        <PremiumDeepenForm
          profile={profile}
          onSaved={(next) => {
            setProfile(next);
            setShowDeepen(false);
          }}
          onSkip={(next) => {
            setProfile(next);
            setShowDeepen(false);
          }}
        />
      </AnimatedPage>
    );
  }

  const nickname = profile?.nickname ?? "นัท";
  const birthDate = profile?.birthDate ?? "1995-09-07";
  const realName = profile?.realName ?? nickname;
  const deepenComplete = Boolean(
    profile?.birthTime && profile?.birthPlace
  );

  return (
    <AnimatedPage className="mx-auto w-full min-w-0 max-w-[480px] px-0 pb-10 pt-0">
      {!deepenComplete ? (
        <button
          type="button"
          onClick={() => {
            if (!profile) return;
            const next = writeFortuneProfile({
              ...profile,
              deepenSkipped: false,
            });
            setProfile(next);
            setShowDeepen(true);
          }}
          className="fortune-glass mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-[16px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99]"
        >
          <p className="text-[13px] font-semibold text-[#6A48C8]">
            กรอกเวลาเกิดและสถานที่เกิด
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-[#5E5688]">
            ตอนนี้ดูแบบประมาณอยู่ — แตะเพื่อวิเคราะห์เชิงลึกให้แม่นขึ้น
          </p>
        </button>
      ) : null}

      <LifeInsightMockup
        seed={seed}
        birthDate={birthDate}
        nickname={nickname}
        realName={realName}
        birthTime={profile?.birthTime}
        birthPlace={profile?.birthPlace}
        focus={profile?.focus}
        gender={profile?.gender || undefined}
        unlocked
        variant="premium"
      />
    </AnimatedPage>
  );
}
