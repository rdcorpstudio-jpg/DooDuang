"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  answerAuspicious,
  buildPremiumRitualsPack,
} from "@/lib/fortune/build-premium-rituals";
import type { AuspiciousActivityId } from "@/lib/fortune/content/premium-rituals-th";
import { cn } from "@/lib/utils";

const ACT_ICONS: Record<AuspiciousActivityId, string> = {
  talk: "/images/rituals/talk.webp?v=mae-transparent2",
  money: "/images/rituals/money.webp?v=mae-transparent2",
  start: "/images/rituals/start.webp?v=mae-transparent2",
  travel: "/images/rituals/travel.webp?v=mae-transparent2",
  forgive: "/images/rituals/forgive.webp?v=mae-transparent2",
  rest: "/images/rituals/rest.webp?v=mae-transparent2",
};

const NIGHT_ICONS = {
  moon: "/images/night/moon.webp?v=1",
  stones: "/images/night/stones.webp?v=1",
  sprout: "/images/night/sprout.webp?v=1",
} as const;

type Props = {
  birthDate: string;
  nickname: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
};

/** Premium rituals — Mae navy–gold */
export function FortunePremiumRituals({
  birthDate,
  nickname,
  birthTime,
  birthPlace,
  focus,
  gender,
  className,
}: Props) {
  const input = useMemo(
    () => ({ birthDate, nickname, birthTime, birthPlace, focus, gender }),
    [birthDate, nickname, birthTime, birthPlace, focus, gender]
  );
  const pack = useMemo(() => buildPremiumRitualsPack(input), [input]);

  const [picked, setPicked] = useState<AuspiciousActivityId | null>(null);
  const auspicious = picked ? answerAuspicious(picked, input) : null;

  return (
    <section className={cn("space-y-3.5", className)}>
      <header className="px-0.5">
        <p className="text-[12px] font-semibold tracking-[0.22em] text-[#d5b16f]">
          RITUALS
        </p>
        <h2 className="mae-gold-text mt-1 text-[1.35rem] font-bold tracking-tight">
          พิธีเล็ก ๆ สำหรับคุณ
        </h2>
      </header>

      <div className="mae-aspect-card rounded-[22px] px-3.5 py-4">
        <p className="mae-aspect-title text-[14px] font-semibold">
          ฤกษ์ทำอะไรดีวันนี้
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {pack.activities.map((a) => {
            const on = picked === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setPicked(a.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[16px] px-1.5 py-3 text-center outline-none transition active:scale-[0.97]",
                  on
                    ? "bg-[rgba(213,177,111,0.18)] shadow-[inset_0_0_0_1.5px_rgba(213,177,111,0.55)]"
                    : "bg-[rgba(255,255,255,0.04)] shadow-[inset_0_0_0_1px_rgba(213,177,111,0.22)]"
                )}
              >
                <span className="relative flex h-14 w-14 items-center justify-center">
                  <Image
                    src={ACT_ICONS[a.id]}
                    alt=""
                    width={52}
                    height={52}
                    unoptimized
                    className="dd-icon-float h-12 w-12 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
                    style={
                      {
                        "--dd-float-delay": `${
                          ["talk", "money", "start", "travel", "forgive", "rest"].indexOf(
                            a.id
                          ) * 0.28
                        }s`,
                      } as CSSProperties
                    }
                  />
                </span>
                <span className="px-0.5 text-[11px] font-medium leading-snug text-[#f7f4ec]/80">
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>

        {auspicious ? (
          <div
            className="mt-3.5 rounded-[16px] px-3.5 py-3"
            style={{
              background: "rgba(213,177,111,0.1)",
              border: "1px solid rgba(213,177,111,0.35)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold text-[#f7f4ec]">
                {auspicious.verdict}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#101827]"
                style={{ background: "#d5b16f" }}
              >
                {auspicious.score}/12
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-[#f7f4ec]/70">
              {auspicious.tip}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-center text-[11px] text-[#f7f4ec]/45">
            เลือกกิจกรรมด้านบน
          </p>
        )}
      </div>

      <div className="mae-aspect-card relative overflow-hidden rounded-[18px] px-3.5 py-3.5">
        <div
          className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, #E4C56A 0%, #C9A227 50%, #E4C56A 100%)",
          }}
          aria-hidden
        />
        <div className="pl-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles
              className="h-3.5 w-3.5 shrink-0 text-[#d5b16f]"
              strokeWidth={2}
            />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
              คำอธิษฐานวันนี้
            </p>
          </div>
          <p className="mt-2 text-[14px] font-medium leading-[1.55] text-[#f7f4ec]">
            “{pack.blessing}”
          </p>
        </div>
      </div>

      <div className="mae-aspect-card rounded-[22px] px-4 py-4">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <Image
              src={NIGHT_ICONS.moon}
              alt=""
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6 object-contain"
            />
          </span>
          <p className="mae-gold-text text-[13px] font-semibold">
            โหมดก่อนนอน
          </p>
        </div>
        <div className="mt-3 space-y-2">
          <NightLine
            icon={NIGHT_ICONS.stones}
            label="วางคืนนี้"
            text={pack.night.release}
          />
          <NightLine
            icon={NIGHT_ICONS.sprout}
            label="พรุ่งนี้"
            text={pack.night.tomorrow}
          />
        </div>
        <p className="mae-gold-text mt-3 text-center text-[13px] font-medium leading-relaxed">
          {pack.night.close}
        </p>
      </div>
    </section>
  );
}

function NightLine({
  icon,
  label,
  text,
}: {
  icon: string;
  label: string;
  text: string;
}) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-[14px] px-3 py-2.5"
      style={{
        background: "rgba(213,177,111,0.08)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
      }}
    >
      <Image
        src={icon}
        alt=""
        width={22}
        height={22}
        unoptimized
        className="mt-0.5 h-[22px] w-[22px] shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="mae-gold-text text-[11px] font-semibold tracking-[0.12em]">
          {label}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-[#f7f4ec]/70">{text}</p>
      </div>
    </div>
  );
}
