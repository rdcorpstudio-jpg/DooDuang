"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, UserRound } from "lucide-react";
import {
  GoogleSignInButton,
  startGoogleRedirect,
} from "@/components/auth/google-sign-in-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";

export function LoginScreen({
  callbackUrl = "/premium?checkout=1",
  autoStartGoogle = false,
}: {
  callbackUrl?: string;
  /** From LINE/Safari handoff — open Google immediately, no middle page */
  autoStartGoogle?: boolean;
}) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!autoStartGoogle || started.current) return;
    if (!isFirebaseClientConfigured()) return;
    started.current = true;
    // Strip autologin so refresh won't loop
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
    <AnimatedPage className="relative flex min-h-full flex-col px-4 pb-8 pt-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-0.5 justify-self-start text-[14px] font-medium text-white/85 outline-none transition active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          กลับ
        </button>
        <div className="flex flex-col items-center justify-self-center">
          <Image
            src="/images/brand/mae-wordmark-header.png?v=header1"
            alt="แม่มั่งมี พามู"
            width={140}
            height={80}
            unoptimized
            priority
            className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          />
        </div>
        <span aria-hidden className="justify-self-end" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-6">
        <div
          className="mx-auto w-full max-w-[400px] rounded-[22px] px-5 py-6 text-center sm:px-6"
          style={{
            background: "#141c2b",
            boxShadow:
              "inset 0 0 0 1px rgba(213,177,111,0.28), 0 16px 40px rgba(0,0,0,0.28)",
          }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(213,177,111,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
            }}
          >
            <UserRound className="h-7 w-7 text-[#d5b16f]" strokeWidth={1.7} />
          </div>

          <h1 className="mt-4 font-sans text-[1.4rem] font-bold tracking-tight text-[#f7f4ec]">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#9aa3b2]">
            {autoStartGoogle
              ? "กำลังเปิด Google…"
              : "ปลดล็อกสิทธิ์พรีเมียมและบันทึกโปรไฟล์"}
          </p>

          <GoogleSignInButton
            callbackUrl={callbackUrl}
            coloredIcon
            showIconDivider
            variant="outline"
            className="mt-5 space-y-2"
            buttonClassName="h-12 gap-2.5 rounded-full border-[rgba(213,177,111,0.3)] bg-transparent text-[15px] font-semibold text-[#f4f1ea] outline-none hover:bg-white/[0.04] hover:border-[rgba(213,177,111,0.45)] hover:text-[#f4f1ea] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35 active:scale-[0.99]"
          />

          <p className="mt-3 text-[12px] text-[#6b7380]">
            เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ
          </p>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[rgba(213,177,111,0.22)]" />
            <span className="text-[12px] font-medium text-[#9aa3b2]">หรือ</span>
            <span className="h-px flex-1 bg-[rgba(213,177,111,0.22)]" />
          </div>

          <p className="text-[13px] text-[#9aa3b2]">
            ดูดวงได้โดยไม่ต้องเข้าสู่ระบบ
          </p>
          <Link
            href="/reading"
            className="mae-gold-cta mt-3 inline-flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            ไปดูดวงฟรี →
          </Link>

          <Link
            href="/dashboard?preview=1"
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full text-[13px] font-medium text-[#e8d19a] outline-none transition active:opacity-70"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
            }}
          >
            ดูตัวอย่างหน้าหลังล็อกอิน
          </Link>

          <p className="mt-5 inline-flex items-center justify-center gap-1.5 text-[11px] text-[#6b7380]">
            <Lock className="h-3 w-3 shrink-0 text-[#d5b16f]" strokeWidth={2} />
            ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
}
