"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  CalendarRange,
  Check,
  Compass,
  Download,
  Heart,
  Lock,
  Sparkles,
  Wallet,
} from "lucide-react";
import { MysticFrame } from "@/components/ui/mystic-frame";
import { FORTUNE_UNLOCK_PRICE } from "@/lib/site";
import { cn } from "@/lib/utils";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function ageFromBirth(birthDate: string) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 30;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return Math.max(1, Math.min(90, age));
}

function pick(seed: string, salt: string, mod: number) {
  return hashSeed(`${seed}-${salt}`) % Math.max(1, mod);
}

const IDENTITIES = [
  {
    title: "นักสร้างรากฐาน",
    body: "คุณคิดเป็นระบบ ชอบวางแผน และมักเป็นคนที่คนอื่นพึ่งพาได้เมื่อสถานการณ์ไม่นิ่ง",
  },
  {
    title: "นักปรับทิศทาง",
    body: "คุณมองเห็นโอกาสเร็ว ยืดหยุ่น และพร้อมเปลี่ยนแผนเมื่อข้อมูลใหม่เข้ามา",
  },
  {
    title: "นักสะสมพลัง",
    body: "คุณอดทนสูง ชอบพัฒนาตัวเองเงียบ ๆ และผลงานมักเห็นชัดในระยะยาว",
  },
] as const;

const STRENGTHS = [
  {
    title: "วางแผนเก่ง",
    body: "คุณแยกสิ่งสำคัญออกจากสิ่งเร่งได้ดี ทำให้เดินทีละก้าวอย่างมั่นคง",
  },
  {
    title: "น่าเชื่อถือ",
    body: "คนรอบข้างไว้วางใจคุณง่าย เพราะพูดแล้วทำ และรับผิดชอบจนจบ",
  },
  {
    title: "เรียนรู้เร็ว",
    body: "เมื่อโฟกัสชัด คุณดูดซับทักษะใหม่ได้เร็วและเอามาใช้จริงได้ทันที",
  },
  {
    title: "มีวินัย",
    body: "คุณทำสิ่งเดิมซ้ำได้ต่อเนื่อง ซึ่งเป็นรากฐานของผลลัพธ์ระยะยาว",
  },
  {
    title: "ใจเย็น",
    body: "ตอนกดดัน คุณยังคิดเป็นเหตุเป็นผล ทำให้ตัดสินใจได้ดีกว่าคนส่วนใหญ่",
  },
] as const;

const ADJUSTMENTS = [
  {
    title: "รับภาระมากเกินไป",
    body: "คุณช่วยคนง่ายจนพลังตัวเองหมด ลองเลือกช่วยเฉพาะเรื่องที่สำคัญจริง",
  },
  {
    title: "กดดันตัวเองเกินจำเป็น",
    body: "มาตรฐานสูงเป็นข้อดี แต่ถ้าไม่มีเวลาพัก จะทำให้ตัดสินใจผิดพลาดได้",
  },
  {
    title: "คิดมากจนช้า",
    body: "การรอบคอบดี แต่บางเรื่องควรทดลองเล็ก ๆ แล้วค่อยปรับระหว่างทาง",
  },
  {
    title: "เก็บความรู้สึกไว้คนเดียว",
    body: "คุณรับภาระใจเงียบ ๆ การเล่าให้คนที่ไว้ใจฟัง จะช่วยเคลียร์ทางได้เร็วขึ้น",
  },
] as const;

const TIPS = [
  "เลือกเป้าหมายหลักเพียง 1 เรื่องใน 14 วันนี้ แล้วตัดอย่างอื่นออกก่อน",
  "ตั้งเวลาทบทวนสั้น ๆ สัปดาห์ละครั้ง ว่าอะไรเดินหน้า อะไรควรหยุด",
  "แบ่งงานที่ไม่จำเป็นให้คนอื่น หรือเลื่อนออกอย่างน้อย 1 อย่าง",
] as const;

const PREVIEW_SNIPPETS = [
  {
    title: "ต้นเหตุที่เกิดซ้ำ",
    teaser: "แบบแผนที่ทำให้คุณวนกลับมาจุดเดิม มักเริ่มจาก…",
  },
  {
    title: "จังหวะ 12 เดือน",
    teaser: "ช่วงที่เหมาะกับการตัดสินใจใหญ่จะชัดขึ้นช่วง…",
  },
  {
    title: "แผน 7 วัน",
    teaser: "วันที่ 1–2 โฟกัสจัดระเบียบ วันที่ 3–5 ลงมือ…",
  },
] as const;

const UNLOCK_ITEMS = [
  { icon: CalendarRange, text: "กราฟวัฏจักรชีวิตครบทุกช่วงอายุ" },
  { icon: Sparkles, text: "คำวิเคราะห์ครบทั้ง 12 เรือน" },
  { icon: Lock, text: "ต้นเหตุของปัญหาที่เกิดซ้ำ" },
  { icon: Check, text: "จุดเด่นที่ยังใช้ไม่เต็มศักยภาพ" },
  { icon: Briefcase, text: "การงาน การเงิน ความรักแบบเจาะลึก" },
  { icon: Heart, text: "จังหวะสำคัญใน 12 เดือน" },
  { icon: Compass, text: "แนวทางรับมือเฉพาะบุคคล" },
  { icon: Wallet, text: "แผนลงมือทำ 7 วัน" },
  { icon: Download, text: "ดาวน์โหลดหรือกลับมาอ่านย้อนหลังได้" },
] as const;

function PowerRing({ score }: { score: number }) {
  const size = 120;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 12);

  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] tracking-[0.14em] text-cyan-200/75">พลังชีวิต</p>
        <p className="mt-1 text-[1.7rem] font-semibold leading-none text-cyan-100">
          {score}
          <span className="text-[0.95rem] text-white/35">/12</span>
        </p>
      </div>
    </div>
  );
}

function RhythmChart({ age, scores }: { age: number; scores: number[] }) {
  // ages: -2, -1, 0, +1 (2 years back → 1 year forward)
  const ages = [age - 2, age - 1, age, age + 1];
  const W = 300;
  const H = 132;
  const padX = 20;
  const padT = 18;
  const padB = 32;
  const plotW = W - padX * 2;
  const plotH = H - padT - padB;

  const pts = scores.map((score, i) => ({
    x: padX + (plotW * i) / 3,
    y: padT + plotH * (1 - (Math.max(1, Math.min(12, score)) - 1) / 11),
    age: ages[i],
    now: i === 2,
    future: i === 3,
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    d += ` Q ${a.x} ${a.y}, ${mx} ${my}`;
    d += ` Q ${b.x} ${b.y}, ${b.x} ${b.y}`;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
        <path
          d={`${d} L ${pts[3].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`}
          fill="rgba(34,211,238,0.08)"
        />
        <path
          d={d}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p) => (
          <g key={p.age}>
            {p.now ? (
              <line
                x1={p.x}
                y1={padT - 4}
                x2={p.x}
                y2={H - padB + 4}
                stroke="rgba(34,211,238,0.4)"
                strokeDasharray="3 4"
              />
            ) : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.now ? 5.5 : 3.4}
              fill={p.future ? "#a78bfa" : p.now ? "#67e8f9" : "#e879f9"}
            />
            <text
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              fill={p.now ? "#a5f3fc" : "rgba(255,255,255,0.42)"}
              fontSize="11"
              fontWeight={p.now ? 700 : 400}
            >
              {p.age}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-white/35">
        <span>ย้อนหลัง 2 ปี</span>
        <span>ตอนนี้</span>
        <span>ล่วงหน้า 1 ปี</span>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3.5">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-cyan-300/65">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.05rem] font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">{subtitle}</p> : null}
      </div>
      <MysticFrame radius={18} contentClassName="p-4">
        {children}
      </MysticFrame>
    </section>
  );
}

interface LifeMapProps {
  seed: string;
  birthDate: string;
  nickname: string;
  className?: string;
}

export function LifeMap({ seed, birthDate, nickname, className }: LifeMapProps) {
  const age = ageFromBirth(birthDate);
  const power = 5 + pick(seed, "power", 8);
  const identity = IDENTITIES[pick(seed, "id", IDENTITIES.length)];
  const strengths = [0, 1, 2].map(
    (i) => STRENGTHS[(pick(seed, `s${i}`, STRENGTHS.length) + i) % STRENGTHS.length]
  );
  const adjustments = [0, 1, 2].map(
    (i) => ADJUSTMENTS[(pick(seed, `a${i}`, ADJUSTMENTS.length) + i) % ADJUSTMENTS.length]
  );
  const tips = [0, 1, 2].map((i) => TIPS[(pick(seed, `t${i}`, TIPS.length) + i) % TIPS.length]);
  // unique-ish tips
  const uniqueTips = [...new Set(tips)].slice(0, 3);

  const rhythmScores = [
    Math.max(1, power - 2),
    Math.max(1, power - 1),
    power,
    Math.min(12, power + pick(seed, "future", 2)),
  ];

  return (
    <div className={cn("relative space-y-10", className)}>
      <header className="text-center">
        <p className="text-[11px] font-medium tracking-[0.2em] text-cyan-300/70">
          ผลดูดวงฟรี · ประมาณ 50–60%
        </p>
        <h1 className="font-sacred mt-2 text-[1.75rem] leading-tight text-white">
          แผนที่ชีวิตของคุณ
        </h1>
        <p className="mt-2 text-[13px] text-white/45">
          สำหรับ {nickname} · อายุ {age} ปี
        </p>
      </header>

      {/* Free: identity */}
      <Section eyebrow="01" title="ภาพรวมตัวตน" subtitle="พิมพ์เขียวที่ใช้อธิบายตัวคุณตอนนี้">
        <p className="text-[15px] font-semibold text-cyan-100">{identity.title}</p>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/72">{identity.body}</p>
      </Section>

      {/* Free: strengths */}
      <Section eyebrow="02" title="จุดแข็ง 3 ด้าน" subtitle="สิ่งที่ควรใช้ให้เต็มที่">
        <div className="space-y-3">
          {strengths.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-[11px] font-semibold text-emerald-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[14px] font-semibold text-white">{item.title}</p>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/65">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Free: adjustments */}
      <Section eyebrow="03" title="สิ่งที่ควรปรับ 3 ด้าน" subtitle="จุดที่ถ้าปรับได้ ชีวิตจะเบาขึ้นชัดเจน">
        <div className="space-y-3">
          {adjustments.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-400/15 text-[12px] font-bold text-rose-300">
                  !
                </span>
                <p className="text-[14px] font-semibold text-white">{item.title}</p>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-white/65">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Free: power score */}
      <Section eyebrow="04" title="คะแนนพลังชีวิตปัจจุบัน">
        <div className="px-1 py-2 text-center">
          <PowerRing score={power} />
          <p className="mt-4 text-[13px] leading-relaxed text-white/60">
            พลังชีวิตตอนนี้อยู่ที่ระดับ {power} จาก 12 — เพียงพอสำหรับการวางฐานและเดินหน้าอย่างมีทิศ
          </p>
        </div>
      </Section>

      {/* Free: rhythm chart */}
      <Section
        eyebrow="05"
        title="กราฟจังหวะชีวิต"
        subtitle="ย้อนหลัง 2 ปี ถึงล่วงหน้า 1 ปี"
      >
        <div className="px-0 pb-1 pt-1">
          <RhythmChart age={age} scores={rhythmScores} />
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/50">
            จุดปัจจุบันคืออายุ {age} — ช่วงนี้เหมาะกับการจัดระเบียบเป้าหมายและสะสมผลอย่างต่อเนื่อง
          </p>
        </div>
      </Section>

      {/* Free: actionable tips */}
      <Section eyebrow="06" title="คำแนะนำที่ทำได้ทันที" subtitle="เลือกทำ 1–2 ข้อก็พอ แล้วทำต่อเนื่อง">
        <div className="space-y-2.5">
          {uniqueTips.map((tip, i) => (
            <div key={tip} className="flex gap-3 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-[11px] font-semibold text-violet-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="pt-0.5 text-[13.5px] leading-relaxed text-white/78">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Free: deep content teaser samples */}
      <Section
        eyebrow="07"
        title="ตัวอย่างเนื้อหาเชิงลึก"
        subtitle="เห็นบางส่วนก่อน — ฉบับเต็มจะเปิดครบทุกชั้น"
      >
        <div className="space-y-3">
          {PREVIEW_SNIPPETS.map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
            >
              <p className="text-[13px] font-semibold text-white/85">{item.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/45">{item.teaser}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-200/75">
                <Lock className="h-3 w-3" strokeWidth={1.8} />
                เหลือรายละเอียดในฉบับเต็ม
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Paid unlock — clear value list, not just blur */}
      <section className="space-y-4 border-t border-white/10 pt-10">
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-[0.18em] text-amber-200/70">
            ปลดล็อกฉบับเต็ม
          </p>
          <h2 className="mt-2 text-[1.25rem] font-semibold text-white">คุณจะได้อะไรเพิ่ม</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/45">
            ไม่ใช่แค่เปิดกล่องเบลอ แต่ได้คำตอบว่าทำไม เป็นช่วงไหน และรับมือยังไง
          </p>
        </div>

        <MysticFrame radius={18} contentClassName="space-y-2 p-4">
          {UNLOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.text}
                className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300/12 text-amber-200">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <p className="pt-1 text-[13.5px] leading-snug text-white/80">{item.text}</p>
              </div>
            );
          })}
        </MysticFrame>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#e8c547] to-[#c9a227] px-4 py-4 text-left shadow-[0_8px_28px_rgba(201,162,39,0.28)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/15 text-[#2a1f05]">
            <Compass className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-[#1f1704]">
              ปลดล็อกฉบับเต็ม ฿{FORTUNE_UNLOCK_PRICE}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#1f1704]/65">
              ชำระครั้งเดียว · เก็บไว้เปิดอ่านซ้ำได้
            </span>
          </span>
        </button>
      </section>
    </div>
  );
}
