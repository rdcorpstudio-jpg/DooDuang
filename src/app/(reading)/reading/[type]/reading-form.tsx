"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MysticBackground } from "@/components/fortune/mystic-background";
import { FortuneLoading } from "@/components/fortune/fortune-loading";
import { FortuneResultView } from "@/components/fortune/fortune-result-view";
import { READING_OPTIONS } from "@/lib/fortune/zodiac";
import type { ExtendedFortuneResult } from "@/lib/fortune/extended";

type FortuneApiResult = ExtendedFortuneResult & { shareToken?: string | null };
import { ArrowLeft, Moon } from "lucide-react";
import { SacredButton } from "@/components/ui/sacred-button";
import {
  SacredField,
  SacredGenderPicker,
  sacredInputClassName,
  type Gender,
} from "@/components/ui/sacred-form";
import { SacredCorners, SacredDivider } from "@/components/ui/sacred-mark";
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

function RevealBlock({
  visible,
  delay,
  children,
  className,
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal-up", visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function SacredFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative rounded-2xl sacred-surface sacred-card backdrop-blur-sm", className)}
    >
      <SacredCorners className="text-amber-200/30" />
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-brand-purple-light/14" />
      {children}
    </div>
  );
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
  const [result, setResult] = useState<FortuneApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readingOption = READING_OPTIONS.find((o) => o.id === type);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 60);
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
        <MysticBackground />
        <div className="relative z-10 text-center">
          <p className="text-purple-300/60">ไม่พบประเภทดูดวงนี้</p>
          <Link href="/reading" className="mt-4 inline-block text-sm text-purple-400">
            กลับ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="relative min-h-full">
        {!result && (
          <>
            <MysticBackground className="absolute inset-0 min-h-full" />
            <div className="pointer-events-none absolute inset-0 min-h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(251,191,36,0.04),transparent_60%)]" />
          </>
        )}

        {loading && !result && (
          <FortuneLoading nickname={profile.nickname} categoryTitle={readingOption.title} />
        )}

        <div className="relative z-10 min-h-full px-5 py-6 pb-10">
        <RevealBlock visible={mounted} delay={0}>
          <Link
            href="/reading"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-purple-300/50 transition-colors hover:text-amber-100/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับ
          </Link>
        </RevealBlock>

        {!result ? (
          <>
            <RevealBlock visible={mounted} delay={80} className="mt-8 mb-6 text-center">
              <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-brand-purple-light/30 bg-brand-purple-light/12 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.2)]">
                <Moon className="h-[18px] w-[18px] stroke-[1.5]" fill="currentColor" fillOpacity={0.15} />
              </div>
              <p className="mb-3 text-[10px] tracking-[0.35em] text-amber-200/50">
                ขั้นตอนที่ 2 · {readingOption.title}
              </p>
              <h1 className="font-sacred mb-2 text-[1.85rem] text-white/95">
                กรอกข้อมูลของคุณ
              </h1>
              <p className="mx-auto max-w-[240px] text-[14px] leading-relaxed text-purple-200/60">
                บอกจักรวาลรู้จักคุณ แล้วเปิดรับคำทำนาย
              </p>
            </RevealBlock>

            <RevealBlock visible={mounted} delay={180}>
              <SacredFrame className="px-5 py-6">
                <form onSubmit={handleSubmit} className="relative space-y-5">
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
                    <div className="rounded-xl border border-red-900/40 bg-red-950/40 p-3 text-xs text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="pt-1">
                    <SacredDivider />
                    <SacredButton
                      type="submit"
                      disabled={!canSubmit || loading}
                      className="mt-5"
                    >
                      เปิดการ์ดดูดวง
                    </SacredButton>
                  </div>
                </form>
              </SacredFrame>
            </RevealBlock>

            <RevealBlock visible={mounted} delay={320} className="mt-6 text-center">
              <p className="text-[10px] tracking-[0.15em] text-purple-400/40">
                ข้อมูลของคุณใช้เพื่อคำทำนายเท่านั้น
              </p>
            </RevealBlock>
          </>
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
