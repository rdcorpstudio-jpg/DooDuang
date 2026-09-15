"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Moon, Share2, Sparkles } from "lucide-react";
import { TarotPrayerSheet } from "@/components/fortune/tarot-prayer-sheet";
import { shareOrCopy } from "@/components/fortune/share-reading-button";
import {
  drawTarotCard,
  tarotCardImageSrc,
} from "@/lib/fortune/tarot-deck";
import { PageBackButton } from "@/components/ui/page-back-button";
import { APP_NAME_PRIMARY } from "@/lib/site";
import { cn } from "@/lib/utils";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatThaiDateFull(d = new Date()) {
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const HOLD_MS = 450;
const HOLD_MOVE_CANCEL_PX = 14;

const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";

const GOLD_FOIL =
  "linear-gradient(180deg, #fffef8 0%, #ffe9b0 22%, #f0d078 48%, #d5b16f 72%, #b8924f 88%, #8f6e38 100%)";

/** Hero card size — matches mock airy stack */
const CARD_WIDTH = "w-[min(48vw,178px)]";
const CARD_SIZES = "178px";

function GoldStar({ className }: { className?: string }) {
  return (
    <span
      className={cn("leading-none", className)}
      style={{
        backgroundImage: GOLD_FOIL,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
      aria-hidden
    >
      ✦
    </span>
  );
}

function OrnamentLine({ side }: { side: "left" | "right" }) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center gap-1.5",
        side === "right" && "flex-row-reverse"
      )}
      aria-hidden
    >
      <GoldStar className="text-[11px]" />
      <span
        className="h-[1.5px] flex-1 rounded-full"
        style={{
          background:
            side === "left"
              ? "linear-gradient(90deg, transparent 0%, #8f6e38 18%, #d5b16f 48%, #ffe9b0 72%, #f0d078 100%)"
              : "linear-gradient(270deg, transparent 0%, #8f6e38 18%, #d5b16f 48%, #ffe9b0 72%, #f0d078 100%)",
          boxShadow: "0 0 6px rgba(240,208,120,0.35)",
        }}
      />
    </span>
  );
}

function DailyHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="flex w-full max-w-[280px] items-center gap-2.5">
        <OrnamentLine side="left" />
        <h1 className="mae-gold-text shrink-0 font-sacred text-[1.55rem] font-bold leading-none tracking-wide">
          ไพ่ประจำวัน
        </h1>
        <OrnamentLine side="right" />
      </div>
      <p className="mt-2.5 text-[13px] font-medium tracking-wide text-white/88">
        {formatThaiDateFull()}
      </p>
    </header>
  );
}

function CardStack({
  faceSrc,
  faceAlt,
  upright,
  showBackPeek = true,
  interactive,
}: {
  faceSrc: string;
  faceAlt: string;
  upright: boolean;
  showBackPeek?: boolean;
  interactive?: ReactNode;
}) {
  return (
    <div className="relative mx-auto" style={{ width: "min(48vw,178px)" }}>
      {showBackPeek ? (
        <div
          className="absolute left-[14%] top-[-2%] z-0 w-full"
          style={{
            aspectRatio: "840 / 1440",
            transform: "rotate(7deg)",
          }}
          aria-hidden
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[12px] p-[2px] opacity-90"
            style={{
              background: GOLD_RING,
              boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[#0b1220]">
              <Image
                src="/images/tarot/card-back.webp?v=1"
                alt=""
                fill
                sizes={CARD_SIZES}
                unoptimized
                draggable={false}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn("relative z-10", CARD_WIDTH)}
        style={{ aspectRatio: "840 / 1440" }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[12px] p-[2.5px]"
          style={{
            background: GOLD_RING,
            boxShadow:
              "0 0 22px rgba(213,177,111,0.22), 0 14px 28px rgba(0,0,0,0.45)",
          }}
          data-slot="tarot-card-art"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[#f7f4ec]">
            <Image
              src={faceSrc}
              alt={faceAlt}
              fill
              sizes={CARD_SIZES}
              priority
              unoptimized
              draggable={false}
              className="object-cover"
              style={{
                transform: upright ? undefined : "rotate(180deg)",
              }}
            />
            {interactive}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardNameBlock({
  nameTh,
  nameEn,
  upright,
}: {
  nameTh: string;
  nameEn: string;
  upright: boolean;
}) {
  const thLine = upright ? nameTh : `${nameTh} • กลับหัว`;
  const enLine = upright
    ? nameEn.toUpperCase()
    : `${nameEn.toUpperCase()} • REVERSED`;

  return (
    <div className="mt-8 flex w-full flex-col items-center px-1">
      <div className="flex w-full max-w-[320px] items-center gap-2.5">
        <OrnamentLine side="left" />
        <h2 className="mae-gold-text shrink-0 text-center font-sacred text-[1.28rem] font-bold leading-tight tracking-wide">
          {thLine}
        </h2>
        <OrnamentLine side="right" />
      </div>
      <p className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
        {enLine}
      </p>
    </div>
  );
}

/** Daily tarot — layout matched to celestial reveal mock */
export function FortuneDailyTarot({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const { card, upright, brief } = drawTarotCard(
    `${seed}-tarot-${todayKey()}`
  );

  const openKey = `dooduang-tarot-open-${todayKey()}-${seed.slice(0, 24)}`;
  const [opened, setOpened] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [readyToDraw, setReadyToDraw] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const originRef = useRef({ x: 0, y: 0 });
  const openedByHoldRef = useRef(false);

  const mainLine = brief;
  const shortReading = card.deep;
  const doToday = card.affirmation;
  const watchOut = upright ? card.reversed : card.upright;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(openKey) === "1") {
        setOpened(true);
        setReadyToDraw(true);
      } else {
        setPrayerOpen(true);
      }
    } catch {
      setPrayerOpen(true);
    }
  }, [openKey]);

  const clearHold = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setHolding(false);
    setHoldProgress(0);
  }, []);

  const openCard = useCallback(() => {
    setOpened(true);
    clearHold();
    try {
      sessionStorage.setItem(openKey, "1");
    } catch {
      /* ignore */
    }
  }, [clearHold, openKey]);

  const startHold = (clientX: number, clientY: number) => {
    if (opened || !readyToDraw) return;
    openedByHoldRef.current = false;
    originRef.current = { x: clientX, y: clientY };
    setHolding(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / HOLD_MS);
      setHoldProgress(p);
      if (p < 1) rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    timerRef.current = window.setTimeout(() => {
      openedByHoldRef.current = true;
      openCard();
    }, HOLD_MS);
  };

  useEffect(() => () => clearHold(), [clearHold]);

  async function onSaveShare() {
    const text = [
      `${APP_NAME_PRIMARY} · ไพ่ประจำวัน`,
      formatThaiDateFull(),
      `${card.nameTh}${upright ? "" : " • กลับหัว"}`,
      card.nameEn.toUpperCase() + (upright ? "" : " • REVERSED"),
      "",
      mainLine,
      shortReading,
      "",
      `วันนี้ลองทำ: ${doToday}`,
      `สิ่งที่ควรระวัง: ${watchOut}`,
    ].join("\n");

    const result = await shareOrCopy("ไพ่ประจำวัน", text);
    if (result === "copied") {
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2200);
    } else if (result === "failed") {
      setShareStatus("failed");
      window.setTimeout(() => setShareStatus("idle"), 2200);
    }
  }

  return (
    <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
      <div className="relative mx-auto flex min-h-full w-full max-w-[390px] flex-col px-5 pb-12 pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <PageBackButton href="/menu" />
          <button
            type="button"
            onClick={() => void onSaveShare()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold tracking-wide outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            style={{
              background: "rgba(213,177,111,0.14)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.5)",
            }}
            aria-label="แชร์"
          >
            <Share2
              className="h-4 w-4 shrink-0 text-[#e8d19a]"
              strokeWidth={2}
              aria-hidden
            />
            <span className="mae-gold-text">
              {shareStatus === "copied"
                ? "คัดลอกแล้ว"
                : shareStatus === "failed"
                  ? "ไม่สำเร็จ"
                  : "แชร์"}
            </span>
          </button>
        </div>

        {!opened ? (
          <div className="mt-6 flex flex-1 flex-col items-center">
            <DailyHeader />
            <button
              type="button"
              aria-label="แตะเพื่อเปิดไพ่ประจำวัน"
              disabled={!readyToDraw}
              onClick={() => {
                if (!readyToDraw || openedByHoldRef.current) return;
                openCard();
              }}
              onPointerDown={(e) => {
                if (!readyToDraw || e.button !== 0) return;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* ignore */
                }
                startHold(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!holding) return;
                const dx = e.clientX - originRef.current.x;
                const dy = e.clientY - originRef.current.y;
                if (
                  dx * dx + dy * dy >
                  HOLD_MOVE_CANCEL_PX * HOLD_MOVE_CANCEL_PX
                ) {
                  clearHold();
                }
              }}
              onPointerUp={() => {
                const elapsed = performance.now() - startRef.current;
                const wasHolding = holding;
                clearHold();
                if (
                  readyToDraw &&
                  wasHolding &&
                  !openedByHoldRef.current &&
                  elapsed > 40 &&
                  elapsed < HOLD_MS
                ) {
                  openCard();
                }
              }}
              onPointerCancel={clearHold}
              onContextMenu={(e) => e.preventDefault()}
              className={cn(
                "no-tap relative mx-auto mt-10 select-none outline-none transition",
                holding && "scale-[0.985]",
                !readyToDraw && "pointer-events-none opacity-55"
              )}
              style={{ touchAction: "manipulation" }}
            >
              <CardStack
                faceSrc="/images/tarot/card-back.webp?v=1"
                faceAlt="หลังไพ่ทาโรต์"
                upright
                showBackPeek={false}
                interactive={
                  <>
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101827]/90 via-[#101827]/45 to-transparent px-3 pb-3 pt-8 text-center">
                      <span className="mae-gold-text block text-[12px] font-semibold tracking-wide">
                        {readyToDraw
                          ? holding
                            ? "กำลังเปิด…"
                            : "แตะเพื่อเปิด"
                          : "รอตั้งจิตก่อน"}
                      </span>
                    </span>
                    {holding ? (
                      <span
                        className="pointer-events-none absolute inset-x-4 bottom-2.5 h-1 overflow-hidden rounded-full"
                        style={{ background: "rgba(16,24,39,0.55)" }}
                        aria-hidden
                      >
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${holdProgress * 100}%`,
                            background:
                              "linear-gradient(90deg, #b8924f, #d5b16f, #e8d19a)",
                          }}
                        />
                      </span>
                    ) : null}
                  </>
                }
              />
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-1 flex-col items-center">
            <DailyHeader />

            <div className="mt-9 w-full">
              <CardStack
                faceSrc={tarotCardImageSrc(card)}
                faceAlt={`${card.nameEn} — ${card.nameTh}`}
                upright={upright}
              />
            </div>

            <CardNameBlock
              nameTh={card.nameTh}
              nameEn={card.nameEn}
              upright={upright}
            />

            <div
              className="mt-8 w-full rounded-[18px] px-4 py-4"
              style={{
                background: "rgba(6,10,18,0.48)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.2)",
              }}
            >
              <p className="mae-gold-text text-[14.5px] font-semibold leading-snug tracking-wide">
                {mainLine}
              </p>
              <p className="mt-2 text-[13px] leading-[1.65] text-white/72">
                {shortReading}
              </p>

              <div
                className="my-3.5 h-px"
                style={{ background: "rgba(213,177,111,0.2)" }}
              />

              <div className="space-y-3">
                <TipRow
                  icon={
                    <Sparkles
                      className="h-3.5 w-3.5 text-[#e8d19a]"
                      strokeWidth={2}
                    />
                  }
                  label="วันนี้ลองทำ"
                  body={doToday}
                />
                <TipRow
                  icon={
                    <Moon
                      className="h-3.5 w-3.5 text-[#e8d19a]"
                      strokeWidth={1.9}
                    />
                  }
                  label="สิ่งที่ควรระวัง"
                  body={watchOut}
                />
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

function TipRow({
  icon,
  label,
  body,
}: {
  icon: ReactNode;
  label: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-left">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "rgba(213,177,111,0.1)",
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
        }}
        aria-hidden
      >
        {icon}
      </span>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-white/80">
        <span className="mae-gold-text font-semibold">{label}: </span>
        {body}
      </p>
    </div>
  );
}
