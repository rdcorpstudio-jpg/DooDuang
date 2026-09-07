"use client";

import { useId } from "react";

/**
 * Home hero — grand sacred zodiac chart (อลังการ, เส้นคม).
 */

const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

const GLYPHS: Record<(typeof SIGNS)[number], string> = {
  aries: "M6 18 V10 C6 6 10 5 12 9 C14 5 18 6 18 10 V18",
  taurus: "M8 7 H16 M12 7 V11 M8 14 A4 4 0 0 0 16 14 A4 4 0 0 0 8 14",
  gemini: "M8 5 V19 M16 5 V19 M8 8 H16 M8 16 H16",
  cancer: "M7 10 A3 3 0 1 0 7 10.1 M17 14 A3 3 0 1 0 17 14.1 M10 10 H14 M10 14 H14",
  leo: "M8 16 A4 4 0 1 1 14 12 C16 10 18 8 16 6 M14 16 H18",
  virgo: "M6 5 V15 A3 3 0 0 0 12 15 V5 M12 5 V15 A3 3 0 0 0 18 15 M15 15 L19 19",
  libra: "M6 16 H18 M8 12 H16 M12 6 V12",
  scorpio: "M5 5 V14 A3 3 0 0 0 11 14 V5 M11 5 V14 A3 3 0 0 0 17 14 L20 11 M17 14 V18",
  sagittarius: "M6 18 L18 6 M12 6 H18 V12 M8 10 L14 16",
  capricorn: "M6 8 A3 3 0 0 1 12 8 V16 A3 3 0 0 0 18 16 M12 16 H15",
  aquarius: "M5 10 C8 7 10 13 13 10 C16 7 18 13 21 10 M5 16 C8 13 10 19 13 16 C16 13 18 19 21 16",
  pisces: "M8 5 C4 9 4 15 8 19 M16 5 C20 9 20 15 16 19 M6 12 H18",
};

const PLANETS = [
  "M12 5 A5 5 0 1 0 12 19 A5 5 0 1 0 12 5 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22",
  "M14 8 A5 5 0 1 1 9 16",
  "M12 5 V14 M9 8 H15 M12 14 L8 19 M12 14 L16 19",
  "M12 7 A4 4 0 1 0 12 17 A4 4 0 1 0 12 7 M12 3 V7",
  "M12 4 V20 M8 8 L12 4 L16 8 M7 14 H17",
  "M8 6 H16 M12 6 V18 M8 18 H16",
  "M7 8 H17 M12 5 V14 M8 17 A4 4 0 0 0 16 17",
  "M8 7 H16 M12 7 V18 M9 12 H15",
] as const;

const SPARKS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: 4 + ((i * 29) % 92),
  left: 3 + ((i * 41) % 94),
  size: i % 4 === 0 ? 2.6 : i % 3 === 0 ? 1.8 : 1.2,
  delay: (i * 0.22) % 3.5,
  duration: 2 + (i % 5) * 0.4,
}));

const RESULT_SPARKS = SPARKS.filter((_, i) => i % 3 === 0).map((s) => ({
  ...s,
  size: Math.max(1.1, s.size * 0.85),
}));

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const SIZE = 560;
const CX = 280;
const CY = 280;
const R_OUTER = 248;
const R_GLYPH = 204;
const R_PLANET = 152;
const R_INNER = 108;

export function AstroHeroOrb({
  className,
  watermark = false,
  tone = "default",
}: {
  className?: string;
  watermark?: boolean;
  /** Result page: soft gold, no side-clip blooms */
  tone?: "default" | "result";
}) {
  const uid = useId().replace(/:/g, "");
  const idRay = `ah-ray-${uid}`;
  const idGold = `ah-gold-${uid}`;
  const idGold2 = `ah-gold-2-${uid}`;
  const idGold3 = `ah-gold-3-${uid}`;
  const idCore = `ah-core-${uid}`;
  const isResult = tone === "result" && !watermark;
  const sparks = isResult ? RESULT_SPARKS : SPARKS;

  return (
    <div className={className} aria-hidden>
      <div
        className={
          watermark
            ? "astro-hero astro-hero-watermark relative mx-auto aspect-square w-full max-w-none"
            : isResult
              ? "astro-hero astro-hero-result relative mx-auto aspect-square w-full max-w-none"
              : "astro-hero relative mx-auto aspect-square w-full max-w-[352px]"
        }
      >
        {!watermark ? (
          <>
            <div
              className={
                isResult
                  ? "astro-hero-rays astro-hero-rays-result absolute inset-[4%] rounded-full"
                  : "astro-hero-rays absolute inset-[-8%] rounded-full"
              }
            />
            <div
              className={
                isResult
                  ? "astro-hero-bloom-gold astro-hero-bloom-result absolute inset-[8%] rounded-full"
                  : "astro-hero-bloom-gold absolute inset-[2%] rounded-full"
              }
            />
            {!isResult ? (
              <div className="astro-hero-bloom-violet absolute inset-[14%] rounded-full" />
            ) : null}
            {sparks.map((s) => (
              <span
                key={s.id}
                className="astro-hero-spark absolute rounded-full"
                style={
                  {
                    top: `${s.top}%`,
                    left: `${s.left}%`,
                    width: s.size,
                    height: s.size,
                    "--spark-delay": `${s.delay}s`,
                    "--spark-duration": `${s.duration}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </>
        ) : null}

        {/* Soft spinning light rays */}
        {!watermark ? (
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="astro-hero-ray-lines absolute inset-0 z-0 h-full w-full"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient id={idRay} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f0d78c" stopOpacity="0" />
                <stop offset="50%" stopColor="#f0d78c" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f0d78c" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: isResult ? 8 : 12 }).map((_, i) => {
              const deg = i * (isResult ? 45 : 30) + 15;
              const a = polar(CX, CY, 40, deg);
              const b = polar(CX, CY, R_OUTER + (isResult ? 4 : 18), deg);
              return (
                <line
                  key={`ray-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={`url(#${idRay})`}
                  strokeWidth={i % 2 === 0 ? 1.2 : 0.55}
                  opacity={i % 2 === 0 ? (isResult ? 0.4 : 0.55) : 0.28}
                />
              );
            })}
          </svg>
        ) : null}

        <div
          className={
            isResult
              ? "absolute inset-[5.5%] z-[1]"
              : "absolute inset-0 z-[1]"
          }
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="astro-hero-wheel absolute inset-0 h-full w-full"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient
                id={idGold}
                x1="40"
                y1="20"
                x2="520"
                y2="540"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#fff9e6" />
                <stop offset="30%" stopColor="#f5e09a" />
                <stop offset="55%" stopColor="#d4af37" />
                <stop offset="80%" stopColor="#a67c00" />
                <stop offset="100%" stopColor="#f0d78c" />
              </linearGradient>
            </defs>

            {/* Triple outer rim */}
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER + 14}
              stroke={`url(#${idGold})`}
              strokeWidth="0.7"
              opacity="0.3"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER + 6}
              stroke={`url(#${idGold})`}
              strokeWidth="1.1"
              opacity="0.5"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER}
              stroke={`url(#${idGold})`}
              strokeWidth="2.6"
              opacity="1"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER - 10}
              stroke={`url(#${idGold})`}
              strokeWidth="0.85"
              opacity="0.55"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER - 20}
              stroke={`url(#${idGold})`}
              strokeWidth="0.6"
              opacity="0.35"
              strokeDasharray="2 5"
            />

            {Array.from({ length: 96 }).map((_, i) => {
              const deg = i * 3.75;
              const major = i % 8 === 0;
              const mid = i % 2 === 0;
              const a = polar(CX, CY, R_OUTER - (major ? 20 : mid ? 12 : 8), deg);
              const b = polar(CX, CY, R_OUTER - 1, deg);
              return (
                <line
                  key={`t-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={`url(#${idGold})`}
                  strokeWidth={major ? 1.6 : mid ? 0.7 : 0.4}
                  opacity={major ? 1 : mid ? 0.5 : 0.28}
                />
              );
            })}

            {/* Ornate cardinal markers */}
            {[0, 90, 180, 270].map((deg) => {
              const p = polar(CX, CY, R_OUTER + 4, deg);
              const tip = polar(CX, CY, R_OUTER + 16, deg);
              return (
                <g key={deg}>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={tip.x}
                    y2={tip.y}
                    stroke={`url(#${idGold})`}
                    strokeWidth="1.4"
                    opacity="0.9"
                  />
                  <rect
                    x={tip.x - 4}
                    y={tip.y - 4}
                    width="8"
                    height="8"
                    fill={`url(#${idGold})`}
                    transform={`rotate(45 ${tip.x} ${tip.y})`}
                  />
                </g>
              );
            })}

            {SIGNS.map((_, i) => {
              const deg = i * 30;
              const a = polar(CX, CY, R_INNER + 12, deg);
              const b = polar(CX, CY, R_OUTER - 22, deg);
              return (
                <line
                  key={`r-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={`url(#${idGold})`}
                  strokeWidth={i % 3 === 0 ? 1.5 : 0.65}
                  opacity={i % 3 === 0 ? 0.9 : 0.35}
                />
              );
            })}

            <circle
              cx={CX}
              cy={CY}
              r={R_INNER + 20}
              stroke={`url(#${idGold})`}
              strokeWidth="1.3"
              opacity="0.75"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER + 8}
              stroke={`url(#${idGold})`}
              strokeWidth="0.7"
              opacity="0.4"
            />

            {SIGNS.map((name, i) => {
              const deg = i * 30 + 15;
              const p = polar(CX, CY, R_GLYPH, deg);
              return (
                <g key={name} transform={`translate(${p.x - 13}, ${p.y - 13}) scale(1.12)`}>
                  <path
                    d={GLYPHS[name]}
                    stroke={`url(#${idGold})`}
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="1"
                  />
                </g>
              );
            })}
          </svg>

          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="astro-hero-planets absolute inset-0 h-full w-full"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient
                id={idGold2}
                x1="40"
                y1="20"
                x2="520"
                y2="540"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#fff9e6" />
                <stop offset="50%" stopColor="#e8c547" />
                <stop offset="100%" stopColor="#c9a227" />
              </linearGradient>
            </defs>
            <circle
              cx={CX}
              cy={CY}
              r={R_PLANET}
              stroke={`url(#${idGold2})`}
              strokeWidth="0.9"
              opacity="0.55"
              strokeDasharray="3 5"
            />
            {PLANETS.map((d, i) => {
              const deg = i * (360 / PLANETS.length) + 10;
              const p = polar(CX, CY, R_PLANET, deg);
              return (
                <g key={i} transform={`translate(${p.x - 10}, ${p.y - 10}) scale(0.88)`}>
                  <path
                    d={d}
                    stroke={`url(#${idGold2})`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                </g>
              );
            })}
          </svg>

          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="astro-hero-core absolute inset-0 z-[1] h-full w-full"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient
                id={idGold3}
                x1="80"
                y1="60"
                x2="460"
                y2="480"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#fff9e6" />
                <stop offset="45%" stopColor="#f0d78c" />
                <stop offset="100%" stopColor="#c9a227" />
              </linearGradient>
              <radialGradient id={idCore} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#f0d78c" stopOpacity="0.5" />
                <stop
                  offset="55%"
                  stopColor={isResult ? "#e8c547" : "#a78bfa"}
                  stopOpacity={isResult ? 0.14 : 0.18}
                />
                <stop
                  offset="100%"
                  stopColor={isResult ? "#c9a227" : "#7c3aed"}
                  stopOpacity="0"
                />
              </radialGradient>
            </defs>

            <circle cx={CX} cy={CY} r={R_INNER} fill={`url(#${idCore})`} />
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER - 2}
              stroke={`url(#${idGold3})`}
              strokeWidth="1.5"
              opacity="0.85"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER - 22}
              stroke={`url(#${idGold3})`}
              strokeWidth="0.8"
              opacity="0.5"
              strokeDasharray="3 4"
            />

            {/* Dual orbits */}
            <ellipse
              cx={CX}
              cy={CY + 2}
              rx={R_INNER - 14}
              ry={26}
              stroke={`url(#${idGold3})`}
              strokeWidth="1.7"
              opacity="0.95"
              transform={`rotate(-18 ${CX} ${CY + 2})`}
            />
            <ellipse
              cx={CX}
              cy={CY + 2}
              rx={R_INNER - 28}
              ry={16}
              stroke={`url(#${idGold3})`}
              strokeWidth="0.8"
              opacity="0.45"
              transform={`rotate(28 ${CX} ${CY + 2})`}
            />
            <circle cx={CX + 80} cy={CY - 8} r="6" fill={`url(#${idGold3})`} />
            <circle cx={CX + 80} cy={CY - 8} r="2.6" fill="#fffef8" />
            <circle
              cx={CX - 52}
              cy={CY + 18}
              r="3.5"
              fill={`url(#${idGold3})`}
              opacity="0.85"
            />

            <path
              d={`M ${CX} ${CY - 48}
                C ${CX + 5.5} ${CY - 11} ${CX + 11} ${CY - 5.5} ${CX + 48} ${CY}
                C ${CX + 11} ${CY + 5.5} ${CX + 5.5} ${CY + 11} ${CX} ${CY + 48}
                C ${CX - 5.5} ${CY + 11} ${CX - 11} ${CY + 5.5} ${CX - 48} ${CY}
                C ${CX - 11} ${CY - 5.5} ${CX - 5.5} ${CY - 11} ${CX} ${CY - 48} Z`}
              fill={`url(#${idGold3})`}
            />
            <path
              d={`M ${CX} ${CY - 28}
                C ${CX + 3.2} ${CY - 6.5} ${CX + 6.5} ${CY - 3.2} ${CX + 28} ${CY}
                C ${CX + 6.5} ${CY + 3.2} ${CX + 3.2} ${CY + 6.5} ${CX} ${CY + 28}
                C ${CX - 3.2} ${CY + 6.5} ${CX - 6.5} ${CY + 3.2} ${CX - 28} ${CY}
                C ${CX - 6.5} ${CY - 3.2} ${CX - 3.2} ${CY - 6.5} ${CX} ${CY - 28} Z`}
              fill="#fffef8"
            />
            <circle cx={CX} cy={CY} r="6" fill="#fffef8" />
          </svg>
        </div>

        {!watermark && !isResult ? (
          <div className="astro-hero-floor absolute bottom-[-2%] left-[12%] right-[12%] h-[16%] rounded-full" />
        ) : null}
        {isResult ? (
          <div className="astro-hero-floor-result absolute bottom-[6%] left-[18%] right-[18%] h-[10%] rounded-full" />
        ) : null}
      </div>
    </div>
  );
}
