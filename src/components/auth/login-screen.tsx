"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Sparkle, UserRound } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AnimatedPage } from "@/components/ui/reveal";
import { APP_BRAND_MARK } from "@/lib/site";

export function LoginScreen({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const router = useRouter();

  return (
    <AnimatedPage className="sky-copy relative flex min-h-full flex-col px-4 pb-8 pt-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          กลับ
        </button>
        <div className="flex flex-col items-center justify-self-center">
          <Sparkle
            className="mb-0.5 h-3.5 w-3.5 text-[#7B5FD4]"
            fill="currentColor"
            strokeWidth={0}
          />
          <p className="font-sacred text-[12px] tracking-[0.18em] text-[#7B5FD4]">
            {APP_BRAND_MARK}
          </p>
        </div>
        <span aria-hidden className="justify-self-end" />
      </div>

      <div className="flex flex-1 flex-col justify-center py-6">
        <div className="fortune-glass mx-auto w-full max-w-md rounded-[28px] px-5 py-7 text-center sm:px-6 sm:py-8">
          <div
            className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.95), rgba(198,186,240,0.75) 55%, rgba(155,127,232,0.45))",
            }}
          >
            <UserRound className="h-8 w-8 text-[#7B5FD4]" strokeWidth={1.7} />
          </div>

          <h1 className="mt-4 text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#5E5688]">
            บันทึกประวัติและปลดล็อกสิทธิ์พรีเมียม
          </p>

          <GoogleSignInButton
            callbackUrl={callbackUrl}
            coloredIcon
            showIconDivider
            variant="outline"
            className="mt-5 space-y-2"
            buttonClassName="h-12 gap-2.5 rounded-full border-0 bg-white text-[15px] font-semibold text-[#3A2F6B] outline-none ring-0 hover:bg-[#FBF8FF] hover:text-[#3A2F6B] focus:outline-none focus-visible:ring-0 active:scale-[0.99]"
          />

          <p className="mt-3 text-[12px] text-[#8A82B0]">
            เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ
          </p>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#C8B8F0]/70" />
            <span className="text-[12px] font-medium text-[#7B5FD4]">หรือ</span>
            <span className="h-px flex-1 bg-[#C8B8F0]/70" />
          </div>

          <p className="text-[13px] text-[#5E5688]">
            ดูดวงได้โดยไม่ต้องเข้าสู่ระบบ
          </p>
          <Link
            href="/reading"
            className="dd-gold-glass-btn mt-3 inline-flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold text-[#5C4810] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
          >
            ไปดูดวงฟรี →
          </Link>

          <p className="mt-5 inline-flex items-center justify-center gap-1.5 text-[11px] text-[#8A82B0]">
            <Lock className="h-3 w-3 shrink-0 text-[#7B5FD4]" strokeWidth={2} />
            ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
}
