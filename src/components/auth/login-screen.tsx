"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LineSignInButton } from "@/components/auth/line-sign-in-button";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { OnboardTopBar } from "@/components/onboard/onboard-top-bar";
import { PageBackButton } from "@/components/ui/page-back-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-features";
import {
  HOME_READING_AFTER_LOGIN,
  LINE_OA_ADD_URL,
  LINE_OA_PAY_CHAT_LABEL,
} from "@/lib/site";
import {
  homeTopicById,
  homeTopicResumeNameHref,
  ONBOARD_FUNNEL_TOTAL,
  type HomeTopicId,
} from "@/lib/home-topics";
import { cn } from "@/lib/utils";

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

/** Login — universe atmosphere + one task card */
export function LoginScreen({
  callbackUrl = "/dashboard",
  autoStartGoogle = false,
  lineError,
  topic = null,
}: {
  callbackUrl?: string;
  autoStartGoogle?: boolean;
  lineError?: string;
  topic?: HomeTopicId | null;
}) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const forCheckout = useMemo(
    () => isCheckoutLogin(callbackUrl),
    [callbackUrl]
  );
  const fromHomeReading =
    Boolean(topic) ||
    callbackUrl === HOME_READING_AFTER_LOGIN ||
    callbackUrl.startsWith(`${HOME_READING_AFTER_LOGIN}?`);
  const topicCopy = topic ? homeTopicById(topic) : null;

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
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src="/images/brand/login-gate-sky.png?v=gate4"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-40"
          style={{ objectPosition: "50% 18%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(10,14,24,0.58) 0%,
              rgba(10,14,24,0.66) 38%,
              rgba(10,14,24,0.82) 72%,
              rgba(10,14,24,0.92) 100%)`,
          }}
        />
      </div>

      <div className="relative z-10 shrink-0">
        {topic ? (
          <OnboardTopBar
            current={ONBOARD_FUNNEL_TOTAL}
            total={ONBOARD_FUNNEL_TOTAL}
            backHref={homeTopicResumeNameHref(topic)}
          />
        ) : (
          <PageBackButton
            onClick={() => router.back()}
            className="justify-self-start"
          />
        )}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[22rem] flex-1 flex-col justify-center py-6">
        <div className="login-card text-center">
          <h1 className="text-[1.35rem] font-semibold leading-[1.45] tracking-wide text-[#f7f4ec]">
            {forCheckout
              ? "เข้าสู่ระบบเพื่อชำระ"
              : topicCopy
                ? topicCopy.loginTitle
                : "เก็บคำทำนายไว้กับคุณ"}
          </h1>
          <p className="mx-auto mt-2 max-w-[18.5rem] text-[14px] font-normal leading-[1.7] text-[#9aa3b2]">
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
                และกลับมาอ่านได้ทุกเมื่อ
              </>
            )}
          </p>

          {lineErrorMessage ? (
            <p className="mt-3 text-[12px] leading-snug text-[#ff8fa3]">
              {lineErrorMessage}
            </p>
          ) : null}

          <div className="mt-6 space-y-3">
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="ใช้ Google"
              className="w-full"
              buttonClassName="login-outline-btn h-12 rounded-full !bg-transparent !text-[#f7f4ec] border-0 text-[15px] hover:!bg-white/6 hover:!text-[#f7f4ec]"
            />

            <LineSignInButton
              callbackUrl={callbackUrl}
              variant="outline"
              label="ใช้ LINE"
              buttonClassName="h-12 rounded-full text-[15px] focus-visible:ring-[#f7f4ec]/35"
            />

            {forCheckout ? (
              <a
                href={LINE_OA_ADD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold tracking-wide text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white/30"
                style={{
                  background: "#0a0a0a",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
                }}
              >
                <LineMark className="h-[18px] w-[18px]" />
                {LINE_OA_PAY_CHAT_LABEL}
              </a>
            ) : null}
          </div>

          {PHONE_AUTH_ENABLED ? (
            <div className="login-keyboard-hide mt-5">
              <AuthDivider />
              {showPhone ? (
                <div className="mt-3 text-center">
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
                  className="mx-auto mt-1 inline-flex min-h-11 items-center justify-center gap-1 text-[15px] font-medium text-[#f7f4ec] outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
                >
                  ใช้เบอร์มือถือ
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              )}
            </div>
          ) : null}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] leading-snug text-white/45">
            <Lock className="h-3 w-3 shrink-0" strokeWidth={2.2} />
            ใช้สำหรับบัญชีและคำทำนายของคุณ
          </p>
        </div>

        {fromHomeReading ? null : (
          <Link
            href="/reading"
            className="mt-4 text-center text-[13px] font-medium text-white/50 outline-none transition hover:text-white/75 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
          >
            ดูดวงฟรีโดยไม่เข้าสู่ระบบ
          </Link>
        )}

        <p className="mt-4 px-2 text-center text-[11px] leading-snug text-white/40">
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
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
      </div>
    </AnimatedPage>
  );
}
