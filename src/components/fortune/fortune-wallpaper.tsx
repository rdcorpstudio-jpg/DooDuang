"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Lock } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  assignPremiumWallpaperIfNeeded,
  getPremiumWallpaperTeaser,
  type PremiumWallpaper,
} from "@/lib/fortune/premium-wallpaper";
import {
  requirePremiumFromServer,
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
    let cancelled = false;
    void (async () => {
      const access = await requirePremiumFromServer();
      if (cancelled) return;
      setUnlocked(access.ok);
      if (access.ok) {
        setWallpaper(assignPremiumWallpaperIfNeeded());
      } else {
        setWallpaper(getPremiumWallpaperTeaser());
      }
    })();
    return () => {
      cancelled = true;
    };
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
    <div className={cn("no-sky-lift relative h-full overflow-hidden", className)}>
      <div className="relative mx-auto flex h-full w-full max-w-[480px] flex-col px-4 pb-3 pt-2.5">
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <PageBackButton
            onClick={() => router.back()}
            className="justify-self-start"
          />
          <div className="flex flex-col items-center justify-self-center" aria-hidden />

          <span
            className={cn(
              "justify-self-end rounded-full px-2.5 py-1 text-[10px] font-semibold",
              unlocked ? "text-[#e8d19a]" : "text-[#f7f4ec]/70"
            )}
            style={{
              background: unlocked
                ? "rgba(213,177,111,0.16)"
                : "rgba(213,177,111,0.08)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
            }}
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
              "radial-gradient(circle at 35% 28%, #fff8e4 0%, #e8d19a 42%, #d5b16f 78%, #b8924f 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 28px rgba(0,0,0,0.28)",
          }}
        >
          <FortuneIcon name="sparkle" size={34} plain />
        </span>
      </div>

      <p className="mae-gold-text mt-5 text-[11px] font-semibold tracking-[0.18em]">
        ของขวัญพรีเมียม
      </p>
      <h1 className="mae-gold-text mt-1.5 text-[1.55rem] font-bold tracking-tight">
        หลับตาอธิษฐาน
      </h1>
      <p className="mx-auto mt-2 max-w-[18rem] text-[14px] leading-relaxed text-[#f7f4ec]/70">
        สมัครพรีเมียม 1 ครั้ง ได้วอลเปเปอร์มงคลสุ่ม 1 รูป
        โหลดคุณภาพเต็มไฟล์ได้เฉพาะคุณ
      </p>

      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#f7f4ec]/55">
        <span className="tarot-prayer-dot h-1.5 w-1.5 rounded-full bg-[#d5b16f]" />
        หายใจเข้าลึก ๆ
        <span className="text-[#d5b16f]/50">·</span>
        หายใจออกช้า ๆ
      </div>

      <button
        type="button"
        onClick={onPray}
        className="mae-gold-cta mt-7 inline-flex h-[3.35rem] w-full max-w-[320px] items-center justify-center gap-2 rounded-full text-[17px] font-bold outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      >
        <FortuneIcon name="sparkle" size={20} plain />
        กดอธิษฐาน
      </button>
    </div>
  );
}

function LoadingStep({ line }: { line: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <span className="wallpaper-load-spin absolute inset-0 rounded-full border-2 border-[rgba(213,177,111,0.28)] border-t-[#d5b16f]" />
        <span className="wallpaper-load-spin-rev absolute inset-3 rounded-full border border-dashed border-[rgba(232,209,154,0.45)]" />
        <span
          className="wallpaper-pray-breathe relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 30%, #fff8e4, #e8d19a 55%, #d5b16f)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
          }}
        >
          <FortuneIcon name="sparkle" size={32} plain />
        </span>
        <span
          className="wallpaper-load-spark pointer-events-none absolute left-2 top-6 h-1.5 w-1.5 rounded-full bg-[#e8d19a]"
          aria-hidden
        />
        <span
          className="wallpaper-load-spark pointer-events-none absolute bottom-8 right-3 h-1 w-1 rounded-full bg-[#d5b16f]"
          style={{ animationDelay: "0.7s" }}
          aria-hidden
        />
      </div>

      <p
        key={line}
        className="wallpaper-load-text mae-gold-text mt-6 text-[17px] font-semibold"
      >
        {line}
      </p>
      <p className="mt-2 text-[13px] text-[#f7f4ec]/55">โปรดรอสักครู่…</p>

      <div
        className="mt-5 h-1.5 w-48 overflow-hidden rounded-full"
        style={{ background: "rgba(213,177,111,0.18)" }}
      >
        <div
          className="wallpaper-load-bar h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #b8924f 0%, #d5b16f 55%, #e8d19a 100%)",
          }}
        />
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
        <p className="mae-gold-text text-[10px] font-semibold tracking-[0.16em]">
          PREMIUM · 1 รูป / การสมัคร
        </p>
        <h1 className="mae-gold-text mt-0.5 text-[1.35rem] font-bold tracking-tight">
          วอลเปเปอร์มงคลของคุณ
        </h1>
        <p className="mx-auto mt-1 max-w-[22rem] text-[12px] leading-snug text-[#f7f4ec]/65">
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
          <div
            className="relative h-full w-full overflow-hidden rounded-[22px] bg-[#101827]"
            style={{
              boxShadow:
                "inset 0 0 0 2px rgba(213,177,111,0.55), 0 14px 36px rgba(0,0,0,0.32)",
            }}
          >
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
              <div className="absolute inset-0 flex items-center justify-center bg-[#101827]/45">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#101827]"
                  style={{
                    background:
                      "linear-gradient(180deg, #efe0b8 0%, #d5b16f 100%)",
                  }}
                >
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
                "radial-gradient(circle at 35% 28%, #fff8e4 0%, #e8d19a 55%, #d5b16f 100%)",
              boxShadow:
                "0 0 0 2px rgba(213,177,111,0.85), 0 10px 22px rgba(0,0,0,0.3)",
            }}
          >
            {unlocked ? (
              <Download className="h-6 w-6 text-[#101827]" strokeWidth={2.2} />
            ) : (
              <Lock className="h-6 w-6 text-[#101827]" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      <div className="mae-aspect-card mt-2.5 w-full shrink-0 rounded-[18px] px-3.5 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <FortuneIcon name="sparkle" size={14} plain />
          <p className="mae-gold-text text-[12px] font-semibold tracking-[0.12em]">
            {unlocked ? wallpaper.title : "วอลเปเปอร์มงคล · พรีเมียม"}
          </p>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-[#f7f4ec]/65">
          {unlocked
            ? wallpaper.subtitle
            : "ปลดล็อกแล้วระบบจะสุ่มมอบ 1 รูปให้คุณโหลดคุณภาพเต็ม"}
        </p>

        {!unlocked ? (
          <button
            type="button"
            onClick={onUnlock}
            className="mae-gold-cta mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-[14px] font-semibold outline-none transition active:scale-[0.99]"
          >
            <Lock className="h-4 w-4 shrink-0" strokeWidth={2} />
            ปลดล็อก · รับวอลเปเปอร์ · {FORTUNE_UNLOCK_PRICE} บาท
          </button>
        ) : (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-[14px] font-semibold text-[#f7f4ec] outline-none transition active:scale-[0.99] disabled:opacity-70"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
            }}
          >
            <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
            {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดคุณภาพเต็ม"}
          </button>
        )}
      </div>
    </div>
  );
}
