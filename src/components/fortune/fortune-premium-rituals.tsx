"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Moon, Sparkles } from "lucide-react";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import {
  answerAuspicious,
  buildPremiumRitualsPack,
} from "@/lib/fortune/build-premium-rituals";
import type { AuspiciousActivityId } from "@/lib/fortune/content/premium-rituals-th";
import { cn } from "@/lib/utils";

const ACT_ICONS: Record<AuspiciousActivityId, string> = {
  talk: "/images/rituals/talk.png",
  money: "/images/rituals/money.png",
  start: "/images/rituals/start.png",
  travel: "/images/rituals/travel.png",
  forgive: "/images/rituals/forgive.png",
  rest: "/images/rituals/rest.png",
};

type Props = {
  birthDate: string;
  nickname: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
};

/** New premium rituals — appended below existing premium blocks */
export function FortunePremiumRituals({
  birthDate,
  nickname,
  birthTime,
  focus,
  gender,
  className,
}: Props) {
  const input = useMemo(
    () => ({ birthDate, nickname, birthTime, focus, gender }),
    [birthDate, nickname, birthTime, focus, gender]
  );
  const pack = useMemo(() => buildPremiumRitualsPack(input), [input]);

  const [picked, setPicked] = useState<AuspiciousActivityId | null>(null);
  const auspicious = picked ? answerAuspicious(picked, input) : null;

  return (
    <section className={cn("space-y-3.5", className)}>
      <header className="px-0.5">
        <p className="font-sacred text-[12px] tracking-[0.22em] text-[#C9A227]">
          RITUALS
        </p>
        <h2 className="dd-section-title mt-1 text-[1.35rem] font-bold tracking-tight">
          พิธีเล็ก ๆ สำหรับคุณ
        </h2>
      </header>

      <div className="fortune-glass rounded-[22px] px-3.5 py-4">
        <p className="text-[14px] font-semibold text-[#241C4F]">
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
                    ? "bg-white/85 ring-2 ring-[#9B7FE8]/55"
                    : "bg-white/50 ring-1 ring-[#9B7FE8]/12"
                )}
              >
                <span className="relative flex h-14 w-14 items-center justify-center">
                  <Image
                    src={ACT_ICONS[a.id]}
                    alt=""
                    width={52}
                    height={52}
                    unoptimized
                    className="dd-icon-float h-12 w-12 object-contain drop-shadow-[0_4px_8px_rgba(80,60,140,0.18)]"
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
                <span className="px-0.5 text-[11px] font-medium leading-snug text-[#3A3270]">
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
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(236,228,255,0.75))",
              border: "1px solid rgba(155,127,232,0.28)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold text-[#241C4F]">
                {auspicious.verdict}
              </p>
              <span className="rounded-full bg-[#9B7FE8]/15 px-2 py-0.5 text-[11px] font-semibold text-[#5B45B8]">
                {auspicious.score}/12
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5E5688]">
              {auspicious.tip}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-center text-[11px] text-[#8A82B0]">
            เลือกกิจกรรมด้านบน
          </p>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-[18px] px-3.5 py-3.5"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,252,245,0.98) 0%, rgba(248,244,255,0.96) 55%, rgba(255,248,235,0.94) 100%)",
          border: "1px solid rgba(201,162,39,0.32)",
        }}
      >
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
              className="h-3.5 w-3.5 shrink-0 text-[#C9A227]"
              strokeWidth={2}
            />
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
              คำอธิษฐานวันนี้
            </p>
          </div>
          <p className="mt-2 text-[14px] font-medium leading-[1.55] text-[#2C2458]">
            “{pack.blessing}”
          </p>
        </div>
      </div>

      <div className="fortune-glass rounded-[22px] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center text-[#7B5FD4]">
            <Moon className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <p className="text-[14px] font-semibold text-[#241C4F]">
            โหมดก่อนนอน
          </p>
        </div>
        <div className="mt-3 space-y-2">
          <NightLine label="วางคืนนี้" text={pack.night.release} />
          <NightLine label="พรุ่งนี้" text={pack.night.tomorrow} />
        </div>
        <p className="mt-3 text-center text-[13px] font-medium leading-relaxed text-[#5B45B8]">
          {pack.night.close}
        </p>
      </div>
    </section>
  );
}

function NightLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-[14px] bg-white/55 px-3 py-2.5 ring-1 ring-[#9B7FE8]/14">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7B5FD4]">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-[#4A4278]">{text}</p>
    </div>
  );
}
