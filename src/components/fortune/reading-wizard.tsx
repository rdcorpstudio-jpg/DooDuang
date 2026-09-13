"use client";

import { useEffect, useState, type FocusEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { ZodiacWheelBg } from "@/components/layout/zodiac-wheel-bg";
import {
  GENDER_OPTIONS,
  type Gender,
} from "@/components/ui/sacred-form";
import { PageBackButton } from "@/components/ui/page-back-button";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";
import {
  WIZARD_CACHE_KEY,
  writeFortuneProfile,
  readFortuneProfile,
  hasBasicFortuneProfile,
  hasFreeReadingBasics,
} from "@/lib/fortune/profile-storage";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

function scrollFieldIntoView(event: FocusEvent<HTMLInputElement>) {
  const el = event.currentTarget;
  const scroller = el.closest<HTMLElement>("[data-wizard-scroll]");

  const align = () => {
    if (scroller) {
      const parentRect = scroller.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetTop = parentRect.top + Math.min(96, parentRect.height * 0.18);
      const delta = elRect.top - targetTop;
      if (Math.abs(delta) > 8) {
        scroller.scrollBy({ top: delta, behavior: "smooth" });
      }
      return;
    }
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  };

  // iOS keyboard animation needs a couple ticks before layout settles.
  window.setTimeout(align, 80);
  window.setTimeout(align, 280);
  window.setTimeout(align, 480);
}
type FortuneApiResult = ExtendedFortuneResult & { shareToken?: string | null };
type Step = "gender" | "birth" | "name" | "loading" | "result";

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
  /** Kept for cache compat; free wizard no longer collects these */
  birthTime: string;
  focus: FortuneFocus;
}

const READING_TYPE = "overall" as const;
const readingOption = READING_OPTIONS.find((o) => o.id === READING_TYPE)!;

const MIN_LOADING_MS = 4800;
const FETCH_TIMEOUT_MS = 6000;

type WizardCache = {
  step: "result";
  profile: ProfileForm;
  result: FortuneApiResult;
};

function readWizardCache(): WizardCache | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WizardCache;
    if (
      parsed?.step === "result" &&
      parsed.result &&
      parsed.profile?.nickname &&
      parsed.profile?.birthDate &&
      parsed.profile?.gender
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeWizardCache(profile: ProfileForm, result: FortuneApiResult) {
  try {
    const payload: WizardCache = { step: "result", profile, result };
    sessionStorage.setItem(WIZARD_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  if (profile.nickname.trim() && profile.birthDate) {
    const existing = readFortuneProfile();
    writeFortuneProfile({
      realName: profile.realName,
      nickname: profile.nickname,
      birthDate: profile.birthDate,
      gender: profile.gender,
      // Free path must not wipe premium deepen fields / edit cooldown
      birthTime: existing?.birthTime,
      birthPlace: existing?.birthPlace,
      focus: existing?.focus,
      deepenSkipped: existing?.deepenSkipped,
      profileLockedUntil: existing?.profileLockedUntil,
    });
  }
}

function clearWizardCache() {
  try {
    sessionStorage.removeItem(WIZARD_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

function buildLocalFallback(nickname: string): FortuneApiResult {
  return {
    title: `ภาพรวมชีวิตของ ${nickname}`,
    preview: `${nickname} กำลังอยู่ในช่วงปรับทิศทางอย่างมีสติ มีพลังสร้างรากฐานและพร้อมเดินหน้าเมื่อโฟกัสชัด`,
    tabs: [
      {
        id: "section-0",
        label: "แกนชีวิต",
        heroTitle: "พิมพ์เขียวชีวิตของคุณ",
        sections: [
          {
            heading: "พลังชีวิตหลัก",
            content: `${nickname} มีพลังที่มุ่งมั่นและมั่นคง คุณไม่ยอมแพ้ง่าย และเชื่อในสิ่งที่ลงมือทำต่อเนื่อง`,
          },
          {
            heading: "โลกอารมณ์",
            content: `${nickname} ใช้สัญชาตญาณประกอบการตัดสินใจ ต้องการเวลาฟื้นพลังเมื่อรับรู้ความรู้สึกของคนรอบข้าง`,
          },
          {
            heading: "ภาพลักษณ์ที่โลกเห็น",
            content: `คนรอบข้างมอง${nickname} เป็นคนน่าเชื่อถือ มีเสน่ห์แบบเงียบ ๆ และพึ่งพาได้`,
          },
        ],
        summary: `${nickname} มีพลังชีวิตที่สมดุล มีศักยภาพสูงในการสร้างสิ่งที่ยั่งยืน`,
      },
      {
        id: "section-1",
        label: "พลังจักรวาล",
        heroTitle: "พลวัตพลังงานจักรวาล",
        sections: [
          {
            heading: "พลังงานที่กำลังเปลี่ยน",
            content: `${nickname} อยู่ในช่วงเปลี่ยนแปลงเชิงบวก สิ่งที่ทุ่มเทจะเริ่มเห็นผล`,
          },
          {
            heading: "จุดแข็งที่ซ่อนอยู่",
            content: `ความอดทนและความลึกซึ้งคือ superpower ของ${nickname}`,
          },
        ],
        summary: `${nickname} ได้รับพลังจากจักรวาลในช่วงนี้ ใช้อย่างมีสติ`,
      },
      {
        id: "section-2",
        label: "เส้นทางอนาคต",
        heroTitle: "ทิศทางชีวิตที่รออยู่",
        sections: [
          {
            heading: "ทิศทางชีวิต",
            content: `การตัดสินใจของ${nickname} ในตอนนี้มีน้ำหนักมาก เส้นทางสว่างขึ้นเมื่อกล้าออกจาก comfort zone`,
          },
          {
            heading: "สิ่งที่รออยู่ข้างหน้า",
            content: `จักรวาลเตรียมโอกาสไว้ให้${nickname} — เปิดใจและเชื่อมั่นในตัวเอง`,
          },
        ],
        summary: `อนาคตของ${nickname} สว่างเมื่อกล้าตัดสินใจ`,
      },
    ],
    highlights: [
      { label: "ดวงโดยรวม", value: "ดี" },
      { label: "พลังจักรวาล", value: "สนับสนุน" },
      { label: "คำแนะนำ", value: "เชื่อมั่น" },
    ],
    premium: {
      heroTitle: "คำทำนายเชิงลึก · ชีวิต 6 เดือน",
      teaser: `เปิดอ่านจุดเปลี่ยนสำคัญสำหรับ${nickname}`,
      sections: [],
      summary: "",
    },
    shareToken: null,
  };
}

const MAE = {
  navy: "#101827",
  gold: "#d5b16f",
  goldDark: "#806031",
  muted: "#9aa3b2",
  soft: "#c5cdd9",
} as const;

const GENDER_ICONS: Record<
  Gender,
  { src: string; alt: string; sizeClass: string }
> = {
  female: {
    src: "/images/icons/gender-female.webp?v=gold3d4",
    alt: "หญิง",
    sizeClass: "h-9 w-9",
  },
  male: {
    src: "/images/icons/gender-male.webp?v=gold3d4",
    alt: "ชาย",
    sizeClass: "h-9 w-9",
  },
  other: {
    src: "/images/icons/gender-other.webp?v=gold3d4",
    alt: "อื่นๆ",
    sizeClass: "h-9 w-9",
  },
};

function GenderSelectList({
  value,
  onSelect,
}: {
  value: Gender | "";
  onSelect: (gender: Gender) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {GENDER_OPTIONS.map((option, index) => {
        const meta = GENDER_ICONS[option.id];
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "wizard-anim-item flex w-full items-center gap-3.5 rounded-[20px] px-4 py-3.5 text-left outline-none transition duration-200",
              "active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
              selected
                ? "bg-[rgba(16,24,39,0.55)] shadow-[0_0_0_1.5px_rgba(213,177,111,0.75),0_8px_28px_rgba(0,0,0,0.28)]"
                : "bg-[rgba(16,24,39,0.38)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)] hover:bg-[rgba(16,24,39,0.48)]"
            )}
            style={
              {
                "--wizard-delay": `${140 + index * 85}ms`,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              } as React.CSSProperties
            }
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgba(213,177,111,0.1)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.28)]">
              <Image
                src={meta.src}
                alt={meta.alt}
                width={36}
                height={36}
                unoptimized
                className={cn(
                  "object-contain object-center drop-shadow-[0_2px_8px_rgba(213,177,111,0.28)]",
                  meta.sizeClass
                )}
              />
            </span>
            <span className="min-w-0 flex-1 text-[16px] font-semibold tracking-wide text-white">
              {option.label}
            </span>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition duration-200",
                selected
                  ? "bg-[#d5b16f] text-[#101827] shadow-[0_0_12px_rgba(213,177,111,0.45)]"
                  : "bg-transparent shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.35)]"
              )}
              aria-hidden
            >
              {selected ? (
                <Check className="h-4 w-4" strokeWidth={2.6} />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="wizard-step-header wizard-anim-item relative mb-5 text-center"
      style={{ "--wizard-delay": "40ms" } as React.CSSProperties}
    >
      <div
        className="wizard-step-zodiac pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="wizard-step-zodiac-spin h-full w-full">
          <ZodiacWheelBg className="h-full w-full" />
        </div>
      </div>
      <h1 className="wizard-step-title relative z-10 font-sans text-[1.9rem] font-bold leading-[1.25] tracking-tight">
        {title}
      </h1>
      <p
        className="wizard-keyboard-hide wizard-step-subtitle relative z-10 mx-auto mt-2.5 max-w-[18rem] text-[13.5px] leading-relaxed"
      >
        {subtitle}
      </p>
    </div>
  );
}

function WizardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "wizard-anim-item relative rounded-[22px] p-5 sm:p-6",
        className,
      )}
      style={{
        "--wizard-delay": "140ms",
        background: "rgba(16,24,39,0.48)",
        boxShadow:
          "inset 0 0 0 1px rgba(213,177,111,0.28), 0 10px 32px rgba(0,0,0,0.22)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      } as React.CSSProperties}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function FormContinueButton({
  label,
  disabled,
  onClick,
  className,
  delayMs = 420,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  delayMs?: number;
}) {
  return (
    <button
      type="button"
      className={cn(
        "mae-gold-cta wizard-anim-item group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-45",
        className,
      )}
      style={{ "--wizard-delay": `${delayMs}ms` } as React.CSSProperties}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="text-[16px] font-bold tracking-wide">{label}</span>
      <ChevronRight
        className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2.4}
      />
    </button>
  );
}

function PrivacyNote({ delayMs = 520 }: { delayMs?: number }) {
  return (
    <p
      className="wizard-keyboard-hide wizard-anim-item mt-4 flex items-center justify-center gap-1.5 text-[12px]"
      style={
        {
          "--wizard-delay": `${delayMs}ms`,
          color: MAE.muted,
        } as React.CSSProperties
      }
    >
      <span style={{ color: MAE.gold }} aria-hidden>
        ✦
      </span>
      ข้อมูลของคุณจะถูกเก็บเป็นความลับ เพื่อการทำนายเท่านั้น
    </p>
  );
}

export function ReadingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterPremium = searchParams.get("afterPremium") === "1";
  const nextPath = (() => {
    const raw = (searchParams.get("next") || "").trim();
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    return raw;
  })();

  const [step, setStep] = useState<Step>("gender");
  const [profile, setProfile] = useState<ProfileForm>({
    realName: "",
    nickname: "",
    birthDate: todayIso(),
    gender: "",
    birthTime: "",
    focus: "life",
  });
  const [result, setResult] = useState<FortuneApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [ready, setReady] = useState(false);
  const [autoStartFree, setAutoStartFree] = useState(false);

  useEffect(() => {
    // Premium onboard: collect only missing basics — never show analysis loading here.
    // Loading happens after birth time/place on /premium deepen form.
    if (afterPremium) {
      try {
        const saved = readFortuneProfile();
        if (hasBasicFortuneProfile(saved)) {
          router.replace(nextPath || "/premium");
          return;
        }
        if (saved) {
          setProfile({
            realName: saved.realName,
            nickname: saved.nickname,
            birthDate: saved.birthDate || todayIso(),
            gender: saved.gender,
            birthTime: saved.birthTime ?? "",
            focus: saved.focus ?? "life",
          });
          if (!saved.gender) setStep("gender");
          else if (!saved.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(saved.birthDate))
            setStep("birth");
          else setStep("name");
        } else {
          setStep("gender");
        }
      } catch {
        setStep("gender");
      }
      setReady(true);
      return;
    }

    const cached = readWizardCache();
    if (cached) {
      setProfile({
        ...cached.profile,
        birthTime: cached.profile.birthTime ?? "",
        focus: cached.profile.focus ?? "life",
      });
      setResult(cached.result);
      setStep("result");
    } else {
      try {
        const saved = readFortuneProfile();
        if (saved) {
          setProfile({
            realName: saved.realName,
            nickname: saved.nickname,
            birthDate: saved.birthDate || todayIso(),
            gender: saved.gender,
            birthTime: saved.birthTime ?? "",
            focus: saved.focus ?? "life",
          });
          if (hasFreeReadingBasics(saved)) {
            if (nextPath) {
              router.replace(nextPath);
              return;
            }
            // Already have gender/birth/nickname — skip re-entry, open free reading
            setStep("loading");
            setAutoStartFree(true);
          } else if (!saved.gender) {
            setStep("gender");
          } else if (
            !saved.birthDate ||
            !/^\d{4}-\d{2}-\d{2}$/.test(saved.birthDate)
          ) {
            setStep("birth");
          } else {
            setStep("name");
          }
        }
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, [afterPremium, router]);

  useEffect(() => {
    if (!ready || afterPremium || !autoStartFree) return;
    setAutoStartFree(false);
    void runFortune();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot after profile hydrate
  }, [ready, afterPremium, autoStartFree]);

  useEffect(() => {
    if (!ready) return;
    if (afterPremium) return;
    if (step === "result" && result) {
      writeWizardCache(profile, result);
    }
  }, [ready, step, result, profile, afterPremium]);

  // Keyboard inset / visualViewport handled in PhoneFrame.

  useEffect(() => {
    if (step !== "loading") return;

    setProgress(0);

    const started = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(96, (elapsed / MIN_LOADING_MS) * 100);
      setProgress(pct);
    }, 200);

    return () => window.clearInterval(tick);
  }, [step]);

  function finishPremiumOnboard() {
    if (!profile.gender) {
      setError("กรุณาเลือกเพศ");
      setStep("gender");
      return;
    }
    if (!profile.birthDate) {
      setError("กรุณาเลือกวันเกิด");
      setStep("birth");
      return;
    }
    if (!profile.realName.trim() || !profile.nickname.trim()) {
      setError("กรุณากรอกชื่อจริงและชื่อเล่น");
      setStep("name");
      return;
    }

    const existing = readFortuneProfile();
    writeFortuneProfile({
      realName: profile.realName,
      nickname: profile.nickname,
      birthDate: profile.birthDate,
      gender: profile.gender,
      birthTime: existing?.birthTime,
      birthPlace: existing?.birthPlace,
      focus: existing?.focus ?? profile.focus,
      deepenSkipped: existing?.deepenSkipped,
      profileLockedUntil: existing?.profileLockedUntil,
    });
    clearWizardCache();
    // Basics only — deepen (time/place) + loading happens on /premium
    router.replace(nextPath || "/premium");
  }

  async function runFortune() {
    if (!profile.gender) {
      setError("กรุณาเลือกเพศ");
      setStep("gender");
      return;
    }

    if (afterPremium) {
      // Never show FortuneLoading here — only after birth time/place are filled
      finishPremiumOnboard();
      return;
    }

    // มาจากเมนู → บันทึกแล้วไปหน้าฟีเจอร์นั้นเลย
    if (nextPath) {
      const existing = readFortuneProfile();
      writeFortuneProfile({
        realName: profile.realName,
        nickname: profile.nickname,
        birthDate: profile.birthDate,
        gender: profile.gender,
        birthTime: existing?.birthTime,
        birthPlace: existing?.birthPlace,
        focus: existing?.focus ?? profile.focus,
        deepenSkipped: existing?.deepenSkipped,
        profileLockedUntil: existing?.profileLockedUntil,
      });
      clearWizardCache();
      router.replace(nextPath);
      return;
    }

    setStep("loading");
    setError(null);
    setResult(null);
    setProgress(0);

    const startedAt = Date.now();
    const controller = new AbortController();
    const abortTimer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    await wait(80);

    let next: FortuneApiResult = buildLocalFallback(profile.nickname.trim() || "คุณ");

    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: READING_TYPE,
          realName: profile.realName,
          nickname: profile.nickname,
          birthDate: profile.birthDate,
          gender: profile.gender,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.tabs) && data.tabs.length > 0) {
        next = data;
      }
    } catch {
      // keep local fallback
    } finally {
      window.clearTimeout(abortTimer);
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_LOADING_MS) {
      await wait(MIN_LOADING_MS - elapsed);
    }

    setProgress(100);
    await wait(150);
    setResult(next);
    setStep("result");
  }

  function goToStep(next: Step, dir: "forward" | "back" = "forward") {
    if (next === step) return;
    setDirection(dir);
    setStep(next);
  }

  function goBack() {
    if (step === "gender") return;
    if (step === "birth") goToStep("gender", "back");
    else if (step === "name") goToStep("birth", "back");
  }

  const stepNumber = step === "gender" ? 1 : step === "birth" ? 2 : 3;

  if (!ready) {
    return <div className="relative h-full" aria-hidden />;
  }

  if (step === "result" && result) {
    return (
      <div className="relative h-full overflow-y-auto">
        <div className="relative z-10 min-h-full px-1.5 pb-10 pt-3">
          <FortuneResultView
            result={result}
            profile={{
              realName: profile.realName,
              nickname: profile.nickname,
              birthDate: profile.birthDate,
              gender: profile.gender,
            }}
            readingOption={readingOption}
            type={READING_TYPE}
            shareToken={result.shareToken}
            onRetry={() => {
              clearWizardCache();
              setResult(null);
              setError(null);
              setStep("gender");
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="relative h-full">
        <FortuneLoading
          nickname={profile.nickname}
          categoryTitle={readingOption.title}
          progress={progress}
        />
      </div>
    );
  }

  return (
    <div
      data-wizard-scroll
      className="mae-wizard relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white"
    >
      {/* Shared celestial plate — home/mae keep their own art */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url(/images/bg/mae-app-bg.webp?v=gate4)",
            backgroundPosition: "50% 30%",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(10,14,24,0.12) 0%,
                rgba(10,14,24,0.22) 40%,
                rgba(10,14,24,0.45) 70%,
                rgba(10,14,24,0.62) 100%)
            `,
          }}
        />
      </div>

      <div className="wizard-keyboard-compact relative z-10 flex min-h-full flex-col px-5 pb-5 pt-3">
        <div className="relative z-20 mb-2 grid grid-cols-[minmax(4.5rem,1fr)_auto_minmax(4.5rem,1fr)] items-center gap-2">
          {step === "gender" ? (
            <span aria-hidden className="justify-self-start" />
          ) : (
            <PageBackButton onClick={goBack} className="justify-self-start" />
          )}
          <div className="flex flex-col items-center justify-self-center" aria-hidden />
          <div className="justify-self-end text-right">
            <p
              className="text-[12px] font-semibold tabular-nums"
              style={{ color: MAE.gold }}
            >
              <span key={stepNumber} className="wizard-step-num">
                {stepNumber}
              </span>
              <span className="text-white/40">/3</span>
            </p>
            <div className="mt-1.5 flex justify-end gap-1">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1 rounded-full transition",
                    n <= stepNumber ? "w-5 bg-[#d5b16f]" : "w-5 bg-white/18"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[340px] flex-1 flex-col",
            step === "name"
              ? "wizard-name-stage justify-start pb-4 pt-6 sm:pt-10"
              : "justify-center py-6"
          )}
        >
          <div className="wizard-step-stage">
            <div
              key={`${step}-${direction}`}
              className={cn(
                "wizard-step-panel",
                direction === "forward" ? "wizard-step-forward" : "wizard-step-back",
              )}
            >
            {step === "gender" && (
              <>
                <StepHeader
                  title="เลือกเพศของคุณ"
                  subtitle="ช่วยปรับโทนคำทำนายให้เข้ากับคุณ"
                />

                <GenderSelectList
                  value={profile.gender}
                  onSelect={(gender) => setProfile((p) => ({ ...p, gender }))}
                />
                <FormContinueButton
                  label="ไปต่อ"
                  delayMs={420}
                  className="mt-6"
                  disabled={!profile.gender}
                  onClick={() => goToStep("birth", "forward")}
                />
                <PrivacyNote delayMs={520} />
              </>
            )}

            {step === "birth" && (
              <>
                <StepHeader
                  title="วันเดือนปีเกิด"
                  subtitle="ดวงเบื้องต้นคำนวณจากวันเกิดของคุณ"
                />

                <WizardShell>
                  <BirthDatePicker
                    tone="mae"
                    value={profile.birthDate}
                    onChange={(birthDate) =>
                      setProfile((p) => ({ ...p, birthDate }))
                    }
                  />

                  <p
                    className="mt-4 rounded-[14px] px-3 py-2.5 text-center text-[12px] leading-snug"
                    style={{
                      background: "rgba(213,177,111,0.1)",
                      boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                      color: "rgba(236,214,168,0.9)",
                    }}
                  >
                    เวลาเกิดและสถานที่เกิด จะขอตอนสมัครพรีเมียม
                    เพื่อวิเคราะห์เชิงลึกให้แม่นขึ้น
                  </p>
                </WizardShell>

                <FormContinueButton
                  label="ไปต่อ"
                  delayMs={280}
                  disabled={!profile.birthDate}
                  onClick={() => goToStep("name", "forward")}
                />
                <PrivacyNote delayMs={380} />
              </>
            )}

            {step === "name" && (
              <>
                <StepHeader
                  title="ชื่อของคุณ"
                  subtitle="ใช้เรียกคุณในคำทำนายเบื้องต้น"
                />

                <WizardShell>
                  <div className="flex flex-col gap-4">
                    <label className="block">
                      <span
                        className="mb-2 block text-[13px] font-medium tracking-wide"
                        style={{ color: "rgba(236,214,168,0.88)" }}
                      >
                        ชื่อจริง
                      </span>
                      <input
                        type="text"
                        value={profile.realName}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, realName: e.target.value }))
                        }
                        onFocus={scrollFieldIntoView}
                        placeholder="ชื่อจริงของคุณ"
                        className="name-step-input mae-wizard-input"
                        autoComplete="name"
                        enterKeyHint="next"
                      />
                    </label>

                    <label className="block">
                      <span
                        className="mb-2 block text-[13px] font-medium tracking-wide"
                        style={{ color: "rgba(236,214,168,0.88)" }}
                      >
                        ชื่อเล่น
                      </span>
                      <input
                        type="text"
                        value={profile.nickname}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, nickname: e.target.value }))
                        }
                        onFocus={scrollFieldIntoView}
                        placeholder="ชื่อที่อยากให้เรียก"
                        className="name-step-input mae-wizard-input"
                        autoComplete="nickname"
                        enterKeyHint="done"
                      />
                    </label>

                    {error ? (
                      <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
                        {error}
                      </div>
                    ) : null}
                  </div>
                </WizardShell>

                <FormContinueButton
                  label={
                    afterPremium ? "ไปกรอกข้อมูลเชิงลึก" : "เปิดดูดวงเบื้องต้น"
                  }
                  delayMs={280}
                  disabled={!profile.realName.trim() || !profile.nickname.trim()}
                  onClick={() => void runFortune()}
                />
                <PrivacyNote delayMs={380} />
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
