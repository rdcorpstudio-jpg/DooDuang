"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";
import { ChevronLeft, Sparkles } from "lucide-react";
import { SacredButton } from "@/components/ui/sacred-button";
import {
  SacredField,
  SacredGenderPicker,
  sacredInputClassName,
  type Gender,
} from "@/components/ui/sacred-form";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

interface ReadingFormProps {
  type: string;
}

interface ProfileForm {
  realName: string;
  nickname: string;
  birthDate: string;
  gender: Gender | "";
}

const MIN_LOADING_MS = 2400;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ReadingForm({ type }: ReadingFormProps) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>({
    realName: "",
    nickname: "",
    birthDate: "",
    gender: "",
  });
  const [result, setResult] = useState<ExtendedFortuneResult | null>(null);
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
          <Link href="/reading" className="mt-4 inline-block text-sm text-[#c084fc]">
            กลับ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="relative min-h-full">
        {/* Calm reading veil — dims star/zodiac noise under long text */}
        {result && (
          <div className="pointer-events-none absolute inset-0 min-h-full" aria-hidden>
            <div className="absolute inset-0 bg-[#1a102c]/45 backdrop-blur-[6px]" />
          </div>
        )}

        {!result && (
          <div
            className="pointer-events-none absolute inset-0 min-h-full"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a1548]/40 via-transparent to-[#1a0a2e]/50" />
            <div className="absolute left-1/2 top-0 h-64 w-[80%] -translate-x-1/2 rounded-full bg-[#a855f7]/15 blur-3xl" />
          </div>
        )}

        {loading && !result && (
          <FortuneLoading nickname={profile.nickname} categoryTitle={readingOption.title} />
        )}

        <div
          className={cn(
            "relative z-10 min-h-full pb-10 pt-4",
            result ? "px-3" : "px-5"
          )}
        >
          <Reveal visible={mounted} delay={0}>
            <Link
              href="/reading"
              className="inline-flex items-center gap-0.5 text-[17px] font-medium text-[#c084fc] transition-opacity active:opacity-60"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2} />
              กลับ
            </Link>
          </Reveal>

          {!result ? (
            <div className="mx-auto mt-4 max-w-[340px]">
              <Reveal visible={mounted} delay={80} variant="glow" className="relative mb-6 overflow-hidden pt-2 text-center">
                <div
                  className="pointer-events-none absolute left-1/2 top-[40%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,196,176,0.25)_0%,rgba(168,85,247,0.15)_45%,transparent_70%)] blur-2xl"
                  aria-hidden
                />

                <div className="relative z-[1]">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8c4b0]/35 bg-[#e8c4b0]/10 px-4 py-1.5 shadow-[0_0_18px_rgba(232,196,176,0.12)]">
                    <Sparkles className="h-3.5 w-3.5 text-[#e8c4b0]" strokeWidth={1.8} />
                    <span className="text-[13px] font-semibold tracking-[0.14em] text-[#e8c4b0]">
                      {readingOption.title}
                    </span>
                  </div>

                  <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-[-6px] rounded-full border border-[#e8c4b0]/25" />
                    <span className="absolute inset-[-12px] rounded-full border border-dashed border-white/15 intro-portal-spin-reverse" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e8c4b0]/30 bg-black/20 shadow-[0_0_24px_rgba(232,196,176,0.25)] backdrop-blur-sm">
                      <Sparkles
                        className="h-6 w-6 animate-float text-[#e8c4b0] drop-shadow-[0_0_10px_rgba(232,196,176,0.8)]"
                        strokeWidth={1.4}
                      />
                    </div>
                  </div>

                  <h1 className="font-sacred text-[1.85rem] leading-[1.3] tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:text-[2rem]">
                    กรอกข้อมูลของคุณ
                  </h1>

                  <div className="mx-auto mt-3 flex max-w-[12rem] items-center gap-3" aria-hidden>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8c4b0]/50 to-transparent" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#e8c4b0] shadow-[0_0_8px_rgba(232,196,176,0.75)]" />
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#e8c4b0]/50 to-transparent" />
                  </div>

                  <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                    ใช้สำหรับคำนวณผลทำนายเท่านั้น
                  </p>
                </div>
              </Reveal>

              <Reveal visible={mounted} delay={200} variant="scale">
                <div className="rounded-[22px] border border-white/12 bg-black/20 p-5 backdrop-blur-md sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <SacredField label="ชื่อจริง" htmlFor="realName">
                      <input
                        id="realName"
                        type="text"
                        value={profile.realName}
                        onChange={(e) => setProfile((p) => ({ ...p, realName: e.target.value }))}
                        placeholder="ชื่อจริงของคุณ"
                        className={sacredInputClassName}
                        autoComplete="name"
                      />
                    </SacredField>

                    <SacredField label="ชื่อเล่น" htmlFor="nickname">
                      <input
                        id="nickname"
                        type="text"
                        value={profile.nickname}
                        onChange={(e) => setProfile((p) => ({ ...p, nickname: e.target.value }))}
                        placeholder="ชื่อที่อยากให้เรียก"
                        className={sacredInputClassName}
                        autoComplete="nickname"
                      />
                    </SacredField>

                    <SacredField label="เพศ">
                      <SacredGenderPicker
                        value={profile.gender}
                        onChange={(gender) => setProfile((p) => ({ ...p, gender }))}
                      />
                    </SacredField>

                    <SacredField label="วันเดือนปีเกิด" htmlFor="birthDate">
                      <input
                        id="birthDate"
                        type="date"
                        value={profile.birthDate}
                        onChange={(e) => setProfile((p) => ({ ...p, birthDate: e.target.value }))}
                        className={cn(sacredInputClassName, "[color-scheme:dark]")}
                        max={new Date().toISOString().slice(0, 10)}
                      />
                    </SacredField>

                    {error && (
                      <div className="rounded-xl bg-rose-500/15 px-4 py-3.5 text-[15px] text-rose-200">
                        {error}
                      </div>
                    )}

                    <div className="pt-1">
                      <SacredButton type="submit" disabled={!canSubmit || loading}>
                        เปิดดูดวง
                      </SacredButton>
                    </div>
                  </form>
                </div>
              </Reveal>

              <Reveal visible={mounted} delay={340}>
                <p className="mt-5 text-center text-[14px] text-white/35">
                  ข้อมูลของคุณใช้เพื่อคำทำนายเท่านั้น
                </p>
              </Reveal>
            </div>
          ) : (
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
              onRetry={() => {
                setResult(null);
                setError(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
