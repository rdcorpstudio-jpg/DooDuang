"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Lock, Sparkles } from "lucide-react";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
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
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

const LOAD_MS = 3200;

type Phase = "pray" | "loading" | "reveal";

const LOAD_LINES = [
  "กำลังตั้งจิต…",
  "สุ่มวอลเปเปอร์มงคลให้คุณ…",
  "กำลังเปิดของขวัญพรีเมียม…",
] as const;

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

const GOLD = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.82)";

const glassPanel = {
  background: MAE_GLASS.bg,
  border: MAE_GLASS.border,
  boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}`,
  backdropFilter: MAE_GLASS.blur,
  WebkitBackdropFilter: MAE_GLASS.blur,
} as const;

/** Premium wallpaper — 1 random HQ file per premium subscription */
export function FortuneWallpaper({ className }: { className?: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pray");
  const [loadLine, setLoadLine] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState<PremiumWallpaper>(
    getPremiumWallpaperTeaser(),
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
      window.open(wallpaper.src, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className={cn(
        "no-sky-lift relative h-full overflow-hidden text-white",
        className,
      )}
    >
      <MaePageBackground />
      <div className="relative z-[1] mx-auto flex h-full w-full max-w-[480px] flex-col px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <MaeBrandLink />
          <PageBackButton onClick={() => router.back()} />
        </div>

        {phase === "pray" ? (
          <PrayStep onPray={() => setPhase("loading")} />
        ) : null}

        {phase === "loading" ? (
          <LoadingStep
            line={LOAD_LINES[loadLine] ?? LOAD_LINES[0]}
            step={loadLine}
          />
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

function MoonArc() {
  return (
    <svg
      viewBox="0 0 160 72"
      className="wallpaper-moon-arc mx-auto h-14 w-[10.5rem]"
      aria-hidden
    >
      <defs>
        <linearGradient id="wpMoonStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8f6e38" stopOpacity="0.15" />
          <stop offset="35%" stopColor="#e8d19a" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#fff8e4" stopOpacity="1" />
          <stop offset="100%" stopColor="#8f6e38" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M12 58 C 42 8, 118 8, 148 58"
        fill="none"
        stroke="url(#wpMoonStroke)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="80" cy="22" r="3.2" fill="#e8d19a" opacity="0.95" />
    </svg>
  );
}

function PrayStep({ onPray }: { onPray: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div
          className="wallpaper-ceremony relative w-full max-w-[22rem] overflow-hidden rounded-[28px] px-5 pb-7 pt-8 text-center"
          style={glassPanel}
        >
          <span className="wallpaper-ceremony-glow pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full opacity-70" />

          <MoonArc />

          <p
            className="mt-4 text-[13px] font-semibold tracking-[0.18em]"
            style={{ color: GOLD }}
          >
            ของขวัญพรีเมียม
          </p>
          <h1
            className="mt-2 text-[clamp(1.65rem,7vw,1.95rem)] font-bold leading-[1.35] tracking-tight"
            style={TITLE_GOLD}
          >
            หลับตาอธิษฐาน
          </h1>
          <p
            className="mx-auto mt-3 max-w-[17.5rem] text-[14.5px] font-medium leading-[1.55]"
            style={{ color: TEXT_MUTED }}
          >
            สมัครพรีเมียมครั้งเดียว ได้วอลเปเปอร์มงคลสุ่ม 1 รูป
            โหลดคุณภาพเต็มเฉพาะคุณ
          </p>

          <div className="mt-6 flex items-center justify-center gap-2.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="wallpaper-breath-pill h-1.5 w-8 rounded-full"
                style={{ animationDelay: `${i * 0.45}s` }}
                aria-hidden
              />
            ))}
          </div>
          <p
            className="mt-3 text-[13.5px] font-medium"
            style={{ color: "rgba(186,204,230,0.7)" }}
          >
            หายใจเข้าลึก ๆ · หายใจออกช้า ๆ
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onPray}
        className="wallpaper-dl-btn group relative mt-4 flex h-[3.6rem] w-full shrink-0 items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
      >
        <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <span className="relative z-[1] min-w-0 flex-1">
          <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
            กดอธิษฐาน
          </span>
          <span className="mt-0.5 block text-[12px] font-medium leading-tight opacity-70">
            ตั้งจิตแล้วสุ่มวอลเปเปอร์มงคล
          </span>
        </span>
        <span
          className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
          aria-hidden
        />
      </button>
    </div>
  );
}

function LoadingStep({ line, step }: { line: string; step: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1">
      <div
        className="wallpaper-ceremony relative w-full max-w-[22rem] overflow-hidden rounded-[28px] px-5 py-9 text-center"
        style={glassPanel}
      >
        <span className="wallpaper-shimmer pointer-events-none absolute inset-0" />

        <div className="relative flex items-end justify-center gap-2.5 pt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "wallpaper-load-beam rounded-full transition-all duration-500",
                i <= step ? "opacity-100" : "opacity-35",
              )}
              style={{
                width: i === 1 ? 10 : 7,
                height: i === 1 ? 56 : i === step ? 44 : 32,
                background:
                  i <= step
                    ? "linear-gradient(180deg, #fff8e4 0%, #e8d19a 40%, #b8924f 100%)"
                    : "rgba(232,209,154,0.28)",
                boxShadow:
                  i <= step ? "0 0 18px rgba(232,209,154,0.35)" : "none",
              }}
              aria-hidden
            />
          ))}
        </div>

        <p
          key={line}
          className="wallpaper-load-text relative mt-7 text-[1.25rem] font-bold leading-snug"
          style={TITLE_GOLD}
        >
          {line}
        </p>
        <p
          className="relative mt-2 text-[14.5px] font-medium"
          style={{ color: TEXT_MUTED }}
        >
          โปรดรอสักครู่…
        </p>

        <div
          className="relative mx-auto mt-6 h-1 w-44 overflow-hidden rounded-full"
          style={{ background: "rgba(213,177,111,0.16)" }}
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
    <div className="wallpaper-reveal flex min-h-0 flex-1 flex-col pt-2">
      <header className="shrink-0 text-center">
        <p
          className="text-[12.5px] font-semibold tracking-[0.14em]"
          style={{ color: GOLD }}
        >
          พรีเมียม · 1 รูป / การสมัคร
        </p>
        <h1
          className="mt-1 text-[1.45rem] font-bold tracking-tight"
          style={TITLE_GOLD}
        >
          วอลเปเปอร์มงคลของคุณ
        </h1>
      </header>

      <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
        <div
          className="relative h-full max-h-full w-full overflow-hidden rounded-[24px]"
          style={{
            maxWidth: "min(100%, 280px)",
            aspectRatio: "9 / 16",
            boxShadow:
              "inset 0 0 0 1.5px rgba(232,209,154,0.5), 0 18px 40px rgba(0,0,0,0.36)",
            background: "#0b1220",
          }}
        >
          <Image
            src={wallpaper.src}
            alt={wallpaper.title}
            fill
            unoptimized
            className={cn(
              "object-cover object-center",
              !unlocked && "scale-105 blur-[7px]",
            )}
            sizes="280px"
            priority
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 px-3.5 pb-3.5 pt-16"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(6,12,24,0.88) 58%, rgba(6,12,24,0.96) 100%)",
            }}
          >
            <p className="text-[14.5px] font-bold" style={{ color: GOLD }}>
              {unlocked ? wallpaper.title : "วอลเปเปอร์มงคล · พรีเมียม"}
            </p>
            <p
              className="mt-0.5 text-[12.5px] font-medium leading-snug"
              style={{ color: "rgba(186,204,230,0.78)" }}
            >
              {unlocked
                ? wallpaper.subtitle
                : "ปลดล็อกแล้วระบบสุ่มมอบ 1 รูป · โหลดคุณภาพเต็ม"}
            </p>
          </div>

          {!unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0b1220]/40">
              <span className="mae-gold-cta inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-bold">
                <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="dd-btn-label">พรีเมียมเท่านั้น</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!unlocked ? (
        <button
          type="button"
          onClick={onUnlock}
          className="wallpaper-dl-btn group relative mt-4 flex h-[3.6rem] w-full shrink-0 items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
        >
          <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Lock className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </span>
          <span className="relative z-[1] min-w-0 flex-1">
            <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
              ปลดล็อก · รับวอลเปเปอร์
            </span>
            <span className="mt-0.5 block text-[12px] font-medium leading-tight opacity-70">
              {FORTUNE_UNLOCK_PRICE} บาท · สุ่ม 1 รูปคุณภาพเต็ม
            </span>
          </span>
          <span
            className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
            aria-hidden
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="wallpaper-dl-btn group relative mt-4 flex h-[3.6rem] w-full shrink-0 items-center gap-3 overflow-hidden rounded-[18px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-70"
        >
          <span className="wallpaper-dl-btn__icon relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Download className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </span>
          <span className="relative z-[1] min-w-0 flex-1">
            <span className="dd-btn-label block text-[15.5px] font-bold leading-tight tracking-wide">
              {downloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดคุณภาพเต็ม"}
            </span>
            <span className="mt-0.5 block text-[12px] font-medium leading-tight opacity-70">
              ไฟล์ต้นฉบับ · พร้อมตั้งหน้าจอ
            </span>
          </span>
          <span
            className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}
