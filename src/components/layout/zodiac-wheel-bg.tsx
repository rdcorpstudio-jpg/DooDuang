"use client";

/**
 * Rose-gold zodiac chart — pure SVG geometry + letterforms.
 * No emoji glyphs.
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

/** Minimal line-art zodiac marks (stroke paths in 24×24) */
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
  "M12 5 A5 5 0 1 0 12 19 A5 5 0 1 0 12 5 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22", // sun
  "M14 8 A5 5 0 1 1 9 16", // moon
  "M12 5 V14 M9 8 H15 M12 14 L8 19 M12 14 L16 19", // mercury-ish
  "M12 7 A4 4 0 1 0 12 17 A4 4 0 1 0 12 7 M12 3 V7", // venus-ish
  "M12 4 V20 M8 8 L12 4 L16 8 M7 14 H17", // mars-ish
  "M8 6 H16 M12 6 V18 M8 18 H16", // jupiter cross
  "M7 8 H17 M12 5 V14 M8 17 A4 4 0 0 0 16 17", // saturn-ish
  "M8 7 H16 M12 7 V18 M9 12 H15", // node-ish
] as const;

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function ZodiacWheelBg({ className }: { className?: string }) {
  const size = 800;
  const cx = 400;
  const cy = 400;

  const rOuter = 360;
  const rName = 330;
  const rGlyph = 255;
  const rMid = 210;
  const rPlanet = 155;
  const rInner = 110;
  const rCore = 52;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="roseGold" x1="120" y1="80" x2="680" y2="720" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="35%" stopColor="#e8c47a" />
          <stop offset="70%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#f0d5a0" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#e8c47a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rings */}
      {[rOuter, 300, rMid, rInner, rCore + 18].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#roseGold)"
          strokeWidth={i === 0 ? 1.8 : 1.15}
          opacity={0.9 - i * 0.04}
        />
      ))}
      <circle cx={cx} cy={cy} r={rGlyph + 28} stroke="url(#roseGold)" strokeWidth="0.8" opacity="0.55" strokeDasharray="2 6" />

      {/* 12 divisions */}
      {SIGNS.map((_, i) => {
        const deg = i * 30;
        const a = polar(cx, cy, rInner, deg);
        const b = polar(cx, cy, rOuter, deg);
        return (
          <line
            key={`ray-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#roseGold)"
            strokeWidth={i % 3 === 0 ? 1.35 : 0.7}
            opacity={i % 3 === 0 ? 0.8 : 0.45}
          />
        );
      })}

      {/* Outer sign names */}
      {SIGNS.map((name, i) => {
        const deg = i * 30 + 15;
        const p = polar(cx, cy, rName, deg);
        return (
          <text
            key={name}
            x={p.x}
            y={p.y}
            fill="url(#roseGold)"
            fontSize="15"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="400"
            letterSpacing="0.14em"
            textAnchor="middle"
            dominantBaseline="middle"
            opacity="0.92"
            transform={`rotate(${deg} ${p.x} ${p.y})`}
          >
            {name}
          </text>
        );
      })}

      {/* Zodiac glyphs — SVG paths, not emoji */}
      {SIGNS.map((name, i) => {
        const deg = i * 30 + 15;
        const p = polar(cx, cy, rGlyph, deg);
        return (
          <g
            key={`g-${name}`}
            transform={`translate(${p.x - 14}, ${p.y - 14}) scale(1.15)`}
          >
            <path
              d={GLYPHS[name]}
              stroke="url(#roseGold)"
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
          </g>
        );
      })}

      {/* Inner planet marks */}
      {PLANETS.map((d, i) => {
        const deg = i * (360 / PLANETS.length) + 12;
        const p = polar(cx, cy, rPlanet, deg);
        return (
          <g key={`p-${i}`} transform={`translate(${p.x - 10}, ${p.y - 10}) scale(0.85)`}>
            <path
              d={d}
              stroke="url(#roseGold)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>
        );
      })}

      {/* Core sunburst */}
      <circle cx={cx} cy={cy} r="70" fill="url(#coreGlow)" opacity="0.55" />
      {Array.from({ length: 16 }).map((_, i) => {
        const deg = i * 22.5;
        const inner = polar(cx, cy, 18, deg);
        const outer = polar(cx, cy, i % 2 === 0 ? 48 : 36, deg);
        return (
          <line
            key={`sun-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="url(#roseGold)"
            strokeWidth={i % 2 === 0 ? 1.3 : 0.7}
            opacity="0.85"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="10" fill="#fff8e8" opacity="0.95" />
      <circle cx={cx} cy={cy} r="16" stroke="url(#roseGold)" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
