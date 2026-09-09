"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Sparkles } from "lucide-react";
import { analyzeFortune, type FortuneFocus } from "@/lib/fortune/analyze";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

/** Map 1–12 fortune score → UI percent band */
function pctFromScore(score: number, min = 35, max = 92) {
  const t = (Math.max(1, Math.min(12, score)) - 1) / 11;
  return Math.round(min + t * (max - min));
}

function scoreFrom(seed: string, salt: string, min = 35, max = 92) {
  const n = hashSeed(`${seed}-${salt}`);
  return min + (n % (max - min + 1));
}

const AXES = [
  {
    key: "self",
    label: "ความเป็นตัวเอง",
    high: "คุณรู้ว่าตัวเองต้องการอะไร และไม่ไหลตามคนอื่นง่าย ๆ",
    mid: "มีแกนของตัวเองอยู่ ปรับตามสถานการณ์ได้โดยไม่ทิ้งของสำคัญไป",
    low: "เผลอเอนตามคนรอบตัวบ่อย ลองถามสั้น ๆ ว่า ‘อันนี้ใจเราอยากไหม’ ก่อนตอบรับ",
    tip: "เขียนสิ่งที่ไม่ยอมทิ้งไว้สามข้อ เวลาต้องเลือกทางจะตัดใจง่ายขึ้น",
  },
  {
    key: "express",
    label: "การแสดงออก",
    high: "คุณพูดแล้วคนเข้าใจไว คนรอบตัวรู้ว่าคุณคิดอะไรอยู่",
    mid: "พูดได้เวลาจำเป็น แต่ก็ยังเก็บบางเรื่องไว้กับตัว",
    low: "คิดในใจมากกว่าพูดออกมา คนจึงเดาใจคุณไม่ค่อยถูก",
    tip: "วันละหนึ่งประโยค พูดสิ่งที่อยากบอกให้ตรง ไม่ต้องอธิบายยาว",
  },
  {
    key: "money",
    label: "เซนส์เรื่องเงิน",
    high: "คุณดูออกว่าอะไรคุ้ม อะไรควรรอ จับจังหวะเงินได้ดี",
    mid: "จัดการเงินได้เมื่อมีแผน แต่บางทีอารมณ์ก็แทรกเข้ามา",
    low: "เงินมักหายไปกับของที่ตอนนั้นก็อยากได้ ยังไม่ค่อยมีเบรก",
    tip: "แยกเงินเป็น จำเป็น / อยากได้ / เก็บ แล้วเปิดดูสัปดาห์ละครั้ง",
  },
  {
    key: "duty",
    label: "ความรับผิดชอบ",
    high: "รับปากแล้วทำจริง คนอื่นวางใจฝากงานกับคุณได้",
    mid: "เรื่องหลักเอาอยู่ แต่ถ้างานซ้อนกันควรกระจายออกบ้าง",
    low: "งานยากมักถูกเลื่อนไปก่อน แล้วมากองพร้อมกันตอนท้าย",
    tip: "รับคำมั่นหลักทีละเรื่อง ทำให้จบก่อนแล้วค่อยรับเพิ่ม",
  },
  {
    key: "learn",
    label: "การเรียนรู้",
    high: "รับของใหม่ไว ชอบหาอะไรมาอัปเกรดตัวเองเรื่อย ๆ",
    mid: "เรียนเมื่อเห็นว่าได้ใช้จริง ไม่ไล่เก็บทุกอย่างพร้อมกัน",
    low: "ถนัดวิธีเดิมจนไม่ค่อยอยากลองทางใหม่",
    tip: "เลือกเรื่องเดียวต่อเดือน แล้วเอาไปใช้จริงให้ครบสามครั้ง",
  },
  {
    key: "flex",
    label: "ความยืดหยุ่นทางใจ",
    high: "เจอเรื่องกระทบแล้วฟื้นเร็ว แผนพังก็หาทางใหม่ได้",
    mid: "ยืดหยุ่นได้พอตัว แต่ยังมีกรอบที่ทำให้ไม่หลุดโฟกัส",
    low: "พอแผนไม่เป็นไปตามที่คิด ใจจะตึงและคิดวนอยู่นาน",
    tip: "เวลาเครียด ถามตัวเองว่า ‘ยังมีทางอื่นอีกไหม’ ให้ได้อย่างน้อยสองทาง",
  },
] as const;

const SPECTRA = [
  {
    key: "social",
    left: "เก็บตัว",
    right: "เข้าสังคม",
    leftHigh:
      "คุณชาร์จแบตจากความเงียบ อยู่คนเดียวแล้วหัวโล่ง คิดอะไรออก",
    rightHigh:
      "คุณชาร์จแบตจากคน คุยไปคุยมาแล้วไอเดียมาเอง",
    tip: "งานที่ต้องคิดลึกเก็บไว้ตอนอยู่คนเดียว เรื่องที่ต้องตัดสินใจร่วมค่อยนัดคุย",
  },
  {
    key: "mind",
    left: "ใช้อารมณ์",
    right: "ใช้เหตุผล",
    leftHigh:
      "คุณเชื่อความรู้สึกตัวเอง และมักจับอะไรได้ก่อนที่จะอธิบายเป็นเหตุผล",
    rightHigh:
      "คุณขอดูข้อมูลก่อน จึงไม่ค่อยพลาดเพราะอารมณ์ชั่ววูบ",
    tip: "เรื่องใหญ่เช็คสองชั้น ทั้ง ‘ใจว่าไง’ และ ‘ข้อมูลว่าไง’ ค่อยลงมือ",
  },
  {
    key: "agency",
    left: "ประนีประนอม",
    right: "เป็นอิสระ",
    leftHigh:
      "คุณหาจุดที่ทุกคนอยู่ร่วมกันได้ ความสัมพันธ์รอบตัวจึงไม่ค่อยสะดุด",
    rightHigh:
      "คุณถือทางของตัวเองไว้ ไม่ปล่อยให้ใครมาบีบจนเสียทิศ",
    tip: "เรื่องรองยอมได้ไม่เสียหาย แต่เรื่องที่เป็นแกนของคุณ ยืนให้มั่น",
  },
  {
    key: "risk",
    left: "ชอบความมั่นคง",
    right: "ชอบความท้าทาย",
    leftHigh:
      "คุณชอบทางที่คาดเดาได้ วางระบบและกันความเสี่ยงไว้ก่อนเสมอ",
    rightHigh:
      "คุณตื่นตัวกับของใหม่ ได้ลองอะไรที่ยังไม่มีใครทำแล้วรู้สึกมีชีวิต",
    tip: "กันฐานที่มั่นคงไว้ก้อนหนึ่ง แล้วแบ่งอีกก้อนเล็กไว้ให้ตัวเองได้ลอง",
  },
] as const;

const ELEMENTS = [
  {
    key: "wood",
    label: "ไม้",
    color: "#22A06B",
    high: "ธาตุไม้แรง คุณชอบเริ่มของใหม่ และดันให้มันโตต่อได้",
    mid: "ธาตุไม้พอดี พอมีเป้าชัดก็ปรับตัวและเรียนรู้ได้เรื่อย ๆ",
    low: "ธาตุไม้อ่อน เวลาต้องเริ่มใหม่มักลังเลอยู่นานกว่าจะขยับ",
    tip: "เติมไม้ด้วยการเรียนรู้ให้สม่ำเสมอ แล้วลงมือทีละก้าวเล็ก ๆ",
  },
  {
    key: "fire",
    label: "ไฟ",
    color: "#E87A2E",
    high: "ธาตุไฟเด่น มีแรงขับ กล้าตัดสินใจ และจุดใจคนรอบตัวได้เร็ว",
    mid: "ธาตุไฟพอดี ใช้ความร้อนตอนที่ต้องใช้ โดยไม่ไหม้ตัวเอง",
    low: "ธาตุไฟเบา คิดไว้เยอะแต่แรงเริ่มไม่ค่อยมา",
    tip: "เติมไฟด้วยการปิดเรื่องหลักให้จบหนึ่งเรื่อง ความรู้สึกว่าทำได้จะพาต่อ",
  },
  {
    key: "earth",
    label: "ดิน",
    color: "#C9A227",
    high: "ธาตุดินแน่น อยู่กับอะไรได้นาน วางระบบและรับผิดชอบได้ยาว",
    mid: "ธาตุดินพอดี ต่อให้สถานการณ์เปลี่ยน คุณก็ยังยืนพื้นได้",
    low: "ธาตุดินบาง พอแผนพังจะรู้สึกไม่มีที่ยึด",
    tip: "เติมดินด้วยกิจวัตรเล็ก ๆ ที่ทำซ้ำได้ทุกวัน ไม่ต้องใหญ่",
  },
  {
    key: "metal",
    label: "โลหะ",
    color: "#6B7A94",
    high: "ธาตุโลหะคม มีมาตรฐานของตัวเอง ตัดสิ่งที่ไม่เอาได้เด็ดขาด",
    mid: "ธาตุโลหะพอใช้ ตั้งขอบเขตและคัดของออกได้เมื่อจำเป็น",
    low: "ธาตุโลหะอ่อน ปล่อยมาตรฐานหลวมและตัดใจยากกว่าคนอื่น",
    tip: "เติมโลหะด้วยการตั้งเกณฑ์ให้ชัดก่อนรับงาน แล้วปิดเรื่องที่ไม่ไปไหนต่อ",
  },
  {
    key: "water",
    label: "น้ำ",
    color: "#2F8FBC",
    high: "ธาตุน้ำลึก อ่านอารมณ์คนและบรรยากาศได้ไว ยิ่งใจนิ่งยิ่งแม่น",
    mid: "ธาตุน้ำพอดี เข้าใจความรู้สึกคนได้โดยไม่จมไปกับมัน",
    low: "ธาตุน้ำเบา มักสรุปจากเหตุผลอย่างเดียวจนข้ามความรู้สึกไป",
    tip: "เติมน้ำด้วยเวลาเงียบสั้น ๆ ในวัน แล้วฟังใจตัวเองก่อนตอบรับ",
  },
] as const;

type AxisRow = {
  key: string;
  label: string;
  score: number;
  high: string;
  mid: string;
  low: string;
  tip: string;
};

type SpectrumRowData = {
  key: string;
  left: string;
  right: string;
  leftPct: number;
  leftHigh: string;
  rightHigh: string;
  tip: string;
};

type ElementRow = {
  key: string;
  label: string;
  color: string;
  pct: number;
  high: string;
  mid: string;
  low: string;
  tip: string;
};

function axisReading(a: AxisRow) {
  if (a.score >= 75) return a.high;
  if (a.score >= 55) return a.mid;
  return a.low;
}

function axisLevel(score: number) {
  if (score >= 75) return "เด่นชัด";
  if (score >= 55) return "พอสมควร";
  return "ควรเติม";
}

function readingFor(el: ElementRow) {
  if (el.pct >= 28) return el.high;
  if (el.pct >= 12) return el.mid;
  return el.low;
}

function levelLabel(pct: number) {
  if (pct >= 28) return "เด่นชัด";
  if (pct >= 12) return "พอสมควร";
  if (pct <= 5) return "เกือบหาย";
  return "อ่อน";
}

function useSwipePager(length: number, initial = 0) {
  const [index, setIndex] = useState(initial);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(280);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      widthRef.current = viewportRef.current?.clientWidth || 280;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(length - 1, next)));
    setDragX(0);
    setDragging(false);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    widthRef.current = viewportRef.current?.clientWidth || 280;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    const w = widthRef.current;
    let next = dx;
    if ((index === 0 && dx > 0) || (index === length - 1 && dx < 0)) {
      next = dx * 0.35;
    }
    setDragX(Math.max(-w * 1.05, Math.min(w * 1.05, next)));
  }

  function onPointerUp() {
    if (!activeRef.current) return;
    activeRef.current = false;
    const dx = lastXRef.current - startXRef.current;
    const threshold = Math.min(56, widthRef.current * 0.16);
    setDragging(false);
    if (dx < -threshold) goTo(index + 1);
    else if (dx > threshold) goTo(index - 1);
    else setDragX(0);
  }

  const dragPct =
    widthRef.current > 0 ? (dragX / widthRef.current) * 100 : 0;

  return {
    index,
    goTo,
    dragPct,
    dragging,
    viewportRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}

function RadarChart({
  values,
  selectedIndex = 0,
  onSelect,
}: {
  values: { label: string; score: number }[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}) {
  const gid = useId().replace(/:/g, "");
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 98;
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
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
      <defs>
        <linearGradient id={`radar-fill-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(155,127,232,0.35)" />
          <stop offset="100%" stopColor="rgba(123,95,212,0.16)" />
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
          stroke="rgba(90,70,150,0.18)"
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
            stroke={
              i === selectedIndex
                ? "rgba(123,95,212,0.5)"
                : "rgba(90,70,150,0.16)"
            }
            strokeWidth={i === selectedIndex ? 1.5 : 1}
          />
        );
      })}

      <polygon
        points={poly}
        fill={`url(#radar-fill-${gid})`}
        stroke="#7B5FD4"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {values.map((v, i) => {
        const p = point(i, (v.score / 100) * maxR);
        const tip = point(i, maxR + 28);
        const selected = i === selectedIndex;
        return (
          <g
            key={v.label}
            className={onSelect ? "cursor-pointer" : undefined}
            onClick={() => onSelect?.(i)}
          >
            <circle
              cx={tip.x}
              cy={tip.y + 4}
              r={26}
              fill="transparent"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={selected ? 6 : 4}
              fill="#7B5FD4"
              stroke={selected ? "#fff" : "none"}
              strokeWidth={selected ? 2.5 : 0}
            />
            <text
              x={tip.x}
              y={tip.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={selected ? "#241C4F" : "#3A3270"}
              fontSize={11}
              fontWeight={selected ? 700 : 600}
            >
              {v.label}
            </text>
            <text
              x={tip.x}
              y={tip.y + 14}
              textAnchor="middle"
              fill={selected ? "#5B45B8" : "#6B6490"}
              fontSize={12}
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

function AxisSwipeReader({
  axes,
  index,
  onIndexChange,
}: {
  axes: AxisRow[];
  index: number;
  onIndexChange: (i: number) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(280);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      widthRef.current = viewportRef.current?.clientWidth || 280;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function goTo(next: number) {
    onIndexChange(Math.max(0, Math.min(axes.length - 1, next)));
    setDragX(0);
    setDragging(false);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    widthRef.current = viewportRef.current?.clientWidth || 280;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    const w = widthRef.current;
    let next = dx;
    if ((index === 0 && dx > 0) || (index === axes.length - 1 && dx < 0)) {
      next = dx * 0.35;
    }
    setDragX(Math.max(-w * 1.05, Math.min(w * 1.05, next)));
  }

  function onPointerUp() {
    if (!activeRef.current) return;
    activeRef.current = false;
    const dx = lastXRef.current - startXRef.current;
    const threshold = Math.min(56, widthRef.current * 0.16);
    setDragging(false);
    if (dx < -threshold) goTo(index + 1);
    else if (dx > threshold) goTo(index - 1);
    else setDragX(0);
  }

  const dragPct =
    widthRef.current > 0 ? (dragX / widthRef.current) * 100 : 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold tracking-[0.08em] text-[#5B45B8]">
          อ่านแกน · กดเรดาร์หรือปัด
        </p>
        <p className="text-[13px] font-semibold tabular-nums text-[#6B6490]">
          {index + 1}/{axes.length}
        </p>
      </div>

      <div
        ref={viewportRef}
        className="relative mt-2 touch-pan-y overflow-hidden select-none"
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
              : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {axes.map((a) => (
            <article
              key={a.key}
              className="w-full min-w-full shrink-0 basis-full px-0.5"
            >
              <div
                className="rounded-[14px] px-3.5 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.42)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <p className="text-[16px] font-semibold text-[#241C4F]">
                  {a.label} · {a.score}
                </p>
                <p className="mt-1 text-[13px] font-medium text-[#5B45B8]">
                  {axisLevel(a.score)}
                </p>
                <p className="mt-2.5 text-[14px] leading-[1.7] text-[#3A3270]">
                  {axisReading(a)}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[#5E5688]">
                  แนวทาง: {a.tip}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
        {axes.map((a, i) => (
          <button
            key={a.key}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-semibold outline-none transition",
              i === index
                ? "bg-[#9B7FE8]/22 text-[#5B45B8] ring-1 ring-[#9B7FE8]/45"
                : "bg-[#7B6BB0]/10 text-[#5E5688]"
            )}
          >
            {a.score}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpectrumSwipeReader({ items }: { items: SpectrumRowData[] }) {
  const {
    index,
    goTo,
    dragPct,
    dragging,
    viewportRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useSwipePager(items.length, 0);
  const active = items[index]!;
  const rightPct = 100 - active.leftPct;
  const leftWins = active.leftPct >= 50;

  return (
    <div className="mt-1 space-y-3">
      {items.map((item, i) => {
        const selected = i === index;
        const r = 100 - item.leftPct;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => goTo(i)}
            aria-pressed={selected}
            className={cn(
              "w-full space-y-1.5 rounded-[12px] px-1.5 py-1.5 text-left outline-none transition",
              selected
                ? "bg-[#7B6BB0]/10 ring-1 ring-[#7B6BB0]/22"
                : "hover:bg-[#7B6BB0]/06"
            )}
          >
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#241C4F]">
                {item.left} {item.leftPct}%
              </span>
              <span className="font-semibold text-[#5E5688]">
                {item.right} {r}%
              </span>
            </div>
            <div className="dd-glass-tube relative h-3.5 rounded-full">
              <div
                className="dd-glass-tube-fill absolute inset-y-[2px] left-[2px] rounded-full"
                style={{
                  width: `calc(${item.leftPct}% - 4px)`,
                  background:
                    "linear-gradient(90deg, rgba(155,127,232,0.55) 0%, rgba(196,176,245,0.72) 55%, rgba(232,201,106,0.55) 100%)",
                }}
              />
            </div>
          </button>
        );
      })}

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-[#5B45B8]">
            อ่านสเปกตรัม · กดหรือปัด
          </p>
          <p className="text-[13px] font-semibold tabular-nums text-[#6B6490]">
            {index + 1}/{items.length}
          </p>
        </div>

        <div
          ref={viewportRef}
          className="relative mt-2 touch-pan-y overflow-hidden select-none"
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
                : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {items.map((item) => {
              const rp = 100 - item.leftPct;
              const leftSide = item.leftPct >= 50;
              return (
                <article
                  key={item.key}
                  className="w-full min-w-full shrink-0 basis-full px-0.5"
                >
                  <div
                    className="rounded-[14px] px-3.5 py-3.5"
                    style={{
                      background: "rgba(255,255,255,0.42)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <p className="text-[16px] font-semibold text-[#241C4F]">
                      {item.left} {item.leftPct}% · {item.right} {rp}%
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-[#5B45B8]">
                      เอียงไปทาง{leftSide ? item.left : item.right}
                    </p>
                    <p className="mt-2.5 text-[14px] leading-[1.7] text-[#3A3270]">
                      {leftSide ? item.leftHigh : item.rightHigh}
                    </p>
                    <p className="mt-2 text-[13px] leading-snug text-[#5E5688]">
                      แนวทาง: {item.tip}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              aria-label={item.left}
              onClick={() => goTo(i)}
              className="h-2 rounded-full outline-none transition-all"
              style={{
                width: i === index ? 18 : 8,
                background:
                  i === index ? "#9B7FE8" : "rgba(123,107,176,0.28)",
              }}
            />
          ))}
        </div>
      </div>

      <p className="sr-only">
        {leftWins ? active.left : active.right} {rightPct}%
      </p>
    </div>
  );
}

function ElementSwipeReader({
  elements,
  initialKey,
}: {
  elements: ElementRow[];
  initialKey: string;
}) {
  const startIdx = Math.max(
    0,
    elements.findIndex((e) => e.key === initialKey)
  );
  const [index, setIndex] = useState(startIdx);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(280);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      widthRef.current = viewportRef.current?.clientWidth || 280;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(elements.length - 1, next)));
    setDragX(0);
    setDragging(false);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    widthRef.current = viewportRef.current?.clientWidth || 280;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!activeRef.current) return;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    const w = widthRef.current;
    let next = dx;
    if ((index === 0 && dx > 0) || (index === elements.length - 1 && dx < 0)) {
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
    const threshold = Math.min(56, widthRef.current * 0.16);
    setDragging(false);
    if (dx < -threshold) goTo(index + 1);
    else if (dx > threshold) goTo(index - 1);
    else setDragX(0);
  }

  const dragPct =
    widthRef.current > 0 ? (dragX / widthRef.current) * 100 : 0;
  const active = elements[index]!;

  return (
    <div className="mt-3">
      <div className="space-y-2">
        {elements.map((el, i) => {
          const selected = i === index;
          return (
            <button
              key={el.key}
              type="button"
              onClick={() => goTo(i)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[12px] px-1.5 py-1.5 text-left outline-none transition",
                selected
                  ? "bg-[#7B6BB0]/10 ring-1 ring-[#7B6BB0]/22"
                  : "hover:bg-[#7B6BB0]/06"
              )}
            >
              <span
                className="w-11 shrink-0 text-[14px] font-semibold"
                style={{ color: el.color }}
              >
                {el.label}
              </span>
              <div className="dd-glass-tube relative h-3.5 min-w-0 flex-1 rounded-full">
                <div
                  className="dd-glass-tube-fill absolute inset-y-[2px] left-[2px] rounded-full transition-[width]"
                  style={{
                    width: `calc(${Math.max(el.pct, 2)}% - 4px)`,
                    background: `linear-gradient(90deg, ${el.color}99 0%, ${el.color}cc 55%, ${el.color}88 100%)`,
                    minWidth: el.pct > 0 ? 8 : 0,
                  }}
                />
              </div>
              <span className="w-11 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#3A3270]">
                {el.pct}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-[#5B45B8]">
            อ่านธาตุ · กดหรือปัด
          </p>
          <p className="text-[12px] font-semibold tabular-nums text-[#6B6490]">
            {index + 1}/{elements.length}
          </p>
        </div>

        <div
          ref={viewportRef}
          className="relative mt-2 touch-pan-y overflow-hidden select-none"
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
                : "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {elements.map((el) => (
              <article
                key={el.key}
                className="w-full min-w-full shrink-0 basis-full px-0.5"
              >
                <div
                  className="rounded-[14px] px-3.5 py-3"
                  style={{
                    background: "rgba(255,255,255,0.42)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white"
                      style={{ background: el.color }}
                    >
                      {el.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#241C4F]">
                        ธาตุ{el.label} · {el.pct}%
                      </p>
                      <p className="text-[11px] font-medium" style={{ color: el.color }}>
                        {levelLabel(el.pct)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-[1.7] text-[#3A3270]">
                    {readingFor(el)}
                  </p>
                  <p className="mt-2 text-[12px] leading-snug text-[#5E5688]">
                    แนวทาง: {el.tip}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {elements.map((el, i) => (
            <button
              key={el.key}
              type="button"
              aria-label={`ธาตุ${el.label}`}
              onClick={() => goTo(i)}
              className="h-2 rounded-full outline-none transition-all"
              style={{
                width: i === index ? 18 : 8,
                background: i === index ? active.color : "rgba(123,107,176,0.28)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Premium deep self analysis — radar, spectra, five elements (end of premium page) */
export function FortunePremiumSelfDeep({
  seed,
  nickname,
  birthDate = "2000-01-01",
  birthTime,
  focus,
  gender,
  className,
}: {
  seed: string;
  nickname: string;
  birthDate?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
}) {
  const data = useMemo(() => {
    const analysis = analyzeFortune({
      birthDate,
      nickname,
      birthTime,
      focus,
      gender,
    });
    const byId = Object.fromEntries(
      analysis.aspects.map((a) => [a.id, a.score])
    ) as Record<string, number>;

    const axisScores: Record<string, number> = {
      self: pctFromScore(analysis.dayScore),
      express: pctFromScore(byId.love ?? analysis.dayScore),
      money: pctFromScore(byId.money ?? analysis.dayScore),
      duty: pctFromScore(byId.work ?? analysis.dayScore),
      learn: pctFromScore(analysis.monthScore),
      flex: pctFromScore(byId.health ?? analysis.yearScore),
    };

    const axes: AxisRow[] = AXES.map((a) => ({
      ...a,
      score: axisScores[a.key] ?? scoreFrom(analysis.seed, a.key),
    }));
    const top = [...axes].sort((a, b) => b.score - a.score)[0]!;
    const topIdx = axes.findIndex((a) => a.key === top.key);

    const spectra: SpectrumRowData[] = [
      {
        ...SPECTRA[0]!,
        leftPct: pctFromScore(12 - (byId.love ?? 6) + 1, 40, 85),
      },
      {
        ...SPECTRA[1]!,
        leftPct: pctFromScore(byId.health ?? 6, 25, 70),
      },
      {
        ...SPECTRA[2]!,
        leftPct: pctFromScore(byId.work ?? 6, 35, 80),
      },
      {
        ...SPECTRA[3]!,
        leftPct: pctFromScore(analysis.yearScore, 40, 88),
      },
    ];

    const elementBoost: Record<string, string> = {
      ไฟ: "fire",
      ดิน: "earth",
      ลม: "wood",
      น้ำ: "water",
    };
    const boostKey = elementBoost[analysis.zodiac.element] ?? "earth";

    const rawElements = ELEMENTS.map((e) => ({
      ...e,
      weight:
        (hashSeed(`${analysis.seed}-el-${e.key}`) % 100) +
        (e.key === boostKey ? 40 : 0) +
        (e.key === "metal" ? Math.round(analysis.yearScore * 2) : 0),
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

    return {
      axes,
      top,
      topIdx: topIdx >= 0 ? topIdx : 0,
      spectra,
      elements,
      strongest,
    };
  }, [seed, birthDate, nickname, birthTime, focus, gender]);

  const [axisIndex, setAxisIndex] = useState(data.topIdx);
  const name = nickname.trim() || "คุณ";

  useEffect(() => {
    setAxisIndex(data.topIdx);
  }, [data.topIdx]);

  return (
    <div className={cn("space-y-3", className)}>
      <section className="fortune-glass rounded-[20px] px-4 py-4">
        <div className="text-center">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#5B45B8]">
            PREMIUM · SELF MAP
          </p>
          <h2 className="font-sacred mt-1.5 text-[1.45rem] leading-snug text-[#241C4F]">
            คุณ{name}เป็นคนแบบไหนกันนะ
          </h2>
        </div>

        <div className="mt-4">
          <RadarChart
            values={data.axes}
            selectedIndex={axisIndex}
            onSelect={setAxisIndex}
          />
          <p className="mt-2 px-2 text-center text-[13px] leading-relaxed text-[#5E5688]">
            6 แกนอุปนิสัย · กดจุดบนเรดาร์หรือปัดอ่านทีละแกน
          </p>
          <AxisSwipeReader
            axes={data.axes}
            index={axisIndex}
            onIndexChange={setAxisIndex}
          />
        </div>
      </section>

      <section className="fortune-glass rounded-[20px] px-4 py-4">
        <p className="text-[13px] font-semibold tracking-[0.1em] text-[#5B45B8]">
          สเปกตรัมอุปนิสัย
        </p>
        <SpectrumSwipeReader items={data.spectra} />
      </section>

      <section className="fortune-glass rounded-[20px] px-4 py-4">
        <p className="text-[13px] font-semibold tracking-[0.1em] text-[#5B45B8]">
          ห้าธาตุในตัวคุณ
        </p>
        <h3 className="mt-1 text-[16px] font-semibold text-[#241C4F]">
          การกระจายห้าธาตุ
        </h3>

        <ElementSwipeReader
          elements={data.elements}
          initialKey={data.strongest.key}
        />

        <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-[#7B6BB0]/14 pt-3 text-[12px] text-[#6B6490]">
          <Sparkles className="h-3.5 w-3.5 text-[#7B5FD4]" strokeWidth={1.8} />
          ส่วนพรีเมียมท้ายรายงาน · วิเคราะห์เฉพาะคุณ
        </div>
      </section>
    </div>
  );
}
