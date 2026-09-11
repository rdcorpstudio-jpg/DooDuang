"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Lock } from "lucide-react";
import {
  GoogleSignInButton,
  startGoogleRedirect,
} from "@/components/auth/google-sign-in-button";
import { LineSignInButton } from "@/components/auth/line-sign-in-button";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { AnimatedPage } from "@/components/ui/reveal";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

function AuthDivider({ label = "หรือ" }: { label?: string }) {
  return (
    <div className="my-2.5 flex items-center gap-2.5">
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.4), transparent)",
        }}
      />
      <span className="text-[11px] font-medium tracking-wide text-[#d5b16f]/75">
        {label}
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.4), transparent)",
        }}
      />
    </div>
  );
}

export function LoginScreen({
  callbackUrl = "/premium?checkout=1",
  autoStartGoogle = false,
  lineError,
}: {
  callbackUrl?: string;
  /** From LINE/Safari handoff — open Google immediately, no middle page */
  autoStartGoogle?: boolean;
  /** From `/api/auth/line/callback` when OAuth fails */
  lineError?: string;
}) {
  const router = useRouter();
  const started = useRef(false);

  const lineErrorMessage =
    lineError === "denied"
      ? "ยกเลิกการเข้าสู่ระบบด้วย LINE"
      : lineError === "state" || lineError === "missing"
        ? "เซสชัน LINE หมดอายุ กรุณาลองใหม่"
        : lineError === "failed"
          ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ กรุณาลองใหม่"
          : lineError
            ? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ"
            : null;

  useEffect(() => {
    if (!autoStartGoogle || started.current) return;
    if (!isFirebaseClientConfigured()) return;
    started.current = true;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("autologin")) {
        url.searchParams.delete("autologin");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    } catch {
      /* ignore */
    }
    void startGoogleRedirect(callbackUrl);
  }, [autoStartGoogle, callbackUrl]);

  return (
    <AnimatedPage className="relative flex min-h-full flex-col overflow-x-hidden overflow-y-auto px-3 pb-6 pt-3 sm:px-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-0.5 justify-self-start text-[14px] font-medium text-white/85 outline-none transition active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          กลับ
        </button>
        <span aria-hidden className="justify-self-center" />
        <span aria-hidden className="justify-self-end" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-3">
        <div className="mae-aspect-card mx-auto w-full max-w-[min(100%,22rem)] px-3 py-4 text-center sm:px-4">
          <div
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,248,228,0.18), rgba(213,177,111,0.08) 55%, transparent)",
              boxShadow:
                "inset 0 0 0 1px rgba(213,177,111,0.45), 0 6px 16px rgba(0,0,0,0.22)",
            }}
          >
            <FortuneIcon name="profile" size={22} plain />
          </div>

          <p className="mae-gold-text mt-2.5 text-[10px] font-semibold tracking-[0.2em]">
            แม่มั่งมี
          </p>
          <h1 className="mt-0.5 font-sans text-[1.2rem] font-bold leading-snug tracking-[0.03em] text-[#f7f4ec]">
            เข้าสู่ระบบ
          </h1>
          <p className="login-keyboard-hide mx-auto mt-1 max-w-[16rem] text-[12px] leading-snug text-[#c5cdd9]/70">
            {autoStartGoogle
              ? "กำลังเปิด Google…"
              : "Google · LINE · หรือเบอร์"}
          </p>

          {lineErrorMessage ? (
            <p className="mt-2.5 text-[12px] leading-snug text-[#ff8fa3]">
              {lineErrorMessage}
            </p>
          ) : null}

          <div className="login-keyboard-hide mt-3.5 space-y-2">
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="เข้าสู่ระบบด้วย Google"
              className="w-full space-y-1.5"
              buttonClassName="h-10 text-[13px]"
            />

            <LineSignInButton
              callbackUrl={callbackUrl}
              buttonClassName="h-10 text-[13.5px] whitespace-nowrap"
            />
          </div>

          <div className="login-keyboard-hide">
            <AuthDivider label="หรือใช้เบอร์" />
          </div>

          <PhoneLoginForm callbackUrl={callbackUrl} compact />

          <div className="login-keyboard-hide">
            <AuthDivider />

            <p className="text-[12px] leading-snug text-[#c5cdd9]/65">
              ดูดวงได้โดยไม่ต้องเข้าสู่ระบบ
            </p>
            <Link
              href="/reading"
              className="mae-gold-cta group mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[13.5px] font-semibold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            >
              ไปดูดวงฟรี
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.4}
              />
            </Link>

            <Link
              href="/dashboard?preview=1"
              className="mt-2.5 inline-flex text-[12px] font-medium tracking-wide text-[#e8d19a]/85 underline decoration-[#d5b16f]/35 underline-offset-[4px] outline-none transition hover:text-[#f7f4ec]"
            >
              ดูตัวอย่างหน้าหลังล็อกอิน
            </Link>

            <p className="mt-3 inline-flex items-center justify-center gap-1 text-[10.5px] tracking-wide text-[#9aa3b2]">
              <Lock
                className="h-2.5 w-2.5 shrink-0 text-[#d5b16f]"
                strokeWidth={2}
              />
              ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
