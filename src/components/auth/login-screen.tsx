"use client";

import { useEffect, useMemo, useState } from "react";
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
  enableLocalAuthBypass,
  isLocalDevUi,
} from "@/lib/local-auth-bypass";
import { startMaeNavigation } from "@/components/layout/navigation-loading";

const GOLD = "#e8d19a";
const TEXT = "#f5f7ff";
const MUTED = "rgba(186, 204, 230, 0.78)";

function isCheckoutLogin(callbackUrl: string) {
  const next = callbackUrl.trim();
  return (
    next.includes("checkout=1") ||
    next.startsWith("/premium/pay") ||
    next.includes("premium/pay")
  );
}

function isFunnelLogin(callbackUrl: string) {
  const next = callbackUrl.trim();
  return (
    next.startsWith("/reading") ||
    next.startsWith("/home") ||
    next.startsWith("/welcome")
  );
}

/** Login — Mae glass gate: compact providers, gold hierarchy */
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
  const forFunnel = useMemo(
    () => !forCheckout && isFunnelLogin(callbackUrl),
    [callbackUrl, forCheckout],
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

  const title = forCheckout
    ? "เข้าสู่ระบบเพื่อชำระ"
    : forFunnel
      ? "ทดลองใช้ฟรี 3 วัน"
      : "เก็บคำทำนายไว้กับคุณ";

  const subtitle = forCheckout
    ? null
    : forFunnel
      ? "เลือกช่องทางสมัคร แล้วเริ่มดูดวงได้ทันที"
      : "บันทึกผลไว้กับคุณ · กลับมาอ่านได้ทุกเมื่อ";

  return (
    <AnimatedPage className="login-screen relative flex min-h-full flex-col overflow-x-hidden overflow-y-auto bg-[#0a1a2e] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 32%" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/bg/mae-bg-poster.webp?v=new1"
        >
          <source src="/videos/mae-bg.mp4?v=new1" type="video/mp4" />
        </video>
        {/* Soft veil only — keep Mae video visible, not a black plate */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(8,20,40,0.22) 0%,
                rgba(8,20,40,0.06) 22%,
                transparent 42%,
                rgba(8,20,40,0.28) 68%,
                rgba(8,20,40,0.55) 100%)
            `,
          }}
        />
      </div>

      <div className="relative z-10 shrink-0">
        <PageBackButton
          onClick={() => router.back()}
          className="justify-self-start"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[22rem] min-h-0 flex-1 flex-col justify-center pb-4 pt-[26vh]">
        <div className="text-center">
          <h1
            className="mae-gold-text login-trial-title mx-auto max-w-[20rem] text-[2rem] font-bold tracking-tight sm:text-[2.15rem]"
            style={{
              lineHeight: 1.4,
              paddingTop: "0.14em",
              paddingBottom: "0.08em",
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className="mx-auto mt-2.5 max-w-[19rem] text-[16px] font-medium leading-[1.55] text-white/90"
              style={{
                textShadow: "0 1px 8px rgba(6,16,28,0.55)",
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {lineErrorMessage ? (
          <p className="mt-3 text-center text-[14px] leading-snug text-[#ff8fa3]">
            {lineErrorMessage}
          </p>
        ) : null}

        <div
          className="mt-5 rounded-[22px] px-4 py-4"
          style={{
            background: "rgba(8, 18, 34, 0.52)",
            border: "1px solid rgba(232,209,154,0.22)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="space-y-2.5">
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="ดำเนินการต่อด้วย Google"
              className="w-full"
              buttonClassName="login-google-solid !flex h-11 w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full border-0 !bg-white px-3 py-0 text-[15px] font-semibold !leading-[1.35] !text-[#1f1f1f] shadow-[0_4px_14px_rgba(0,0,0,0.18)] outline-none transition hover:!bg-[#f4f4f4] hover:!text-[#1f1f1f] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/4 active:scale-[0.99]"
            />

            <LineSignInButton
              callbackUrl={callbackUrl}
              variant="brand"
              label="ดำเนินการต่อด้วย LINE"
              buttonClassName="!h-11 !rounded-full text-[15px] font-semibold"
            />
          </div>

          {PHONE_AUTH_ENABLED ? (
            <div className="login-keyboard-hide mt-3.5">
              {showPhone ? (
                <div
                  className="rounded-[16px] px-3 py-3"
                  style={{
                    background: "rgba(8,16,32,0.45)",
                    boxShadow: "inset 0 0 0 1px rgba(130,205,255,0.14)",
                  }}
                >
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: TEXT }}
                  >
                    ใช้เบอร์มือถือ
                  </p>
                  <p
                    className="mt-0.5 text-[14px] leading-snug"
                    style={{ color: MUTED }}
                  >
                    ส่งรหัส OTP เพื่อยืนยันเบอร์ของคุณ
                  </p>
                  <div className="mt-2.5 text-left">
                    <PhoneLoginForm callbackUrl={callbackUrl} compact />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPhone(true)}
                  className="mx-auto flex h-10 w-full items-center justify-center gap-1 rounded-full text-[15px] font-medium outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
                  style={{ color: GOLD }}
                >
                  ใช้เบอร์มือถือแทน
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              )}
            </div>
          ) : null}
        </div>

        {isLocalDevUi() ? (
          <button
            type="button"
            onClick={() => {
              enableLocalAuthBypass();
              startMaeNavigation();
              const next =
                callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
                  ? callbackUrl
                  : "/reading";
              router.push(next);
            }}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-full text-[14px] font-semibold outline-none transition hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            style={{
              color: "rgba(186,204,230,0.92)",
              border: "1px dashed rgba(232,209,154,0.45)",
              background: "rgba(8,18,34,0.35)",
            }}
          >
            ข้ามล็อกอิน · ทดสอบ local
          </button>
        ) : null}

        <p
          className="mt-4 flex items-center justify-center gap-1.5 text-[13.5px] leading-snug"
          style={{ color: "rgba(186,204,230,0.72)" }}
        >
          <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
          ใช้สำหรับเก็บคำทำนายของคุณ
        </p>

        <p
          className="mt-3 text-center text-[13px] leading-[1.65]"
          style={{ color: "rgba(186,204,230,0.58)" }}
        >
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
          <Link
            href="/terms"
            className="underline-offset-2 hover:underline"
            style={{ color: "rgba(232,209,154,0.85)" }}
          >
            เงื่อนไข
          </Link>
          <span className="mx-1 opacity-40" aria-hidden>
            ·
          </span>
          <Link
            href="/privacy"
            className="underline-offset-2 hover:underline"
            style={{ color: "rgba(232,209,154,0.85)" }}
          >
            ความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
