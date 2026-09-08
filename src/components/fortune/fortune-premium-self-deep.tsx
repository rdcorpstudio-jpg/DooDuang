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
  {
    key: "self",
    label: "ความเป็นตัวเอง",
    high: "คุณมีแกนตัวตนชัด รู้ว่าอยากได้อะไร และไม่ค่อยหลุดตามกระแสคนอื่นง่าย",
    mid: "คุณมีตัวตนพอสมควร ปรับเข้ากับสถานการณ์ได้โดยไม่ทิ้งแก่นของตัวเองทั้งหมด",
    low: "คุณอาจเอนตามคนรอบข้างบ่อย — ลองตั้งคำถามสั้น ๆ ว่า ‘อันนี้ใช่ใจฉันไหม’ ก่อนตัดสินใจ",
    tip: "เขียนสิ่งที่คุณยึดไว้ 3 ข้อ แล้วใช้เป็นเข็มทิศตอนเลือกทาง",
  },
  {
    key: "express",
    label: "การแสดงออก",
    high: "คุณสื่อสารและแสดงพลังออกนอกได้ดี คนอื่นรับรู้ความคิดของคุณได้เร็ว",
    mid: "คุณแสดงออกได้เมื่อจำเป็น แต่ยังเก็บบางส่วนไว้ข้างในอย่างสมดุล",
    low: "คุณเก็บไว้ในใจมากกว่าพูดออก — เริ่มจากประโยคสั้น ๆ ที่ชัด จะช่วยให้คนเข้าใจคุณมากขึ้น",
    tip: "ฝึกพูดสิ่งสำคัญ 1 ประโยคต่อวัน โดยไม่ต้องอธิบายยาว",
  },
  {
    key: "money",
    label: "เซนส์เรื่องเงิน",
    high: "คุณจับจังหวะเงินและมูลค่าได้ดี รู้ว่าอะไรคุ้มและอะไรควรรอ",
    mid: "คุณจัดการเงินได้พอใช้เมื่อมีแผน แต่บางครั้งอารมณ์ก็แทรกเข้ามาได้",
    low: "เซนส์เงินยังไม่คม — ตั้งกติกาง่าย ๆ ก่อนใช้จ่ายใหญ่จะช่วยคุมจังหวะได้",
    tip: "แยกเงิน ‘จำเป็น / อยากได้ / ออม’ แล้วดูสัปดาห์ละครั้ง",
  },
  {
    key: "duty",
    label: "ความรับผิดชอบ",
    high: "คุณแบกงานและคำมั่นได้หนัก เชื่อถือได้เมื่อคนอื่นวางใจ",
    mid: "คุณรับผิดชอบเรื่องหลักได้ดี แต่ควรแบ่งงานเมื่อภาระซ้อนกัน",
    low: "คุณอาจหลีกงานยากหรือเลื่อนออกไป — ตัดงานเป็นก้อนเล็กแล้วปิดทีละก้อน",
    tip: "รับแค่ 1 คำมั่นหลักต่อช่วงเวลา แล้วทำให้จบก่อนรับเพิ่ม",
  },
  {
    key: "learn",
    label: "การเรียนรู้",
    high: "คุณเปิดรับความรู้ใหม่เร็ว และชอบอัปเกรดตัวเองอยู่เสมอ",
    mid: "คุณเรียนรู้ได้เมื่อเห็นประโยชน์ชัด แต่ไม่ไล่ทุกคอร์สพร้อมกัน",
    low: "อาจยึดวิธีเดิมนานไป — ลองทดลองวิธีใหม่เล็ก ๆ แล้ววัดผลสั้น ๆ",
    tip: "เลือกหัวข้อเดียวต่อเดือน แล้วลงมือใช้จริงอย่างน้อย 3 ครั้ง",
  },
  {
    key: "flex",
    label: "ความยืดหยุ่นทางใจ",
    high: "ใจคุณยืดได้ดี ฟื้นตัวจากแรงกดดันได้ และปรับแผนเมื่อสถานการณ์เปลี่ยน",
    mid: "คุณยืดหยุ่นได้ในระดับพอใช้ โดยยังมีกรอบที่ทำให้ไม่หลุดโฟกัส",
    low: "ใจอาจตึงเมื่อแผนพัง — ฝึกเว้นจังหวะหายใจก่อนตอบสนอง",
    tip: "เมื่อเครียด ให้ตั้งคำถามว่า ‘มีทางอื่นอีกไหม’ อย่างน้อย 2 ทาง",
  },
] as const;

const SPECTRA = [
  {
    key: "social",
    left: "เก็บตัว",
    right: "เข้าสังคม",
    leftHigh:
      "คุณเติมพลังจากความเงียบและพื้นที่ส่วนตัว การอยู่คนเดียวช่วยให้คิดชัด",
    rightHigh:
      "คุณเติมพลังจากผู้คน การคุยแลกเปลี่ยนช่วยเปิดไอเดียและความสัมพันธ์",
    tip: "จัดสลับจังหวะ ‘คนเดียว / กับคน’ ให้ตรงกับงานวันนั้น",
  },
  {
    key: "mind",
    left: "ใช้อารมณ์",
    right: "ใช้เหตุผล",
    leftHigh:
      "คุณตัดสินใจด้วยความรู้สึกและสัญชาตญาณ ทำให้เห็นนัยที่ตัวเลขไม่บอก",
    rightHigh:
      "คุณพึ่งข้อมูลและเหตุผลชัด ช่วยลดการตัดสินใจพลาดจากอารมณ์ชั่วขณะ",
    tip: "เรื่องใหญ่ให้เช็คทั้ง ‘รู้สึกยังไง’ และ ‘ข้อมูลบอกอะไร’ ก่อนลงมือ",
  },
  {
    key: "agency",
    left: "ประนีประนอม",
    right: "เป็นอิสระ",
    leftHigh:
      "คุณเก่งเรื่องหาจุดร่วม ทำให้ความสัมพันธ์และทีมเดินต่อได้ราบรื่น",
    rightHigh:
      "คุณยึดทางของตัวเองชัด ไม่ยอมให้กรอบคนอื่นบีบจนเสียทิศ",
    tip: "ยอมประนีประนอมเรื่องรอง แต่ยึดอิสระในเรื่องที่เป็นแก่นของคุณ",
  },
  {
    key: "risk",
    left: "ชอบความมั่นคง",
    right: "ชอบความท้าทาย",
    leftHigh:
      "คุณวางรากฐานและระบบได้ดี ชอบทางที่คาดเดาได้และคุมความเสี่ยง",
    rightHigh:
      "คุณตื่นกับโอกาสใหม่ ชอบทดลองและดันขอบเขตของตัวเอง",
    tip: "เก็บฐานมั่นคงไว้ก้อนหนึ่ง แล้วเปิดโควต้าทดลองเล็ก ๆ เป็นระยะ",
  },
] as const;

const ELEMENTS = [
  {
    key: "wood",
    label: "ไม้",
    color: "#22A06B",
    high: "ธาตุไม้แรง ทำให้คุณเติบโตและขยายโอกาสได้ดี ชอบเริ่มต้นสิ่งใหม่และผลักดันให้เดินหน้า",
    mid: "ธาตุไม้อยู่ในระดับพอดี ช่วยให้ปรับตัวและเรียนรู้ได้เมื่อมีเป้าหมายชัด",
    low: "ธาตุไม่อ่อน คุณอาจลังเลเวลาต้องเริ่มใหม่ — ลองเปิดพื้นที่เล็ก ๆ ให้ตัวเองได้ทดลอง",
    tip: "เติมไม้ด้วยการเรียนรู้อย่างสม่ำเสมอ และลงมือทีละก้าว",
  },
  {
    key: "fire",
    label: "ไฟ",
    color: "#E87A2E",
    high: "ธาตุไฟเด่น พลังขับเคลื่อนสูง กล้าตัดสินใจ และจุดประกายคนรอบข้างได้เร็ว",
    mid: "ธาตุไฟสมดุล ใช้ความร้อนในจังหวะสำคัญได้ดี โดยไม่ไหม้ตัวเองง่าย",
    low: "ธาตุไฟเบา อาจขาดแรงส่งตอนเริ่ม — ตั้งเป้าหมายสั้น ๆ ที่เห็นผลเร็วจะช่วยจุดไฟ",
    tip: "เติมไฟด้วยการลงมือเรื่องหลักให้จบ แล้วค่อยเปิดเรื่องใหม่",
  },
  {
    key: "earth",
    label: "ดิน",
    color: "#C9A227",
    high: "ธาตุดินแน่น สร้างความมั่นคง วางระบบ และรับผิดชอบได้ยาวนาน",
    mid: "ธาตุดินพอดี ช่วยให้คุณยืนพื้นได้เมื่อสถานการณ์เปลี่ยน",
    low: "ธาตุดินบาง อาจรู้สึกไร้รากเมื่อแผนพัง — สร้างกิจวัตรเล็ก ๆ ที่ทำซ้ำได้",
    tip: "เติมดินด้วยวินัยเบา ๆ และการเก็บงานให้จบเป็นชุด",
  },
  {
    key: "metal",
    label: "โลหะ",
    color: "#6B7A94",
    high: "ธาตุโลหะคม มีมาตรฐานชัด ตัดใจและจัดระเบียบได้ดี",
    mid: "ธาตุโลหะพอใช้ ช่วยคัดเลือกและตั้งขอบเขตเมื่อจำเป็น",
    low: "ธาตุโลหะอ่อน อาจปล่อยมาตรฐานหลวมหรือตัดใจยาก — ฝึกตัดสินใจสั้น ๆ ทีละเรื่อง",
    tip: "เติมโลหะด้วยการตั้งเกณฑ์ชัดก่อนรับงาน และปิดเรื่องที่ไม่จำเป็น",
  },
  {
    key: "water",
    label: "น้ำ",
    color: "#2F8FBC",
    high: "ธาตุน้ำลึก อ่านความรู้สึกและบรรยากาศได้ดี สัญชาตญาณคมเมื่อใจนิ่ง",
    mid: "ธาตุน้ำพอดี ช่วยปรับอารมณ์และเชื่อมคนโดยไม่จมไปกับความรู้สึก",
    low: "ธาตุน้ำเบา อาจรีบสรุปจากเหตุผลอย่างเดียว — เว้นจังหวะฟังใจก่อนตัดสินใจใหญ่",
    tip: "เติมน้ำด้วยเวลาเงียบสั้น ๆ และการสังเกตความรู้สึกก่อนตอบรับ",
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
          <stop offset="0%" stopColor="rgba(201,162,39,0.32)" />
          <stop offset="100%" stopColor="rgba(123,95,212,0.18)" />
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
                ? "rgba(160,126,26,0.45)"
                : "rgba(90,70,150,0.16)"
            }
            strokeWidth={i === selectedIndex ? 1.5 : 1}
          />
        );
      })}

      <polygon
        points={poly}
        fill={`url(#radar-fill-${gid})`}
        stroke="#C9A227"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {values.map((v, i) => {
        const p = point(i, (v.score / 100) * maxR);
        const tip = point(i, maxR + 22);
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
              r={22}
              fill="transparent"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={selected ? 5 : 3.5}
              fill="#C9A227"
              stroke={selected ? "#fff" : "none"}
              strokeWidth={selected ? 2 : 0}
            />
            <text
              x={tip.x}
              y={tip.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={selected ? "#241C4F" : "#3A3270"}
              fontSize={9}
              fontWeight={selected ? 700 : 600}
            >
              {v.label}
            </text>
            <text
              x={tip.x}
              y={tip.y + 12}
              textAnchor="middle"
              fill="#A07E1A"
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
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
          อ่านแกน · กดเรดาร์หรือปัด
        </p>
        <p className="text-[12px] font-semibold tabular-nums text-[#6B6490]">
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
                className="rounded-[14px] px-3.5 py-3"
                style={{
                  background: "rgba(255,255,255,0.42)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <p className="text-[14px] font-semibold text-[#241C4F]">
                  {a.label} · {a.score}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-[#A07E1A]">
                  {axisLevel(a.score)}
                </p>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#3A3270]">
                  {axisReading(a)}
                </p>
                <p className="mt-2 text-[12px] leading-snug text-[#5E5688]">
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
              "rounded-full px-2 py-1 text-[10px] font-semibold outline-none transition",
              i === index
                ? "bg-[#C9A227]/20 text-[#8F6F14] ring-1 ring-[#C9A227]/45"
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
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-[#241C4F]">
                {item.left} {item.leftPct}%
              </span>
              <span className="font-medium text-[#5E5688]">
                {item.right} {r}%
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-[#7B6BB0]/16">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${item.leftPct}%`,
                  background:
                    "linear-gradient(90deg, rgba(201,162,39,0.95), rgba(232,170,70,0.7))",
                }}
              />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#C9A227] ring-2 ring-white"
                style={{ left: `calc(${item.leftPct}% - 7px)` }}
              />
            </div>
          </button>
        );
      })}

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
            อ่านสเปกตรัม · กดหรือปัด
          </p>
          <p className="text-[12px] font-semibold tabular-nums text-[#6B6490]">
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
                    className="rounded-[14px] px-3.5 py-3"
                    style={{
                      background: "rgba(255,255,255,0.42)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <p className="text-[14px] font-semibold text-[#241C4F]">
                      {item.left} {item.leftPct}% · {item.right} {rp}%
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#A07E1A]">
                      เอียงไปทาง{leftSide ? item.left : item.right}
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#3A3270]">
                      {leftSide ? item.leftHigh : item.rightHigh}
                    </p>
                    <p className="mt-2 text-[12px] leading-snug text-[#5E5688]">
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
                  i === index ? "#C9A227" : "rgba(123,107,176,0.28)",
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
                className="w-10 shrink-0 text-[13px] font-semibold"
                style={{ color: el.color }}
              >
                {el.label}
              </span>
              <div className="relative h-2.5 min-w-0 flex-1 rounded-full bg-[#7B6BB0]/16">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width]"
                  style={{
                    width: `${Math.max(el.pct, 2)}%`,
                    background: el.color,
                    opacity: selected ? 1 : 0.85,
                    minWidth: el.pct > 0 ? 6 : 0,
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[12px] font-medium tabular-nums text-[#3A3270]">
                {el.pct}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
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
  className,
}: {
  seed: string;
  nickname: string;
  className?: string;
}) {
  const data = useMemo(() => {
    const axes: AxisRow[] = AXES.map((a) => ({
      ...a,
      score: scoreFrom(seed, a.key),
    }));
    const top = [...axes].sort((a, b) => b.score - a.score)[0]!;
    const topIdx = axes.findIndex((a) => a.key === top.key);

    const spectra: SpectrumRowData[] = [
      {
        ...SPECTRA[0]!,
        leftPct: scoreFrom(seed, "intro", 55, 88),
      },
      {
        ...SPECTRA[1]!,
        leftPct: scoreFrom(seed, "emotion", 25, 55),
      },
      {
        ...SPECTRA[2]!,
        leftPct: scoreFrom(seed, "compromise", 40, 75),
      },
      {
        ...SPECTRA[3]!,
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

    return {
      axes,
      top,
      topIdx: topIdx >= 0 ? topIdx : 0,
      spectra,
      elements,
      strongest,
    };
  }, [seed]);

  const [axisIndex, setAxisIndex] = useState(data.topIdx);
  const name = nickname.trim() || "คุณ";

  useEffect(() => {
    setAxisIndex(data.topIdx);
  }, [data.topIdx]);

  return (
    <div className={cn("space-y-3", className)}>
      <section className="fortune-glass rounded-[20px] px-4 py-4">
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#A07E1A]">
            PREMIUM · SELF MAP
          </p>
          <h2 className="font-sacred mt-1.5 text-[1.4rem] leading-snug text-[#241C4F]">
            คุณ{name}เป็นคนแบบไหนกันนะ
          </h2>
        </div>

        <div className="mt-4">
          <RadarChart
            values={data.axes}
            selectedIndex={axisIndex}
            onSelect={setAxisIndex}
          />
          <p className="mt-1 px-2 text-center text-[12px] leading-relaxed text-[#5E5688]">
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
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
          สเปกตรัมอุปนิสัย
        </p>
        <SpectrumSwipeReader items={data.spectra} />
      </section>

      <section className="fortune-glass rounded-[20px] px-4 py-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#A07E1A]">
          ห้าธาตุในตัวคุณ
        </p>
        <h3 className="mt-1 text-[15px] font-semibold text-[#241C4F]">
          การกระจายห้าธาตุ
        </h3>

        <ElementSwipeReader
          elements={data.elements}
          initialKey={data.strongest.key}
        />

        <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-[#7B6BB0]/14 pt-3 text-[11px] text-[#6B6490]">
          <Sparkles className="h-3 w-3 text-[#A07E1A]" strokeWidth={1.8} />
          ส่วนพรีเมียมท้ายรายงาน · วิเคราะห์เฉพาะคุณ
        </div>
      </section>
    </div>
  );
}
