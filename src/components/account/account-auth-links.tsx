"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2, Phone, X } from "lucide-react";
import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";
import { normalizeThaiMobile } from "@/lib/phone";
import type { AccountLinkStatus } from "@/lib/account-links";
import { cn } from "@/lib/utils";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatThaiMobileInput(raw: string) {
  let d = digitsOnly(raw);
  if (d.startsWith("66") && d.length > 2) d = `0${d.slice(2)}`;
  if (d.length > 10) d = d.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

const LINK_ERROR_COPY: Record<string, string> = {
  taken: "บัญชีนี้ถูกใช้กับบัญชีอื่นแล้ว",
  denied: "ยกเลิกการเชื่อม LINE",
  auth: "ต้องเข้าสู่ระบบก่อนเชื่อมบัญชี",
  state: "เซสชันหมดอายุ ลองเชื่อมใหม่",
  missing: "ข้อมูล LINE ไม่ครบ",
  failed: "เชื่อมบัญชีไม่สำเร็จ",
};

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={cn("h-3 w-3", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-3 w-3", className)}
      fill="currentColor"
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94a.63.63 0 0 1-.63.629.63.63 0 0 1-.63-.629V8.108c0-.27.173-.51.43-.595.063-.022.136-.033.2-.033.211 0 .391.09.51.25l2.445 3.32V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.63.629-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.957 12 .957S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function LinkChip({
  variant,
  linked,
  busy,
  onClick,
}: {
  variant: "google" | "line" | "phone";
  linked: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  const label =
    variant === "google" ? "Google" : variant === "line" ? "LINE" : "เบอร์";
  const status = linked ? "เชื่อมแล้ว" : busy ? "…" : "เชื่อม";

  return (
    <button
      type="button"
      disabled={linked || busy}
      onClick={onClick}
      aria-label={`${label} ${status}`}
      className={cn(
        "flex h-[2.35rem] min-w-[5.1rem] items-center justify-center gap-1 rounded-full px-2 outline-none transition active:scale-[0.98] disabled:active:scale-100",
        variant === "google" &&
          "border border-[#dadce0] bg-white shadow-none disabled:opacity-95",
        variant === "line" && "text-white disabled:opacity-95",
        variant === "phone" &&
          "mae-gold-cta text-[#1a1408] disabled:opacity-95",
        linked && "cursor-default"
      )}
      style={
        variant === "line"
          ? {
              background: "#06C755",
              boxShadow: linked ? undefined : "0 4px 10px rgba(6,199,85,0.18)",
            }
          : undefined
      }
    >
      {busy ? (
        <Loader2
          className={cn(
            "h-3 w-3 animate-spin",
            variant === "google" ? "text-[#3c4043]" : undefined
          )}
          strokeWidth={2.2}
        />
      ) : variant === "google" ? (
        <GoogleMark />
      ) : variant === "line" ? (
        <LineMark className="text-white" />
      ) : (
        <Phone className="h-3 w-3 text-[#1a1408]" strokeWidth={2.2} />
      )}
      <span
        className={cn(
          "flex min-w-0 flex-col items-start leading-none",
          variant === "google" && "text-[#3c4043]",
          variant === "line" && "text-white",
          variant === "phone" && "text-[#1a1408]"
        )}
      >
        <span className="text-[9px] font-semibold">{label}</span>
        <span
          className={cn(
            "mt-0.5 text-[8px] font-medium",
            variant === "google" && (linked ? "text-[#5f6368]" : "text-[#3c4043]/75"),
            variant === "line" && (linked ? "text-white/85" : "text-white/90"),
            variant === "phone" && (linked ? "text-[#1a1408]/75" : "text-[#1a1408]/8")
          )}
        >
          {status}
        </span>
      </span>
    </button>
  );
}

function PhoneLinkSheet({
  open,
  onClose,
  onLinked,
}: {
  open: boolean;
  onClose: () => void;
  onLinked: () => void;
}) {
  const titleId = useId();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setHost(document.querySelector(".phone-frame") as HTMLElement | null);
  }, []);

  useEffect(() => {
    if (!open) {
      setStep("phone");
      setPhone("");
      setCode("");
      setError(null);
      setDevCode(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

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
      const res = await fetch("/api/auth/link/phone/send", {
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
        if (typeof data.retryAfterSec === "number") {
          setCooldown(data.retryAfterSec);
        }
        setError(data.error || "ส่งรหัสไม่สำเร็จ");
        return;
      }
      setCooldown(
        typeof data.retryAfterSec === "number" && data.retryAfterSec > 0
          ? data.retryAfterSec
          : 60
      );
      if (data.devCode) setDevCode(data.devCode);
      setStep("otp");
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const normalized = normalizeThaiMobile(phone);
    if (!normalized || !/^\d{6}$/.test(code.trim())) {
      setError("กรอกรหัส 6 หลัก");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/link/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || "ยืนยันไม่สำเร็จ");
        return;
      }
      onLinked();
      onClose();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  if (!open || !host) return null;

  return createPortal(
    <div className="absolute inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 pb-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[360px] rounded-[20px] px-4 pb-4 pt-3"
        style={{
          background: "#101827",
          boxShadow:
            "inset 0 0 0 1px rgba(213,177,111,0.42), 0 24px 56px rgba(0,0,0,0.4)",
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 id={titleId} className="text-[15px] font-semibold text-[#f7f4ec]">
            เชื่อมเบอร์มือถือ
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#f7f4ec]/70 outline-none"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {step === "phone" ? (
          <div className="space-y-3">
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08x-xxx-xxxx"
              value={phone}
              onChange={(e) => setPhone(formatThaiMobileInput(e.target.value))}
              className="w-full rounded-full px-3.5 py-2.5 text-[16px] text-[#f7f4ec] outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
            />
            {error ? (
              <p className="text-[12px] text-[#f0a8a8]">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={loading || digitsOnly(phone).length < 9}
              onClick={() => void sendOtp(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-semibold text-[#1a1408] outline-none disabled:opacity-55"
              style={{
                background: "linear-gradient(180deg, #f0d9a0 0%, #d5b16f 100%)",
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              ส่งรหัส OTP
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-[#f7f4ec]/65">
              ส่งรหัสไปที่{" "}
              <span className="font-medium text-[#e8d19a]">{phone}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="รหัส 6 หลัก"
              value={code}
              onChange={(e) => setCode(digitsOnly(e.target.value).slice(0, 6))}
              className="w-full rounded-full px-3.5 py-2.5 text-center text-[16px] font-semibold tracking-[0.3em] text-[#f7f4ec] outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
              }}
            />
            {devCode ? (
              <p className="text-[11px] text-[#e8d19a]/80">dev: {devCode}</p>
            ) : null}
            {error ? (
              <p className="text-[12px] text-[#f0a8a8]">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={loading || code.length !== 6}
              onClick={() => void verifyOtp()}
              className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[14px] font-semibold text-[#1a1408] outline-none disabled:opacity-55"
              style={{
                background: "linear-gradient(180deg, #f0d9a0 0%, #d5b16f 100%)",
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              ยืนยันและเชื่อม
            </button>
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => void sendOtp(true)}
              className="w-full text-center text-[12px] text-[#d5b16f] outline-none disabled:opacity-50"
            >
              {cooldown > 0 ? `ส่งใหม่ได้ใน ${cooldown}s` : "ส่งรหัสอีกครั้ง"}
            </button>
          </div>
        )}
      </div>
    </div>,
    host
  );
}

/** Compact Google / LINE / phone link controls for account header */
export function AccountAuthLinks({ className }: { className?: string }) {
  const [links, setLinks] = useState<AccountLinkStatus | null>(null);
  const [providers, setProviders] = useState({
    google: true,
    line: true,
    phone: true,
  });
  const [busy, setBusy] = useState<"google" | "line" | "phone" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/links", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        links?: AccountLinkStatus;
        providers?: { google?: boolean; line?: boolean; phone?: boolean };
      };
      if (data.links) setLinks(data.links);
      if (data.providers) {
        setProviders({
          google: data.providers.google !== false,
          line: data.providers.line !== false,
          phone: data.providers.phone !== false,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("linkError");
    const linked = params.get("linked");
    if (err) {
      setMessage(LINK_ERROR_COPY[err] || LINK_ERROR_COPY.failed);
    } else if (linked === "line") {
      setMessage("เชื่อม LINE แล้ว");
      void refresh();
    }
    if (err || linked) {
      params.delete("linkError");
      params.delete("linked");
      const next = `${window.location.pathname}${
        params.toString() ? `?${params}` : ""
      }`;
      window.history.replaceState({}, "", next);
    }
  }, [refresh]);

  async function linkGoogle() {
    if (!providers.google || !isFirebaseClientConfigured()) {
      setMessage("ยังไม่ได้ตั้งค่า Google Login");
      return;
    }
    setBusy("google");
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/link/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setMessage(data.error || "เชื่อม Google ไม่สำเร็จ");
        return;
      }
      setMessage("เชื่อม Google แล้ว");
      await refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      if (/popup-closed|cancelled/i.test(raw)) {
        setMessage(null);
      } else {
        setMessage("เชื่อม Google ไม่สำเร็จ");
      }
    } finally {
      setBusy(null);
    }
  }

  function linkLine() {
    if (!providers.line) {
      setMessage("ยังไม่ได้ตั้งค่า LINE Login");
      return;
    }
    setBusy("line");
    window.location.href = `/api/auth/line/start?link=1&callbackUrl=${encodeURIComponent(
      "/dashboard"
    )}`;
  }

  const google = links?.google ?? false;
  const line = links?.line ?? false;
  const phone = links?.phone ?? false;

  return (
    <div className={cn("flex shrink-0 flex-col items-end gap-1", className)}>
      <div className="flex flex-col gap-1.5">
        <LinkChip
          variant="google"
          linked={google}
          busy={busy === "google"}
          onClick={() => void linkGoogle()}
        />
        <LinkChip
          variant="line"
          linked={line}
          busy={busy === "line"}
          onClick={linkLine}
        />
        <LinkChip
          variant="phone"
          linked={phone}
          busy={busy === "phone"}
          onClick={() => {
            setMessage(null);
            setPhoneOpen(true);
          }}
        />
      </div>
      {links?.phoneMasked ? (
        <p className="max-w-[5.5rem] truncate text-right text-[9px] text-[#f7f4ec]/45">
          {links.phoneMasked}
        </p>
      ) : null}
      {message ? (
        <p className="max-w-[6.5rem] text-right text-[9px] leading-snug text-[#e8d19a]">
          {message}
        </p>
      ) : null}
      <PhoneLinkSheet
        open={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        onLinked={() => {
          setMessage("เชื่อมเบอร์แล้ว");
          void refresh();
        }}
      />
    </div>
  );
}
