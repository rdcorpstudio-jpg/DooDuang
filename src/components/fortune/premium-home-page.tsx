"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AnimatedPage } from "@/components/ui/reveal";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { LifeInsightMockup } from "@/components/fortune/life-insight-mockup";
import { PremiumDeepenForm } from "@/components/fortune/premium-deepen-form";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import {
  getPremiumOnboardPath,
  hasBasicFortuneProfile,
  hasFreeReadingBasics,
  hydrateFortuneProfileFromWizard,
  needsPremiumDeepen,
  readFortuneProfile,
  writeFortuneProfile,
  WIZARD_CACHE_KEY,
  type FortuneUserProfile,
} from "@/lib/fortune/profile-storage";

/** โชว์ฟอร์มเวลาเกิด/สถานที่ เฉพาะรอบหลังจ่ายเงินเท่านั้น */
const DEEPEN_AFTER_PAY_KEY = "dooduang-deepen-after-pay";

function markDeepenAfterPay() {
  try {
    sessionStorage.setItem(DEEPEN_AFTER_PAY_KEY, "1");
  } catch {
    /* ignore */
  }
}

function hasDeepenAfterPay(): boolean {
  try {
    return sessionStorage.getItem(DEEPEN_AFTER_PAY_KEY) === "1";
  } catch {
    return false;
  }
}

function clearDeepenAfterPay() {
  try {
    sessionStorage.removeItem(DEEPEN_AFTER_PAY_KEY);
  } catch {
    /* ignore */
  }
}

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
    if (parsed?.profile?.nickname && parsed.profile?.birthDate) {
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
 * หน้าดวง (/premium):
 * ยังไม่มีข้อมูล → ไปกรอกที่ /reading
 * ฟรี → ดวงปกติ + ทางปลดล็อก
 * พรีเมียม → ดวงเต็ม (ฟอร์มเวลาเกิด/สถานที่ โชว์เฉพาะหลังจ่ายเงิน หรือกดแบนเนอร์เอง)
 */
export function PremiumHomePage({
  forceUnlocked = false,
  previewSeed,
}: {
  forceUnlocked?: boolean;
  previewSeed?: string;
} = {}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(forceUnlocked);
  const [profile, setProfile] = useState<FortuneUserProfile | null>(null);
  const [showDeepen, setShowDeepen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  function applyUnlock() {
    const next = mergeProfile();
    setProfile(next);
    setPremiumUnlocked(
      next ? { birthDate: next.birthDate, nickname: next.nickname } : null
    );
    setUnlocked(true);
    setPayOpen(false);
    if (!hasBasicFortuneProfile(next)) {
      router.replace(getPremiumOnboardPath(next));
      return;
    }
    // ฟอร์มเชิงลึกเฉพาะหลังสมัคร/จ่ายจริงเท่านั้น
    if (needsPremiumDeepen(next)) {
      markDeepenAfterPay();
      setShowDeepen(true);
    }
  }

  useStripePaymentReturn(() => {
    applyUnlock();
  });

  useEffect(() => {
    const next = mergeProfile();
    setProfile(next);
    const isUnlocked =
      forceUnlocked ||
      isPremiumUnlocked(
        next ? { birthDate: next.birthDate, nickname: next.nickname } : null
      );
    setUnlocked(isUnlocked);
    // อย่าเด้งฟอร์มพรีเมียมตอนเข้าหน้าธรรมดา — เฉพาะหลังจ่าย (หรือกดแบนเนอร์เอง)
    setShowDeepen(
      Boolean(isUnlocked && hasDeepenAfterPay() && needsPremiumDeepen(next))
    );
    setReady(true);

    if (isUnlocked && !forceUnlocked && !hasBasicFortuneProfile(next)) {
      router.replace(getPremiumOnboardPath(next));
      return;
    }

    if (!forceUnlocked && !hasFreeReadingBasics(next)) {
      router.replace("/reading");
    }
  }, [forceUnlocked, router]);

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

  // —— ยังไม่สมัครพรีเมียม: ดวงฟรีเท่านั้น ——
  if (!unlocked) {
    if (!hasFreeReadingBasics(profile) && !forceUnlocked) {
      return (
        <AnimatedPage className="mx-auto w-full max-w-[480px] px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
          กำลังไปหน้ากรอกข้อมูล…
        </AnimatedPage>
      );
    }

    const nickname = profile?.nickname ?? "นัท";
    const birthDate = profile?.birthDate ?? "1995-09-07";
    const realName = profile?.realName || nickname;

    return (
      <AnimatedPage className="mx-auto w-full min-w-0 max-w-[480px] px-0 pb-10 pt-0">
        <LifeInsightMockup
          key={`free-${seed}`}
          seed={seed}
          birthDate={birthDate}
          nickname={nickname}
          realName={realName}
          gender={profile?.gender || undefined}
          unlocked={false}
          onUnlock={() => setPayOpen(true)}
          variant="free"
        />

        <Suspense fallback={null}>
          <FortunePaymentSheet
            open={payOpen}
            onClose={() => setPayOpen(false)}
            onPaid={applyUnlock}
            returnPath="/premium"
          />
        </Suspense>
      </AnimatedPage>
    );
  }

  if (!hasBasicFortuneProfile(profile) && !forceUnlocked) {
    return (
      <AnimatedPage className="mx-auto w-full max-w-[480px] px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
        กำลังไปหน้าเลือกเพศ…
      </AnimatedPage>
    );
  }

  // ฟอร์มเวลาเกิด/สถานที่ — เฉพาะหลังสมัครแล้ว และเลือกกรอก
  if (showDeepen && unlocked && profile) {
    return (
      <AnimatedPage className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col items-center justify-center px-4 py-8">
        <PremiumDeepenForm
          profile={profile}
          onSaved={(next) => {
            clearDeepenAfterPay();
            setProfile(next);
            setShowDeepen(false);
          }}
          onSkip={(next) => {
            clearDeepenAfterPay();
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
  const deepenComplete = Boolean(profile?.birthTime && profile?.birthPlace);

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
          className="mae-aspect-card mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-[16px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99]"
        >
          <p className="text-[13px] font-semibold text-[#d5b16f]">
            กรอกเวลาเกิดและสถานที่เกิด
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-[#f7f4ec]/65">
            ตอนนี้ดูแบบประมาณอยู่ — แตะเพื่อวิเคราะห์เชิงลึกให้แม่นขึ้น
          </p>
        </button>
      ) : null}

      <LifeInsightMockup
        key={seed}
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
