"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LINE_OA_ADD_URL,
  LINE_OA_HANDLE,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  getPremiumOnboardPath,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { requirePremiumFromServer } from "@/lib/fortune/premium-unlock";
import { trackClientEvent } from "@/lib/analytics/client";

function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-5 w-5", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.2-.033.211 0 .391.09.51.25l2.445 3.32V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.63.629-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.957 12 .957S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

/**
 * Post-payment thank-you page (Stripe success_url).
 * Site-wide listener on this URL confirms pay + fires Meta/LINE Purchase.
 */
export function PremiumThanksPage() {
  const [continueHref, setContinueHref] = useState("/reading?afterPremium=1");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      await requirePremiumFromServer();
      if (cancelled) return;
      setContinueHref(getPremiumOnboardPath(readFortuneProfile()));
    }

    function onPremiumChanged() {
      void refresh();
    }

    void refresh();
    window.addEventListener("dooduang-premium-changed", onPremiumChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("dooduang-premium-changed", onPremiumChanged);
    };
  }, []);

  return (
    <div className="relative flex h-full min-h-full flex-col overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 28%" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/bg/mae-bg-poster.webp?v=new1"
        >
          <source src="/videos/mae-bg.mp4?v=new1" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(8,16,32,0.35) 0%,
                rgba(8,16,32,0.08) 18%,
                transparent 34%,
                rgba(8,16,32,0.45) 52%,
                rgba(8,16,32,0.88) 72%,
                rgba(6,14,28,0.96) 100%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="h-[42dvh] shrink-0" aria-hidden />

        <div
          className={cn(
            "mx-auto flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center transition duration-700 delay-100",
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <h1 className="font-sacred text-[1.7rem] font-normal leading-[1.28] tracking-[0.02em] text-white sm:text-[1.85rem]">
            ขอบคุณที่ไว้วางใจ
            <span className="mae-hero-gold-line mt-1.5 block text-[1.8rem] leading-[1.3] sm:text-[1.95rem]">
              แม่มั่งมีอยู่ตรงนี้
            </span>
          </h1>

          <p className="mt-3.5 max-w-[18rem] text-[15.5px] font-medium leading-[1.65] text-[#e8eef8]/92">
            เก็บสิทธิ์พรีเมียมไว้ในไลน์
            <br />
            รับฤกษ์อัปเดต และแจ้งเตือนก่อนหมดอายุ
            <br />
            <span className="font-semibold text-[#e8d19a]">{LINE_OA_HANDLE}</span>
          </p>

          <a
            href={LINE_OA_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackClientEvent({
                name: "thanks_line_cta",
                path: "/premium/thanks",
              });
            }}
            className="mt-5 inline-flex h-12 w-full max-w-[260px] items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold text-white outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#06C755]/45"
            style={{
              background: "#06C755",
              boxShadow:
                "0 10px 28px rgba(6,199,85,0.32), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <LineMark className="h-[18px] w-[18px] text-white" />
            เพิ่มเพื่อนใน LINE
          </a>

          <Link
            href={continueHref}
            className="mae-gold-cta group relative mt-2.5 flex h-11 w-full max-w-[260px] items-center justify-center rounded-full px-6 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="text-[15.5px] font-bold tracking-wide">
              เริ่มดูดวงพรีเมียม →
            </span>
          </Link>

          <div className="mt-4 flex w-fit max-w-full items-center justify-center gap-2 text-left">
            <Image
              src="/images/brand/diamond-trophy-transparent.webp"
              alt=""
              width={56}
              height={56}
              unoptimized
              className="h-11 w-11 object-contain"
            />
            <div className="min-w-0 py-0.5">
              <p className="text-[13px] font-semibold tracking-[0.14em] text-[#e8d19a]">
                เกียรติยศ
              </p>
              <p className="mae-gold-text font-sacred text-[1.1rem] leading-snug">
                รางวัลเพชรสยาม 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
