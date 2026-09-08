"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Pencil } from "lucide-react";
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
          <div className="fortune-glass mt-8 rounded-[24px] px-5 py-7 text-center">
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
              style={{
                color: "#E4C56A",
                background:
                  "linear-gradient(160deg, rgba(228,197,106,0.16), rgba(255,255,255,0.04))",
                boxShadow: "inset 0 0 0 1px rgba(228,197,106,0.35)",
              }}
            >
              <Lock className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-[#F4BC52]/90">
              PREMIUM
            </p>
            <h1 className="font-sacred mt-1.5 text-[1.55rem] font-normal tracking-wide text-[#F5F2EA]">
              ดูโหงวเฮ้ง
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[#C2C9DB]/90">
              ถ่ายหรืออัปโหลดรูปใบหน้า เพื่อวิเคราะห์โหงวเฮ้ง
            </p>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="mt-5 w-full rounded-full bg-[#E4C56A] py-3 text-[15px] font-semibold text-[#1A1408]"
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
                โหงวเฮ้ง
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#F16DB5]">
                อัปโหลดรูปใบหน้า
              </p>
              <p className="mt-1 text-[12px] text-white/45">
                ใช้รูปหน้าชัดเจน — กดช่องแล้วเลือกถ่ายด้วยกล้องหรืออัปโหลดจากคลังรูป
              </p>
            </header>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-[14px] border border-[#F16DB5]/25 bg-[#F16DB5]/1 px-3 py-2.5">
              <p className="text-[13px] text-white/85">ข้อมูลของคุณ : {profile}</p>
              <button
                type="button"
                aria-label="แก้ไขข้อมูล"
                onClick={() => {
                  const next = window.prompt("ข้อมูลของคุณ", profile);
                  if (next != null && next.trim()) setProfile(next.trim());
                }}
                className="text-[#F16DB5]"
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

            <p className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
              รูปของคุณประมวลผลบนเครื่องเท่านั้น และไม่ถูกอัปโหลด
            </p>

            <button
              type="button"
              disabled={!front}
              onClick={() => setStep("result")}
              className="mt-3 w-full rounded-full bg-gradient-to-r from-[#F16DB5] to-[#BB6CF0] py-3.5 text-[15px] font-semibold text-white outline-none transition enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
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
    <div className="mt-4 space-y-3 pb-4">
      <h1 className="text-[20px] font-semibold text-white">โหงวเฮ้ง</h1>

      <div
        className="overflow-hidden rounded-[20px] p-3.5"
        style={{
          background:
            "linear-gradient(135deg, rgba(120,60,50,0.9), rgba(60,30,40,0.85))",
        }}
      >
        <div className="flex gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-black/20">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">
              {element} · {faceType}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/85"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-white/70">{element}</p>
          <p className="text-[12px] text-white/70">ความชัดเจน {clarity}%</p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#F4BC52]"
            style={{ width: `${clarity}%` }}
          />
        </div>
      </div>

      <div className="fortune-glass rounded-[20px] px-4 py-4">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#E4C56A]/90">
          สามวังหลัก
        </h2>
        <div className="mt-3.5 space-y-3.5">
          {palaces.map((p, i) => (
            <div
              key={p.title}
              className={cn(
                i > 0 && "border-t border-white/[0.08] pt-3.5"
              )}
            >
              <p className="text-[13px] font-semibold text-[#F7F8FF]">{p.title}</p>
              <p className="mt-1 text-[12px] leading-[1.7] text-[#B7C3D8]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
