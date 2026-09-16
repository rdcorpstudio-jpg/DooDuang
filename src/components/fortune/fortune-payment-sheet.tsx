"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Loader2, Lock, X } from "lucide-react";
import {
  FORTUNE_PACKAGE_LABEL,
  FORTUNE_UNLOCK_LIST_PRICE,
  FORTUNE_UNLOCK_PRICE,
} from "@/lib/site";
import { cn } from "@/lib/utils";

type CheckoutStep = "ready" | "redirecting";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

const IS_LOCAL_DEV = process.env.NEXT_PUBLIC_ALLOW_PREMIUM_SIM === "1";

const LOGIN_THEN_PAY = "/premium/pay";

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

const MAE_PANEL: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(24,34,52,0.98) 0%, rgba(16,24,39,0.98) 100%)",
  boxShadow:
    "inset 0 0 0 1.5px rgba(232,209,154,0.55), 0 24px 56px rgba(0,0,0,0.45)",
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
    const ret = resolvedReturn.split("?")[0] || "/premium";
    const qs = new URLSearchParams();
    if (ret !== "/premium" && ret !== "/premium/pay") qs.set("return", ret);
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
        router.replace(qs ? `${pathname}?${qs}` : pathname || "/premium");
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
          className="text-[1.55rem] font-bold leading-none tracking-tight"
          style={goldTextStyle}
        >
          พรีเมียม {FORTUNE_PACKAGE_LABEL}
        </h2>
        <p className="mt-1.5 text-[14px] font-medium leading-snug text-white">
          ดูดวงได้เต็มที่ ตลอดทั้งปี
        </p>
      </div>

      {/* Offer card — same language as /premium/pay */}
      <div
        className="mt-3.5 overflow-hidden rounded-[20px]"
        style={{
          background:
            "linear-gradient(165deg, rgba(24,34,52,0.88) 0%, rgba(16,24,39,0.82) 100%)",
          boxShadow:
            "inset 0 0 0 1.5px rgba(232,209,154,0.75), 0 0 24px rgba(213,177,111,0.12)",
        }}
      >
        <div className="shrink-0 px-3.5 pb-2.5 pt-3.5">
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
            className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight"
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

        <div className="max-h-[min(48vh,24rem)] overflow-y-auto overscroll-contain px-3.5 pb-2">
          <div className="sticky top-0 z-[1] grid grid-cols-[1fr_2.6rem_3.6rem] items-center gap-1 border-b border-[rgba(232,209,154,0.22)] bg-[rgba(18,28,44,0.96)] py-2 backdrop-blur-sm">
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
              className="grid grid-cols-[1fr_2.6rem_3.6rem] items-center gap-1 border-b border-white/[0.07] py-2 last:border-b-0"
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

      <div className="mt-4 space-y-2.5">
        {IS_LOCAL_DEV ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onPaid()}
              className="mae-gold-cta flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            >
              ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
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
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(
                  `/login?callbackUrl=${encodeURIComponent(LOGIN_THEN_PAY)}`
                );
              }}
              className="mae-gold-cta flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
            >
              ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <p className="text-center text-[11px] text-[#e8d19a]/80">
              เข้าสู่ระบบแล้วชำระ · เหลือ 3 สิทธิ์
            </p>
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
              onClick={goToPayPage}
              disabled={step === "redirecting"}
              className="mae-gold-cta flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-wide outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 disabled:opacity-60"
            >
              ซื้อพรีเมียม ฿{FORTUNE_UNLOCK_PRICE}
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        )}

        {error ? (
          <p className="text-center text-[12px] text-rose-300">{error}</p>
        ) : null}

        <p className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] text-[#6b7380]">
          <Lock className="h-3 w-3 shrink-0 text-[#d5b16f]/80" strokeWidth={2.2} />
          ตรวจสอบรายการก่อนดำเนินการต่อ · ชำระผ่าน Stripe โดยตรง
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
        className="mx-auto flex min-h-full w-full max-w-[430px] flex-col justify-center px-4 py-6"
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
          className="relative mx-auto w-full overflow-hidden rounded-[22px]"
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
