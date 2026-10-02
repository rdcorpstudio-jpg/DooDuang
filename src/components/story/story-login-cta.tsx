"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LineSignInButton } from "@/components/auth/line-sign-in-button";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { PHONE_AUTH_ENABLED } from "@/lib/auth-features";
import { cn } from "@/lib/utils";

const GOLD = "#e8d19a";
const TEXT = "#f5f7ff";
const MUTED = "rgba(186, 204, 230, 0.78)";

/** Login stack for story landing `/3` — Google / LINE / OTP. */
export function StoryLoginCta({
  callbackUrl = "/reading",
  className,
  compact = false,
  anchor = false,
  variant = "panel",
}: {
  callbackUrl?: string;
  className?: string;
  compact?: boolean;
  /** Only one instance on the page should be the scroll target. */
  anchor?: boolean;
  /** `hero` = open stack on the landing; `panel` = glass card for sticky bar. */
  variant?: "panel" | "hero";
}) {
  const [showPhone, setShowPhone] = useState(false);
  const isHero = variant === "hero";

  return (
    <div
      id={anchor ? "story-login" : undefined}
      data-story-login=""
      className={cn(
        "w-full",
        isHero ? "story-login-hero" : "rounded-[22px] px-3.5 py-3.5",
        !isHero && compact && "rounded-[18px] px-3 py-3",
        className
      )}
      style={
        isHero
          ? undefined
          : {
              background: "rgba(8, 18, 34, 0.58)",
              border: "1px solid rgba(232,209,154,0.22)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }
      }
    >
      {isHero ? (
        <p className="story-login-hero-label">
          {showPhone ? "ยืนยันด้วยเบอร์มือถือ" : "สมัครฟรี แล้วเริ่มดูดวง"}
        </p>
      ) : null}

      {showPhone && PHONE_AUTH_ENABLED ? (
        <div className={cn(isHero && "story-login-hero-stack", "mx-auto w-full")}>
          <div
            className="rounded-[16px] px-3 py-3"
            style={{
              background: "rgba(8,16,32,0.55)",
              boxShadow: "inset 0 0 0 1px rgba(232,209,154,0.18)",
            }}
          >
            <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
              ใช้เบอร์มือถือ
            </p>
            <p className="mt-0.5 text-[14px] leading-snug" style={{ color: MUTED }}>
              ส่งรหัส OTP เพื่อยืนยันเบอร์ของคุณ
            </p>
            <div className="mt-2.5 text-left">
              <PhoneLoginForm callbackUrl={callbackUrl} compact />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPhone(false)}
            className="mx-auto mt-2.5 flex h-10 w-full items-center justify-center gap-1 rounded-full text-[14px] font-medium outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35"
            style={{ color: GOLD }}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            ใช้ Google หรือ LINE แทน
          </button>
        </div>
      ) : (
        <>
          <div
            className={cn(
              isHero ? "space-y-2 story-login-hero-stack" : "space-y-2.5"
            )}
          >
            <GoogleSignInButton
              callbackUrl={callbackUrl}
              coloredIcon
              label="ดำเนินการต่อด้วย Google"
              className="w-full"
              buttonClassName={cn(
                "login-google-solid !flex w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full border-0 !bg-white px-3 py-0 font-semibold !leading-[1.35] !text-[#1f1f1f] outline-none transition hover:!bg-[#f4f4f4] hover:!text-[#1f1f1f] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/4 active:scale-[0.99]",
                isHero
                  ? "!h-10 text-[14px] shadow-[0_8px_22px_rgba(0,0,0,0.32)]"
                  : "!h-11 text-[15px] shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
              )}
            />
            <LineSignInButton
              callbackUrl={callbackUrl}
              variant="brand"
              label="ดำเนินการต่อด้วย LINE"
              buttonClassName={cn(
                "!rounded-full font-semibold",
                isHero
                  ? "!h-10 text-[14px] shadow-[0_8px_22px_rgba(6,199,85,0.25)]"
                  : "!h-11 text-[15px]"
              )}
            />
          </div>

          {PHONE_AUTH_ENABLED ? (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className={cn(
                "mx-auto flex h-10 w-full items-center justify-center gap-1 rounded-full text-[14px] font-medium outline-none transition hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35",
                isHero ? "mt-2" : "mt-3"
              )}
              style={{ color: GOLD }}
            >
              ใช้เบอร์มือถือแทน
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
