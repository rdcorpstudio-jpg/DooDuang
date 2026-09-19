"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LineSignInButton } from "@/components/auth/line-sign-in-button";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { PageBackButton } from "@/components/ui/page-back-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-features";
import {
  LINE_OA_ADD_URL,
  LINE_OA_PAY_CHAT_LABEL,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const GOLD_SOFT = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";
const GLASS = {
  bg: "rgba(18, 28, 48, 0.72)",
  border: "1px solid rgba(213, 177, 111, 0.2)",
  highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
  shadow: "0 14px 36px rgba(0, 0, 0, 0.28)",
  blur: "blur(12px)",
} as const;

const TITLE_GOLD = {
  background:
    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 24%, #f0d078 48%, #d5b16f 72%, #b8924f 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

function AuthDivider({ label = "หรือ" }: { label?: string }) {
  return (
    <div className="my-3 flex items-center gap-2.5">
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,209,154,0.4), transparent)",
        }}
      />
      <span
        className="text-[13px] font-medium tracking-wide"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(232,209,154,0.4), transparent)",
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

/** Login — โทนกรม / กระจก / ทอง แบบหน้าหลักใหม่ */
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
    <AnimatedPage
      className="login-screen relative flex min-h-full flex-col overflow-x-hidden overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
      style={{ background: "transparent" }}
    >
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3">
        <MaeBrandLink />
        <PageBackButton onClick={() => router.back()} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[22rem] flex-1 flex-col items-center justify-center py-4 text-center">
        <h1
          className="max-w-[20rem] text-[clamp(1.85rem,7.5vw,2.35rem)] font-bold leading-[1.45] tracking-tight"
          style={TITLE_GOLD}
        >
          {forCheckout ? "เข้าสู่ระบบเพื่อชำระ" : "ยินดีต้อนรับกลับมา"}
        </h1>
        <p
          className="mt-2 max-w-[20rem] text-center text-[15.5px] font-medium leading-[1.5]"
          style={{ color: TEXT_MUTED }}
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
          <p className="mt-3 text-[13px] leading-snug text-[#f0a8b0]">
            {lineErrorMessage}
          </p>
        ) : null}

        <div
          className="mt-5 w-full rounded-[22px] px-3.5 py-3.5"
          style={{
            background: GLASS.bg,
            border: GLASS.border,
            boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
            backdropFilter: GLASS.blur,
            WebkitBackdropFilter: GLASS.blur,
          }}
        >
          <div className="space-y-2.5">
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="เข้าสู่ระบบด้วย Google"
              className="w-full space-y-1.5"
              buttonClassName="google-white-btn !h-[3.25rem] !rounded-full !text-[15.5px] font-semibold"
            />

            <LineSignInButton
              callbackUrl={callbackUrl}
              buttonClassName="h-[3.25rem] rounded-full text-[15.5px] font-semibold whitespace-nowrap"
            />

            {forCheckout ? (
              <a
                href={LINE_OA_ADD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-full text-[15.5px] font-semibold tracking-wide text-white outline-none transition active:scale-[0.99]"
                style={{
                  background: "rgba(12, 18, 32, 0.75)",
                  border: "1px solid rgba(213, 177, 111, 0.22)",
                }}
              >
                <LineMark className="h-[18px] w-[18px]" />
                {LINE_OA_PAY_CHAT_LABEL}
              </a>
            ) : null}
          </div>

          <p
            className="mt-3 flex items-center justify-center gap-1.5 text-[13px]"
            style={{ color: TEXT_MUTED }}
          >
            <Lock className="h-3.5 w-3.5" style={{ color: GOLD_SOFT }} strokeWidth={2.2} />
            บันทึกข้อมูลไว้กับบัญชีของคุณ
          </p>
        </div>

        {PHONE_AUTH_ENABLED ? (
          <>
            <div className="login-keyboard-hide w-full">
              <AuthDivider label="หรือใช้เบอร์" />
            </div>
            <div className="w-full">
              <PhoneLoginForm callbackUrl={callbackUrl} />
            </div>
          </>
        ) : (
          <div className="w-full">
            <AuthDivider />
          </div>
        )}

        <p
          className="mt-4 max-w-[18rem] text-[12.5px] leading-snug"
          style={{ color: "rgba(186, 204, 230, 0.5)" }}
        >
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
          <Link
            href="/terms"
            className="underline-offset-2 hover:underline"
            style={{ color: GOLD_SOFT }}
          >
            เงื่อนไขการใช้งาน
          </Link>
          <span className="mx-1 opacity-40" aria-hidden>
            |
          </span>
          <Link
            href="/privacy"
            className="underline-offset-2 hover:underline"
            style={{ color: GOLD_SOFT }}
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
