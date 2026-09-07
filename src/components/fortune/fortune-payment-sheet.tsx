"use client";

import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  X,
} from "lucide-react";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

type PayMethod = "card" | "promptpay";
type Step = "method" | "details" | "processing" | "success";

const LIST_PRICE = 699;

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Beautiful mock checkout — card + PromptPay (no real charge) */
export function FortunePaymentSheet({
  open,
  onClose,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
}) {
  const titleId = useId();
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<PayMethod>("promptpay");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("method");
    setMethod("promptpay");
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (step !== "processing") return;
    const t = window.setTimeout(() => {
      setStep("success");
      window.setTimeout(() => onPaid(), 900);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [step, onPaid]);

  if (!open) return null;

  function goDetails(next: PayMethod) {
    setMethod(next);
    setError(null);
    setStep("details");
  }

  function submitPay() {
    setError(null);
    if (method === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (cardName.trim().length < 2) {
        setError("กรุณากรอกชื่อบนบัตร");
        return;
      }
      if (digits.length < 16) {
        setError("กรุณากรอกเลขบัตร 16 หลัก");
        return;
      }
      if (expiry.replace(/\D/g, "").length < 4) {
        setError("กรุณากรอกวันหมดอายุ MM/YY");
        return;
      }
      if (cvv.length < 3) {
        setError("กรุณากรอก CVV");
        return;
      }
    }
    setStep("processing");
  }

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
        onClick={step === "processing" || step === "success" ? undefined : onClose}
      />

      <div
        className="relative z-[1] flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        style={{
          border: "1px solid transparent",
          backgroundImage: [
            "linear-gradient(165deg, rgba(14,20,40,0.99), rgba(28,24,16,0.98) 50%, rgba(12,18,36,0.99))",
            "linear-gradient(145deg, rgba(255,230,170,0.9), rgba(244,188,82,0.7) 40%, rgba(184,120,40,0.55) 75%, rgba(244,188,82,0.8))",
          ].join(", "),
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow:
            "0 -8px 40px rgba(0,0,0,0.45), 0 0 40px rgba(244,188,82,0.18)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 45% at 50% -8%, rgba(244,188,82,0.2), transparent 55%)",
          }}
        />

        {/* Header */}
        <div className="relative z-[1] flex items-center justify-between px-4 pb-2 pt-4">
          {step === "details" ? (
            <button
              type="button"
              onClick={() => setStep("method")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#F4BC52] outline-none focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45"
              aria-label="ย้อนกลับ"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="h-9 w-9" />
          )}
          <div className="text-center">
              <p
                id={titleId}
                className="flex items-center justify-center gap-1.5 text-[13px] font-semibold tracking-[0.14em] text-[#F4BC52]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/icons/star-gold.png"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                  style={{ mixBlendMode: "screen" }}
                />
                ชำระเงิน
              </p>
            <p className="mt-0.5 text-[12px] text-[#9AB8DC]">ดวงพรีเมียม</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === "processing" || step === "success"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9AB8DC] outline-none focus-visible:ring-2 focus-visible:ring-[#F4BC52]/45 disabled:opacity-40"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative z-[1] overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
          {/* Price summary */}
          <div
            className="mb-4 rounded-[18px] px-4 py-3.5 text-center"
            style={{
              background:
                "linear-gradient(160deg, rgba(244,188,82,0.12), rgba(244,188,82,0.04))",
              boxShadow: "inset 0 0 0 1px rgba(244,188,82,0.28)",
            }}
          >
            <p className="text-[13px] text-[#9AB8DC] line-through decoration-[#9AB8DC]/45">
              {LIST_PRICE} บาท
            </p>
            <p
              className="mt-0.5 text-[36px] font-bold leading-none tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg, #FFF8E4 8%, #F4BC52 50%, #C9922E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {FORTUNE_UNLOCK_PRICE}.-
            </p>
            <p className="mt-2 text-[12px] text-[#9AB8DC]">
              ปลดล็อกราศีเชิงลึก · ปฏิทินฤกษ์ 12 ปี · รายงานเต็ม
            </p>
          </div>

          {step === "method" ? (
            <div className="space-y-3">
              <p className="text-[14px] font-semibold text-[#F7F8FF]">
                เลือกวิธีชำระเงิน
              </p>

              <MethodCard
                selected={method === "promptpay"}
                onSelect={() => goDetails("promptpay")}
                title="พร้อมเพย์"
                sub="สแกน QR ชำระผ่านแอปธนาคาร"
                badge="แนะนำ"
                Icon={QrCode}
              />
              <MethodCard
                selected={method === "card"}
                onSelect={() => goDetails("card")}
                title="บัตรเครดิต / เดบิต"
                sub="Visa · Mastercard · JCB"
                Icon={CreditCard}
              />

              <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-[#9AB8DC]/75">
                <Lock className="h-3 w-3 text-[#F4BC52]" />
                จำลองการชำระเงิน — ยังไม่ตัดบัตรจริง
              </p>
            </div>
          ) : null}

          {step === "details" && method === "promptpay" ? (
            <div className="space-y-4">
              <p className="text-center text-[14px] font-semibold text-[#F7F8FF]">
                สแกน QR พร้อมเพย์
              </p>
              <div className="mx-auto flex w-fit flex-col items-center rounded-[20px] bg-white p-4 shadow-[0_12px_40px_rgba(244,188,82,0.2)]">
                <PromptPayQrMock amount={FORTUNE_UNLOCK_PRICE} />
                <p className="mt-2 text-[12px] font-medium text-[#1A1208]/70">
                  PromptPay · ฿{FORTUNE_UNLOCK_PRICE}
                </p>
              </div>
              <p className="text-center text-[13px] leading-relaxed text-[#9AB8DC]">
                เปิดแอปธนาคาร → สแกน QR → ชำระ {FORTUNE_UNLOCK_PRICE} บาท
                <br />
                <span className="text-[#F4BC52]/90">
                  (โหมดสาธิต กดยืนยันเพื่อปลดล็อก)
                </span>
              </p>
              <PayButton onClick={submitPay}>ยืนยันว่าชำระแล้ว</PayButton>
            </div>
          ) : null}

          {step === "details" && method === "card" ? (
            <div className="space-y-3">
              <p className="text-[14px] font-semibold text-[#F7F8FF]">
                ข้อมูลบัตร
              </p>
              <Field
                label="ชื่อบนบัตร"
                value={cardName}
                onChange={setCardName}
                placeholder="NAME ON CARD"
                autoComplete="cc-name"
              />
              <Field
                label="หมายเลขบัตร"
                value={cardNumber}
                onChange={(v) => setCardNumber(formatCardNumber(v))}
                placeholder="xxxx xxxx xxxx xxxx"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="หมดอายุ"
                  value={expiry}
                  onChange={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                <Field
                  label="CVV"
                  value={cvv}
                  onChange={(v) =>
                    setCvv(v.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="•••"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
              {error ? (
                <p className="text-[13px] text-[#F16DB5]">{error}</p>
              ) : null}
              <PayButton onClick={submitPay}>
                ชำระ {FORTUNE_UNLOCK_PRICE} บาท
              </PayButton>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AB8DC]/75">
                <Lock className="h-3 w-3 text-[#F4BC52]" />
                ข้อมูลไม่ถูกส่งออกนอกเครื่อง — โหมดสาธิต
              </p>
            </div>
          ) : null}

          {step === "processing" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#F4BC52]" />
              <p className="mt-4 text-[16px] font-semibold text-[#F7F8FF]">
                กำลังยืนยันการชำระ…
              </p>
              <p className="mt-1 text-[13px] text-[#9AB8DC]">
                กรุณารอสักครู่
              </p>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #FFF0C4, #F4BC52 50%, #C9922E)",
                  boxShadow: "0 0 28px rgba(244,188,82,0.45)",
                }}
              >
                <Check className="h-7 w-7 text-[#1A1208]" strokeWidth={2.6} />
              </span>
              <p className="mt-4 text-[18px] font-semibold text-[#F7F8FF]">
                ชำระสำเร็จ
              </p>
              <p className="mt-1 text-[13px] text-[#9AB8DC]">
                กำลังเปิดดวงพรีเมียมให้คุณ…
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  selected,
  onSelect,
  title,
  sub,
  badge,
  Icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  badge?: string;
  Icon: typeof QrCode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-[18px] px-3.5 py-3.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/5",
        selected
          ? "bg-[#F4BC52]/12"
          : "bg-white/[0.04] hover:bg-white/[0.06]"
      )}
      style={{
        boxShadow: selected
          ? "inset 0 0 0 1.5px rgba(244,188,82,0.65)"
          : "inset 0 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{
          background:
            "linear-gradient(160deg, rgba(244,188,82,0.28), rgba(244,188,82,0.08))",
          boxShadow: "inset 0 0 0 1px rgba(244,188,82,0.4)",
        }}
      >
        <Icon className="h-5 w-5 text-[#F4BC52]" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#F7F8FF]">
            {title}
          </span>
          {badge ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#1A1208]"
              style={{
                background: "linear-gradient(135deg, #FFE7A8, #F4BC52)",
              }}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-[12px] text-[#9AB8DC]">{sub}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[#9AB8DC]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full rounded-[14px] border border-white/10 bg-black/25 px-3.5 py-3 text-[15px] text-[#F7F8FF] outline-none placeholder:text-white/25 focus:border-[#F4BC52]/45 focus:ring-1 focus:ring-[#F4BC52]/25"
      />
    </label>
  );
}

function PayButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-3.5 text-[15px] font-semibold text-[#1A1208] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#F4BC52]/55"
      style={{
        background:
          "linear-gradient(135deg, #FFF0C4 0%, #F4BC52 38%, #E0A83A 72%, #C9922E 100%)",
        boxShadow:
          "0 12px 32px rgba(244,188,82,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
      }}
    >
      {children}
    </button>
  );
}

/** Decorative PromptPay-style QR (demo pattern, not a real payload) */
function PromptPayQrMock({ amount }: { amount: number }) {
  const cells = 21;
  const size = 168;
  const cell = size / cells;
  const bits: boolean[] = [];
  let h = amount * 7919 + 42;
  for (let i = 0; i < cells * cells; i++) {
    h = (Math.imul(h ^ (i + 1), 16777619) >>> 0) >>> 0;
    bits.push(h % 3 !== 0);
  }
  // Finder patterns (corners)
  function paintFinder(ox: number, oy: number) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        bits[(oy + y) * cells + (ox + x)] = edge || inner;
      }
    }
  }
  paintFinder(0, 0);
  paintFinder(cells - 7, 0);
  paintFinder(0, cells - 7);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <rect width={size} height={size} fill="#fff" />
      {bits.map((on, i) => {
        if (!on) return null;
        const x = (i % cells) * cell;
        const y = Math.floor(i / cells) * cell;
        return (
          <rect
            key={i}
            x={x + 0.4}
            y={y + 0.4}
            width={cell - 0.8}
            height={cell - 0.8}
            fill="#1A1208"
            rx={0.6}
          />
        );
      })}
      <circle cx={size / 2} cy={size / 2} r={14} fill="#F4BC52" />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#1A1208"
      >
        ฿
      </text>
    </svg>
  );
}
