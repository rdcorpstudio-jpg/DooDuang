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
        {loading && !result && (
          <FortuneLoading nickname={profile.nickname} categoryTitle={readingOption.title} />
        )}

        <div className="relative z-10 min-h-full px-5 pb-10 pt-4">
          {!result ? (
            <Reveal visible={mounted} delay={0}>
              <Link
                href="/reading"
                className="inline-flex items-center gap-0.5 text-[15px] font-medium text-[#c9a8ff] transition-opacity active:opacity-60"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                กลับ
              </Link>
            </Reveal>
          ) : null}

          {!result ? (
            <div className="mx-auto mt-3 max-w-[340px]">
              <Reveal
                visible={mounted}
                delay={80}
                variant="glow"
                className="relative mb-5 overflow-hidden pt-1 text-center"
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-[42%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(169,103,245,0.32)_0%,transparent_70%)] blur-2xl"
                  aria-hidden
                />

                <div className="relative z-[1]">
                  <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#a967f5]/12 px-3.5 py-1.5 ring-1 ring-[#c9a8ff]/25">
                    <Sparkles className="h-3 w-3 text-[#c9a8ff]" strokeWidth={1.8} />
                    <span className="text-[12px] font-medium tracking-[0.14em] text-[#c9a8ff]">
                      {readingOption.title}
                    </span>
                  </div>

                  <h1 className="font-sacred text-[1.7rem] leading-[1.3] tracking-wide text-white sm:text-[1.85rem]">
                    กรอกข้อมูลของคุณ
                  </h1>

                  <div className="mx-auto mt-2.5 h-px w-16 bg-gradient-to-r from-transparent via-[#c9a8ff]/50 to-transparent" />

                  <p className="mt-2.5 text-[13px] leading-relaxed text-white/50">
                    ใช้สำหรับคำนวณผลทำนายเท่านั้น
                  </p>
                </div>
              </Reveal>

              <Reveal visible={mounted} delay={200} variant="scale">
                <div className="glass-frame relative overflow-hidden rounded-[22px] p-5 sm:p-6">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(169,103,245,0.18)_0%,transparent_70%)]"
                    aria-hidden
                  />
                  <form onSubmit={handleSubmit} className="relative z-[1] space-y-4">
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
                      <div className="rounded-xl border border-rose-400/25 bg-rose-500/12 px-4 py-3.5 text-[14px] text-rose-200">
                        {error}
                      </div>
                    )}

                    <div className="pt-2">
                      <SacredButton type="submit" disabled={!canSubmit || loading}>
                        เปิดดูดวง
                      </SacredButton>
                    </div>
                  </form>
                </div>
              </Reveal>

              <Reveal visible={mounted} delay={340}>
                <p className="mt-5 text-center text-[12px] tracking-wide text-white/30">
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
              shareToken={result.shareToken}
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
