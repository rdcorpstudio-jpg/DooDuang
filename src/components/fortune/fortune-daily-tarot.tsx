"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Sparkles, Star } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { TarotPrayerSheet } from "@/components/fortune/tarot-prayer-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { drawTarotCard, TAROT_DECK_COUNT } from "@/lib/fortune/tarot-deck";
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

const HOLD_MS = 650;
const UNLOCK_KEY = "dooduang-tarot-unlocked";

const cardShell =
  "relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[22px] px-4 py-5";

/** Daily tarot — light lilac Guanyin UI */
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

  useEffect(() => {
    try {
      if (sessionStorage.getItem(openKey) === "1") {
        setOpened(true);
        setReadyToDraw(true);
      } else {
        setPrayerOpen(true);
      }
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
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

  const startHold = () => {
    if (opened) return;
    setHolding(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / HOLD_MS);
      setHoldProgress(p);
      if (p < 1) rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    timerRef.current = window.setTimeout(() => {
      openCard();
    }, HOLD_MS);
  };

  useEffect(() => () => clearHold(), [clearHold]);

  function handlePaid() {
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  return (
    <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
      <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            กลับ
          </button>
          <div className="flex flex-col items-center justify-self-center">
            <FortuneIcon name="moon" size={16} className="-mb-0.5" />
            <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">
              DOODUANG
            </p>
          </div>
          <p className="justify-self-end text-right text-[11px] text-[#8A82B0]">
            1 ใบ / วัน
          </p>
        </div>

        <header className="mt-5 text-center">
          <h1 className="text-[1.85rem] font-bold tracking-tight text-[#241C4F]">
            ไพ่รายวัน
          </h1>
          <p className="mt-1 text-[14px] text-[#5E5688]">{formatThaiDate()}</p>
          <p className="mx-auto mt-2 max-w-[20rem] text-[12px] leading-relaxed text-[#6B6490]">
            สำรับทาโรต์ {TAROT_DECK_COUNT} ใบ · สุ่ม 1 ใบต่อวัน
          </p>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-center">
          {!opened ? (
            <button
              type="button"
              aria-label="แตะค้างไว้เพื่อเปิดไพ่รายวัน"
              disabled={!readyToDraw}
              onPointerDown={(e) => {
                if (!readyToDraw || e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                startHold();
              }}
              onPointerUp={clearHold}
              onPointerCancel={clearHold}
              onContextMenu={(e) => e.preventDefault()}
              className={cn(
                "relative mx-auto w-[min(70vw,240px)] select-none outline-none",
                !readyToDraw && "pointer-events-none opacity-55"
              )}
              style={{ aspectRatio: "2 / 3.2", touchAction: "none" }}
            >
              <span
                className={cn(
                  cardShell,
                  "fortune-glass border border-white/80 transition",
                  holding && "scale-[0.98]"
                )}
              >
                <span className="text-center">
                  <span className="block text-[15px] font-semibold text-[#241C4F]">
                    {readyToDraw ? "แตะค้างไว้" : "รอตั้งจิตก่อน"}
                  </span>
                  <span className="mt-1 block text-[12px] text-[#6B6490]">
                    {readyToDraw
                      ? "เพื่อเปิดไพ่รายวันของคุณ"
                      : "หลับตาอธิษฐานสักครู่"}
                  </span>
                </span>

                <span className="relative flex h-28 w-28 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-[#9B7FE8]/35" />
                  <span className="absolute inset-3 rounded-full border border-dashed border-[#9B7FE8]/28" />
                  <Sparkles
                    className="h-10 w-10 text-[#7B5FD4]"
                    strokeWidth={1.4}
                  />
                </span>

                <span className="flex w-full items-center justify-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[#9B7FE8]"
                      style={{ opacity: 0.35 + i * 0.12 }}
                    />
                  ))}
                </span>

                {holding ? (
                  <span
                    className="pointer-events-none absolute inset-x-4 bottom-3 h-1 overflow-hidden rounded-full bg-[#9B7FE8]/2"
                    aria-hidden
                  >
                    <span
                      className="block h-full rounded-full bg-[#7B5FD4]"
                      style={{ width: `${holdProgress * 100}%` }}
                    />
                  </span>
                ) : null}
              </span>
            </button>
          ) : (
            <div className="flex w-full flex-col items-center pb-4">
              <div
                className="relative mx-auto w-[min(70vw,240px)] overflow-hidden rounded-[22px] border border-white/80 bg-[#2C2458]"
                style={{ aspectRatio: "2 / 3.2" }}
                data-slot="tarot-card-art"
              >
                <div className="flex h-full flex-col items-center justify-between px-4 py-5 text-center">
                  <p className="text-[11px] tracking-[0.2em] text-white/55">
                    {card.label}
                  </p>
                  <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <span
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F4BC52]/15"
                      style={{
                        transform: upright ? undefined : "rotate(180deg)",
                      }}
                    >
                      <Star
                        className="h-12 w-12 text-[#F4BC52]"
                        strokeWidth={1.4}
                        fill="rgba(244,188,82,0.25)"
                      />
                    </span>
                    <p className="text-[13px] font-semibold tracking-wide text-white">
                      {card.nameEn}
                    </p>
                    <p className="text-[10px] tracking-wide text-white/45">
                      {card.arcana === "minor" && card.suit
                        ? "Minor Arcana"
                        : "Major Arcana"}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/50">{card.nameTh}</p>
                </div>
              </div>

              <div className="mt-5 text-center">
                <h2 className="text-[1.4rem] font-bold text-[#241C4F]">
                  {card.nameTh}
                </h2>
                <p className="mt-1 text-[13px] text-[#6B6490]">
                  {upright ? "ปกติ (Upright)" : "กลับหัว (Reversed)"}
                </p>
                <p className="mx-auto mt-3 max-w-[22rem] text-[14px] leading-[1.7] text-[#3A3270]">
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

              <div className="fortune-glass mt-3 w-full overflow-hidden rounded-[18px]">
                {unlocked ? (
                  <div className="px-3.5 py-3.5">
                    <p className="text-[12px] font-semibold text-[#5B45B8]">
                      ความหมายเชิงลึก
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#3A3270]">
                      {upright ? card.deep : `${card.reversed} — ${card.deep}`}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    className="no-sky-lift flex w-full items-center gap-3 px-3.5 py-3.5 text-left outline-none transition active:opacity-80"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/2 ring-1 ring-[#F4BC52]/4">
                      <Lock
                        className="h-4 w-4 text-[#B8921F]"
                        strokeWidth={1.9}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[#241C4F]">
                        ปลดล็อกดูรายละเอียดเต็ม
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-[#6B6490]">
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
      className="fortune-glass relative overflow-hidden rounded-[16px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/35"
    >
      <p className="flex items-center gap-1 text-[12px] font-semibold text-[#B8921F]">
        <Star className="h-3 w-3" strokeWidth={2} fill="currentColor" />
        {title}
      </p>
      {unlocked ? (
        <p className="mt-2 text-[12px] leading-snug text-[#3A3270]">{preview}</p>
      ) : (
        <>
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-[#9A90C0] blur-[2px]">
            {preview}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#B8921F]">
            <Lock className="h-3 w-3" strokeWidth={2} />
            พรีเมียม
          </span>
        </>
      )}
    </button>
  );
}
