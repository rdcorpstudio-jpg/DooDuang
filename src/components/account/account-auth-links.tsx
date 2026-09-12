"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2, X } from "lucide-react";
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

function LinkChip({
  label,
  linked,
  busy,
  onClick,
}: {
  label: string;
  linked: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={linked || busy}
      onClick={onClick}
      className={cn(
        "flex min-w-[4.6rem] flex-col items-center justify-center rounded-[10px] px-1.5 py-1.5 text-center outline-none transition active:scale-[0.98] disabled:active:scale-100",
        linked
          ? "cursor-default opacity-90"
          : "hover:bg-[rgba(213,177,111,0.12)]"
      )}
      style={{
        background: linked
          ? "rgba(213,177,111,0.14)"
          : "rgba(213,177,111,0.06)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
      }}
    >
      <span className="text-[10px] font-semibold leading-tight text-[#f7f4ec]">
        {busy ? "…" : label}
      </span>
      <span
        className={cn(
          "mt-0.5 text-[9px] font-medium leading-tight",
          linked ? "text-[#e8d19a]" : "text-[#d5b16f]"
        )}
      >
        {linked ? "เชื่อมแล้ว" : "เชื่อม"}
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
      <div className="flex flex-col gap-1">
        <LinkChip
          label="Google"
          linked={google}
          busy={busy === "google"}
          onClick={() => void linkGoogle()}
        />
        <LinkChip
          label="LINE"
          linked={line}
          busy={busy === "line"}
          onClick={linkLine}
        />
        <LinkChip
          label="เบอร์"
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
