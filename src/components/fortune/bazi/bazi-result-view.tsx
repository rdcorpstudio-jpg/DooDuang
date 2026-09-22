"use client";

import {
  Children,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import Link from "next/link";
import type { BaziChart, BaziElement } from "@/lib/fortune/bazi";
import { elementColor } from "@/lib/fortune/bazi";
import { BaziCycleCard } from "@/components/fortune/bazi/bazi-cycle-card";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const ELEMENT_ICON: Record<BaziElement, string> = {
  wood: "/images/elements/wood.webp",
  fire: "/images/elements/fire.webp",
  earth: "/images/elements/earth.webp",
  metal: "/images/elements/metal.webp",
  water: "/images/elements/water.webp",
};

const GOD_TONE_COLOR: Record<string, string> = {
  peer: "#e8d19a",
  output: "#6dbf7a",
  wealth: "#d5b16f",
  officer: "#6a9fd8",
  resource: "#c9b8e8",
};

const RELATION_TONE_BG: Record<string, string> = {
  harmony: "rgba(109,191,122,0.22)",
  tension: "rgba(232,122,106,0.22)",
};

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const TEXT = "#f5f7ff";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

const GLASS = MAE_GLASS;

const CELL = {
  idle: {
    background: "rgba(8, 28, 52, 0.45)",
    boxShadow: "inset 0 0 0 1px rgba(130, 205, 255, 0.22)",
  },
  active: {
    background: "rgba(201, 163, 90, 0.12)",
    boxShadow: "inset 0 0 0 1.5px rgba(232, 209, 154, 0.7)",
  },
} as const;

function godColor(tone: string) {
  return GOD_TONE_COLOR[tone] ?? GOLD;
}

function formatLuckAge(age: number) {
  const n = Math.round(age);
  return Number.isFinite(n) ? String(n) : "—";
}

function glassStyle(soft = false): CSSProperties {
  return {
    background: soft ? GLASS.bgSoft : GLASS.bg,
    border: GLASS.border,
    /* เงาเบา — ไม่ให้กรอบดูพอง */
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px) saturate(1.1)",
    WebkitBackdropFilter: "blur(14px) saturate(1.1)",
  };
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-[14px] px-3 py-2.5", className)}
      style={glassStyle()}
    >
      <h2 className="mae-gold-text mae-thai-safe text-center text-[16px] font-bold tracking-wide">
        {title}
      </h2>
      {subtitle ? (
        <p
          className="mae-thai-safe mx-auto mt-0.5 max-w-[22rem] text-center text-[13.5px] font-medium"
          style={{ color: TEXT_MUTED }}
        >
          {subtitle}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** ปัดแบบคำทำนายวันนี้ — ลากกลางชัด ข้างเบลอ · วนลูป */
function FocusLoopCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const items = useMemo(
    () => Children.toArray(children).filter(Boolean),
    [children]
  );
  const n = items.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [anim, setAnim] = useState(false);
  const [metrics, setMetrics] = useState({ vw: 360, cardW: 320, step: 268 });
  const [slideH, setSlideH] = useState(320);
  const phaseRef = useRef<"idle" | "drag" | "snap">("idle");
  const startX = useRef(0);
  const lastX = useRef(0);
  const snapTimer = useRef(0);
  const pendingPos = useRef(1);
  const settling = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;
  const slideEls = useRef<(HTMLDivElement | null)[]>([]);

  const slides = useMemo(() => {
    if (n === 0) return [] as ReactNode[];
    if (n === 1) return [items[0]!];
    return [items[n - 1]!, ...items, items[0]!];
  }, [items, n]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth || 360;
      /* เต็มความกว้างคอลัมน์ — ไม่เว้นข้างแบบ coverflow */
      const cardW = Math.round(vw);
      const step = cardW;
      setMetrics({ vw, cardW, step });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(snapTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    let max = 0;
    for (const el of slideEls.current) {
      if (el) max = Math.max(max, el.offsetHeight);
    }
    if (max > 0) setSlideH(max);
  }, [metrics.cardW, slides.length, n]);

  if (n === 0) return null;

  const { cardW, step } = metrics;
  const pad = (metrics.vw - cardW) / 2;
  const translateX = pad - pos * step + dragX;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current === "snap") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    settling.current = false;
    phaseRef.current = "drag";
    setAnim(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== "drag") return;
    lastX.current = e.clientX;
    const dx = e.clientX - startX.current;
    const max = step * 1.2;
    setDragX(Math.max(-max, Math.min(max, dx)));
  }

  function settle(at: number) {
    if (settling.current) return;
    if (phaseRef.current !== "snap") return;
    settling.current = true;
    window.clearTimeout(snapTimer.current);
    setAnim(false);
    setDragX(0);
    if (at <= 0) setPos(n);
    else if (at >= n + 1) setPos(1);
    else setPos(at);
    phaseRef.current = "idle";
    window.setTimeout(() => {
      settling.current = false;
    }, 40);
  }

  function goTo(next: number) {
    const cur = posRef.current;
    phaseRef.current = "snap";
    pendingPos.current = next;
    setAnim(true);
    setDragX(-(next - cur) * step);
    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => settle(next), 450);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== "drag") return;
    const dx = lastX.current - startX.current;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
    const threshold = Math.min(48, step * 0.16);
    const cur = posRef.current;
    if (dx <= -threshold) goTo(cur + 1);
    else if (dx >= threshold) goTo(cur - 1);
    else goTo(cur);
  }

  function onTrackTransitionEnd(e: ReactTransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    settle(pendingPos.current);
  }

  if (n === 1) {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="w-full">{items[0]}</div>
      </div>
    );
  }

  const realIdx = ((pos - 1) % n + n) % n;

  return (
    <div className={cn("relative w-full overflow-x-hidden", className)}>
      <div
        ref={viewportRef}
        className="relative w-full cursor-grab select-none overflow-hidden active:cursor-grabbing"
        style={{ height: slideH + 4, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="absolute top-0 left-0"
          onTransitionEnd={onTrackTransitionEnd}
          style={{
            width: slides.length * step,
            height: slideH,
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: anim
              ? "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)"
              : "none",
          }}
        >
          {slides.map((child, i) => {
            const dist = Math.abs(i * step - pos * step + dragX);
            const progress = Math.min(1, dist / Math.max(1, step));
            const opacity = Math.max(0.55, 1 - progress * 0.4);
            const active = progress < 0.4;
            return (
              <div
                key={i}
                ref={(el) => {
                  slideEls.current[i] = el;
                }}
                className="absolute top-0 box-border"
                style={{
                  left: i * step,
                  width: cardW,
                  opacity,
                  zIndex: active ? 5 : 1,
                  pointerEvents: active ? "auto" : "none",
                }}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-1.5 px-4">
        {Array.from({ length: n }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`ไปสไลด์ ${i + 1}`}
            aria-current={i === realIdx}
            onClick={() => goTo(i + 1)}
            className="h-1.5 rounded-full outline-none transition-all"
            style={{
              width: i === realIdx ? 18 : 6,
              background:
                i === realIdx ? GOLD : "rgba(186, 204, 230, 0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** ดาวพิเศษ — ทีละดวง ปัดขึ้น–ลง นุ่ม ไม่ซ้อนกรอบ/เงา */
function StarsPager({
  stars,
}: {
  stars: { name: string; meaning: string }[];
}) {
  const n = stars.length;
  const [idx, setIdx] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [anim, setAnim] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const lastY = useRef(0);
  const dragging = useRef(false);
  const wheelLock = useRef(0);
  const STEP = 104;

  useEffect(() => {
    setIdx(0);
    setDragY(0);
  }, [n]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || n <= 1) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - wheelLock.current < 300) return;
      if (e.deltaY > 10) {
        wheelLock.current = now;
        setAnim(true);
        setIdx((i) => Math.min(n - 1, i + 1));
      } else if (e.deltaY < -10) {
        wheelLock.current = now;
        setAnim(true);
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [n]);

  if (n === 0) return null;

  const safeIdx = Math.min(idx, n - 1);
  const translateY = n <= 1 ? 0 : -safeIdx * STEP + dragY;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (n <= 1) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragging.current = true;
    setAnim(false);
    startY.current = e.clientY;
    lastY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    lastY.current = e.clientY;
    const dy = e.clientY - startY.current;
    setDragY(Math.max(-STEP * 0.85, Math.min(STEP * 0.85, dy)));
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const dy = lastY.current - startY.current;
    setAnim(true);
    setDragY(0);
    if (dy < -32) setIdx((i) => Math.min(n - 1, i + 1));
    else if (dy > 32) setIdx((i) => Math.max(0, i - 1));
  }

  return (
    <section
      ref={rootRef}
      className="overflow-hidden rounded-[14px]"
      style={glassStyle()}
    >
      <div className="px-3 pb-0.5 pt-2.5 text-center">
        <h2 className="mae-gold-text mae-thai-safe text-[16px] font-bold tracking-wide">
          ดาวพิเศษ (神煞)
        </h2>
      </div>

      {/* ไม่ซ้อนกรอบใน — สไลด์ข้อความอย่างเดียว */}
      <div
        className={cn(
          "relative overflow-hidden px-3",
          n > 1 && "cursor-grab active:cursor-grabbing",
        )}
        style={{
          height: n > 1 ? STEP + 20 : undefined,
          touchAction: n > 1 ? "none" : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            transition: anim
              ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
            willChange: n > 1 ? "transform" : undefined,
          }}
        >
          {stars.map((s, i) => {
            const dist = Math.abs(i - safeIdx - dragY / STEP);
            const opacity = n <= 1 ? 1 : Math.max(0.2, 1 - dist * 0.65);
            return (
              <div
                key={s.name}
                className="flex flex-col items-center justify-center px-0.5 py-1 text-center"
                style={{
                  height: STEP,
                  opacity,
                  transition: anim
                    ? "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
              >
                <p
                  className="mae-thai-safe text-[15px] font-semibold"
                  style={{ color: GOLD }}
                >
                  {s.name}
                </p>
                <p
                  className="mae-thai-safe mt-1 max-w-[20rem] text-[13px] font-medium"
                  style={{ color: TEXT_MUTED }}
                >
                  {s.meaning}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {n > 1 ? (
        <div className="flex flex-col items-center gap-1 px-3 pb-2 pt-0.5">
          <div className="flex items-center justify-center gap-1.5">
            {stars.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-label={`ดาวที่ ${i + 1}`}
                aria-current={i === safeIdx}
                onClick={() => {
                  setAnim(true);
                  setIdx(i);
                }}
                className="h-1.5 rounded-full outline-none transition-all duration-300"
                style={{
                  width: i === safeIdx ? 14 : 5,
                  background:
                    i === safeIdx ? GOLD : "rgba(186, 204, 230, 0.35)",
                }}
              />
            ))}
          </div>
          <p
            className="mae-thai-safe text-[12px] font-medium tabular-nums"
            style={{ color: "rgba(186,204,230,0.55)" }}
          >
            {safeIdx + 1}/{n} · ปัดขึ้น–ลง
          </p>
        </div>
      ) : (
        <div className="h-3" />
      )}
    </section>
  );
}

function HScrollRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-h-scrollbar overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <div className="flex w-max min-w-full gap-1.5 px-0.5 pr-3">
        {children}
        <span className="w-1 shrink-0" aria-hidden />
      </div>
    </div>
  );
}

export function BaziResultView({
  chart,
  onBack,
  className,
  nickname,
}: {
  chart: BaziChart;
  onBack: () => void;
  className?: string;
  nickname?: string;
}) {
  const [yearIdx, setYearIdx] = useState(0);
  const [deepOpen, setDeepOpen] = useState(false);
  const selectedYear = chart.annual[yearIdx] ?? chart.annual[0];
  const maxEl = Math.max(...chart.elements.map((e) => e.count), 1);

  return (
    <div
      className={cn(
        "relative h-full overflow-x-hidden overflow-y-auto overscroll-contain text-white",
        className
      )}
    >
      <MaePageBackground />

      <div className="relative z-[1] mx-auto flex min-h-full w-full max-w-[480px] flex-col gap-3 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5">
        <header className="flex items-center justify-between gap-3">
          <MaeBrandLink />
        </header>

        <div className="text-center">
          <p className="mae-gold-text text-[12px] font-semibold tracking-[0.18em]">
            ปาจื้อ
          </p>
          <h1 className="mae-gold-text mt-1 text-[1.45rem] font-bold tracking-tight">
            {nickname ? `ดวงของคุณ${nickname}` : "โหราศาสตร์จีน"}
          </h1>
        </div>

        <SectionCard
          title="สี่เสา (Four Pillars)"
          subtitle="แต่ละเสา = ก้านฟ้า(บน) + กิ่งดิน(ล่าง) · เสาวันคือเจ้าชะตา"
        >
          <div className="grid grid-cols-4 gap-2">
            {chart.pillars.map((p) => (
              <div
                key={p.key}
                className="flex flex-col items-center rounded-[12px] px-1 py-2 text-center"
                style={p.isDayMaster ? CELL.active : CELL.idle}
              >
                <p
                  className="text-[15.5px] font-semibold"
                  style={{ color: TEXT }}
                >
                  {p.label}
                </p>
                <p
                  className="mt-1.5 text-[1.55rem] font-bold leading-none"
                  style={{ color: elementColor(p.stem.element) }}
                >
                  {p.stem.char}
                </p>
                <p
                  className="mt-1 text-[15.5px] font-medium leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {p.stem.pinyin}
                  <br />
                  {p.stem.th}
                </p>
                <div
                  className="my-2 h-px w-8"
                  style={{ background: "rgba(232,209,154,0.28)" }}
                />
                <p
                  className="text-[1.45rem] font-bold leading-none"
                  style={{ color: elementColor(p.branch.element) }}
                >
                  {p.branch.char}
                </p>
                <p
                  className="mt-1 text-[15.5px] font-medium leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {p.branch.animal}
                  <br />
                  {p.branch.stage}
                </p>
                <div className="mt-2 flex min-h-[2.75rem] flex-col justify-start gap-0.5">
                  {p.gods.map((g) => (
                    <span
                      key={g.label}
                      className="text-[15.5px] font-semibold leading-tight"
                      style={{ color: godColor(g.tone) }}
                    >
                      {g.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <FocusLoopCarousel>
          {[
            <SectionCard
              key="day"
              title="เจ้าชะตา & นักษัตร"
              subtitle="ธาตุประจำตัวและปีนักษัตรของคุณ"
              className="h-full"
            >
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2.5">
                  <span
                    className="text-[1.5rem] font-bold leading-none"
                    style={{ color: elementColor(chart.dayMaster.element) }}
                  >
                    {chart.dayMaster.char}
                  </span>
                  <div className="text-left">
                    <p className="text-[14px]" style={{ color: TEXT_MUTED }}>
                      เจ้าชะตา
                    </p>
                    <p
                      className="text-[15.5px] font-semibold"
                      style={{ color: TEXT }}
                    >
                      {chart.dayMaster.pinyin} — {chart.dayMaster.th}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <span
                    className="text-[1.5rem] font-bold leading-none"
                    style={{ color: elementColor(chart.zodiac.element) }}
                  >
                    {chart.zodiac.char}
                  </span>
                  <div className="text-left">
                    <p className="text-[14px]" style={{ color: TEXT_MUTED }}>
                      นักษัตร
                    </p>
                    <p
                      className="text-[15.5px] font-semibold"
                      style={{ color: TEXT }}
                    >
                      {chart.zodiac.animal}
                    </p>
                  </div>
                </div>
                <p
                  className="text-[14px] font-medium"
                  style={{ color: GOLD_SOFT }}
                >
                  จันทรคติจีน · {chart.lunarDate}
                </p>
              </div>
            </SectionCard>,
            <SectionCard
              key="elements"
              title="สมดุลธาตุห้า (Five Elements)"
              subtitle="สัดส่วนธาตุจากตัวอักษร 8 ตัวในดวง"
              className="h-full"
            >
              <ul className="space-y-2.5">
                {chart.elements.map((el) => (
                  <li key={el.id} className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ELEMENT_ICON[el.id]}
                      alt=""
                      className="h-6 w-6 shrink-0 object-contain"
                    />
                    <span
                      className="w-10 shrink-0 text-[17.5px] font-semibold"
                      style={{ color: el.color }}
                    >
                      {el.label}
                    </span>
                    <div
                      className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full"
                      style={{ background: "rgba(130, 205, 255, 0.12)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(el.count / maxEl) * 100}%`,
                          background: el.color,
                          minWidth: el.count > 0 ? 6 : 0,
                        }}
                      />
                    </div>
                    <span
                      className="w-8 text-right text-[17.5px] font-semibold tabular-nums"
                      style={{ color: GOLD }}
                    >
                      {el.count}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>,
            <SectionCard
              key="strength"
              title="ความแข็ง–อ่อน & ธาตุที่เป็นประโยชน์"
              className="h-full"
            >
              <p
                className="text-center text-[15.5px] font-semibold"
                style={{ color: GOLD }}
              >
                สถานะ: {chart.strength.status}{" "}
                <span style={{ color: "rgba(232,209,154,0.75)" }}>
                  ({chart.strength.statusZh})
                </span>
              </p>
              <p
                className="mt-0.5 text-center text-[13.5px]"
                style={{ color: TEXT_MUTED }}
              >
                {chart.strength.scoreLabel}
              </p>
              <div className="mt-2.5 text-center">
                <p className="text-[14px]" style={{ color: TEXT_MUTED }}>
                  ควรเสริม
                </p>
                <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                  {chart.strength.favor.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-semibold"
                      style={{
                        color: f.color,
                        background: `${f.color}22`,
                        boxShadow: `inset 0 0 0 1px ${f.color}55`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ELEMENT_ICON[f.id]}
                        alt=""
                        className="h-3.5 w-3.5 object-contain"
                      />
                      {f.label}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[13.5px]" style={{ color: TEXT_MUTED }}>
                  ควรเลี่ยง ·{" "}
                  <span style={{ color: TEXT }}>{chart.strength.avoid}</span>
                </p>
              </div>
            </SectionCard>,
          ]}
        </FocusLoopCarousel>

        <StarsPager stars={chart.stars} />

        <SectionCard
          title="ความสัมพันธ์ในดวง"
          subtitle="ก้านฟ้าและกิ่งดินที่ส่งเสริมหรือขัดแย้งกัน"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {chart.relations.map((r) => (
              <span
                key={r.label}
                className="rounded-full px-3 py-1.5 text-[15.5px] font-medium"
                style={{
                  color: TEXT,
                  background:
                    RELATION_TONE_BG[r.tone] ?? "rgba(213,177,111,0.18)",
                }}
              >
                {r.label}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="จุดพิเศษ" subtitle="จุดสำคัญเพิ่มเติมในดวง">
          <div className="grid grid-cols-2 gap-2">
            {chart.specials.map((s) => (
              <div
                key={s.label}
                className="rounded-[12px] px-2.5 py-2 text-center"
                style={CELL.idle}
              >
                <p className="text-[13.5px]" style={{ color: TEXT_MUTED }}>
                  {s.label}
                </p>
                <p
                  className="mt-0.5 text-[1.15rem] font-bold leading-none"
                  style={{ color: TEXT }}
                >
                  {s.value}
                </p>
                <p
                  className="mt-1 text-[13.5px] leading-snug"
                  style={{ color: TEXT_MUTED }}
                >
                  {s.note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="วัยจร (大運)"
          subtitle="รอบโชค 10 ปี คำนวณจากอายุและเพศ"
        >
          <HScrollRow>
            {chart.luckPillars.map((lp) => (
              <div
                key={lp.age}
                className="flex w-[4.15rem] shrink-0 flex-col items-center rounded-[12px] px-1 py-2 text-center"
                style={CELL.idle}
              >
                <p
                  className="text-[13px] font-medium leading-none"
                  style={{ color: TEXT_MUTED }}
                >
                  อายุ
                </p>
                <p
                  className="mt-1 text-[15.5px] font-semibold tabular-nums leading-none"
                  style={{ color: GOLD }}
                >
                  {formatLuckAge(lp.age)}
                </p>
                <p
                  className="mt-2 text-[1.2rem] font-bold leading-none"
                  style={{ color: lp.topColor }}
                >
                  {lp.top}
                </p>
                <p
                  className="mt-1 text-[1.2rem] font-bold leading-none"
                  style={{ color: lp.bottomColor }}
                >
                  {lp.bottom}
                </p>
              </div>
            ))}
          </HScrollRow>
        </SectionCard>

        <SectionCard
          title="ปีจร (流年) — ดวงรายปี"
          subtitle="แนวโน้มรายปีจากสิบเทพเทียบเจ้าชะตา"
        >
          <HScrollRow>
            {chart.annual.map((y, i) => (
              <button
                key={y.year}
                type="button"
                onClick={() => setYearIdx(i)}
                className="w-[4.15rem] shrink-0 rounded-[12px] px-1 py-2 text-center outline-none transition active:scale-[0.98]"
                style={i === yearIdx ? CELL.active : CELL.idle}
              >
                <p className="text-[13px]" style={{ color: TEXT_MUTED }}>
                  {y.year}
                </p>
                <p
                  className="mt-1 text-[1.15rem] font-bold leading-none"
                  style={{ color: y.topColor }}
                >
                  {y.top}
                </p>
                <p
                  className="mt-0.5 text-[1.15rem] font-bold leading-none"
                  style={{ color: y.bottomColor }}
                >
                  {y.bottom}
                </p>
                <p
                  className="mt-1 text-[13px] font-medium"
                  style={{ color: GOLD_SOFT }}
                >
                  {y.god}
                </p>
              </button>
            ))}
          </HScrollRow>
          {selectedYear ? (
            <p
              className="mt-3 text-center text-[17.5px] leading-[1.45]"
              style={{ color: TEXT_MUTED }}
            >
              ปี {selectedYear.year} · สิบเทพ “{selectedYear.god}” —{" "}
              {selectedYear.top}
              {selectedYear.bottom}
            </p>
          ) : null}
        </SectionCard>

        <SectionCard
          title="ความหมายเชิงลึกของดวงคุณ"
          subtitle="คำแปลความหมายเจ้าชะตาและสิบเทพในดวงของคุณ"
        >
          <div className="space-y-3 text-left">
            <div>
              <p className="text-[17.5px] font-semibold" style={{ color: GOLD_SOFT }}>
                {chart.deepMeaning.dayMasterTitle}
              </p>
              <p
                className={
                  deepOpen
                    ? "mt-1.5 text-[17.5px] leading-[1.55]"
                    : "mt-1.5 line-clamp-3 text-[17.5px] leading-[1.55]"
                }
                style={{ color: TEXT }}
              >
                {chart.deepMeaning.dayMasterBody}
              </p>
            </div>

            {deepOpen ? (
              <>
                <div
                  className="h-px"
                  style={{ background: "rgba(130, 205, 255, 0.18)" }}
                />
                <p className="text-[17.5px] font-semibold" style={{ color: GOLD_SOFT }}>
                  สิบเทพในดวงของคุณ
                </p>
                <ul className="space-y-2.5">
                  {chart.deepMeaning.gods.map((g) => (
                    <li key={g.title} className="text-[17.5px] leading-[1.55]">
                      <span className="font-semibold" style={{ color: TEXT }}>
                        {g.title}
                      </span>
                      <span style={{ color: TEXT_MUTED }}> — {g.body}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <button
              type="button"
              aria-expanded={deepOpen}
              onClick={() => setDeepOpen((v) => !v)}
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99]"
              style={{
                color: GOLD,
                background: "rgba(201,163,90,0.1)",
                boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.4)",
              }}
            >
              {deepOpen ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
            </button>
          </div>
        </SectionCard>

        <BaziCycleCard chart={chart} />

        <Link
          href="/home"
          className="mb-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[17.5px] font-semibold outline-none transition active:scale-[0.99]"
          style={{
            color: GOLD,
            background: "rgba(201,163,90,0.12)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.45)",
          }}
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
