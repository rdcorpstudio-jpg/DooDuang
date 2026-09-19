"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { TarotPrayerSheet } from "@/components/fortune/tarot-prayer-sheet";
import {
  ShareReadingButton,
  buildTarotShareText,
} from "@/components/fortune/share-reading-button";
import {
  drawTarotCard,
  tarotCardImageSrc,
} from "@/lib/fortune/tarot-deck";
import {
  bangkokTodayKey,
  tarotDayStorageKey,
} from "@/lib/fortune/tarot-day-storage";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import { startMaeNavigation } from "@/components/layout/navigation-loading";
import { APP_NAME } from "@/lib/site";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const FAN_COUNT = 13;
const CARD_SIZES = "(max-width: 480px) 48vw, 220px";
const FAN_CARD_SIZES = "160px";
const GOLD_SOFT = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GOLD_BTN =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GLASS = MAE_GLASS;

function DailyHeader({
  cardName,
  eyebrow,
}: {
  cardName?: string;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col items-center text-center">
      <h1
        className="mae-gold-text text-[1.55rem] font-semibold tracking-tight"
        style={{
          lineHeight: 1.5,
          paddingTop: "0.16em",
          paddingBottom: "0.04em",
          overflow: "visible",
        }}
      >
        ไพ่ประจำวัน
      </h1>
      {eyebrow ? (
        <p
          className="mt-0.5 text-[13px] font-medium leading-snug"
          style={{ color: "rgba(186,204,230,0.62)" }}
        >
          {eyebrow}
        </p>
      ) : null}
      {cardName ? (
        <h2
          className="mae-gold-text mt-0.5 text-[1.3rem] font-semibold tracking-tight"
          style={{
            lineHeight: 1.5,
            paddingTop: "0.14em",
            paddingBottom: "0.04em",
            overflow: "visible",
          }}
        >
          {cardName}
        </h2>
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
      className={cn("relative h-full w-full overflow-hidden rounded-[10px]", className)}
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
  /** ขอบบาง — ไพ่มีกรอบทองในภาพอยู่แล้ว */
  thin?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[12px]",
        thin ? "p-[1px]" : "p-[2px]",
        className,
      )}
      style={{
        background: GOLD_RING,
        boxShadow: glow
          ? "0 0 28px rgba(213,177,111,0.4), 0 14px 28px rgba(0,0,0,0.45)"
          : "0 10px 22px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

/** Arc fan — swipe / drag to choose a back, then reveal */
function TarotCardFan({
  selected,
  onSelect,
  disabled,
}: {
  selected: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; start: number } | null>(null);

  return (
    <div className="relative w-full select-none">
      <div
        ref={trackRef}
        className="relative mx-auto h-[280px] w-full max-w-none touch-pan-y overflow-visible"
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
          const step = Math.round(-dx / 26);
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
          const rotate = offset * 3.6;
          const x = offset * 17;
          const y = abs * abs * 0.85;
          const scale = i === selected ? 1.12 : Math.max(0.84, 1 - abs * 0.032);
          const z = 40 - abs;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-label={`ไพ่ใบที่ ${i + 1}`}
              aria-pressed={i === selected}
              onClick={() => onSelect(i)}
              className="absolute left-1/2 top-3 origin-bottom outline-none transition-[transform,opacity] duration-300 ease-out will-change-transform"
              style={{
                width: 112,
                height: 192,
                marginLeft: -56,
                transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
                zIndex: z,
                opacity: i === selected ? 1 : Math.max(0.42, 1 - abs * 0.1),
              }}
            >
              <GoldFrame glow={i === selected} thin className="h-full w-full">
                <CardFace
                  src="/images/tarot/card-back.webp?v=3"
                  alt=""
                  flush
                  sizes={FAN_CARD_SIZES}
                  className="rounded-[10px]"
                />
                {i === selected ? (
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] font-bold tracking-wide"
                    style={{
                      color: GOLD_SOFT,
                      textShadow: "0 1px 4px rgba(0,0,0,0.75)",
                    }}
                    aria-hidden
                  >
                    ใบนี้
                  </span>
                ) : null}
              </GoldFrame>
            </button>
          );
        })}
      </div>
      <p
        className="mt-2 text-center text-[13.5px] font-medium leading-[1.45]"
        style={{ color: TEXT_MUTED }}
      >
        ปัดซ้าย–ขวาเพื่อเลือก · ใบกลางคือใบที่จะเปิด
        <span className="sr-only">
          {" "}
          ตำแหน่ง {selected + 1} จาก {FAN_COUNT}
        </span>
      </p>
    </div>
  );
}

function FlipRevealCard({
  faceSrc,
  faceAlt,
  upright,
  faceUp,
  animating,
  large = false,
}: {
  faceSrc: string;
  faceAlt: string;
  upright: boolean;
  faceUp: boolean;
  animating: boolean;
  large?: boolean;
}) {
  return (
    <div
      className="tarot-flip-scene relative mx-auto"
      style={{
        width: large ? "min(58vw, 220px)" : "min(42vw, 158px)",
        aspectRatio: "840 / 1440",
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
          <GoldFrame glow thin className="h-full w-full">
            <CardFace src="/images/tarot/card-back.webp?v=3" alt="หลังไพ่" flush />
          </GoldFrame>
        </div>
        <div className="tarot-flip-face tarot-flip-front">
          <GoldFrame glow thin className="h-full w-full">
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

function AdviceBlock({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div
      className="rounded-[16px] px-3.5 py-3 text-left"
      style={{
        background: "rgba(8,14,28,0.45)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      <p
        className="text-[12px] font-semibold tracking-[0.12em]"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </p>
      <p className="mt-1.5 text-[14.5px] font-medium leading-[1.55] text-white">
        {body}
      </p>
    </div>
  );
}

/** Daily tarot — fan pick · flip reveal · reset 00:00 ICT */
export function FortuneDailyTarot({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const router = useRouter();
  const [dayKey, setDayKey] = useState(bangkokTodayKey);
  const storageKey = tarotDayStorageKey(seed, dayKey);

  const [opened, setOpened] = useState(false);
  const [faceUp, setFaceUp] = useState(false);
  const [slot, setSlot] = useState(Math.floor(FAN_COUNT / 2));
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [readyToDraw, setReadyToDraw] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [revisiting, setRevisiting] = useState(false);
  const openTimerRef = useRef<number | null>(null);

  const draw = useMemo(
    () => drawTarotCard(`${seed}-tarot-${dayKey}-slot-${slot}`),
    [seed, dayKey, slot]
  );
  const { card, upright, side } = draw;

  const shareText = useMemo(
    () =>
      buildTarotShareText({
        nameTh: card.nameTh,
        upright,
        summary: side.summary,
        do: side.do,
        watch: side.watch,
      }),
    [card.nameTh, upright, side]
  );

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
          setPrayerOpen(false);
          setRevisiting(true);
          return;
        }
      }
      setOpened(false);
      setFaceUp(false);
      setReadyToDraw(false);
      setFlipping(false);
      setRevisiting(false);
      setPrayerOpen(true);
    } catch {
      setPrayerOpen(true);
    }
  }, [storageKey]);

  useEffect(() => {
    const tick = () => {
      const nextKey = bangkokTodayKey();
      if (nextKey !== dayKey) {
        setDayKey(nextKey);
        setSlot(Math.floor(FAN_COUNT / 2));
        setRevisiting(false);
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
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setFaceUp(true);
        });
      });
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
      openTimerRef.current = window.setTimeout(() => {
        persistOpen(nextSlot);
        setFlipping(false);
        openTimerRef.current = null;
      }, 700);
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

  function go(href: string) {
    startMaeNavigation();
    router.push(href);
  }

  return (
    <div
      className={cn("relative h-full overflow-y-auto text-white", className)}
    >
      <MaePageBackground />
      <div className="relative z-[1] mx-auto flex min-h-full w-full max-w-[390px] flex-col px-5 pb-10 pt-3">
        <header className="pt-1">
          <MaeBrandLink />
        </header>

        {!opened ? (
          <div className="flex flex-1 flex-col items-center justify-center pb-4">
            <DailyHeader />
            <p
              className="mt-2 text-center text-[14px] font-medium leading-[1.45]"
              style={{ color: "rgba(186,204,230,0.55)" }}
            >
              จั่วได้ 1 ใบต่อวัน · รีเซ็ต 00:00 น.
            </p>

            <div
              className={cn(
                "mt-4 w-full transition-opacity",
                !readyToDraw && "pointer-events-none opacity-50"
              )}
            >
              <TarotCardFan
                selected={slot}
                onSelect={setSlot}
                disabled={!readyToDraw || flipping}
              />
            </div>

            <div className="mt-5 flex w-full max-w-[320px] flex-col gap-2.5">
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={openSelected}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold outline-none transition active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: GOLD_BTN,
                  color: "#1a1408",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                }}
              >
                {flipping ? "กำลังเปิดไพ่…" : readyToDraw ? "เปิดไพ่ใบนี้" : "รอตั้งจิตก่อน"}
              </button>
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={randomAndOpen}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold outline-none transition active:scale-[0.99] disabled:opacity-45"
                style={{
                  background: GLASS.bg,
                  border: GLASS.border,
                  boxShadow: GLASS.highlight,
                  color: GOLD_SOFT,
                }}
              >
                <Shuffle className="h-4 w-4" strokeWidth={2.2} />
                สุ่มแล้วเปิดเลย
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-1 flex-col items-center pb-4">
            <DailyHeader
              eyebrow={
                revisiting
                  ? "เปิดแล้ววันนี้ · รีเซ็ต 00:00 น."
                  : faceUp
                    ? undefined
                    : "กำลังเปิดไพ่…"
              }
              cardName={
                faceUp
                  ? upright
                    ? card.nameTh
                    : `${card.nameTh} · กลับหัว`
                  : undefined
              }
            />

            <div className="relative mt-5 w-full">
              <FlipRevealCard
                faceSrc={tarotCardImageSrc(card)}
                faceAlt={`${card.nameEn} — ${card.nameTh}`}
                upright={upright}
                faceUp={faceUp}
                animating={flipping}
                large
              />
            </div>

            <div
              className={cn(
                "mt-5 flex w-full flex-1 flex-col items-center transition-opacity duration-500",
                faceUp ? "opacity-100" : "opacity-0",
              )}
            >
              <div
                className="w-full max-w-[22rem] rounded-[22px] px-4 py-4 text-center"
                style={{
                  background: GLASS.bg,
                  border: GLASS.border,
                  boxShadow: `${GLASS.highlight}, 0 14px 32px rgba(0,0,0,0.22)`,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                }}
              >
                <p className="text-[15px] font-medium leading-[1.6] text-white">
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
                  <AdviceBlock label="ควรทำ" body={side.do} />
                  <AdviceBlock label="ควรระวัง" body={side.watch} />
                </div>
              </div>

              <div className="mt-6 flex w-full max-w-[320px] flex-col gap-2.5">
                <ShareReadingButton
                  title={`ไพ่ประจำวัน · ${APP_NAME}`}
                  text={shareText}
                  variant="secondary"
                />
                <button
                  type="button"
                  onClick={() => go("/reading/shirt")}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full text-[14px] font-semibold outline-none transition active:scale-[0.99]"
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    boxShadow: GLASS.highlight,
                    color: GOLD_SOFT,
                  }}
                >
                  ดูสีเสื้อวันนี้ต่อ
                </button>
                <Link
                  href="/predict"
                  onClick={(e) => {
                    e.preventDefault();
                    go("/predict");
                  }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full text-[14px] font-semibold outline-none transition active:scale-[0.99]"
                  style={{ color: TEXT_MUTED }}
                >
                  กลับหน้าทำนาย
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <TarotPrayerSheet
        open={prayerOpen}
        onReady={() => {
          setPrayerOpen(false);
          setReadyToDraw(true);
        }}
      />
    </div>
  );
}
