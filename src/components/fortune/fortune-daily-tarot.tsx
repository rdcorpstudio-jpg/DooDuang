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
import { Sparkles, Shuffle } from "lucide-react";
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
import { AnimatedPage } from "@/components/ui/reveal";
import { APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

const FAN_COUNT = 13;
const CARD_SIZES = "(max-width: 480px) 52vw, 240px";
const FAN_CARD_SIZES = "220px";
const FAN_CARD_W = 142;
const FAN_CARD_H = 244;
const GOLD_SOFT = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

function DailyHeader({
  cardName,
  eyebrow,
}: {
  cardName?: string;
  eyebrow?: string;
}) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      <h1
        className="mae-gold-text text-[1.85rem] font-bold tracking-tight"
        style={{
          lineHeight: 1.25,
          paddingTop: "0.1em",
          paddingBottom: "0.06em",
          overflow: "visible",
        }}
      >
        ไพ่ประจำวัน
      </h1>
      {eyebrow ? (
        <p
          className="mt-2.5 max-w-[21rem] text-[15px] font-semibold leading-snug"
          style={{ color: "rgba(232,209,154,0.88)" }}
        >
          {eyebrow}
        </p>
      ) : null}
      {cardName ? (
        <h2
          className="mae-gold-text mt-2.5 text-[1.4rem] font-semibold tracking-tight"
          style={{
            lineHeight: 1.35,
            paddingTop: "0.1em",
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
        className="relative mx-auto h-[300px] w-full max-w-none touch-pan-y overflow-visible"
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
          const step = Math.round(-dx / 28);
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
          const rotate = offset * 3.4;
          const x = offset * 20;
          const y = abs * abs * 0.95;
          const scale = i === selected ? 1.1 : Math.max(0.82, 1 - abs * 0.03);
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
                width: FAN_CARD_W,
                height: FAN_CARD_H,
                marginLeft: -FAN_CARD_W / 2,
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
                  className="rounded-[11px]"
                />
              {i === selected ? (
                  <span
                    className="pointer-events-none absolute inset-x-2 bottom-2.5 flex justify-center"
                    aria-hidden
                  >
                    <span
                      className="rounded-full px-4 py-[0.38em] text-[13px] font-bold tracking-[0.12em]"
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
        className="mt-2 text-center text-[14.5px] font-medium leading-snug tracking-wide"
        style={{ color: "rgba(220,230,245,0.78)" }}
      >
        ปัดซ้าย–ขวา · ใบกลางคือใบที่จะเปิด
        <span className="sr-only">
          {" "}
          ตำแหน่ง {selected + 1} จาก {FAN_COUNT}
        </span>
      </p>
      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
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
        width: large ? "min(68vw, 248px)" : "min(48vw, 176px)",
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
          <GoldFrame glow thin className="h-full w-full">
            <CardFace src="/images/tarot/card-back.webp?v=4" alt="หลังไพ่" flush />
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
      className="rounded-[18px] px-3.5 py-3.5 text-left"
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
        style={{ color: "rgba(245,247,255,0.94)" }}
      >
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
      <MaePageBackground blur={14} scrollBlur={false} />
      <AnimatedPage className="relative z-[1] mx-auto flex min-h-full w-full max-w-[400px] flex-col px-5 pb-10 pt-3 sm:px-6">
        <header className="flex items-center justify-between gap-3 pt-1">
          <MaeBrandLink />
        </header>

        {!opened ? (
          <div className="flex flex-1 flex-col items-center pb-3 pt-2">
            <header className="flex w-full flex-col items-center text-center">
              <h1
                className="mae-gold-text text-[1.9rem] font-bold tracking-tight"
                style={{
                  lineHeight: 1.2,
                  paddingTop: "0.08em",
                  paddingBottom: "0.04em",
                  overflow: "visible",
                }}
              >
                ไพ่ประจำวัน
              </h1>
              <span
                className="mt-3 inline-flex items-center rounded-full px-3.5 py-[0.4em] text-[13.5px] font-semibold leading-none"
                style={{
                  color: GOLD_SOFT,
                  background: "rgba(8,16,32,0.55)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(232,209,154,0.38), 0 6px 16px rgba(0,0,0,0.2)",
                }}
              >
                {readyToDraw
                  ? "จั่วได้ 1 ใบ · รีเซ็ต 00:00 น."
                  : "ตั้งจิตก่อนจั่ว"}
              </span>
              <p
                className="mt-3.5 max-w-[19rem] text-[15.5px] font-medium leading-[1.5]"
                style={{ color: "rgba(230,236,248,0.9)" }}
              >
                เลือกใบที่รู้สึกดึงดูด
                <br />
                หรือปล่อยให้จักรวาลสุ่มให้
              </p>
            </header>

            <div
              className={cn(
                "relative mt-12 w-full transition-opacity",
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
              />
            </div>

            <div className="mt-5 flex w-full max-w-[340px] flex-col gap-2.5">
              <button
                type="button"
                disabled={!readyToDraw || flipping}
                onClick={openSelected}
                className="wallpaper-dl-btn group relative flex h-[3.55rem] w-full items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
              >
                <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
                    {flipping
                      ? "กำลังเปิดไพ่…"
                      : readyToDraw
                        ? "เปิดไพ่ใบนี้"
                        : "รอตั้งจิตก่อน"}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium leading-tight opacity-70">
                    {readyToDraw
                      ? "เปิดใบกลางที่เลือกไว้"
                      : "ตั้งจิตให้ครบก่อนจั่ว"}
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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold outline-none transition active:scale-[0.99] disabled:opacity-45"
                style={{
                  color: GOLD_SOFT,
                  background:
                    "linear-gradient(180deg, rgba(18,28,48,0.55), rgba(8,14,28,0.72))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(232,209,154,0.28)",
                }}
              >
                <Shuffle className="h-4 w-4" strokeWidth={2.2} />
                สุ่มแล้วเปิดเลย
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-1 flex-col items-center pb-4">
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
                className="w-full max-w-[22rem] overflow-hidden rounded-[26px] px-4 py-5 text-center"
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
                  ความหมายวันนี้
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
                  className="inline-flex h-11 w-full items-center justify-center rounded-full text-[14.5px] font-semibold outline-none transition active:scale-[0.99]"
                  style={{
                    color: GOLD_SOFT,
                    background: "rgba(8,16,32,0.45)",
                    boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.32)",
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
      </AnimatedPage>

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
