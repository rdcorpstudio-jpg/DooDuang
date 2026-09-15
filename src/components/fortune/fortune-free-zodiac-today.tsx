"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Leaf,
  Lock,
  Sparkles,
} from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { buildDailyReadingPack } from "@/lib/fortune/build-daily-pack";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Split tip copy into short bullets (max 2) — keep full wording, wrap in UI */
function toBullets(text: string, max = 2): string[] {
  const raw = text.trim();
  if (!raw) return [];

  let parts = raw
    .split(/\s*[·•|/]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    parts = raw
      .split(
        /(?<=[ก-๙า-์])\s+(?=เมื่อ|เพื่อ|แล้ว|อย่า|ไม่ควร|ควร|ค่อย|แยก|กำหนด|จัด|เลือก|หยุด)/
      )
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (parts.length < 2) {
    parts = raw
      .split(/\s+และ\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (parts.length < 2 && raw.length > 56) {
    const mid = Math.floor(raw.length / 2);
    let cut = raw.lastIndexOf(" ", mid);
    if (cut < 18) cut = raw.indexOf(" ", mid);
    if (cut > 18) {
      parts = [raw.slice(0, cut).trim(), raw.slice(cut).trim()];
    } else {
      parts = [raw];
    }
  }

  if (parts.length < 2) parts = [raw];

  return parts.slice(0, max);
}

function TipCard({
  tone,
  title,
  icon,
  items,
  bulletIcon,
}: {
  tone: "do" | "watch";
  title: string;
  icon: ReactNode;
  items: string[];
  bulletIcon: ReactNode;
}) {
  const isDo = tone === "do";
  return (
    <div
      className="flex min-w-0 flex-1 flex-col rounded-[16px] px-2.5 py-2.5"
      style={
        isDo
          ? {
              background: "rgba(18,42,40,0.72)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
            }
          : {
              background: "rgba(42,32,18,0.72)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
            }
      }
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={
            isDo
              ? {
                  background: "rgba(94,186,160,0.18)",
                  boxShadow: "inset 0 0 0 1px rgba(94,186,160,0.45)",
                }
              : {
                  background: "rgba(213,177,111,0.14)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
                }
          }
          aria-hidden
        >
          {icon}
        </span>
        <p
          className={cn(
            "text-[12.5px] font-semibold tracking-wide",
            isDo ? "text-[#9fe0cb]" : "text-[#e8d19a]"
          )}
        >
          {title}
        </p>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0" aria-hidden>
              {bulletIcon}
            </span>
            <span className="min-w-0 flex-1 break-words text-[12px] leading-[1.55] text-[#f7f4ec]/85">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Free: today's vibe — Type 2 rhythm + do/watch cards */
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
  const pack = useMemo(
    () =>
      buildDailyReadingPack({
        birthDate,
        nickname,
        birthTime,
        birthPlace,
        focus,
        gender,
      }),
    [birthDate, nickname, birthTime, birthPlace, focus, gender]
  );

  const analysis = pack.analysis;
  const zodiac = analysis.zodiac;
  const today = pack.zodiacDaily;

  const [dailyMore, setDailyMore] = useState(false);

  const doItems = useMemo(() => toBullets(today.doToday), [today.doToday]);
  const watchItems = useMemo(() => toBullets(today.watch), [today.watch]);

  return (
    <section className={cn("mae-aspect-card relative px-3.5 py-3.5", className)}>
      <h2 className="mae-gold-text text-[1.05rem] font-bold tracking-tight">
        จังหวะของคุณวันนี้
      </h2>

      <div className="mt-3 flex flex-col gap-2.5">
        <TipCard
          tone="do"
          title="ควรทำ"
          icon={<Leaf className="h-3.5 w-3.5 text-[#9fe0cb]" strokeWidth={2} />}
          items={doItems}
          bulletIcon={
            <Check className="h-3 w-3 text-[#7dcdb4]" strokeWidth={2.6} />
          }
        />
        <TipCard
          tone="watch"
          title="ควรระวัง"
          icon={
            <AlertCircle
              className="h-3.5 w-3.5 text-[#e8d19a]"
              strokeWidth={2}
            />
          }
          items={watchItems}
          bulletIcon={
            <AlertCircle
              className="h-3 w-3 text-[#d5b16f]"
              strokeWidth={2.2}
            />
          }
        />
      </div>

      {!deep && unlocked && dailyMore ? (
        <div className="mt-3 space-y-2 border-t border-[rgba(213,177,111,0.16)] pt-2.5 text-[13px] leading-[1.5] text-[#f7f4ec]/80">
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
          className="mt-1 inline-flex w-full items-center justify-center gap-1 py-1.5 text-[12.5px] font-medium text-[#d5b16f] outline-none transition hover:text-[#e8d19a] active:opacity-80 disabled:opacity-55"
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
        <div className="mt-2.5 border-t border-[rgba(213,177,111,0.16)] pt-2.5">
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
