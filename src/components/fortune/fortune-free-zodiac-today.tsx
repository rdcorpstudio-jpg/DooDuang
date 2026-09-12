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

/** Free: today's vibe — compact navy + gold */
export function FortuneFreeZodiacToday({
  birthDate,
  nickname,
  birthTime,
  birthPlace,
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
  birthPlace?: string;
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
        birthPlace,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, birthPlace, focus, gender]
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
    <section className={cn("mae-aspect-card relative px-3.5 py-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="mae-aspect-title truncate text-[13px] font-semibold tracking-wide">
          {deep ? "เจาะลึกราศี · พรีเมียม" : "ดวงของคุณวันนี้"}
        </p>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium text-[#f7f4ec]/65 shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)]">
          {dateLabel}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <ZodiacSignImage
          sign={zodiac.id}
          variant="orb"
          size={56}
          alt={`ราศี${zodiac.thaiName}`}
          className="shrink-0"
          priority
        />
        <div className="min-w-0">
          <h2
            className="mae-gold-text text-[1.15rem] font-bold tracking-tight"
            style={{
              filter:
                "drop-shadow(0 1px 1px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
            }}
          >
            ราศี{zodiac.thaiName}
          </h2>
          <p className="mt-0.5 text-[12px] font-medium text-[#e8d19a]/85">
            {zodiac.dateRange}
          </p>
        </div>
      </div>

      <p
        className="mt-2.5 text-[13.5px] leading-[1.55] text-[#f7f4ec]"
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.55)",
        }}
      >
        {displayName ? (
          <span className="font-semibold text-[#fff8e4]">คุณ{displayName} — </span>
        ) : null}
        {today.vibe}
      </p>

      <ul className="mt-2.5 space-y-0 border-t border-[rgba(213,177,111,0.16)]">
        <li className="flex items-start gap-2.5 border-b border-[rgba(213,177,111,0.16)] py-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.14)]">
            <Check className="h-3 w-3 text-[#d5b16f]" strokeWidth={2.6} />
          </span>
          <p className="min-w-0 text-[13px] leading-[1.5] text-[#f7f4ec]/80">
            <span className="font-semibold text-[#f7f4ec]">ทำ</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.doToday}
          </p>
        </li>
        <li className="flex items-start gap-2.5 py-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(213,177,111,0.1)]">
            <AlertCircle className="h-3 w-3 text-[#d5b16f]" strokeWidth={2.2} />
          </span>
          <p className="min-w-0 text-[13px] leading-[1.5] text-[#f7f4ec]/80">
            <span className="font-semibold text-[#f7f4ec]">ระวัง</span>
            <span className="mx-1.5 text-[#d5b16f]/55">·</span>
            {today.watch}
          </p>
        </li>
      </ul>

      {!deep && unlocked && dailyMore ? (
        <div className="mt-2 space-y-2 border-t border-[rgba(213,177,111,0.16)] pt-2 text-[13px] leading-[1.5] text-[#f7f4ec]/80">
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
            <p className="text-[12px] text-[#f7f4ec]/65">{today.luckyHint}</p>
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
          className="mt-0.5 inline-flex w-full items-center justify-center gap-1 py-1.5 text-[12.5px] font-medium text-[#d5b16f] outline-none transition hover:text-[#e8d19a] active:opacity-80 disabled:opacity-55"
        >
          {!unlocked ? (
            <>
              <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
              อ่านเพิ่มเติม · พรีเมียม
            </>
          ) : dailyMore ? (
            <>
              ย่อข้อความ
              <ChevronDown className="h-3.5 w-3.5 rotate-180" strokeWidth={2.2} />
            </>
          ) : (
            <>
              อ่านเพิ่มเติม
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.2} />
            </>
          )}
        </button>
      ) : null}

      {deep ? (
        <div className="mt-2 border-t border-[rgba(213,177,111,0.16)] pt-2.5">
          <Link
            href="/premium/self-map"
            className="mae-gold-cta inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold outline-none transition active:scale-[0.99]"
          >
            เจาะลึกตัวตน
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      ) : unlocked ? (
        <Link
          href="/premium"
          className="mt-0.5 flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
          style={{
            border: "1.5px solid transparent",
            background:
              "linear-gradient(165deg, #1c2738 0%, #141c2b 48%, #101827 100%) padding-box, linear-gradient(145deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 55%, #b8924f 78%, #f0dc9e 100%) border-box",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,248,228,0.08)",
          }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.22), rgba(213,177,111,0.1) 60%, transparent)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#e8d19a]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mae-gold-text block text-[13px] font-semibold tracking-wide">
              เปิดเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#e8d19a]/75">
              ปลดล็อกแล้ว · อ่านบุคลิกและคำแนะนำที่แท็บพรีเมียม
            </span>
          </span>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(145deg, #efe0b8 0%, #d5b16f 55%, #b8924f 100%)",
            }}
          >
            <ChevronRight className="h-3.5 w-3.5 text-[#101827]" strokeWidth={2.5} />
          </span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="mt-0.5 flex w-full items-center gap-2.5 rounded-[14px] px-2.5 py-2 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35 disabled:opacity-60"
          style={{
            border: "1.5px solid transparent",
            background:
              "linear-gradient(165deg, #1c2738 0%, #141c2b 48%, #101827 100%) padding-box, linear-gradient(145deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 55%, #b8924f 78%, #f0dc9e 100%) border-box",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,248,228,0.08)",
          }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.22), rgba(213,177,111,0.1) 60%, transparent)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
            }}
          >
            <Lock className="h-3.5 w-3.5 text-[#e8d19a]" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mae-gold-text block text-[13px] font-semibold tracking-wide">
              ปลดล็อกเจาะลึกดวงราศี{zodiac.thaiName}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-[#e8d19a]/75">
              บุคลิก · จุดเปลี่ยน · คำแนะนำ · {FORTUNE_UNLOCK_PRICE} บาท
            </span>
          </span>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(145deg, #efe0b8 0%, #d5b16f 55%, #b8924f 100%)",
            }}
          >
            <ChevronRight className="h-3.5 w-3.5 text-[#101827]" strokeWidth={2.5} />
          </span>
        </button>
      )}
    </section>
  );
}
