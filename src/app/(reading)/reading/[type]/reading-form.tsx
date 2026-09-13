"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BirthDatePicker } from "@/components/fortune/birth-date-picker";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { ZodiacWheelBg } from "@/components/layout/zodiac-wheel-bg";
import { PageBackButton } from "@/components/ui/page-back-button";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";
import { Check, ChevronRight } from "lucide-react";
import {
  GENDER_OPTIONS,
  type Gender,
} from "@/components/ui/sacred-form";
import { cn } from "@/lib/utils";

type FortuneApiResult = ExtendedFortuneResult & { shareToken?: string | null };

interface ReadingFormProps {
  type: string;
}

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
}

const MIN_LOADING_MS = 4800;

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
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    realName: "",
    nickname: "",
    birthDate: todayIso(),
    gender: "",
  });
  const [result, setResult] = useState<FortuneApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readingOption = READING_OPTIONS.find((o) => o.id === type);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const startedAt = Date.now();

    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...profile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await wait(MIN_LOADING_MS - elapsed);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    profile.realName.trim() &&
    profile.nickname.trim() &&
    profile.birthDate &&
    profile.gender;

  if (!readingOption) {
    return (
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/60">ไม่พบประเภทดูดวงนี้</p>
          <Link href="/reading" className="mt-4 inline-block text-sm text-[#d5b16f]">
            กลับ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mae-wizard relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white",
        mounted ? "opacity-100" : "opacity-0",
      )}
    >
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

      {loading && !result ? (
        <div className="relative z-10 h-full">
          <FortuneLoading
            nickname={profile.nickname}
            categoryTitle={readingOption.title}
          />
        </div>
      ) : null}

      <div className="relative z-10 min-h-full px-5 pb-10 pt-4">
        {!result && !loading ? (
          <>
            <PageBackButton href="/reading" />

            <div className="mx-auto mt-4 max-w-[340px]">
              <div className="wizard-step-header relative mb-5 text-center">
                <div
                  className="wizard-step-zodiac pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
                  aria-hidden
                >
                  <div className="wizard-step-zodiac-spin h-full w-full">
                    <ZodiacWheelBg className="h-full w-full" />
                  </div>
                </div>
                <p
                  className="relative z-10 mb-2 text-[12px] font-semibold tracking-[0.14em]"
                  style={{ color: MAE.gold }}
                >
                  {readingOption.title}
                </p>
                <h1 className="wizard-step-title relative z-10 font-sans text-[1.9rem] font-bold leading-[1.25] tracking-tight">
                  กรอกข้อมูลของคุณ
                </h1>
                <p className="wizard-step-subtitle relative z-10 mx-auto mt-2.5 max-w-[18rem] text-[13.5px] leading-relaxed">
                  ใช้สำหรับคำนวณผลทำนายเท่านั้น
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className="rounded-[22px] p-5"
                  style={{
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
                      เพศ
                    </span>
                    <div className="flex flex-col gap-2.5">
                      {GENDER_OPTIONS.map((option) => {
                        const meta = GENDER_ICONS[option.id];
                        const selected = profile.gender === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              setProfile((p) => ({ ...p, gender: option.id }))
                            }
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[18px] px-3.5 py-3 text-left outline-none transition duration-200",
                              "active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
                              selected
                                ? "bg-[rgba(16,24,39,0.55)] shadow-[0_0_0_1.5px_rgba(213,177,111,0.75)]"
                                : "bg-[rgba(16,24,39,0.28)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)]"
                            )}
                          >
                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgba(213,177,111,0.1)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.28)]">
                              <Image
                                src={meta.src}
                                alt={meta.alt}
                                width={32}
                                height={32}
                                unoptimized
                                className={cn(
                                  "object-contain object-center",
                                  meta.sizeClass
                                )}
                              />
                            </span>
                            <span className="min-w-0 flex-1 text-[15px] font-semibold tracking-wide text-white">
                              {option.label}
                            </span>
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                selected
                                  ? "bg-[#d5b16f] text-[#101827]"
                                  : "shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.35)]"
                              )}
                              aria-hidden
                            >
                              {selected ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span
                      className="mb-2 block text-[13px] font-medium tracking-wide"
                      style={{ color: "rgba(236,214,168,0.88)" }}
                    >
                      วันเดือนปีเกิด
                    </span>
                    <BirthDatePicker
                      tone="mae"
                      value={profile.birthDate}
                      onChange={(birthDate) =>
                        setProfile((p) => ({ ...p, birthDate }))
                      }
                    />
                  </div>

                  {error ? (
                    <div className="mt-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-200">
                      {error}
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

        {result ? (
          <FortuneResultView
            result={result}
            profile={{
              realName: profile.realName,
              nickname: profile.nickname,
              birthDate: profile.birthDate,
              gender: profile.gender,
            }}
            readingOption={readingOption}
            type={type}
            shareToken={result.shareToken}
            onRetry={() => {
              setResult(null);
              setError(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
