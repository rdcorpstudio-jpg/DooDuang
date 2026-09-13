"use client";

import { useCallback, useEffect, useId, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, CreditCard, Loader2, Lock, QrCode } from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  FORTUNE_PACKAGE_LABEL,
  FORTUNE_UNLOCK_PRICE,
  APP_BRAND_MARK,
} from "@/lib/site";
import {
  PREMIUM_UNLOCK,
  type CheckoutPaymentMethod,
} from "@/lib/stripe-catalog";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const MAE_PANEL: CSSProperties = {
  background: "#101827",
  boxShadow:
    "inset 0 0 0 1px rgba(213,177,111,0.42), 0 24px 56px rgba(0,0,0,0.4)",
};

const METHODS: {
  id: CheckoutPaymentMethod;
  title: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "card",
    title: "บัตรเครดิต / เดบิต",
    hint: "Visa · Mastercard · Apple Pay",
    icon: CreditCard,
  },
  {
    id: "promptpay",
    title: "PromptPay",
    hint: "สแกน QR ด้วยแอปธนาคาร",
    icon: QrCode,
  },
];

function safeReturnPath(raw: string | null) {
  const fallback = "/premium";
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/auth/")) return fallback;
  return value.split("?")[0] || fallback;
}

/** In-app payment method picker → Stripe Checkout for the chosen method. */
export function PremiumPayPage() {
  const titleId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("return"));
  const cancelled = searchParams.get("payment") === "cancelled";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [method, setMethod] = useState<CheckoutPaymentMethod>("promptpay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    cancelled ? "ยกเลิกการชำระแล้ว เลือกวิธีชำระอีกครั้งได้" : null
  );

  useStripePaymentReturn();

  const refreshSession = useCallback(async () => {
    setLoadingSession(true);
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
    void refreshSession();
  }, [refreshSession]);

  const startCheckout = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: PREMIUM_UNLOCK.id,
          returnPath: "/premium/pay",
          paymentMethod: method,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        code?: string;
      };

      if (res.status === 401 || data.code === "UNAUTHENTICATED") {
        setUser(null);
        setSubmitting(false);
        setError("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "สร้างลิงก์ชำระเงินไม่สำเร็จ");
      }

      window.location.href = data.url;
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }, [method]);

  return (
    <AnimatedPage>
      <div
        className="mx-auto flex min-h-full w-full max-w-[400px] flex-col justify-center px-4 py-6"
        role="main"
        aria-labelledby={titleId}
      >
        <div className="relative z-10 mb-3 grid grid-cols-[1fr_auto_1fr] items-center px-0.5">
          <button
            type="button"
            onClick={submitting ? undefined : () => router.push(returnPath)}
            disabled={submitting}
            className="inline-flex items-center gap-0.5 justify-self-start text-[13px] font-medium text-white/80 outline-none transition active:opacity-60 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            กลับ
          </button>
          <span className="justify-self-center" aria-hidden />
          <span className="justify-self-end" aria-hidden />
        </div>

        <div
          className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[22px]"
          style={MAE_PANEL}
        >
          <div className="relative z-[1] mx-auto w-full px-6 pb-6 pt-7">
            <div className="flex flex-col items-center text-center">
              <p className="mae-gold-text text-[10px] font-semibold tracking-[0.28em]">
                {APP_BRAND_MARK}
              </p>
              <h1
                id={titleId}
                className="mae-gold-text mt-3 font-sans text-[1.35rem] font-bold leading-tight tracking-tight"
              >
                ชำระเงิน
              </h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#9aa3b2]">
                ตรวจสอบรายการแล้วเลือกวิธีชำระ
              </p>
            </div>

            <div
              className="mt-5 rounded-[16px] px-4 py-3.5 text-left"
              style={{
                background: "rgba(255,255,255,0.03)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
              }}
            >
              <p className="text-[11px] tracking-wide text-[#9aa3b2]">
                สรุปคำสั่งซื้อ
              </p>
              <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-[#e8ecf2]">
                สิทธิ์ดูดวงแม่มั่งมี {FORTUNE_PACKAGE_LABEL}เต็ม
              </p>
              <p className="mt-3 text-[1.55rem] font-bold tabular-nums tracking-tight text-[#f7f4ec]">
                ฿{FORTUNE_UNLOCK_PRICE}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#9aa3b2]">
                เข้าถึงพรีเมียมผ่านบัญชีของคุณหลังชำระสำเร็จ
              </p>
            </div>

            <p className="mt-5 text-left text-[11px] font-medium tracking-wide text-[#9aa3b2]">
              วิธีชำระเงิน
            </p>

            <div className="mt-2.5 space-y-2.5" role="radiogroup" aria-label="วิธีชำระเงิน">
              {METHODS.map((item) => {
                const selected = method === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={submitting}
                    onClick={() => setMethod(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60",
                      selected
                        ? "bg-[rgba(213,177,111,0.1)]"
                        : "bg-white/[0.03] hover:bg-white/[0.05]"
                    )}
                    style={{
                      boxShadow: selected
                        ? "inset 0 0 0 1.5px rgba(213,177,111,0.7)"
                        : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: selected
                          ? "rgba(213,177,111,0.14)"
                          : "rgba(255,255,255,0.04)",
                        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
                      }}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          selected ? "text-[#d5b16f]" : "text-[#9aa3b2]"
                        )}
                        strokeWidth={2}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-[#f7f4ec]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#9aa3b2]">
                        {item.hint}
                      </span>
                    </span>
                    <span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{
                        boxShadow: selected
                          ? "inset 0 0 0 5px #d5b16f"
                          : "inset 0 0 0 1.5px rgba(154,163,178,0.55)",
                      }}
                      aria-hidden
                    >
                      {selected ? (
                        <Check className="h-2.5 w-2.5 text-[#101827]" strokeWidth={3} />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-3">
              {loadingSession ? (
                <div className="flex items-center justify-center gap-2 py-2 text-[12px] text-[#9aa3b2]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังตรวจสอบสถานะ…
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="mx-auto max-w-[16rem] text-center text-[11px] leading-relaxed text-[#9aa3b2]">
                    เข้าสู่ระบบเพื่อยืนยันสิทธิ์พรีเมียมหลังชำระ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/login?callbackUrl=${encodeURIComponent("/premium/pay")}`
                      );
                    }}
                    className="mae-gold-cta flex w-full items-center justify-center rounded-full px-4 py-3.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.email ? (
                    <p className="text-center text-[11px] text-[#9aa3b2]">
                      {user.email}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void startCheckout()}
                    disabled={submitting}
                    className="mae-gold-cta flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        กำลังไปหน้า Stripe…
                      </>
                    ) : (
                      <>ชำระ {FORTUNE_UNLOCK_PRICE} บาท</>
                    )}
                  </button>
                </div>
              )}

              {error ? (
                <p className="text-center text-[12px] text-rose-300">{error}</p>
              ) : null}

              <p className="flex items-start justify-center gap-1.5 pt-0.5 text-center text-[10px] leading-relaxed text-[#6b7380]">
                <Lock
                  className="mt-0.5 h-3 w-3 shrink-0 text-[#d5b16f]/80"
                  strokeWidth={2.2}
                />
                <span>
                  ชำระผ่าน Stripe Checkout — กรอกบัตรหรือสแกน QR บนหน้าของ Stripe
                  โดยตรง เราไม่เก็บเลขบัตร
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
