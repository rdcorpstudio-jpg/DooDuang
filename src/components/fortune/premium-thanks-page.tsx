"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import {
  APP_BRAND_MARK,
  FORTUNE_PACKAGE_MONTHS,
  LINE_OA_ADD_URL,
  LINE_OA_HANDLE,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  getPremiumOnboardPath,
  readFortuneProfile,
} from "@/lib/fortune/profile-storage";
import { requirePremiumFromServer } from "@/lib/fortune/premium-unlock";

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

/** Post-payment: confirm unlock vibe + add LINE OA for CRM */
export function PremiumThanksPage() {
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [continueHref, setContinueHref] = useState("/premium");

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

  return (
    <AnimatedPage className="mx-auto flex min-h-full w-full max-w-[480px] flex-col justify-center px-4 pb-12 pt-6">
      <section className="mae-aspect-card relative overflow-hidden rounded-[22px] px-5 py-7 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.22), rgba(213,177,111,0.1) 55%, transparent)",
            boxShadow:
              "inset 0 0 0 1px rgba(213,177,111,0.5), 0 8px 22px rgba(0,0,0,0.28)",
          }}
        >
          {ready && premium ? (
            <Check className="h-7 w-7 text-[#d5b16f]" strokeWidth={2.4} />
          ) : ready ? (
            <FortuneIcon name="profile" size={28} plain />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-[#d5b16f]" />
          )}
        </div>

        <p className="mae-gold-text mt-4 text-[11px] font-semibold tracking-[0.22em]">
          {APP_BRAND_MARK}
        </p>
        <h1 className="mae-gold-text mt-1.5 text-[1.45rem] font-bold tracking-tight">
          {ready && premium
            ? "ชำระสำเร็จแล้ว"
            : ready
              ? "กำลังยืนยันสิทธิ์…"
              : "กำลังยืนยันการชำระ…"}
        </h1>
        <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-relaxed text-[#f7f4ec]/68">
          {premium
            ? `พรีเมียม ${FORTUNE_PACKAGE_MONTHS} เดือนปลดล็อกแล้ว · เก็บสิทธิ์ไว้ในไลน์ต่อได้เลย`
            : "รอสักครู่ หากชำระแล้ว สิทธิ์จะอัปเดตอัตโนมัติ"}
        </p>

        <div
          className="mx-auto mt-5 h-px w-28"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(213,177,111,0.55), transparent)",
          }}
          aria-hidden
        />

        <p className="mx-auto mt-5 max-w-[18rem] text-[13px] leading-snug text-[#e8d19a]/9">
          เพิ่มเพื่อน {LINE_OA_HANDLE}
          <br />
          <span className="text-[12px] text-[#f7f4ec]/58">
            รับฤกษ์อัปเดต และแจ้งเตือนก่อนหมดอายุ
          </span>
        </p>

        <a
          href={LINE_OA_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-12 w-full max-w-[20rem] items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#06C755]/45"
          style={{
            background: "#06C755",
            boxShadow: "0 8px 20px rgba(6,199,85,0.28)",
          }}
        >
          <LineMark className="h-[18px] w-[18px] text-white" />
          เพิ่มเพื่อนใน LINE
        </a>

        <div className="mt-4 flex flex-col items-center gap-2.5">
          <Link
            href={continueHref}
            className="text-[13px] font-medium text-[#d5b16f] outline-none transition hover:text-[#e8d19a]"
          >
            เริ่มดูดวงพรีเมียม →
          </Link>
          <Link
            href="/dashboard"
            className="text-[12px] text-[#f7f4ec]/45 outline-none transition hover:text-[#f7f4ec]/7"
          >
            ไว้ทีหลัง · ไปหน้าบัญชี
          </Link>
        </div>
      </section>
    </AnimatedPage>
  );
}
