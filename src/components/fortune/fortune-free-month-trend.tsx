"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumn,
  Minus,
} from "lucide-react";
import { MONTH_LABELS_TH, MONTH_NAMES_TH } from "@/components/fortune/life-cycle-graph";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
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

function LockMark({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
      <circle
        cx={0}
        cy={0}
        r={13}
        fill="#1A1630"
        stroke="#E4C56A"
        strokeWidth={1.6}
      />
      <circle
        cx={0}
        cy={0}
        r={15.5}
        fill="none"
        stroke="rgba(228,197,106,0.32)"
        strokeWidth={2.2}
      />
      <path
        d="M-3.8 -0.4V-3a3.8 3.8 0 0 1 7.6 0V-0.4"
        fill="none"
        stroke="#E4C56A"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <rect
        x={-5}
        y={-0.6}
        width={10}
        height={6.6}
        rx={1.6}
        fill="#E4C56A"
      />
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
              stroke="rgba(90,70,150,0.14)"
              strokeWidth={1}
            />
            <text
              x={padL - 5}
              y={y + 3}
              textAnchor="end"
              fill="rgba(58,50,112,0.55)"
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
                fill="#A07E1A"
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
              fill={isSelected ? color : "rgba(255,255,255,0.92)"}
              stroke={isSelected ? "#fff" : "rgba(90,70,150,0.35)"}
              strokeWidth={isSelected ? 2 : 1.5}
              className="pointer-events-none"
            />
            <text
              x={x}
              y={H - 18}
              textAnchor="middle"
              fill={
                isSelected
                  ? "rgba(36,28,79,0.95)"
                  : "rgba(58,50,112,0.62)"
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
              fill={isNow ? "rgba(160,126,26,0.95)" : "rgba(58,50,112,0.35)"}
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
              className="cursor-pointer outline-none focus:outline-none"
              style={{ outline: "none" }}
              role="button"
              tabIndex={0}
              aria-label={`วิเคราะห์ปี ${y.be} คะแนน ${y.score}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(i)}
              onPointerDown={(e) => {
                // avoid native square focus ring after click
                e.currentTarget.blur();
              }}
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
  const [width, setWidth] = useState(320);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const activeRef = useRef(false);
  const animLockRef = useRef(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || 320);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(years.length - 1, next));
    setIndex(clamped);
    setDragX(0);
    setDragging(false);
    animLockRef.current = true;
    window.setTimeout(() => {
      animLockRef.current = false;
    }, 420);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (animLockRef.current) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    setWidth(viewportRef.current?.clientWidth || width);
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    let next = dx;
    if ((index === 0 && dx > 0) || (index === years.length - 1 && dx < 0)) {
      next = dx * 0.28;
    }
    setDragX(Math.max(-width * 1.05, Math.min(width * 1.05, next)));
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
    const threshold = Math.min(56, width * 0.18);
    setDragging(false);
    if (dx < -threshold) goTo(index + 1);
    else if (dx > threshold) goTo(index - 1);
    else {
      setDragX(0);
    }
  }

  const trackX = -index * width + dragX;

  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2 px-0.5">
        <FortuneIcon name="compass" size={18} className="shrink-0" />
        <h2 className="text-[15px] font-semibold tracking-wide text-[#241C4F]">
          จังหวะชีวิต
          <span className="text-[#A07E1A]"> 12 ปี</span>
        </h2>
      </div>

      <YearRhythmChart
        years={years}
        selectedIndex={index}
        onSelect={goTo}
      />

      <div
        ref={viewportRef}
        className="relative overflow-hidden touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flex"
          style={{
            width: width * years.length,
            transform: `translate3d(${trackX}px, 0, 0)`,
            transition: dragging
              ? "none"
              : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
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
            return (
              <article
                key={year.ce}
                className="shrink-0"
                style={{ width }}
                aria-hidden={i !== index}
              >
                <div className="fortune-glass relative mx-0.5 space-y-2.5 rounded-[18px] px-3.5 py-3.5">
                  <p className="absolute right-3.5 top-3.5 text-[12px] font-semibold tabular-nums text-[#A07E1A]">
                    {i + 1}/{years.length}
                  </p>

                  <div className="pr-10">
                    <p className="text-[11px] font-medium text-[#6B6490]">
                      {when}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-[#241C4F]">
                      พ.ศ. {year.be} · {band.label}
                    </p>
                  </div>

                  <p className="text-[13px] font-medium leading-snug text-[#3A3270]">
                    {year.overview}
                  </p>
                  <p className="text-[12px] leading-[1.65] text-[#5E5688]">
                    {band.meaning}
                  </p>

                  <div className="mt-1 space-y-3 border-t border-[#7B6BB0]/14 pt-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
                        จุดเปลี่ยน
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.65] text-[#3A3270]">
                        {year.turning}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
                        ทำไมถึงเป็นแบบนี้
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.65] text-[#3A3270]">
                        {year.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
                        แนวทาง
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.65] text-[#3A3270]">
                        {year.guidance}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] leading-snug text-[#6B6490]">
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

      <p className="text-center text-[11px] text-[#8A82B0]">
        ปัดซ้าย–ขวา หรือกดจุดบนกราฟเพื่อเปลี่ยนปี
      </p>
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
  const H = 200;
  const padL = 30;
  const padR = 12;
  const padT = 16;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  /** Fixed readable scale like the mockup */
  const yMin = 0;
  const yMax = 15;
  const ticks = [0, 5, 10, 15];

  const n = points.length;
  const xAt = (i: number) =>
    padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (score: number) =>
    padT + ((yMax - score) / (yMax - yMin)) * plotH;

  const lastFreeIndex = (() => {
    for (let i = n - 1; i >= 0; i--) {
      if (!isLocked(i) && points[i]!.kind === "past") return i;
    }
    return selectedIndex;
  })();

  const plotScore = (i: number) => {
    const p = points[i]!;
    if (isLocked(i) && p.kind === "future") {
      return points[Math.max(0, i - 1)]!.score;
    }
    return p.score;
  };

  const lineD = points
    .map((_, i) => {
      const cmd = i === 0 ? "M" : "L";
      return `${cmd} ${xAt(i).toFixed(1)} ${yAt(plotScore(i)).toFixed(1)}`;
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
          <stop offset="0%" stopColor="rgba(155,127,232,0.42)" />
          <stop offset="70%" stopColor="rgba(155,127,232,0.12)" />
          <stop offset="100%" stopColor="rgba(155,127,232,0)" />
        </linearGradient>
      </defs>

      {/* Horizontal dotted grid */}
      {ticks.map((t) => {
        const y = yAt(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(120,110,160,0.28)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <text
              x={padL - 8}
              y={y + 3.5}
              textAnchor="end"
              fill="#9A90C0"
              fontSize={10}
              fontWeight={500}
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* Vertical month guides */}
      {points.map((_, i) => (
        <line
          key={`v-${i}`}
          x1={xAt(i)}
          y1={padT}
          x2={xAt(i)}
          y2={padT + plotH}
          stroke="rgba(120,110,160,0.12)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
      ))}

      <path d={areaD} fill={`url(#rm-fill-${gid})`} />
      <path
        d={lineD}
        fill="none"
        stroke="#8B6FE0"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => {
        const locked = isLocked(i);
        const x = xAt(i);
        const y = yAt(plotScore(i));
        const isTip = i === lastFreeIndex;
        const isOpen = !locked && !isTip;

        return (
          <g key={`${p.kind}-${p.yearCe}-${p.monthIndex}`}>
            {locked ? (
              <LockMark x={x} y={y} />
            ) : isTip ? (
              <>
                {/* Current-month focus frame */}
                <rect
                  x={x - 14}
                  y={y - 14}
                  width={28}
                  height={28}
                  rx={4}
                  fill="none"
                  stroke="#2C2458"
                  strokeWidth={1.6}
                  opacity={0.85}
                />
                <circle cx={x} cy={y} r={10} fill="rgba(74,222,128,0.28)" />
                <circle
                  cx={x}
                  cy={y}
                  r={7}
                  fill="#3DCF7A"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              </>
            ) : (
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="#FFFFFF"
                stroke="#8B6FE0"
                strokeWidth={2.4}
              />
            )}

            <text
              x={x}
              y={H - 10}
              textAnchor="middle"
              fill={isTip ? "#2C2458" : locked ? "#9A90C0" : "#6B6490"}
              fontSize={11}
              fontWeight={isTip ? 700 : isOpen ? 600 : 500}
              className="pointer-events-none"
            >
              {MONTH_LABELS_TH[p.monthIndex]}
            </text>

            <circle
              cx={x}
              cy={y}
              r={16}
              fill="transparent"
              className="cursor-pointer outline-none focus:outline-none"
              style={{ outline: "none" }}
              role="button"
              tabIndex={0}
              aria-label={
                locked
                  ? `ปลดล็อก${MONTH_NAMES_TH[p.monthIndex]}`
                  : `ดู${MONTH_NAMES_TH[p.monthIndex]} คะแนน ${p.score}`
              }
              aria-pressed={i === selectedIndex && !locked}
              onClick={() => onSelect(i)}
              onPointerDown={(e) => {
                e.currentTarget.blur();
              }}
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
    return series.map((p) => ({ ...p, kind: "past" as const }));
  }, [series]);

  /** Free: current month only — history locked until premium */
  const freeMinIndex = !hasData ? 0 : Math.max(0, pastCount - 1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const trendUp = hasData && diff > 0;
  const curBand = hasData ? scoreBand(cur.score) : null;

  return (
    <section className={cn("fortune-glass space-y-3 rounded-[18px] px-3.5 py-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ChartNoAxesColumn
              className="h-5 w-5 shrink-0 text-[#7B5FD4]"
              strokeWidth={2}
            />
            <h2 className="text-[17px] font-semibold tracking-wide text-[#2C2458]">
              จังหวะชีวิตช่วงนี้
            </h2>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#5E5688]">
            ดูแนวโน้มและวางแผนล่วงหน้า
          </p>
        </div>
        {hasData ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold"
            style={{
              color: trendUp ? "#2F9E5F" : deltaColor,
              background: trendUp ? "rgba(74,222,128,0.16)" : `${deltaColor}18`,
              boxShadow: `inset 0 0 0 1px ${trendUp ? "rgba(74,222,128,0.45)" : `${deltaColor}55`}`,
            }}
          >
            <DeltaIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {trendUp ? "แนวโน้มดีขึ้น" : deltaLabel}
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
        <div className="rounded-[14px] border border-dashed border-[#7B6BB0]/25 bg-white/40 px-3 py-5 text-center">
          <p className="text-[14px] font-medium text-[#2C2458]">
            ยังไม่มีข้อมูลจังหวะรายเดือน
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[#5E5688]">
            ส่วนนี้รอคะแนนรายเดือนจากระบบคำนวณ
          </p>
        </div>
      )}

      {hasData && curBand ? (
        <div className="rounded-[16px] border border-[#3DCF7A]/35 bg-[#3DCF7A]/10 px-3.5 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-wide text-[#2F9E5F]">
                เดือนปัจจุบัน · {MONTH_NAMES_TH[cur.monthIndex]}{" "}
                {cur.yearCe + 543}
              </p>
              <p className="mt-1 text-[15px] font-semibold text-[#2C2458]">
                {curBand.label}
              </p>
            </div>
            <p
              className="shrink-0 text-[1.35rem] font-bold tabular-nums"
              style={{ color: scoreColor(cur.score) }}
            >
              {cur.score}
              <span className="text-[13px] font-semibold text-[#6B6490]">
                /12
              </span>
            </p>
          </div>
          <p className="mt-2.5 text-[13px] leading-[1.65] text-[#3A3270]">
            {curBand.meaning}
          </p>
          <p className="mt-2 text-[13px] leading-[1.65] text-[#4A4278]">
            <span className="font-semibold text-[#2C2458]">ใช้ยังไง · </span>
            {curBand.use}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-[#6B6490]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3DCF7A]" />
          เดือนปัจจุบัน · ดูได้ฟรี
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FortuneIcon name="lock" size={22} />
          ปลดล็อกเพื่อดูย้อนหลัง
        </span>
      </div>

      <div className="flex items-center gap-2.5 rounded-[14px] bg-[#4A2B6A] px-3 py-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          <FortuneIcon name="finance" size={40} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-white">
            เห็นจังหวะชีวิตได้ไกลกว่าเดิม
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/65">
            เจาะลึกเส้นทางชีวิต 12 ปี พร้อมคำแนะนำเฉพาะคุณ
          </p>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          disabled={!onUnlock}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#7B5FD4] px-3 py-2 text-[11px] font-semibold text-white outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60"
        >
          ปลดล็อกพรีเมียม · {FORTUNE_UNLOCK_PRICE} บาท
          <FortuneIcon name="arrow-right" size={20} />
        </button>
      </div>
    </section>
  );
}
