"use client";

import { useEffect, useState, type CSSProperties, type FocusEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { BirthTimePicker } from "@/components/fortune/birth-time-picker";
import { GENDER_OPTIONS, type Gender } from "@/components/ui/sacred-form";
import { PageBackButton } from "@/components/ui/page-back-button";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaePageLoading } from "@/components/layout/mae-page-loading";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import {
  WIZARD_CACHE_KEY,
  writeFortuneProfile,
  readFortuneProfile,
  hasFreeReadingBasics,
} from "@/lib/fortune/profile-storage";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { readIntake } from "@/lib/fortune/intake-storage";
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

  window.setTimeout(align, 80);
  window.setTimeout(align, 280);
  window.setTimeout(align, 480);
}

type Step = "identity" | "birth" | "place";
type StepDir = "forward" | "back";

const STEP_ORDER: Step[] = ["identity", "birth", "place"];

function delayStyle(ms: number): CSSProperties {
  return { "--wizard-delay": `${ms}ms` } as CSSProperties;
}

const STEP_META: Record<
  Step,
  { eyebrow: string; title: string; subtitle: string }
> = {
  identity: {
    eyebrow: "ขั้นที่ 1",
    title: "ให้แม่รู้จักคุณ",
    subtitle: "บอกชื่อที่อยากให้เรียก แล้วเลือกเพศ",
  },
  birth: {
    eyebrow: "ขั้นที่ 2 · พรีเมียมลึก",
    title: "วันและเวลาเกิด",
    subtitle: "เวลาเกิดใช้คำนวณเสาชั่วโมง — ถ้าไม่ทราบแม่จะประมาณเที่ยงวัน",
  },
  place: {
    eyebrow: "ขั้นที่ 3 · พรีเมียมลึก",
    title: "ที่เกิดและเรื่องที่อยากดู",
    subtitle: "จังหวัด/เมืองเกิดช่วยจูน timezone · เลือก 1 เรื่องที่อยากโฟกัส",
  },
};

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
  genderNote: string;
  birthTime: string;
  birthPlace: string;
  focus: FortuneFocus;
}

function clearWizardCache() {
  try {
    sessionStorage.removeItem(WIZARD_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

const MAE = {
  gold: "#e8d19a",
  muted: "rgba(186, 204, 230, 0.78)",
} as const;

const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const FOCUS_CHOICES: {
  id: FortuneFocus;
  title: string;
  blurb: string;
}[] = [
  {
    id: "life",
    title: "ภาพรวมชีวิต",
    blurb: "จังหวะและทิศทางช่วงนี้",
  },
  {
    id: "work",
    title: "การงาน",
    blurb: "หน้าที่ โอกาส การตัดสินใจ",
  },
  {
    id: "money",
    title: "การเงิน",
    blurb: "รายรับรายจ่าย จังหวะลงทุน",
  },
  {
    id: "love",
    title: "ความรัก",
    blurb: "ความสัมพันธ์ ความเข้าใจ",
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[16px] font-semibold tracking-wide text-[#e8d19a]/92">
      {children}
    </span>
  );
}

function TopicSelectGrid({
  value,
  onSelect,
}: {
  value: FortuneFocus;
  onSelect: (focus: FortuneFocus) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FOCUS_CHOICES.map((choice) => {
        const selected = value === choice.id;
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onSelect(choice.id)}
            className={cn(
              "relative flex min-h-[7rem] flex-col items-center justify-center rounded-[20px] px-3 py-4 text-center outline-none transition duration-200",
              "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#e8d19a]/45",
            )}
            style={{
              background: selected
                ? "rgba(18, 28, 48, 0.9)"
                : "rgba(18, 28, 48, 0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: selected
                ? "inset 0 0 0 1.5px rgba(232,209,154,0.7), 0 12px 28px rgba(0,0,0,0.22)"
                : "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            {selected ? (
              <span className="absolute right-2.5 top-2.5">
                <Check
                  className="h-4 w-4 text-[#e8d19a]"
                  strokeWidth={2.8}
                  aria-hidden
                />
              </span>
            ) : null}
            <span className="block text-[17px] font-bold tracking-wide text-white">
              {choice.title}
            </span>
            <span
              className="mt-1.5 block text-[16px] font-medium leading-snug"
              style={{ color: MAE.muted }}
            >
              {choice.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GenderSelectRow({
  value,
  onSelect,
}: {
  value: Gender | "";
  onSelect: (gender: Gender) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {GENDER_OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="flex min-h-[3.1rem] items-center justify-center rounded-full px-2 text-center outline-none transition duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#e8d19a]/45"
            style={{
              background: selected
                ? "rgba(18, 28, 48, 0.92)"
                : "rgba(18, 28, 48, 0.5)",
              boxShadow: selected
                ? "inset 0 0 0 1.5px rgba(232,209,154,0.7)"
                : "inset 0 0 0 1px rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className={cn(
                "text-[16px] font-semibold tracking-wide",
                selected ? "text-[#e8d19a]" : "text-white",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function defaultAdultBirthIso() {
  const d = new Date();
  const y = d.getFullYear() - 28;
  return `${y}-01-01`;
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

  const [step, setStep] = useState<Step>("identity");
  const [dir, setDir] = useState<StepDir>("forward");
  const [profile, setProfile] = useState<ProfileForm>({
    realName: "",
    nickname: "",
    birthDate: defaultAdultBirthIso(),
    gender: "",
    genderNote: "",
    birthTime: "",
    birthPlace: "",
    focus: "life",
  });
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydrate = (saved: ReturnType<typeof readFortuneProfile>) => {
      if (!saved) return;
      const allowed = new Set(FOCUS_CHOICES.map((c) => c.id));
      setProfile({
        realName: saved.realName,
        nickname: saved.nickname,
        birthDate: saved.birthDate || defaultAdultBirthIso(),
        gender: saved.gender,
        genderNote: saved.genderNote ?? "",
        birthTime: saved.birthTime ?? "",
        birthPlace: saved.birthPlace ?? "",
        focus: allowed.has(saved.focus as FortuneFocus)
          ? (saved.focus as FortuneFocus)
          : "life",
      });
    };

    const firstMissing = (saved: ReturnType<typeof readFortuneProfile>): Step => {
      if (!saved?.nickname?.trim() || !saved.gender) return "identity";
      if (!saved.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(saved.birthDate))
        return "birth";
      return "place";
    };

    if (afterPremium) {
      try {
        const saved = readFortuneProfile();
        const intake = readIntake();
        // หลังจ่าย — อยู่ฟอร์มใหม่เสมอ (ไม่เด้ง /home หรือ /premium)
        if (saved) {
          hydrate(saved);
          // เติมชื่อ/เรื่องจากฟอร์มสั้นก่อนซื้อ ถ้ายังไม่มี
          if (intake) {
            setProfile((p) => ({
              ...p,
              nickname: p.nickname.trim() || intake.nickname,
              realName: p.realName.trim() || intake.nickname,
              focus: p.focus || intake.focus,
            }));
          }
          setStep(firstMissing(saved));
        } else if (intake) {
          setProfile((p) => ({
            ...p,
            nickname: intake.nickname,
            realName: intake.nickname,
            focus: intake.focus,
          }));
          setStep("identity");
        } else {
          setStep("identity");
        }
      } catch {
        setStep("identity");
      }
      setReady(true);
      return;
    }

    clearWizardCache();
    try {
      const saved = readFortuneProfile();
      if (saved) {
        hydrate(saved);
        if (hasFreeReadingBasics(saved)) {
          startMaeNavigation();
          router.replace(nextPath || "/home");
          return;
        }
        setStep(firstMissing(saved));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [afterPremium, router, nextPath]);

  function persistAndFinish() {
    const nickname = profile.nickname.trim();
    const realName = profile.realName.trim() || nickname;
    if (!nickname) {
      goToStep("identity");
      setError("กรุณากรอกชื่อ");
      return;
    }
    if (!profile.gender) {
      goToStep("identity");
      setError("กรุณาเลือกเพศ");
      return;
    }
    if (profile.gender === "other" && !profile.genderNote.trim()) {
      goToStep("identity");
      setError("กรุณาระบุเพศเพิ่มเติม");
      return;
    }
    if (!profile.birthDate) {
      goToStep("birth");
      setError("กรุณาเลือกวันเกิด");
      return;
    }
    if (!profile.focus) {
      goToStep("place");
      setError("กรุณาเลือกเรื่องที่อยากดู");
      return;
    }

    const existing = readFortuneProfile();
    writeFortuneProfile({
      realName,
      nickname,
      birthDate: profile.birthDate,
      gender: profile.gender,
      genderNote:
        profile.gender === "other" ? profile.genderNote.trim() : undefined,
      birthTime: profile.birthTime.trim() || existing?.birthTime,
      birthPlace: profile.birthPlace.trim() || existing?.birthPlace,
      focus: profile.focus ?? existing?.focus ?? "life",
      deepenSkipped: existing?.deepenSkipped,
      profileLockedUntil: existing?.profileLockedUntil,
    });
    clearWizardCache();
    startMaeNavigation();
    router.replace(nextPath || "/home");
  }

  function goToStep(next: Step) {
    if (next === step) return;
    const nextIdx = STEP_ORDER.indexOf(next);
    const curIdx = STEP_ORDER.indexOf(step);
    setDir(nextIdx >= curIdx ? "forward" : "back");
    setError(null);
    setStep(next);
  }

  function goNext() {
    const idx = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[idx + 1];
    if (next) goToStep(next);
    else void persistAndFinish();
  }

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    const prev = STEP_ORDER[idx - 1];
    if (prev) goToStep(prev);
  }

  if (!ready) {
    return (
      <MaePageLoading
        label="กำลังเปิด…"
        hint="กำลังเช็กข้อมูลก่อนเริ่มกรอก"
      />
    );
  }

  const canContinue =
    step === "identity"
      ? Boolean(
          profile.nickname.trim() &&
            profile.gender &&
            (profile.gender !== "other" || profile.genderNote.trim()),
        )
      : step === "birth"
        ? Boolean(profile.birthDate)
        : Boolean(profile.focus);

  const stepNumber = STEP_ORDER.indexOf(step) + 1;
  const meta = STEP_META[step];
  const ctaLabel =
    step === "place"
      ? afterPremium
        ? "วิเคราะห์ดวง"
        : nextPath
          ? "ดูดวงเลย"
          : "เข้าหน้าหลัก"
      : "ไปต่อ";

  return (
    <div
      data-wizard-scroll
      className="mae-wizard relative mx-auto flex h-full min-h-full w-full max-w-[480px] flex-col overflow-hidden text-white"
      style={{ background: "transparent" }}
    >
      <MaePageBackground />

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {/* Top bar */}
        <div
          className="wizard-anim-item flex shrink-0 items-center justify-between gap-3"
          style={delayStyle(20)}
        >
          {step === "identity" ? (
            <span className="text-[15px] font-semibold tracking-[0.14em] text-[#e8d19a]/85">
              กรอกข้อมูล
            </span>
          ) : (
            <PageBackButton onClick={goBack} />
          )}
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-semibold tabular-nums text-[#e8d19a]">
              <span key={stepNumber} className="wizard-step-num inline-block">
                {stepNumber}
              </span>
              <span className="text-white/35">/3</span>
            </p>
            <div className="mt-1.5 flex justify-end gap-1">
              {STEP_ORDER.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i < stepNumber ? "w-5 bg-[#d5b16f]" : "w-5 bg-white/18",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          key={step}
          className={cn(
            "wizard-step-panel flex min-h-0 flex-1 flex-col",
            dir === "forward" ? "wizard-step-forward" : "wizard-step-back",
          )}
        >
          {/* Header */}
          <div
            className="wizard-anim-item mt-5 shrink-0 text-center"
            style={delayStyle(60)}
          >
            <p className="text-[15px] font-semibold tracking-[0.16em] text-[#e8d19a]">
              {meta.eyebrow}
            </p>
            <h1
              className="mt-2.5 overflow-visible py-1 text-[clamp(1.85rem,6.5vw,2.05rem)] font-bold leading-[1.35]"
              style={TITLE_GOLD}
            >
              {meta.title}
            </h1>
            <p
              className="mx-auto mt-3 max-w-[20rem] text-[16px] font-medium leading-relaxed"
              style={{ color: MAE.muted }}
            >
              {meta.subtitle}
            </p>
          </div>

          {/* Body */}
          <div
            className="wizard-anim-item mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain"
            style={delayStyle(140)}
          >
            {step === "identity" ? (
              <div className="space-y-6">
                <label className="block">
                  <FieldLabel>ชื่อที่อยากให้แม่เรียก</FieldLabel>
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => {
                      const nickname = e.target.value;
                      setProfile((p) => ({
                        ...p,
                        nickname,
                        realName: p.realName || nickname,
                      }));
                    }}
                    onFocus={scrollFieldIntoView}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canContinue) {
                        e.preventDefault();
                        goNext();
                      }
                    }}
                    placeholder="เช่น น้องมั่งมี"
                    className="mae-wizard-input h-[3.35rem] w-full rounded-full px-5 text-[17px] font-medium outline-none"
                    autoComplete="nickname"
                    enterKeyHint="next"
                    autoFocus
                  />
                </label>

                <div>
                  <FieldLabel>เพศ</FieldLabel>
                  <GenderSelectRow
                    value={profile.gender}
                    onSelect={(gender) =>
                      setProfile((p) => ({
                        ...p,
                        gender,
                        genderNote: gender === "other" ? p.genderNote : "",
                      }))
                    }
                  />
                  {profile.gender === "other" ? (
                    <label className="mt-3 block">
                      <span className="mb-2 block text-[16px] font-semibold tracking-wide text-[#e8d19a]/92">
                        ระบุเพิ่มเติม
                      </span>
                      <input
                        type="text"
                        value={profile.genderNote}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            genderNote: e.target.value,
                          }))
                        }
                        onFocus={scrollFieldIntoView}
                        placeholder="เช่น นอนไบนารี / LGBTQ+"
                        className="mae-wizard-input h-[3.35rem] w-full rounded-full px-5 text-[17px] font-medium outline-none"
                        autoComplete="off"
                        maxLength={80}
                      />
                    </label>
                  ) : null}
                </div>

                {error ? (
                  <p className="text-center text-[16px] text-rose-300">{error}</p>
                ) : null}
              </div>
            ) : null}

            {step === "birth" ? (
              <div className="space-y-5 pb-1">
                <div>
                  <BirthDatePicker
                    value={profile.birthDate}
                    onChange={(birthDate) =>
                      setProfile((p) => ({ ...p, birthDate }))
                    }
                  />
                </div>

                <div>
                  <BirthTimePicker
                    value={profile.birthTime}
                    onChange={(birthTime) =>
                      setProfile((p) => ({ ...p, birthTime }))
                    }
                  />
                  <p
                    className="mt-2.5 text-[14.5px] font-medium leading-snug"
                    style={{ color: MAE.muted }}
                  >
                    {profile.birthTime.trim()
                      ? "มีเวลาเกิดแล้ว — แม่จะอ่านเสาชั่วโมงได้ละเอียด"
                      : "ยังไม่มีเวลา · ระบบจะใช้ 12:00 เป็นค่าประมาณ (ความละเอียดลดลง)"}
                  </p>
                </div>
              </div>
            ) : null}

            {step === "place" ? (
              <div className="space-y-6 pb-2">
                <label className="block">
                  <FieldLabel>สถานที่เกิด</FieldLabel>
                  <input
                    type="text"
                    value={profile.birthPlace}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, birthPlace: e.target.value }))
                    }
                    onFocus={scrollFieldIntoView}
                    placeholder="เช่น กรุงเทพฯ / เชียงใหม่ / ญี่ปุ่น"
                    className="mae-wizard-input h-[3.35rem] w-full rounded-full px-5 text-[17px] font-medium outline-none"
                    autoComplete="address-level1"
                    enterKeyHint="done"
                  />
                  <span
                    className="mt-2 block text-[15px] font-medium leading-snug"
                    style={{ color: MAE.muted }}
                  >
                    {profile.birthPlace.trim().length >= 2
                      ? "ใช้จูน timezone และโทนฤกษ์ตามภูมิภาค"
                      : "แนะนำให้ใส่จังหวัดหรือเมืองเกิด — ข้ามได้แต่ดวงจะหยาบกว่า"}
                  </span>
                </label>

                <div>
                  <FieldLabel>อยากให้แม่ดูเรื่องอะไร</FieldLabel>
                  <TopicSelectGrid
                    value={profile.focus}
                    onSelect={(focus) => setProfile((p) => ({ ...p, focus }))}
                  />
                </div>

                {error ? (
                  <p className="text-center text-[16px] text-rose-300">{error}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* CTA */}
          <div
            className="wizard-anim-item mt-4 shrink-0 pt-1"
            style={delayStyle(220)}
          >
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="group relative flex h-[3.35rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full outline-none transition active:scale-[0.98] disabled:opacity-45"
              style={{
                color: "#1a1408",
                background: GOLD_BTN,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.28), 0 6px 16px rgba(143, 110, 56, 0.28)",
              }}
            >
              <span className="text-[17px] font-bold tracking-wide">
                {ctaLabel}
              </span>
              <ChevronRight
                className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.6}
              />
            </button>

            <p
              className="mt-3 text-center text-[16px] font-medium leading-snug"
              style={{ color: MAE.muted }}
            >
              ข้อมูลของคุณเก็บเป็นความลับ เพื่อการทำนายเท่านั้น
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
