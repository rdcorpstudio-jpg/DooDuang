"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortuneLoading, FORTUNE_LOADING_DURATION_MS } from "@/components/fortune/fortune-loading";
import { PageBackButton } from "@/components/ui/page-back-button";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { AnimatedPage } from "@/components/ui/reveal";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import {
  readFortuneProfile,
  writeFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { Check, ChevronRight } from "lucide-react";
import {
  GENDER_OPTIONS,
  type Gender,
} from "@/components/ui/sacred-form";
import { cn } from "@/lib/utils";

interface ReadingFormProps {
  type: string;
}

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
  genderNote: string;
}

const MIN_LOADING_MS = FORTUNE_LOADING_DURATION_MS;

const MAE = {
  gold: "#d5b16f",
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
  unspecified: {
    src: "/images/icons/gender-other.webp?v=gold3d4",
    alt: "ไม่ระบุ",
    sizeClass: "h-9 w-9",
  },
  other: {
    src: "/images/icons/gender-other.webp?v=gold3d4",
    alt: "อื่นๆ",
    sizeClass: "h-9 w-9",
  },
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ReadingForm({ type }: ReadingFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>({
    realName: "",
    nickname: "",
    birthDate: todayIso(),
    gender: "",
    genderNote: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readingOption = READING_OPTIONS.find((o) => o.id === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const startedAt = Date.now();

    try {
      const existing = readFortuneProfile();
      writeFortuneProfile({
        realName: profile.realName,
        nickname: profile.nickname,
        birthDate: profile.birthDate,
        gender: profile.gender,
        genderNote:
          profile.gender === "other" ? profile.genderNote.trim() : undefined,
        birthTime: existing?.birthTime,
        birthPlace: existing?.birthPlace,
        focus: existing?.focus,
        deepenSkipped: existing?.deepenSkipped,
        profileLockedUntil: existing?.profileLockedUntil,
      });

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }

      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  const canSubmit =
    profile.realName.trim() &&
    profile.nickname.trim() &&
    profile.birthDate &&
    profile.gender &&
    (profile.gender !== "other" || profile.genderNote.trim());

  if (!readingOption) {
    return (
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-white/60">ไม่พบประเภทดูดวงนี้</p>
          <PageBackButton href="/reading" className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="mae-wizard relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white">
      <MaePageBackground />

      {loading ? (
        <div className="relative z-10 h-full">
          <FortuneLoading
            nickname={profile.nickname}
            categoryTitle={readingOption.title}
          />
        </div>
      ) : null}

      <AnimatedPage className="relative z-10 min-h-full px-5 pb-10 pt-4">
        {!loading ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <MaeBrandLink />
              <PageBackButton href="/reading" />
            </div>

            <div className="mx-auto mt-4 max-w-[340px]">
              <div
                className="wizard-step-panel wizard-step-forward wizard-step-header relative mb-5 overflow-visible text-center"
              >
                <p
                  className="wizard-anim-item relative z-10 mb-2 text-[12px] font-semibold tracking-[0.14em]"
                  style={{ color: MAE.gold, ["--wizard-delay" as string]: "40ms" }}
                >
                  {readingOption.title}
                </p>
                <h1
                  className="wizard-anim-item wizard-step-title relative z-10 font-sans text-[1.9rem] font-bold tracking-tight"
                  style={{ ["--wizard-delay" as string]: "100ms" }}
                >
                  กรอกข้อมูลของคุณ
                </h1>
                <p
                  className="wizard-anim-item wizard-step-subtitle relative z-10 mx-auto mt-2 max-w-[18rem] text-[15px] font-medium"
                  style={{ ["--wizard-delay" as string]: "160ms" }}
                >
                  ใช้สำหรับคำนวณผลทำนายเท่านั้น
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className="wizard-anim-item rounded-[22px] p-5"
                  style={{
                    ["--wizard-delay" as string]: "200ms",
                    background: "rgba(16,24,39,0.48)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(213,177,111,0.28), 0 10px 32px rgba(0,0,0,0.22)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                  }}
                >
                  <label className="mb-4 block">
                    <span
                      className="mb-2 block text-[13px] font-medium tracking-wide"
                      style={{ color: "rgba(236,214,168,0.88)" }}
                    >
                      ชื่อจริง
                    </span>
                    <input
                      id="realName"
                      type="text"
                      value={profile.realName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, realName: e.target.value }))
                      }
                      placeholder="ชื่อจริงของคุณ"
                      className="name-step-input mae-wizard-input"
                      autoComplete="name"
                    />
                  </label>

                  <label className="mb-4 block">
                    <span
                      className="mb-2 block text-[13px] font-medium tracking-wide"
                      style={{ color: "rgba(236,214,168,0.88)" }}
                    >
                      ชื่อเล่น
                    </span>
                    <input
                      id="nickname"
                      type="text"
                      value={profile.nickname}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, nickname: e.target.value }))
                      }
                      placeholder="ชื่อที่อยากให้เรียก"
                      className="name-step-input mae-wizard-input"
                      autoComplete="nickname"
                    />
                  </label>

                  <div className="mb-4">
                    <span
                      className="mb-2 block text-[13px] font-medium tracking-wide"
                      style={{ color: "rgba(236,214,168,0.88)" }}
                    >
                      วันเกิด
                    </span>
                    <BirthDatePicker
                      value={profile.birthDate}
                      onChange={(birthDate) =>
                        setProfile((p) => ({ ...p, birthDate }))
                      }
                    />
                  </div>

                  <div>
                    <span
                      className="mb-2 block text-[13px] font-medium tracking-wide"
                      style={{ color: "rgba(236,214,168,0.88)" }}
                    >
                      เพศ
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {GENDER_OPTIONS.map((opt) => {
                        const selected = profile.gender === opt.id;
                        const icon = GENDER_ICONS[opt.id];
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setProfile((p) => ({
                                ...p,
                                gender: opt.id,
                                genderNote:
                                  opt.id === "other" ? p.genderNote : "",
                              }))
                            }
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-[14px] px-2 py-3 transition",
                              selected
                                ? "bg-[rgba(213,177,111,0.16)] shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.55)]"
                                : "bg-[rgba(8,18,36,0.45)] shadow-[inset_0_0_0_1px_rgba(186,204,230,0.18)]",
                            )}
                          >
                            <span className="relative grid h-10 w-10 place-items-center">
                              <Image
                                src={icon.src}
                                alt={icon.alt}
                                width={36}
                                height={36}
                                className={icon.sizeClass}
                                unoptimized
                              />
                              {selected ? (
                                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#d5b16f]">
                                  <Check
                                    className="h-2.5 w-2.5 text-[#0b1220]"
                                    strokeWidth={3}
                                  />
                                </span>
                              ) : null}
                            </span>
                            <span
                              className={cn(
                                "text-[12px] font-medium",
                                selected ? "text-[#e8d19a]" : "text-white/70",
                              )}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {profile.gender === "other" ? (
                      <input
                        type="text"
                        value={profile.genderNote}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            genderNote: e.target.value,
                          }))
                        }
                        placeholder="ระบุเพิ่มเติม เช่น นอนไบนารี"
                        maxLength={80}
                        className="name-step-input mae-wizard-input mt-2.5"
                      />
                    ) : null}
                  </div>

                  {error ? (
                    <div className="mt-4">
                      <p className="text-center text-[13px] text-[#e87878]">
                        {error}
                      </p>
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="mae-gold-cta group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-45"
                >
                  <span className="text-[16px] font-bold tracking-wide">
                    เปิดดูดวง
                  </span>
                  <ChevronRight
                    className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </button>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-[12px]"
                  style={{ color: "rgba(154,163,178,0.9)" }}
                >
                  <span style={{ color: MAE.gold }} aria-hidden>
                    ✦
                  </span>
                  ข้อมูลของคุณจะถูกเก็บเป็นความลับ เพื่อการทำนายเท่านั้น
                </p>
              </form>
            </div>
          </>
        ) : null}
      </AnimatedPage>
    </div>
  );
}
