"use client";

import { useMemo, type ReactNode } from "react";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import {
  PremiumDetailShell,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";
import { cn } from "@/lib/utils";

const ADVICE_STEPS = ["เลือกสิ่งสำคัญ", "ลงมือทำ", "พักให้พอ"] as const;

/** ภาพแผนที่ตัวตน — WebP ความละเอียดต้นฉบับ ไม่ย่อพิกเซล */
const SELF_MAP_ART = {
  identity: {
    src: "/images/premium/self-map/identity.webp",
    w: 1024,
    h: 256,
  },
  strength: {
    src: "/images/premium/self-map/strength.webp",
    w: 600,
    h: 300,
  },
  shadow: {
    src: "/images/premium/self-map/shadow.webp",
    w: 600,
    h: 300,
  },
  turning: {
    src: "/images/premium/self-map/turning.webp",
    w: 1024,
    h: 256,
  },
  love: {
    src: "/images/premium/self-map/love.webp",
    w: 600,
    h: 300,
  },
  work: {
    src: "/images/premium/self-map/career.webp",
    w: 600,
    h: 300,
  },
  advice: {
    src: "/images/premium/self-map/advice.webp",
    w: 1024,
    h: 256,
  },
} as const;

type SelfMapArtSlot = keyof typeof SELF_MAP_ART;

/** แยก bullet โดยไม่ตัดคำกลางประโยค */
function splitBullets(text: string, max = 2): string[] {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return [];

  if (/[·•]/.test(trimmed)) {
    return trimmed
      .split(/[·•]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, max);
  }

  const parts = trimmed
    .split(/(?=\s(?:การ|และ|จึง|ข้อ|ถ้า|เมื่อ|บาง))/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);

  if (parts.length >= 2) {
    return parts.slice(0, max);
  }

  return [trimmed];
}

function ArtSlot({
  slot,
  className,
}: {
  slot: SelfMapArtSlot;
  className?: string;
}) {
  const art = SELF_MAP_ART[slot];
  return (
    <div
      data-art-slot={slot}
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        aspectRatio: `${art.w} / ${art.h}`,
        borderBottom: "1.5px solid rgba(213, 177, 111, 0.55)",
      }}
      aria-hidden
    >
      <Image
        src={art.src}
        alt=""
        width={art.w}
        height={art.h}
        unoptimized
        quality={100}
        sizes="100vw"
        className="h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}

function InfographicCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-[20px]", className)}
      style={{
        background:
          "linear-gradient(165deg, rgba(24,34,52,0.92) 0%, rgba(16,24,39,0.96) 100%)",
        border: "1.5px solid rgba(213, 177, 111, 0.55)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
      }}
    >
      {children}
    </section>
  );
}

/** Full-page self map — illustration cards + short copy */
export function PremiumSelfMapPage() {
  const { ready, profile } = usePremiumProfileGate();
  const input = useAnalyzeInputFromProfile(profile);

  const data = useMemo(() => {
    if (!input) return null;
    const analysis = analyzeFortune(input);
    const deep = pickZodiacDeep(analysis.zodiac.id);
    const value = buildPremiumValuePack(input);
    const map = value.selfMap.copy;
    const chips =
      map.chips.length > 0
        ? map.chips.slice(0, 3)
        : deep.strength
            .split("·")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3);

    return {
      zodiacName: analysis.zodiac.thaiName,
      chips,
      identity: deep.personality.trim(),
      strengths: splitBullets(deep.strength, 2),
      shadows: splitBullets(deep.shadow, 2),
      turning: deep.turning.trim(),
      love: (map.love || deep.loveStyle).trim(),
      work: (map.work || deep.workStyle).trim(),
      quote: deep.advice.trim(),
      advice: (map.advice || deep.advice).trim(),
    };
  }, [input]);

  if (!ready || !data) {
    return (
      <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
        กำลังเปิด…
      </div>
    );
  }

  const {
    zodiacName,
    chips,
    identity,
    strengths,
    shadows,
    turning,
    love,
    work,
    quote,
    advice,
  } = data;

  return (
    <PremiumDetailShell>
      <header className="mt-4">
        <h1 className="text-[1.55rem] font-bold tracking-tight text-[#d5b16f]">
          แผนที่ตัวเอง
        </h1>
        <p className="mt-1 text-[14px] text-[#f7f4ec]/65">
          ราศี{zodiacName} · ใจความสำคัญ
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full px-2.5 py-1 text-[12px] font-medium text-[#e8d19a]"
              style={{
                background: "rgba(213,177,111,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      {/* Identity — art + short line */}
      <InfographicCard className="mt-4">
        <ArtSlot slot="identity" className="rounded-none rounded-t-[20px]" />
        <div className="px-3.5 py-3.5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
            ตัวตนของคุณ
          </p>
          <p className="mt-1.5 text-[14px] font-medium leading-[1.55] text-white">
            {identity}
          </p>
        </div>
      </InfographicCard>

      {/* Strength / Shadow */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <InfographicCard>
          <ArtSlot
            slot="strength"
            className="rounded-none rounded-t-[20px]"
          />
          <div className="px-2.5 py-3">
            <p className="text-[12px] font-semibold text-[#d5b16f]">จุดแข็ง</p>
            <ul className="mt-2 space-y-2">
              {strengths.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-1.5 text-[12.5px] leading-[1.5] text-white/90"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d5b16f]"
                    strokeWidth={2.6}
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </InfographicCard>

        <InfographicCard>
          <ArtSlot
            slot="shadow"
            className="rounded-none rounded-t-[20px]"
          />
          <div className="px-2.5 py-3">
            <p className="text-[12px] font-semibold text-[#d5b16f]">เงาที่ควรรู้</p>
            <ul className="mt-2 space-y-2">
              {shadows.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-1.5 text-[12.5px] leading-[1.5] text-white/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d5b16f]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </InfographicCard>
      </div>

      {/* Turning — ภาพบน ข้อความเต็มด้านล่าง อ่านง่ายกว่าแยกซ้ายขวา */}
      <InfographicCard className="mt-3">
        <ArtSlot
          slot="turning"
          className="rounded-none rounded-t-[20px]"
        />
        <div className="px-3.5 py-3.5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
            จุดเปลี่ยน
          </p>
          <p className="mt-1.5 text-[14px] font-medium leading-[1.55] text-white">
            {turning}
          </p>
        </div>
      </InfographicCard>

      {/* Love / Work */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <InfographicCard>
          <ArtSlot
            slot="love"
            className="rounded-none rounded-t-[20px]"
          />
          <div className="px-2.5 py-3">
            <p className="text-[12px] font-semibold text-[#d5b16f]">
              สไตล์ความรัก
            </p>
            <p className="mt-1.5 text-[12.5px] leading-[1.5] text-white/90">
              {love}
            </p>
          </div>
        </InfographicCard>
        <InfographicCard>
          <ArtSlot
            slot="work"
            className="rounded-none rounded-t-[20px]"
          />
          <div className="px-2.5 py-3">
            <p className="text-[12px] font-semibold text-[#d5b16f]">
              สไตล์การทำงาน
            </p>
            <p className="mt-1.5 text-[12.5px] leading-[1.5] text-white/90">
              {work}
            </p>
          </div>
        </InfographicCard>
      </div>

      {/* Quote */}
      <InfographicCard className="mt-3 px-4 py-4 text-center">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#d5b16f]">
          คำคมประจำตัว
        </p>
        <p className="mt-2 text-[15px] font-medium leading-snug text-white">
          “{quote}”
        </p>
      </InfographicCard>

      {/* Advice */}
      <InfographicCard className="mt-3 px-3.5 py-4">
        <ArtSlot
          slot="advice"
          className="rounded-[14px]"
        />
        <p className="mt-3 text-[11px] font-semibold tracking-[0.14em] text-[#d5b16f]">
          คำแนะนำประจำตัว
        </p>
        <p className="mt-1.5 text-[14px] font-medium leading-[1.55] text-white">
          {advice}
        </p>
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
          {ADVICE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <span
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#e8d19a]"
                style={{
                  background: "rgba(213,177,111,0.12)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
                }}
              >
                {step}
              </span>
              {i < ADVICE_STEPS.length - 1 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-[#d5b16f]"
                  strokeWidth={2.2}
                />
              ) : null}
            </div>
          ))}
        </div>
      </InfographicCard>
    </PremiumDetailShell>
  );
}
