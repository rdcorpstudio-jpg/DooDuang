"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { MONTH_LABELS_TH, MONTH_NAMES_TH } from "@/components/fortune/life-cycle-graph";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortuneUnlockBanner } from "@/components/fortune/fortune-unlock-banner";
import type { FortuneFocus } from "@/lib/fortune/analyze";
import { monthScoreForDate, yearScoreForCe } from "@/lib/fortune/build-daily-pack";
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
        href="/images/icons/lock-gold.png"
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

function scoreDotColor(score: number) {
  if (score >= 10) return "#e8d19a";
  if (score >= 8) return "#d5b16f";
  if (score >= 6) return "#c4a86a";
  if (score >= 4) return "#b8923f";
  return "#9a7a2e";
}

function scoreBadgeBg(score: number) {
  if (score >= 8) return "rgba(213, 177, 111, 0.18)";
  if (score >= 6) return "rgba(213, 177, 111, 0.12)";
  return "rgba(213, 177, 111, 0.08)";
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
  const H = 260;
  const padL = 34;
  const padR = 24;
  const padT = 34;
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

  return (
    <div className="relative">
      <p className="mb-2.5 px-0.5 text-[13px] leading-snug text-[#f7f4ec]/65">
        ปัดซ้าย–ขวาเพื่อเลื่อนดู · แตะจุดเพื่อเลือก
      </p>
      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block max-w-none"
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            <linearGradient id={`stk-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(213,177,111,0.22)" />
              <stop offset="100%" stopColor="rgba(213,177,111,0)" />
            </linearGradient>
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
                  stroke="rgba(213,177,111,0.14)"
                  strokeWidth={1}
                />
                <text x={10} y={y + 4} fill="rgba(247,244,236,0.45)" fontSize={11}>
                  {t}
                </text>
              </g>
            );
          })}

          {n > 1 ? (
            <g className="pointer-events-none">
              {areaD ? (
                <path d={areaD} fill={`url(#stk-fill-${gid})`} />
              ) : null}
              {clearLine ? (
                <path
                  d={clearLine}
                  fill="none"
                  stroke="#d5b16f"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ) : null}
              {blurLine ? (
                <path
                  d={blurLine}
                  fill="none"
                  stroke="rgba(213,177,111,0.35)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray="4 5"
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
                    stroke="rgba(213,177,111,0.35)"
                    strokeWidth={1}
                    strokeDasharray="3 4"
                    className="pointer-events-none"
                  />
                ) : null}
                {selected ? (
                  <text
                    x={x}
                    y={yy - 14}
                    textAnchor="middle"
                    fill="#d5b16f"
                    fontSize={15}
                    fontWeight={700}
                    className="pointer-events-none"
                  >
                    {p.score}
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
                    <circle
                      cx={x}
                      cy={yy}
                      r={selected ? 7 : 4.5}
                      fill={selected ? color : "#101827"}
                      stroke={selected ? "#f7f4ec" : "#d5b16f"}
                      strokeWidth={selected ? 2 : 1.5}
                      className="pointer-events-none"
                    />
                    <text
                      x={x}
                      y={H - 26}
                      textAnchor="middle"
                      fill={
                        selected || p.isNow
                          ? "rgba(247,244,236,0.95)"
                          : "rgba(247,244,236,0.72)"
                      }
                      fontSize={selected ? 14 : 13}
                      fontWeight={selected || p.isNow ? 700 : 600}
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
                            ? "#d5b16f"
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
                        fill="#d5b16f"
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
                      : `${p.label} คะแนน ${p.score}`
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
  focus,
  gender,
  className,
}: {
  seed: string;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
}) {
  const now = new Date();
  const nowCe = now.getFullYear();
  const nowMonth = now.getMonth();
  const [mode, setMode] = useState<"month" | "year">("month");

  const years = useMemo((): YearPoint[] => {
    const input = { birthDate, nickname, birthTime, focus, gender };
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
  }, [seed, nowCe, birthDate, nickname, birthTime, focus, gender]);

  const months = useMemo((): MonthPoint[] => {
    const input = { birthDate, nickname, birthTime, focus, gender };
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
  }, [birthDate, nickname, birthTime, focus, gender, nowCe, nowMonth]);

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

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FortuneIcon name="compass" size={22} className="shrink-0" />
            <h2 className="text-[19px] font-semibold tracking-wide text-[#d5b16f]">
              จังหวะชีวิต
            </h2>
          </div>
          <p className="mt-1.5 text-[14px] leading-snug text-[#f7f4ec]/65">
            เลื่อนดูเส้นเวลา · สลับรายเดือน / รายปี
          </p>
        </div>
        <div
          className="inline-flex shrink-0 rounded-full p-0.5"
          style={{
            background: "rgba(16,24,39,0.6)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
          }}
        >
          {(
            [
              { id: "month" as const, label: "รายเดือน" },
              { id: "year" as const, label: "รายปี" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[14px] font-semibold outline-none transition",
                mode === tab.id
                  ? "bg-[#d5b16f] text-[#101827]"
                  : "text-[#e8d19a]/75"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "month" ? (
        <>
          <div className="mae-aspect-card rounded-[18px] px-2.5 py-3">
            <StockStylePanChart
              points={monthChart}
              selectedIndex={monthIndexSel}
              onSelect={setMonthIndexSel}
              ariaLabel="กราฟจังหวะชีวิตรายเดือน ปัดเลื่อนดูได้"
            />
          </div>
          <div className="mae-aspect-card rounded-[18px] px-3.5 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-medium text-[#d5b16f]">
                  {activeMonth.isNow ? "เดือนนี้" : "เดือนที่เลือก"}
                </p>
                <p className="mt-0.5 text-[17px] font-semibold text-[#f7f4ec]">
                  {activeMonth.fullLabel}
                </p>
              </div>
              <span
                className="no-sky-lift rounded-full px-3 py-1.5 text-[13px] font-semibold tabular-nums text-[#e8d19a]"
                style={{
                  background: scoreBadgeBg(activeMonth.score),
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
                }}
              >
                {activeMonth.score}/12 · {monthBand.label}
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-[#f7f4ec]/80">
              {monthBand.meaning}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#f7f4ec]/70">
              {activeMonth.isNow
                ? "แตะจุดเดือนอื่นบนกราฟเพื่อเทียบจังหวะก่อน–หลัง"
                : `เทียบกับเดือนนี้ · คะแนน ${months[monthNowIdx >= 0 ? monthNowIdx : monthIndexSel]?.score ?? "—"}/12`}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="mae-aspect-card rounded-[18px] px-2.5 py-3">
            <StockStylePanChart
              points={yearChart}
              selectedIndex={yearIndex}
              onSelect={setYearIndex}
              ariaLabel="กราฟจังหวะชีวิตรายปี ปัดเลื่อนดูได้"
            />
          </div>
          <div className="mae-aspect-card relative space-y-2 rounded-[18px] px-3.5 py-3">
            <p className="absolute right-3.5 top-3 text-[13px] font-semibold tabular-nums text-[#d5b16f]">
              {yearIndex + 1}/{years.length}
            </p>
            <div className="pr-10">
              <p className="text-[13px] font-medium text-[#d5b16f]">
                {activeYear.ce === nowCe
                  ? "ปีนี้"
                  : activeYear.ce < nowCe
                    ? "ปีที่ผ่านมา"
                    : "ปีข้างหน้า"}
              </p>
              <p className="mt-1 text-[16px] font-semibold text-[#f7f4ec]">
                พ.ศ. {activeYear.be} · {yearBand.label}
              </p>
            </div>
            <p className="text-[14px] font-medium leading-snug text-[#f7f4ec]/80">
              {activeYear.overview}
            </p>
            <p className="line-clamp-2 text-[13px] leading-[1.65] text-[#f7f4ec]/65">
              {yearBand.meaning}
            </p>
            <Link
              href={`/premium/year?ce=${activeYear.ce}`}
              className="no-sky-lift mt-0.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-[#101827] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
              style={{
                background: "linear-gradient(90deg, #b8923f, #d5b16f, #e8d19a)",
              }}
            >
              อ่านเพิ่มเติม
              <FortuneIcon name="arrow-right" size={18} />
            </Link>
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
  focus,
  gender,
  className,
}: {
  points?: FreeMonthPoint[] | null;
  unlocked?: boolean;
  onUnlock?: () => void;
  seed?: string;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  className?: string;
}) {
  if (unlocked) {
    return (
      <UnlockedTwelveYearTrend
        seed={seed}
        birthDate={birthDate}
        nickname={nickname}
        birthTime={birthTime}
        focus={focus}
        gender={gender}
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
  focus,
  gender,
  onUnlock,
  className,
}: {
  points?: FreeMonthPoint[] | null;
  birthDate?: string;
  nickname?: string;
  birthTime?: string;
  focus?: FortuneFocus;
  gender?: string;
  onUnlock?: () => void;
  className?: string;
}) {
  const now = new Date();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  const months = useMemo((): MonthPoint[] => {
    const input = { birthDate, nickname, birthTime, focus, gender };
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

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FortuneIcon name="compass" size={22} className="shrink-0" />
            <h2 className="text-[19px] font-semibold tracking-wide text-[#d5b16f]">
              จังหวะชีวิตช่วงนี้
            </h2>
          </div>
          <p className="mt-1.5 text-[14px] leading-snug text-[#f7f4ec]/65">
            เริ่มจากเดือนนี้ · อนาคตล็อกไว้
          </p>
        </div>
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
          <p className="text-[14px] font-medium text-[#f7f4ec]/70">
            ยังไม่มีข้อมูลจังหวะรายเดือน
        </p>
      </div>
      )}

      {hasData ? (
        <div className="mae-aspect-card rounded-[18px] px-3.5 py-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[13px] font-medium text-[#d5b16f]">เดือนนี้</p>
              <p className="mt-0.5 text-[17px] font-semibold text-[#f7f4ec]">
                {active.fullLabel}
            </p>
          </div>
            <span
              className="no-sky-lift rounded-full px-3 py-1.5 text-[13px] font-semibold tabular-nums text-[#e8d19a]"
              style={{
                background: scoreBadgeBg(active.score),
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
              }}
            >
              {active.score}/12 · {band.label}
            </span>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-[#f7f4ec]/80">
            {band.meaning}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#f7f4ec]/55">
            <span className="font-semibold text-[#d5b16f]">ใช้ยังไง · </span>
            {band.use}
                  </p>
                </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-[#f7f4ec]/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d5b16f]" />
          เดือนปัจจุบัน · ดูได้ฟรี
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
