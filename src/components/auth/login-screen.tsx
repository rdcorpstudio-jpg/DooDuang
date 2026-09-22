"use client";

import { useEffect, useMemo, useState } from "react";
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

function AuthDivider({ label = "หรือ" }: { label?: string }) {
  return (
    <div className="my-1 flex items-center gap-2.5">
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(247,244,236,0.28), transparent)",
        }}
      />
      <span className="text-[12px] font-medium tracking-wide text-white/45">
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(247,244,236,0.28), transparent)",
        }}
      />
    </div>
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

/** Login — atmospheric sky + auth gate (matched to v3) */
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
  const [showPhone, setShowPhone] = useState(false);
  const forCheckout = useMemo(
    () => isCheckoutLogin(callbackUrl),
    [callbackUrl],
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
    <AnimatedPage className="login-screen relative flex min-h-full flex-col overflow-x-hidden overflow-y-auto bg-[#0a1420] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src="/images/brand/login-gate-sky.png?v=gate4"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-[0.32]"
          style={{ objectPosition: "50% 38%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(10,14,24,0.58) 0%,
              rgba(10,14,24,0.68) 34%,
              rgba(10,14,24,0.84) 72%,
              rgba(10,14,24,0.92) 100%)`,
          }}
        />
      </div>

      <div className="relative z-10 shrink-0">
        <PageBackButton
          onClick={() => router.back()}
          className="justify-self-start"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[22rem] min-h-0 flex-1 flex-col items-center text-center">
        <div className="h-11 w-full shrink-0" aria-hidden />

        <h1 className="max-w-[16rem] shrink-0 text-[1.55rem] font-semibold leading-[1.45] tracking-wide text-[#f7f4ec]">
          {forCheckout ? "เข้าสู่ระบบเพื่อชำระ" : "ทดลองใช้ฟรี 3 วัน"}
        </h1>
        {forCheckout ? null : (
          <p className="mt-3 shrink-0 text-[15px] leading-[1.7] text-[#9aa3b2]">
            สมัครด้วย Google · LINE หรือเบอร์
            <br />
            แล้วกรอกข้อมูลเพื่อเริ่มดูดวง
          </p>
        )}

        {lineErrorMessage ? (
          <p className="mt-3 text-[12px] leading-snug text-[#ff8fa3]">
            {lineErrorMessage}
          </p>
        ) : null}

        <div className="mt-6 w-full shrink-0 space-y-2.5">
          <GoogleSignInButton
            callbackUrl={callbackUrl}
            coloredIcon
            label="ใช้ Google"
            className="w-full"
            buttonClassName="login-outline-btn h-11 min-h-11 !rounded-2xl !bg-transparent !text-[#f7f4ec] border-0 text-[15px] hover:!bg-white/6 hover:!text-[#f7f4ec]"
          />

          <LineSignInButton
            callbackUrl={callbackUrl}
            variant="outline"
            label="ใช้ LINE"
            buttonClassName="!rounded-2xl h-11 min-h-11 text-[15px] focus-visible:ring-[#f7f4ec]/35"
          />
        </div>

        {PHONE_AUTH_ENABLED ? (
          <div className="login-keyboard-hide mt-5 w-full shrink-0">
            <AuthDivider />
            {showPhone ? (
              <div className="mt-3">
                <p className="text-[15px] font-medium leading-snug text-[#f7f4ec]">
                  ใช้เบอร์มือถือ
                </p>
                <p className="mt-1 text-[13px] leading-[1.65] text-[#9aa3b2]">
                  เราจะส่งรหัส OTP เพื่อยืนยันเบอร์ของคุณ
                </p>
                <div className="mt-3 text-left">
                  <PhoneLoginForm callbackUrl={callbackUrl} compact />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhone(true)}
                className="mx-auto mt-1 flex min-h-11 w-full items-center justify-center gap-1 text-[15px] font-medium text-[#f7f4ec] outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
              >
                ใช้เบอร์มือถือ
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </button>
            )}
          </div>
        ) : null}

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] leading-snug text-white/45">
          <Lock className="h-3 w-3 shrink-0" strokeWidth={2.2} />
          ใช้สำหรับเก็บคำทำนายของคุณ
        </p>

        <p className="mt-4 text-[11px] leading-[1.65] text-white/40">
          การเข้าสู่ระบบถือว่าคุณยอมรับ
          <br />
          <Link
            href="/terms"
            className="text-white/55 underline-offset-2 hover:underline"
          >
            เงื่อนไขการใช้งาน
          </Link>
          <span className="mx-1 text-white/20" aria-hidden>
            ·
          </span>
          <Link
            href="/privacy"
            className="text-white/55 underline-offset-2 hover:underline"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>

        <div className="min-h-6 w-full flex-1" aria-hidden />
      </div>
    </AnimatedPage>
  );
}
