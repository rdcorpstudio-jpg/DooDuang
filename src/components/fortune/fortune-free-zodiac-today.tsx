"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { ZodiacSignImage } from "@/components/fortune/zodiac-sign-image";
import { analyzeFortune, type FortuneFocus } from "@/lib/fortune/analyze";
import { pickZodiacDaily } from "@/lib/fortune/content/zodiac-daily";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Free: today's vibe — dark navy + gold rim */
export function FortuneFreeZodiacToday({
  birthDate,
  nickname,
  birthTime,
  focus,
  gender,
  unlocked = false,
  deep = false,
  onUnlock,
  className,
}: {
  birthDate: string;
  nickname: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  unlocked?: boolean;
  deep?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const analysis = useMemo(
    () =>
      analyzeFortune({
        birthDate,
        nickname,
        birthTime,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, focus, gender]
  );

  const zodiac = analysis.zodiac;

  const today = useMemo(
    () => pickZodiacDaily(zodiac.id, analysis.dayTone),
    [zodiac.id, analysis.dayTone]
  );

  const [dailyMore, setDailyMore] = useState(false);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(new Date()),
    []
  );

  const displayName = nickname.replace(/^คุณ\s*/, "").trim();

  return (
    <section
      className={cn("mae-aspect-card relative px-4 py-4", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="mae-aspect-title truncate text-[14px] font-semibold tracking-wide">
          {deep ? "เจาะลึกราศี · พรีเมียม" : "ดวงของคุณวันนี้"}
        </p>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#f7f4ec]/65 shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)]">
          {dateLabel}
        </span>
      </div>

      {/* Identity row */}
      <div className="mt-4 flex items-center gap-3.5">
        <ZodiacSignImage
          sign={zodiac.id}
          variant="orb"
          size={56}
          alt={`ราศี${zodiac.thaiName}`}
          className="shrink-0"
          priority
        />
        <div className="min-w-0">
          <h2 className="mae-gold-text text-[1.25rem] font-bold tracking-tight">
            ราศี{zodiac.thaiName}
          </h2>
          <p className="mt-0.5 text-[12px] text-[#f7f4ec]/65">{zodiac.dateRange}</p>
        </div>
      </div>

      {/* Vibe — body copy, not a glowing headline */}
      <p className="mt-4 text-[14px] leading-[1.7] text-[#f7f4ec]/80">
        {displayName ? (
          <span className="font-semibold text-[#f7f4ec]">คุณ{displayName} — </span>
        ) : null}
        {today.vibe}
      </p>

      {/* Actions */}
      <ul className="mt-4 space-y-0 border-t border-[rgba(213,177,111,0.16)]">
        <li className="flex items-start gap-3 border-b border-[rgba(213,177,111,0.16)] py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.14)]">
            <Check className="h-3.5 w-3.5 text-[#d5b16f]" strokeWidth={2.6} />
          </span>
          <p className="min-w-0 text-[13.5px] leading-[1.65] text-[#f7f4ec]/80">
            <span className="font-semibold text-[#f7f4ec]">ทำ</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.doToday}
          </p>
        </li>
        <li className="flex items-start gap-3 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.1)]">
            <AlertCircle className="h-3.5 w-3.5 text-[#d5b16f]" strokeWidth={2.2} />
          </span>
          <p className="min-w-0 text-[13.5px] leading-[1.65] text-[#f7f4ec]/80">
            <span className="font-semibold text-[#f7f4ec]">ระวัง</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.watch}
          </p>
        </li>
      </ul>

      {!deep && unlocked && dailyMore ? (
        <div className="space-y-3 border-t border-[rgba(213,177,111,0.16)] pt-3 text-[13.5px] leading-[1.65] text-[#f7f4ec]/80">
          <p>
            <span className="font-semibold text-[#f7f4ec]">มุมลึก</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.insight}
          </p>
          <p className="text-[#f7f4ec]/65">
            <span className="font-semibold text-[#f7f4ec]">ก่อนนอน</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.evening}
          </p>
          {today.luckyHint ? (
            <p className="text-[12.5px] text-[#f7f4ec]/65">{today.luckyHint}</p>
          ) : null}
        </div>
      ) : null}

      {!deep ? (
        <button
          type="button"
          onClick={() => {
            if (!unlocked) {
              onUnlock?.();
              return;
            }
            setDailyMore((v) => !v);
          }}
          aria-expanded={unlocked ? dailyMore : false}
          disabled={!unlocked && !onUnlock}
          className="mt-1 inline-flex w-full items-center justify-center gap-1 py-2.5 text-[13px] font-medium text-[#d5b16f] outline-none transition hover:text-[#e8d19a] active:opacity-80 disabled:opacity-55"
        >
          {!unlocked ? (
            <>
              <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
              อ่านเพิ่มเติม · พรีเมียม
            </>
          ) : dailyMore ? (
            <>
              ย่อข้อความ
              <ChevronDown className="h-4 w-4 rotate-180" strokeWidth={2.2} />
            </>
          ) : (
            <>
              อ่านเพิ่มเติม
              <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
            </>
          )}
        </button>
      ) : null}

      {deep ? (
        <div className="mt-3 border-t border-[rgba(213,177,111,0.16)] pt-3.5">
          <Link
            href="/premium/self-map"
            className="mae-gold-cta inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold outline-none transition active:scale-[0.99]"
          >
            เจาะลึกตัวตน
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      ) : unlocked ? (
        <Link
          href="/premium"
          className="mt-1 flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
          }}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)]">
            <Sparkles className="h-4 w-4 text-[#d5b16f]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#f7f4ec]">
              เปิดเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#f7f4ec]/65">
              ปลดล็อกแล้ว · อ่านบุคลิกและคำแนะนำที่แท็บพรีเมียม
            </span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#f7f4ec]/65"
            strokeWidth={2.2}
          />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="mt-1 flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35 disabled:opacity-60"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
          }}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.12)]">
            <Lock className="h-4 w-4 text-[#d5b16f]" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-[#f7f4ec]">
              ปลดล็อกเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[12px] text-[#f7f4ec]/65">
              บุคลิก · จุดเปลี่ยน · คำแนะนำ · {FORTUNE_UNLOCK_PRICE} บาท
            </span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#f7f4ec]/65"
            strokeWidth={2.2}
          />
        </button>
      )}
    </section>
  );
}
