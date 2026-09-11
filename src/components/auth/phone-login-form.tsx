"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  DEFAULT_LOGIN_CALLBACK,
  rememberCallback,
  safeCallback,
  wantsCheckoutAfterLogin,
} from "@/components/auth/google-sign-in-button";
import { normalizeThaiMobile } from "@/lib/phone";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Display as 08x-xxx-xxxx while typing */
function formatThaiMobileInput(raw: string) {
  let d = digitsOnly(raw);
  if (d.startsWith("66") && d.length > 2) d = `0${d.slice(2)}`;
  if (d.length > 10) d = d.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function PhoneLoginForm({
  callbackUrl = DEFAULT_LOGIN_CALLBACK,
  className,
  compact = false,
}: {
  callbackUrl?: string;
  className?: string;
  compact?: boolean;
}) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  async function sendOtp(resend = false) {
    const normalized = normalizeThaiMobile(phone);
    if (!normalized) {
      setError("กรอกเบอร์มือถือไทย 10 หลัก เช่น 08x-xxx-xxxx");
      return;
    }

    setLoading(true);
    setError(null);
    if (!resend) setDevCode(null);

    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        retryAfterSec?: number;
        expiresIn?: number;
        devCode?: string;
      };

      if (!res.ok || !data.ok) {
        if (typeof data.retryAfterSec === "number" && data.retryAfterSec > 0) {
          setCooldown(data.retryAfterSec);
        }
        setError(data.error || "ส่งรหัสไม่สำเร็จ");
        return;
      }

      if (data.devCode) setDevCode(data.devCode);
      setCooldown(
        typeof data.retryAfterSec === "number" && data.retryAfterSec > 0
          ? data.retryAfterSec
          : 60
      );
      setStep("otp");
      if (resend) setCode("");
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const normalized = normalizeThaiMobile(phone);
    const otp = digitsOnly(code);
    if (!normalized) {
      setError("เบอร์มือถือไม่ถูกต้อง");
      return;
    }
    if (otp.length < 4) {
      setError("กรอกรหัส OTP จาก SMS");
      return;
    }

    setLoading(true);
    setError(null);
    rememberCallback(callbackUrl);

    try {
      const next = safeCallback(callbackUrl);
      const wantPay = wantsCheckoutAfterLogin(next);
      const returnPath = next.split("?")[0] || "/premium";

      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          code: otp,
          checkout: wantPay,
          returnPath,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        checkoutUrl?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || "รหัสไม่ถูกต้อง");
        return;
      }

      if (data.checkoutUrl) {
        window.location.replace(data.checkoutUrl);
        return;
      }
      window.location.replace(next);
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  const fieldH = compact ? "h-10" : "h-12";
  const btnText = compact ? "text-[13.5px]" : "text-[15px]";
  const labelText = compact ? "text-[11px]" : "text-[12px]";
  const gap = compact ? "space-y-2" : "space-y-3";

  return (
    <div className={cn("w-full text-left", className)}>
      {step === "phone" ? (
        <form
          className={gap}
          onSubmit={(e) => {
            e.preventDefault();
            void sendOtp(false);
          }}
        >
          <label className="block">
            <span
              className={cn(
                "mb-1 block font-medium tracking-wide text-[#e8d19a]/85",
                labelText
              )}
            >
              เบอร์มือถือ
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="send"
              placeholder="08x-xxx-xxxx"
              value={phone}
              onChange={(e) => {
                setPhone(formatThaiMobileInput(e.target.value));
                setError(null);
              }}
              className={cn(
                "phone-login-input w-full rounded-full px-3.5 text-[16px] leading-normal text-[#f7f4ec] outline-none transition placeholder:text-[#9aa3b2]/55 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35",
                fieldH
              )}
              style={{
                background: "rgba(16,24,39,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
                WebkitTextFillColor: "#f7f4ec",
                color: "#f7f4ec",
                fontSize: 16,
                transform: "none",
                zoom: 1,
              }}
            />
          </label>
          <button
            type="submit"
            disabled={loading || digitsOnly(phone).length < 9}
            className={cn(
              "mae-gold-cta inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-45",
              fieldH,
              btnText
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
                กำลังส่งรหัส…
              </>
            ) : (
              "รับรหัส OTP"
            )}
          </button>
        </form>
      ) : (
        <form
          className={gap}
          onSubmit={(e) => {
            e.preventDefault();
            void verifyOtp();
          }}
        >
          <p className="text-[12px] leading-snug text-[#c5cdd9]/75">
            ส่งรหัสไปที่{" "}
            <span className="font-medium text-[#e8d19a]">{phone}</span>
            {" · "}
            <button
              type="button"
              className="underline decoration-[#d5b16f]/40 underline-offset-2 outline-none transition hover:text-[#f7f4ec]"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
                setDevCode(null);
              }}
            >
              เปลี่ยนเบอร์
            </button>
          </p>
          <label className="block">
            <span
              className={cn(
                "mb-1 block font-medium tracking-wide text-[#e8d19a]/85",
                labelText
              )}
            >
              รหัส OTP
            </span>
            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="รหัส 6 หลัก"
              value={code}
              maxLength={8}
              onChange={(e) => {
                setCode(digitsOnly(e.target.value).slice(0, 8));
                setError(null);
              }}
              className={cn(
                "phone-login-input w-full rounded-full px-3.5 text-center text-[16px] font-semibold leading-normal tracking-[0.3em] text-[#f7f4ec] outline-none transition placeholder:tracking-normal placeholder:text-[#9aa3b2]/55 focus-visible:ring-2 focus-visible:ring-[#d5b16f]/35",
                fieldH
              )}
              style={{
                background: "rgba(16,24,39,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
                WebkitTextFillColor: "#f7f4ec",
                color: "#f7f4ec",
                fontSize: 16,
                transform: "none",
                zoom: 1,
              }}
            />
          </label>
          {devCode ? (
            <p className="text-center text-[11px] text-[#e8d19a]/70">
              Dev OTP: {devCode}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading || digitsOnly(code).length < 4}
            className={cn(
              "mae-gold-cta inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-45",
              fieldH,
              btnText
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
                กำลังยืนยัน…
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
          <button
            type="button"
            disabled={loading || cooldown > 0}
            onClick={() => void sendOtp(true)}
            className="w-full py-1 text-center text-[12px] font-medium text-[#e8d19a]/85 outline-none transition hover:text-[#f7f4ec] disabled:opacity-45"
          >
            {cooldown > 0 ? `ส่งรหัสใหม่ได้ใน ${cooldown}s` : "ส่งรหัสใหม่"}
          </button>
        </form>
      )}

      {error ? (
        <p className="mt-2 text-center text-[12px] leading-snug text-[#ff8fa3]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
