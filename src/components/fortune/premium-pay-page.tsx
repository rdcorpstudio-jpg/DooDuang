"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
} from "lucide-react";
import { AnimatedPage } from "@/components/ui/reveal";
import { PageBackButton } from "@/components/ui/page-back-button";
import { PremiumOfferUrgencyLine } from "@/components/fortune/premium-offer-countdown";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  APP_PAGE_BG,
} from "@/components/layout/bottom-nav";
import { MaeBrandLink } from "@/components/layout/mae-brand-link";
import { MaePageBackground } from "@/components/layout/mae-page-background";
import {
  FORTUNE_PACKAGE_LABEL,
  FORTUNE_UNLOCK_LIST_PRICE,
  FORTUNE_UNLOCK_PRICE,
} from "@/lib/site";
import {
  isLocalPremiumBypass,
  setPremiumUnlocked,
} from "@/lib/fortune/premium-unlock";
import { readFortuneProfile } from "@/lib/fortune/profile-storage";
import {
  PREMIUM_UNLOCK,
  type CheckoutPaymentMethod,
} from "@/lib/stripe-catalog";
import { featureFromPath } from "@/lib/analytics/events";
import { trackClientEvent, trackOfferView } from "@/lib/analytics/client";
import { readLastFeature } from "@/lib/analytics/last-feature";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";
import { startMaeNavigation } from "@/components/layout/navigation-loading";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const GOLD = "#e8d19a";
const GOLD_SOFT = "#efc36c";
const GOLD_BTN =
  "linear-gradient(100deg, #ffe999 0%, #e5b84d 50%, #cda451 100%)";
const GOLD_RING =
  "linear-gradient(155deg, #fff8e4 0%, #e8d19a 28%, #d5b16f 58%, #b8924f 82%, #8f6e38 100%)";
const GLASS = MAE_GLASS;

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

const COMPARE_ROWS = [
  "ดวงรายวันเบื้องต้น",
  "ไพ่ทาโรต์",
  "ดวงรายสัปดาห์ · แนวโน้มเดือน",
  "ปฏิทินฤกษ์มงคลเต็ม",
  "แผนที่ตัวตน · ราศีเชิงลึก",
  "รายงานดวงปีเต็ม",
  "โหงวเฮ้ง · ลายมือ · ดวงคู่",
  "จังหวะงาน เงิน ความรัก",
  "บันทึกโปรไฟล์ดูซ้ำได้ทั้งปี",
  "อัปเดตคำแนะนำตามจังหวะชีวิต",
  "ดูดวงไม่จำกัดตลอดปี",
  "สิทธิ์ใหม่ก่อนใคร",
] as const;

function PremiumCheck() {
  return (
    <Check
      className="h-4 w-4 shrink-0"
      strokeWidth={2.8}
      style={{ color: GOLD_SOFT }}
      aria-hidden
    />
  );
}

const goldTextStyle: CSSProperties = {
  backgroundImage: GOLD_RING,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

function safeReturnPath(raw: string | null) {
  const fallback = "/welcome/preview";
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/auth/")) return fallback;
  if (value.startsWith("/premium/pay")) return fallback;
  return value.split("?")[0] || fallback;
}

/** In-app payment method picker → Stripe Checkout for the chosen method. */
export function PremiumPayPage() {
  const titleId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("return"));
  const cancelled = searchParams.get("payment") === "cancelled";
  const localSim = isLocalPremiumBypass();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(!localSim);
  const [method, setMethod] = useState<CheckoutPaymentMethod>("promptpay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    cancelled ? "ยกเลิกการชำระแล้ว เลือกวิธีชำระอีกครั้งได้" : null
  );
  const payViewTracked = useRef(false);

  useStripePaymentReturn();

  useEffect(() => {
    if (payViewTracked.current) return;
    payViewTracked.current = true;
    const fromReturn = featureFromPath(returnPath);
    const feature = fromReturn || readLastFeature();
    trackOfferView({
      path: "/premium/pay",
      feature,
    });
    trackClientEvent({
      name: "pay_view",
      feature,
      path: "/premium/pay",
      props: {
        visitorId: getOrCreateVisitorId(),
        returnPath,
        localSim,
      },
    });
  }, [returnPath, localSim]);

  const refreshSession = useCallback(async () => {
    if (localSim) {
      setLoadingSession(false);
      return;
    }
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
  }, [localSim]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const simulateLocalPaid = useCallback(() => {
    const profile = readFortuneProfile();
    setPremiumUnlocked(
      profile
        ? { birthDate: profile.birthDate, nickname: profile.nickname }
        : null,
    );
    startMaeNavigation();
    router.replace("/premium/thanks");
  }, [router]);

  const startCheckout = useCallback(async () => {
    if (localSim) {
      simulateLocalPaid();
      return;
    }
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
  }, [localSim, method, simulateLocalPaid]);

  const goLogin = () => {
    const payUrl =
      returnPath && returnPath !== "/welcome/preview"
        ? `/premium/pay?return=${encodeURIComponent(returnPath)}`
        : "/premium/pay";
    router.push(`/login?callbackUrl=${encodeURIComponent(payUrl)}`);
  };

  const saved = FORTUNE_UNLOCK_LIST_PRICE - FORTUNE_UNLOCK_PRICE;

  return (
    <AnimatedPage className="h-full">
      <div
        className="relative mx-auto h-full min-h-full w-full max-w-[430px] overflow-x-hidden overflow-y-auto overscroll-contain"
        role="main"
        aria-labelledby={titleId}
      >
        <MaePageBackground priority />
        <div className="relative z-[1] flex min-h-full flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-6">
          <div className="relative mb-1">
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <MaeBrandLink />
              <PageBackButton
                onClick={submitting ? undefined : () => router.push(returnPath)}
                className={submitting ? "pointer-events-none opacity-40" : undefined}
              />
            </div>

            <div className="mt-4 max-w-[20rem]">
              <h1
                id={titleId}
                className="mae-gold-text mae-pay-title text-[2.05rem] font-bold leading-[1.3] tracking-tight"
                style={{ fontWeight: 700 }}
              >
                พรีเมียม {FORTUNE_PACKAGE_LABEL}
              </h1>
              <p
                className="mt-2 text-[15.5px] font-medium leading-[1.45] text-white"
              >
                ดูดวงได้เต็มที่ ตลอดทั้งปี
              </p>
            </div>
          </div>

          <div
            className="mt-4 overflow-hidden rounded-[22px]"
            style={{
              background: GLASS.bg,
              border: GLASS.border,
              boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
              backdropFilter: GLASS.blur,
              WebkitBackdropFilter: GLASS.blur,
            }}
          >
            <div className="shrink-0 px-4 pb-2.5 pt-3.5">
              <PremiumOfferUrgencyLine />

              <div
                className="mt-3.5 pb-3"
                style={{ borderBottom: "1px solid rgba(213,177,111,0.18)" }}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <p className="flex items-baseline gap-1.5 leading-none">
                    <span
                      className="flex items-baseline text-[2.35rem] font-semibold tracking-tight"
                      style={goldTextStyle}
                    >
                      <span className="mr-0.5 text-[1.35rem] font-semibold">฿</span>
                      {FORTUNE_UNLOCK_PRICE}
                    </span>
                    <span
                      className="text-[15.5px] font-medium tracking-wide text-white/80"
                    >
                      / 1 ปี
                    </span>
                  </p>
                  <span
                    className="text-[15.5px] font-medium text-white/45 line-through"
                  >
                    ฿{FORTUNE_UNLOCK_LIST_PRICE.toLocaleString("th-TH")}
                  </span>
                  <span
                    className="ml-auto inline-flex rounded-full p-[1.5px]"
                    style={{ backgroundImage: GOLD_RING }}
                  >
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1"
                      style={{ background: APP_PAGE_BG }}
                    >
                      <span
                        className="text-[14px] font-semibold tracking-wide"
                        style={goldTextStyle}
                      >
                        ประหยัด ฿{saved.toLocaleString("th-TH")}
                      </span>
                    </span>
                  </span>
                </div>
                <p
                  className="mt-2.5 flex items-center gap-1.5 text-[15.5px] font-medium text-white/90"
                >
                  <span
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                    style={{ background: GOLD_BTN }}
                  >
                    <Check className="h-3 w-3 text-[#1a1408]" strokeWidth={3} />
                  </span>
                  จ่ายครั้งเดียว · ไม่มีต่ออายุอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="max-h-[15.5rem] overflow-y-auto overscroll-contain px-4 pb-2">
              <div
                className="sticky top-0 z-[1] flex items-center justify-between gap-2 py-2.5"
                style={{
                  borderBottom: "1px solid rgba(213,177,111,0.16)",
                  background: "rgba(6, 20, 42, 0.82)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <p className="text-[15.5px] font-medium text-white/85">
                  สิทธิ์ที่ได้รับ
                </p>
                <p className="mae-gold-text text-[14px] font-semibold">
                  พรีเมียม
                </p>
              </div>

              {COMPARE_ROWS.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 py-2.5 last:border-b-0"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <PremiumCheck />
                  <p className="min-w-0 flex-1 text-[15.5px] font-medium leading-[1.4] text-white">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[15.5px] font-semibold text-white">
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
                      ? "rgba(213,177,111,0.16)"
                      : "rgba(8, 30, 57, 0.48)",
                    border: selected
                      ? "1px solid rgba(232,209,154,0.7)"
                      : "1px solid rgba(213,177,111,0.22)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                  }}
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    style={{ color: selected ? GOLD : "rgba(240,244,250,0.7)" }}
                    strokeWidth={2}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15.5px] font-semibold leading-none text-white">
                      {item.title}
                    </span>
                    <span
                      className="mt-1.5 block truncate text-[14px] leading-none text-white/65"
                    >
                      {item.hint}
                    </span>
                  </span>

                  {selected ? (
                    <Check
                      className="h-5 w-5 shrink-0 text-[#e8d19a]"
                      strokeWidth={2.6}
                      aria-hidden
                    />
                  ) : (
                    <span className="h-5 w-5 shrink-0" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 space-y-2 pb-2">
            {error ? (
              <p className="text-center text-[14px] text-rose-300">{error}</p>
            ) : null}

            {localSim ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={simulateLocalPaid}
                  className="mae-gold-cta flex h-12 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[15.5px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
                >
                  ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
                  <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                </button>
                <p
                  className="text-center text-[13px] font-medium"
                  style={{ color: GOLD_SOFT }}
                >
                  โหมดทดลอง · จำลองชำระสำเร็จ (ไม่เรียก Stripe)
                </p>
              </div>
            ) : !user ? (
              <button
                type="button"
                onClick={goLogin}
                disabled={loadingSession}
                className="mae-gold-cta flex h-12 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[15.5px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
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
                className="mae-gold-cta flex h-12 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[15.5px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
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

            {!localSim && !user && !loadingSession ? (
              <p
                className="text-center text-[14px] font-medium"
                style={{ color: GOLD_SOFT }}
              >
                เข้าสู่ระบบแล้วชำระ · เหลือ 3 สิทธิ์
              </p>
            ) : null}

            <p
              className="flex items-start justify-center gap-1.5 text-center text-[14px] leading-relaxed text-white/50"
            >
              <Lock
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: "rgba(213,177,111,0.7)" }}
                strokeWidth={2.2}
              />
              <span>ตรวจสอบรายการก่อนดำเนินการต่อ</span>
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
