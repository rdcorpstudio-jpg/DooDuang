"use client";

import { useMemo, type ReactNode } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import {
  PremiumDetailShell,
  usePremiumProfileGate,
  useAnalyzeInputFromProfile,
} from "@/components/fortune/premium-detail-shell";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { pickZodiacDeep } from "@/lib/fortune/content/zodiac-deep";
import { buildPremiumValuePack } from "@/lib/fortune/build-premium-value-pack";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const ADVICE_STEPS = ["เลือกสิ่งสำคัญ", "ลงมือทำ", "พักให้พอ"] as const;

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";
const GOLD_SOFT = "#d5b16f";

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

const glassStyle = {
  background: MAE_GLASS.bg,
  border: MAE_GLASS.border,
  boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}`,
  backdropFilter: MAE_GLASS.blur,
  WebkitBackdropFilter: MAE_GLASS.blur,
} as const;

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
      style={{ aspectRatio: `${art.w} / ${art.h}` }}
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

function MapCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-[22px]", className)}
      style={glassStyle}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[11.5px] font-semibold tracking-[0.14em]"
      style={{ color: GOLD_SOFT }}
    >
      {children}
    </p>
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
        <p
          className="text-[12.5px] font-semibold tracking-[0.16em]"
          style={{ color: GOLD }}
        >
          ราศี{zodiacName}
        </p>
        <h1
          className="mt-1.5 text-[clamp(1.55rem,6.5vw,1.85rem)] font-bold leading-[1.35] tracking-tight"
          style={TITLE_GOLD}
        >
          แผนที่ตัวเอง
        </h1>
        <p className="mt-2 text-[14px] font-medium leading-snug text-[rgba(186,204,230,0.78)]">
          ใจความสำคัญของตัวตนคุณ
        </p>
        {chips.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: "rgba(232,209,154,0.92)" }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: GOLD_SOFT }}
                  aria-hidden
                />
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {/* Identity hero */}
      <MapCard className="mt-5">
        <div className="relative">
          <ArtSlot slot="identity" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(6,12,24,0.85))",
            }}
          />
        </div>
        <div className="px-4 py-4">
          <SectionLabel>ตัวตนของคุณ</SectionLabel>
          <p className="mt-2 text-[15px] font-medium leading-[1.6] text-white">
            {identity}
          </p>
        </div>
      </MapCard>

      {/* Strength / Shadow — stacked for readability */}
      <div className="mt-3 space-y-3">
        <MapCard>
          <div className="flex">
            <div className="relative w-[5.75rem] shrink-0 self-stretch overflow-hidden sm:w-[6.75rem]">
              <Image
                src={SELF_MAP_ART.strength.src}
                alt=""
                fill
                unoptimized
                quality={100}
                className="object-cover object-center"
                sizes="120px"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1 px-3.5 py-3.5">
              <SectionLabel>จุดแข็ง</SectionLabel>
              <ul className="mt-2.5 space-y-2">
                {strengths.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-[13.5px] font-medium leading-[1.5] text-white/90"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: GOLD_SOFT }}
                      strokeWidth={2.6}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MapCard>

        <MapCard>
          <div className="flex">
            <div className="relative w-[5.75rem] shrink-0 self-stretch overflow-hidden sm:w-[6.75rem]">
              <Image
                src={SELF_MAP_ART.shadow.src}
                alt=""
                fill
                unoptimized
                quality={100}
                className="object-cover object-center"
                sizes="120px"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1 px-3.5 py-3.5">
              <SectionLabel>เงาที่ควรรู้</SectionLabel>
              <ul className="mt-2.5 space-y-2">
                {shadows.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-[13.5px] font-medium leading-[1.5] text-white/90"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                      style={{ background: GOLD_SOFT }}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MapCard>
      </div>

      {/* Turning */}
      <MapCard className="mt-3">
        <ArtSlot slot="turning" />
        <div className="px-4 py-4">
          <SectionLabel>จุดเปลี่ยน</SectionLabel>
          <p className="mt-2 text-[15px] font-medium leading-[1.6] text-white">
            {turning}
          </p>
        </div>
      </MapCard>

      {/* Love / Work row */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <MapCard>
          <ArtSlot slot="love" />
          <div className="px-3 py-3">
            <SectionLabel>ความรัก</SectionLabel>
            <p className="mt-1.5 text-[12.5px] font-medium leading-[1.5] text-white/90">
              {love}
            </p>
          </div>
        </MapCard>
        <MapCard>
          <ArtSlot slot="work" />
          <div className="px-3 py-3">
            <SectionLabel>การงาน</SectionLabel>
            <p className="mt-1.5 text-[12.5px] font-medium leading-[1.5] text-white/90">
              {work}
            </p>
          </div>
        </MapCard>
      </div>

      {/* Quote */}
      <MapCard className="mt-3 px-4 py-5 text-center">
        <SectionLabel>คำคมประจำตัว</SectionLabel>
        <p
          className="mt-2.5 text-[1.05rem] font-semibold leading-[1.45]"
          style={TITLE_GOLD}
        >
          “{quote}”
        </p>
      </MapCard>

      {/* Advice */}
      <MapCard className="mt-3">
        <ArtSlot slot="advice" />
        <div className="px-4 py-4">
          <SectionLabel>คำแนะนำประจำตัว</SectionLabel>
          <p className="mt-2 text-[15px] font-medium leading-[1.6] text-white">
            {advice}
          </p>

          <ol className="mt-4 space-y-2">
            {ADVICE_STEPS.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5"
                style={{
                  background: "rgba(8,14,28,0.4)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums"
                  style={{
                    color: "#1a1408",
                    background:
                      "linear-gradient(155deg, #fff8e4 0%, #e8d19a 50%, #d5b16f 100%)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-[13.5px] font-semibold text-white">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </MapCard>
    </PremiumDetailShell>
  );
}
