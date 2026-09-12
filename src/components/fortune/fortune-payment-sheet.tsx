"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2, Lock, X } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { PremiumOfferCountdown } from "@/components/fortune/premium-offer-countdown";
import { PREMIUM_LIST_PRICE } from "@/lib/fortune/premium-offer-countdown";
import { FORTUNE_PACKAGE_MONTHS, FORTUNE_UNLOCK_PRICE, APP_BRAND_MARK } from "@/lib/site";
import { PREMIUM_UNLOCK } from "@/lib/stripe-catalog";
import { cn } from "@/lib/utils";

type CheckoutStep = "ready" | "redirecting";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const PERKS = [
  `สิทธิ์พรีเมียมครบ ${FORTUNE_PACKAGE_MONTHS} เดือน`,
  "ปฏิทินฤกษ์ 12 ปี",
  "แผนที่ตัวตน · ราศีเชิงลึก",
  "โหงวเฮ้ง · ลายมือ · ดวงคู่",
] as const;

const IS_LOCAL_DEV =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_PREMIUM_SIM === "1";

const LOGIN_THEN_CHECKOUT = "/premium?checkout=1";

const MAE_PANEL: CSSProperties = {
  background: "#101827",
  boxShadow:
    "inset 0 0 0 1px rgba(213,177,111,0.42), 0 24px 56px rgba(0,0,0,0.4)",
};

function GoldRule({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto flex h-[1px] w-full max-w-[11rem] items-center", className)}
      aria-hidden
    >
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.55))",
        }}
      />
      <span
        className="mx-2 h-1 w-1 rotate-45"
        style={{ background: "#d5b16f" }}
      />
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, rgba(213,177,111,0.55), transparent)",
        }}
      />
    </div>
  );
}

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
  const [wantsAutoCheckout, setWantsAutoCheckout] = useState(false);
  const autoCheckoutStarted = useRef(false);

  const resolvedReturn =
    returnPath ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/premium");

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
    if (!open) return;
    setStep("ready");
    setError(null);
    autoCheckoutStarted.current = false;
    try {
      setWantsAutoCheckout(
        new URLSearchParams(window.location.search).get("checkout") === "1"
      );
    } catch {
      setWantsAutoCheckout(false);
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

  const startCheckout = useCallback(async () => {
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
        setError("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
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
  }, [resolvedReturn]);

  // Logged in + ?checkout=1 → Stripe immediately (no second tap)
  useEffect(() => {
    if (!open || loadingSession || !user) return;
    if (!wantsAutoCheckout) return;
    if (autoCheckoutStarted.current || step === "redirecting") return;
    autoCheckoutStarted.current = true;

    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("checkout")) {
        url.searchParams.delete("checkout");
        const qs = url.searchParams.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname || "/premium");
      }
    } catch {
      /* ignore */
    }

    void startCheckout();
  }, [
    open,
    loadingSession,
    user,
    wantsAutoCheckout,
    step,
    startCheckout,
    router,
    pathname,
  ]);

  if (!open) return null;
  if (!isPage && !isInline && !host) return null;

  const monthly =
    FORTUNE_PACKAGE_MONTHS > 1
      ? Math.round(FORTUNE_UNLOCK_PRICE / FORTUNE_PACKAGE_MONTHS)
      : null;

  const saveBaht = PREMIUM_LIST_PRICE - FORTUNE_UNLOCK_PRICE;
  const body = (
    <div
      className={cn(
        "relative z-[1] mx-auto w-full",
        isPage || isInline ? "px-6 pb-6 pt-6" : "px-6 pb-6 pt-8"
      )}
    >
      <div className="flex flex-col items-center text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "rgba(213,177,111,0.08)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
          }}
        >
          <FortuneIcon name="sparkle" size={22} plain />
        </span>

        <p className="mae-gold-text mt-4 text-[10px] font-semibold tracking-[0.28em]">
          {APP_BRAND_MARK}
        </p>
        <p className="mt-1 text-[10px] font-medium tracking-[0.32em] text-[#e8d19a]/70">
          PREMIUM
        </p>

        <h2
          id={titleId}
          className="mae-gold-text mt-3 max-w-[14rem] font-sans text-[1.45rem] font-bold leading-[1.25] tracking-tight"
        >
          ปลดล็อกดวงพรีเมียม
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-[#9aa3b2]">
          แพ็ก {PREMIUM_UNLOCK.months} เดือน · เนื้อหาเต็มทุกบท
        </p>
      </div>

      <GoldRule className="mt-5" />

      <div className="mt-5 text-center">
        <p className="text-[11px] tracking-[0.08em] text-[#9aa3b2]">
          <span className="line-through">{PREMIUM_LIST_PRICE} บาท</span>
          <span className="mx-2 text-[#d5b16f]/55">·</span>
          <span className="mae-gold-text font-semibold">
            ประหยัด {saveBaht}
          </span>
        </p>
        <p className="mt-2 text-[2.35rem] font-bold leading-none tracking-tight text-[#f7f4ec]">
          {FORTUNE_UNLOCK_PRICE}
          <span className="mae-gold-text ml-1.5 align-baseline text-[1rem] font-semibold tracking-normal">
            บาท
          </span>
        </p>
        <p className="mt-2 text-[11px] text-[#9aa3b2]">
          {monthly !== null
            ? `เฉลี่ย ${monthly} บาท/เดือน`
            : `ใช้งานได้ ${FORTUNE_PACKAGE_MONTHS} เดือน`}
        </p>
        <PremiumOfferCountdown compact className="mt-3.5" />
      </div>

      <GoldRule className="mt-5" />

      <ul className="mx-auto mt-5 w-full max-w-[17rem] space-y-2.5">
        {PERKS.map((line) => (
          <li key={line} className="flex items-center gap-2.5">
            <span
              className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.55)",
              }}
            >
              <Check className="h-2 w-2 text-[#d5b16f]" strokeWidth={3} />
            </span>
            <span className="text-[12.5px] leading-snug text-[#e8ecf2]">
              {line}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3">
        {IS_LOCAL_DEV ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onPaid()}
              className="mae-gold-cta flex w-full items-center justify-center rounded-full px-4 py-3.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            >
              ปลดล็อกพรีเมียม
            </button>
            <p className="text-center text-[10px] tracking-wide text-[#6b7380]">
              โหมดทดลอง · จำลองชำระสำเร็จ
            </p>
          </div>
        ) : loadingSession ? (
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
                onClose();
                router.push(
                  `/login?callbackUrl=${encodeURIComponent(LOGIN_THEN_CHECKOUT)}`
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
              disabled={step === "redirecting"}
              className="mae-gold-cta flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
            >
              {step === "redirecting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังไปหน้าชำระเงิน…
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

        <p className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-[#6b7380]">
          <Lock className="h-3 w-3 shrink-0 text-[#d5b16f]/80" strokeWidth={2.2} />
          ชำระแล้วปลดล็อกอัตโนมัติ
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
        style={MAE_PANEL}
      >
        {body}
      </div>
    );
  }

  if (isPage) {
    return (
      <div
        className="mx-auto flex min-h-full w-full max-w-[400px] flex-col justify-center px-4 py-6"
        role="main"
        aria-labelledby={titleId}
      >
        <div className="relative z-10 mb-3 grid grid-cols-[1fr_auto_1fr] items-center px-0.5">
          <button
            type="button"
            onClick={step === "redirecting" ? undefined : onClose}
            disabled={step === "redirecting"}
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
          {body}
        </div>
      </div>
    );
  }

  if (!host) return null;

  return createPortal(
    <div
      className="no-sky-lift absolute inset-0 z-[80] flex items-center justify-center px-3.5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="dd-sheet-backdrop absolute inset-0 bg-black/50 backdrop-blur-[4px]"
        aria-label="ปิด"
        onClick={step === "redirecting" ? undefined : onClose}
      />

      <div
        className="dd-sheet-panel relative z-[1] w-full max-w-[340px] overflow-hidden rounded-[22px]"
        style={MAE_PANEL}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={step === "redirecting"}
          className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full text-[#9aa3b2] outline-none transition hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/4 disabled:opacity-40"
          aria-label="ปิด"
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
    premiumUnlocked?: boolean;
    premiumUntil?: string | null;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "ยืนยันการชำระไม่สำเร็จ");
  }
  return data;
}
