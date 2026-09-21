"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, Loader2, Lock, X } from "lucide-react";
import { PremiumBuyCta } from "@/components/fortune/premium-buy-cta";
import { PremiumOfferUrgencyLine } from "@/components/fortune/premium-offer-countdown";
import { PageBackButton } from "@/components/ui/page-back-button";
import {
  FORTUNE_PACKAGE_LABEL,
  FORTUNE_UNLOCK_LIST_PRICE,
  FORTUNE_UNLOCK_PRICE,
} from "@/lib/site";
import { trackOfferView } from "@/lib/analytics/client";
import { featureFromPath } from "@/lib/analytics/events";
import { isLocalPremiumBypass } from "@/lib/fortune/premium-unlock";
import { MAE_GLASS } from "@/lib/mae-glass";
import { cn } from "@/lib/utils";

type CheckoutStep = "ready" | "redirecting";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const IS_LOCAL_DEV = isLocalPremiumBypass();

const LOGIN_THEN_PAY = "/premium/pay";

/** Mae glass — กรอบเดียวทั้งแอป */
const GLASS = MAE_GLASS;

const GOLD_LINE = "#d5b16f";
const GOLD_SOFT = "#e8d19a";
const TEXT_MUTED = "rgba(186, 204, 230, 0.78)";

const GOLD_FOIL =
  "linear-gradient(180deg, #fffef8 0%, #ffe9b0 22%, #f0d078 48%, #d5b16f 72%, #b8924f 88%, #8f6e38 100%)";

const goldTextStyle: CSSProperties = {
  backgroundImage: GOLD_FOIL,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

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

const AIVA_PANEL: CSSProperties = {
  background: GLASS.bg,
  border: GLASS.border,
  boxShadow: `${GLASS.shadow}, ${GLASS.highlight}`,
  backdropFilter: GLASS.blur,
  WebkitBackdropFilter: GLASS.blur,
};

/** Stripe checkout — sheet modal, full page, or inline card on free result */
export function FortunePaymentSheet({
  open,
  onClose,
  onPaid,
  returnPath,
  variant = "sheet",
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  returnPath?: string;
  /** sheet = overlay modal; page = full premium step; inline = embed on free page */
  variant?: "sheet" | "page" | "inline";
}) {
  const titleId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const isPage = variant === "page";
  const isInline = variant === "inline";
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [step, setStep] = useState<CheckoutStep>("ready");
  const [error, setError] = useState<string | null>(null);
  const [wantsAutoPay, setWantsAutoPay] = useState(false);
  const autoPayStarted = useRef(false);
  const offerViewTracked = useRef(false);

  const resolvedReturn =
    returnPath ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/home");

  const refreshSession = useCallback(async () => {
    setError(null);
    let autoPay = false;
    try {
      autoPay =
        new URLSearchParams(window.location.search).get("checkout") === "1";
    } catch {
      /* ignore */
    }
    if (!autoPay) setLoadingSession(true);
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
    if (!open || offerViewTracked.current) return;
    offerViewTracked.current = true;
    trackOfferView({
      path: pathname,
      feature: featureFromPath(resolvedReturn) || featureFromPath(pathname || ""),
    });
  }, [open, pathname, resolvedReturn]);

  useEffect(() => {
    if (!open) return;
    setStep("ready");
    setError(null);
    autoPayStarted.current = false;
    try {
      setWantsAutoPay(
        new URLSearchParams(window.location.search).get("checkout") === "1"
      );
    } catch {
      setWantsAutoPay(false);
    }
    void refreshSession();
  }, [open, refreshSession]);

  useEffect(() => {
    if (!open || isPage || isInline) return;
    setHost(document.querySelector(".phone-frame") as HTMLElement | null);
  }, [open, isPage, isInline]);

  useEffect(() => {
    if (!open || isPage || isInline) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isPage, isInline]);

  useEffect(() => {
    if (!open || isPage || isInline) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "redirecting") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, step, isPage, isInline]);

  const goToPayPage = useCallback(() => {
    const ret = resolvedReturn.split("?")[0] || "/home";
    const qs = new URLSearchParams();
    if (ret !== "/home" && ret !== "/premium/pay") qs.set("return", ret);
    const path = qs.size ? `/premium/pay?${qs}` : "/premium/pay";
    if (!isPage && !isInline) onClose();
    router.push(path);
  }, [isInline, isPage, onClose, resolvedReturn, router]);

  useEffect(() => {
    if (!open || loadingSession || !user) return;
    if (!wantsAutoPay) return;
    if (autoPayStarted.current || step === "redirecting") return;
    autoPayStarted.current = true;

    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("checkout")) {
        url.searchParams.delete("checkout");
        const qs = url.searchParams.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname || "/home");
      }
    } catch {
      /* ignore */
    }

    goToPayPage();
  }, [
    open,
    loadingSession,
    user,
    wantsAutoPay,
    step,
    goToPayPage,
    router,
    pathname,
  ]);

  if (!open) return null;
  if (!isPage && !isInline && !host) return null;

  const saved = FORTUNE_UNLOCK_LIST_PRICE - FORTUNE_UNLOCK_PRICE;

  const body = (
    <div
      className={cn(
        "relative z-[1] mx-auto w-full",
        isPage || isInline ? "px-4 pb-5 pt-4" : "px-4 pb-5 pt-5"
      )}
    >
      <div className={cn(!isPage && !isInline && "pr-7")}>
        <h2
          id={titleId}
          className="mae-pay-title text-[1.65rem] font-bold leading-none tracking-tight"
          style={{ ...goldTextStyle, fontWeight: 700 }}
        >
          พรีเมียม {FORTUNE_PACKAGE_LABEL}
        </h2>
        <p
          className="mt-2 text-[15.5px] font-medium leading-snug"
          style={{ color: TEXT_MUTED }}
        >
          ดูดวงได้เต็มที่ ตลอดทั้งปี
        </p>
      </div>

      {/* Offer card — glass โทนเดียวกับหน้าหลักใหม่ */}
      <div
        className="mt-4 overflow-hidden rounded-[22px]"
        style={{
          background: GLASS.bgSoft,
          border: GLASS.border,
          boxShadow: `${GLASS.highlight}, 0 10px 28px rgba(0,0,0,0.22)`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="shrink-0 px-3.5 pb-2.5 pt-3.5">
          <PremiumOfferUrgencyLine />

          <div
            className="mt-3.5 pb-3"
            style={{ borderBottom: "1px solid rgba(213, 177, 111, 0.14)" }}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <p className="flex items-baseline gap-1.5 leading-none">
                <span
                  className="flex items-baseline text-[2.35rem] font-bold tracking-tight"
                  style={goldTextStyle}
                >
                  <span className="mr-0.5 text-[1.35rem] font-bold">฿</span>
                  {FORTUNE_UNLOCK_PRICE}
                </span>
                <span
                  className="text-[14px] font-medium tracking-wide"
                  style={{ color: TEXT_MUTED }}
                >
                  / 1 ปี
                </span>
              </p>
              <span
                className="text-[17px] font-semibold line-through"
                style={{ color: "rgba(186, 204, 230, 0.45)" }}
              >
                ฿{FORTUNE_UNLOCK_LIST_PRICE.toLocaleString("th-TH")}
              </span>
              <span
                className="ml-auto inline-flex items-center rounded-full px-3 py-1"
                style={{
                  background: "rgba(213, 177, 111, 0.14)",
                  border: "1px solid rgba(232, 209, 154, 0.4)",
                }}
              >
                <span
                  className="text-[13px] font-bold tracking-wide"
                  style={goldTextStyle}
                >
                  ประหยัด ฿{saved.toLocaleString("th-TH")}
                </span>
              </span>
            </div>
            <p
              className="mt-2.5 flex items-center gap-1.5 text-[14.5px] font-medium"
              style={{ color: "rgba(220, 230, 245, 0.88)" }}
            >
              <span
                className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(79, 140, 255, 0.9)" }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              จ่ายครั้งเดียว · ไม่มีต่ออายุอัตโนมัติ
            </p>
          </div>
        </div>

        <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-3.5 pb-2">
          <div
            className="sticky top-0 z-[1] flex items-center justify-between gap-2 py-2.5 backdrop-blur-md"
            style={{
              background: "rgba(14, 22, 40, 0.88)",
              borderBottom: "1px solid rgba(213, 177, 111, 0.14)",
            }}
          >
            <p className="text-[14.5px] font-medium text-white/90">
              สิทธิ์ที่ได้รับ
            </p>
            <p className="text-[13px] font-bold" style={goldTextStyle}>
              พรีเมียม
            </p>
          </div>

          {COMPARE_ROWS.map((label) => (
            <div
              key={label}
              className="flex items-center gap-2.5 py-2.5 last:border-b-0"
              style={{ borderBottom: "1px dashed rgba(213, 177, 111, 0.12)" }}
            >
              <PremiumCheck />
              <p className="min-w-0 flex-1 text-[15px] leading-snug text-white/90">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {IS_LOCAL_DEV ? (
          <div className="space-y-2">
            <PremiumBuyCta onClick={() => onPaid()} />
            <p className="text-center text-[11px]" style={{ color: TEXT_MUTED }}>
              โหมดทดลอง · จำลองชำระสำเร็จ
            </p>
          </div>
        ) : loadingSession ? (
          <div
            className="flex items-center justify-center gap-2 py-2 text-[13px]"
            style={{ color: TEXT_MUTED }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังตรวจสอบสถานะ…
          </div>
        ) : !user ? (
          <div className="space-y-2">
            <PremiumBuyCta
              onClick={() => {
                onClose();
                router.push(
                  `/login?callbackUrl=${encodeURIComponent(LOGIN_THEN_PAY)}`
                );
              }}
            />
            <p className="text-center text-[15px] font-medium" style={{ color: GOLD_SOFT }}>
              เข้าสู่ระบบแล้วชำระ · เหลือ 3 สิทธิ์
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.email ? (
              <p className="text-center text-[14px]" style={{ color: TEXT_MUTED }}>
                {user.email}
              </p>
            ) : null}
            <PremiumBuyCta
              onClick={goToPayPage}
              disabled={step === "redirecting"}
              loading={step === "redirecting"}
              loadingLabel="กำลังไปหน้าชำระ…"
            />
          </div>
        )}

        {error ? (
          <p className="text-center text-[14px] text-rose-300">{error}</p>
        ) : null}

        <p
          className="flex items-center justify-center gap-1.5 pt-1 text-[14px] font-medium"
          style={{ color: TEXT_MUTED }}
        >
          <Lock className="h-4 w-4 shrink-0" strokeWidth={2.2} style={{ color: GOLD_SOFT }} />
          ตรวจสอบรายการก่อนดำเนินการต่อ
        </p>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <div
        className="no-sky-lift relative overflow-hidden rounded-[24px]"
        role="region"
        aria-labelledby={titleId}
        style={AIVA_PANEL}
      >
        {body}
      </div>
    );
  }

  if (isPage) {
    return (
      <div
        className="mx-auto flex min-h-full w-full max-w-[430px] flex-col justify-center px-4 py-6"
        role="main"
        aria-labelledby={titleId}
      >
        <div className="relative z-10 mb-3 flex items-center px-0.5">
          <PageBackButton
            onClick={step === "redirecting" ? undefined : onClose}
            className={step === "redirecting" ? "pointer-events-none opacity-40" : undefined}
          />
        </div>

        <div
          className="relative mx-auto w-full overflow-hidden rounded-[22px]"
          style={AIVA_PANEL}
        >
          {body}
        </div>
      </div>
    );
  }

  if (!host) return null;

  return createPortal(
    <div
      className="no-sky-lift absolute inset-0 z-[80] flex items-end justify-center px-3 pb-3 pt-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="dd-sheet-backdrop absolute inset-0 bg-black/55 backdrop-blur-[4px]"
        aria-label="ปิด"
        onClick={step === "redirecting" ? undefined : onClose}
      />

      <div
        className="dd-sheet-panel relative z-[1] max-h-[min(96vh,820px)] w-full max-w-[400px] overflow-y-auto overflow-x-hidden rounded-[22px]"
        style={AIVA_PANEL}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={step === "redirecting"}
          className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full outline-none transition hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/40 disabled:opacity-40"
          aria-label="ปิด"
          style={{ color: GOLD_LINE }}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {body}
      </div>
    </div>,
    host
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
    paid?: boolean;
    premiumUnlocked?: boolean;
    premiumUntil?: string | null;
    error?: string;
    code?: string;
  };
  if (res.status === 401 && data.paid) {
    return { ...data, ok: true, paid: true, premiumUnlocked: false };
  }
  if (!res.ok) {
    throw new Error(data.error || "ยืนยันการชำระไม่สำเร็จ");
  }
  return data;
}
