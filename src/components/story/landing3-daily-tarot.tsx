"use client";

/**
 * /3 landing daily-tarot UI — separate from /reading/tarot
 * so later funnel features can grow without colliding.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Sparkles, Shuffle } from "lucide-react";
import { StoryLoginCta } from "@/components/story/story-login-cta";
import {
  drawTarotCard,
  tarotCardImageSrc,
} from "@/lib/fortune/tarot-deck";
import { bangkokTodayKey } from "@/lib/fortune/tarot-day-storage";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { AnimatedPage } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/** Local fan size — independent from /reading/tarot */
const FAN_COUNT = 13;
const CARD_SIZES = "(max-width: 480px) 52vw, 240px";
const FAN_CARD_SIZES = "220px";
const FAN_CARD_W = 142;
const FAN_CARD_H = 244;
const FAN_CARD_W_COMPACT = 118;
const FAN_CARD_H_COMPACT = 200;
const GOLD_SOFT = "#e8d19a";
const LOGIN_CALLBACK = "/reading";
const GOLD_RING_OUTER =
  "linear-gradient(145deg, #fff6d4 0%, #f0d78a 18%, #c9a24a 42%, #8a6a2e 68%, #5c451c 88%, #3d2e12 100%)";
const GOLD_RING_MID =
  "linear-gradient(145deg, #6b5224 0%, #a07a38 35%, #d4b56a 55%, #7a5c28 100%)";
const GOLD_RING_INNER =
  "linear-gradient(145deg, #fff8e0 0%, #e8d19a 40%, #b8924f 100%)";

function useCompactViewport() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const sync = () => setCompact(window.innerHeight < 740);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return compact;
}

function landing3Seed(dayKey = bangkokTodayKey()) {
  return `landing3-tarot-${dayKey}`;
}

function landing3StorageKey(dayKey = bangkokTodayKey()) {
  return `dooduang-landing3-tarot-${dayKey}`;
}

function SoftGoldPill({
  children,
  compact = false,
  className,
}: {
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex max-w-[94%] items-center justify-center rounded-full",
        className
      )}
      style={{
        background: "rgba(10, 22, 44, 0.55)",
        boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.55)",
      }}
    >
      <span
        className={cn(
          "rounded-full font-medium leading-none tracking-wide",
          compact
            ? "px-3.5 py-[0.62em] text-[12px]"
            : "px-4 py-[0.7em] text-[13px]"
        )}
        style={{ color: "rgba(232,209,154,0.92)" }}
      >
        {children}
      </span>
    </div>
  );
}

function ResultHeader({
  status,
  nameTh,
  nameEn,
  upright,
  compact = false,
}: {
  status?: string;
  nameTh?: string;
  nameEn?: string;
  upright?: boolean;
  compact?: boolean;
}) {
  const pillLabel =
    nameTh == null
      ? null
      : upright
        ? nameTh
        : `${nameTh} · กลับหัว`;
  const enLabel =
    nameEn == null
      ? null
      : upright
        ? nameEn.toUpperCase()
        : `${nameEn.toUpperCase()} (REVERSED)`;

  return (
    <header className="relative flex w-full flex-col items-center text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-6 h-20 w-36 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(232,209,154,0.16) 0%, transparent 72%)",
        }}
      />

      <h1
        className={cn(
          "mae-gold-text relative font-bold tracking-tight",
          compact ? "text-[1.65rem]" : "text-[2rem]"
        )}
        style={{
          lineHeight: 1.15,
          paddingTop: "0.08em",
          paddingBottom: "0.06em",
          overflow: "visible",
        }}
      >
        ไพ่ประจำวัน
      </h1>

      {status ? (
        <SoftGoldPill compact={compact} className={compact ? "mt-3" : "mt-3.5"}>
          {status}
        </SoftGoldPill>
      ) : null}

      {pillLabel ? (
        <p
          className={cn(
            "relative max-w-[18rem] font-medium",
            compact
              ? "mt-3 text-[13.5px] leading-[1.45]"
              : "mt-4 text-[15px] leading-[1.5]"
          )}
          style={{ color: "rgba(235,240,250,0.9)" }}
        >
          {pillLabel}
        </p>
      ) : null}

      {enLabel ? (
        <p
          className={cn(
            "relative font-medium uppercase",
            compact
              ? "mt-1.5 text-[10px] tracking-[0.16em]"
              : "mt-2 text-[11px] tracking-[0.18em]"
          )}
          style={{ color: "rgba(186,204,230,0.68)" }}
        >
          {enLabel}
        </p>
      ) : null}
    </header>
  );
}

function CardFace({
  src,
  alt,
  upright = true,
  className,
  flush = false,
  sizes = CARD_SIZES,
}: {
  src: string;
  alt: string;
  upright?: boolean;
  className?: string;
  /** ดึงขอบทองในภาพชิดกรอบ ไม่เหลือขอบกรมว่าง */
  flush?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden rounded-[1px]", className)}
      style={{ background: "#0b1220" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={100}
        unoptimized
        draggable={false}
        className="object-cover"
        style={{
          transform: [
            "translateZ(0)",
            upright ? null : "rotate(180deg)",
            flush ? "scale(1.04)" : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined,
          transformOrigin: "center center",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </div>
  );
}

function GoldFrame({
  children,
  className,
  glow = false,
  thin = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  /** ขอบบาง — หลังไพ่ในพัด */
  thin?: boolean;
}) {
  const outerPad = thin ? 2 : 3;
  const midPad = thin ? 1 : 1.5;
  const innerPad = thin ? 0.5 : 1;

  return (
    <div
      className={cn("relative overflow-hidden rounded-[3px]", className)}
      style={{
        padding: outerPad,
        background: GOLD_RING_OUTER,
        boxShadow: glow
          ? "0 0 20px rgba(213,177,111,0.32), 0 12px 26px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.35)"
          : "0 10px 22px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.28)",
      }}
    >
      <div
        className="h-full w-full overflow-hidden rounded-[2px]"
        style={{
          padding: midPad,
          background: GOLD_RING_MID,
          boxShadow: "inset 0 0 0 1px rgba(40,28,10,0.45)",
        }}
      >
        <div
          className="h-full w-full overflow-hidden rounded-[1px]"
          style={{
            padding: innerPad,
            background: GOLD_RING_INNER,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Arc fan — swipe / drag to choose a back, then reveal */
function TarotCardFan({
  selected,
  onSelect,
  disabled,
  compact = false,
}: {
  selected: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; start: number } | null>(null);
  const cardW = compact ? FAN_CARD_W_COMPACT : FAN_CARD_W;
  const cardH = compact ? FAN_CARD_H_COMPACT : FAN_CARD_H;
  const stepX = compact ? 16 : 20;
  const trackH = compact ? 230 : 300;

  return (
    <div className="relative w-full select-none">
      <div
        ref={trackRef}
        className="relative mx-auto w-full max-w-none touch-pan-y overflow-visible"
        style={{ height: trackH }}
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          dragRef.current = { x: e.clientX, start: selected };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.x;
          const step = Math.round(-dx / (compact ? 24 : 28));
          const next = Math.min(
            FAN_COUNT - 1,
            Math.max(0, dragRef.current.start + step)
          );
          if (next !== selected) onSelect(next);
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        {Array.from({ length: FAN_COUNT }, (_, i) => {
          const offset = i - selected;
          const abs = Math.abs(offset);
          const rotate = offset * (compact ? 3 : 3.4);
          const x = offset * stepX;
          const y = abs * abs * (compact ? 0.75 : 0.95);
          const scale = i === selected ? (compact ? 1.06 : 1.1) : Math.max(0.82, 1 - abs * 0.03);
          const z = 40 - abs;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-label={`ไพ่ใบที่ ${i + 1}`}
              aria-pressed={i === selected}
              onClick={() => onSelect(i)}
              className="absolute left-1/2 top-0 origin-bottom outline-none transition-[transform,opacity] duration-300 ease-out will-change-transform"
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
                zIndex: z,
                opacity: i === selected ? 1 : Math.max(0.42, 1 - abs * 0.1),
              }}
            >
              <GoldFrame glow={i === selected} thin className="h-full w-full">
                <CardFace
                  src="/images/tarot/card-back.webp?v=4"
                  alt=""
                  flush
                  sizes={FAN_CARD_SIZES}
                  className="rounded-[2px]"
                />
              {i === selected ? (
                  <span
                    className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-center"
                    aria-hidden
                  >
                    <span
                      className="rounded-full px-3 py-[0.32em] text-[12px] font-bold tracking-[0.12em]"
                      style={{
                        color: "#1a1408",
                        background:
                          "linear-gradient(155deg, #fff8e4 0%, #e8d19a 40%, #d5b16f 100%)",
                        boxShadow:
                          "0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)",
                      }}
                    >
                      ใบนี้
                    </span>
                  </span>
                ) : null}
              </GoldFrame>
            </button>
          );
        })}
      </div>
      <p
        className={cn(
          "text-center font-medium leading-snug tracking-wide",
          compact ? "mt-1 text-[13px]" : "mt-2 text-[14.5px]"
        )}
        style={{ color: "rgba(220,230,245,0.78)" }}
      >
        ปัดซ้าย–ขวา · ใบกลางคือใบที่จะเปิด
        <span className="sr-only">
          {" "}
          ตำแหน่ง {selected + 1} จาก {FAN_COUNT}
        </span>
      </p>
      <div
        className={cn(
          "flex items-center justify-center gap-1.5",
          compact ? "mt-1.5" : "mt-3"
        )}
        aria-hidden
      >
        {Array.from({ length: Math.min(7, FAN_COUNT) }, (_, i) => {
          const mid = Math.floor(FAN_COUNT / 2);
          const mapped = mid - 3 + i;
          const active = mapped === selected;
          return (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: active ? 18 : 6,
                height: 6,
                background: active
                  ? GOLD_SOFT
                  : "rgba(232,209,154,0.28)",
                boxShadow: active
                  ? "0 0 8px rgba(232,209,154,0.55)"
                  : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function FlipRevealCard({
  faceSrc,
  faceAlt,
  upright,
  faceUp,
  animating,
  width = "min(48vw, 168px)",
}: {
  faceSrc: string;
  faceAlt: string;
  upright: boolean;
  faceUp: boolean;
  animating: boolean;
  width?: string;
}) {
  return (
    <div
      className="tarot-flip-scene relative"
      style={{
        width,
        aspectRatio: "840 / 1455",
      }}
    >
      <div
        className={cn(
          "tarot-flip-card relative h-full w-full",
          faceUp && "is-flipped",
          animating && "is-animating",
        )}
      >
        <div className="tarot-flip-face tarot-flip-back">
          <GoldFrame glow className="h-full w-full">
            <CardFace src="/images/tarot/card-back.webp?v=4" alt="หลังไพ่" flush />
          </GoldFrame>
        </div>
        <div className="tarot-flip-face tarot-flip-front">
          <GoldFrame glow className="h-full w-full">
            <CardFace src={faceSrc} alt={faceAlt} upright={upright} />
          </GoldFrame>
          <span className="tarot-flip-glow pointer-events-none absolute inset-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function KeywordTags({ keywords }: { keywords: string[] }) {
  const tags = keywords.slice(0, 4);
  if (tags.length === 0) return null;
  return (
    <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex max-w-full items-center gap-1.5 text-[13.5px] font-medium leading-snug"
          style={{ color: "rgba(232,209,154,0.92)" }}
        >
          <span
            className="h-1 w-1 shrink-0 rounded-full"
            style={{ background: GOLD_SOFT }}
            aria-hidden
          />
          {tag}
        </span>
      ))}
    </div>
  );
}

function LockedAdviceBlock({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-3.5 py-3.5 text-left"
      style={{
        background:
          "linear-gradient(160deg, rgba(12,28,52,0.72), rgba(5,14,30,0.68))",
        boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.22)",
      }}
    >
      <p
        className="text-[12px] font-semibold tracking-[0.14em]"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-[15px] font-medium leading-[1.55]"
        style={{
          color: "rgba(245,247,255,0.55)",
          filter: "blur(4.5px)",
          userSelect: "none",
        }}
      >
        {body}
      </p>
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,20,42,0.12), rgba(6,20,42,0.55))",
        }}
      >
        <span
          className="rounded-full px-3 py-1 text-[12px] font-semibold"
          style={{
            color: GOLD_SOFT,
            background: "rgba(6,20,42,0.78)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
          }}
        >
          ล็อก · สมัครเพื่ออ่านต่อ
        </span>
      </div>
    </div>
  );
}

/** /3 only — fan pick · flip reveal · gated deeper copy · own storage */
export function Landing3DailyTarot({ className }: { className?: string }) {
  const compact = useCompactViewport();
  const [dayKey, setDayKey] = useState(bangkokTodayKey);
  const seed = useMemo(() => landing3Seed(dayKey), [dayKey]);
  const storageKey = useMemo(() => landing3StorageKey(dayKey), [dayKey]);

  const [opened, setOpened] = useState(false);
  const [faceUp, setFaceUp] = useState(false);
  const [slot, setSlot] = useState(Math.floor(FAN_COUNT / 2));
  const [readyToDraw, setReadyToDraw] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [revisiting, setRevisiting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const openTimerRef = useRef<number | null>(null);

  const draw = useMemo(
    () => drawTarotCard(`${seed}-slot-${slot}`),
    [seed, slot]
  );
  const { card, upright, side } = draw;

  useEffect(() => {
    return () => {
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { slot?: number; opened?: boolean };
        if (typeof parsed.slot === "number") {
          setSlot(Math.min(FAN_COUNT - 1, Math.max(0, parsed.slot)));
        }
        if (parsed.opened) {
          setOpened(true);
          setFaceUp(true);
          setReadyToDraw(true);
          setFlipping(false);
          setRevisiting(true);
          return;
        }
      }
      setOpened(false);
      setFaceUp(false);
      setReadyToDraw(true);
      setFlipping(false);
      setRevisiting(false);
      setShowLogin(false);
    } catch {
      setReadyToDraw(true);
    }
  }, [storageKey]);

  useEffect(() => {
    const tick = () => {
      const nextKey = bangkokTodayKey();
      if (nextKey !== dayKey) {
        setDayKey(nextKey);
        setSlot(Math.floor(FAN_COUNT / 2));
        setRevisiting(false);
        setShowLogin(false);
      }
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [dayKey]);

  const persistOpen = useCallback(
    (nextSlot: number) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ opened: true, slot: nextSlot })
        );
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  );

  const revealAtSlot = useCallback(
    (nextSlot: number) => {
      setSlot(nextSlot);
      setFlipping(true);
      setOpened(true);
      setFaceUp(false);
      setRevisiting(false);
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
      openTimerRef.current = window.setTimeout(() => {
        setFaceUp(true);
        openTimerRef.current = window.setTimeout(() => {
          persistOpen(nextSlot);
          setFlipping(false);
          openTimerRef.current = null;
        }, 700);
      }, 520);
    },
    [persistOpen]
  );

  const openSelected = useCallback(() => {
    if (!readyToDraw || opened || flipping) return;
    revealAtSlot(slot);
  }, [readyToDraw, opened, flipping, revealAtSlot, slot]);

  const randomAndOpen = useCallback(() => {
    if (!readyToDraw || opened || flipping) return;
    let next = Math.floor(Math.random() * FAN_COUNT);
    if (next === slot) next = (next + 1) % FAN_COUNT;
    setSlot(next);
    setFlipping(true);
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      revealAtSlot(next);
    }, 420);
  }, [readyToDraw, opened, flipping, slot, revealAtSlot]);

  return (
    <div
      className={cn("relative h-full overflow-y-auto text-white", className)}
    >
      <MaePageBackground blur={14} scrollBlur={false} />
      {opened && flipping && !revisiting ? (
        <div className="tarot-open-veil pointer-events-none absolute inset-0 z-20" aria-hidden />
      ) : null}
      <AnimatedPage
        className={cn(
          "relative z-[1] mx-auto flex min-h-full w-full max-w-[440px] flex-col",
          compact ? "px-4 pb-4 pt-2" : "px-4 pb-10 pt-3 sm:px-5"
        )}
      >
        <header className={cn("flex items-center justify-between gap-3", compact ? "pt-0" : "pt-1")}>
          <MaeBrandLink />
        </header>

        {!opened ? (
          <div
            className={cn(
              "flex flex-1 flex-col items-center",
              compact ? "justify-between gap-2 pb-1 pt-1" : "pb-3 pt-2"
            )}
          >
            <header className="relative flex w-full flex-col items-center text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-6 h-20 w-36 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,209,154,0.16) 0%, transparent 72%)",
                }}
              />
              <h1
                className={cn(
                  "mae-gold-text relative font-bold tracking-tight",
                  compact ? "text-[1.65rem]" : "text-[2rem]"
                )}
                style={{
                  lineHeight: 1.15,
                  paddingTop: "0.08em",
                  paddingBottom: "0.06em",
                  overflow: "visible",
                }}
              >
                ไพ่ประจำวัน
              </h1>

              <SoftGoldPill
                compact={compact}
                className={compact ? "mt-3" : "mt-3.5"}
              >
                {readyToDraw
                  ? "เปิดได้วันละ 1 ใบ · เริ่มใหม่ตอน 00:00 น."
                  : "ตั้งจิตก่อนเปิดไพ่"}
              </SoftGoldPill>

              <p
                className={cn(
                  "relative max-w-[18rem] font-medium",
                  compact
                    ? "mt-3 text-[13.5px] leading-[1.45]"
                    : "mt-4 text-[15px] leading-[1.5]"
                )}
                style={{ color: "rgba(235,240,250,0.9)" }}
              >
                เลือกใบที่ใจดึงดูด
                <br />
                หรือให้จักรวาลเลือกให้
              </p>
            </header>

            <div
              className={cn(
                "relative w-full transition-opacity",
                compact ? "mt-3" : "mt-12",
                !readyToDraw && "pointer-events-none opacity-50",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[40%] h-[10rem] w-[10rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(232,209,154,0.16) 0%, transparent 70%)",
                }}
              />
              <TarotCardFan
                selected={slot}
                onSelect={setSlot}
                disabled={!readyToDraw || flipping}
                compact={compact}
              />
            </div>

            <div
              className={cn(
                "flex w-full max-w-[340px] flex-col",
                compact ? "mt-2 gap-2" : "mt-5 gap-2.5"
              )}
            >
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={openSelected}
                className={cn(
                  "wallpaper-dl-btn group relative flex w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
                  compact ? "h-[3.1rem]" : "h-[3.55rem]"
                )}
              >
                <span
                  className={cn(
                    "wallpaper-dl-btn__icon relative z-[1] flex shrink-0 items-center justify-center rounded-[14px]",
                    compact ? "h-9 w-9" : "h-11 w-11"
                  )}
                >
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span
                    className={cn(
                      "dd-btn-label block font-bold leading-tight tracking-wide",
                      compact ? "text-[14.5px]" : "text-[15.5px]"
                    )}
                  >
                    {flipping
                      ? "กำลังเปิดไพ่…"
                      : readyToDraw
                        ? "เปิดไพ่ใบนี้"
                        : "รอตั้งจิตก่อน"}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium leading-tight opacity-70">
                    {readyToDraw
                      ? "เปิดใบกลางที่เลือกไว้"
                      : "ตั้งจิตให้ครบก่อนเปิด"}
                  </span>
                </span>
                <span
                  className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={randomAndOpen}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold outline-none transition active:scale-[0.99] disabled:opacity-45",
                  compact ? "h-10 text-[13.5px]" : "h-11 text-[14.5px]"
                )}
                style={{
                  color: GOLD_SOFT,
                  background:
                    "linear-gradient(180deg, rgba(18,28,48,0.55), rgba(8,14,28,0.72))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(232,209,154,0.28)",
                }}
              >
                <Shuffle className="h-4 w-4" strokeWidth={2.2} />
                สุ่มให้จักรวาลเลือก
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-1 flex-col items-center pb-4">
            <ResultHeader
              compact={compact}
              status={
                faceUp || revisiting
                  ? "เปิดแล้วสำหรับวันนี้ · เริ่มใหม่ตอน 00:00 น."
                  : "กำลังเปิดไพ่…"
              }
              nameTh={faceUp ? card.nameTh : undefined}
              nameEn={faceUp ? card.nameEn : undefined}
              upright={upright}
            />

            <div className="relative mx-auto mt-5 w-fit">
              <FlipRevealCard
                faceSrc={tarotCardImageSrc(card)}
                faceAlt={`${card.nameEn} — ${card.nameTh}`}
                upright={upright}
                faceUp={faceUp}
                animating={flipping}
                width={compact ? "min(50vw, 172px)" : "min(52vw, 184px)"}
              />
            </div>

            <div
              className={cn(
                "mt-5 flex w-full flex-1 flex-col items-center transition-opacity duration-500",
                faceUp ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className="w-full overflow-hidden rounded-[26px] px-4 py-5 text-center sm:px-5"
                style={{
                  background:
                    "linear-gradient(165deg, rgba(12,28,52,0.82) 0%, rgba(5,14,30,0.78) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.28)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                }}
              >
                <p
                  className="text-[12px] font-semibold tracking-[0.16em]"
                  style={{ color: GOLD_SOFT }}
                >
                  ความหมายของไพ่อันนี้
                </p>
                <p className="mt-2.5 text-[15.5px] font-medium leading-[1.6] text-white">
                  {side.summary}
                </p>

                <KeywordTags keywords={side.keywords} />

                <div
                  className="my-4 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(232,209,154,0.28), transparent)",
                  }}
                />

                <div className="space-y-2.5">
                  <LockedAdviceBlock label="ควรทำ" body={side.do} />
                  <LockedAdviceBlock label="ควรระวัง" body={side.watch} />
                  <LockedAdviceBlock label="ข้อความถึงคุณ" body={side.message} />
                </div>
              </div>

              <div className="mt-6 flex w-full flex-col gap-2.5">
                {showLogin ? (
                  <StoryLoginCta
                    callbackUrl={LOGIN_CALLBACK}
                    anchor
                    variant="hero"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="wallpaper-dl-btn group relative flex h-[3.55rem] w-full items-center justify-center overflow-hidden rounded-[18px] px-2.5 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
                  >
                    <span className="dd-btn-label relative z-[1] text-[15.5px] font-bold tracking-wide">
                      สมัครเพื่ออ่านต่อ
                    </span>
                    <span
                      className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
                      aria-hidden
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatedPage>
    </div>
  );
}
