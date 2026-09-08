"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Sparkles, Star } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
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

/** Daily tarot page content — long-press opens one card; deep reading is premium */
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
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(openKey) === "1") setOpened(true);
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
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
    <div className={cn("relative h-full overflow-y-auto", className)}>
      <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[12px] text-white/75 outline-none transition hover:bg-white/[0.1]"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
            กลับ
          </button>
          <p className="text-[11px] text-white/35">เปิดได้ 1 ใบ / วัน</p>
        </div>

        <header className="mt-5 text-center">
          <h1 className="font-sacred text-[2rem] font-normal tracking-wide text-[#F7F8FF]">
            ไพ่รายวัน
          </h1>
          <p className="mt-1 text-[14px] text-white/50">{formatThaiDate()}</p>
          <p className="mx-auto mt-2 max-w-[20rem] text-[12px] leading-relaxed text-white/40">
            สำรับทาโรต์ {TAROT_DECK_COUNT} ใบ · สุ่ม 1 ใบต่อวัน
          </p>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-center">
          {!opened ? (
            <button
              type="button"
              aria-label="แตะค้างไว้เพื่อเปิดไพ่รายวัน"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                startHold();
              }}
              onPointerUp={clearHold}
              onPointerCancel={clearHold}
              onContextMenu={(e) => e.preventDefault()}
              className="relative w-[min(70vw,240px)] select-none outline-none"
              style={{ aspectRatio: "2 / 3.2", touchAction: "none" }}
            >
              <span
                className="absolute -inset-3 rounded-[28px] opacity-70 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(70,221,237,0.35), transparent 70%)",
                }}
                aria-hidden
              />
              <span
                className={cn(
                  "relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[22px] border border-[#7dd3fc]/45 px-4 py-5 transition",
                  holding && "scale-[0.98]"
                )}
                style={{
                  background:
                    "linear-gradient(165deg, #1a3a6a 0%, #12284a 45%, #0c1a33 100%)",
                  boxShadow:
                    "0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <span className="text-center">
                  <span className="block text-[15px] font-semibold text-white">
                    แตะค้างไว้
                  </span>
                  <span className="mt-1 block text-[12px] text-white/55">
                    เพื่อเปิดไพ่รายวันของคุณ
                  </span>
                </span>

                <span className="relative flex h-28 w-28 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-white/20" />
                  <span className="absolute inset-3 rounded-full border border-dashed border-white/25" />
                  <Sparkles className="h-10 w-10 text-white/80" strokeWidth={1.4} />
                </span>

                <span className="flex w-full items-center justify-center gap-2 opacity-40">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      style={{ opacity: 0.35 + i * 0.12 }}
                    />
                  ))}
                </span>

                {holding ? (
                  <span
                    className="pointer-events-none absolute inset-x-4 bottom-3 h-1 overflow-hidden rounded-full bg-white/15"
                    aria-hidden
                  >
                    <span
                      className="block h-full rounded-full bg-[#7dd3fc]"
                      style={{ width: `${holdProgress * 100}%` }}
                    />
                  </span>
                ) : null}
              </span>
            </button>
          ) : (
            <div className="flex w-full flex-col items-center pb-4">
              <div
                className="daily-card-slide-next relative w-[min(70vw,240px)] overflow-hidden rounded-[18px] border border-white/20"
                style={{
                  aspectRatio: "2 / 3.2",
                  background:
                    "linear-gradient(165deg, #243b6b 0%, #1a2d52 50%, #121f3d 100%)",
                  boxShadow:
                    "0 20px 44px rgba(0,0,0,0.4), 0 0 0 1px rgba(125,211,252,0.25)",
                }}
                data-slot="tarot-card-art"
              >
                <div className="flex h-full flex-col items-center justify-between px-4 py-5 text-center">
                  <p className="text-[11px] tracking-[0.2em] text-white/45">
                    {card.label}
                  </p>
                  <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <span
                      className="flex h-24 w-24 items-center justify-center rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(244,188,82,0.25), transparent 70%)",
                        transform: upright ? undefined : "rotate(180deg)",
                      }}
                    >
                      <Star
                        className="h-12 w-12 text-[#F4BC52]"
                        strokeWidth={1.4}
                        fill="rgba(244,188,82,0.25)"
                      />
                    </span>
                    <p className="text-[13px] font-semibold tracking-wide text-white/90">
                      {card.nameEn}
                    </p>
                    {card.arcana === "minor" && card.suit ? (
                      <p className="text-[10px] tracking-wide text-white/35">
                        Minor Arcana
                      </p>
                    ) : (
                      <p className="text-[10px] tracking-wide text-white/35">
                        Major Arcana
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40">{card.nameTh}</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-[22px] font-semibold text-white">
                  {card.nameTh}
                </h2>
                <p className="mt-1 text-[13px] text-white/45">
                  {upright ? "ปกติ (Upright)" : "กลับหัว (Reversed)"}
                </p>
                <p className="mx-auto mt-3 max-w-[22rem] text-[14px] leading-[1.7] text-white/75">
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
                    <p className="text-[12px] font-semibold text-[#BB6CF0]">
                      ความหมายเชิงลึก
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.7] text-white/75">
                      {upright ? card.deep : `${card.reversed} — ${card.deep}`}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left outline-none transition hover:bg-white/[0.03]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/45">
                      <Lock className="h-4 w-4 text-[#F4BC52]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-white">
                        ปลดล็อกดูรายละเอียดเต็ม
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-white/45">
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
      className="fortune-glass relative overflow-hidden rounded-[16px] px-3 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white/25"
    >
      <p className="flex items-center gap-1 text-[12px] font-semibold text-[#F4BC52]">
        <Star className="h-3 w-3" strokeWidth={2} fill="currentColor" />
        {title}
      </p>
      {unlocked ? (
        <p className="mt-2 text-[12px] leading-snug text-white/70">{preview}</p>
      ) : (
        <>
          <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-white/35 blur-[2px]">
            {preview}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[#F4BC52]/90">
            <Lock className="h-3 w-3" strokeWidth={2} />
            พรีเมียม
          </span>
        </>
      )}
    </button>
  );
}
