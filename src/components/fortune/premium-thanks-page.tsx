"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  APP_BRAND_MARK,
  FORTUNE_PACKAGE_LABEL,
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
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [continueHref, setContinueHref] = useState("/premium");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const access = await requirePremiumFromServer();
      if (cancelled) return;
      setPremium(access.ok);
      setContinueHref(getPremiumOnboardPath(readFortuneProfile()));
      setReady(true);
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

  const statusLine = !ready
    ? "กำลังยืนยันการชำระ…"
    : premium
      ? `พรีเมียม ${FORTUNE_PACKAGE_LABEL} ปลดล็อกแล้ว`
      : "กำลังยืนยันสิทธิ์…";

  return (
    <div className="relative flex h-full min-h-full flex-col overflow-hidden text-white">
      {/* Full-bleed Mae — same spirit as landing */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/bg/hero-mae-elder.webp"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          style={{ objectPosition: "58% 18%" }}
          sizes="480px"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(16,24,39,0.18) 0%,
                transparent 22%,
                transparent 42%,
                rgba(16,24,39,0.55) 68%,
                rgba(16,24,39,0.92) 100%)
            `,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(213,177,111,0.14), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div
          className={cn(
            "mx-auto w-[min(58%,11.5rem)] shrink-0 transition duration-700",
            mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          <Image
            src="/images/brand/mae-wordmark-sm.webp?v=clear1"
            alt={APP_BRAND_MARK}
            width={400}
            height={200}
            priority
            unoptimized
            className="mae-logo-breathe h-auto w-full object-contain"
          />
        </div>

        {/* Status — mid gap between wordmark and thank-you */}
        <div
          className={cn(
            "flex flex-1 items-center justify-center px-2 transition duration-700",
            mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          <p
            className="mae-gold-text text-center text-[1.15rem] font-bold leading-snug tracking-[0.04em] sm:text-[1.25rem]"
            style={{
              textShadow:
                "0 1px 2px rgba(16,24,39,0.85), 0 8px 24px rgba(16,24,39,0.55)",
            }}
          >
            {ready && !premium ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#e8d19a]" />
                {statusLine}
              </span>
            ) : (
              statusLine
            )}
          </p>
        </div>

        <div
          className={cn(
            "mx-auto flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center transition duration-700 delay-100",
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <h1 className="font-sacred text-[1.85rem] font-normal leading-[1.25] tracking-[0.02em] text-white">
            ขอบคุณที่ไว้วางใจ
            <span className="mae-hero-gold-line mt-1 block text-[1.95rem]">
              แม่มั่งมีอยู่ตรงนี้
            </span>
          </h1>

          <p className="mt-3 max-w-[17.5rem] text-[13px] leading-[1.7] text-[#d8dee8]/88">
            เก็บสิทธิ์พรีเมียมไว้ในไลน์
            <br />
            รับฤกษ์อัปเดต และแจ้งเตือนก่อนหมดอายุ
            <br />
            <span className="text-[#e8d19a]/88">{LINE_OA_HANDLE}</span>
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
            className="mt-5 inline-flex h-12 w-full max-w-[240px] items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#06C755]/45"
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
            className="mae-gold-cta group relative mt-3 flex h-11 w-full max-w-[240px] items-center justify-center rounded-full px-6 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="text-[14px] font-bold tracking-wide">
              เริ่มดูดวงพรีเมียม →
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="mt-3 text-[12px] text-[#c5cdd9]/65 outline-none transition hover:text-[#e8d19a]"
          >
            ไว้ทีหลัง · ไปหน้าบัญชี
          </Link>

          <div className="mt-5 flex w-fit max-w-full items-center justify-center gap-1.5 text-left">
            <Image
              src="/images/brand/diamond-trophy-transparent.webp"
              alt=""
              width={56}
              height={56}
              unoptimized
              className="h-12 w-12 object-contain"
            />
            <div className="min-w-0 py-0.5">
              <p className="text-[9px] font-semibold tracking-[0.16em] text-[#d5b16f]/9">
                เกียรติยศ
              </p>
              <p className="mae-gold-text font-sacred text-[1rem] leading-snug">
                รางวัลเพชรสยาม 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
