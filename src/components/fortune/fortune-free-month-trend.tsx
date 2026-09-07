"use client";

import { useId } from "react";
import {
  ChartNoAxesColumn,
  ChevronRight,
  Lightbulb,
  Lock,
  Sparkles,
  Wrench,
} from "lucide-react";
import { MONTH_NAMES_TH } from "@/components/fortune/life-cycle-graph";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FreeMonthPoint = {
  /** 0–11 */
  monthIndex: number;
  yearCe: number;
  score: number;
};

function monthLabel(monthIndex: number, yearCe: number) {
  const be = yearCe + 543;
  return `${MONTH_NAMES_TH[monthIndex]} ${be}`;
}

function scoreColor(score: number) {
  if (score >= 10) return "#4ade80";
  if (score >= 8) return "#a3e635";
  if (score >= 6) return "#facc15";
  if (score >= 4) return "#fb923c";
  return "#f43f5e";
}

function scoreBand(score: number) {
  if (score >= 10) {
    return {
      label: "พลังสูง",
      meaning: "จังหวะเปิด เหมาะผลักงานสำคัญและเก็บผล",
      strength: "โฟกัสคม · ตัดสินใจไว · โอกาสเข้าหาง่าย",
    };
  }
  if (score >= 8) {
    return {
      label: "กำลังดี",
      meaning: "เดินต่อได้ดี ถ้าโฟกัสไม่กระจายเกิน",
      strength: "นิ่งพอจะวางแผน · มีแรงส่งต่อเนื่อง",
    };
  }
  if (score >= 6) {
    return {
      label: "ปานกลาง",
      meaning: "คุมจังหวะได้ แต่ควรลดเรื่องที่ไม่จำเป็น",
      strength: "บาลานซ์ได้ดี · ปรับตัวตามสถานการณ์",
    };
  }
  if (score >= 4) {
    return {
      label: "ชะลอ",
      meaning: "พลังไม่เต็ม เหมาะจัดระบบและพักให้พอ",
      strength: "เหมาะทบทวน · ตัดสิ่งที่ไม่จำเป็นได้ชัด",
    };
  }
  return {
    label: "ระวัง",
    meaning: "ช่วงหนัก อย่ารีบตัดสินใจใหญ่",
    strength: "ได้เรียนรู้ขอบเขตตัวเอง · รู้ว่าอะไรสำคัญจริง",
  };
}

function basicFix(prev: number, cur: number) {
  const diff = cur - prev;
  if (diff >= 2) {
    return {
      highlight: "จังหวะดีขึ้นชัด — เหมาะเก็บผลงานและโชว์ความสามารถ",
      issue: "โอกาสมาเร็ว อาจรับเกินจนสะสมงาน",
      tip: "เลือกเป้าหมายหลัก 1 เรื่อง แล้วปิดงานค้างก่อนเปิดแนวใหม่",
    };
  }
  if (diff <= -2) {
    return {
      highlight: "ช่วงชะลอช่วยให้เห็นสิ่งที่ต้องพักและจัดใหม่",
      issue: "จังหวะชะลอ อาจกดดันตัวเองให้ทำเท่าเดือนก่อน",
      tip: "ลดภาระ 20% สัปดาห์นี้ และนอนให้ครบกว่าปกติเล็กน้อย",
    };
  }
  if (cur >= 10) {
    return {
      highlight: "พลังสูงต่อเนื่อง — จุดแข็งคือความมุ่งมั่นและการลงมือ",
      issue: "พลังสูงต่อเนื่อง เสี่ยงแบกทุกอย่างคนเดียว",
      tip: "บอกขอบเขตก่อนรับปาก และแบ่งงานที่คนอื่นช่วยได้",
    };
  }
  if (cur <= 5) {
    return {
      highlight: "ช่วงนี้เหมาะจัดลำดับชีวิตใหม่ให้เบาและชัดขึ้น",
      issue: "พลังต่ำ ทำหลายอย่างพร้อมกันแล้วเหนื่อยง่าย",
      tip: "เหลืองานสำคัญวันละ 1–2 เรื่อง และพักสั้น ๆ ระหว่างวัน",
    };
  }
  return {
    highlight: "จังหวะคงที่ — จุดเด่นคือความสม่ำเสมอที่สะสมได้",
    issue: "จังหวะค่อนข้างคงที่ อาจเฉื่อยหรือไม่เห็นความคืบหน้า",
    tip: "ตั้งเช็คพอยต์สัปดาห์ละครั้ง 15 นาที เพื่อปรับแผนเล็ก ๆ",
  };
}

/** Free trend: graph + per-point meaning + basic fix + unlock CTA */
export function FortuneFreeMonthTrend({
  points,
  unlocked = false,
  onUnlock,
  className,
}: {
  points?: FreeMonthPoint[] | null;
  unlocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const now = new Date();
  const curIdx = now.getMonth();
  const curYear = now.getFullYear();
  const prevDate = new Date(curYear, curIdx - 1, 1);

  const hasData =
    Array.isArray(points) &&
    points.length >= 2 &&
    points.every(
      (p) =>
        typeof p.score === "number" &&
        Number.isFinite(p.score) &&
        p.score >= 1 &&
        p.score <= 12
    );

  const prev = hasData
    ? points![0]!
    : {
        monthIndex: prevDate.getMonth(),
        yearCe: prevDate.getFullYear(),
        score: 0,
      };
  const cur = hasData
    ? points![1]!
    : { monthIndex: curIdx, yearCe: curYear, score: 0 };

  const prevLabel = monthLabel(prev.monthIndex, prev.yearCe);
  const curLabel = monthLabel(cur.monthIndex, cur.yearCe);
  const prevBand = hasData ? scoreBand(prev.score) : null;
  const curBand = hasData ? scoreBand(cur.score) : null;
  const fix = hasData ? basicFix(prev.score, cur.score) : null;

  let changeNote =
    "เมื่อมีข้อมูลจังหวะรายเดือน จะสรุปให้ว่าอะไรเปลี่ยนจากเดือนก่อนถึงเดือนนี้";
  if (hasData) {
    const diff = cur.score - prev.score;
    if (diff > 0) {
      changeNote = `จาก${MONTH_NAMES_TH[prev.monthIndex]}ถึง${MONTH_NAMES_TH[cur.monthIndex]} คะแนนขยับจาก ${prev.score}/12 เป็น ${cur.score}/12 — สูงขึ้น ${diff} ระดับ`;
    } else if (diff < 0) {
      changeNote = `จาก${MONTH_NAMES_TH[prev.monthIndex]}ถึง${MONTH_NAMES_TH[cur.monthIndex]} คะแนนขยับจาก ${prev.score}/12 เป็น ${cur.score}/12 — ต่ำลง ${Math.abs(diff)} ระดับ`;
    } else {
      changeNote = `${MONTH_NAMES_TH[prev.monthIndex]}และ${MONTH_NAMES_TH[cur.monthIndex]} อยู่ที่ ${prev.score}/12 เท่ากัน — จังหวะยังไม่เปลี่ยนจากเดือนก่อน`;
    }
  }

  const W = 340;
  const H = 168;
  const padX = 44;
  const padTop = 28;
  const padBottom = 40;
  const plotH = H - padTop - padBottom;
  const yFor = (score: number) => padTop + ((12 - score) / 11) * plotH;
  const x0 = padX;
  const x1 = W - padX;
  const y0 = hasData ? yFor(prev.score) : H / 2;
  const y1 = hasData ? yFor(cur.score) : H / 2;
  const c0 = hasData ? scoreColor(prev.score) : "#9AB8DC";
  const c1 = hasData ? scoreColor(cur.score) : "#46DDED";

  return (
    <section className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <ChartNoAxesColumn
            className="h-4 w-4 shrink-0 text-[#67e8f9]"
            strokeWidth={1.7}
          />
          <h2 className="text-[15px] font-semibold tracking-wide text-white">
            จังหวะชีวิต
            <span className="text-[#e8c547]/90">ช่วงนี้</span>
          </h2>
        </div>
        <p className="max-w-[9.5rem] pt-0.5 text-right text-[10.5px] leading-snug text-white/38">
          เดือนก่อน → เดือนนี้
        </p>
      </div>

      <div
        className="overflow-hidden rounded-[22px] px-3.5 pb-3.5 pt-3.5"
        style={{
          border: "1px solid transparent",
          backgroundImage: [
            "linear-gradient(165deg, rgba(28,36,78,0.55) 0%, rgba(42,28,72,0.42) 48%, rgba(18,24,52,0.58) 100%)",
            "linear-gradient(135deg, rgba(241,109,181,0.55), rgba(187,108,240,0.5) 42%, rgba(70,221,237,0.55))",
          ].join(", "),
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 28px rgba(8,4,24,0.22)",
        }}
      >
        <p className="px-0.5 text-[12px] text-white/50">
          {prevLabel} → {curLabel}
        </p>

        {hasData ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-1 w-full"
            role="img"
            aria-label={`กราฟจังหวะ ${prevLabel} ถึง ${curLabel}`}
          >
            <defs>
              <linearGradient id={`fm-stroke-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F16DB5" />
                <stop offset="48%" stopColor="#BB6CF0" />
                <stop offset="100%" stopColor="#46DDED" />
              </linearGradient>
              <linearGradient id={`fm-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(241,109,181,0.28)" />
                <stop offset="45%" stopColor="rgba(187,108,240,0.16)" />
                <stop offset="100%" stopColor="rgba(70,221,237,0)" />
              </linearGradient>
              <filter id={`fm-glow-${gid}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[3, 6, 9, 12].map((s) => {
              const y = yFor(s);
              return (
                <g key={s}>
                  <line
                    x1={padX - 10}
                    y1={y}
                    x2={W - padX + 10}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={1}
                  />
                  <text x={14} y={y + 3} fill="rgba(247,248,255,0.38)" fontSize={9}>
                    {s}
                  </text>
                </g>
              );
            })}

            <path
              d={`M ${x0} ${y0} L ${x1} ${y1} L ${x1} ${H - padBottom + 10} L ${x0} ${H - padBottom + 10} Z`}
              fill={`url(#fm-fill-${gid})`}
            />
            <line
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
              stroke={`url(#fm-stroke-${gid})`}
              strokeWidth={9}
              strokeLinecap="round"
              opacity={0.3}
            />
            <line
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
              stroke={`url(#fm-stroke-${gid})`}
              strokeWidth={3.4}
              strokeLinecap="round"
              filter={`url(#fm-glow-${gid})`}
            />

            <circle cx={x0} cy={y0} r={8} fill="#F16DB5" opacity={0.28} />
            <circle
              cx={x0}
              cy={y0}
              r={4.8}
              fill={c0}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.3}
            />
            <circle cx={x1} cy={y1} r={10} fill="#46DDED" opacity={0.3} />
            <circle cx={x1} cy={y1} r={5.8} fill={c1} stroke="#fff" strokeWidth={2} />

            <text
              x={x0}
              y={y0 - 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.88)"
              fontSize={12}
              fontWeight={600}
            >
              {prev.score}
            </text>
            <text
              x={x1}
              y={y1 - 12}
              textAnchor="middle"
              fill="#46DDED"
              fontSize={13}
              fontWeight={700}
            >
              {cur.score}
            </text>
            <text
              x={x0}
              y={H - 12}
              textAnchor="middle"
              fill="rgba(247,248,255,0.5)"
              fontSize={11}
            >
              {MONTH_NAMES_TH[prev.monthIndex]}
            </text>
            <text
              x={x1}
              y={H - 12}
              textAnchor="middle"
              fill="rgba(247,248,255,0.9)"
              fontSize={11}
              fontWeight={600}
            >
              {MONTH_NAMES_TH[cur.monthIndex]}
            </text>
          </svg>
        ) : (
          <div className="mt-3 rounded-[14px] border border-dashed border-white/15 bg-white/[0.04] px-3 py-5 text-center">
            <p className="text-[14px] font-medium text-white">
              ยังไม่มีข้อมูลจังหวะรายเดือน
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
              ส่วนนี้รอคะแนนรายเดือนจากระบบคำนวณ
            </p>
          </div>
        )}

        <div
          className="mt-2.5 flex items-start gap-2.5 rounded-[14px] px-3 py-2.5"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background:
              "linear-gradient(120deg, rgba(241,109,181,0.12), rgba(187,108,240,0.1) 50%, rgba(70,221,237,0.12))",
          }}
        >
          <Lightbulb
            className="mt-0.5 h-4 w-4 shrink-0 text-[#F4BC52]"
            strokeWidth={1.8}
          />
          <p className="text-[12px] leading-snug text-white/60">{changeNote}</p>
        </div>

        {hasData && prevBand && curBand && fix ? (
          <>
            {/* Per-point explain */}
            <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {(
                [
                  {
                    when: "เดือนก่อน",
                    name: MONTH_NAMES_TH[prev.monthIndex],
                    score: prev.score,
                    band: prevBand,
                    color: c0,
                  },
                  {
                    when: "เดือนนี้",
                    name: MONTH_NAMES_TH[cur.monthIndex],
                    score: cur.score,
                    band: curBand,
                    color: c1,
                  },
                ] as const
              ).map((p) => (
                <div
                  key={p.when}
                  className="rounded-[14px] border border-white/10 bg-[#0C1427]/45 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-white/45">{p.when}</p>
                    <p
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: p.color }}
                    >
                      {p.score}/12
                    </p>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    {p.name} · {p.band.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.6] text-white/55">
                    {p.band.meaning}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#46DDED]/90">
                    จุดเด่น: {p.band.strength}
                  </p>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="mt-2.5 rounded-[14px] border border-[#46DDED]/25 bg-[#46DDED]/08 px-3 py-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#46DDED]" strokeWidth={1.8} />
                <p className="text-[12px] font-semibold text-[#46DDED]">
                  จุดดีในช่วงนี้
                </p>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.65] text-white/85">
                {fix.highlight}
              </p>
            </div>

            {/* Basic fix — free */}
            <div className="mt-2.5 rounded-[14px] border border-[#F4BC52]/25 bg-[#F4BC52]/08 px-3 py-3">
              <div className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-[#F4BC52]" strokeWidth={1.8} />
                <p className="text-[12px] font-semibold text-[#F4BC52]">
                  วิธีแก้เบื้องต้น
                </p>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.6] text-white/50">
                เรื่องที่ควรระวัง: {fix.issue}
              </p>
              <p className="mt-1 text-[13px] leading-[1.65] text-white/85">
                {fix.tip}
              </p>
            </div>

            {/* Unlock deeper — paid */}
            {!unlocked ? (
              <button
                type="button"
                onClick={onUnlock}
                disabled={!onUnlock}
                className="mt-2.5 flex w-full items-center gap-3 rounded-[14px] border border-[#BB6CF0]/35 bg-gradient-to-r from-[#BB6CF0]/15 to-[#F16DB5]/12 px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#BB6CF0]/45 disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/45">
                  <Lock className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-white">
                    ปลดล็อกแก้ปัญหาเชิงลึก
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-white/50">
                    ดูสาเหตุรายปี แผนรับมือ และคำแนะนำเฉพาะคุณ ·{" "}
                    {FORTUNE_UNLOCK_PRICE} บาท
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[#F16DB5]"
                  strokeWidth={2.2}
                />
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
