"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LineSignInButton } from "@/components/auth/line-sign-in-button";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { PageBackButton } from "@/components/ui/page-back-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-features";
import {
  LINE_OA_ADD_URL,
  LINE_OA_PAY_CHAT_LABEL,
} from "@/lib/site";
import { cn } from "@/lib/utils";

function AuthDivider({ label = "หรือ" }: { label?: string }) {
  return (
    <div className="my-2 flex items-center gap-2.5">
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.45), transparent)",
        }}
      />
      <span className="mae-gold-text text-[11px] font-medium tracking-wide">
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.45), transparent)",
        }}
      />
    </div>
  );
}

function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-4 w-4", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.2-.033.211 0 .391.09.51.25l2.445 3.32V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.63.629-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.957 12 .957S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function isCheckoutLogin(callbackUrl: string) {
  const next = callbackUrl.trim();
  return (
    next.includes("checkout=1") ||
    next.startsWith("/premium/pay") ||
    next.includes("premium/pay")
  );
}

/** Welcome login — celestial gate BG (image 2) + auth actions */
export function LoginScreen({
  callbackUrl = "/dashboard",
  autoStartGoogle = false,
  lineError,
}: {
  callbackUrl?: string;
  autoStartGoogle?: boolean;
  lineError?: string;
}) {
  const router = useRouter();
  const forCheckout = useMemo(
    () => isCheckoutLogin(callbackUrl),
    [callbackUrl]
  );

  const lineErrorMessage =
    lineError === "denied"
      ? "ยกเลิกการเข้าสู่ระบบด้วย LINE"
      : lineError === "state" || lineError === "missing"
        ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        : lineError === "failed"
          ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่"
          : lineError
            ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ"
            : null;

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("autologin")) {
        url.searchParams.delete("autologin");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
      sessionStorage.removeItem("dooduang-oauth-pending");
    } catch {
      /* ignore */
    }
  }, [autoStartGoogle]);

  return (
    <AnimatedPage className="login-screen relative flex min-h-full flex-col overflow-x-hidden overflow-y-auto bg-[#0a1420] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      {/* Image 2 — empty celestial gate (no Mae / no zodiac ring) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src="/images/brand/login-gate-sky.png?v=gate4"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 0%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(10,14,24,0.12) 0%,
              transparent 22%,
              rgba(10,14,24,0.28) 50%,
              rgba(10,14,24,0.62) 74%,
              rgba(10,14,24,0.82) 100%)`,
          }}
        />
      </div>

      <div className="relative z-10 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <PageBackButton
          onClick={() => router.back()}
          className="justify-self-start"
        />
        <span aria-hidden className="justify-self-center" />
        <span aria-hidden className="justify-self-end" />
      </div>

      <div className="login-screen-sky relative z-10 shrink-0" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center">
        <h1
          className="mae-gold-text max-w-[18rem] font-sacred text-[clamp(1.4rem,5.8vw,1.7rem)] font-bold leading-[1.2] tracking-[0.02em]"
          style={{
            filter:
              "drop-shadow(0 1px 1px rgba(0,0,0,0.75)) drop-shadow(0 2px 10px rgba(0,0,0,0.35))",
          }}
        >
          {forCheckout ? "เข้าสู่ระบบเพื่อชำระ" : "ยินดีต้อนรับกลับมา"}
        </h1>
        <p
          className="mt-1.5 max-w-[17rem] text-[13px] font-medium leading-[1.45] tracking-wide text-white/85"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
        >
          {forCheckout ? (
            <>
              เข้าสู่ระบบเพื่อยืนยันสิทธิ์หลังชำระ
              <br />
              หรือทักแชทแม่เพื่อชำระผ่านไลน์
            </>
          ) : (
            <>
              เข้าสู่ระบบเพื่อบันทึกคำทำนาย
              <br />
              และใช้งานสิทธิ์ของคุณ
            </>
          )}
        </p>

        {lineErrorMessage ? (
          <p className="mt-2.5 text-[12px] leading-snug text-[#ff8fa3]">
            {lineErrorMessage}
          </p>
        ) : null}

        <div
          className="mt-3 w-full rounded-[18px] px-3 py-3"
          style={{
            background: "rgba(16,24,39,0.4)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.14), 0 10px 28px rgba(0,0,0,0.25)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="space-y-2">
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="เข้าสู่ระบบด้วย Google"
              className="w-full space-y-1.5"
              buttonClassName="google-white-btn h-11 rounded-[14px] text-[13.5px]"
            />

            <LineSignInButton
              callbackUrl={callbackUrl}
              buttonClassName="h-11 rounded-[14px] text-[13.5px] whitespace-nowrap"
            />
          </div>

          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-white/55">
            <Lock className="h-3 w-3 text-[#d5b16f]" strokeWidth={2.2} />
            บันทึกข้อมูลไว้กับบัญชีของคุณ
          </p>
        </div>

        {PHONE_AUTH_ENABLED ? (
          <>
            <div className="login-keyboard-hide w-full">
              <AuthDivider label="หรือใช้เบอร์" />
            </div>
            <div className="w-full">
              <PhoneLoginForm callbackUrl={callbackUrl} compact />
            </div>
          </>
        ) : null}

        <div className="w-full">
          <AuthDivider label={forCheckout ? "หรือชำระกับแม่" : "หรือ"} />
        </div>

        <a
          href={LINE_OA_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] text-[13.5px] font-semibold tracking-wide text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#06C755]/45"
          style={{
            background: "#06C755",
            boxShadow:
              "0 8px 20px rgba(6,199,85,0.28), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <LineMark className="h-[18px] w-[18px]" />
          {LINE_OA_PAY_CHAT_LABEL}
        </a>

        <Link
          href="/reading"
          className="group mt-2.5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[14px] text-[13.5px] font-semibold tracking-wide text-[#f7f4ec] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          style={{
            boxShadow: "inset 0 0 0 1.5px rgba(213,177,111,0.65)",
            background: "rgba(16,24,39,0.35)",
          }}
        >
          <span className="mae-gold-text">ดูดวงฟรีโดยไม่เข้าสู่ระบบ</span>
          <ChevronRight
            className="h-4 w-4 text-[#e8d19a] transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.4}
          />
        </Link>

        <p className="mt-3.5 max-w-[18rem] text-[11px] leading-snug text-white/45 sm:mt-4">
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
          <Link
            href="/terms"
            className="text-white/60 underline-offset-2 hover:underline"
          >
            เงื่อนไขการใช้งาน
          </Link>
          <span className="mx-1 text-white/25" aria-hidden>
            |
          </span>
          <Link
            href="/privacy"
            className="text-white/60 underline-offset-2 hover:underline"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
