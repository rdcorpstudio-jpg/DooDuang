"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Star } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { TarotPrayerSheet } from "@/components/fortune/tarot-prayer-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  drawTarotCard,
  tarotCardImageSrc,
  TAROT_DECK_COUNT,
} from "@/lib/fortune/tarot-deck";
import {
  requirePremiumFromServer,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatThaiDate(d = new Date()) {
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "long",
  });
}

const HOLD_MS = 450;
const HOLD_MOVE_CANCEL_PX = 14;

/** Daily tarot — Mae navy–gold */
export function FortuneDailyTarot({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const router = useRouter();
  const { card, upright, brief } = drawTarotCard(
    `${seed}-tarot-${todayKey()}`
  );

  const openKey = `dooduang-tarot-open-${todayKey()}-${seed.slice(0, 24)}`;
  const [opened, setOpened] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [readyToDraw, setReadyToDraw] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const originRef = useRef({ x: 0, y: 0 });
  const openedByHoldRef = useRef(false);

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

  useEffect(() => {
    let cancelled = false;

    async function syncPremium() {
      const access = await requirePremiumFromServer();
      if (!cancelled) setUnlocked(access.ok);
    }

    void syncPremium();
    const onChange = () => {
      void syncPremium();
    };
    window.addEventListener("dooduang-premium-changed", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("dooduang-premium-changed", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, []);

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

  function handlePaid() {
    setPremiumUnlocked();
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  return (
    <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
      <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <PageBackButton
            onClick={() => router.back()}
            className="justify-self-start"
          />
          <div className="flex flex-col items-center justify-self-center" aria-hidden />

          <p className="justify-self-end text-right text-[11px] tracking-wide text-[#e8d19a]/75">
            1 ใบ / วัน
          </p>
        </div>

        <header className="mt-6 text-center">
          <h1
            className="mae-gold-text font-sans text-[1.85rem] font-bold tracking-[0.04em]"
            style={{
              filter:
                "drop-shadow(0 1px 1px rgba(0,0,0,0.85)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
            }}
          >
            ไพ่รายวัน
          </h1>
          <p className="mt-1.5 text-[14px] tracking-wide text-[#e8d19a]/90">
            {formatThaiDate()}
          </p>
          <p className="mx-auto mt-2 max-w-[20rem] text-[12.5px] leading-relaxed text-[#c5cdd9]/70">
            สำรับทาโรต์ {TAROT_DECK_COUNT} ใบ · สุ่ม 1 ใบต่อวัน
          </p>
        </header>

        <div className="mt-7 flex flex-1 flex-col items-center">
          {!opened ? (
            <button
              type="button"
              aria-label="แตะเพื่อเปิดไพ่รายวัน"
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
                if (dx * dx + dy * dy > HOLD_MOVE_CANCEL_PX * HOLD_MOVE_CANCEL_PX) {
                  clearHold();
                }
              }}
              onPointerUp={() => {
                const elapsed = performance.now() - startRef.current;
                const wasHolding = holding;
                clearHold();
                // Short press counts as tap — more reliable than click after capture
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
                "no-tap relative mx-auto w-[min(72vw,248px)] select-none outline-none transition",
                holding && "scale-[0.985]",
                !readyToDraw && "pointer-events-none opacity-55"
              )}
              style={{ aspectRatio: "840 / 1440", touchAction: "manipulation" }}
            >
              <span
                className="relative block h-full w-full overflow-hidden rounded-[16px] p-[3px] shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
                style={{
                  background:
                    "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
                }}
              >
                <span className="relative block h-full w-full overflow-hidden rounded-[13px] bg-[#0b1220]">
                  <Image
                    src="/images/tarot/card-back.webp?v=1"
                    alt="หลังไพ่ทาโรต์"
                    fill
                    sizes="248px"
                    priority
                    unoptimized
                    draggable={false}
                    className="pointer-events-none object-cover"
                  />

                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101827]/90 via-[#101827]/45 to-transparent px-4 pb-4 pt-10 text-center"
                    aria-hidden={!readyToDraw}
                  >
                    <span className="mae-gold-text block text-[13px] font-semibold tracking-wide">
                      {readyToDraw
                        ? holding
                          ? "กำลังเปิด…"
                          : "แตะเพื่อเปิด"
                        : "รอตั้งจิตก่อน"}
                    </span>
                  </span>

                  {holding ? (
                    <span
                      className="pointer-events-none absolute inset-x-5 bottom-3.5 h-1.5 overflow-hidden rounded-full"
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
                </span>
              </span>
            </button>
          ) : (
            <div className="flex w-full flex-col items-center pb-4">
              <div
                className="relative mx-auto w-[min(72vw,248px)] overflow-hidden rounded-[16px] p-[3px] shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
                style={{
                  aspectRatio: "840 / 1440",
                  background:
                    "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)",
                }}
                data-slot="tarot-card-art"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[13px] bg-[#f7f4ec]">
                  <Image
                    src={tarotCardImageSrc(card)}
                    alt={`${card.nameEn} — ${card.nameTh}`}
                    fill
                    sizes="248px"
                    priority
                    unoptimized
                    className="object-cover"
                    style={{
                      transform: upright ? undefined : "rotate(180deg)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h2
                  className="mae-gold-text text-[1.4rem] font-bold tracking-wide"
                  style={{
                    filter:
                      "drop-shadow(0 1px 1px rgba(0,0,0,0.85)) drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                  }}
                >
                  {card.nameTh}
                </h2>
                <p className="mt-1 text-[13px] text-[#e8d19a]/85">
                  {upright ? "ปกติ (Upright)" : "กลับหัว (Reversed)"}
                </p>
                <p className="mx-auto mt-3 max-w-[22rem] text-[14px] leading-[1.7] text-[#c5cdd9]/80">
                  {brief}
                </p>
              </div>

              <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
                <LockedTile
                  title="คำยืนยัน"
                  unlocked={unlocked}
                  preview={card.affirmation}
                  onUnlock={() => setPayOpen(true)}
                />
                <LockedTile
                  title="การสะท้อน"
                  unlocked={unlocked}
                  preview={card.reflection}
                  onUnlock={() => setPayOpen(true)}
                />
              </div>

              <div className="mae-aspect-card mt-3 w-full overflow-hidden rounded-[18px]">
                {unlocked ? (
                  <div className="px-3.5 py-3.5">
                    <p className="mae-aspect-title text-[12px] font-semibold">
                      ความหมายเชิงลึก
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#c5cdd9]/80">
                      {upright ? card.deep : `${card.reversed} — ${card.deep}`}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    className="no-sky-lift flex w-full items-center gap-3 px-3.5 py-3.5 text-left outline-none transition active:opacity-80"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(213,177,111,0.14)",
                        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
                      }}
                    >
                      <Lock
                        className="h-4 w-4 text-[#d5b16f]"
                        strokeWidth={1.9}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[#f7f4ec]">
                        ปลดล็อกดูรายละเอียดเต็ม
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-[#c5cdd9]/65">
                        ความหมายเชิงลึก คำยืนยัน และการสะท้อน ·{" "}
                        {FORTUNE_UNLOCK_PRICE} บาท
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <TarotPrayerSheet
        open={prayerOpen}
        onReady={() => {
          setPrayerOpen(false);
          setReadyToDraw(true);
        }}
      />

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/reading/tarot"
      />
    </div>
  );
}

function LockedTile({
  title,
  unlocked,
  preview,
  onUnlock,
}: {
  title: string;
  unlocked: boolean;
  preview: string;
  onUnlock?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!unlocked) onUnlock?.();
      }}
      className="mae-aspect-card relative overflow-hidden rounded-[16px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
    >
      <p className="mae-aspect-title flex items-center gap-1 text-[12px] font-semibold">
        <Star className="h-3 w-3 text-[#d5b16f]" strokeWidth={2} fill="currentColor" />
        {title}
      </p>
      {unlocked ? (
        <p className="mt-2 text-[12px] leading-snug text-[#c5cdd9]/80">
          {preview}
        </p>
      ) : (
        <>
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-[#c5cdd9]/45 blur-[2px]">
            {preview}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#d5b16f]">
            <Lock className="h-3 w-3" strokeWidth={2} />
            พรีเมียม
          </span>
        </>
      )}
    </button>
  );
}
