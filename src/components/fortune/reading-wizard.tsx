"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { AstroHeroOrb } from "@/components/home/astro-hero-orb";
import { SoftSelectCard, GenderMoonIcon, GenderSunIcon, GenderStarIcon } from "@/components/ui/soft-select-card";
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
import { cn } from "@/lib/utils";

function scrollFieldIntoView(event: FocusEvent<HTMLInputElement>) {
  const el = event.currentTarget;
  window.setTimeout(() => {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }, 120);
}
type FortuneApiResult = ExtendedFortuneResult & { shareToken?: string | null };
type Step = "gender" | "birth" | "name" | "loading" | "result";

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
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
    writeFortuneProfile({
      realName: profile.realName,
      nickname: profile.nickname,
      birthDate: profile.birthDate,
      gender: profile.gender,
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

const GENDER_META: Record<
  Gender,
  { icon: React.ReactNode; tone: "rose" | "sky" | "violet" | "gold" }
> = {
  female: {
    icon: <GenderMoonIcon />,
    tone: "gold",
  },
  male: {
    icon: <GenderSunIcon />,
    tone: "violet",
  },
  other: {
    icon: <GenderStarIcon />,
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
        const meta = GENDER_META[option.id];
        return (
          <SoftSelectCard
            key={option.id}
            label="เพศ"
            title={option.label}
            iconNode={meta.icon}
            orbTone={meta.tone}
            selected={value === option.id}
            onClick={() => onSelect(option.id)}
            skipReveal
            className="wizard-anim-item"
            style={
              {
                "--wizard-delay": `${140 + index * 85}ms`,
              } as React.CSSProperties
            }
          />
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
      className="wizard-step-header wizard-anim-item relative mb-7 text-center"
      style={{ "--wizard-delay": "40ms" } as React.CSSProperties}
    >
      <div className="wizard-step-pill mb-3.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5">
        <span className="wizard-step-pill-dot" />
        <span className="text-[11px] font-medium tracking-[0.18em] text-[#F4BC52]/95">
          STEP {String(step).padStart(2, "0")}
        </span>
      </div>
      <h1 className="font-sacred text-[1.85rem] leading-tight tracking-wide text-white drop-shadow-[0_0_24px_rgba(232,197,71,0.22)]">
        {title}
      </h1>
      <p className="mt-2 text-[13px] font-light leading-relaxed tracking-wide text-white/50">
        {subtitle}
      </p>
    </div>
  );
}

function WizardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "wizard-form-card wizard-anim-item relative rounded-[24px] p-5 sm:p-6",
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
        "wizard-anim-item",
        className ?? "name-step-cta group relative mt-6 block w-full",
      )}
      style={{ "--wizard-delay": `${delayMs}ms` } as React.CSSProperties}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="intro-cta-glow opacity-80" aria-hidden />
      <span className="name-step-cta-surface">
        <span className="intro-cta-shine" aria-hidden />
        <span className="name-step-cta-label relative z-[1]">{label}</span>
        <ChevronRight
          className="relative z-[1] h-[17px] w-[17px] text-[#1a1440] transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2.4}
        />
      </span>
    </button>
  );
}

function PrivacyNote({ delayMs = 520 }: { delayMs?: number }) {
  return (
    <p
      className="wizard-anim-item mt-5 flex items-center justify-center gap-1.5 text-[11px] tracking-wide text-white/35"
      style={{ "--wizard-delay": `${delayMs}ms` } as React.CSSProperties}
    >
      <Lock className="h-3 w-3 text-[#F4BC52]/70" strokeWidth={1.8} />
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
  });
  const [result, setResult] = useState<FortuneApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cached = readWizardCache();
    if (cached) {
      setProfile(cached.profile);
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

  // Keep form above the iOS/Android keyboard inside the fixed phone frame.
  useEffect(() => {
    if (step === "loading" || step === "result") return;
    const root = document.documentElement;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--wizard-keyboard-inset", `${inset}px`);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--wizard-keyboard-inset");
    };
  }, [step]);

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
        body: JSON.stringify({ type: READING_TYPE, ...profile }),
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
        <div className="relative z-10 min-h-full px-5 pb-10 pt-4">
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
    <div className="relative h-full overflow-y-auto overscroll-contain">
      <div className="wizard-form-aura pointer-events-none absolute inset-0" aria-hidden>
        <div className="wizard-form-sky" />
        <div className="wizard-form-wheel">
          <AstroHeroOrb watermark />
        </div>
        <div key={`bloom-${step}`} className="wizard-form-bloom wizard-bloom-pulse" />
      </div>

      <div
        className="relative z-10 flex min-h-full flex-col px-5 pt-4"
        style={{
          paddingBottom:
            "max(2rem, calc(1.25rem + var(--wizard-keyboard-inset, 0px)))",
        }}
      >
        <div className="relative z-20 mb-2 grid grid-cols-[minmax(4.5rem,1fr)_auto_minmax(4.5rem,1fr)] items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#F4BC52]/75 transition-opacity active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              กลับ
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#F4BC52]/75 transition-opacity active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              กลับ
            </button>
          )}
          <p className="text-center text-[11px] font-medium tracking-[0.42em] text-[#F4BC52]/85">
            DOODUANG
          </p>
          <p className="justify-self-end text-[13px] tabular-nums text-white/45">
            <span key={stepNumber} className="wizard-step-num text-[#F4BC52]">
              {stepNumber}
            </span>
            <span className="text-white/30"> / 3</span>
          </p>
        </div>

        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[340px] flex-1 flex-col py-4",
            step === "name" ? "justify-start" : "justify-center",
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
                  subtitle="ใช้คำนวณจังหวะชีวิตของคุณ"
                />

                <WizardShell>
                  <div className="mb-4 flex items-center justify-center gap-2 text-white/50">
                    <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
                    <span className="text-[12px] tracking-[0.08em]">เลื่อนเพื่อเลือก</span>
                  </div>

                  <BirthDatePicker
                    value={profile.birthDate}
                    onChange={(birthDate) =>
                      setProfile((p) => ({ ...p, birthDate }))
                    }
                  />

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
                  subtitle="ใช้สำหรับเรียกคุณในคำทำนาย"
                />

                <WizardShell>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium tracking-wide text-white/80">
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
                      <span className="mb-2 block text-[13px] font-medium tracking-wide text-white/80">
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
                      <div className="rounded-xl border border-rose-400/25 bg-rose-500/12 px-4 py-3 text-[14px] text-rose-200">
                        {error}
                      </div>
                    ) : null}

                    <FormContinueButton
                      label="เปิดดูดวง"
                      delayMs={280}
                      className="name-step-cta group relative mt-2 block w-full"
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
