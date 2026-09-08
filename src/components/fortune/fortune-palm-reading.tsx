"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
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
      <div className={cn("relative h-full overflow-y-auto", className)}>
        <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[12px] text-white/75"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
            กลับ
          </button>
          <div className="fortune-glass mt-8 rounded-[22px] px-4 py-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4BC52]/15 ring-1 ring-[#F4BC52]/45">
              <Lock className="h-5 w-5 text-[#F4BC52]" strokeWidth={1.9} />
            </span>
            <h1 className="mt-3 text-[20px] font-semibold text-white">
              ดูลายมือ · พรีเมียม
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-white/50">
              ถ่ายหรืออัปโหลดรูปฝ่ามือ เพื่ออ่านลายมือ
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-[#F4BC52] to-[#E8A93A] py-3 text-[15px] font-semibold text-[#0C1427]"
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
    <div className={cn("relative h-full overflow-y-auto", className)}>
      <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-4 pb-10 pt-3">
        <button
          type="button"
          onClick={() => {
            if (step === "result") setStep("upload");
            else router.back();
          }}
          className="inline-flex w-fit items-center gap-1 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[12px] text-white/75"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
          กลับ
        </button>

        {step === "upload" ? (
          <>
            <header className="mt-4">
              <h1 className="text-[22px] font-semibold text-white">
                อ่านลายมือ
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#46DDED]">
                อัปโหลดรูปฝ่ามือ
              </p>
              <p className="mt-1 text-[12px] text-white/45">
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

            <p className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
              รูปของคุณประมวลผลบนเครื่องเท่านั้น และไม่ถูกอัปโหลด
            </p>

            <button
              type="button"
              disabled={!palm}
              onClick={() => setStep("result")}
              className="mt-3 w-full rounded-full bg-gradient-to-r from-[#46DDED] to-[#6EA8FF] py-3.5 text-[15px] font-semibold text-[#0C1427] outline-none transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
            >
              ถัดไป
            </button>
          </>
        ) : (
          <div className="mt-4 space-y-3 pb-4">
            <h1 className="text-[20px] font-semibold text-white">
              ผลอ่านลายมือ
            </h1>
            <div className="fortune-glass flex gap-3 rounded-[20px] p-3.5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-black/20">
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
                <p className="text-[15px] font-semibold text-white">
                  ฝ่ามือหลัก ·{" "}
                  {h % 2 === 0 ? "เส้นชัด" : "เส้นละเอียด"}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                  สรุปจากรูปที่คุณถ่าย/อัปโหลด — ใช้เป็นแนวทางคร่าว ๆ
                </p>
              </div>
            </div>

            <div className="fortune-glass space-y-3.5 rounded-[20px] px-4 py-4">
              {lines.map((line, i) => (
                <div
                  key={line.title}
                  className={i > 0 ? "border-t border-white/[0.08] pt-3.5" : undefined}
                >
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/85">
                    {line.title}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-[1.7] text-[#B7C3D8]">
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
