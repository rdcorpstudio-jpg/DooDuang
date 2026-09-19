"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MONTH_LABELS_TH, MONTH_NAMES_TH } from "@/components/fortune/life-cycle-graph";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortuneUnlockBanner } from "@/components/fortune/fortune-unlock-banner";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { analyzeFortune } from "@/lib/fortune/analyze";
import { monthScoreForDate, yearScoreForCe } from "@/lib/fortune/build-daily-pack";
import {
  dayMonthBridgeCopy,
  dayToneLabelTh,
} from "@/lib/fortune/day-month-bridge";
import { YEAR_DETAILS, scoreBand } from "@/lib/fortune/year-rhythm";
import { cn } from "@/lib/utils";

export type FreeMonthPoint = {
  /** 0–11 */
  monthIndex: number;
  yearCe: number;
  score: number;
};

function LockMark({ x, y }: { x: number; y: number }) {
  const size = 30;
  return (
    <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
      <image
        href="/images/icons/lock-gold.webp"
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

/** 3 bands — โทนแม่ (เขียวอ่อน · ทอง · แดงอุ่น) ไม่ใช่นีออน */
function scoreDotColor(score: number) {
  if (score >= 8) return "#7dcea0";
  if (score >= 6) return "#d5b16f";
  return "#e87878";
}

function scoreGlow(score: number) {
  if (score >= 8) return "rgba(125,206,160,0.4)";
  if (score >= 6) return "rgba(213,177,111,0.4)";
  return "rgba(232,120,120,0.4)";
}

function scoreBadgeBg(score: number) {
  if (score >= 8) return "rgba(125, 206, 160, 0.14)";
  if (score >= 6) return "rgba(213, 177, 111, 0.14)";
  return "rgba(232, 120, 120, 0.14)";
}

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

type ChartDatum = {
  key: string;
  score: number;
  label: string;
  subLabel?: string;
  isNow?: boolean;
};

type MonthPoint = {
  key: string;
  monthIndex: number;
  yearCe: number;
  score: number;
  label: string;
  fullLabel: string;
  isNow: boolean;
};

/** Horizontally pannable chart — swipe like a stock timeline */
function StockStylePanChart({
  points,
  selectedIndex,
  onSelect,
  ariaLabel,
  isLocked,
  alignStart = false,
}: {
  points: ChartDatum[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  isLocked?: (index: number) => boolean;
  /** Keep the first/selected point near the left edge */
  alignStart?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<{
    pointerId: number;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const H = 272;
  const padL = 34;
  const padR = 24;
  const padT = 42;
  const padB = 64;
  const step = 72;
  const n = points.length;
  const W = padL + Math.max(0, n - 1) * step + padR;
  const plotH = H - padT - padB;
  const scores = points.map((p) => p.score);
  const { yMin, yMax } = yDomain(scores.length ? scores : [6]);
  const ticks = tickValues(yMin, yMax);
  const xAt = (i: number) => padL + i * step;
  const yAt = (score: number) =>
    padT + ((yMax - score) / (yMax - yMin || 1)) * plotH;

  const firstLocked = (() => {
    if (!isLocked) return -1;
    for (let i = 0; i < n; i++) if (isLocked(i)) return i;
    return -1;
  })();
  const lastClear = firstLocked < 0 ? n - 1 : firstLocked - 1;

  const pathThrough = (from: number, to: number) => {
    if (to < from || n === 0) return "";
    const slice = points.slice(from, to + 1);
    return slice
      .map(
        (p, j) =>
          `${j === 0 ? "M" : "L"} ${xAt(from + j).toFixed(1)} ${yAt(p.score).toFixed(1)}`
      )
      .join(" ");
  };

  const clearLine = lastClear >= 0 ? pathThrough(0, lastClear) : "";
  const blurFrom = firstLocked >= 0 ? Math.max(0, firstLocked - 1) : -1;
  const blurLine =
    blurFrom >= 0 ? pathThrough(blurFrom, n - 1) : "";
  const fullLine = pathThrough(0, n - 1);
  const closeArea = (line: string, fromIdx: number, toIdx: number) =>
    line
      ? `${line} L ${xAt(toIdx).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xAt(fromIdx).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : "";
  const clearAreaD =
    lastClear >= 0 ? closeArea(pathThrough(0, lastClear), 0, lastClear) : "";
  const areaD =
    firstLocked >= 0
      ? clearAreaD
      : `${fullLine} L ${xAt(Math.max(0, n - 1)).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || n === 0) return;
    const target = alignStart
      ? Math.max(0, xAt(selectedIndex) - padL)
      : xAt(selectedIndex) - el.clientWidth / 2;
    el.scrollTo({
      left: Math.max(0, target),
      behavior: alignStart ? "auto" : "smooth",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, n, W, alignStart]);

  function beginTap(
    e: ReactPointerEvent<SVGCircleElement>,
    index: number
  ) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    tapRef.current = {
      pointerId: e.pointerId,
      index,
      x: e.clientX,
      y: e.clientY,
    };
  }

  function finishTap(e: ReactPointerEvent<SVGCircleElement>) {
    const tap = tapRef.current;
    tapRef.current = null;
    if (!tap || tap.pointerId !== e.pointerId) return;
    const dx = Math.abs(e.clientX - tap.x);
    const dy = Math.abs(e.clientY - tap.y);
    // Ignore if this was a pan gesture on the timeline
    if (dx > 10 || dy > 10) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(tap.index);
  }

  const strokeStops =
    n <= 1
      ? [{ offset: 0, color: scoreDotColor(points[0]?.score ?? 6) }]
      : points.map((p, i) => ({
          offset: (i / (n - 1)) * 100,
          color: scoreDotColor(p.score),
        }));

  return (
    <div className="relative">
      <div className="mb-2.5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 px-0.5 text-[15.5px] font-medium text-[#f7f4ec]/70">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e87878]" />
          ควรระวัง
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d5b16f]" />
          ปานกลาง
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7dcea0]" />
          จังหวะดี
        </span>
      </div>
      <p className="mb-2 px-0.5 text-center text-[15.5px] font-medium leading-snug text-[#f7f4ec]/55">
        ปัดซ้าย–ขวาเพื่อเลื่อนดู · แตะจุดเพื่อเลือก
      </p>
      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block max-w-none"
          role="img"
          aria-label={ariaLabel}
          style={{
            letterSpacing: "normal",
            fontFamily:
              "var(--font-app), \"IBM Plex Sans Thai\", ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <defs>
            <linearGradient
              id={`stk-stroke-${gid}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {strokeStops.map((s, i) => (
                <stop
                  key={i}
                  offset={`${s.offset}%`}
                  stopColor={s.color}
                />
              ))}
            </linearGradient>
            <linearGradient
              id={`stk-area-h-${gid}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              {strokeStops.map((s, i) => (
                <stop
                  key={i}
                  offset={`${s.offset}%`}
                  stopColor={s.color}
                  stopOpacity={0.28}
                />
              ))}
            </linearGradient>
            <linearGradient id={`stk-fade-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity={1} />
              <stop offset="55%" stopColor="#fff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <mask id={`stk-area-mask-${gid}`}>
              <rect
                x={0}
                y={0}
                width={W}
                height={H}
                fill={`url(#stk-fade-${gid})`}
              />
            </mask>
          </defs>

          {ticks.map((t) => {
            const y = yAt(t);
            return (
              <g key={t} className="pointer-events-none">
                <line
                  x1={0}
                  y1={y}
                  x2={W}
                  y2={y}
                  stroke="rgba(247,244,236,0.08)"
                  strokeWidth={1}
                  strokeDasharray="4 5"
                />
                <text x={10} y={y + 4} fill="rgba(247,244,236,0.55)" fontSize={13}>
                  {t}
                </text>
              </g>
            );
          })}

          {n > 1 ? (
            <g className="pointer-events-none">
              {areaD ? (
                <path
                  d={areaD}
                  fill={`url(#stk-area-h-${gid})`}
                  mask={`url(#stk-area-mask-${gid})`}
                />
              ) : null}
              {clearLine ? (
                <>
                  <path
                    d={clearLine}
                    fill="none"
                    stroke={`url(#stk-stroke-${gid})`}
                    strokeWidth={7}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.22}
                  />
                  <path
                    d={clearLine}
                    fill="none"
                    stroke={`url(#stk-stroke-${gid})`}
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </>
              ) : null}
              {blurLine ? (
                <path
                  d={blurLine}
                  fill="none"
                  stroke={`url(#stk-stroke-${gid})`}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray="4 5"
                  opacity={0.4}
                />
              ) : null}
            </g>
          ) : null}

          {points.map((p, i) => {
            const x = xAt(i);
            const yy = yAt(p.score);
            const locked = isLocked?.(i) ?? false;
            const selected = i === selectedIndex && !locked;
            const color = scoreDotColor(p.score);
            return (
              <g key={p.key}>
                {selected ? (
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke={color}
                    strokeWidth={1.25}
                    strokeDasharray="3.5 4.5"
                    opacity={0.55}
                    className="pointer-events-none"
                  />
                ) : null}
                {!locked ? (
                  <text
                    x={x}
                    y={yy - (selected ? 18 : 14)}
                    textAnchor="middle"
                    fill={color}
                    fontSize={selected ? 16 : 14}
                    fontWeight={selected ? 700 : 600}
                    opacity={selected ? 1 : 0.88}
                    className="pointer-events-none"
                  >
                    {selected ? `พลัง ${p.score}` : p.score}
                  </text>
                ) : null}
                {locked ? (
                  <>
                    <g className="pointer-events-none" opacity={0.45}>
                      <circle
                        cx={x}
                        cy={yy}
                        r={5}
                        fill="rgba(213,177,111,0.25)"
                      />
                      <text
                        x={x}
                        y={H - 26}
                        textAnchor="middle"
                        fill="rgba(247,244,236,0.4)"
                        fontSize={13}
                        fontWeight={600}
                      >
                        {p.label}
                      </text>
                      {p.subLabel ? (
                        <text
                          x={x}
                          y={H - 8}
                          textAnchor="middle"
                          fill="rgba(247,244,236,0.35)"
                          fontSize={12}
                          fontWeight={500}
                        >
                          {p.subLabel}
                        </text>
                      ) : null}
                    </g>
                    <LockMark x={x} y={yy} />
                  </>
                ) : (
                  <>
                    {selected ? (
                      <circle
                        cx={x}
                        cy={yy}
                        r={12}
                        fill={scoreGlow(p.score)}
                        className="pointer-events-none"
                      />
                    ) : null}
                    <circle
                      cx={x}
                      cy={yy}
                      r={selected ? 7 : 5.5}
                      fill="#101827"
                      stroke={color}
                      strokeWidth={selected ? 2.4 : 2}
                      className="pointer-events-none"
                    />
                    <text
                      x={x}
                      y={H - 26}
                      textAnchor="middle"
                      fill={color}
                      fontSize={selected ? 14 : 13}
                      fontWeight={selected || p.isNow ? 700 : 600}
                      opacity={selected || p.isNow ? 1 : 0.82}
                      className="pointer-events-none"
                    >
                      {p.label}
                    </text>
                    {p.subLabel || p.isNow ? (
                      <text
                        x={x}
                        y={H - 8}
                        textAnchor="middle"
                        fill={
                          p.isNow
                            ? color
                            : "rgba(247,244,236,0.45)"
                        }
                        fontSize={12}
                        fontWeight={p.isNow ? 700 : 500}
                        className="pointer-events-none"
                      >
                        {p.isNow ? "ตอนนี้" : p.subLabel}
                      </text>
                    ) : null}
                    {p.isNow && !selected ? (
                      <rect
                        x={x - 14}
                        y={H - 4}
                        width={28}
                        height={2}
                        rx={1}
                        fill={color}
                        className="pointer-events-none"
                      />
                    ) : null}
                  </>
                )}
                {/* Hit target — no-tap avoids phone-frame :active scale breaking SVG hits */}
                <circle
                  cx={x}
                  cy={yy}
                  r={22}
                  fill="transparent"
                  className="no-tap cursor-pointer"
                  style={{ touchAction: "manipulation" }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    locked
                      ? `ปลดล็อก${p.label}`
                      : `${p.label} พลัง ${p.score}`
                  }
                  aria-pressed={selected}
                  onPointerDown={(e) => beginTap(e, i)}
                  onPointerUp={finishTap}
                  onPointerCancel={() => {
                    tapRef.current = null;
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
      </div>
    </div>
  );
}

function UnlockedTwelveYearTrend({
  seed,
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  birthPlace,
  focus,
  gender,
  initialMode = "month",
  className,
}: {
  seed: string;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: FortuneFocus;
  gender?: string;
  initialMode?: "month" | "year";
  className?: string;
}) {
  const now = new Date();
  const nowCe = now.getFullYear();
  const nowMonth = now.getMonth();
  const [mode, setMode] = useState<"month" | "year">(initialMode);

  const years = useMemo((): YearPoint[] => {
    const input = { birthDate, nickname, birthTime, birthPlace, focus, gender };
    return Array.from({ length: 12 }, (_, i) => {
      const ce = nowCe - 2 + i;
      const detail = YEAR_DETAILS[i]!;
      const score = yearScoreForCe(input, ce);
    return {
        i,
        ce,
        be: ce + 543,
        score,
        ...detail,
      };
    });
  }, [seed, nowCe, birthDate, nickname, birthTime, birthPlace, focus, gender]);

  const months = useMemo((): MonthPoint[] => {
    const input = { birthDate, nickname, birthTime, birthPlace, focus, gender };
    return Array.from({ length: 36 }, (_, i) => {
      const offset = i - 18;
      const d = new Date(nowCe, nowMonth + offset, 1);
      const yearCe = d.getFullYear();
      const monthIndex = d.getMonth();
      const isNow = yearCe === nowCe && monthIndex === nowMonth;
  return {
        key: `${yearCe}-${monthIndex}`,
        monthIndex,
        yearCe,
        score: monthScoreForDate(input, yearCe, monthIndex),
        label: MONTH_LABELS_TH[monthIndex]!,
        fullLabel: `${MONTH_NAMES_TH[monthIndex]} ${yearCe + 543}`,
        isNow,
      };
    });
  }, [birthDate, nickname, birthTime, birthPlace, focus, gender, nowCe, nowMonth]);

  const yearNowIdx = years.findIndex((y) => y.ce === nowCe);
  const monthNowIdx = months.findIndex((m) => m.isNow);
  const [yearIndex, setYearIndex] = useState(yearNowIdx >= 0 ? yearNowIdx : 2);
  const [monthIndexSel, setMonthIndexSel] = useState(
    monthNowIdx >= 0 ? monthNowIdx : 18
  );

  const yearChart = useMemo(
    (): ChartDatum[] =>
      years.map((y) => ({
        key: String(y.ce),
        score: y.score,
        label: String(y.be).slice(-2),
        isNow: y.ce === nowCe,
      })),
    [years, nowCe]
  );

  const monthChart = useMemo(
    (): ChartDatum[] =>
      months.map((m) => ({
        key: m.key,
        score: m.score,
        label: m.label,
        subLabel: String(m.yearCe + 543).slice(-2),
        isNow: m.isNow,
      })),
    [months]
  );

  const activeYear = years[yearIndex] ?? years[0]!;
  const activeMonth = months[monthIndexSel] ?? months[0]!;
  const monthBand = scoreBand(activeMonth.score);
  const yearBand = scoreBand(activeYear.score);

  const todayTone = useMemo(() => {
    return analyzeFortune({
      birthDate,
      nickname,
      birthTime,
      birthPlace,
      focus,
      gender,
    }).dayTone;
  }, [birthDate, nickname, birthTime, birthPlace, focus, gender]);

  const monthBridge =
    activeMonth.isNow
      ? dayMonthBridgeCopy(todayTone, activeMonth.score)
      : null;

  return (
    <section className={cn("space-y-3.5", className)}>
      <div
        className="flex rounded-full p-1"
        style={{
          background: "rgba(8,14,28,0.55)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
        }}
        role="tablist"
        aria-label="สลับรายเดือนหรือรายปี"
      >
        {(
          [
            { id: "month" as const, label: "รายเดือน" },
            { id: "year" as const, label: "รายปี" },
          ] as const
        ).map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(tab.id)}
              className={cn(
                "flex-1 rounded-full py-2.5 text-[14.5px] font-bold outline-none transition active:scale-[0.99]",
                active ? "text-[#1a1408]" : "text-[rgba(232,209,154,0.75)]",
              )}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(155deg, #fff8e4 0%, #e8d19a 40%, #d5b16f 100%)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                    }
                  : undefined
              }
            >
              <span className="dd-btn-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {mode === "month" ? (
        <>
          <div
            className="overflow-hidden rounded-[22px] px-2.5 pb-3 pt-3.5"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,28,52,0.72) 0%, rgba(6,14,30,0.78) 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 32px rgba(0,0,0,0.22)",
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 px-1.5">
              <FortuneIcon name="compass" size={16} plain className="shrink-0" />
              <p className="text-[13.5px] font-semibold tracking-wide text-[#e8d19a]">
                จังหวะรายเดือน
              </p>
            </div>
            <StockStylePanChart
              points={monthChart}
              selectedIndex={monthIndexSel}
              onSelect={setMonthIndexSel}
              ariaLabel="กราฟจังหวะชีวิตรายเดือน ปัดเลื่อนดูได้"
            />
          </div>

          <div
            className="rounded-[22px] px-4 py-4"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,28,52,0.72) 0%, rgba(6,14,30,0.78) 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 32px rgba(0,0,0,0.22)",
            }}
          >
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold tracking-[0.12em] text-[#e8d19a]">
                  {activeMonth.isNow ? "เดือนนี้" : "เดือนที่เลือก"}
                </p>
                <p className="mt-1 text-[1.35rem] font-bold leading-tight text-white">
                  {activeMonth.fullLabel}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-[2rem] font-bold tabular-nums leading-none"
                  style={{ color: scoreDotColor(activeMonth.score) }}
                >
                  {activeMonth.score}
                </p>
                <p
                  className="mt-1 text-[12px] font-semibold"
                  style={{ color: scoreDotColor(activeMonth.score) }}
                >
                  {monthBand.label}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[14.5px] font-medium leading-[1.55] text-white/90">
              {monthBand.meaning}
            </p>

            {monthBridge ? (
              <p
                className="mt-3 rounded-[14px] px-3 py-2.5 text-[13.5px] font-medium leading-[1.5]"
                style={{
                  color: "rgba(232,209,154,0.92)",
                  background: "rgba(213,177,111,0.1)",
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                }}
              >
                วันนี้ ({dayToneLabelTh(todayTone)}) · {monthBridge}
              </p>
            ) : null}

            <p className="mt-3 text-[12.5px] font-medium leading-snug text-[rgba(186,204,230,0.65)]">
              {activeMonth.isNow
                ? "แตะจุดเดือนอื่นบนกราฟเพื่อเทียบจังหวะก่อน–หลัง"
                : `เทียบกับเดือนนี้ · พลัง ${months[monthNowIdx >= 0 ? monthNowIdx : monthIndexSel]?.score ?? "—"}`}
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            className="overflow-hidden rounded-[22px] px-2.5 pb-3 pt-3.5"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,28,52,0.72) 0%, rgba(6,14,30,0.78) 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 32px rgba(0,0,0,0.22)",
            }}
          >
            <div className="mb-2 flex items-center gap-1.5 px-1.5">
              <FortuneIcon name="compass" size={16} plain className="shrink-0" />
              <p className="text-[13.5px] font-semibold tracking-wide text-[#e8d19a]">
                จังหวะรายปี
              </p>
            </div>
            <StockStylePanChart
              points={yearChart}
              selectedIndex={yearIndex}
              onSelect={setYearIndex}
              ariaLabel="กราฟจังหวะชีวิตรายปี ปัดเลื่อนดูได้"
            />
          </div>

          <div
            className="rounded-[22px] px-4 py-4"
            style={{
              background:
                "linear-gradient(160deg, rgba(12,28,52,0.72) 0%, rgba(6,14,30,0.78) 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 32px rgba(0,0,0,0.22)",
            }}
          >
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold tracking-[0.12em] text-[#e8d19a]">
                  {activeYear.ce === nowCe
                    ? "ปีนี้"
                    : activeYear.ce < nowCe
                      ? "ปีที่ผ่านมา"
                      : "ปีข้างหน้า"}
                </p>
                <p className="mt-1 text-[1.35rem] font-bold leading-tight text-white">
                  พ.ศ. {activeYear.be}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-[2rem] font-bold tabular-nums leading-none"
                  style={{ color: scoreDotColor(activeYear.score) }}
                >
                  {activeYear.score}
                </p>
                <p
                  className="mt-1 text-[12px] font-semibold"
                  style={{ color: scoreDotColor(activeYear.score) }}
                >
                  {yearBand.label}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[14.5px] font-medium leading-[1.55] text-white/90">
              {activeYear.overview}
            </p>
            <p className="mt-2 text-[13.5px] font-medium leading-[1.5] text-[rgba(186,204,230,0.85)]">
              {yearBand.meaning}
            </p>

            <div className="mt-4 space-y-2">
              {(
                [
                  { label: "จุดเปลี่ยน", body: activeYear.turning },
                  { label: "ทำไมถึงเป็นแบบนี้", body: activeYear.reason },
                  { label: "แนวทาง", body: activeYear.guidance },
                  {
                    label: "จุดเด่น · ใช้ยังไง",
                    body: `${yearBand.strength} — ${yearBand.use}`,
                  },
                ] as const
              ).map((block) => (
                <div
                  key={block.label}
                  className="rounded-[14px] px-3 py-2.5 text-left"
                  style={{
                    background: "rgba(8,14,28,0.4)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-[11.5px] font-semibold tracking-[0.12em] text-[#e8d19a]">
                    {block.label}
                  </p>
                  <p className="mt-1 text-[13.5px] font-medium leading-[1.5] text-white/88">
                    {block.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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


/** Free: month teaser. Unlocked: full 12-year analysis per year */
export function FortuneFreeMonthTrend({
  points,
  unlocked = false,
  onUnlock,
  seed = "dooduang",
  birthDate,
  nickname,
  birthTime,
  birthPlace,
  focus,
  gender,
  initialMode = "month",
  className,
}: {
  points?: FreeMonthPoint[] | null;
  unlocked?: boolean;
  onUnlock?: () => void;
  seed?: string;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: FortuneFocus;
  gender?: string;
  initialMode?: "month" | "year";
  className?: string;
}) {
  if (unlocked) {
    return (
      <UnlockedTwelveYearTrend
        seed={seed}
        birthDate={birthDate}
        nickname={nickname}
        birthTime={birthTime}
        birthPlace={birthPlace}
        focus={focus}
        gender={gender}
        initialMode={initialMode}
        className={className}
      />
    );
  }

  return (
    <FreeMonthTrendTeaser
      points={points}
      birthDate={birthDate}
      nickname={nickname}
      birthTime={birthTime}
      birthPlace={birthPlace}
      focus={focus}
      gender={gender}
      onUnlock={onUnlock}
      className={className}
    />
  );
}

function FreeMonthTrendTeaser({
  points,
  birthDate = "2000-01-01",
  nickname = "",
  birthTime,
  birthPlace,
  focus,
  gender,
  onUnlock,
  className,
}: {
  points?: FreeMonthPoint[] | null;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  birthPlace?: string;
  focus?: FortuneFocus;
  gender?: string;
  onUnlock?: () => void;
  className?: string;
}) {
  const now = new Date();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const months = useMemo((): MonthPoint[] => {
    const input = { birthDate, nickname, birthTime, birthPlace, focus, gender };
    const scoreMap = new Map<string, number>();
    if (Array.isArray(points)) {
      for (const p of points) {
        if (
          typeof p.score === "number" &&
          Number.isFinite(p.score) &&
          p.score >= 1 &&
          p.score <= 12
        ) {
          scoreMap.set(`${p.yearCe}-${p.monthIndex}`, p.score);
        }
      }
    }

    // Free teaser: current month first, then upcoming months only
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(nowYear, nowMonth + i, 1);
      const yearCe = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${yearCe}-${monthIndex}`;
      const isNow = i === 0;
      return {
        key,
        monthIndex,
        yearCe,
        score:
          scoreMap.get(key) ?? monthScoreForDate(input, yearCe, monthIndex),
        label: MONTH_LABELS_TH[monthIndex]!,
        fullLabel: `${MONTH_NAMES_TH[monthIndex]} ${yearCe + 543}`,
        isNow,
      };
    });
  }, [
    points,
    birthDate,
    nickname,
    birthTime,
    birthPlace,
    focus,
    gender,
    nowMonth,
    nowYear,
  ]);

  const currentIndex = 0;

  const chartPoints = useMemo(
    (): ChartDatum[] =>
      months.map((m) => ({
        key: m.key,
        score: m.score,
        label: m.label,
        subLabel: String(m.yearCe + 543).slice(-2),
        isNow: m.isNow,
      })),
    [months]
  );

  function pointLocked(index: number) {
    return index > currentIndex;
  }

  function selectPoint(index: number) {
    if (pointLocked(index)) {
      onUnlock?.();
    }
  }

  const active = months[currentIndex]!;
  const band = scoreBand(active.score);
  const hasData = months.length > 0;

  const todayTone = useMemo(() => {
    return analyzeFortune({
      birthDate,
      nickname,
      birthTime,
      birthPlace,
      focus,
      gender,
    }).dayTone;
  }, [birthDate, nickname, birthTime, birthPlace, focus, gender]);

  const monthBridge = dayMonthBridgeCopy(todayTone, active.score);

  return (
    <section className={cn("space-y-3", className)}>
      <div className="px-0.5">
        <div className="flex items-center gap-1.5">
          <FortuneIcon name="compass" size={18} plain className="shrink-0" />
          <h2 className="text-[15.5px] font-bold tracking-wide text-[#e8d19a]">
            จังหวะชีวิตช่วงนี้
          </h2>
        </div>
        <p className="mt-1 text-[15.5px] font-medium leading-snug text-[#bacce6]/80">
          เริ่มจากเดือนนี้ · อนาคตล็อกไว้
        </p>
      </div>

      {hasData ? (
        <div className="mae-aspect-card rounded-[18px] px-2.5 py-3">
          <StockStylePanChart
            points={chartPoints}
            selectedIndex={currentIndex}
            onSelect={selectPoint}
            isLocked={pointLocked}
            alignStart
            ariaLabel="กราฟจังหวะชีวิตรายเดือน ปัดเลื่อนดูได้"
          />
        </div>
      ) : (
        <div className="mae-aspect-card rounded-[18px] border border-dashed border-[rgba(213,177,111,0.35)] px-3 py-5 text-center">
          <p className="text-[15.5px] font-medium text-[#bacce6]/80">
            ยังไม่มีข้อมูลจังหวะรายเดือน
          </p>
        </div>
      )}

      {hasData ? (
        <div className="mae-aspect-card rounded-[18px] px-3.5 py-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15.5px] font-semibold text-[#e8d19a]">เดือนนี้</p>
              <p className="mt-0.5 text-[1.25rem] font-bold text-[#f7f4ec]">
                {active.fullLabel}
              </p>
            </div>
            <span
              className="no-sky-lift shrink-0 rounded-full px-3 py-1.5 text-[15.5px] font-bold tabular-nums"
              style={{
                color: scoreDotColor(active.score),
                background: scoreBadgeBg(active.score),
                boxShadow: `inset 0 0 0 1px ${scoreDotColor(active.score)}66`,
              }}
            >
              พลัง {active.score} · {band.label}
            </span>
          </div>
          <p className="mt-2 text-[15.5px] leading-relaxed text-[#f7f4ec]/88">
            {band.meaning}
          </p>
          {monthBridge ? (
            <p
              className="mt-2 rounded-[12px] px-2.5 py-2 text-[15.5px] leading-relaxed text-[#e8d19a]/90"
              style={{
                background: "rgba(213,177,111,0.08)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
              }}
            >
              วันนี้ ({dayToneLabelTh(todayTone)}) · {monthBridge}
            </p>
          ) : (
            <p className="mt-2 text-[15.5px] leading-relaxed text-[#bacce6]/80">
              วันนี้ ({dayToneLabelTh(todayTone)}) สอดคล้องกับจังหวะเดือนนี้
            </p>
          )}
          <p className="mt-2 text-[15.5px] leading-relaxed text-[#bacce6]/80">
            <span className="font-semibold text-[#e8d19a]">ใช้ยังไง · </span>
            {band.use}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[15.5px] font-medium text-[#bacce6]/75">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e87878]" />
          ควรระวัง
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d5b16f]" />
          ปานกลาง
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7dcea0]" />
          จังหวะดี
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FortuneIcon name="lock-gold" size={22} plain />
          อนาคต · ล็อกไว้
        </span>
      </div>

      <FortuneUnlockBanner onUnlock={onUnlock} />
    </section>
  );
}
