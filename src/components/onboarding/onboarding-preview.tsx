"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import { readIntake } from "@/lib/fortune/intake-storage";

const MAE_GOLD = "#e8d19a";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

/** แผ่นพรีเมียมจากดีไซน์ — ปัดดูทีละรูป */
const SHOWCASE = [
  {
    id: "overview",
    src: "/images/onboarding/premium-showcase/01-overview.webp",
    label: "ภาพรวม",
  },
  {
    id: "year-bazi",
    src: "/images/onboarding/premium-showcase/02-year-bazi.webp",
    label: "ดวงรายปี · ปาจื้อ",
  },
  {
    id: "self-couple",
    src: "/images/onboarding/premium-showcase/03-self-couple.webp",
    label: "ตัวตน · ดวงคู่",
  },
  {
    id: "face-palm",
    src: "/images/onboarding/premium-showcase/04-face-palm.webp",
    label: "โหงวเฮ้ง · ลายมือ",
  },
  {
    id: "calendar-daily",
    src: "/images/onboarding/premium-showcase/05-calendar-daily.webp",
    label: "ปฏิทิน · คำทำนาย",
  },
  {
    id: "color-wallpaper",
    src: "/images/onboarding/premium-showcase/06-color-wallpaper.webp",
    label: "สีมงคล · วอลเปเปอร์",
  },
] as const;

type ShowcaseItem = (typeof SHOWCASE)[number];

/**
 * Coverflow — กลางชัด ข้างโผล่ซ้อน เบลอเล็กน้อย วนลูป
 */
function ShowcaseStackCarousel({
  items,
  active,
  onActiveChange,
  onInteract,
  onPayClick,
}: {
  items: readonly ShowcaseItem[];
  active: number;
  onActiveChange: (i: number) => void;
  onInteract: () => void;
  onPayClick: () => void;
}) {
  const n = items.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [anim, setAnim] = useState(false);
  const [metrics, setMetrics] = useState({
    vw: 360,
    cardW: 320,
    step: 230,
    cardH: 480,
  });
  const phaseRef = useRef<"idle" | "drag" | "snap">("idle");
  const startX = useRef(0);
  const lastX = useRef(0);
  const snapTimer = useRef(0);
  const pendingPos = useRef(1);
  const settling = useRef(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const slides = useMemo(() => {
    if (n === 0) return [] as ShowcaseItem[];
    if (n === 1) return [items[0]!];
    return [items[n - 1]!, ...items, items[0]!];
  }, [items, n]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth || 360;
      const vh =
        typeof window !== "undefined" ? window.innerHeight : 700;
      /* รูปจริง 576×1024 — กรอบสัดส่วนเดียวกับรูปเสมอ */
      const ASPECT = 1024 / 576;
      const maxH = Math.round(vh * 0.72);
      const cardW = Math.round(
        Math.min(vw * 0.99, 480, maxH / ASPECT),
      );
      const cardH = Math.round(cardW * ASPECT);
      const step = Math.round(cardW * 0.68);
      setMetrics({ vw, cardW, step, cardH });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(snapTimer.current);
    };
  }, []);

  /* sync external active → internal pos (1..n) */
  useEffect(() => {
    if (phaseRef.current !== "idle") return;
    const next = active + 1;
    if (next !== posRef.current && next >= 1 && next <= n) {
      setPos(next);
    }
  }, [active, n]);

  if (n === 0) return null;

  const { cardW, step, cardH } = metrics;
  const pad = (metrics.vw - cardW) / 2;
  const translateX = pad - pos * step + dragX;

  function realIndex(p: number) {
    if (n <= 1) return 0;
    if (p <= 0) return n - 1;
    if (p >= n + 1) return 0;
    return p - 1;
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current === "snap") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    onInteract();
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
    let next = at;
    if (at <= 0) next = n;
    else if (at >= n + 1) next = 1;
    setPos(next);
    onActiveChange(realIndex(next));

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
    snapTimer.current = window.setTimeout(() => settle(next), 420);
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

    const threshold = Math.min(40, step * 0.14);
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

  function stepBy(dir: -1 | 1) {
    onInteract();
    goTo(posRef.current + dir);
  }

  if (n === 1) {
    const item = items[0]!;
  return (
      <div className="relative mt-3 flex justify-center px-2">
        <article
          className="relative overflow-hidden rounded-[20px] p-[2px]"
              style={{
            width: cardW,
            background:
              "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
            boxShadow:
              "0 16px 36px rgba(0,0,0,0.35), 0 0 20px rgba(213,177,111,0.22)",
          }}
        >
          <div
            className="overflow-hidden rounded-[18px]"
            style={{ background: "rgba(6,12,24,0.95)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.label}
              className="block h-auto w-full"
              draggable={false}
            />
          </div>
          <button
            type="button"
            aria-label="สมัครพรีเมียม"
            className="absolute inset-x-[6%] bottom-[4.5%] z-10 h-[16%] cursor-pointer rounded-full"
            onClick={() => {
              onInteract();
              onPayClick();
            }}
          />
        </article>
    </div>
  );
}

  return (
    <div className="relative -mx-3 mt-2 px-0 pt-1 pb-1">
      <button
        type="button"
        aria-label="ก่อนหน้า"
        className="absolute left-1 top-1/2 z-[6] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
          background: "rgba(8,16,32,0.78)",
          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
          color: MAE_GOLD,
        }}
        onClick={() => stepBy(-1)}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
      </button>
      <button
        type="button"
        aria-label="ถัดไป"
        className="absolute right-1 top-1/2 z-[6] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
          background: "rgba(8,16,32,0.78)",
          boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
          color: MAE_GOLD,
        }}
        onClick={() => stepBy(1)}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
      </button>

      <div
        ref={viewportRef}
        className="relative mx-auto w-full max-w-[480px] cursor-grab select-none overflow-visible active:cursor-grabbing"
        style={{ height: cardH + 24, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="absolute top-0 left-0 h-full"
          onTransitionEnd={onTrackTransitionEnd}
                style={{
            width: slides.length * step,
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: anim
              ? "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)"
              : "none",
          }}
        >
          {slides.map((item, i) => {
            const dist = Math.abs(i * step - pos * step + dragX);
            const progress = Math.min(1, dist / Math.max(1, step));
            const activeSlide = progress < 0.35;
            /* กลาง = 1 · ข้างย่อลงชัดเจนตามระยะ */
            const scale = Math.max(0.78, 1 - progress * 0.22);
            const opacity = Math.max(0.55, 1 - progress * 0.4);
            const blurPx = Number((progress * 2.4).toFixed(2));
  return (
              <article
                key={`${item.id}-${i}`}
                className="absolute top-2 box-border overflow-hidden rounded-[20px]"
                style={{
                  left: i * step,
                  width: cardW,
                  height: cardH,
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                  opacity,
                  filter: `blur(${blurPx}px)`,
                  zIndex: activeSlide ? 5 : Math.max(1, 4 - Math.round(progress * 3)),
                  padding: activeSlide ? 2 : 1.5,
                  background: activeSlide
                    ? "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)"
                    : "linear-gradient(155deg, rgba(232,209,154,0.55) 0%, rgba(184,146,79,0.45) 100%)",
                  boxShadow: activeSlide
                    ? "0 18px 40px rgba(0,0,0,0.4), 0 0 20px rgba(213,177,111,0.22)"
                    : "0 8px 20px rgba(0,0,0,0.22)",
                  pointerEvents: activeSlide ? "auto" : "none",
                  transition: anim
                    ? "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1), opacity 400ms ease, filter 400ms ease"
                    : "transform 80ms linear, opacity 80ms linear, filter 80ms linear",
                }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-[18px]"
                  style={{ background: "rgba(6,12,24,0.95)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.label}
                    decoding="async"
                    className="pointer-events-none block h-full w-full object-contain"
                    draggable={false}
          />
        </div>
                {activeSlide ? (
                  <button
                    type="button"
                    aria-label="สมัครพรีเมียม"
                    className="absolute inset-x-[6%] bottom-[4.5%] z-10 h-[16%] cursor-pointer rounded-full"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInteract();
                      onPayClick();
                    }}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
            </div>
    </div>
  );
}

export function OnboardingPreview() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [nickname, setNickname] = useState("");
  const activeRef = useRef(0);
  activeRef.current = active;

  function stopAutoPlay() {
    setAutoPlay(false);
  }

  useEffect(() => {
    const saved = readIntake();
    if (saved?.nickname) setNickname(saved.nickname);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      const cur = activeRef.current;
      setActive((cur + 1) % SHOWCASE.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  function goPay() {
    startMaeNavigation();
    router.push("/premium/pay?return=/welcome/preview");
  }

  return (
    <div className="onboarding-preview relative mx-auto flex h-full min-h-0 w-full max-w-[480px] flex-col overflow-y-auto overscroll-contain text-white">
      <MaePageBackground mode="sticky" blur={10} />

      <AnimatedPage className="relative z-[2] flex min-h-full flex-1 flex-col px-4 pt-3 sm:px-5">
        <div className="text-center">
          <p
            className="text-[13px] font-semibold tracking-[0.14em]"
            style={{ color: MAE_GOLD }}
          >
            แม่มั่งมี พามู
          </p>
          <h1
            className="mt-1.5 text-[clamp(1.35rem,5.5vw,1.65rem)] font-bold leading-[1.35]"
            style={{
              background:
                "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            Premium ได้ดูอะไรเพิ่ม?
          </h1>
          <p className="mt-1 text-[14px] font-medium leading-[1.45] text-white/70">
            {nickname
              ? `คุณ${nickname} · ดูตัวเองลึกขึ้น · วางแผนได้ชัดขึ้น`
              : "ดูตัวเองลึกขึ้น · วางแผนได้ชัดขึ้น"}
                    </p>
                  </div>

        <ShowcaseStackCarousel
          items={SHOWCASE}
          active={active}
          onActiveChange={setActive}
          onInteract={stopAutoPlay}
          onPayClick={goPay}
        />

        <div className="mt-3 flex items-center justify-center gap-1.5">
          {SHOWCASE.map((s, i) => (
              <button
                key={s.id}
                type="button"
              aria-label={s.label}
                onClick={() => {
                  stopAutoPlay();
                setActive(i);
                }}
                className="h-2 rounded-full transition-all duration-200"
                style={{
                  width: i === active ? 18 : 7,
                background: i === active ? MAE_GOLD : "rgba(232,209,154,0.3)",
                }}
              />
            ))}
        </div>

      <div
          className="mt-auto shrink-0 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
          onClick={goPay}
          className="group relative flex h-[3.4rem] w-full items-center justify-center gap-2 overflow-hidden rounded-full outline-none transition active:scale-[0.98]"
            style={{
              color: "#1a1408",
              background: GOLD_BTN,
              boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 24px rgba(143,110,56,0.42)",
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
            }}
            aria-hidden
          />
          <span className="relative text-[17px] font-bold tracking-wide">
            เปิดดูดวงกับแม่เลย
            </span>
            <ChevronRight
            className="relative h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.6}
            />
          </button>
        </div>
      </AnimatedPage>
    </div>
  );
}
