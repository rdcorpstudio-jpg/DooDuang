"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  CheckSquare,
  ClipboardList,
  Eye,
  Heart,
  Lightbulb,
  ListChecks,
  Package,
  PenLine,
  RefreshCw,
  Settings2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FortunePaidHeader,
  FortunePaidLock,
} from "@/components/fortune/fortune-paid-lock";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

/* ─── 07 ─────────────────────────────────────────── */

const PATTERN_SETS = [
  {
    steps: [
      {
        title: "รับผิดชอบมากเกินไป",
        body: "พยายามดูแลทุกอย่าง จนลืมความต้องการของตัวเอง",
        Icon: Package,
      },
      {
        title: "เหนื่อยจนสื่อสารน้อยลง",
        body: "เก็บความรู้สึกไว้เอง เพราะไม่อยากเป็นภาระของใคร",
        Icon: Brain,
      },
      {
        title: "คนรอบตัวไม่รู้ว่าคุณต้องการอะไร",
        body: "ทำให้เกิดความเข้าใจผิด และความห่างเหินโดยไม่ตั้งใจ",
        Icon: Users,
      },
    ],
    changeTitle: "บอกขอบเขตก่อนรับปาก",
    changeBody: "ดูแลตัวเองให้ดี เพื่อให้ดูแลสิ่งอื่นได้อย่างยั่งยืน",
  },
  {
    steps: [
      {
        title: "คาดหวังสูงจากตัวเอง",
        body: "ตั้งมาตรฐานไว้สูง จนรู้สึกไม่พอแม้ทำได้ดีแล้ว",
        Icon: Package,
      },
      {
        title: "กดดันจนหมดแรง",
        body: "ผลักดันต่อเนื่องโดยไม่เว้นจังหวะพัก",
        Icon: Brain,
      },
      {
        title: "ผลงานดี แต่ใจเริ่มหมดไฟ",
        body: "คนอื่นเห็นความสำเร็จ แต่คุณรู้สึกว่างเปล่าข้างใน",
        Icon: Users,
      },
    ],
    changeTitle: "ตั้งเกณฑ์ ‘พอดี’ ให้ชัด",
    changeBody: "สำเร็จที่ไม่ทำลายพลังใจ คือความสำเร็จที่ยั่งยืน",
  },
] as const;

/** 07 รูปแบบปัญหาที่เกิดซ้ำ — vertical cycle + breakout */
export function FortuneRepeatingPatterns({
  seed = "dooduang",
  locked = false,
  onUnlock,
  className,
}: {
  seed?: string;
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const data = PATTERN_SETS[hashSeed(`${seed}-pattern`) % PATTERN_SETS.length]!;

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-violet relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="07"
        numClassName="text-[#c4b5fd]"
        title="รูปแบบปัญหาที่เกิดซ้ำ"
        en="REPEATING PATTERNS"
        aside="รู้ทันรูปแบบเดิม เพื่อสร้างทางเลือกใหม่"
      />

      <div className="px-3.5 pb-3.5 pt-3">
        <ol className="relative space-y-0">
          {/* timeline rail */}
          <span
            className="pointer-events-none absolute bottom-3 left-[19px] top-3 w-px bg-gradient-to-b from-violet-400/35 via-white/12 to-[#e8c547]/40"
            aria-hidden
          />

          {data.steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-3 pb-3.5 last:pb-2">
              <span
                className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#12102a] ring-1 ring-white/12"
                data-slot={`paid-pattern-step-${i + 1}`}
              >
                <step.Icon className="h-4 w-4 text-white/70" strokeWidth={1.7} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/90 text-[9px] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <div className="fortune-dash-inset min-w-0 flex-1 rounded-[14px] px-3 py-2.5">
                <p className="text-[12.5px] font-semibold leading-snug text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="fortune-dash-inset fortune-frame-gold mt-1 flex gap-3 rounded-[16px] px-3 py-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8c547]/12 ring-1 ring-[#e8c547]/40"
            data-slot="paid-pattern-change"
          >
            <Lightbulb className="h-4 w-4 text-[#e8c547]" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-medium tracking-wide text-[#e8c547]/80">
              จุดที่เปลี่ยนได้
            </p>
            <p className="mt-0.5 text-[13px] font-semibold leading-snug text-white">
              {data.changeTitle}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/52">
              {data.changeBody}
            </p>
          </div>
        </div>
      </div>

      {locked ? (
        <FortunePaidLock
          title="รูปแบบปัญหาที่เกิดซ้ำ"
          subtitle="ปลดล็อกเพื่อดูวงจรและจุดเปลี่ยน"
          onUnlock={onUnlock}
          accent="gold"
        />
      ) : null}
    </section>
  );
}

/* ─── 08 ─────────────────────────────────────────── */

const STRENGTHS = [
  {
    n: "1",
    title: "การมองภาพรวม",
    body: "คุณเห็นภาพใหญ่ได้เร็ว เหมาะกับการวางแผนระยะกลางและจัดลำดับความสำคัญ",
    Icon: Eye,
    frame: "fortune-frame-cyan",
    tone: "text-cyan-300",
    ring: "ring-cyan-400/35",
    bg: "bg-cyan-400/12",
  },
  {
    n: "2",
    title: "ความสม่ำเสมอ",
    body: "เมื่อตั้งใจแล้ว คุณทำต่อได้ยาว ความนิ่งนี้คือข้อได้เปรียบที่หลายคนไม่มี",
    Icon: Settings2,
    frame: "fortune-frame-violet",
    tone: "text-violet-300",
    ring: "ring-violet-400/35",
    bg: "bg-violet-400/12",
  },
  {
    n: "3",
    title: "ความเข้าใจผู้อื่น",
    body: "คุณรับรู้ความรู้สึกคนรอบข้างได้ดี ใช้จุดนี้สร้างความร่วมมือที่แข็งแรง",
    Icon: Heart,
    frame: "fortune-frame-pink",
    tone: "text-pink-300",
    ring: "ring-pink-400/35",
    bg: "bg-pink-400/12",
  },
] as const;

/** 08 จุดแข็งที่ยังใช้ไม่เต็มที่ */
export function FortuneHiddenStrengths({
  locked = false,
  onUnlock,
  className,
}: {
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-gold relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="08"
        numClassName="text-[#e8c547]"
        title="จุดแข็งที่ยังใช้ไม่เต็มที่"
        en="HIDDEN STRENGTHS"
        aside="คุณมีศักยภาพมากกว่าที่คิด"
      />

      <div className="grid gap-2.5 px-3.5 pb-3.5 pt-3 sm:grid-cols-3">
        {STRENGTHS.map((s) => (
          <div
            key={s.n}
            className={cn("fortune-dash-inset rounded-[14px] px-3 py-3", s.frame)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-1",
                  s.bg,
                  s.ring,
                  s.tone
                )}
              >
                {s.n}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full ring-1",
                  s.bg,
                  s.ring
                )}
                data-slot={`paid-strength-${s.n}`}
              >
                <s.Icon className={cn("h-3.5 w-3.5", s.tone)} strokeWidth={1.8} />
              </span>
            </div>
            <p className="mt-2.5 text-[12.5px] font-semibold text-white">{s.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/50">{s.body}</p>
          </div>
        ))}
      </div>

      {locked ? (
        <FortunePaidLock
          title="จุดแข็งที่ยังใช้ไม่เต็มที่"
          subtitle="ปลดล็อกเพื่อดูศักยภาพซ่อนเร้น"
          onUnlock={onUnlock}
          accent="gold"
        />
      ) : null}
    </section>
  );
}

/* ─── 09 ─────────────────────────────────────────── */

const PLAN = [
  {
    range: "วัน 1 – 30",
    title: "จัดระเบียบ",
    Icon: ClipboardList,
    frame: "fortune-frame-cyan",
    tone: "text-cyan-300",
    ring: "ring-cyan-400/30",
    bg: "bg-cyan-400/10",
    items: [
      "ทบทวนงานและเป้าหมายที่ยังค้าง",
      "จัดตารางเวลาให้มีช่วงโฟกัสชัดเจน",
    ],
  },
  {
    range: "วัน 31 – 60",
    title: "ทดลอง",
    Icon: CheckSquare,
    frame: "fortune-frame-violet",
    tone: "text-violet-300",
    ring: "ring-violet-400/30",
    bg: "bg-violet-400/10",
    items: [
      "ลองแนวทางใหม่ที่สอดคล้องเป้าหมาย",
      "เก็บผลลัพธ์สั้น ๆ ทุกสัปดาห์",
    ],
  },
  {
    range: "วัน 61 – 90",
    title: "ทบทวน",
    Icon: RefreshCw,
    frame: "fortune-frame-pink",
    tone: "text-pink-300",
    ring: "ring-pink-400/30",
    bg: "bg-pink-400/10",
    items: [
      "ประเมินสิ่งที่ได้ผลและควรตัดทิ้ง",
      "วางแผน 6 เดือนถัดไปแบบเรียบง่าย",
    ],
  },
] as const;

/** 09 แผนลงมือทำ 90 วัน */
export function FortuneActionPlan90({
  locked = false,
  onUnlock,
  className,
}: {
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-cyan relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="09"
        numClassName="text-cyan-300"
        title="แผนลงมือทำ 90 วัน"
        en="90-DAY ACTION PLAN"
        aside="เริ่มจากก้าวเล็ก ๆ ที่สม่ำเสมอ"
      />

      <div className="grid gap-2.5 px-3.5 pb-3.5 pt-3 sm:grid-cols-3">
        {PLAN.map((p) => (
          <div
            key={p.range}
            className={cn("fortune-dash-inset rounded-[14px] px-3 py-3", p.frame)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[10px] ring-1",
                  p.bg,
                  p.ring
                )}
                data-slot={`paid-plan-${p.title}`}
              >
                <p.Icon className={cn("h-3.5 w-3.5", p.tone)} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-white/40">{p.range}</p>
                <p className="text-[12.5px] font-semibold text-white">{p.title}</p>
              </div>
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {p.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-[11px] leading-snug text-white/55"
                >
                  <ListChecks
                    className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", p.tone)}
                    strokeWidth={1.8}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {locked ? (
        <FortunePaidLock
          title="แผนลงมือทำ 90 วัน"
          subtitle="ปลดล็อกเพื่อดูโรดแมปรายเดือน"
          onUnlock={onUnlock}
          accent="cyan"
        />
      ) : null}
    </section>
  );
}

/* ─── 10 ─────────────────────────────────────────── */

const QUESTIONS = [
  "ตอนนี้ฉันกำลังแบกอะไรไว้มากเกินไปหรือไม่? และอะไรที่ฉันสามารถปล่อยวางได้",
  "สิ่งใดคือความสุขที่แท้จริงของฉัน และฉันจะให้พื้นที่กับสิ่งนั้นมากขึ้นได้อย่างไร",
] as const;

/** 10 คำถามสำหรับทบทวนตัวเอง */
export function FortuneReflection({
  seed = "dooduang",
  locked = false,
  onUnlock,
  className,
}: {
  seed?: string;
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}) {
  const storageKey = `dooduang-reflect-${seed}`;
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      setNote(localStorage.getItem(storageKey) ?? "");
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function saveNote(value: string) {
    setNote(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* ignore */
    }
  }

  return (
    <section
      className={cn(
        "fortune-dash-card fortune-frame-pink relative overflow-hidden rounded-[20px]",
        className
      )}
    >
      <FortunePaidHeader
        num="10"
        numClassName="text-pink-300"
        title="คำถามสำหรับทบทวนตัวเอง"
        en="REFLECTION"
        aside="คำถามดี ๆ นำไปสู่ชีวิตที่ดีกว่า"
      />

      <div className="grid gap-2.5 px-3.5 pb-3.5 pt-3 sm:grid-cols-3">
        {QUESTIONS.map((q, i) => (
          <div
            key={q}
            className="fortune-dash-inset rounded-[14px] px-3 py-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-bold text-white/70 ring-1 ring-white/10">
              {i + 1}
            </span>
            <p className="mt-2.5 text-[12px] leading-relaxed text-white/70">{q}</p>
          </div>
        ))}

        <div className="fortune-dash-inset fortune-frame-gold flex flex-col rounded-[14px] px-3 py-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e8c547]/12 ring-1 ring-[#e8c547]/30"
              data-slot="paid-reflect-note"
            >
              <PenLine className="h-3.5 w-3.5 text-[#e8c547]" strokeWidth={1.8} />
            </span>
            <p className="text-[12.5px] font-semibold text-white">บันทึกของฉัน</p>
          </div>
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            disabled={locked}
            rows={4}
            placeholder="เขียนสิ่งที่อยากจำ หรือสิ่งที่อยากเปลี่ยน..."
            className="mt-2.5 min-h-[88px] flex-1 resize-none rounded-[10px] border border-white/[0.08] bg-black/20 px-2.5 py-2 text-[11.5px] leading-relaxed text-white/80 placeholder:text-white/30 outline-none focus:border-[#e8c547]/35 disabled:opacity-50"
          />
        </div>
      </div>

      {locked ? (
        <FortunePaidLock
          title="คำถามทบทวนตัวเอง"
          subtitle="ปลดล็อกเพื่อเขียนบันทึกส่วนตัว"
          onUnlock={onUnlock}
          accent="pink"
        />
      ) : null}
    </section>
  );
}
