"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Loader2, Lock, X } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";

type Step = "ready" | "redirecting";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

/** Stripe Checkout for 399 premium unlock — requires Google login first */
export function FortunePaymentSheet({
  open,
  onClose,
  onPaid,
  returnPath,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  returnPath?: string;
}) {
  const titleId = useId();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [step, setStep] = useState<Step>("ready");
  const [error, setError] = useState<string | null>(null);

  const resolvedReturn =
    returnPath ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/premium");

  const refreshSession = useCallback(async () => {
    setLoadingSession(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json()) as { user?: SessionUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep("ready");
    setError(null);
    void refreshSession();
  }, [open, refreshSession]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function startCheckout() {
    setError(null);
    setStep("redirecting");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: PREMIUM_UNLOCK.id,
          returnPath: resolvedReturn.split("?")[0] || "/premium",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        code?: string;
      };

      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        setUser(null);
        setStep("ready");
        setError("กรุณาเข้าสู่ระบบด้วย Google ก่อนชำระเงิน");
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "สร้างลิงก์ชำระเงินไม่สำเร็จ");
      }

      window.location.href = data.url;
    } catch (err) {
      setStep("ready");
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#050810]/72 backdrop-blur-[6px]"
        aria-label="ปิด"
        onClick={step === "redirecting" ? undefined : onClose}
      />

      <div
        className="relative z-[1] w-full max-w-[420px] overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(165deg, rgba(14,16,34,0.98), rgba(18,16,28,0.99))",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <span className="h-9 w-9" />
          <div className="text-center">
            <p
              id={titleId}
              className="text-[13px] font-semibold tracking-[0.14em] text-[#E4C56A]"
            >
              ชำระเงิน
            </p>
            <p className="mt-0.5 text-[12px] text-[#9AB8DC]">ดวงพรีเมียม</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === "redirecting"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9AB8DC] outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-40"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-[1] space-y-4 px-4 pb-6 pt-2">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
            <p className="text-[12px] text-[#9AB8DC]">ราคาปลดล็อก</p>
            <p className="mt-1 font-sacred text-[2rem] text-[#F7F8FF]">
              {FORTUNE_UNLOCK_PRICE}
              <span className="ml-1 text-[1rem] text-[#E4C56A]">บาท</span>
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#B7C3D8]">
              ชำระผ่าน Stripe · ปลอดภัย
            </p>
          </div>

          {loadingSession ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-[#9AB8DC]">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังตรวจสอบสถานะเข้าสู่ระบบ…
            </div>
          ) : !user ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#E4C56A]" />
                <p className="text-[13px] leading-relaxed text-[#D5E0F0]">
                  ก่อนชำระเงินทุกครั้ง ต้องเข้าสู่ระบบด้วย Google ก่อน
                </p>
              </div>
              <GoogleSignInButton
                label="ล็อกอินด้วย Google เพื่อชำระเงิน"
                onSuccess={async () => {
                  await refreshSession();
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-[12px] text-[#9AB8DC]">
                เข้าสู่ระบบแล้ว
                {user.email ? ` · ${user.email}` : ""}
              </p>
              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={step === "redirecting"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-semibold text-[#1A1208] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#E4C56A]/5 disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 40%, #C9922E 100%)",
                }}
              >
                {step === "redirecting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังไปหน้า Stripe…
                  </>
                ) : (
                  <>ชำระ {FORTUNE_UNLOCK_PRICE} บาทด้วย Stripe</>
                )}
              </button>
            </div>
          )}

          {error ? (
            <p className="text-center text-[12px] text-rose-300/90">{error}</p>
          ) : null}

          <p className="text-center text-[11px] leading-relaxed text-white/35">
            หลังชำระสำเร็จ ระบบจะปลดล็อกพรีเมียมให้อัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}

/** Confirm Stripe return and unlock local premium entitlement. */
export async function confirmStripePremiumUnlock(sessionId: string) {
  const res = await fetch("/api/stripe/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    premiumUnlocked?: boolean;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "ยืนยันการชำระไม่สำเร็จ");
  }
  return data;
}
