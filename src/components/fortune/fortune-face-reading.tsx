"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Pencil } from "lucide-react";
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

const ELEMENTS = ["ธาตุดิน", "ธาตุน้ำ", "ธาตุไฟ", "ธาตุลม"] as const;
const FACE_TYPES = [
  "หน้ากลมน่ารัก",
  "หน้ายาวสง่า",
  "หน้าหัวใจ",
  "หน้าเหลี่ยมมั่นคง",
] as const;

type Step = "upload" | "result";
type SlotId = "front" | "side";

/** โหงวเฮ้ง — camera or upload, then mock result */
export function FortuneFaceReading({
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
  const [front, setFront] = useState<File | null>(null);
  const [side, setSide] = useState<File | null>(null);
  const [picking, setPicking] = useState<SlotId | null>(null);
  const [profile, setProfile] = useState("โสด · พนักงาน");

  const frontUrl = useObjectUrl(front);
  const sideUrl = useObjectUrl(side);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  const h = hashSeed(`${seed}-face`);
  const element = ELEMENTS[h % ELEMENTS.length]!;
  const faceType = FACE_TYPES[(h >> 3) % FACE_TYPES.length]!;
  const clarity = 62 + (h % 28);

  function onPicked(file: File) {
    if (picking === "front") setFront(file);
    else if (picking === "side") setSide(file);
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
          <div className="fortune-glass mt-8 rounded-[24px] px-5 py-7 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#9B7FE8]/12 ring-1 ring-[#9B7FE8]/30">
              <Lock className="h-5 w-5 text-[#7B5FD4]" strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-[#7B5FD4]">
              PREMIUM
            </p>
            <h1 className="mt-1.5 text-[1.55rem] font-bold tracking-tight text-[#241C4F]">
              ดูโหงวเฮ้ง
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5E5688]">
              ถ่ายหรืออัปโหลดรูปใบหน้า เพื่อวิเคราะห์โหงวเฮ้ง
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
          returnPath="/reading/face"
        />
      </div>
    );
  }

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
                โหงวเฮ้ง
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#7B5FD4]">
                อัปโหลดรูปใบหน้า
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#6B6490]">
                ใช้รูปหน้าชัดเจน — กดช่องแล้วเลือกถ่ายด้วยกล้องหรืออัปโหลดจากคลังรูป
              </p>
            </header>

            <div
              className="mt-4 flex items-center justify-between gap-2 rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(155,127,232,0.28)",
                boxShadow: "0 6px 18px rgba(80,55,150,0.1)",
              }}
            >
              <p className="text-[13px] font-medium text-[#241C4F]">
                ข้อมูลของคุณ : {profile}
              </p>
              <button
                type="button"
                aria-label="แก้ไขข้อมูล"
                onClick={() => {
                  const next = window.prompt("ข้อมูลของคุณ", profile);
                  if (next != null && next.trim()) setProfile(next.trim());
                }}
                className="text-[#7B5FD4] outline-none transition active:opacity-60"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PhotoSlot
                label="ภาพหน้าตรง"
                badge="จำเป็น"
                badgeTone="required"
                previewUrl={frontUrl}
                hint={front ? "พร้อมวิเคราะห์" : undefined}
                onPick={() => setPicking("front")}
                onClear={() => setFront(null)}
              />
              <PhotoSlot
                label="ภาพมุมข้าง"
                badge="ไม่บังคับ"
                badgeTone="optional"
                previewUrl={sideUrl}
                hint="ช่วยเพิ่มความแม่นยำ"
                onPick={() => setPicking("side")}
                onClear={() => setSide(null)}
              />
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#8A82B0]">
              รูปของคุณประมวลผลบนเครื่องเท่านั้น และไม่ถูกอัปโหลด
            </p>

            <button
              type="button"
              disabled={!front}
              onClick={() => setStep("result")}
              className="no-sky-lift mt-3 w-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8] py-3.5 text-[15px] font-semibold text-white outline-none transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
            >
              ถัดไป
            </button>
          </>
        ) : (
          <FaceResult
            seed={seed}
            photoUrl={frontUrl}
            profile={profile}
            element={element}
            faceType={faceType}
            clarity={clarity}
          />
        )}
      </div>

      <PhotoSourceSheet
        open={picking != null}
        onClose={() => setPicking(null)}
        onPicked={onPicked}
        capture="user"
      />
    </div>
  );
}

function FaceResult({
  seed,
  photoUrl,
  profile,
  element,
  faceType,
  clarity,
}: {
  seed: string;
  photoUrl: string | null;
  profile: string;
  element: string;
  faceType: string;
  clarity: number;
}) {
  const tags = profile
    .split(/[·•,]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const h = hashSeed(`${seed}-palaces`);

  const palaces = [
    {
      title: "วังสวรรค์ (หน้าผาก)",
      body:
        h % 2 === 0
          ? "สัดส่วนหน้าผากสมดุล บ่งชี้ช่วงต้นชีวิตและการเรียนที่ราบรื่น"
          : "หน้าผากกว้างรับแสงดี มีแนวโน้มคิดเป็นระบบและเริ่มต้นได้ดี",
    },
    {
      title: "วังมนุษย์ (กลางหน้า)",
      body:
        (h >> 2) % 2 === 0
          ? "ช่วงกลางหน้าเด่น พลังงานสูง เหมาะกับงานและการเงินวัยกลางคน"
          : "ดวงตา–จมูกสื่อถึงความมุ่งมั่น มีโอกาสในอาชีพเมื่อโฟกัสชัด",
    },
    {
      title: "วังปฐพี (คาง/กราม)",
      body:
        (h >> 4) % 2 === 0
          ? "คางค่อนข้างเรียว ควรวางแผนการเงินระยะยาวสำหรับช่วงหลัง"
          : "ฐานล่างมั่นคง สื่อถึงความอดทนและการเก็บออมได้ดี",
    },
  ];

  return (
    <div className="mt-5 space-y-3 pb-4">
      <h1 className="text-[1.4rem] font-bold tracking-tight text-[#241C4F]">
        โหงวเฮ้ง
      </h1>

      <div className="fortune-glass overflow-hidden rounded-[20px] p-3.5">
        <div className="flex gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#9B7FE8]/10">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#241C4F]">
              {element} · {faceType}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[#9B7FE8]/12 px-2 py-0.5 text-[11px] text-[#5B45B8]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-[#5E5688]">{element}</p>
          <p className="text-[12px] text-[#5E5688]">ความชัดเจน {clarity}%</p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#9B7FE8]/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7B5FD4] to-[#9B7FE8]"
            style={{ width: `${clarity}%` }}
          />
        </div>
      </div>

      <div className="fortune-glass rounded-[20px] px-4 py-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#7B5FD4]">
          สามวังหลัก
        </h2>
        <div className="mt-3.5 space-y-3.5">
          {palaces.map((p, i) => (
            <div
              key={p.title}
              className={cn(
                i > 0 && "border-t border-[#7B6BB0]/12 pt-3.5"
              )}
            >
              <p className="text-[13px] font-semibold text-[#2C2458]">{p.title}</p>
              <p className="mt-1 text-[12px] leading-[1.7] text-[#5E5688]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
