"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Lock, Sparkles, Star } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  assignPremiumWallpaperIfNeeded,
  getPremiumWallpaperTeaser,
  type PremiumWallpaper,
} from "@/lib/fortune/premium-wallpaper";
import {
  isPremiumUnlocked,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const LOAD_MS = 3200;

type Phase = "pray" | "loading" | "reveal";

const LOAD_LINES = [
  "กำลังตั้งจิต…",
  "สุ่มวอลเปเปอร์มงคลให้คุณ…",
  "กำลังเปิดของขวัญพรีเมียม…",
] as const;

/** Premium wallpaper — 1 random HQ file per premium subscription */
export function FortuneWallpaper({ className }: { className?: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pray");
  const [loadLine, setLoadLine] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState<PremiumWallpaper>(
    getPremiumWallpaperTeaser()
  );
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const ok = isPremiumUnlocked();
    setUnlocked(ok);
    if (ok) {
      setWallpaper(assignPremiumWallpaperIfNeeded());
    } else {
      setWallpaper(getPremiumWallpaperTeaser());
    }
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;

    setLoadLine(0);
    const lineTimers = [
      window.setTimeout(() => setLoadLine(1), 900),
      window.setTimeout(() => setLoadLine(2), 1900),
    ];
    const done = window.setTimeout(() => setPhase("reveal"), LOAD_MS);

    return () => {
      lineTimers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(done);
    };
  }, [phase]);

  function handlePaid() {
    setPremiumUnlocked();
    setUnlocked(true);
    setWallpaper(assignPremiumWallpaperIfNeeded());
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
      // Full original file — no recompression / Next Image transform
      const res = await fetch(wallpaper.src, { cache: "no-store" });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = wallpaper.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open original asset URL directly
      window.open(wallpaper.src, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={cn("sky-copy relative h-full overflow-hidden", className)}>
      <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col px-4 pb-3 pt-2.5">
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            กลับ
          </button>
          <div className="flex flex-col items-center justify-self-center">
            <FortuneIcon name="moon" size={14} className="-mb-0.5" />
            <p className="font-sacred text-[11px] tracking-[0.26em] text-[#C9A227]">
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

        {phase === "pray" ? (
          <PrayStep onPray={() => setPhase("loading")} />
        ) : null}

        {phase === "loading" ? (
          <LoadingStep line={LOAD_LINES[loadLine] ?? LOAD_LINES[0]} />
        ) : null}

        {phase === "reveal" ? (
          <RevealStep
            wallpaper={wallpaper}
            unlocked={unlocked}
            downloading={downloading}
            onDownload={() => void downloadWallpaper()}
            onUnlock={() => setPayOpen(true)}
          />
        ) : null}
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

function PrayStep({ onPray }: { onPray: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 pb-2 text-center">
      <div className="wallpaper-pray-breathe relative mx-auto flex h-[120px] w-[120px] items-center justify-center">
        <span className="wallpaper-pray-ring absolute inset-0 rounded-full" aria-hidden />
        <span
          className="wallpaper-pray-ring wallpaper-pray-ring-delay absolute inset-3 rounded-full"
          aria-hidden
        />
        <span
          className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.98), rgba(210,198,250,0.72) 55%, rgba(155,127,232,0.45))",
            boxShadow:
              "0 14px 32px rgba(110,79,201,0.24), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <Sparkles className="h-9 w-9 text-[#7B5FD4]" strokeWidth={1.35} />
        </span>
      </div>

      <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-[#A07E1A]">
        ของขวัญพรีเมียม
      </p>
      <h1 className="mt-1.5 text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
        หลับตาอธิษฐาน
      </h1>
      <p className="mx-auto mt-2 max-w-[18rem] text-[14px] leading-relaxed text-[#5E5688]">
        สมัครพรีเมียม 1 ครั้ง ได้วอลเปเปอร์มงคลสุ่ม 1 รูป
        โหลดคุณภาพเต็มไฟล์ได้เฉพาะคุณ
      </p>

      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#8A82B0]">
        <span className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#9B7FE8]" />
        หายใจเข้าลึก ๆ
        <span className="text-[#C8B8F0]">·</span>
        หายใจออกช้า ๆ
      </div>

      <button
        type="button"
        onClick={onPray}
        className="no-sky-lift mt-7 inline-flex h-[3.35rem] w-full max-w-[320px] items-center justify-center gap-2 rounded-full text-[17px] font-bold text-white outline-none transition active:scale-[0.99]"
        style={{
          background:
            "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 50%, #B29AEF 100%)",
          boxShadow:
            "0 14px 32px rgba(106,72,200,0.36), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        <Sparkles className="h-5 w-5" strokeWidth={2} />
        กดอธิษฐาน
      </button>
    </div>
  );
}

function LoadingStep({ line }: { line: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <span className="wallpaper-load-spin absolute inset-0 rounded-full border-2 border-[#C8B8F0]/35 border-t-[#7B5FD4]" />
        <span className="wallpaper-load-spin-rev absolute inset-3 rounded-full border border-dashed border-[#C9A227]/55" />
        <span
          className="wallpaper-pray-breathe relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 30%, #FFF8E8, #EDE4FF 60%, #D4C4F5)",
            boxShadow: "0 12px 28px rgba(110,79,201,0.22)",
          }}
        >
          <Star
            className="h-8 w-8 text-[#C9A227]"
            strokeWidth={1.4}
            fill="rgba(201,162,39,0.35)"
          />
        </span>
        <span
          className="wallpaper-load-spark pointer-events-none absolute left-2 top-6 h-1.5 w-1.5 rounded-full bg-[#F4BC52]"
          aria-hidden
        />
        <span
          className="wallpaper-load-spark pointer-events-none absolute bottom-8 right-3 h-1 w-1 rounded-full bg-[#9B7FE8]"
          style={{ animationDelay: "0.7s" }}
          aria-hidden
        />
      </div>

      <p
        key={line}
        className="wallpaper-load-text mt-6 text-[17px] font-semibold text-[#241C4F]"
      >
        {line}
      </p>
      <p className="mt-2 text-[13px] text-[#8A82B0]">โปรดรอสักครู่…</p>

      <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-[#9B7FE8]/20">
        <div className="wallpaper-load-bar h-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#C9A227]" />
      </div>
    </div>
  );
}

function RevealStep({
  wallpaper,
  unlocked,
  downloading,
  onDownload,
  onUnlock,
}: {
  wallpaper: PremiumWallpaper;
  unlocked: boolean;
  downloading: boolean;
  onDownload: () => void;
  onUnlock: () => void;
}) {
  return (
    <div className="wallpaper-reveal flex min-h-0 flex-1 flex-col">
      <header className="mt-2 shrink-0 text-center">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#A07E1A]">
          PREMIUM · 1 รูป / การสมัคร
        </p>
        <h1 className="mt-0.5 text-[1.35rem] font-bold tracking-tight text-[#241C4F]">
          วอลเปเปอร์มงคลของคุณ
        </h1>
        <p className="mx-auto mt-1 max-w-[22rem] text-[12px] leading-snug text-[#5E5688]">
          สุ่มมอบให้เฉพาะบัญชีพรีเมียม · โหลดไฟล์ต้นฉบับคุณภาพเต็ม
        </p>
      </header>

      <div className="relative mt-2 flex min-h-0 flex-1 items-center justify-center">
        <div
          className="relative max-h-full overflow-visible"
          style={{
            height: "100%",
            aspectRatio: "9 / 16",
            maxWidth: "min(100%, 230px)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[22px] border-[3px] border-[#C9A227]/85 bg-[#2C2458] shadow-[0_14px_36px_rgba(80,60,140,0.26)]">
            <Image
              src={wallpaper.src}
              alt={wallpaper.title}
              fill
              unoptimized
              className={cn(
                "object-cover object-center",
                !unlocked && "blur-[6px] scale-105"
              )}
              sizes="210px"
              priority
            />
            {!unlocked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#241C4F]/28">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#5C4810]">
                  <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
                  พรีเมียมเท่านั้น
                </span>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            aria-label={
              unlocked
                ? "ดาวน์โหลดวอลเปเปอร์คุณภาพเต็ม"
                : "ปลดล็อกพรีเมียมเพื่อดาวน์โหลด"
            }
            className="absolute -bottom-1 -right-2 z-[2] flex h-14 w-14 items-center justify-center rounded-full outline-none transition active:scale-[0.96] disabled:opacity-70"
            style={{
              background:
                "radial-gradient(circle at 35% 28%, #F8F4FF 0%, #E8DEFF 55%, #D4C4F5 100%)",
              boxShadow: [
                "0 0 0 3px rgba(201,162,39,0.92)",
                "0 10px 22px rgba(106,72,200,0.28)",
                "inset 0 1px 0 rgba(255,255,255,0.85)",
              ].join(", "),
            }}
          >
            {unlocked ? (
              <Download className="h-6 w-6 text-[#3A2F6B]" strokeWidth={2.2} />
            ) : (
              <Lock className="h-6 w-6 text-[#3A2F6B]" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      <div className="fortune-glass mt-2.5 w-full shrink-0 rounded-[18px] px-3.5 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#A07E1A]">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          <p className="text-[12px] font-semibold tracking-[0.12em]">
            {unlocked ? wallpaper.title : "วอลเปเปอร์มงคล · พรีเมียม"}
          </p>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-[#5E5688]">
          {unlocked
            ? wallpaper.subtitle
            : "ปลดล็อกแล้วระบบจะสุ่มมอบ 1 รูปให้คุณโหลดคุณภาพเต็ม"}
        </p>

        {!unlocked ? (
          <button
            type="button"
            onClick={onUnlock}
            className="no-sky-lift mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-[14px] font-semibold text-white outline-none transition active:scale-[0.99]"
            style={{
              background:
                "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 52%, #B29AEF 100%)",
              boxShadow:
                "0 10px 22px rgba(106,72,200,0.3), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            <Lock className="h-4 w-4 shrink-0" strokeWidth={2} />
            ปลดล็อก · รับวอลเปเปอร์ · {FORTUNE_UNLOCK_PRICE} บาท
          </button>
        ) : (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="no-sky-lift mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-[14px] font-semibold text-[#3A2F6B] shadow-[0_8px_18px_rgba(110,79,201,0.14)] outline-none transition active:scale-[0.99] disabled:opacity-70"
          >
            <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
            {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดคุณภาพเต็ม"}
          </button>
        )}
      </div>
    </div>
  );
}
