"use client";

import { useId, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function scoreFrom(seed: string, salt: string, min = 35, max = 92) {
  const n = hashSeed(`${seed}-${salt}`);
  return min + (n % (max - min + 1));
}

const AXES = [
  { key: "self", label: "ความเป็นตัวเอง" },
  { key: "express", label: "การแสดงออก" },
  { key: "money", label: "เซนส์เรื่องเงิน" },
  { key: "duty", label: "ความรับผิดชอบ" },
  { key: "learn", label: "การเรียนรู้" },
  { key: "flex", label: "ความยืดหยุ่นทางใจ" },
] as const;

const ELEMENTS = [
  { key: "wood", label: "ไม้", color: "#4ade80" },
  { key: "fire", label: "ไฟ", color: "#fb923c" },
  { key: "earth", label: "ดิน", color: "#F4BC52" },
  { key: "metal", label: "โลหะ", color: "#F7F8FF" },
  { key: "water", label: "น้ำ", color: "#46DDED" },
] as const;

type Spectrum = {
  left: string;
  right: string;
  leftPct: number;
};

function RadarChart({
  values,
}: {
  values: { label: string; score: number }[];
}) {
  const gid = useId().replace(/:/g, "");
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 96;
  const n = values.length;

  const angleAt = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => {
    const a = angleAt(i);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const poly = values
    .map((v, i) => {
      const p = point(i, (v.score / 100) * maxR);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[300px]">
      <defs>
        <linearGradient id={`radar-fill-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(244,188,82,0.35)" />
          <stop offset="100%" stopColor="rgba(70,221,237,0.2)" />
        </linearGradient>
      </defs>

      {rings.map((r) => (
        <polygon
          key={r}
          points={Array.from({ length: n }, (_, i) => {
            const p = point(i, maxR * r);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}

      {values.map((_, i) => {
        const p = point(i, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={poly}
        fill={`url(#radar-fill-${gid})`}
        stroke="#F4BC52"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {values.map((v, i) => {
        const p = point(i, (v.score / 100) * maxR);
        const tip = point(i, maxR + 22);
        return (
          <g key={v.label}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#F4BC52" />
            <text
              x={tip.x}
              y={tip.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(247,248,255,0.75)"
              fontSize={9}
            >
              {v.label}
            </text>
            <text
              x={tip.x}
              y={tip.y + 12}
              textAnchor="middle"
              fill="#F4BC52"
              fontSize={10}
              fontWeight={700}
            >
              {v.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SpectrumRow({ item }: { item: Spectrum }) {
  const rightPct = 100 - item.leftPct;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#F7F8FF]/90">
          {item.left} {item.leftPct}%
        </span>
        <span className="text-[#9AB8DC]">
          {item.right} {rightPct}%
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.08]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${item.leftPct}%`,
            background:
              "linear-gradient(90deg, rgba(244,188,82,0.85), rgba(244,188,82,0.45))",
          }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#F4BC52] ring-2 ring-[#0C1427]"
          style={{ left: `calc(${item.leftPct}% - 7px)` }}
        />
      </div>
    </div>
  );
}

/** Premium deep self analysis — radar, spectra, five elements (end of premium page) */
export function FortunePremiumSelfDeep({
  seed,
  nickname,
  className,
}: {
  seed: string;
  nickname: string;
  className?: string;
}) {
  const data = useMemo(() => {
    const axes = AXES.map((a) => ({
      label: a.label,
      score: scoreFrom(seed, a.key),
    }));
    const top = [...axes].sort((a, b) => b.score - a.score)[0]!;
    const low = [...axes].sort((a, b) => a.score - b.score)[0]!;

    const spectra: Spectrum[] = [
      {
        left: "เก็บตัว",
        right: "เข้าสังคม",
        leftPct: scoreFrom(seed, "intro", 55, 88),
      },
      {
        left: "ใช้อารมณ์",
        right: "ใช้เหตุผล",
        leftPct: scoreFrom(seed, "emotion", 25, 55),
      },
      {
        left: "ประนีประนอม",
        right: "เป็นอิสระ",
        leftPct: scoreFrom(seed, "compromise", 40, 75),
      },
      {
        left: "ชอบความมั่นคง",
        right: "ชอบความท้าทาย",
        leftPct: scoreFrom(seed, "stable", 55, 90),
      },
    ];

    const rawElements = ELEMENTS.map((e) => ({
      ...e,
      weight: hashSeed(`${seed}-el-${e.key}`) % 100,
    }));
    const sum = rawElements.reduce((s, e) => s + e.weight, 0) || 1;
    let elements = rawElements.map((e) => ({
      ...e,
      pct: Math.round((e.weight / sum) * 100),
    }));
    const drift = 100 - elements.reduce((s, e) => s + e.pct, 0);
    elements = elements.map((e, i) =>
      i === 0 ? { ...e, pct: e.pct + drift } : e
    );
    const strongest = [...elements].sort((a, b) => b.pct - a.pct)[0]!;
    const missing = elements.filter((e) => e.pct <= 5);

    const strengthLevel =
      top.score >= 80 ? "แข็งแกร่งชัด" : top.score >= 65 ? "แข็งแกร่งปานกลาง" : "สมดุล";
    const styleType = spectra[0]!.leftPct >= 60 ? "แบบใน" : "แบบนอก";

    return {
      axes,
      top,
      low,
      spectra,
      elements,
      strongest,
      missing,
      strengthLevel,
      styleType,
    };
  }, [seed]);

  const name = nickname.trim() || "คุณ";

  return (
    <section
      className={cn(
        "fortune-glass overflow-hidden rounded-[20px] px-4 py-4",
        className
      )}
    >
      <div className="text-center">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#E4C56A]/90">
          PREMIUM · SELF MAP
        </p>
        <h2 className="font-sacred mt-1.5 text-[1.4rem] leading-snug text-[#F7F8FF]">
          คุณ{name}เป็นคนแบบไหนกันนะ
        </h2>
      </div>

      <div className="mt-4">
        <RadarChart values={data.axes} />
        <p className="mt-1 px-2 text-center text-[12px] leading-relaxed text-[#B7C3D8]">
          6 แกนอุปนิสัยที่คำนวณจากพลังชีวิตของคุณ
        </p>
      </div>

      <p className="mt-4 border-t border-white/[0.08] pt-3.5 text-[13px] leading-[1.7] text-[#E8EEF8]">
        {data.top.label} {data.top.score} คะแนน · {data.low.label}{" "}
        {data.low.score} คะแนน — สันดานติดตัวของคุณคือเครื่องยนต์ที่ขับเคลื่อน
        ดวงชีวิตทั้งชีวิต
      </p>

      <div className="mt-4 space-y-3 border-t border-white/[0.08] pt-3.5">
        {data.spectra.map((item) => (
          <SpectrumRow key={item.left} item={item} />
        ))}
      </div>

      <div className="mt-4 space-y-2.5 border-t border-white/[0.08] pt-3.5">
        <p className="text-[15px] font-semibold text-[#F7F8FF]">
          {data.strengthLevel} · {data.styleType}
        </p>
        <p className="text-[13px] leading-[1.75] text-[#E8EEF8]">
          “{data.top.label}ของคุณสูงถึง {data.top.score} คะแนน แต่
          {data.low.label}อยู่ที่ {data.low.score} คะแนน ดวงนี้เลยเป็นแบบที่จุดแข็งก็ชัด
          จุดอ่อนก็ชัดเช่นกัน”
        </p>
        <p className="text-[13px] leading-[1.7] text-[#B7C3D8]">
          {data.styleType}ที่ธาตุ{data.strongest.label}แรง เป็นการผสมผสานที่ทำให้คุณ
          มีจังหวะชีวิตเฉพาะตัวชัดเจน
        </p>
      </div>

      <div className="mt-4 border-t border-white/[0.08] pt-3.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
          ห้าธาตุในตัวคุณ
        </p>
        <h3 className="mt-1 text-[15px] font-semibold text-[#F7F8FF]">
          การกระจายห้าธาตุ
        </h3>

        <div className="mt-3 space-y-2.5">
          {data.elements.map((el) => (
            <div key={el.key} className="flex items-center gap-2.5">
              <span
                className="w-10 shrink-0 text-[13px] font-semibold"
                style={{ color: el.color }}
              >
                {el.label}
              </span>
              <div className="relative h-2.5 min-w-0 flex-1 rounded-full bg-white/[0.08]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${el.pct}%`,
                    background: el.color,
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-[#B7C3D8]">
                {el.pct}%
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
            อ่านธาตุ
          </p>
          <p className="mt-1.5 text-[13px] leading-[1.7] text-[#E8EEF8]">
            ธาตุ{data.strongest.label}เด่นสุดที่ {data.strongest.pct}%
            {data.missing.length
              ? ` ในขณะที่${data.missing.map((m) => m.label).join("และ")}เกือบหายไป`
              : " และธาตุอื่นกระจายพอสมควร"}
            — ความไม่สมดุลนี้คือต้นทางของจุดแข็งและจุดที่ควรเติมในชีวิตจริง
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-white/[0.08] pt-3 text-[11px] text-[#B7C3D8]/80">
        <Sparkles className="h-3 w-3 text-[#E4C56A]" strokeWidth={1.8} />
        ส่วนพรีเมียมท้ายรายงาน · วิเคราะห์เฉพาะคุณ
      </div>
    </section>
  );
}
