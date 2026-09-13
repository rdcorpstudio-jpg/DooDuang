"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MysticFrame } from "@/components/ui/mystic-frame";

function scoreColor(score: number) {
  if (score >= 10) return "#4ade80";
  if (score >= 8) return "#a3e635";
  if (score >= 6) return "#facc15";
  if (score >= 4) return "#fb923c";
  return "#f43f5e";
}

function scoreGlow(score: number) {
  if (score >= 10) return "rgba(74,222,128,0.55)";
  if (score >= 8) return "rgba(163,230,53,0.45)";
  if (score >= 6) return "rgba(250,204,21,0.4)";
  if (score >= 4) return "rgba(251,146,60,0.4)";
  return "rgba(244,63,94,0.4)";
}

function smoothLine(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export const MONTH_LABELS_TH = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

export const MONTH_NAMES_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

export function buildMonthWindow(options?: {
  end?: Date;
  pastMonths?: number;
  futureMonths?: number;
}) {
  const end = options?.end ?? new Date();
  const pastMonths = options?.pastMonths ?? 12;
  const futureMonths = options?.futureMonths ?? 6;
  const labels: string[] = [];
  const fullNames: string[] = [];

  for (let i = pastMonths - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const m = d.getMonth();
    labels.push(MONTH_LABELS_TH[m]);
    fullNames.push(MONTH_NAMES_TH[m]);
  }
  for (let i = 1; i <= futureMonths; i++) {
    const d = new Date(end.getFullYear(), end.getMonth() + i, 1);
    const m = d.getMonth();
    labels.push(MONTH_LABELS_TH[m]);
    fullNames.push(MONTH_NAMES_TH[m]);
  }

  return {
    labels,
    fullNames,
    pastMonths,
    futureMonths,
    highlightIndex: pastMonths - 1,
  };
}

function vibeFromScore(score: number) {
  if (score >= 10) return "พลังพุ่งสูง — เหมาะกับลงมือทำใหญ่";
  if (score >= 8) return "แนวโน้มดี — เดินหน้าได้มั่นใจ";
  if (score >= 6) return "สมดุลพอดี — ปรับจังหวะเล็กน้อย";
  if (score >= 4) return "ระวังภาระสะสม — อย่ารีบเกินไป";
  return "ช่วงถดถอย — พักฟื้นและจัดระเบียบ";
}

function detailFromScore(score: number) {
  if (score >= 10) {
    return {
      summary: "พลังพุ่งสูง",
      body: "จังหวะเปิดกว้างชัดเจน เหมาะกับการตัดสินใจใหญ่ เริ่มโปรเจกต์ หรือผลักดันเป้าหมายที่ค้างไว้ น่าใช้พลังนี้กับสิ่งที่สำคัญที่สุด ไม่กระจายหลายทางพร้อมกัน",
      tip: "เลือก 1 เรื่องหลักแล้วลงมือภายใน 7 วัน",
    };
  }
  if (score >= 8) {
    return {
      summary: "แนวโน้มดี",
      body: "ทิศทางหนุนให้เดินหน้าได้มั่นใจ โอกาสและการสนับสนุนมีโอกาสเข้ามาหากคุณสื่อสารชัดและรักษาจังหวะสม่ำเสมอ",
      tip: "รักษาวินัยเล็ก ๆ ทุกวัน จะเห็นผลสะสมเร็ว",
    };
  }
  if (score >= 6) {
    return {
      summary: "สมดุลพอดี",
      body: "พลังนิ่งอยู่ในระดับกลาง ไม่แรงพุ่งแต่ก็ไม่ทรุด เหมาะกับการปรับจังหวะ จัดลำดับงาน และเก็บแรงสำหรับช่วงที่ต้องการลงมือหนักขึ้น",
      tip: "ลดภาระรองลง 1–2 อย่าง แล้วโฟกัสงานหลัก",
    };
  }
  if (score >= 4) {
    return {
      summary: "ระวังภาระสะสม",
      body: "อาจรู้สึกหนักจากงานหรือความรับผิดชอบที่กองซ้อน หากเร่งเกินไปมีโอกาสพลาดจังหวะ ควรชะลอการตัดสินใจใหญ่และตรวจสุขภาพแรงกาย-แรงใจ",
      tip: "พักสั้น ๆ เป็นรอบ และอย่ารับงานใหม่ในช่วงนี้",
    };
  }
  return {
    summary: "ช่วงถดถอย",
    body: "พลังต่ำกว่าปกติ เป็นช่วงพักฟื้น จัดระเบียบ และเคลียร์ของเก่าให้จบก่อนเริ่มใหม่ การฝืนเร่งมักทำให้เหนื่อยโดยผลลัพธ์ไม่คุ้ม",
    tip: "โฟกัสการพักและปิดงานค้าง ไม่เปิดแนวรบใหม่",
  };
}

function GoldLockIcon({ className = "h-7 w-7" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const metalId = `gl-metal-${uid}`;
  const shineId = `gl-shine-${uid}`;
  const shackleId = `gl-shackle-${uid}`;

  return (
    <svg viewBox="0 0 28 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={shackleId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="45%" stopColor="#efc454" />
          <stop offset="100%" stopColor="#b87a18" />
        </linearGradient>
        <linearGradient id={metalId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="50%" stopColor="#e4b12e" />
          <stop offset="100%" stopColor="#9a5f12" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* shackle — no outer circle */}
      <path
        d="M8.2 14.2V10.4c0-3.1 2.45-5.6 5.8-5.6s5.8 2.5 5.8 5.6v3.8"
        fill="none"
        stroke={`url(#${shackleId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* lock body */}
      <rect
        x="5.5"
        y="13.6"
        width="17"
        height="13.2"
        rx="3.2"
        fill={`url(#${metalId})`}
        stroke="#7a4a0e"
        strokeWidth="0.4"
      />
      <rect
        x="6.2"
        y="14.2"
        width="15.6"
        height="4.2"
        rx="2"
        fill={`url(#${shineId})`}
        opacity="0.4"
      />

      {/* keyhole */}
      <circle cx="14" cy="19.2" r="1.35" fill="#4a2a0a" />
      <rect x="13.35" y="19.6" width="1.3" height="3.1" rx="0.55" fill="#4a2a0a" />
    </svg>
  );
}

function GoldLockButton({
  onUnlock,
  label,
  hint = "ปลดล็อกภายหลัง",
}: {
  onUnlock?: () => void;
  label?: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      aria-label={`${label ?? "ปลดล็อก"} ${hint}`}
      className="group relative inline-flex flex-col items-center gap-1"
    >
      <span
        className="pointer-events-none absolute -inset-3 opacity-60 blur-[9px] transition-opacity group-hover:opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(252,211,77,0.4) 0%, rgba(245,158,11,0.1) 45%, transparent 75%)",
        }}
        aria-hidden
      />
      <GoldLockIcon className="relative h-7 w-7 transition-transform duration-200 group-hover:scale-105 group-active:scale-95" />
      {label ? (
        <span className="text-center text-[10px] font-semibold leading-tight text-amber-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
          {label}
        </span>
      ) : null}
      {label ? (
        <span className="text-center text-[8.5px] leading-tight text-amber-100/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
          ({hint})
        </span>
      ) : null}
    </button>
  );
}

type MonthNote = {
  index: number;
  label: string;
  full: string;
  score: number;
  text: string;
  isPresent: boolean;
};

/** Original full colorful graph + optional left/right blur fade with gold locks */
export function LifeCycleGraph({
  title = "กราฟวัฏจักรชีวิต",
  subtitle = "ช่วงปัจจุบัน: สร้างฐานและปรับเส้นทาง",
  scores,
  labels,
  fullLabels,
  descriptions,
  highlightIndex,
  highlightLabel,
  className,
  dimmed,
  uid = "lc",
  blurFuture = false,
  rangeNote = "ดูย้อนหลัง 3 เดือน",
  onUnlock,
}: {
  title?: string;
  subtitle?: string;
  scores: number[];
  labels?: string[];
  fullLabels?: string[];
  descriptions?: string[];
  highlightIndex: number;
  highlightLabel?: string;
  className?: string;
  dimmed?: boolean;
  uid?: string;
  blurFuture?: boolean;
  rangeNote?: string | null;
  onUnlock?: () => void;
}) {
  const axisLabels = labels?.length ? labels : [...MONTH_LABELS_TH].slice(0, scores.length);
  const safeHi = Math.max(0, Math.min(highlightIndex, scores.length - 1));

  // Keep full graph curve; blurFuture only adds side overlays (do not reshape chart)
  const viewScores = scores;
  const viewLabels = axisLabels;
  const presentIndex = safeHi;

  const [selectedIndex, setSelectedIndex] = useState(presentIndex);
  const [viewportW, setViewportW] = useState(0);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const didInitScroll = useRef(false);

  const MONTH_GAP = viewScores.length >= 10 ? 64 : viewScores.length <= 7 ? 62 : 52;
  const H = 210;
  const basePadL = 28;
  const basePadR = blurFuture ? 22 : 40;
  const padT = 28;
  const padB = 30;
  const plotH = H - padT - padB;
  const n = Math.max(1, viewScores.length);
  const span = Math.max(1, n - 1);
  const plotW = span * MONTH_GAP;

  // Stretch vertical range to data so the curve fills the frame (not tiny mid-band on 0–12)
  const dataMin = Math.min(...viewScores.map((s) => Math.max(0, Math.min(12, s))));
  const dataMax = Math.max(...viewScores.map((s) => Math.max(0, Math.min(12, s))));
  const niceRange = Math.max(5, Math.ceil(dataMax) - Math.floor(dataMin) + 2);
  let yLo = Math.max(0, Math.floor(dataMin) - 1);
  const yHi = Math.min(12, yLo + niceRange);
  if (yHi - yLo < niceRange) yLo = Math.max(0, yHi - niceRange);
  const ySpan = Math.max(1, yHi - yLo);
  const yOf = (score: number) => padT + plotH * (1 - (score - yLo) / ySpan);
  const yTicks = Array.from({ length: yHi - yLo + 1 }, (_, i) => yLo + i).filter(
    (v) => v === yLo || v === yHi || v % Math.max(1, Math.round(ySpan / 4)) === 0
  );

  // When locked, pad sides so present lands at true visual center
  const presentXInPlot = (plotW * presentIndex) / span;
  const centerPad =
    blurFuture && viewportW > 0
      ? Math.max(0, viewportW / 2 - presentXInPlot)
      : 0;
  const padL = Math.max(basePadL, centerPad);
  const padR = Math.max(
    basePadR,
    blurFuture && viewportW > 0
      ? Math.max(0, viewportW / 2 - (plotW - presentXInPlot))
      : basePadR
  );
  const chartW = padL + plotW + padR;

  const pts = viewScores.map((score, i) => {
    const s = Math.max(0, Math.min(12, score));
    return {
      index: i,
      x: padL + (plotW * i) / span,
      y: yOf(s),
      score: s,
      label: viewLabels[i] ?? String(i + 1),
      color: scoreColor(s),
      glow: scoreGlow(s),
      isPresent: i === presentIndex,
      selected: i === selectedIndex,
    };
  });

  const line = smoothLine(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const area =
    pts.length > 1 && first && last
      ? `${line} L ${last.x} ${padT + plotH} L ${first.x} ${padT + plotH} Z`
      : "";
  const presentPt = pts[presentIndex];
  const selectedPt = pts[selectedIndex] ?? presentPt;
  const focusLabel =
    selectedPt == null
      ? highlightLabel
      : viewScores.length >= 10
        ? `อายุ ${selectedPt.label} ปี`
        : (fullLabels?.[selectedPt.index] ?? selectedPt.label);

  const strokeId = `${uid}-stroke`;
  const fillId = `${uid}-fill`;

  const monthNotes: MonthNote[] = pts.map((p) => ({
    index: p.index,
    label: p.label,
    full: fullLabels?.[p.index] ?? MONTH_NAMES_TH[p.index % 12] ?? p.label,
    score: p.score,
    text: descriptions?.[p.index] ?? vibeFromScore(p.score),
    isPresent: p.isPresent,
  }));

  function scrollChartToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const el = chartScrollRef.current;
    const pt = pts[index];
    if (!el || !pt) return;
    const target = pt.x - el.clientWidth / 2;
    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTo({ left: Math.min(maxLeft, Math.max(0, target)), behavior });
  }

  function scrollListToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    listScrollRef.current
      ?.querySelector<HTMLElement>(`[data-month-index="${index}"]`)
      ?.scrollIntoView({
        block: blurFuture && index === presentIndex ? "start" : "nearest",
        behavior,
      });
  }

  function selectMonth(index: number) {
    if (index < 0 || index >= pts.length) return;
    const freeMin = Math.max(0, presentIndex - 1);
    if (blurFuture && (index < freeMin || index > presentIndex)) {
      onUnlock?.();
      return;
    }
    setSelectedIndex(index);
    scrollChartToIndex(index);
    scrollListToIndex(index);
  }

  useEffect(() => {
    setSelectedIndex(presentIndex);
  }, [presentIndex]);

  useEffect(() => {
    const el = chartScrollRef.current;
    if (!el) return;
    const measure = () => setViewportW(el.clientWidth);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  useEffect(() => {
    if (didInitScroll.current) return;
    if (blurFuture && viewportW <= 0) return;
    didInitScroll.current = true;
    requestAnimationFrame(() => {
      scrollChartToIndex(presentIndex, "auto");
      scrollListToIndex(presentIndex, "auto");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportW]);

  // Keep present centered when locked / on resize
  useEffect(() => {
    const el = chartScrollRef.current;
    if (!el || viewportW <= 0) return;
    const center = () => scrollChartToIndex(presentIndex, "auto");
    center();
    if (!blurFuture) return;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(center) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurFuture, presentIndex, chartW, viewportW]);

  const detailNote =
    detailIndex == null ? null : monthNotes.find((n) => n.index === detailIndex) ?? null;
  const detail = detailNote ? detailFromScore(detailNote.score) : null;

  return (
    <MysticFrame
      radius={24}
      dimmed={dimmed}
      className={className}
      contentClassName="relative"
    >
      <div className="relative z-[1] px-4 pb-1 pt-3">
        <p className="text-[13px] font-semibold leading-snug tracking-wide text-[#67e8f9]">
          {subtitle}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-white/42">
          {rangeNote ? <span>{rangeNote}</span> : null}
          {rangeNote ? <span className="text-white/18">·</span> : null}
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7CFF6B]" />
            สูง
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#FFE14A]" />
            กลาง
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#FF4D7A]" />
            ต่ำ
          </span>
          <span className="text-white/18">·</span>
          <span>0–12 = พลัง</span>
        </div>
        <h3 className="sr-only">{title}</h3>
      </div>

      <div className="relative z-[1] pb-1">
        {/* sticky Y labels — soft fade only, never solid cover over the rim */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-[2] w-9"
          aria-hidden
        >
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#120c28]/80 via-[#120c28]/25 to-transparent" />
          <svg viewBox={`0 0 36 ${H}`} className="relative h-full w-full" preserveAspectRatio="none">
            <text
              x={28}
              y={padT - 10}
              textAnchor="end"
              fill="rgba(255,255,255,0.28)"
              fontSize="7.5"
            >
              พลัง
            </text>
            {[...new Set(yTicks)].map((v) => {
              const y = yOf(v);
              return (
                <text
                  key={v}
                  x={28}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="9.5"
                >
                  {v}
                </text>
              );
            })}
          </svg>
        </div>

        <div
          ref={chartScrollRef}
          className={cn(
            "pb-1",
            blurFuture
              ? "overflow-x-hidden"
              : "overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <div className="relative" style={{ width: chartW }}>
            <svg
              width={chartW}
              height={H}
              viewBox={`0 0 ${chartW} ${H}`}
              className="block"
              role="img"
              aria-label={title}
              style={{
                letterSpacing: "normal",
                fontFamily:
                  "var(--font-sarabun), Sarabun, ui-sans-serif, system-ui, sans-serif",
              }}
            >
              <defs>
                <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="0%">
                  {pts.map((p, i) => (
                    <stop
                      key={i}
                      offset={`${n === 1 ? 0 : (i / (n - 1)) * 100}%`}
                      stopColor={p.color}
                    />
                  ))}
                </linearGradient>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(103,232,249,0.28)" />
                  <stop offset="35%" stopColor="rgba(74,222,128,0.16)" />
                  <stop offset="70%" stopColor="rgba(250,204,21,0.06)" />
                  <stop offset="100%" stopColor="rgba(12,10,30,0)" />
                </linearGradient>
              </defs>

              {[...new Set(yTicks)].map((v) => {
                const y = yOf(v);
                return (
                  <line
                    key={`h-${v}`}
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                );
              })}

              <line
                x1={padL}
                y1={padT + plotH}
                x2={chartW - padR}
                y2={padT + plotH}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.25"
              />

              {area ? <path d={area} fill={`url(#${fillId})`} /> : null}

              {pts.length > 1 ? (
                <>
                  <path
                    d={line}
                    fill="none"
                    stroke={`url(#${strokeId})`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.24"
                  />
                  <path
                    d={line}
                    fill="none"
                    stroke={`url(#${strokeId})`}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : null}

              {selectedPt ? (
                <>
                  <line
                    x1={selectedPt.x}
                    y1={padT - 4}
                    x2={selectedPt.x}
                    y2={padT + plotH + 4}
                    stroke="rgba(125,211,252,0.55)"
                    strokeWidth="1.4"
                    strokeDasharray="3.5 4.5"
                  />
                  {focusLabel ? (
                    <g>
                      <rect
                        x={selectedPt.x - 30}
                        y={6}
                        width={60}
                        height={16}
                        rx={8}
                        fill="rgba(14,116,144,0.45)"
                        stroke="rgba(103,232,249,0.55)"
                        strokeWidth="0.8"
                      />
                      <text
                        x={selectedPt.x}
                        y={17}
                        textAnchor="middle"
                        fill="#ecfeff"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {focusLabel}
                      </text>
                    </g>
                  ) : null}
                </>
              ) : null}

              {pts.map((p) => {
                // Always label scores + axis for ≤14 points so the chart is readable
                const dense = pts.length > 14;
                const showValue = !dense || p.isPresent || p.selected || p.index % 2 === 0;
                const showLabel = true;
                const axisLabel =
                  viewScores.length >= 10 ? `${p.label}` : p.label;
                const isFocus = p.selected;
                return (
                  <g
                    key={p.index}
                    className="cursor-pointer"
                    style={{ outline: "none" }}
                    onClick={() => selectMonth(p.index)}
                  >
                    <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                    {showValue ? (
                      <>
                        <rect
                          x={p.x - 10}
                          y={p.y - 22}
                          width={20}
                          height={12}
                          rx={4}
                          fill={
                            isFocus || p.isPresent
                              ? "rgba(14,116,144,0.6)"
                              : "rgba(8,6,24,0.72)"
                          }
                          stroke={
                            isFocus || p.isPresent
                              ? "rgba(125,211,252,0.45)"
                              : "rgba(255,255,255,0.08)"
                          }
                          strokeWidth="0.75"
                        />
                        <text
                          x={p.x}
                          y={p.y - 13}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize="9.5"
                          fontWeight="700"
                        >
                          {p.score}
                        </text>
                      </>
                    ) : null}

                    {isFocus ? (
                      <>
                        <circle cx={p.x} cy={p.y} r="14" fill="rgba(56,189,248,0.18)" />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="10"
                          fill="none"
                          stroke="rgba(125,211,252,0.7)"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="12.5"
                          fill="none"
                          stroke="rgba(103,232,249,0.28)"
                          strokeWidth="1"
                        />
                      </>
                    ) : p.isPresent ? (
                      <>
                        <circle cx={p.x} cy={p.y} r="11" fill="rgba(56,189,248,0.12)" />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="8"
                          fill="none"
                          stroke="rgba(125,211,252,0.55)"
                          strokeWidth="1.3"
                        />
                      </>
                    ) : (
                      <circle cx={p.x} cy={p.y} r="6.5" fill={p.glow} opacity="0.35" />
                    )}

                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isFocus || p.isPresent ? 5.5 : dense ? 3.6 : 4.4}
                      fill={isFocus || p.isPresent ? "#38bdf8" : p.color}
                      stroke="rgba(255,255,255,0.95)"
                      strokeWidth="1.2"
                    />

                    {showLabel ? (
                      <text
                        x={p.x}
                        y={H - 16}
                        textAnchor="middle"
                        fill={
                          isFocus || p.isPresent
                            ? "#e0f2fe"
                            : "rgba(255,255,255,0.62)"
                        }
                        fontSize={viewScores.length >= 10 ? "8" : "8.5"}
                        fontWeight={isFocus || p.isPresent ? 700 : 500}
                      >
                        {axisLabel}
                      </text>
                    ) : null}
                    {p.isPresent ? (
                      <text
                        x={p.x}
                        y={H - 6}
                        textAnchor="middle"
                        fill="#67e8f9"
                        fontSize="7.5"
                        fontWeight="700"
                      >
                        ปัจจุบัน
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Soft fog blur L/R + gold locks — matches ref mock */}
        {blurFuture ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] flex w-[38%] items-center justify-center">
              <div
                className="absolute inset-0 backdrop-blur-[3px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 8%, black 55%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 8%, black 55%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 backdrop-blur-[10px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, black 42%, transparent 85%)",
                  maskImage:
                    "linear-gradient(to right, black 0%, black 42%, transparent 85%)",
                }}
              />
              <div
                className="absolute inset-0 backdrop-blur-[18px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, rgba(0,0,0,0.95) 32%, transparent 68%)",
                  maskImage:
                    "linear-gradient(to right, black 0%, rgba(0,0,0,0.95) 32%, transparent 68%)",
                }}
              />
              <div className="pointer-events-auto relative z-[1] pl-1">
                <GoldLockButton onUnlock={onUnlock} label="อดีต" />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] flex w-[38%] items-center justify-center">
              <div
                className="absolute inset-0 backdrop-blur-[3px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to left, transparent 8%, black 55%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to left, transparent 8%, black 55%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 backdrop-blur-[10px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to left, black 0%, black 42%, transparent 85%)",
                  maskImage:
                    "linear-gradient(to left, black 0%, black 42%, transparent 85%)",
                }}
              />
              <div
                className="absolute inset-0 backdrop-blur-[18px]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to left, black 0%, rgba(0,0,0,0.95) 32%, transparent 68%)",
                  maskImage:
                    "linear-gradient(to left, black 0%, rgba(0,0,0,0.95) 32%, transparent 68%)",
                }}
              />
              <div className="pointer-events-auto relative z-[1] pr-1">
                <GoldLockButton onUnlock={onUnlock} label="อนาคต" />
              </div>
            </div>
          </>
        ) : null}
      </div>

      {monthNotes.length > 0 ? (
        <MonthNotesPanel
          notes={monthNotes}
          selectedIndex={selectedIndex}
          presentIndex={presentIndex}
          onSelect={selectMonth}
          listRef={listScrollRef}
          locked={blurFuture}
          onUnlock={onUnlock}
          onReadMore={setDetailIndex}
        />
      ) : null}

      {detailNote && detail ? (
          <div
            className="absolute inset-0 z-30 flex items-end justify-center bg-[#060212]/70 p-3 backdrop-blur-[3px] sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label={`รายละเอียด ${detailNote.full}`}
            onClick={() => setDetailIndex(null)}
          >
            <div
              className="w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(165deg,#1a1438_0%,#100c24_100%)] p-4 shadow-[0_0_28px_rgba(103,232,249,0.12),0_16px_40px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-white/40">
                    {detailNote.label} · {detailNote.score}/12
                    {detailNote.isPresent ? (
                      <span className="ml-1.5 text-[#22d3ee]">ปัจจุบัน</span>
                    ) : null}
                  </p>
                  <h4 className="mt-1 text-[16px] font-semibold text-white">
                    {detailNote.full}
                  </h4>
                  <p className="mt-0.5 text-[13px] font-medium text-[#67e8f9]">
                    {detail.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailIndex(null)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 hover:text-white"
                  aria-label="ปิด"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>

              <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">{detail.body}</p>
              <p className="mt-3 rounded-xl bg-cyan-400/10 px-3 py-2 text-[12.5px] leading-snug text-cyan-100/90 ring-1 ring-cyan-300/20">
                แนะนำ: {detail.tip}
              </p>

              <button
                type="button"
                onClick={() => setDetailIndex(null)}
                className="mt-4 w-full rounded-xl bg-white/[0.06] py-2.5 text-[13px] font-medium text-white/80 ring-1 ring-white/12 hover:bg-white/[0.09]"
              >
                ปิด
              </button>
            </div>
          </div>
      ) : null}
    </MysticFrame>
  );
}

function MonthNotesPanel({
  notes,
  selectedIndex,
  presentIndex,
  onSelect,
  listRef,
  locked = false,
  onUnlock,
  onReadMore,
}: {
  notes: MonthNote[];
  selectedIndex: number;
  presentIndex: number;
  onSelect: (index: number) => void;
  listRef: RefObject<HTMLDivElement | null>;
  locked?: boolean;
  onUnlock?: () => void;
  onReadMore?: (index: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const present = notes.find((n) => n.isPresent);
  const freeMin = Math.max(0, presentIndex - 1);
  const selected =
    notes.find((n) => n.index === selectedIndex) ?? present;

  const visibleNotes = locked
    ? [
        ...notes.filter((n) => n.index >= freeMin && n.index <= presentIndex),
        ...notes.filter((n) => n.index < freeMin || n.index > presentIndex),
      ]
    : notes;

  return (
    <div className="relative z-[1]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 border-t border-white/[0.08] px-4 py-2 text-left"
        aria-expanded={open}
      >
        <p className="text-[11px] tracking-wide text-white/42">
          {locked
            ? "รายการ · ฟรีดูย้อนหลัง 1 เดือน · นอกนั้นล็อก"
            : notes.length >= 10
              ? "รายปี · กดแถวเพื่อโฟกัสบนกราฟ"
              : "รายเดือน · กดแถวเพื่อโฟกัสบนกราฟ"}
        </p>
        <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-white/40">
          {open ? "หุบ" : "ขยาย"}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            strokeWidth={1.8}
          />
        </span>
      </button>

      {open ? (
        <div
          ref={listRef}
          className="max-h-[9.75rem] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleNotes.map((m) => {
            const isCurrent = m.isPresent;
            const active = m.index === selectedIndex;
            const rowLocked =
              locked && (m.index < freeMin || m.index > presentIndex);

            return (
              <div
                key={m.index}
                data-month-index={m.index}
                className={cn(
                  "relative flex items-center gap-2 border-t border-white/[0.06] px-4 py-2 transition-colors",
                  active && !rowLocked && "bg-cyan-400/[0.1]",
                  isCurrent && !rowLocked && "bg-cyan-400/[0.06]"
                )}
              >
                <button
                  type="button"
                  onClick={() => (rowLocked ? onUnlock?.() : onSelect(m.index))}
                  aria-label={rowLocked ? `ปลดล็อก ${m.full}` : `เลือก ${m.full}`}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 text-left",
                    rowLocked && "select-none blur-[5px] opacity-30"
                  )}
                >
                  <div className="w-9 shrink-0">
                    <p
                      className={cn(
                        "text-[13px] font-semibold leading-none",
                        active || isCurrent ? "text-cyan-100" : "text-white"
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-none text-white/30">
                      {m.score}/12
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-none text-white/45">
                      {m.full}
                      {isCurrent ? (
                        <span className="ml-1.5 font-semibold text-[#22d3ee]">
                          ปัจจุบัน
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 truncate text-[12.5px] leading-snug text-white/75">
                      {m.text}
                    </p>
                  </div>
                </button>

                {!rowLocked ? (
                  <button
                    type="button"
                    onClick={() => onReadMore?.(m.index)}
                    className="shrink-0 rounded-full px-1.5 py-1 text-[11px] font-medium leading-none text-[#67e8f9] underline-offset-2 hover:underline"
                  >
                    อ่านเพิ่ม
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUnlock?.()}
                    className="absolute inset-0 z-[1] flex items-center justify-center bg-[#08061a]/25"
                    aria-label={`ปลดล็อก ${m.full}`}
                  >
                    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-amber-200/20 bg-amber-500/10 px-2.5 py-1">
                      <GoldLockIcon className="relative h-[18px] w-[18px]" />
                      <span className="text-[11px] font-medium text-amber-100/90">
                        ปลดล็อก
                      </span>
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {!open && selected ? (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <p className="text-[12px] text-white/50">
            {selected.label} · {selected.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export const REFERENCE_YEAR_SCORES = [11, 2, 5, 8, 11, 7, 10, 11, 12, 2, 4, 6] as const;
