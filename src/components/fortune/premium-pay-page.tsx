"use client";

import { useCallback, useEffect, useId, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
} from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  APP_NAME,
  FORTUNE_PACKAGE_LABEL,
  FORTUNE_UNLOCK_LIST_PRICE,
  FORTUNE_UNLOCK_PRICE,
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

const METHODS: {
  id: CheckoutPaymentMethod;
  title: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "card",
    title: "บัตรเครดิต / เดบิต",
    hint: "Visa · Mastercard",
    icon: CreditCard,
  },
  {
    id: "promptpay",
    title: "PromptPay",
    hint: "สแกนผ่านแอปธนาคาร",
    icon: QrCode,
  },
];

const COMPARE_ROWS: {
  label: string;
  free: boolean;
  premium: boolean;
}[] = [
  { label: "ดวงรายวันเบื้องต้น", free: true, premium: true },
  { label: "ไพ่ทาโรต์", free: true, premium: true },
  { label: "ดวงรายสัปดาห์ · แนวโน้มเดือน", free: false, premium: true },
  { label: "ปฏิทินฤกษ์มงคลเต็ม", free: false, premium: true },
  { label: "แผนที่ตัวตน · ราศีเชิงลึก", free: false, premium: true },
  { label: "รายงานดวงปีเต็ม", free: false, premium: true },
  { label: "โหงวเฮ้ง · ลายมือ · ดวงคู่", free: false, premium: true },
  { label: "จังหวะงาน เงิน ความรัก", free: false, premium: true },
  { label: "บันทึกโปรไฟล์ดูซ้ำได้ทั้งปี", free: false, premium: true },
  { label: "อัปเดตคำแนะนำตามจังหวะชีวิต", free: false, premium: true },
  { label: "ดูดวงไม่จำกัดตลอดปี", free: false, premium: true },
  { label: "สิทธิ์ใหม่ก่อนใคร", free: false, premium: true },
];

function CellMark({ on, tone }: { on: boolean; tone: "free" | "premium" }) {
  if (!on) {
    return <span className="text-[13px] text-white/25">—</span>;
  }
  if (tone === "premium") {
    return (
      <Check
        className="h-4 w-4"
        strokeWidth={2.8}
        style={{
          color: "#d5b16f",
          filter: "drop-shadow(0 0 4px rgba(213,177,111,0.55))",
        }}
      />
    );
  }
  return <Check className="h-4 w-4 text-[#7dcea0]" strokeWidth={2.6} />;
}

const GOLD_FOIL =
  "linear-gradient(180deg, #fffef8 0%, #ffe9b0 22%, #f0d078 48%, #d5b16f 72%, #b8924f 88%, #8f6e38 100%)";

const goldTextStyle: CSSProperties = {
  backgroundImage: GOLD_FOIL,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.45))",
};

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

  const goLogin = () => {
    router.push(`/login?callbackUrl=${encodeURIComponent("/premium/pay")}`);
  };

  const saved = FORTUNE_UNLOCK_LIST_PRICE - FORTUNE_UNLOCK_PRICE;

  return (
    <AnimatedPage className="h-full">
      <div
        className="relative mx-auto flex h-full min-h-full w-full max-w-[430px] flex-col"
        role="main"
        aria-labelledby={titleId}
      >
        <div className="relative z-[1] flex min-h-full flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.35rem,env(safe-area-inset-top))]">
          {/* Hero — มงอยู่กลางบนใน BG */}
          <div className="relative mb-0.5 min-h-[6.5rem]">
            <div className="flex items-center gap-1 pt-0.5">
              <button
                type="button"
                onClick={submitting ? undefined : () => router.push(returnPath)}
                disabled={submitting}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[#e8d19a] outline-none transition active:opacity-60 disabled:opacity-40"
                aria-label="กลับ"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
              </button>
              <p className="text-[13px] font-medium text-white/55">{APP_NAME}</p>
            </div>

            <div className="mt-1.5 max-w-[78%] pr-1">
              <h1
                id={titleId}
                className="whitespace-nowrap text-[1.95rem] font-bold leading-none tracking-tight"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #fffef8 0%, #ffe9b0 22%, #f0d078 48%, #d5b16f 72%, #b8924f 88%, #8f6e38 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55))",
                }}
              >
                พรีเมียม {FORTUNE_PACKAGE_LABEL}
              </h1>
              <p className="mt-1 text-[15px] font-medium leading-snug text-white">
                ดูดวงได้เต็มที่ ตลอดทั้งปี
              </p>
            </div>
          </div>

          {/* Offer card — ราคาตรึง / ตารางเลื่อนได้ */}
          <div
            className="mt-2 overflow-hidden rounded-[22px]"
            style={{
              background:
                "linear-gradient(165deg, rgba(24,34,52,0.88) 0%, rgba(16,24,39,0.82) 100%)",
              boxShadow:
                "inset 0 0 0 1.5px rgba(232,209,154,0.75), 0 0 24px rgba(213,177,111,0.12)",
            }}
          >
            {/* รูปที่ 2 — บล็อคราคา ไม่เลื่อนตาม */}
            <div className="shrink-0 px-4 pb-2.5 pt-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium text-[#f0d078]/95">
                  สิทธิ์ดูดวงแม่มั่งมี · จ่ายครั้งเดียวใช้ได้ทั้งปี
                </p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#101827]"
                  style={{
                    background: GOLD_FOIL,
                    boxShadow: "0 2px 8px rgba(213,177,111,0.35)",
                  }}
                >
                  รายปี
                </span>
              </div>

              <p
                className="mt-2 text-[1.85rem] font-bold leading-none tracking-tight"
                style={goldTextStyle}
              >
                ฿{FORTUNE_UNLOCK_PRICE}
                <span
                  className="ml-1.5 text-[14px] font-semibold tracking-wide"
                  style={goldTextStyle}
                >
                  / ปี
                </span>
              </p>

              <div className="mt-2 flex items-center gap-2 border-b border-[rgba(232,209,154,0.32)] pb-2.5 text-[12px]">
                <span className="text-white/40 line-through">
                  จาก ฿{FORTUNE_UNLOCK_LIST_PRICE.toLocaleString("th-TH")}
                </span>
                <span className="font-bold" style={goldTextStyle}>
                  ประหยัด ฿{saved.toLocaleString("th-TH")}
                </span>
              </div>
            </div>

            {/* ตารางสิทธิ์ — เลื่อนดูได้ */}
            <div className="max-h-[13.5rem] overflow-y-auto overscroll-contain px-4 pb-2">
              <div className="sticky top-0 z-[1] grid grid-cols-[1fr_2.6rem_3.6rem] items-center gap-1 border-b border-[rgba(232,209,154,0.22)] bg-[rgba(18,28,44,0.96)] py-2.5 backdrop-blur-sm">
                <p className="text-[12px] font-medium text-white/85">
                  สิทธิ์การใช้งาน
                </p>
                <p className="text-center text-[11px] font-semibold text-white/55">
                  ฟรี
                </p>
                <p
                  className="text-center text-[11px] font-bold"
                  style={goldTextStyle}
                >
                  พรีเมียม
                </p>
              </div>

              {COMPARE_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_2.6rem_3.6rem] items-center gap-1 border-b border-white/[0.07] py-2.5 last:border-b-0"
                >
                  <p className="pr-1 text-[12px] leading-snug text-white/88">
                    {row.label}
                  </p>
                  <span className="flex justify-center">
                    <CellMark on={row.free} tone="free" />
                  </span>
                  <span className="flex justify-center">
                    <CellMark on={row.premium} tone="premium" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[13px] font-medium text-white/90">
            เลือกวิธีชำระเงิน
          </p>

          <div
            className="mt-2.5 space-y-2"
            role="radiogroup"
            aria-label="เลือกวิธีชำระเงิน"
          >
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
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-[16px] px-3.5 py-3 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
                  )}
                  style={{
                    background: selected
                      ? "rgba(213,177,111,0.12)"
                      : "rgba(12,20,34,0.55)",
                    boxShadow: selected
                      ? "inset 0 0 0 1.5px rgba(213,177,111,0.95)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.12)",
                  }}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
                    }}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px]",
                        selected ? "text-[#e8d19a]" : "text-white/55"
                      )}
                      strokeWidth={2}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold leading-none text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-[11px] leading-none text-white/45">
                      {item.hint}
                    </span>
                  </span>

                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                    style={
                      selected
                        ? {
                            background:
                              "linear-gradient(145deg, #e8d19a 0%, #d5b16f 100%)",
                          }
                        : {
                            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.35)",
                          }
                    }
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

          <div className="mt-3.5 space-y-2">
            {error ? (
              <p className="text-center text-[12px] text-rose-300">{error}</p>
            ) : null}

            {!user ? (
              <button
                type="button"
                onClick={goLogin}
                disabled={loadingSession}
                className="mae-gold-cta flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
              >
                {loadingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังตรวจสอบ…
                  </>
                ) : (
                  <>
                    ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={submitting}
                className="mae-gold-cta flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังไปหน้า Stripe…
                  </>
                ) : (
                  <>
                    ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
                    <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                  </>
                )}
              </button>
            )}

            {!user && !loadingSession ? (
              <p className="text-center text-[11px] text-[#e8d19a]/80">
                เข้าสู่ระบบแล้วชำระ · เหลือ 3 สิทธิ์
              </p>
            ) : null}

            <p className="flex items-start justify-center gap-1.5 text-center text-[10px] leading-relaxed text-white/40">
              <Lock className="mt-0.5 h-3 w-3 shrink-0 text-[#d5b16f]/70" strokeWidth={2.2} />
              <span>ตรวจสอบรายการก่อนดำเนินการต่อ · ชำระผ่าน Stripe โดยตรง</span>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
