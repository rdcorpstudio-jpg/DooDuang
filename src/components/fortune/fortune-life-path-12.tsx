"use client";

import { useId, useMemo, useState } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Coins,
  Heart,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const YEAR_THEMES = [
  { short: "เริ่มใหม่", title: "วางรากฐานใหม่", body: "ปีแห่งการตั้งต้นอีกครั้ง เหมาะกับการจัดระบบชีวิตและเลือกทิศทางที่ชัดขึ้น" },
  { short: "วางฐาน", title: "สร้างฐานที่มั่นคง", body: "โฟกัสงานรากฐาน ทักษะ และนิสัยเล็ก ๆ ที่ทำซ้ำได้ จะกลายเป็นแรงส่งระยะยาว" },
  { short: "ขยายทาง", title: "เปิดโอกาสใหม่", body: "จังหวะเหมาะกับการลองแนวทางใหม่ ขยายเครือข่าย และรับงานที่ท้าทายขึ้นเล็กน้อย" },
  { short: "ทดสอบ", title: "ทดสอบความอดทน", body: "อาจมีแรงกดดันและการตัดสินใจยาก ใช้เป็นบทเรียนจัดลำดับความสำคัญให้ชัด" },
  { short: "เก็บเกี่ยว", title: "เก็บเกี่ยวผลงาน", body: "ผลจากความพยายามก่อนหน้าเริ่มเห็นชัด เหมาะกับการปิดงานสำคัญและสร้างชื่อเสียง" },
  { short: "ปรับสมดุล", title: "ปรับสมดุลชีวิต", body: "ชวนหันมาดูแลร่างกาย ความสัมพันธ์ และจังหวะพักผ่อนควบคู่กับเป้าหมายใหญ่" },
  { short: "ก้าวกระโดด", title: "ก้าวกระโดดครั้งใหญ่", body: "โอกาสสำคัญอาจเข้ามา กล้าตัดสินใจด้วยข้อมูล และอย่ารอความพร้อมแบบสมบูรณ์แบบ" },
  { short: "เชื่อมโยง", title: "เชื่อมโยงผู้คน", body: "พลังด้านคนรอบตัวเด่นขึ้น ความร่วมมือและการสื่อสารชัดจะพาคุณไปได้ไกล" },
  { short: "ลึกซึ้ง", title: "เข้าใจตัวตนลึกขึ้น", body: "ปีแห่งการทบทวนภายใน เหมาะกับการปล่อยสิ่งเก่าและนิยามความสำเร็จในแบบของคุณ" },
  { short: "สร้างสรรค์", title: "ปล่อยพลังสร้างสรรค์", body: "ไอเดียไหลดี ใช้จังหวะนี้สร้างผลงานหรือปรับภาพลักษณ์ให้ตรงกับตัวตนจริง" },
  { short: "มั่นคง", title: "สร้างความมั่นคง", body: "เหมาะกับการวางแผนการเงิน งานระยะยาว และการเลือกรากฐานที่อยู่ได้นาน" },
  { short: "ปิดรอบ", title: "ปิดรอบแล้วเริ่มใหม่", body: "สรุปบทเรียนทั้งรอบ ปิดสิ่งที่ไม่ใช่ และเตรียมตัวสำหรับบทต่อไปด้วยใจที่เบาขึ้น" },
] as const;

const DOMAIN_TIPS = [
  { work: "จัดระบบ", money: "วางแผน", love: "สื่อสาร" },
  { work: "โฟกัส", money: "เก็บออม", love: "เปิดใจ" },
  { work: "ขยายงาน", money: "ลงทุนระวัง", love: "ให้เวลา" },
  { work: "อดทน", money: "ชะลอใช้", love: "ฟังก่อน" },
  { work: "ปิดงาน", money: "เก็บเกี่ยว", love: "ฉลองด้วยกัน" },
  { work: "บาลานซ์", money: "จัดงบ", love: "ดูแลกัน" },
  { work: "กล้าตัดสิน", money: "คว้าโอกาส", love: "จริงใจ" },
  { work: "ร่วมมือ", money: "แบ่งปัน", love: "เชื่อมโยง" },
  { work: "ทบทวน", money: "จัดระเบียบ", love: "เข้าใจกัน" },
  { work: "สร้างใหม่", money: "ใช้สร้างสรรค์", love: "สนุกด้วยกัน" },
  { work: "วางราก", money: "มั่นคง", love: "ผูกพัน" },
  { work: "สรุปบท", money: "เคลียร์บัญชี", love: "ปล่อยวาง" },
] as const;

function smoothLine(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** 02 เส้นทางชีวิต 12 ปี — paid block */
export function FortuneLifePath12({
  seed = "dooduang",
  locked = false,
  onUnlock,
  className,
}: {
  seed?: string;
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const years = useMemo(
    () =>
      YEAR_THEMES.map((theme, i) => {
        const score = 3 + (hashSeed(`${seed}-lp-${i}`) % 9);
        const tips = DOMAIN_TIPS[hashSeed(`${seed}-tip-${i}`) % DOMAIN_TIPS.length]!;
        return { year: i + 1, score, ...theme, tips };
      }),
    [seed]
  );

  const [active, setActive] = useState(0);
  const current = years[active] ?? years[0]!;

  const W = 360;
  const H = 118;
  const padX = 18;
  const padTop = 28;
  const padBottom = 18;
  const pts = years.map((y, i) => ({
    x: padX + (i * (W - padX * 2)) / Math.max(1, years.length - 1),
    y: padTop + ((12 - y.score) / 11) * (H - padTop - padBottom),
    label: y.short,
  }));
  const line = smoothLine(pts);

  function shift(delta: number) {
    setActive((v) => Math.max(0, Math.min(11, v + delta)));
  }

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-cyan relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-white">
            <span className="text-[#67e8f9]">02</span> เส้นทางชีวิต 12 ปี
          </p>
          <p className="mt-0.5 text-[9.5px] tracking-[0.16em] text-white/35">
            LIFE PATH
          </p>
        </div>
        <p className="max-w-[9.5rem] text-right text-[10px] leading-snug text-white/38">
          ทุกช่วงเวลามีความหมาย และพาคุณไปสู่เวอร์ชันที่ดีกว่า
        </p>
      </div>

      {/* Graph — bg image placeholder */}
      <div
        className="relative mx-3.5 mt-3 overflow-hidden rounded-[14px]"
        data-slot="paid-lifepath-chart-bg"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 70% at 50% 0%, rgba(56,189,248,0.12), transparent 60%), linear-gradient(180deg, rgba(10,12,36,0.9), rgba(8,8,24,0.96))",
          }}
        />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="relative w-full"
          role="img"
          aria-label="กราฟเส้นทางชีวิต 12 ปี"
        >
          <defs>
            <linearGradient id={`lp-stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="55%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id={`lp-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(167,139,250,0.28)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0)" />
            </linearGradient>
          </defs>

          {pts.map((p, i) => (
            <line
              key={`g-${i}`}
              x1={p.x}
              y1={padTop - 8}
              x2={p.x}
              y2={H - 8}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          <path
            d={`${line} L ${pts[pts.length - 1]!.x} ${H - 8} L ${pts[0]!.x} ${H - 8} Z`}
            fill={`url(#lp-fill-${gid})`}
          />
          <path
            d={line}
            fill="none"
            stroke={`url(#lp-stroke-${gid})`}
            strokeWidth={2.4}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.55))" }}
          />

          {pts.map((p, i) => {
            const selected = i === active;
            return (
              <g
                key={`p-${i}`}
                className="cursor-pointer"
                onClick={() => setActive(i)}
              >
                <text
                  x={p.x}
                  y={Math.max(12, p.y - 12)}
                  textAnchor="middle"
                  fill={selected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)"}
                  fontSize={7.5}
                >
                  {p.label}
                </text>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={selected ? 4.5 : 3.2}
                  fill={selected ? "#fff" : "rgba(255,255,255,0.85)"}
                  stroke={selected ? "#67e8f9" : "rgba(255,255,255,0.2)"}
                  strokeWidth={selected ? 2 : 1}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Year selector */}
      <div className="mt-2.5 flex items-center gap-1 px-2.5">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={active === 0}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-white/45 transition enabled:active:bg-white/[0.06] disabled:opacity-30"
          aria-label="ปีก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {years.map((y, i) => {
            const selected = i === active;
            return (
              <button
                key={y.year}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1.5 text-[10.5px] font-medium transition",
                  selected
                    ? "bg-sky-400/90 text-[#071018] shadow-[0_0_14px_rgba(56,189,248,0.45)]"
                    : "bg-white/[0.04] text-white/50 ring-1 ring-white/[0.08]"
                )}
              >
                ปีที่ {y.year}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => shift(1)}
          disabled={active === 11}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-white/45 transition enabled:active:bg-white/[0.06] disabled:opacity-30"
          aria-label="ปีถัดไป"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Detail panel */}
      <div className="m-3.5 mt-2.5 flex items-start gap-3 rounded-[16px] bg-white/[0.04] px-3 py-3 ring-1 ring-white/[0.06]">
        <span
          className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/25"
          data-slot="paid-lifepath-year-art"
        >
          {/* placeholder art — replace with /images/paid/year-art.png */}
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <path
              d="M16 28 V14"
              stroke="rgba(110,231,183,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M16 18 C10 18 7 12 8 7 C13 8 16 12 16 18 Z"
              fill="rgba(52,211,153,0.55)"
            />
            <path
              d="M16 16 C22 15 26 10 25 5 C19 6 16 11 16 16 Z"
              fill="rgba(167,243,208,0.7)"
            />
            <ellipse cx="16" cy="28" rx="6" ry="2" fill="rgba(180,140,80,0.35)" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white">
            ปีที่ {current.year} — {current.title}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-white/55">
            {current.body}
          </p>
        </div>

        <div className="hidden shrink-0 flex-col gap-1.5 sm:flex">
          {(
            [
              { label: "งาน", tip: current.tips.work, Icon: Briefcase, tone: "text-sky-300", ring: "ring-sky-400/30", bg: "bg-sky-400/10" },
              { label: "เงิน", tip: current.tips.money, Icon: Coins, tone: "text-[#e8c547]", ring: "ring-[#e8c547]/30", bg: "bg-[#e8c547]/10" },
              { label: "ความรัก", tip: current.tips.love, Icon: Heart, tone: "text-pink-300", ring: "ring-pink-400/30", bg: "bg-pink-400/10" },
            ] as const
          ).map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-1.5"
              data-slot={`paid-lifepath-domain-${d.label}`}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full ring-1",
                  d.bg,
                  d.ring
                )}
              >
                <d.Icon className={cn("h-3.5 w-3.5", d.tone)} strokeWidth={1.8} />
              </span>
              <div className="min-w-[3.2rem]">
                <p className="text-[9px] text-white/40">{d.label}</p>
                <p className="text-[10px] font-medium text-white/75">{d.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain row on mobile */}
      <div className="mx-3.5 mb-3.5 grid grid-cols-3 gap-1.5 sm:hidden">
        {(
          [
            { label: "งาน", tip: current.tips.work, Icon: Briefcase, tone: "text-sky-300" },
            { label: "เงิน", tip: current.tips.money, Icon: Coins, tone: "text-[#e8c547]" },
            { label: "ความรัก", tip: current.tips.love, Icon: Heart, tone: "text-pink-300" },
          ] as const
        ).map((d) => (
          <div
            key={d.label}
            className="flex flex-col items-center rounded-[12px] bg-white/[0.03] px-1.5 py-2 ring-1 ring-white/[0.06]"
          >
            <d.Icon className={cn("h-3.5 w-3.5", d.tone)} strokeWidth={1.8} />
            <p className="mt-1 text-[9px] text-white/40">{d.label}</p>
            <p className="text-[10px] font-medium text-white/75">{d.tip}</p>
          </div>
        ))}
      </div>

      {locked ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07061a]/72 px-4 backdrop-blur-[6px]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/15 ring-1 ring-cyan-300/45">
            <Lock className="h-5 w-5 text-cyan-300" strokeWidth={1.9} />
          </span>
          <p className="mt-2.5 text-[13px] font-semibold text-white">
            เส้นทางชีวิต 12 ปี
          </p>
          <p className="mt-1 text-center text-[11px] text-white/50">
            ปลดล็อกเพื่อดูจังหวะรายปีแบบละเอียด
          </p>
          {onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              className="mt-3 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#6366f1] px-4 py-2 text-[12px] font-semibold text-white"
            >
              ปลดล็อก
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
