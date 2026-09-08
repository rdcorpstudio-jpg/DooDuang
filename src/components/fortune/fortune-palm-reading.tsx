"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { FortunePaymentSheet } from "@/components/fortune/fortune-payment-sheet";
import { useStripePaymentReturn } from "@/components/fortune/use-stripe-payment-return";
import {
  PhotoSlot,
  PhotoSourceSheet,
  useObjectUrl,
} from "@/components/fortune/photo-source-sheet";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

const UNLOCK_KEY = "dooduang-premium-unlocked";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

type Step = "upload" | "result";
type SlotId = "palm" | "fingers";

/** ลายมือ — camera or upload, then mock result */
export function FortunePalmReading({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [palm, setPalm] = useState<File | null>(null);
  const [fingers, setFingers] = useState<File | null>(null);
  const [picking, setPicking] = useState<SlotId | null>(null);

  const palmUrl = useObjectUrl(palm);
  const fingersUrl = useObjectUrl(fingers);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  const h = hashSeed(`${seed}-palm`);

  function onPicked(file: File) {
    if (picking === "palm") setPalm(file);
    else if (picking === "fingers") setFingers(file);
    setPicking(null);
  }

  function handlePaid() {
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    setPayOpen(false);
  }

  useStripePaymentReturn(handlePaid);

  if (!unlocked) {
    return (
      <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
        <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              กลับ
            </button>
            <div className="flex flex-col items-center justify-self-center">
              <FortuneIcon name="moon" size={16} className="-mb-0.5" />
              <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">
                DOODUANG
              </p>
            </div>
            <span aria-hidden className="justify-self-end" />
          </div>
          <div className="fortune-glass mt-8 rounded-[22px] px-4 py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#9B7FE8]/12 ring-1 ring-[#9B7FE8]/30">
              <Lock className="h-5 w-5 text-[#7B5FD4]" strokeWidth={1.9} />
            </span>
            <h1 className="mt-3 text-[1.4rem] font-bold tracking-tight text-[#241C4F]">
              ดูลายมือ · พรีเมียม
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5E5688]">
              ถ่ายหรืออัปโหลดรูปฝ่ามือ เพื่ออ่านลายมือ
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="no-sky-lift mt-5 w-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8] py-3 text-[15px] font-semibold text-white outline-none transition active:scale-[0.99]"
            >
              ปลดล็อก · {FORTUNE_UNLOCK_PRICE} บาท
            </button>
          </div>
        </div>
        <FortunePaymentSheet
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
          returnPath="/reading/palm"
        />
      </div>
    );
  }

  const lines = [
    {
      title: "เส้นชีวิต",
      body:
        h % 2 === 0
          ? "เส้นชัดและโค้งดี สื่อถึงพลังฟื้นตัวและความอดทน"
          : "เส้นสั้นแต่แน่น ควรรักษาสุขภาพและจังหวะพักให้สม่ำเสมอ",
    },
    {
      title: "เส้นสมอง",
      body:
        (h >> 2) % 2 === 0
          ? "คิดเป็นระบบ ตัดสินใจได้เมื่อมีข้อมูลครบ"
          : "ไอเดียไว — โฟกัสทีละเรื่องจะเห็นผลชัดขึ้น",
    },
    {
      title: "เส้นหัวใจ",
      body:
        (h >> 4) % 2 === 0
          ? "ใส่ใจคนรอบข้าง อยากความสัมพันธ์ที่จริงใจ"
          : "ปกป้องใจเก่ง เปิดใจทีละขั้นจะสัมพันธ์ได้ลึกขึ้น",
    },
  ];

  return (
    <div className={cn("sky-copy relative h-full overflow-y-auto", className)}>
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (step === "result") setStep("upload");
              else router.back();
            }}
            className="inline-flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-[#3A2F6B] outline-none transition active:opacity-60"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            กลับ
          </button>
          <div className="flex flex-col items-center justify-self-center">
            <FortuneIcon name="moon" size={16} className="-mb-0.5" />
            <p className="font-sacred text-[12px] tracking-[0.26em] text-[#C9A227]">
              DOODUANG
            </p>
          </div>
          <span aria-hidden className="justify-self-end" />
        </div>

        {step === "upload" ? (
          <>
            <header className="mt-5">
              <h1 className="text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
                อ่านลายมือ
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#7B5FD4]">
                อัปโหลดรูปฝ่ามือ
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#6B6490]">
                ใช้รูปฝ่ามือชัด แสงพอ — กดช่องแล้วเลือกถ่ายด้วยกล้องหรืออัปโหลด
              </p>
            </header>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PhotoSlot
                label="ฝ่ามือหงาย"
                badge="จำเป็น"
                badgeTone="required"
                previewUrl={palmUrl}
                hint={palm ? "พร้อมวิเคราะห์" : "หงายฝ่ามือ นิ้วชิดพอประมาณ"}
                onPick={() => setPicking("palm")}
                onClear={() => setPalm(null)}
              />
              <PhotoSlot
                label="มุมนิ้ว/ข้างมือ"
                badge="ไม่บังคับ"
                badgeTone="optional"
                previewUrl={fingersUrl}
                hint="ช่วยอ่านรายละเอียดเส้นย่อย"
                onPick={() => setPicking("fingers")}
                onClear={() => setFingers(null)}
              />
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#8A82B0]">
              รูปของคุณประมวลผลบนเครื่องเท่านั้น และไม่ถูกอัปโหลด
            </p>

            <button
              type="button"
              disabled={!palm}
              onClick={() => setStep("result")}
              className="no-sky-lift mt-3 w-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8] py-3.5 text-[15px] font-semibold text-white outline-none transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
            >
              ถัดไป
            </button>
          </>
        ) : (
          <div className="mt-5 space-y-3 pb-4">
            <h1 className="text-[1.4rem] font-bold tracking-tight text-[#241C4F]">
              ผลอ่านลายมือ
            </h1>
            <div className="fortune-glass flex gap-3 rounded-[20px] p-3.5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#9B7FE8]/10">
                {palmUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={palmUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#241C4F]">
                  ฝ่ามือหลัก ·{" "}
                  {h % 2 === 0 ? "เส้นชัด" : "เส้นละเอียด"}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#5E5688]">
                  สรุปจากรูปที่คุณถ่าย/อัปโหลด — ใช้เป็นแนวทางคร่าว ๆ
                </p>
              </div>
            </div>

            <div className="fortune-glass space-y-3.5 rounded-[20px] px-4 py-4">
              {lines.map((line, i) => (
                <div
                  key={line.title}
                  className={
                    i > 0 ? "border-t border-[#7B6BB0]/12 pt-3.5" : undefined
                  }
                >
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7B5FD4]">
                    {line.title}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-[1.7] text-[#5E5688]">
                    {line.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PhotoSourceSheet
        open={picking != null}
        onClose={() => setPicking(null)}
        onPicked={onPicked}
        capture="environment"
      />
    </div>
  );
}
