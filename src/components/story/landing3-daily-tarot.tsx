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
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ChevronRight, LockOpen, Shuffle, Sparkles } from "lucide-react";
import { StoryLoginCta } from "@/components/story/story-login-cta";
import { MAE_REVIEWS } from "@/lib/reviews";
import { trackClientEvent } from "@/lib/analytics/client";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";
import {
  TAROT_DECK,
  drawTarotCard,
  getTarotSide,
  tarotCardImageSrc,
} from "@/lib/fortune/tarot-deck";
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
const FAN_CARD_H_COMPACT = 200;const GOLD_SOFT = "#e8d19a";
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

const UPRIGHT_CHANCE = 0.75;

/** Fresh random card on every draw — upright 75% of the time. */
function shuffleDraw() {
  const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)]!;
  const upright = Math.random() < UPRIGHT_CHANCE;
  const side = getTarotSide(card, upright);
  return { card, upright, side, brief: side.summary };
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
          "mae-gold-text l3-shimmer-text relative font-bold tracking-tight",
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
        <SoftGoldPill
          compact={compact}
          className={cn("l3-rise l3-d1", compact ? "mt-3" : "mt-3.5")}
        >
          {status}
        </SoftGoldPill>
      ) : null}

      {pillLabel ? (
        <p
          className={cn(
            "l3-rise relative max-w-[18rem] font-medium",
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
            "l3-rise l3-d1 relative font-medium uppercase",
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
  onOpen,
  disabled,
  compact = false,
}: {
  selected: number;
  onSelect: (index: number) => void;
  onOpen: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    x: number;
    start: number;
    moved: boolean;
    tapIndex: number | null;
  } | null>(null);
  const cardW = compact ? FAN_CARD_W_COMPACT : FAN_CARD_W;
  const cardH = compact ? FAN_CARD_H_COMPACT : FAN_CARD_H;
  const stepX = compact ? 16 : 20;
  const trackH = compact ? 230 : 300;
  const [deal, setDeal] = useState<"stacked" | "dealing" | "settled">("stacked");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeal("settled");
      return;
    }
    const start = window.setTimeout(() => setDeal("dealing"), 380);
    const done = window.setTimeout(() => setDeal("settled"), 380 + 1300);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <div className="relative w-full select-none">
      <div
        ref={trackRef}
        className="relative mx-auto w-full max-w-none touch-pan-y overflow-visible"
        style={{ height: trackH }}
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          const cardEl = (e.target as HTMLElement).closest<HTMLElement>(
            "[data-fan-index]"
          );
          dragRef.current = {
            x: e.clientX,
            start: selected,
            moved: false,
            tapIndex: cardEl ? Number(cardEl.dataset.fanIndex) : null,
          };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.x;
          if (Math.abs(dx) > 8) dragRef.current.moved = true;
          if (!dragRef.current.moved) return;
          const step = Math.round(-dx / (compact ? 24 : 28));
          const next = Math.min(
            FAN_COUNT - 1,
            Math.max(0, dragRef.current.start + step)
          );
          if (next !== selected) onSelect(next);
        }}
        onPointerUp={() => {
          const drag = dragRef.current;
          dragRef.current = null;
          if (drag && !drag.moved && drag.tapIndex != null) {
            onOpen(drag.tapIndex);
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        {Array.from({ length: FAN_COUNT }, (_, i) => {
          const offset = i - selected;
          const abs = Math.abs(offset);
          const stacked = deal === "stacked";
          const isSelected = i === selected;
          const rotate = stacked ? 0 : offset * (compact ? 3 : 3.4);
          const x = stacked ? 0 : offset * stepX;
          const y = stacked ? 18 : abs * abs * (compact ? 0.75 : 0.95);
          const scale = stacked
            ? 0.9
            : isSelected
              ? compact
                ? 1.06
                : 1.1
              : Math.max(0.82, 1 - abs * 0.03);
          const opacity = stacked
            ? 0
            : isSelected
              ? 1
              : Math.max(0.42, 1 - abs * 0.1);
          const z = 40 - abs;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              data-fan-index={i}
              aria-label={`เปิดไพ่ใบที่ ${i + 1}`}
              aria-pressed={i === selected}
              onClick={(e) => {
                if (e.detail === 0) onOpen(i);
              }}
              className="absolute left-1/2 top-0 origin-bottom outline-none transition-[transform,opacity] duration-300 ease-out will-change-transform"
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
                zIndex: z,
                opacity,
                ...(deal === "settled"
                  ? null
                  : {
                      transitionDuration: "900ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: `${abs * 55}ms`,
                    }),
              }}
            >
              <GoldFrame
                glow={isSelected}
                thin
                className={cn(
                  "h-full w-full",
                  isSelected && deal === "settled" && "l3-card-float"
                )}
              >
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
                      แตะเพื่อเปิด
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
        ปัดซ้าย–ขวาเพื่อดูไพ่ · แตะใบไหนก็เปิดได้เลย
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

const FAN_SPARKLES = [
  { left: "6%", top: "8%", size: 10, delay: "0s" },
  { left: "90%", top: "4%", size: 8, delay: "1.1s" },
  { left: "14%", top: "62%", size: 7, delay: "2.2s" },
  { left: "84%", top: "58%", size: 11, delay: "0.6s" },
  { left: "50%", top: "-6%", size: 9, delay: "1.7s" },
  { left: "96%", top: "34%", size: 6, delay: "2.8s" },
] as const;

function FanStage({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          top: compact ? 96 : 124,
          width: compact ? 210 : 260,
          height: compact ? 210 : 260,
          background:
            "radial-gradient(circle, rgba(232,209,154,0.3) 0%, rgba(213,177,111,0.12) 42%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%] blur-xl"
        style={{
          top: compact ? 200 : 262,
          width: compact ? 280 : 340,
          height: compact ? 36 : 44,
          background:
            "radial-gradient(ellipse at center, rgba(232,209,154,0.24) 0%, rgba(0,0,0,0.4) 55%, transparent 75%)",
        }}
      />
      {FAN_SPARKLES.map((s, i) => (
        <span
          key={i}
          className="tarot-sparkle absolute"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

const BURST_SPARKS = Array.from({ length: 14 }, (_, i) => ({
  angle: `${i * (360 / 14) + (i % 2 ? 9 : -6)}deg`,
  dist: `${120 + ((i * 37) % 70)}px`,
  delay: `${(i % 4) * 0.04}s`,
}));

/** Light burst centered on the flipping card — `back` sits behind it, `front` over it. */
function RevealBurst({ layer }: { layer: "back" | "front" }) {
  if (layer === "back") {
    return (
      <div className="l3-burst" aria-hidden>
        <span className="l3-burst__charge" />
        <span className="l3-burst__rays" />
      </div>
    );
  }
  return (
    <div className="l3-burst l3-burst--front" aria-hidden>
      <span className="l3-burst__flash" />
      <span className="l3-burst__ring" />
      {BURST_SPARKS.map((s, i) => (
        <span
          key={i}
          className="l3-burst__spark"
          style={
            {
              "--l3-spark-angle": s.angle,
              "--l3-spark-dist": s.dist,
              "--l3-spark-delay": s.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

const RATING_AVATARS = MAE_REVIEWS.slice(0, 4);

function RatingStrip({ compact = false }: { compact?: boolean }) {
  const avatarSize = compact ? 22 : 26;

  return (
    <div
      className={cn(
        "l3-rise l3-d5 inline-flex max-w-full items-center gap-2.5 rounded-full",
        compact ? "mt-3 py-1.5 pl-1.5 pr-3.5" : "mt-5 py-2 pl-2 pr-4"
      )}
      style={{
        background:
          "linear-gradient(165deg, rgba(14,30,56,0.6) 0%, rgba(6,16,34,0.7) 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(232,209,154,0.22), 0 10px 24px rgba(0,0,0,0.22)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex shrink-0 items-center" aria-hidden>
          {RATING_AVATARS.map((r, i) => (
            <span
              key={r.id}
              className="flex items-center justify-center rounded-full font-semibold text-white"
              style={{
                width: avatarSize,
                height: avatarSize,
                marginLeft: i === 0 ? 0 : -avatarSize * 0.32,
                background: r.tone,
                fontSize: compact ? 10.5 : 12,
                boxShadow: "0 0 0 2px rgba(8,18,36,0.95)",
                zIndex: RATING_AVATARS.length - i,
              }}
            >
              {r.initial}
            </span>
          ))}
      </div>

      <span
        className={cn(
          "leading-none tracking-[0.06em]",
          compact ? "text-[12px]" : "text-[13.5px]"
        )}
        style={{ color: GOLD_SOFT }}
        aria-label="4.9 จาก 5 ดาว"
      >
        ★★★★★
      </span>
      <span
        className={cn(
          "whitespace-nowrap font-medium leading-none",
          compact ? "text-[12px]" : "text-[13px]"
        )}
        style={{ color: "rgba(230,236,248,0.86)" }}
      >
        <b className="font-bold" style={{ color: GOLD_SOFT }}>
          4.9
        </b>{" "}
        · 12,458 รีวิว
      </span>
    </div>
  );
}

function KeywordTags({ keywords }: { keywords: string[] }) {
  const tags = keywords.slice(0, 4);
  if (tags.length === 0) return null;
  return (
    <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="l3-pop inline-flex max-w-full items-center gap-1.5 text-[13.5px] font-medium leading-snug"
          style={{
            color: "rgba(232,209,154,0.92)",
            animationDelay: `${0.35 + i * 0.1}s`,
          }}
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
  className,
  onUnlock,
}: {
  label: string;
  body: string;
  className?: string;
  onUnlock: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      aria-label={`${label} — สมัครเพื่ออ่านต่อ`}
      className={cn(
        "relative block w-full overflow-hidden rounded-[18px] px-3.5 py-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
        className
      )}
      style={{
        background:
          "linear-gradient(160deg, rgba(12,28,52,0.72), rgba(5,14,30,0.68))",
        boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.22)",
      }}
    >
      <span
        className="block text-[12px] font-semibold tracking-[0.14em]"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </span>
      <span
        className="mt-1.5 block text-[15px] font-medium leading-[1.55]"
        style={{
          color: "rgba(245,247,255,0.55)",
          filter: "blur(4.5px)",
          userSelect: "none",
        }}
        aria-hidden
      >
        {body}
      </span>
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,20,42,0.12), rgba(6,20,42,0.55))",
        }}
      >
        <span
          className="l3-lock-badge rounded-full px-3 py-1 text-[12px] font-semibold"
          style={{
            color: GOLD_SOFT,
            background: "rgba(6,20,42,0.78)",
            boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.35)",
          }}
        >
          แตะเพื่อสมัครอ่านต่อ
        </span>
      </span>
    </button>
  );
}

/** /3 only — fan pick · flip reveal · gated deeper copy · own storage */
export function Landing3DailyTarot({ className }: { className?: string }) {
  const compact = useCompactViewport();
  const [draw, setDraw] = useState(() => drawTarotCard("landing3-initial"));
  const [opened, setOpened] = useState(false);
  const [faceUp, setFaceUp] = useState(false);
  const [slot, setSlot] = useState(Math.floor(FAN_COUNT / 2));
  const [readyToDraw, setReadyToDraw] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const openTimerRef = useRef<number | null>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const [burstKey, setBurstKey] = useState<number | null>(null);
  const burstTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (burstTimerRef.current != null) {
        window.clearTimeout(burstTimerRef.current);
      }
    },
    []
  );

  const goToSignup = useCallback(() => {
    setShowLogin(true);
    window.requestAnimationFrame(() => {
      signupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const { card, upright, side } = draw;

  useEffect(() => {
    return () => {
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const revealAtSlot = useCallback(
    (nextSlot: number) => {
      const next = shuffleDraw();
      trackClientEvent({
        name: "card_open",
        props: {
          visitorId: getOrCreateVisitorId(),
          card: next.card.id,
          upright: next.upright,
        },
      });
      setDraw(next);
      setSlot(nextSlot);
      setFlipping(true);
      setOpened(true);
      setFaceUp(false);
      setBurstKey(Date.now());
      if (burstTimerRef.current != null) {
        window.clearTimeout(burstTimerRef.current);
      }
      burstTimerRef.current = window.setTimeout(() => {
        setBurstKey(null);
        burstTimerRef.current = null;
      }, 2100);
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
      openTimerRef.current = window.setTimeout(() => {
        setFaceUp(true);
        openTimerRef.current = window.setTimeout(() => {
          setFlipping(false);
          openTimerRef.current = null;
        }, 700);
      }, 520);
    },
    []
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
      className={cn(
        "relative h-full overflow-y-auto overflow-x-hidden text-white",
        className
      )}
    >
      <MaePageBackground blur={0} scrollBlur={false} />
      <div
        className="pointer-events-none sticky top-0 z-0"
        style={{
          height: "var(--vv-height, 100dvh)",
          marginBottom: "calc(-1 * var(--vv-height, 100dvh))",
          background:
            "linear-gradient(180deg, rgba(3,10,26,0.62) 0%, rgba(3,10,26,0.2) 30%, rgba(3,10,26,0.15) 55%, rgba(3,10,26,0.7) 100%)",
        }}
        aria-hidden
      />
      <AnimatedPage
        className={cn(
          "relative z-[1] mx-auto flex min-h-full w-full max-w-[440px] flex-col",
          compact ? "px-4 pb-4 pt-2" : "px-4 pb-10 pt-3 sm:px-5"
        )}
      >
        {!opened ? (
          <div
            className={cn(
              "flex flex-1 flex-col items-center",
              compact
                ? "justify-between gap-2 pb-1 pt-1"
                : "justify-center pb-6 pt-2"
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
              <SoftGoldPill compact={compact} className="l3-rise l3-d1">
                ✦ ไพ่ทาโรต์ประจำวัน · เปิดฟรี
              </SoftGoldPill>

              <h1
                className={cn(
                  "l3-rise l3-d2 relative font-bold tracking-tight text-white",
                  compact
                    ? "mt-2.5 text-[1.6rem]"
                    : "mt-4 text-[2.05rem]"
                )}
                style={{
                  lineHeight: 1.22,
                  paddingTop: "0.06em",
                  overflow: "visible",
                  textShadow: "0 4px 20px rgba(0,0,0,0.45)",
                }}
              >
                วันนี้จักรวาล
                <br />
                <span className="mae-gold-text l3-shimmer-text">
                  มีอะไรอยากบอกคุณ?
                </span>
              </h1>

              <p
                className={cn(
                  "l3-rise l3-d3 relative max-w-[19rem] font-medium",
                  compact
                    ? "mt-2 text-[13.5px] leading-[1.45]"
                    : "mt-3 text-[15px] leading-[1.5]"
                )}
                style={{ color: "rgba(235,240,250,0.86)" }}
              >
                {readyToDraw ? (
                  <>
                    แตะไพ่ที่ใจดึงดูด 1 ใบ
                    <br />
                    รับคำทำนายของวันนี้ได้ทันที
                  </>
                ) : (
                  "ตั้งจิตก่อนเปิดไพ่"
                )}
              </p>
            </header>

            <div
              className={cn(
                "relative w-full transition-opacity",
                compact ? "mt-3" : "mt-9",
                !readyToDraw && "pointer-events-none opacity-50",
              )}
            >
              <FanStage compact={compact} />
              <TarotCardFan
                selected={slot}
                onSelect={setSlot}
                onOpen={(i) => {
                  if (!readyToDraw || opened || flipping) return;
                  revealAtSlot(i);
                }}
                disabled={!readyToDraw || flipping}
                compact={compact}
              />
            </div>

            <div
              className={cn(
                "l3-rise l3-d4 flex w-full max-w-[340px] flex-col",
                compact ? "mt-2 gap-2" : "mt-5 gap-2.5"
              )}
            >
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={openSelected}
                className={cn(
                  "l3-cta wallpaper-dl-btn group relative flex w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45",
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

            <RatingStrip compact={compact} />
          </div>
        ) : (
          <div className="mt-3 flex flex-1 flex-col items-center pb-4">
            <ResultHeader
              compact={compact}
              status={
                faceUp
                  ? "ไพ่ที่จักรวาลส่งถึงคุณวันนี้"
                  : "กำลังเปิดไพ่…"
              }
              nameTh={faceUp ? card.nameTh : undefined}
              nameEn={faceUp ? card.nameEn : undefined}
              upright={upright}
            />

            <div
              className={cn(
                "relative mx-auto mt-5 w-fit",
                faceUp && !flipping && "l3-card-float"
              )}
            >
              {faceUp ? (
                <div
                  className="l3-halo pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-3xl"
                  style={{
                    width: "150%",
                    height: "90%",
                    transform: "translate(-50%, -50%)",
                    background:
                      "radial-gradient(circle, rgba(232,209,154,0.34) 0%, rgba(213,177,111,0.12) 45%, transparent 72%)",
                  }}
                  aria-hidden
                />
              ) : null}
              {burstKey != null ? (
                <RevealBurst key={`back-${burstKey}`} layer="back" />
              ) : null}
              <FlipRevealCard
                faceSrc={tarotCardImageSrc(card)}
                faceAlt={`${card.nameEn} — ${card.nameTh}`}
                upright={upright}
                faceUp={faceUp}
                animating={flipping}
                width={compact ? "min(50vw, 172px)" : "min(52vw, 184px)"}
              />
              {burstKey != null ? (
                <RevealBurst key={`front-${burstKey}`} layer="front" />
              ) : null}
            </div>

            <div
              className={cn(
                "mt-5 flex w-full flex-1 flex-col items-center transition-opacity duration-500",
                faceUp ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className={cn(
                  "w-full overflow-hidden rounded-[26px] px-4 py-5 text-center sm:px-5",
                  faceUp && "l3-rise l3-r1"
                )}
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

                {faceUp ? <KeywordTags keywords={side.keywords} /> : null}

                <div
                  className="my-4 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(232,209,154,0.28), transparent)",
                  }}
                />

                <div className="space-y-2.5">
                  <LockedAdviceBlock
                    label="ควรทำ"
                    body={side.do}
                    className={faceUp ? "l3-rise l3-r2" : undefined}
                    onUnlock={goToSignup}
                  />
                  <LockedAdviceBlock
                    label="ควรระวัง"
                    body={side.watch}
                    className={faceUp ? "l3-rise l3-r3" : undefined}
                    onUnlock={goToSignup}
                  />
                  <LockedAdviceBlock
                    label="ข้อความถึงคุณ"
                    body={side.message}
                    className={faceUp ? "l3-rise l3-r4" : undefined}
                    onUnlock={goToSignup}
                  />
                </div>
              </div>

              <div
                ref={signupRef}
                className={cn(
                  "mt-6 flex w-full flex-col gap-2.5",
                  faceUp && "l3-rise l3-r5"
                )}
              >
                {showLogin ? (
                  <StoryLoginCta
                    callbackUrl={LOGIN_CALLBACK}
                    anchor
                    variant="hero"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={goToSignup}
                    className="l3-cta wallpaper-dl-btn group relative flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
                  >
                    <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                      <LockOpen className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </span>
                    <span className="relative z-[1] min-w-0 flex-1">
                      <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
                        สมัครเพื่ออ่านต่อ
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] font-medium leading-tight opacity-70">
                        ปลดล็อกควรทำ · ควรระวัง · ข้อความถึงคุณ
                      </span>
                    </span>
                    <ChevronRight
                      className="relative z-[1] mr-1 h-5 w-5 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.4}
                      aria-hidden
                    />
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
