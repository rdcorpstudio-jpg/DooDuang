"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2, Lock, X } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
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
  `ใช้งานพรีเมียม ${FORTUNE_PACKAGE_MONTHS} เดือน`,
  "ปฏิทินฤกษ์ 12 ปี · จังหวะชีวิตรายเดือน/รายปี",
  "แผนที่ตัวตน · ราศีเชิงลึก · งานเงินรักฉบับเต็ม",
  "โหงวเฮ้ง · ลายมือ · ดวงคู่ · วอลเปเปอร์มงคล",
] as const;

const IS_LOCAL_DEV =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_PREMIUM_SIM === "1";

const LOGIN_THEN_CHECKOUT = "/premium?checkout=1";

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

  const body = (
    <div
      className={cn(
        "relative z-[1] text-center",
        isPage || isInline ? "px-1 pb-2 pt-2" : "px-5 pb-5 pt-7"
      )}
    >
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
        <span
          className="pointer-events-none absolute inset-[-6px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,188,82,0.28) 0%, transparent 68%)",
          }}
          aria-hidden
        />
        <FortuneIcon name="sparkle" size={48} />
      </div>

      <p className="mt-3 font-sacred text-[11px] tracking-[0.2em] text-[#C9A227]">
        {`${APP_BRAND_MARK} · PREMIUM`}
      </p>
      <h2
        id={titleId}
        className="mt-2 text-[1.55rem] font-bold leading-tight tracking-tight text-[#241C4F]"
      >
        ปลดล็อกดวงพรีเมียม
      </h2>
      <p className="mx-auto mt-1.5 max-w-[17rem] text-[13px] leading-snug text-[#5E5688]">
        แพ็ก {PREMIUM_UNLOCK.months} เดือน · เปิดเนื้อหาเต็มแบบพรีเมียม
      </p>

      <PremiumOfferCountdown compact className="mt-3" />

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-[14px] text-[#9A90C0] line-through">
          {PREMIUM_LIST_PRICE} บาท
        </span>
        <p className="text-[2.1rem] font-bold leading-none tabular-nums tracking-tight text-[#241C4F]">
          {FORTUNE_UNLOCK_PRICE}{" "}
          <span className="text-[1.05rem] font-semibold">บาท</span>
        </p>
      </div>
      <p className="mt-1.5 text-[12px] text-[#7A72A0]">
        {monthly !== null
          ? `เฉลี่ย ${monthly} บาท/เดือน`
          : `ใช้งานได้ ${FORTUNE_PACKAGE_MONTHS} เดือน`}
      </p>

      <div className="mx-auto mt-4 max-w-[19rem] border-y border-[#7B6BB0]/14 py-3.5">
        <ul className="space-y-2.5 text-left">
          {PERKS.map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F6E2A6] ring-1 ring-[#E0B84A]/4">
                <Check className="h-3 w-3 text-[#8F6F14]" strokeWidth={2.6} />
              </span>
              <span className="text-[13px] leading-snug text-[#3A3270]">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        {IS_LOCAL_DEV ? (
          <div className="mb-3 space-y-2">
            <button
              type="button"
              onClick={() => onPaid()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45"
              style={{
                background:
                  "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 52%, #B29AEF 100%)",
                boxShadow:
                  "0 12px 28px rgba(106,72,200,0.36), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              จำลองชำระสำเร็จ · ดูพรีเมียม
            </button>
            <p className="text-[11px] text-[#9B7FE8]">
              โหมด local — ข้าม Google / หน้าชำระเงิน
            </p>
          </div>
        ) : null}

        {loadingSession ? (
          <div className="flex items-center justify-center gap-2 py-3 text-[13px] text-[#6B6490]">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังตรวจสอบสถานะเข้าสู่ระบบ…
          </div>
        ) : !user ? (
          <div className="space-y-3">
            <p className="text-[12px] leading-relaxed text-[#5E5688]">
              เข้าสู่ระบบด้วย Google ก่อนชำระ
              <br />
              เพื่อยืนยันสิทธิ์พรีเมียมของคุณ
            </p>
            <GoogleSignInButton
              label="เข้าสู่ระบบด้วย Google"
              callbackUrl={LOGIN_THEN_CHECKOUT}
              className="space-y-2"
              variant="outline"
              coloredIcon
              buttonClassName="h-12 rounded-full border-[#C8B8F0]/55 bg-white text-[15px] font-semibold text-[#241C4F] shadow-[0_8px_22px_rgba(110,79,201,0.14)] hover:bg-[#FBF8FF] hover:border-[#9B7FE8]/45 hover:text-[#241C4F]"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-[#5E5688]">
              พร้อมชำระ
              {user.email ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-medium text-[#3A3270]">
                    {user.email}
                  </span>
                </>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={step === "redirecting"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[15px] font-bold text-white outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/45 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(90deg, #6A48C8 0%, #8B6AD8 52%, #B29AEF 100%)",
                boxShadow:
                  "0 12px 28px rgba(106,72,200,0.36), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
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
          <p className="mt-3 text-[12px] text-rose-500">{error}</p>
        ) : null}

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] leading-snug text-[#7A72A0]">
          <Lock className="h-3 w-3 shrink-0" strokeWidth={2.2} />
          หลังชำระสำเร็จ ระบบจะปลดล็อกพรีเมียมให้อัตโนมัติ
        </p>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <div
        className="no-sky-lift fortune-glass relative overflow-hidden rounded-[28px] px-3.5 py-4"
        role="region"
        aria-labelledby={titleId}
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(248,244,255,0.9) 45%, rgba(242,236,255,0.88) 100%)",
        }}
      >
        {body}
      </div>
    );
  }

  if (isPage) {
    return (
      <div
        className="sky-copy mx-auto flex w-full max-w-[480px] flex-col px-3 pb-6 pt-2"
        role="main"
        aria-labelledby={titleId}
      >
        <div className="relative z-10 mb-3 grid grid-cols-[1fr_auto_1fr] items-center px-0.5">
          <button
            type="button"
            onClick={step === "redirecting" ? undefined : onClose}
            disabled={step === "redirecting"}
            className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            กลับ
          </button>
          <span className="justify-self-center" aria-hidden />
          <span className="justify-self-end" aria-hidden />
        </div>

        <div
          className="fortune-glass relative overflow-hidden rounded-[28px] px-3.5 py-4"
          style={{
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(248,244,255,0.9) 45%, rgba(242,236,255,0.88) 100%)",
          }}
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
        className="dd-sheet-backdrop absolute inset-0 bg-[#3A2F6B]/28 backdrop-blur-[6px]"
        aria-label="ปิด"
        onClick={step === "redirecting" ? undefined : onClose}
      />

      <div
        className="dd-sheet-panel relative z-[1] w-full max-w-[360px] overflow-hidden rounded-[28px]"
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(248,244,255,0.9) 45%, rgba(242,236,255,0.88) 100%)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow: [
            "0 24px 60px rgba(80,55,150,0.22)",
            "0 0 0 1px rgba(155,127,232,0.18)",
            "inset 0 1px 0 rgba(255,255,255,0.95)",
          ].join(", "),
          backdropFilter: "blur(22px) saturate(1.2)",
          WebkitBackdropFilter: "blur(22px) saturate(1.2)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: [
              "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255,255,255,0.95), transparent 60%)",
              "radial-gradient(circle at 85% 12%, rgba(196,176,245,0.28), transparent 42%)",
              "radial-gradient(circle at 15% 88%, rgba(244,188,82,0.1), transparent 40%)",
            ].join(", "),
          }}
        />

        <button
          type="button"
          onClick={onClose}
          disabled={step === "redirecting"}
          className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full text-[#7A72A0] outline-none transition hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#9B7FE8]/4 disabled:opacity-40"
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
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "ยืนยันการชำระไม่สำเร็จ");
  }
  return data;
}
