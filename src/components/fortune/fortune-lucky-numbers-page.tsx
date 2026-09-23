"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MaeOpenLight, useMaeOpenLight } from "@/components/fortune/mae-open-light";
import { AnimatedPage, Reveal, useRevealMounted } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  luckyDigitMeaning,
  pickDailyLuckyNumbers,
  type DailyLuckyNumbers,
} from "@/lib/fortune/lucky-numbers";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "rgba(240,244,250,0.94)";
const MUTED = "rgba(186,204,230,0.82)";
const HERO_ART = "/images/special/coming-soon/01-lucky-numbers.webp?v=2";

/** กรอบนอกอย่างเดียว — เหมือน `mae-daily-card` หน้า /home */
const HOME_FRAME = {
  background:
    "linear-gradient(165deg, rgba(18,36,62,0.82) 0%, rgba(8,18,36,0.78) 55%, rgba(6,14,28,0.8) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.07), 0 22px 48px rgba(0,0,0,0.32)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
} as const;

function formatThaiDay(dayKey: string) {
  const d = new Date(`${dayKey}T12:00:00+07:00`);
  if (Number.isNaN(d.getTime())) return dayKey;
  return d.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

function HomeFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] ${className}`}
      style={HOME_FRAME}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,209,154,0.2) 0%, transparent 68%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,209,154,0.45), transparent)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/** เลขมงคลประจำวัน — เลย์เอาต์เดิม เปลี่ยนแค่กรอบนอกให้แบบหน้าบ้าน */
export function FortuneLuckyNumbersPage() {
  const reveal = useRevealMounted();
  const [pack, setPack] = useState<DailyLuckyNumbers>(() =>
    pickDailyLuckyNumbers(),
  );
  const { token, flash } = useMaeOpenLight();

  useEffect(() => {
    const profile = readFortuneProfile();
    const seed = [profile?.nickname, profile?.birthDate]
      .filter(Boolean)
      .join("|");
    setPack(pickDailyLuckyNumbers(seed));
    flash();
  }, [flash]);

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col text-white">
      <MaePageBackground blur={16} scrollBlur={false} />
      {token > 0 ? <MaeOpenLight key={token} /> : null}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[18rem] overflow-hidden"
      >
        <Image
          src={HERO_ART}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover opacity-[0.78]"
          style={{ objectPosition: "50% 26%" }}
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 65% 48% at 50% 16%, rgba(232,209,154,0.22) 0%, transparent 58%),
              linear-gradient(180deg, rgba(6,20,42,0.15) 0%, rgba(6,20,42,0.62) 48%, #06142a 100%)
            `,
          }}
        />
      </div>

      <AnimatedPage className="relative z-[2] flex min-h-full flex-1 flex-col px-4 pb-10 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <PageBackButton href="/special" />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
            style={{
              color: GOLD,
              background: "rgba(8,16,32,0.62)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.3} />
            อัปเดตรายวัน
          </span>
        </div>

        <header className="mt-5 text-center">
          <p
            className="text-[13px] font-semibold tracking-[0.2em]"
            style={{ color: "rgba(232,209,154,0.9)" }}
          >
            ตำราแม่มั่งมี
          </p>
          <h1
            className="mae-gold-text mx-auto mt-1.5 max-w-[18rem] text-[2.05rem] font-bold tracking-tight"
            style={{
              lineHeight: 1.3,
              paddingTop: "0.12em",
              paddingBottom: "0.06em",
              filter:
                "drop-shadow(0 2px 6px rgba(6,22,48,0.85)) drop-shadow(0 0 18px rgba(20,60,120,0.35))",
            }}
          >
            เลขมงคลประจำวัน
          </h1>
          <p
            className="mx-auto mt-2 max-w-[20rem] text-[14.5px] font-medium leading-[1.5]"
            style={{
              color: "rgba(245,247,255,0.9)",
              textShadow: "0 1px 10px rgba(6,16,28,0.55)",
            }}
          >
            อ้างอิงตามหลักโหราศาสตร์ไทย · อัปเดตใหม่ทุกวัน
          </p>
          <p className="mt-1.5 text-[13px] font-medium" style={{ color: MUTED }}>
            {formatThaiDay(pack.dayKey)}
          </p>
        </header>

        <Reveal visible={reveal}>
          <HomeFrame className="mt-7">
            <div className="px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[13px] font-semibold tracking-[0.16em]"
                  style={{ color: GOLD_SOFT }}
                >
                  เลขของวันนี้
                </p>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "rgba(186,204,230,0.65)" }}
                >
                  3 เลข
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
                {pack.digits.map((n, i) => (
                  <div
                    key={`${n}-${i}`}
                    className="lucky-digit-seal flex flex-col items-center"
                    style={{ animationDelay: `${100 + i * 80}ms` }}
                  >
                    <div
                      className="relative flex aspect-square w-full items-center justify-center rounded-[22px]"
                      style={{
                        background:
                          "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(40,58,92,0.95) 0%, rgba(10,20,40,0.98) 100%)",
                        boxShadow: `
                          inset 0 0 0 1.5px rgba(232,209,154,0.55),
                          inset 0 1px 0 rgba(255,255,255,0.14),
                          0 10px 24px rgba(0,0,0,0.35)
                        `,
                      }}
                    >
                      <span
                        className="mae-gold-text relative font-sacred text-[3.2rem] font-bold leading-none tracking-tight sm:text-[3.45rem]"
                        style={{
                          filter:
                            "drop-shadow(0 2px 4px rgba(6,18,36,0.75))",
                        }}
                      >
                        {n}
                      </span>
                    </div>
                    <span
                      className="mt-2 text-[12px] font-medium"
                      style={{ color: "rgba(186,204,230,0.65)" }}
                    >
                      ลำดับ {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </HomeFrame>
        </Reveal>

        <Reveal visible={reveal}>
          <HomeFrame className="mt-3.5">
            <div className="px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: GOLD,
                    boxShadow: "0 0 8px rgba(232,209,154,0.55)",
                  }}
                />
                <p className="text-[14px] font-semibold" style={{ color: GOLD }}>
                  ความหมายของเลข
                </p>
              </div>
              <ul className="mt-3.5 space-y-3">
                {pack.digits.map((n) => (
                  <li key={`m-${n}`} className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-sacred text-[1.15rem] font-bold leading-none"
                      style={{
                        color: "#1a1408",
                        background:
                          "linear-gradient(155deg, #fff8e4 0%, #e8d19a 45%, #d5b16f 100%)",
                        boxShadow:
                          "0 4px 12px rgba(143,110,56,0.28), inset 0 1px 0 rgba(255,255,255,0.4)",
                      }}
                    >
                      {n}
                    </span>
                    <p
                      className="min-w-0 pt-0.5 text-[14.5px] font-medium leading-[1.55]"
                      style={{ color: TEXT }}
                    >
                      {luckyDigitMeaning(n)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </HomeFrame>
        </Reveal>

        <Reveal visible={reveal}>
          <HomeFrame className="mt-3.5">
            <div className="px-4 py-4 sm:px-5">
              <p className="text-[15px] font-semibold" style={{ color: GOLD }}>
                คู่เลขนำโชค
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                {[pack.pair.a, pack.pair.b].map((n, i) => (
                  <span key={`${n}-${i}`} className="flex items-center gap-2.5">
                    {i > 0 ? (
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: MUTED }}
                      >
                        ·
                      </span>
                    ) : null}
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full font-sacred text-[1.25rem] font-bold leading-none"
                      style={{
                        color: GOLD,
                        background: "rgba(8,16,32,0.55)",
                        boxShadow: "inset 0 0 0 1.5px rgba(232,209,154,0.55)",
                      }}
                    >
                      {n}
                    </span>
                  </span>
                ))}
              </div>
              <p
                className="mt-3 text-[16px] font-semibold leading-snug"
                style={{ color: TEXT }}
              >
                {pack.pair.title}
              </p>
              <p
                className="mt-1.5 text-[14.5px] font-medium leading-[1.55]"
                style={{ color: MUTED }}
              >
                {pack.pair.blurb}
              </p>
            </div>
          </HomeFrame>
        </Reveal>

        <p
          className="mx-auto mt-6 max-w-[20rem] text-center text-[13px] font-medium leading-snug"
          style={{ color: "rgba(186,204,230,0.62)" }}
        >
          เลขมงคลเป็นเครื่องเตือนใจประกอบดวง ไม่ใช่การันตีผลลัพธ์
        </p>
      </AnimatedPage>
    </div>
  );
}
