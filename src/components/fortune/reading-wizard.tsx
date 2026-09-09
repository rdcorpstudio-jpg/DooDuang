"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import {
  GENDER_OPTIONS,
  type Gender,
} from "@/components/ui/sacred-form";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";
import {
  WIZARD_CACHE_KEY,
  writeFortuneProfile,
  readFortuneProfile,
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
      // Free path must not wipe premium deepen fields
      birthTime: existing?.birthTime,
      birthPlace: existing?.birthPlace,
      focus: existing?.focus,
      deepenSkipped: existing?.deepenSkipped,
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

const GENDER_ICONS: Record<Gender, { src: string; alt: string; tone: "rose" | "violet" | "gold" }> = {
  female: {
    src: "/images/icons/gender-female.png",
    alt: "หญิง",
    tone: "rose",
  },
  male: {
    src: "/images/icons/gender-male.png",
    alt: "ชาย",
    tone: "violet",
  },
  other: {
    src: "/images/icons/gender-other.png",
    alt: "อื่นๆ",
    tone: "gold",
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
    <div className="space-y-2.5">
      {GENDER_OPTIONS.map((option, index) => {
        const meta = GENDER_ICONS[option.id];
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "wizard-anim-item fortune-glass flex w-full items-center gap-3.5 rounded-[18px] px-4 py-3.5 text-left outline-none transition",
              "active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4",
              selected && "ring-2 ring-[#9B7FE8]/55"
            )}
            style={
              {
                "--wizard-delay": `${140 + index * 85}ms`,
              } as React.CSSProperties
            }
          >
            <span
              className={cn(
                "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full",
                meta.tone === "gold"
                  ? "bg-[#F4BC52]/18 ring-1 ring-[#F4BC52]/35"
                  : meta.tone === "rose"
                    ? "bg-[#F2A8C8]/22 ring-1 ring-[#E89AB8]/35"
                    : "bg-[#B9A4F0]/28 ring-1 ring-[#9B7FE8]/35"
              )}
            >
              <Image
                src={meta.src}
                alt={meta.alt}
                width={40}
                height={40}
                unoptimized
                className="h-9 w-9 object-contain drop-shadow-[0_2px_8px_rgba(123,95,212,0.35)]"
              />
            </span>
            <span className="min-w-0 flex-1 text-[16px] font-semibold text-[#2C2458]">
              {option.label}
            </span>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                selected
                  ? "bg-[#7B5FD4] text-white"
                  : "bg-white/70 ring-1 ring-[#7B6BB0]/25"
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
  step,
}: {
  title: string;
  subtitle: string;
  step: number;
}) {
  return (
    <div
      className="wizard-step-header wizard-anim-item relative mb-5 text-center"
      style={{ "--wizard-delay": "40ms" } as React.CSSProperties}
    >
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#B9A4F0]/28 px-3.5 py-1.5 ring-1 ring-[#9B7FE8]/3">
        <FortuneIcon name="sparkle" size={12} />
        <span className="text-[12px] font-semibold text-[#5B45B8]">
          ขั้นตอนที่ {step}
        </span>
        <FortuneIcon name="sparkle" size={12} />
      </div>
      <h1 className="result-hero-copy text-[1.85rem] font-bold leading-tight tracking-tight text-[#2C2458]">
        {title}
      </h1>
      <p className="result-hero-copy wizard-keyboard-hide mt-2 text-[13px] leading-relaxed text-[#5E5688]">
        {subtitle}
      </p>
    </div>
  );
}

function WizardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "wizard-anim-item fortune-glass relative rounded-[22px] p-5 sm:p-6",
        className,
      )}
      style={{ "--wizard-delay": "140ms" } as React.CSSProperties}
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
        "wizard-anim-item group relative mt-6 flex w-full items-center justify-between overflow-hidden rounded-full px-6 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45 disabled:opacity-45",
        className,
      )}
      style={
        {
          "--wizard-delay": `${delayMs}ms`,
          background:
            "linear-gradient(90deg, #7B5FD4 0%, #9B7FE8 48%, #C4B0F5 100%)",
          boxShadow: "0 10px 28px rgba(123,95,212,0.32)",
        } as React.CSSProperties
      }
      disabled={disabled}
      onClick={onClick}
    >
      <span className="text-[16px] font-bold tracking-wide text-white">
        {label}
      </span>
      <ChevronRight
        className="h-[18px] w-[18px] text-white transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2.4}
      />
    </button>
  );
}

function PrivacyNote({ delayMs = 520 }: { delayMs?: number }) {
  return (
    <p
      className="wizard-keyboard-hide wizard-anim-item mt-4 flex items-center justify-center gap-1.5 text-[12px] text-[#6B6490]"
      style={{ "--wizard-delay": `${delayMs}ms` } as React.CSSProperties}
    >
      <FortuneIcon name="lock" size={16} />
      ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
    </p>
  );
}

export function ReadingWizard() {
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

  useEffect(() => {
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
            birthDate: saved.birthDate,
            gender: saved.gender,
            birthTime: saved.birthTime ?? "",
            focus: saved.focus ?? "life",
          });
        }
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (step === "result" && result) {
      writeWizardCache(profile, result);
    }
  }, [ready, step, result, profile]);

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

  async function runFortune() {
    if (!profile.gender) {
      setError("กรุณาเลือกเพศ");
      setStep("gender");
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
  const backHref = step === "gender" ? "/" : undefined;

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
      className="relative h-full overflow-y-auto overscroll-contain sky-copy"
    >
      <div className="wizard-form-aura pointer-events-none absolute inset-0" aria-hidden>
        <div className="wizard-form-sky wizard-form-sky-light" />
        <div className="wizard-form-wheel wizard-form-wheel-light">
          <AstroHeroOrb watermark />
        </div>
      </div>

      <div className="wizard-keyboard-compact relative z-10 flex min-h-full flex-col px-5 pb-8 pt-4">
        <div className="relative z-20 mb-3 grid grid-cols-[minmax(4.5rem,1fr)_auto_minmax(4.5rem,1fr)] items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] transition-opacity active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              กลับ
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] transition-opacity active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              กลับ
            </button>
          )}
          <div className="flex flex-col items-center justify-self-center">
            <FortuneIcon name="moon" size={16} className="-mb-0.5" />
            <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">
              DOODUANG
            </p>
          </div>
          <div className="justify-self-end text-right">
            <p className="text-[13px] font-semibold tabular-nums text-[#5B45B8]">
              <span key={stepNumber} className="wizard-step-num">
                {stepNumber}
              </span>
              <span className="text-[#9A90C0]">/3</span>
            </p>
            <div className="mt-1.5 flex justify-end gap-1">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "h-1 w-5 rounded-full transition",
                    n <= stepNumber ? "bg-[#7B5FD4]" : "bg-white/55"
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
              ? "wizard-name-stage justify-start pb-4 pt-[min(20vh,148px)]"
              : "justify-center py-4"
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
                  step={1}
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
                  disabled={!profile.gender}
                  onClick={() => goToStep("birth", "forward")}
                />
                <PrivacyNote delayMs={520} />
              </>
            )}

            {step === "birth" && (
              <>
                <StepHeader
                  step={2}
                  title="วันเดือนปีเกิด"
                  subtitle="ดวงเบื้องต้นคำนวณจากวันเกิดของคุณ"
                />

                <WizardShell>
                  <div className="mb-4 flex items-center justify-center gap-2 text-[#6B6490]">
                    <FortuneIcon name="calendar" size={18} />
                    <span className="text-[12px] tracking-[0.08em]">เลื่อนเพื่อเลือก</span>
                  </div>

                  <BirthDatePicker
                    value={profile.birthDate}
                    onChange={(birthDate) =>
                      setProfile((p) => ({ ...p, birthDate }))
                    }
                  />

                  <p className="mt-4 rounded-[14px] bg-[#F3EEFF]/80 px-3 py-2.5 text-center text-[12px] leading-snug text-[#6B6490]">
                    เวลาเกิดและสถานที่เกิด จะขอตอนสมัครพรีเมียม
                    เพื่อวิเคราะห์เชิงลึกให้แม่นขึ้น
                  </p>

                  <FormContinueButton
                    label="ไปต่อ"
                    delayMs={280}
                    disabled={!profile.birthDate}
                    onClick={() => goToStep("name", "forward")}
                  />
                </WizardShell>
                <PrivacyNote delayMs={380} />
              </>
            )}

            {step === "name" && (
              <>
                <StepHeader
                  step={3}
                  title="ชื่อของคุณ"
                  subtitle="ใช้เรียกคุณในคำทำนายเบื้องต้น"
                />

                <WizardShell>
                  <div className="flex flex-col gap-4">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium tracking-wide text-[#5E5688]">
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
                        className="name-step-input"
                        autoComplete="name"
                        enterKeyHint="next"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium tracking-wide text-[#5E5688]">
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
                        className="name-step-input"
                        autoComplete="nickname"
                        enterKeyHint="done"
                      />
                    </label>

                    {error ? (
                      <div className="rounded-xl border border-rose-400/30 bg-rose-50 px-4 py-3 text-[14px] text-rose-600">
                        {error}
                      </div>
                    ) : null}

                    <FormContinueButton
                      label="เปิดดูดวงเบื้องต้น"
                      delayMs={280}
                      className="mt-2"
                      disabled={!profile.realName.trim() || !profile.nickname.trim()}
                      onClick={() => void runFortune()}
                    />
                  </div>
                </WizardShell>
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
