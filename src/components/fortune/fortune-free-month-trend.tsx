"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  ChevronRight,
  ChevronDown,
  Lock,
  Minus,
} from "lucide-react";
import { MONTH_LABELS_TH, MONTH_NAMES_TH } from "@/components/fortune/life-cycle-graph";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

export type FreeMonthPoint = {
  /** 0–11 */
  monthIndex: number;
  yearCe: number;
  score: number;
};

type ChartPoint = FreeMonthPoint & {
  kind: "past" | "future";
};

function monthLabel(monthIndex: number, yearCe: number) {
  const be = yearCe + 543;
  return `${MONTH_NAMES_TH[monthIndex]} ${be}`;
}

function monthShort(monthIndex: number, yearCe: number) {
  return `${MONTH_LABELS_TH[monthIndex]} ${(yearCe + 543).toString().slice(-2)}`;
}

function LockMark({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 5.5}, ${y - 20})`} className="pointer-events-none">
      <circle cx={5.5} cy={7} r={8} fill="rgba(12,20,39,0.82)" stroke="rgba(244,188,82,0.55)" strokeWidth={1} />
      <path
        d="M3.2 7.2V5.1a2.3 2.3 0 0 1 4.6 0v2.1"
        fill="none"
        stroke="#F4BC52"
        strokeWidth={1.35}
        strokeLinecap="round"
      />
      <rect x={2.4} y={7} width={6.2} height={4.6} rx={1.1} fill="#F4BC52" />
    </g>
  );
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
      meaning:
        "จังหวะเปิดกว้าง — เหมาะผลักงานสำคัญ ปิดดีล หรือเริ่มเรื่องที่ค้างมานาน",
      strength: "โฟกัสคม · ตัดสินใจไว · โอกาสเข้าหาง่าย",
      use: "ใช้พลังไปกับเป้าหมายหลัก 1–2 เรื่อง อย่ากระจายจนหมดแรง",
    };
  }
  if (score >= 8) {
    return {
      label: "กำลังดี",
      meaning: "เดินต่อได้ลื่น ถ้าโฟกัสไม่แตกเกินไป",
      strength: "นิ่งพอจะวางแผน · มีแรงส่งต่อเนื่อง",
      use: "เก็บงานที่ใกล้จบให้เสร็จก่อนเปิดงานใหม่",
    };
  }
  if (score >= 6) {
    return {
      label: "ปานกลาง",
      meaning: "คุมจังหวะได้ แต่ควรลดเรื่องที่ไม่จำเป็น",
      strength: "บาลานซ์ได้ดี · ปรับตัวตามสถานการณ์",
      use: "ตัดงานที่ไม่เร่งด่วนออก แล้วโฟกัสสิ่งที่กระทบผลจริง",
    };
  }
  if (score >= 4) {
    return {
      label: "ชะลอ",
      meaning: "พลังไม่เต็ม — เหมาะจัดระบบ พักให้พอ และทบทวนแผน",
      strength: "เห็นจุดอ่อนชัด · ตัดสิ่งที่ไม่จำเป็นได้ง่าย",
      use: "อย่ารีบขยายงานใหญ่ ใช้ช่วงนี้จัดบ้าน/ระบบก่อน",
    };
  }
  return {
    label: "ระวัง",
    meaning: "ช่วงหนัก — อย่ารีบตัดสินใจใหญ่โดยไม่มีข้อมูลพอ",
    strength: "ได้เรียนรู้ขอบเขตตัวเอง · รู้ว่าอะไรสำคัญจริง",
    use: "พักให้พอ คุยกับคนที่ไว้ใจ และเลื่อนเรื่องใหญ่ถ้าทำได้",
  };
}

function monthDescribe(point: FreeMonthPoint, kind: "past" | "future") {
  if (kind === "future") {
    return `ภาพรวมจังหวะ${MONTH_NAMES_TH[point.monthIndex]} — ปลดล็อกเพื่อดูคะแนนและคำแนะนำล่วงหน้า`;
  }
  const band = scoreBand(point.score);
  return `${MONTH_NAMES_TH[point.monthIndex]} ${point.yearCe + 543} · ${band.label} — ${band.meaning}`;
}

function basicFix(prev: number, cur: number) {
  const diff = cur - prev;
  if (diff >= 2) {
    return {
      highlight:
        "จังหวะดีขึ้นชัด — เหมาะเก็บผลงาน โชว์ความสามารถ และปิดเรื่องค้าง",
      issue: "โอกาสมาเร็ว อาจรับเกินจนสะสมงานและเครียดทีหลัง",
      tip: "เลือกเป้าหมายหลัก 1 เรื่อง แล้วปิดงานค้างก่อนเปิดแนวใหม่",
      why: "คะแนนขยับขึ้นแรง แปลว่าพลังพร้อม แต่ยังต้องคุมขอบเขต",
    };
  }
  if (diff <= -2) {
    return {
      highlight: "ช่วงชะลอช่วยให้เห็นสิ่งที่ต้องพักและจัดใหม่",
      issue: "จังหวะชะลอ อาจกดดันตัวเองให้ทำเท่าเดือนก่อน",
      tip: "ลดภาระประมาณ 20% สัปดาห์นี้ และนอนให้ครบกว่าปกติเล็กน้อย",
      why: "คะแนนลดลงแรง ไม่ใช่ล้มเหลว — เป็นสัญญาณให้รีเซ็ตจังหวะ",
    };
  }
  if (cur >= 10) {
    return {
      highlight: "พลังสูงต่อเนื่อง — จุดแข็งคือความมุ่งมั่นและการลงมือ",
      issue: "พลังสูงต่อเนื่อง เสี่ยงแบกทุกอย่างคนเดียวจนหมดไฟ",
      tip: "บอกขอบเขตก่อนรับปาก และแบ่งงานที่คนอื่นช่วยได้",
      why: "เดือนต่อเดือนยังสูง เหมาะเร่งผล แต่ต้องกันไม่ให้เผาตัวเอง",
    };
  }
  if (cur <= 5) {
    return {
      highlight: "ช่วงนี้เหมาะจัดลำดับชีวิตใหม่ให้เบาและชัดขึ้น",
      issue: "พลังต่ำ ทำหลายอย่างพร้อมกันแล้วเหนื่อยง่าย",
      tip: "เหลืองานสำคัญวันละ 1–2 เรื่อง และพักสั้น ๆ ระหว่างวัน",
      why: "คะแนนต่ำไม่ใช่จุดจบ — เป็นจังหวะพักเพื่อกลับมาแรงกว่า",
    };
  }
  return {
    highlight: "จังหวะคงที่ — จุดเด่นคือความสม่ำเสมอที่สะสมผลได้",
    issue: "จังหวะค่อนข้างคงที่ อาจเฉื่อยหรือไม่เห็นความคืบหน้า",
    tip: "ตั้งเช็คพอยต์สัปดาห์ละครั้ง 15 นาที เพื่อปรับแผนเล็ก ๆ",
    why: "คะแนนใกล้เคียงเดือนก่อน แปลว่าสถานะนิ่ง — ต้องตั้งเป้าเอง",
  };
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

const YEAR_DETAILS = [
  {
    overview: "ปีแห่งการตั้งต้นและจัดระบบชีวิตใหม่",
    turning: "เลือกทิศทางหลักให้ชัดก่อนขยายงาน",
    reason: "จังหวะนี้เหมาะกับการวางรากฐานมากกว่าเร่งผลลัพธ์",
    guidance: "โฟกัสเป้าหมายหลักหนึ่งเรื่อง และตัดสิ่งที่ไม่จำเป็น",
  },
  {
    overview: "ปีแห่งการสร้างวินัยและความสม่ำเสมอ",
    turning: "นิสัยเล็ก ๆ ที่ทำซ้ำจะเริ่มเห็นผล",
    reason: "พลังงานสนับสนุนงานที่ต้องใช้ความอดทน",
    guidance: "ตั้งเกณฑ์วัดผลรายเดือนแบบเรียบง่าย",
  },
  {
    overview: "ปีแห่งการเปิดโอกาสและการทดลอง",
    turning: "โอกาสใหม่เข้ามาเมื่อคุณพร้อมรับผิดชอบ",
    reason: "ช่วงขยายเครือข่ายและการเรียนรู้",
    guidance: "ลองแนวทางใหม่ได้ แต่เก็บข้อมูลผลลัพธ์ไว้",
  },
  {
    overview: "ปีแห่งการทดสอบความอดทน",
    turning: "แรงกดดันช่วยให้เห็นสิ่งที่สำคัญจริง",
    reason: "จังหวะเหมาะกับการคัดกรองมากกว่าขยาย",
    guidance: "อย่าตัดสินใจใหญ่ตอนอารมณ์ต่ำ",
  },
  {
    overview: "ปีแห่งการเก็บเกี่ยวผลงาน",
    turning: "ผลจากความพยายามก่อนหน้าเริ่มชัด",
    reason: "เหมาะกับการปิดงานสำคัญและสร้างชื่อเสียง",
    guidance: "ปิดงานค้างก่อนเปิดแนวรบใหม่",
  },
  {
    overview: "ปีแห่งการปรับสมดุลชีวิต",
    turning: "หันมาดูแลร่างกายและความสัมพันธ์ควบคู่เป้าหมาย",
    reason: "พลังงานชวนลดความเร่งและเพิ่มคุณภาพชีวิต",
    guidance: "จัดเวลาพักให้เป็นส่วนหนึ่งของแผนงาน",
  },
  {
    overview: "ปีแห่งการก้าวกระโดด",
    turning: "โอกาสสำคัญอาจต้องการการตัดสินใจที่กล้า",
    reason: "จังหวะเหมาะกับการรับผิดชอบที่ใหญ่ขึ้น",
    guidance: "ตัดสินใจด้วยข้อมูล และอย่ารอความพร้อมสมบูรณ์",
  },
  {
    overview: "ปีแห่งการเชื่อมโยงผู้คน",
    turning: "ความร่วมมือดีจะพาคุณไปได้ไกลกว่าทำคนเดียว",
    reason: "พลังด้านคนรอบตัวเด่นขึ้น",
    guidance: "สื่อสารความต้องการให้ชัดและฟังอีกฝ่าย",
  },
  {
    overview: "ปีแห่งการเข้าใจตัวตนลึกขึ้น",
    turning: "ปล่อยสิ่งเก่าที่ไม่ได้เป็นคุณอีกต่อไป",
    reason: "เหมาะกับการทบทวนนิยามความสำเร็จ",
    guidance: "ลดบทบาทที่ไม่ใช่ และเลือกสิ่งที่สอดคล้องใจ",
  },
  {
    overview: "ปีแห่งการสร้างมรดกและส่งต่อ",
    turning: "สิ่งที่คุณสร้างเริ่มมีผลต่อคนอื่น",
    reason: "จังหวะของการสอน แบ่งปัน และวางระบบระยะยาว",
    guidance: "บันทึกองค์ความรู้และส่งต่อให้ทีม/คนใกล้ตัว",
  },
  {
    overview: "ปีแห่งการปิดวงจรและเริ่มรอบใหม่",
    turning: "จบเรื่องค้างเพื่อเปิดพื้นที่ให้บทถัดไป",
    reason: "พลังงานสนับสนุนการเคลียร์และรีเซ็ต",
    guidance: "ทำบัญชีชีวิต: อะไรเก็บ อะไรปล่อย อะไรเริ่มใหม่",
  },
  {
    overview: "ปีแห่งการยืนหยัดบนรากฐานที่แข็ง",
    turning: "ความมั่นคงมาจากการเลือกที่ชัดซ้ำ ๆ",
    reason: "เหมาะกับการขยายจากของที่มีอยู่แล้ว",
    guidance: "อย่าไล่ทุกโอกาส — ขยายเฉพาะสิ่งที่สอดคล้องแกนชีวิต",
  },
] as const;

type YearPoint = {
  i: number;
  ce: number;
  be: number;
  score: number;
  overview: string;
  turning: string;
  reason: string;
  guidance: string;
};

function YearRhythmChart({
  years,
  selectedIndex,
  onSelect,
}: {
  years: YearPoint[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const gid = useId().replace(/:/g, "");
  const W = 360;
  const H = 200;
  const padL = 26;
  const padR = 12;
  const padT = 24;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const scores = years.map((y) => y.score);
  const { yMin, yMax } = yDomain(scores);
  const ticks = tickValues(yMin, yMax);
  const n = years.length;
  const xAt = (i: number) =>
    padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (score: number) =>
    padT + ((yMax - score) / (yMax - yMin || 1)) * plotH;

  const lineD = years
    .map((y, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(y.score).toFixed(1)}`)
    .join(" ");
  const areaD = `${lineD} L ${xAt(n - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
  const nowCe = new Date().getFullYear();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-1 w-full"
      role="img"
      aria-label="กราฟจังหวะชีวิต 12 ปี กดจุดเพื่อวิเคราะห์รายปี"
    >
      <defs>
        <linearGradient id={`yr-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(244,188,82,0.32)" />
          <stop offset="55%" stopColor="rgba(70,221,237,0.1)" />
          <stop offset="100%" stopColor="rgba(70,221,237,0)" />
        </linearGradient>
        <linearGradient id={`yr-stroke-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F4BC52" />
          <stop offset="45%" stopColor="#BB6CF0" />
          <stop offset="100%" stopColor="#46DDED" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = yAt(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={padL - 5}
              y={y + 3}
              textAnchor="end"
              fill="rgba(247,248,255,0.4)"
              fontSize={9}
            >
              {t}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#yr-fill-${gid})`} />
      <path
        d={lineD}
        fill="none"
        stroke={`url(#yr-stroke-${gid})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {years.map((y, i) => {
        const x = xAt(i);
        const yy = yAt(y.score);
        const isSelected = i === selectedIndex;
        const isNow = y.ce === nowCe;
        const color = scoreColor(y.score);
        return (
          <g key={y.ce}>
            {isSelected ? (
              <text
                x={x}
                y={yy - 11}
                textAnchor="middle"
                fill="#F4BC52"
                fontSize={11}
                fontWeight={700}
              >
                {y.score}
              </text>
            ) : null}
            <circle
              cx={x}
              cy={yy}
              r={isSelected ? 7 : 4}
              fill={isSelected ? color : "rgba(255,255,255,0.55)"}
              stroke={isSelected ? "#fff" : "rgba(255,255,255,0.35)"}
              strokeWidth={isSelected ? 2 : 1}
              className="pointer-events-none"
            />
            <text
              x={x}
              y={H - 18}
              textAnchor="middle"
              fill={
                isSelected
                  ? "rgba(247,248,255,0.95)"
                  : "rgba(247,248,255,0.45)"
              }
              fontSize={isSelected ? 9 : 8}
              fontWeight={isSelected || isNow ? 600 : 400}
              className="pointer-events-none"
            >
              {String(y.be).slice(-2)}
            </text>
            <text
              x={x}
              y={H - 7}
              textAnchor="middle"
              fill={isNow ? "rgba(244,188,82,0.8)" : "rgba(247,248,255,0.28)"}
              fontSize={7}
              className="pointer-events-none"
            >
              {isNow ? "ปีนี้" : ""}
            </text>
            <circle
              cx={x}
              cy={yy}
              r={14}
              fill="transparent"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`วิเคราะห์ปี ${y.be} คะแนน ${y.score}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function UnlockedTwelveYearTrend({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const nowCe = new Date().getFullYear();
  const years = useMemo((): YearPoint[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const ce = nowCe - 2 + i;
      const detail = YEAR_DETAILS[i]!;
      const score = 3 + (hashSeed(`${seed}-year-${ce}`) % 10);
      return {
        i,
        ce,
        be: ce + 543,
        score,
        ...detail,
      };
    });
  }, [seed, nowCe]);

  const currentIdx = years.findIndex((y) => y.ce === nowCe);
  const [index, setIndex] = useState(currentIdx >= 0 ? currentIdx : 2);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(320);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      widthRef.current = viewportRef.current?.clientWidth || 320;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(years.length - 1, next)));
    setDragX(0);
    setDragging(false);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    widthRef.current = viewportRef.current?.clientWidth || 320;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    const w = widthRef.current;
    let next = dx;
    if ((index === 0 && dx > 0) || (index === years.length - 1 && dx < 0)) {
      next = dx * 0.35;
    }
    setDragX(Math.max(-w * 1.05, Math.min(w * 1.05, next)));
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    activeRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const dx = lastXRef.current - startXRef.current;
    const threshold = Math.min(72, widthRef.current * 0.18);
    setDragging(false);
    if (dx < -threshold) goTo(index + 1);
    else if (dx > threshold) goTo(index - 1);
    else setDragX(0);
  }

  const dragPct =
    widthRef.current > 0 ? (dragX / widthRef.current) * 100 : 0;

  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2 px-0.5">
        <ChartNoAxesColumn
          className="h-4 w-4 shrink-0 text-[#F4BC52]"
          strokeWidth={1.7}
        />
        <h2 className="text-[15px] font-semibold tracking-wide text-white">
          จังหวะชีวิต
          <span className="text-[#e8c547]/90"> 12 ปี</span>
        </h2>
      </div>

      <YearRhythmChart
        years={years}
        selectedIndex={index}
        onSelect={goTo}
      />

      <div
        ref={viewportRef}
        className="relative touch-pan-y overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex will-change-transform"
          style={{
            transform: `translate3d(calc(${-index * 100}% + ${dragPct}%), 0, 0)`,
            transition: dragging
              ? "none"
              : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {years.map((year, i) => {
            const band = scoreBand(year.score);
            const color = scoreColor(year.score);
            const when =
              year.ce === nowCe
                ? "ปีนี้"
                : year.ce < nowCe
                  ? "ปีที่ผ่านมา"
                  : "ปีข้างหน้า";
            const active = i === index;
            return (
              <article
                key={year.ce}
                className="w-full min-w-full shrink-0 basis-full px-0.5"
                aria-hidden={!active}
              >
                <div
                  className={cn(
                    "relative space-y-2.5 rounded-[18px] fortune-surface px-3.5 py-3.5 transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-70"
                  )}
                >
                  <p className="absolute right-3.5 top-3.5 text-[12px] font-semibold tabular-nums text-[#F4BC52]">
                    {i + 1}/{years.length}
                  </p>

                  <div className="pr-10">
                    <p className="text-[11px] text-white/45">{when}</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">
                      พ.ศ. {year.be} · {band.label}
                    </p>
                  </div>

                  <p className="text-[13px] font-medium leading-snug text-[#F7F8FF]">
                    {year.overview}
                  </p>
                  <p className="text-[12px] leading-[1.65] text-white/60">
                    {band.meaning}
                  </p>
                  <div className="rounded-[12px] bg-[#F4BC52]/08 px-2.5 py-2 ring-1 ring-[#F4BC52]/2">
                    <p className="text-[11px] font-semibold text-[#F4BC52]">
                      จุดเปลี่ยนปีนี้
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-white/80">
                      {year.turning}
                    </p>
                  </div>
                  <div className="rounded-[12px] bg-[#46DDED]/08 px-2.5 py-2 ring-1 ring-[#46DDED]/2">
                    <p className="text-[11px] font-semibold text-[#46DDED]">
                      ทำไมถึงเป็นแบบนี้
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-white/80">
                      {year.reason}
                    </p>
                  </div>
                  <div className="rounded-[12px] bg-white/[0.04] px-2.5 py-2 ring-1 ring-white/10">
                    <p className="text-[11px] font-semibold text-white/70">
                      แนวทางแก้ไข
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-white/80">
                      {year.guidance}
                    </p>
                  </div>
                  <p className="text-[11px] leading-snug text-white/40">
                    จุดเด่น: {band.strength} · ใช้ยังไง: {band.use}
                  </p>
                  <p
                    className="pt-0.5 text-right text-[13px] font-bold tabular-nums"
                    style={{ color }}
                  >
                    {year.score}/12
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Smart Y domain — zoom into the data so high scores aren't stuck at the ceiling */
function yDomain(scores: number[]) {
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);
  let yMin = Math.max(1, lo - 1);
  let yMax = Math.min(12, hi + 1);
  if (yMax - yMin < 5) {
    const mid = (lo + hi) / 2;
    yMin = Math.max(1, Math.floor(mid - 2.5));
    yMax = Math.min(12, Math.ceil(mid + 2.5));
    if (yMax - yMin < 5) {
      if (yMin === 1) yMax = Math.min(12, yMin + 5);
      else yMin = Math.max(1, yMax - 5);
    }
  }
  return { yMin, yMax };
}

function tickValues(yMin: number, yMax: number) {
  const span = yMax - yMin;
  const step = span <= 5 ? 1 : span <= 8 ? 2 : 3;
  const ticks: number[] = [];
  for (let v = yMin; v <= yMax; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== yMax) ticks.push(yMax);
  return ticks;
}

function RhythmChart({
  points,
  selectedIndex,
  onSelect,
  isLocked,
}: {
  points: ChartPoint[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isLocked: (index: number) => boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const W = 340;
  const H = 212;
  const padL = 28;
  const padR = 14;
  const padT = 26;
  const padB = 44;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const visibleScores = points.map((p, i) =>
    isLocked(i) && p.kind === "future" ? points[Math.max(0, i - 1)]!.score : p.score
  );
  const { yMin, yMax } = yDomain(visibleScores);
  const ticks = tickValues(yMin, yMax);
  const n = points.length;
  const xAt = (i: number) =>
    padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (score: number) =>
    padT + ((yMax - score) / (yMax - yMin || 1)) * plotH;

  const lineD = points
    .map((p, i) => {
      const score =
        isLocked(i) && p.kind === "future"
          ? points[Math.max(0, i - 1)]!.score
          : p.score;
      return `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(score).toFixed(1)}`;
    })
    .join(" ");

  const areaD = `${lineD} L ${xAt(n - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-1 w-full"
      role="img"
      aria-label="กราฟจังหวะชีวิตรายเดือน กดจุดเพื่อดูรายละเอียด"
    >
      <defs>
        <linearGradient id={`rm-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(187,108,240,0.38)" />
          <stop offset="55%" stopColor="rgba(70,221,237,0.12)" />
          <stop offset="100%" stopColor="rgba(70,221,237,0)" />
        </linearGradient>
        <linearGradient id={`rm-stroke-${gid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F16DB5" />
          <stop offset="50%" stopColor="#BB6CF0" />
          <stop offset="100%" stopColor="#46DDED" />
        </linearGradient>
        <filter id={`rm-glow-${gid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {yMin <= 6 && yMax >= 4 ? (
        <rect
          x={padL}
          y={yAt(Math.min(yMax, 6))}
          width={plotW}
          height={Math.max(0, yAt(Math.max(yMin, 4)) - yAt(Math.min(yMax, 6)))}
          fill="rgba(250,204,21,0.05)"
        />
      ) : null}
      {yMax >= 10 ? (
        <rect
          x={padL}
          y={yAt(Math.min(yMax, 12))}
          width={plotW}
          height={Math.max(0, yAt(Math.max(yMin, 10)) - yAt(Math.min(yMax, 12)))}
          fill="rgba(74,222,128,0.06)"
        />
      ) : null}

      {ticks.map((t) => {
        const y = yAt(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={y + 3}
              textAnchor="end"
              fill="rgba(247,248,255,0.4)"
              fontSize={9}
            >
              {t}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#rm-fill-${gid})`} />
      <path
        d={lineD}
        fill="none"
        stroke={`url(#rm-stroke-${gid})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#rm-glow-${gid})`}
      />

      {points.map((p, i) => {
        const locked = isLocked(i);
        const plotScore =
          locked && p.kind === "future"
            ? points[Math.max(0, i - 1)]!.score
            : p.score;
        const x = xAt(i);
        const y = yAt(plotScore);
        const isSelected = i === selectedIndex && !locked;
        const color = scoreColor(p.score);
        const hitR = 16;
        return (
          <g key={`${p.kind}-${p.yearCe}-${p.monthIndex}`} opacity={locked ? 0.9 : 1}>
            {isSelected ? (
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fill="#46DDED"
                fontSize={12}
                fontWeight={700}
              >
                {p.score}
              </text>
            ) : null}
            {locked ? <LockMark x={x} y={y} /> : null}
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 7 : locked ? 5 : 4}
              fill={
                locked
                  ? "rgba(244,188,82,0.35)"
                  : isSelected
                    ? color
                    : "rgba(255,255,255,0.55)"
              }
              stroke={
                locked
                  ? "rgba(244,188,82,0.7)"
                  : isSelected
                    ? "#fff"
                    : "rgba(255,255,255,0.35)"
              }
              strokeWidth={isSelected || locked ? 2 : 1}
              strokeDasharray={locked && p.kind === "future" ? "2 2" : undefined}
              className="pointer-events-none"
            />
            <text
              x={x}
              y={H - 22}
              textAnchor="middle"
              fill={
                isSelected
                  ? "rgba(247,248,255,0.95)"
                  : locked
                    ? "rgba(244,188,82,0.75)"
                    : "rgba(247,248,255,0.5)"
              }
              fontSize={isSelected ? 10 : 9}
              fontWeight={isSelected || locked ? 600 : 400}
              className="pointer-events-none"
            >
              {monthShort(p.monthIndex, p.yearCe)}
            </text>
            <text
              x={x}
              y={H - 9}
              textAnchor="middle"
              fill={
                locked ? "rgba(244,188,82,0.55)" : "rgba(247,248,255,0.32)"
              }
              fontSize={8}
              className="pointer-events-none"
            >
              {p.kind === "future" ? "เดือนหน้า" : locked ? "ล็อก" : ""}
            </text>
            <circle
              cx={x}
              cy={y}
              r={hitR}
              fill="transparent"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={
                locked
                  ? `ปลดล็อก${MONTH_NAMES_TH[p.monthIndex]}`
                  : `ดู${MONTH_NAMES_TH[p.monthIndex]} คะแนน ${p.score}`
              }
              aria-pressed={isSelected}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Free: month teaser. Unlocked: full 12-year analysis per year */
export function FortuneFreeMonthTrend({
  points,
  unlocked = false,
  onUnlock,
  seed = "dooduang",
  className,
}: {
  points?: FreeMonthPoint[] | null;
  unlocked?: boolean;
  onUnlock?: () => void;
  seed?: string;
  className?: string;
}) {
  if (unlocked) {
    return <UnlockedTwelveYearTrend seed={seed} className={className} />;
  }

  return (
    <FreeMonthTrendTeaser
      points={points}
      onUnlock={onUnlock}
      className={className}
    />
  );
}

function FreeMonthTrendTeaser({
  points,
  onUnlock,
  className,
}: {
  points?: FreeMonthPoint[] | null;
  onUnlock?: () => void;
  className?: string;
}) {
  const now = new Date();
  const curIdx = now.getMonth();
  const curYear = now.getFullYear();
  const prevDate = new Date(curYear, curIdx - 1, 1);

  const series = useMemo(() => {
    if (
      Array.isArray(points) &&
      points.length >= 2 &&
      points.every(
        (p) =>
          typeof p.score === "number" &&
          Number.isFinite(p.score) &&
          p.score >= 1 &&
          p.score <= 12
      )
    ) {
      return points;
    }
    return null;
  }, [points]);

  const hasData = !!series;
  const pastCount = hasData ? series!.length : 0;

  const chartPoints = useMemo((): ChartPoint[] | null => {
    if (!series) return null;
    const nextDate = new Date(curYear, curIdx + 1, 1);
    const last = series[series.length - 1]!;
    const forecast = Math.min(
      12,
      Math.max(1, last.score + ((last.score % 3) - 1))
    );
    return [
      ...series.map((p) => ({ ...p, kind: "past" as const })),
      {
        monthIndex: nextDate.getMonth(),
        yearCe: nextDate.getFullYear(),
        score: forecast,
        kind: "future" as const,
      },
    ];
  }, [series, curYear, curIdx]);

  /** Free: current month + 1 month back only; future always locked until unlock */
  const freeMinIndex = !hasData ? 0 : Math.max(0, pastCount - 2);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function pointLocked(index: number) {
    if (!chartPoints) return false;
    const p = chartPoints[index];
    if (!p) return true;
    if (p.kind === "future") return true;
    return index < freeMinIndex;
  }

  const lastFreeIndex = Math.max(0, pastCount - 1);
  const safeSelected = hasData
    ? Math.min(
        Math.max(selectedIndex ?? lastFreeIndex, freeMinIndex),
        lastFreeIndex
      )
    : 0;

  function selectPoint(index: number) {
    if (pointLocked(index)) {
      onUnlock?.();
      return;
    }
    setSelectedIndex(index);
    setDetailOpen(false);
  }

  const prev = hasData
    ? series![series!.length - 2]!
    : {
        monthIndex: prevDate.getMonth(),
        yearCe: prevDate.getFullYear(),
        score: 0,
      };
  const cur = hasData
    ? series![series!.length - 1]!
    : { monthIndex: curIdx, yearCe: curYear, score: 0 };

  const selected = hasData ? chartPoints![safeSelected]! : { ...cur, kind: "past" as const };
  const selectedBand = hasData && !pointLocked(safeSelected) ? scoreBand(selected.score) : null;
  const selectedColor = hasData ? scoreColor(selected.score) : "#46DDED";
  const selectedWhen =
    selected.kind === "future"
      ? "เดือนหน้า"
      : safeSelected === lastFreeIndex
        ? "เดือนนี้"
        : safeSelected === lastFreeIndex - 1
          ? "เดือนก่อน"
          : "เดือนที่เลือก";
  const selectedDescribe = hasData
    ? monthDescribe(selected, selected.kind)
    : "";

  const prevLabel = monthLabel(prev.monthIndex, prev.yearCe);
  const curLabel = monthLabel(cur.monthIndex, cur.yearCe);
  const nextLabel = monthLabel(
    new Date(curYear, curIdx + 1, 1).getMonth(),
    new Date(curYear, curIdx + 1, 1).getFullYear()
  );
  const fix = hasData ? basicFix(prev.score, cur.score) : null;

  const diff = hasData ? cur.score - prev.score : 0;
  let deltaLabel = "คงที่";
  let DeltaIcon = Minus;
  let deltaColor = "#9AB8DC";
  if (hasData) {
    if (diff > 0) {
      deltaLabel = `สูงขึ้น ${diff}`;
      DeltaIcon = ArrowUpRight;
      deltaColor = "#4ade80";
    } else if (diff < 0) {
      deltaLabel = `ต่ำลง ${Math.abs(diff)}`;
      DeltaIcon = ArrowDownRight;
      deltaColor = "#fb923c";
    } else {
      deltaLabel = "เท่าเดิม";
      DeltaIcon = ArrowRight;
      deltaColor = "#9AB8DC";
    }
  }

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
        <p className="max-w-[10rem] pt-0.5 text-right text-[10.5px] leading-snug text-white/38">
          ฟรีดูเดือนนี้กับเดือนก่อน
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] px-1 pb-1 pt-1">
        <div className="flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <p className="text-[12px] text-white/50">
              {prevLabel} → {curLabel}
              <span className="text-[#F4BC52]/75"> · {nextLabel} ล็อก</span>
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/40">
              ฟรีดูเดือนนี้กับเดือนก่อน · ปลดล็อกเพื่อดูจังหวะ 12 ปีและวิเคราะห์รายปี
            </p>
          </div>
          {hasData ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                color: deltaColor,
                background: `${deltaColor}18`,
                boxShadow: `inset 0 0 0 1px ${deltaColor}55`,
              }}
            >
              <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
              {deltaLabel}
            </span>
          ) : null}
        </div>

        {hasData && chartPoints ? (
          <RhythmChart
            points={chartPoints}
            selectedIndex={safeSelected}
            onSelect={selectPoint}
            isLocked={pointLocked}
          />
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

        {hasData && selectedBand && fix ? (
          <>
            <div className="mt-3 overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-white/[0.08]">
              <button
                type="button"
                aria-expanded={detailOpen}
                onClick={() => setDetailOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left outline-none transition hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/25"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-white/45">{selectedWhen}</p>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    {MONTH_NAMES_TH[selected.monthIndex]} · {selectedBand.label}
                  </p>
                  {!detailOpen ? (
                    <p className="mt-1 text-[11px] text-white/40">
                      กดดูรายละเอียดเดือนนี้
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p
                    className="text-[13px] font-bold tabular-nums"
                    style={{ color: selectedColor }}
                  >
                    {selected.score}/12
                  </p>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-white/40 transition-transform duration-300",
                      detailOpen && "rotate-180 text-white/70"
                    )}
                    strokeWidth={2}
                  />
                </div>
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  detailOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-white/[0.06] px-3 pb-2.5 pt-2">
                    <p className="text-[12px] leading-[1.65] text-white/60">
                      {selectedDescribe}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-[#46DDED]/90">
                      จุดเด่น: {selectedBand.strength}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-white/40">
                      ใช้ยังไง: {selectedBand.use}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                  ปลดล็อกจังหวะชีวิต 12 ปี
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-white/50">
                  ดูกราฟครบและวิเคราะห์แต่ละปี · {FORTUNE_UNLOCK_PRICE} บาท
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[#F16DB5]"
                strokeWidth={2.2}
              />
            </button>

          </>
        ) : null}
      </div>
    </section>
  );
}
