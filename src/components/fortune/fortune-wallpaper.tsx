"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Lock, Sparkles } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const WALLPAPERS = [
  {
    id: "lotus-blessing",
    title: "บัวมงคล · แสงทอง",
    subtitle: "วอลเปเปอร์เสริมโชค ความสงบ และเสน่ห์",
    src: "/images/wallpaper/lotus-blessing.jpg",
    fileName: "dooduang-lotus-blessing.jpg",
  },
] as const;

/** Premium auspicious wallpaper gallery + download */
export function FortuneWallpaper({ className }: { className?: string }) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [activeId, setActiveId] = useState(WALLPAPERS[0].id);
  const [downloading, setDownloading] = useState(false);

  const active = WALLPAPERS.find((w) => w.id === activeId) ?? WALLPAPERS[0];

  useEffect(() => {
    setUnlocked(isPremiumUnlocked());
  }, []);

  function handlePaid() {
    setPremiumUnlocked();
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  async function downloadWallpaper() {
    if (!unlocked) {
      setPayOpen(true);
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(active.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = active.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(active.src, "_blank");
    } finally {
      setDownloading(false);
    }
  }

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
          <span
            className={cn(
              "justify-self-end rounded-full px-2.5 py-1 text-[10px] font-semibold",
              unlocked
                ? "bg-[#F4BC52]/22 text-[#8A6A12]"
                : "bg-[#B9A4F0]/28 text-[#5B45B8]"
            )}
          >
            {unlocked ? "พรีเมียม" : "ล็อกอยู่"}
          </span>
        </div>

        <header className="mt-5 text-center">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#A07E1A]">
            PREMIUM · WALLPAPER
          </p>
          <h1 className="mt-1.5 text-[1.65rem] font-bold tracking-tight text-[#241C4F]">
            วอลเปเปอร์มงคล
          </h1>
          <p className="mx-auto mt-2 max-w-[20rem] text-[13px] leading-relaxed text-[#5E5688]">
            ตั้งพื้นหลังโทรศัพท์เสริมสิริมงคล · โหลดได้เมื่อเป็นพรีเมียม
          </p>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-center">
          <div className="relative w-full max-w-[280px]">
            {/* Phone preview frame */}
            <div
              className="relative mx-auto overflow-hidden rounded-[28px] border-[3px] border-[#C9A227]/85 bg-[#2C2458] shadow-[0_20px_48px_rgba(80,60,140,0.28)]"
              style={{ aspectRatio: "9 / 19" }}
            >
              <Image
                src={active.src}
                alt={active.title}
                fill
                unoptimized
                className="object-cover object-center"
                sizes="280px"
                priority
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-10"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(36,28,79,0.35), transparent)",
                }}
                aria-hidden
              />
            </div>

            {/* Floating download CTA */}
            <button
              type="button"
              onClick={() => void downloadWallpaper()}
              disabled={downloading}
              aria-label={
                unlocked ? "ดาวน์โหลดวอลเปเปอร์" : "ปลดล็อกพรีเมียมเพื่อดาวน์โหลด"
              }
              className="absolute -bottom-3 -right-2 z-[2] flex h-[72px] w-[72px] items-center justify-center rounded-full outline-none transition active:scale-[0.96] disabled:opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, #F8F4FF 0%, #E8DEFF 55%, #D4C4F5 100%)",
                boxShadow: [
                  "0 0 0 4px rgba(201,162,39,0.92)",
                  "0 14px 28px rgba(106,72,200,0.28)",
                  "inset 0 1px 0 rgba(255,255,255,0.85)",
                ].join(", "),
              }}
            >
              {unlocked ? (
                <Download className="h-7 w-7 text-[#3A2F6B]" strokeWidth={2.2} />
              ) : (
                <Lock className="h-7 w-7 text-[#3A2F6B]" strokeWidth={2.2} />
              )}
            </button>
          </div>

          <div className="fortune-glass mt-8 w-full rounded-[20px] px-4 py-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#A07E1A]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              <p className="text-[11px] font-semibold tracking-[0.14em]">
                {active.title}
              </p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5E5688]">
              {active.subtitle}
            </p>

            {!unlocked ? (
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="no-sky-lift mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-semibold text-white outline-none transition active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 52%, #B29AEF 100%)",
                  boxShadow:
                    "0 12px 28px rgba(106,72,200,0.34), inset 0 1px 0 rgba(255,255,255,0.35)",
                }}
              >
                <Lock className="h-4 w-4" strokeWidth={2} />
                ปลดล็อกพรีเมียม · โหลดได้ · {FORTUNE_UNLOCK_PRICE} บาท
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void downloadWallpaper()}
                disabled={downloading}
                className="no-sky-lift mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3.5 text-[15px] font-semibold text-[#3A2F6B] shadow-[0_8px_22px_rgba(110,79,201,0.16)] outline-none transition active:scale-[0.99] disabled:opacity-70"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดวอลเปเปอร์"}
              </button>
            )}
          </div>

          {WALLPAPERS.length > 1 ? (
            <div className="mt-4 flex gap-2">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setActiveId(w.id)}
                  className={cn(
                    "h-14 w-10 overflow-hidden rounded-[10px] outline-none ring-2 transition",
                    activeId === w.id
                      ? "ring-[#C9A227]"
                      : "ring-transparent opacity-70"
                  )}
                >
                  <Image
                    src={w.src}
                    alt=""
                    width={40}
                    height={56}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <FortunePaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onPaid={handlePaid}
        returnPath="/reading/wallpaper"
      />
    </div>
  );
}
