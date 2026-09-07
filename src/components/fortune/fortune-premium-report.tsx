"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Briefcase,
  ChevronDown,
  CircleDot,
  Heart,
  Lightbulb,
  PenLine,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PremiumFortune } from "@/lib/fortune/extended";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";
import { FortuneAuspiciousCalendar } from "@/components/fortune/fortune-auspicious-calendar";

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
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  if (age < 1 || age > 90) return null;
  return age;
}

function smoothLine(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]!.x} ${pts[0]!.y}`;
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const TOC = [
  { id: "premium-summary", label: "บทสรุป" },
  { id: "premium-zodiac", label: "ราศี" },
  { id: "premium-lifepath", label: "12 ปี" },
  { id: "premium-calendar", label: "ปฏิทิน" },
  { id: "premium-domains", label: "งาน·เงิน·รัก" },
  { id: "premium-self", label: "เข้าใจตัวเอง" },
  { id: "premium-year", label: "ปีนี้" },
  { id: "premium-advice", label: "คำแนะนำ" },
] as const;

const YEAR_DETAILS = [
  {
    overview: "ปีแห่งการตั้งต้นและจัดระบบชีวิตใหม่",
    turning: "เลือกทิศทางหลักให้ชัดก่อนขยายงาน",
    reason: "จังหวะนี้เหมาะกับการวางรากฐานมากกว่าเร่งผลลัพธ์",
    guidance: "โฟกัสเป้าหมายหลักหนึ่งเรื่อง และตัดสิ่งที่ไม่จำเป็น",
  },
  {
    overview: "ปีแห่งการสร้างวินัยและความสม่ำเสมอ",
    turning: "นิสัยเล็ก ๆ ที่ทำซ้ำจะเริ่มเห็นผล",
    reason: "พลังงานสนับสนุนงานที่ต้องใช้ความอดทน",
    guidance: "ตั้งเกณฑ์วัดผลรายเดือนแบบเรียบง่าย",
  },
  {
    overview: "ปีแห่งการเปิดโอกาสและการทดลอง",
    turning: "โอกาสใหม่เข้ามาเมื่อคุณพร้อมรับผิดชอบ",
    reason: "ช่วงขยายเครือข่ายและการเรียนรู้",
    guidance: "ลองแนวทางใหม่ได้ แต่เก็บข้อมูลผลลัพธ์ไว้",
  },
  {
    overview: "ปีแห่งการทดสอบความอดทน",
    turning: "แรงกดดันช่วยให้เห็นสิ่งที่สำคัญจริง",
    reason: "จังหวะเหมาะกับการคัดกรองมากกว่าขยาย",
    guidance: "อย่าตัดสินใจใหญ่ตอนอารมณ์ต่ำ",
  },
  {
    overview: "ปีแห่งการเก็บเกี่ยวผลงาน",
    turning: "ผลจากความพยายามก่อนหน้าเริ่มชัด",
    reason: "เหมาะกับการปิดงานสำคัญและสร้างชื่อเสียง",
    guidance: "ปิดงานค้างก่อนเปิดแนวรบใหม่",
  },
  {
    overview: "ปีแห่งการปรับสมดุลชีวิต",
    turning: "หันมาดูแลร่างกายและความสัมพันธ์ควบคู่เป้าหมาย",
    reason: "พลังงานชวนลดความเร่งและเพิ่มคุณภาพชีวิต",
    guidance: "จัดเวลาพักให้เป็นส่วนหนึ่งของแผนงาน",
  },
  {
    overview: "ปีแห่งการก้าวกระโดด",
    turning: "โอกาสสำคัญอาจต้องการการตัดสินใจที่กล้า",
    reason: "จังหวะเหมาะกับการรับผิดชอบที่ใหญ่ขึ้น",
    guidance: "ตัดสินใจด้วยข้อมูล และอย่ารอความพร้อมสมบูรณ์",
  },
  {
    overview: "ปีแห่งการเชื่อมโยงผู้คน",
    turning: "ความร่วมมือดีจะพาคุณไปได้ไกลกว่าทำคนเดียว",
    reason: "พลังด้านคนรอบตัวเด่นขึ้น",
    guidance: "สื่อสารความต้องการให้ชัดและฟังอีกฝ่าย",
  },
  {
    overview: "ปีแห่งการเข้าใจตัวตนลึกขึ้น",
    turning: "ปล่อยสิ่งเก่าที่ไม่ได้เป็นคุณอีกต่อไป",
    reason: "เหมาะกับการทบทวนนิยามความสำเร็จ",
    guidance: "ลดบทบาทที่ไม่ใช่ และเลือกสิ่งที่สอดคล้องใจ",
  },
  {
    overview: "ปีแห่งพลังสร้างสรรค์",
    turning: "ไอเดียไหลดีเมื่อมีพื้นที่ว่างพอ",
    reason: "จังหวะเหมาะกับการสร้างผลงานในแบบของคุณ",
    guidance: "ลงมือทำชิ้นงานเล็ก ๆ ให้เสร็จเป็นระยะ",
  },
  {
    overview: "ปีแห่งความมั่นคง",
    turning: "เลือกรากฐานที่อยู่ได้นานกว่าผลเร็ว",
    reason: "เหมาะกับการวางแผนการเงินและงานระยะยาว",
    guidance: "สร้างระบบที่ทำซ้ำได้ ไม่พึ่งแรงฮึดชั่วคราว",
  },
  {
    overview: "ปีแห่งการปิดรอบและเริ่มใหม่",
    turning: "สรุปบทเรียนทั้งรอบก่อนก้าวสู่บทถัดไป",
    reason: "จังหวะเหมาะกับการเคลียร์และปล่อยวาง",
    guidance: "ปิดสิ่งที่ไม่ใช่ แล้วเตรียมแผนรอบใหม่ที่เบาขึ้น",
  },
] as const;

const QUARTER_SETS = [
  [
    { focus: "ทบทวนเป้าหมายหลักของปี", tip: "เขียนสิ่งที่ต้องทำ / ไม่ต้องทำ ให้ชัดใน 1 หน้า" },
    { focus: "ทดลองแนวทางที่สอดคล้องเป้าหมาย", tip: "ลองเล็ก ๆ แล้วเก็บผลเป็นข้อมูล" },
    { focus: "ขยายสิ่งที่พิสูจน์แล้วว่าได้ผล", tip: "ทุ่มแรงที่ทำซ้ำได้ ไม่กระจายเกิน" },
    { focus: "สรุปบทเรียนและตั้งแผนรอบใหม่", tip: "ปิดงานค้างก่อนวางเป้าปีถัดไป" },
  ],
  [
    { focus: "จัดระบบงานและเงินให้มองเห็นภาพ", tip: "ตั้งงบและตารางโฟกัสสัปดาห์ละครั้ง" },
    { focus: "สร้างความสัมพันธ์ที่เกื้อหนุน", tip: "คุยกับคนสำคัญให้ชัดเรื่องความต้องการ" },
    { focus: "ลงมือทำโปรเจกต์หลักให้เห็นรูป", tip: "เลือก 1 ชิ้นงานแล้วทำให้จบ" },
    { focus: "พักและปรับสมดุลก่อนปีใหม่", tip: "ลดงานดึก เพิ่มการนอนให้พอ" },
  ],
] as const;

type DomainId = "work" | "money" | "love";

function Accordion({
  open,
  onToggle,
  title,
  accent,
  icon: Icon,
  summary,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  accent: string;
  icon: typeof Briefcase;
  summary: string;
  children: ReactNode;
}) {
  const panelId = useId();
  return (
    <div className="premium-card overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-3.5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--prem-cyan)]/50"
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-[var(--prem-text)]">
            {title}
          </span>
          <span className="mt-1 block text-[14px] leading-[1.7] text-[var(--prem-muted)]">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-[var(--prem-muted)] transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>
      <div id={panelId} className={cn("panel-expand", open && "is-open")}>
        <div>
          <div className="border-t border-white/[0.06] px-3.5 pb-3.5 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone?: string;
}) {
  return (
    <div className="py-2.5">
      <p
        className="text-[13px] font-semibold"
        style={{ color: tone ?? "var(--prem-gold)" }}
      >
        {label}
      </p>
      <p className="mt-1 text-[15px] leading-[1.75] text-[var(--prem-text)]/90">
        {body}
      </p>
    </div>
  );
}

/** Premium report — 6 sections, post-unlock only */
export function FortunePremiumReport({
  seed,
  birthDate,
  nickname,
  premium,
  className,
}: {
  seed: string;
  birthDate: string;
  nickname: string;
  premium?: PremiumFortune | null;
  className?: string;
}) {
  const age = ageFromBirth(birthDate);
  const zodiac = useMemo(() => getZodiacByBirthDate(birthDate), [birthDate]);
  const nowCe = new Date().getFullYear();
  const nowBe = nowCe + 543;

  const [activeToc, setActiveToc] = useState<string>(TOC[0].id);
  const [openDomain, setOpenDomain] = useState<DomainId | null>(null);
  const [loveMode, setLoveMode] = useState<"single" | "coupled">("single");
  const [selfMore, setSelfMore] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [yearIdx, setYearIdx] = useState(2);
  const gid = useId().replace(/:/g, "");

  const noteKey = `dooduang-reflect-${seed}`;

  useEffect(() => {
    try {
      setNote(localStorage.getItem(noteKey) ?? "");
    } catch {
      /* ignore */
    }
  }, [noteKey]);

  useEffect(() => {
    const nodes = TOC.map((t) => document.getElementById(t.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveToc(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.4] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const years = useMemo(() => {
    const baseAge = age ?? 30;
    return Array.from({ length: 12 }, (_, i) => {
      const ageAt = baseAge - 2 + i;
      const ce = nowCe - 2 + i;
      const be = ce + 543;
      const score = 3 + (hashSeed(`${seed}-lp-score-${i}`) % 9);
      const detail = YEAR_DETAILS[i]!;
      return { i, ageAt, ce, be, score, ...detail };
    });
  }, [age, nowCe, seed]);

  const activeYear = years[yearIdx] ?? years[2]!;

  const W = 360;
  const H = 128;
  const padX = 16;
  const padTop = 18;
  const padBottom = 28;
  const pts = years.map((y, i) => ({
    x: padX + (i * (W - padX * 2)) / 11,
    y: padTop + ((12 - y.score) / 11) * (H - padTop - padBottom),
  }));
  const line = smoothLine(pts);

  const summaryHeadline =
    premium?.heroTitle?.trim() ||
    `${nickname} เติบโตได้ไกลเมื่อเลือกโฟกัสสิ่งสำคัญจริง ๆ`;
  const summaryBody =
    premium?.summary?.trim() ||
    premium?.teaser?.trim() ||
    `ช่วงนี้เหมาะกับการจัดลำดับใหม่ แบ่งภาระ และลงมือทีละเรื่องให้จบ มากกว่าแบกทุกอย่างพร้อมกัน`;

  const premiumSections = premium?.sections ?? [];

  const domains: Array<{
    id: DomainId;
    title: string;
    accent: string;
    Icon: typeof Briefcase;
    summary: string;
    situation: string;
    opportunity: string;
    caution: string;
    advice: string;
  }> = [
    {
      id: "work",
      title: "การงาน",
      accent: "var(--prem-cyan)",
      Icon: Briefcase,
      summary:
        premiumSections[0]?.content?.slice(0, 120) ||
        "งานหลายแนวอาจเข้ามาพร้อมกัน จังหวะนี้เหมาะกับการจัดลำดับก่อนลงมือ",
      situation:
        premiumSections[0]?.content ||
        "คุณมีพลังรับผิดชอบสูง แต่ช่วงนี้อาจมีงานซ้อนกัน ควรเลือกบทบาทหลักให้ชัด",
      opportunity:
        "งานที่โชว์ความละเอียดและความรับผิดชอบจะถูกมองเห็นชัดขึ้น",
      caution: "ระวังการเปิดงานใหม่ก่อนปิดของเดิมจนสะสมความเหนื่อย",
      advice: "เลือกเป้าหมายวันละหนึ่งเรื่อง แล้วปิดงานค้างก่อนขยาย",
    },
    {
      id: "money",
      title: "การเงิน",
      accent: "var(--prem-gold)",
      Icon: Wallet,
      summary:
        "ความมั่นคงเริ่มจากตัวเลขที่มองเห็นได้ชัด และแผนที่ทำซ้ำได้",
      situation:
        premiumSections[1]?.content ||
        "รายจ่ายเล็กที่เกิดซ้ำอาจสะสมโดยไม่ทันสังเกต",
      opportunity: "เหมาะกับการจัดงบและสร้างเงินสำรองมากกว่าลงทุนเสี่ยง",
      caution: "อย่าตัดสินใจจ่ายใหญ่ตอนเร่งหรืออารมณ์สูง",
      advice: "จดรายจ่ายสัปดาห์ละครั้ง และตั้งเป้าออมสั้น ๆ ให้ชัด",
    },
    {
      id: "love",
      title: "ความรัก",
      accent: "var(--prem-pink)",
      Icon: Heart,
      summary:
        loveMode === "single"
          ? "คุณต้องการพื้นที่ปลอดภัยและความเข้าใจที่จริงใจ"
          : "ความใกล้ชิดเติบโตได้เมื่อทั้งคู่สื่อสารชัดและรู้สึกปลอดภัย",
      situation:
        loveMode === "single"
          ? "จังหวะนี้เหมาะกับการรู้จักจังหวะตัวเองก่อนเร่งเข้าสู่ความสัมพันธ์ใหม่"
          : "อาจมีความต้องการที่ยังไม่ได้พูดออกมา ทำให้เกิดการเดาแทนการคุย",
      opportunity:
        loveMode === "single"
          ? "คนที่ฟังคุณจริง ๆ จะโดดเด่นขึ้นเมื่อคุณสื่อสารความต้องการชัด"
          : "การนัดคุยสั้น ๆ รายสัปดาห์ช่วยลดความเข้าใจผิดได้มาก",
      caution:
        loveMode === "single"
          ? "อย่าลดมาตรฐานเพราะกลัวอยู่คนเดียว"
          : "อย่ารีบสรุปจากความรู้สึกชั่วขณะ",
      advice:
        loveMode === "single"
          ? "บอกความต้องการสั้น ๆ ให้ชัด และสังเกตคนที่รับฟัง"
          : "ฟังให้จบก่อนตอบ และใช้คำถามเปิดแทนการตัดสิน",
    },
  ];

  const selfMain = {
    pattern: "รับผิดชอบมากเกินไปจนลืมความต้องการของตัวเอง",
    impact: "เหนื่อยสะสม สื่อสารน้อยลง และคนรอบตัวไม่รู้ว่าคุณต้องการอะไร",
    strength: "ความใส่ใจและความรับผิดชอบคือจุดแข็ง — ใช้ให้ถูกจังหวะ",
    adjust: "บอกขอบเขตก่อนรับปาก และเลือกภาระที่สำคัญจริง",
  };
  const selfExtra = {
    pattern: "ตั้งมาตรฐานสูงจนรู้สึกไม่พอแม้ทำได้ดีแล้ว",
    impact: "ผลงานดูดีแต่ใจเริ่มหมดไฟ",
    strength: "ความสม่ำเสมอและการมองภาพรวมช่วยจัดลำดับได้ดี",
    adjust: "ตั้งเกณฑ์ ‘พอดี’ ให้ชัด แล้วฉลองชัยชนะเล็ก ๆ",
  };

  const quarterSet = QUARTER_SETS[hashSeed(`${seed}-q`) % QUARTER_SETS.length]!;

  const actions = [
    {
      title: "เลือกเป้าหมายหลัก 1 เรื่อง",
      why: "ลดการกระจายพลัง และทำให้ผลงานเห็นชัดเร็วขึ้น",
    },
    {
      title: "บอกขอบเขตก่อนรับปาก",
      why: "ป้องกันรูปแบบแบกเกินที่ทำให้เหนื่อยและห่างเหิน",
    },
    {
      title: "ทบทวนสัปดาห์ละครั้ง 15 นาที",
      why: "เห็นสิ่งที่ได้ผลเร็ว และปรับแผนได้ทันก่อนสะสมปัญหา",
    },
  ];

  function saveNote(value: string) {
    setNote(value);
    try {
      localStorage.setItem(noteKey, value);
    } catch {
      /* ignore */
    }
  }

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveToc(id);
  }

  const labelEvery = 2; // avoid overlapping BE labels on mobile

  return (
    <div className={cn("fortune-premium-report", className)}>
      <nav
        className="premium-toc"
        aria-label="สารบัญรายงาน"
      >
        <div className="premium-toc-track">
          {TOC.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => jumpTo(t.id)}
              className={cn(
                "premium-toc-item",
                activeToc === t.id && "is-active"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 1 Summary */}
      <section id="premium-summary" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-gold)" }}>
            01
          </p>
          <h2 className="premium-title">บทสรุปเฉพาะคุณ</h2>
        </header>
        <div className="premium-card px-4 py-4">
          <p className="text-[20px] font-semibold leading-[1.45] text-[var(--prem-text)]">
            {summaryHeadline}
          </p>
          <p className="mt-3 text-[16px] leading-[1.75] text-[var(--prem-muted)]">
            {summaryBody}
          </p>
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--prem-cyan)]" strokeWidth={1.8} />
              <div>
                <p className="text-[14px] font-semibold text-[var(--prem-cyan)]">โอกาส</p>
                <p className="mt-0.5 text-[15px] leading-[1.7] text-[var(--prem-text)]/88">
                  {premiumSections[0]?.heading
                    ? `${premiumSections[0].heading}: ${premiumSections[0].content.slice(0, 140)}${premiumSections[0].content.length > 140 ? "…" : ""}`
                    : "ช่วงนี้เหมาะกับการโฟกัสงานสำคัญที่โชว์ความรับผิดชอบ และเปิดรับความช่วยเหลือ"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--prem-pink)]" strokeWidth={1.8} />
              <div>
                <p className="text-[14px] font-semibold text-[var(--prem-pink)]">เรื่องที่ควรระวัง</p>
                <p className="mt-0.5 text-[15px] leading-[1.7] text-[var(--prem-text)]/88">
                  อย่าแบกทุกอย่างคนเดียวจนสื่อสารน้อยลง — เป็นรูปแบบที่ทำให้เหนื่อยและห่างเหินได้
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--prem-gold)]" strokeWidth={1.8} />
              <div>
                <p className="text-[14px] font-semibold text-[var(--prem-gold)]">สิ่งที่ควรทำ</p>
                <p className="mt-0.5 text-[15px] leading-[1.7] text-[var(--prem-text)]/88">
                  เลือกเป้าหมายหลักหนึ่งเรื่อง บอกขอบเขตก่อนรับปาก และทบทวนสั้น ๆ ทุกสัปดาห์
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zodiac deep dive */}
      <section id="premium-zodiac" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-gold)" }}>
            ราศี
          </p>
          <h2 className="premium-title">
            เจาะลึกราศี{zodiac.thaiName} {zodiac.symbol}
          </h2>
          <p className="premium-sub">
            ธาตุ{zodiac.element} · {zodiac.dateRange}
          </p>
        </header>
        <div className="premium-card space-y-3 px-4 py-4">
          <div>
            <p className="text-[13px] font-semibold text-[var(--prem-gold)]">
              บุคลิกหลัก
            </p>
            <p className="mt-1 text-[15px] leading-[1.75] text-[var(--prem-text)]/90">
              {zodiac.element === "ไฟ"
                ? `${nickname} มีพลังผลักดันสูง กล้าเริ่ม และชอบเห็นผลเร็ว แต่จะยั่งยืนขึ้นเมื่อฝึกความอดทนกับรายละเอียด`
                : zodiac.element === "ดิน"
                  ? `${nickname} ชอบความมั่นคง วางแผนเป็น และทำสิ่งที่จับต้องได้ เติบโตดีเมื่อมีเป้าหมายชัดและไม่แบกเกิน`
                  : zodiac.element === "ลม"
                    ? `${nickname} คิดไว สื่อสารเก่ง และเชื่อมคนได้ดี จุดแข็งคือไอเดีย — จุดที่ต้องฝึกคือโฟกัสทีละเรื่อง`
                    : `${nickname} อ่อนไหว เข้าใจคน และใช้สัญชาตญาณได้ดี จุดแข็งคือความเห็นอกเห็นใจ — ควรตั้งขอบเขตให้ใจไม่เหนื่อย`}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--prem-cyan)]">
              จุดแข็งที่ควรใช้ให้เต็มที่
            </p>
            <p className="mt-1 text-[15px] leading-[1.75] text-[var(--prem-text)]/90">
              {zodiac.element === "ไฟ"
                ? "ความกล้าเริ่ม ความเร็วในการตัดสินใจ และพลังสร้างแรงบันดาลใจให้คนรอบข้าง"
                : zodiac.element === "ดิน"
                  ? "ความรับผิดชอบ ความอดทน และการสร้างผลลัพธ์ที่จับต้องได้ทีละขั้น"
                  : zodiac.element === "ลม"
                    ? "ความยืดหยุ่น การสื่อสาร และความสามารถในการเชื่อมไอเดียกับคน"
                    : "ความเข้าใจคน สัญชาตญาณ และการดูแลความสัมพันธ์อย่างลึกซึ้ง"}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--prem-pink)]">
              จุดเปลี่ยนที่ควรจับตา
            </p>
            <p className="mt-1 text-[15px] leading-[1.75] text-[var(--prem-text)]/90">
              {`ช่วงนี้ราศี${zodiac.thaiName} เหมาะกับการทบทวนทิศทางหลัก แล้วเลือกสิ่งที่สอดคล้องกับตัวตนระยะยาวมากกว่าทำตามกระแส — โดยเฉพาะเรื่องงานและความสัมพันธ์ที่กระทบใจ`}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--prem-purple,#BB6CF0)]">
              คำแนะนำเฉพาะราศี
            </p>
            <p className="mt-1 text-[15px] leading-[1.75] text-[var(--prem-text)]/90">
              {`ใช้พลังธาตุ${zodiac.element} ของคุณให้เป็นเครื่องมือ ไม่ใช่แรงกดดัน — เริ่มจากก้าวเล็ก ๆ ที่ทำซ้ำได้ทุกสัปดาห์ และวัดผลจากพฤติกรรม ไม่ใช่อารมณ์ชั่วขณะ`}
            </p>
          </div>
        </div>
      </section>

      {/* 2 Life path */}
      <section id="premium-lifepath" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-cyan)" }}>
            02
          </p>
          <h2 className="premium-title">เส้นทางชีวิต 12 ปี</h2>
          <p className="premium-sub">
            ภาพระยะยาว ·{" "}
            {age != null
              ? `อายุประมาณ ${age} ปี · พ.ศ. ${nowBe - 2}–${nowBe + 9}`
              : `พ.ศ. ${nowBe - 2}–${nowBe + 9}`}
          </p>
        </header>

        <div className="premium-card overflow-hidden p-3">
          <p className="mb-2 rounded-lg bg-[var(--prem-gold)]/10 px-2.5 py-1.5 text-[12px] leading-snug text-[var(--prem-gold)]">
            กราฟและรายละเอียดปีด้านล่างเป็นตัวอย่างเพื่อจัดวางรายงาน
            ยังไม่ได้คำนวณจากระบบโหราศาสตร์จริง
          </p>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="กราฟเส้นทางชีวิต 12 ปี (ตัวอย่าง)"
          >
            <defs>
              <linearGradient id={`prem-stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F16DB5" />
                <stop offset="50%" stopColor="#BB6CF0" />
                <stop offset="100%" stopColor="#46DDED" />
              </linearGradient>
            </defs>
            <path
              d={line}
              fill="none"
              stroke={`url(#prem-stroke-${gid})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            {pts.map((p, i) => {
              const selected = i === yearIdx;
              const y = years[i]!;
              const showLabel = i % labelEvery === 0 || i === 11 || selected;
              return (
                <g
                  key={y.be}
                  className="cursor-pointer"
                  onClick={() => setYearIdx(i)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={selected ? 5 : 3.2}
                    fill={selected ? "#F7F8FF" : "#9AB8DC"}
                    stroke={selected ? "#46DDED" : "transparent"}
                    strokeWidth={2}
                  />
                  {showLabel ? (
                    <text
                      x={p.x}
                      y={H - 8}
                      textAnchor="middle"
                      fill={selected ? "#F7F8FF" : "#9AB8DC"}
                      fontSize={8}
                    >
                      {String(y.be).slice(2)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {years.map((y, i) => (
              <button
                key={y.be}
                type="button"
                onClick={() => setYearIdx(i)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--prem-cyan)]/50",
                  i === yearIdx
                    ? "bg-[var(--prem-cyan)] text-[#0C1427]"
                    : "bg-white/[0.05] text-[var(--prem-muted)]"
                )}
              >
                พ.ศ. {y.be}
                {age != null ? ` · ${y.ageAt} ปี` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="premium-card mt-3 px-4 py-4">
          <p className="text-[17px] font-semibold text-[var(--prem-text)]">
            พ.ศ. {activeYear.be}
            {age != null ? ` · อายุ ${activeYear.ageAt} ปี` : ""}
          </p>
          <DetailBlock label="ภาพรวม" body={activeYear.overview} tone="var(--prem-cyan)" />
          <DetailBlock label="จุดเปลี่ยน" body={activeYear.turning} tone="var(--prem-purple)" />
          <DetailBlock
            label="เหตุผลของคำอ่าน (ตัวอย่าง)"
            body={activeYear.reason}
            tone="var(--prem-muted)"
          />
          <DetailBlock label="แนวทางพิจารณา" body={activeYear.guidance} tone="var(--prem-gold)" />
        </div>
      </section>

      {/* Calendar 12y */}
      <section id="premium-calendar" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-gold)" }}>
            ปฏิทิน
          </p>
          <h2 className="premium-title">ปฏิทินฤกษ์ 12 ปี</h2>
          <p className="premium-sub">
            พลังงานรายวัน · วันพระ · วันธงชัย · วันโชคลาภ
          </p>
        </header>
        <FortuneAuspiciousCalendar seed={seed} unlocked variant="full" />
      </section>

      {/* 3 Domains */}
      <section id="premium-domains" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-purple)" }}>
            03
          </p>
          <h2 className="premium-title">เจาะลึกงาน / เงิน / ความรัก</h2>
        </header>

        <div
          className="mb-3 flex rounded-full bg-white/[0.05] p-1"
          role="tablist"
          aria-label="สถานะความสัมพันธ์"
        >
          {(
            [
              { id: "single" as const, label: "โสด" },
              { id: "coupled" as const, label: "มีคู่" },
            ]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={loveMode === t.id}
              onClick={() => setLoveMode(t.id)}
              className={cn(
                "flex-1 rounded-full py-2 text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--prem-pink)]/50",
                loveMode === t.id
                  ? "bg-[var(--prem-pink)] text-white"
                  : "text-[var(--prem-muted)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mb-3 text-[12px] text-[var(--prem-muted)]">
          สลับโสด / มีคู่มีผลกับรายละเอียดด้านความรัก
        </p>

        <div className="space-y-2.5">
          {domains.map((d) => (
            <Accordion
              key={d.id}
              open={openDomain === d.id}
              onToggle={() =>
                setOpenDomain((v) => (v === d.id ? null : d.id))
              }
              title={d.title}
              accent={d.accent}
              icon={d.Icon}
              summary={d.summary}
            >
              <DetailBlock label="สถานการณ์" body={d.situation} tone={d.accent} />
              <DetailBlock label="โอกาส" body={d.opportunity} tone="var(--prem-cyan)" />
              <DetailBlock label="สิ่งที่ควรระวัง" body={d.caution} tone="var(--prem-pink)" />
              <DetailBlock label="คำแนะนำ" body={d.advice} tone="var(--prem-gold)" />
            </Accordion>
          ))}
        </div>
      </section>

      {/* 4 Self */}
      <section id="premium-self" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-pink)" }}>
            04
          </p>
          <h2 className="premium-title">เข้าใจตัวเอง</h2>
          <p className="premium-sub">รูปแบบ · ผลกระทบ · จุดแข็ง · วิธีปรับ</p>
        </header>

        <div className="premium-card px-4 py-4">
          <SelfChain data={selfMain} />
          <div className={cn("panel-expand", selfMore && "is-open")}>
            <div>
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <SelfChain data={selfExtra} />
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-expanded={selfMore}
            onClick={() => setSelfMore((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-medium text-[var(--prem-cyan)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--prem-cyan)]/50"
          >
            {selfMore ? "ย่อประเด็นเพิ่มเติม" : "ดูประเด็นเพิ่มเติม"}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", selfMore && "rotate-180")}
            />
          </button>
        </div>
      </section>

      {/* 5 Year moments */}
      <section id="premium-year" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-cyan)" }}>
            05
          </p>
          <h2 className="premium-title">จังหวะสำคัญปีนี้</h2>
          <p className="premium-sub">
            รายละเอียดปีปัจจุบัน (พ.ศ. {nowBe}) · ไม่ใช่กราฟระยะยาวด้านบน
          </p>
        </header>

        <ol className="premium-card relative space-y-0 overflow-hidden px-4 py-4">
          <span
            className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-[var(--prem-cyan)]/40 via-[var(--prem-purple)]/30 to-[var(--prem-pink)]/40"
            aria-hidden
          />
          {quarterSet.map((q, i) => (
            <li key={q.focus} className="relative flex gap-3 pb-4 last:pb-0">
              <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--prem-card)] text-[13px] font-bold text-[var(--prem-cyan)] ring-1 ring-[var(--prem-cyan)]/35">
                Q{i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[16px] font-semibold text-[var(--prem-text)]">
                  ไตรมาส {i + 1} · {q.focus}
                </p>
                <p className="mt-1 text-[15px] leading-[1.7] text-[var(--prem-muted)]">
                  {q.tip}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 6 Advice */}
      <section id="premium-advice" className="premium-section">
        <header className="premium-section-head">
          <p className="premium-kicker" style={{ color: "var(--prem-gold)" }}>
            06
          </p>
          <h2 className="premium-title">คำแนะนำสำหรับคุณ</h2>
        </header>

        <div className="space-y-2.5">
          {actions.map((a, i) => (
            <div key={a.title} className="premium-card flex gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--prem-gold)]/15 text-[13px] font-bold text-[var(--prem-gold)]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[var(--prem-text)]">
                  {a.title}
                </p>
                <p className="mt-1 text-[14px] leading-[1.7] text-[var(--prem-muted)]">
                  {a.why}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes accordion */}
        <div className="premium-card mt-3 overflow-hidden">
          <button
            type="button"
            aria-expanded={noteOpen}
            onClick={() => setNoteOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--prem-gold)]/50"
          >
            <span className="flex items-center gap-2 text-[16px] font-semibold text-[var(--prem-text)]">
              <PenLine className="h-4 w-4 text-[var(--prem-gold)]" />
              บันทึกของฉัน
            </span>
            <ChevronDown
              className={cn("h-5 w-5 text-[var(--prem-muted)] transition-transform", noteOpen && "rotate-180")}
            />
          </button>
          <div className={cn("panel-expand", noteOpen && "is-open")}>
            <div>
              <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
                <p className="text-[14px] leading-[1.7] text-[var(--prem-muted)]">
                  ตอนนี้ฉันกำลังแบกอะไรไว้มากเกินไปหรือไม่? สิ่งใดคือความสุขที่แท้จริงของฉัน?
                </p>
                <textarea
                  value={note}
                  onChange={(e) => saveNote(e.target.value)}
                  rows={5}
                  placeholder="เขียนสิ่งที่อยากจำ หรือสิ่งที่อยากเปลี่ยน..."
                  className="mt-3 w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[15px] leading-[1.7] text-[var(--prem-text)] placeholder:text-[var(--prem-muted)]/50 outline-none focus:border-[var(--prem-gold)]/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SelfChain({
  data,
}: {
  data: {
    pattern: string;
    impact: string;
    strength: string;
    adjust: string;
  };
}) {
  const rows = [
    { label: "รูปแบบที่เกิดขึ้น", body: data.pattern, Icon: CircleDot, tone: "var(--prem-purple)" },
    { label: "ผลกระทบ", body: data.impact, Icon: AlertTriangle, tone: "var(--prem-pink)" },
    { label: "จุดแข็งที่ช่วยได้", body: data.strength, Icon: Lightbulb, tone: "var(--prem-gold)" },
    { label: "วิธีลองปรับ", body: data.adjust, Icon: Target, tone: "var(--prem-cyan)" },
  ] as const;
  return (
    <div className="space-y-3.5">
      {rows.map((r) => (
        <div key={r.label} className="flex gap-3">
          <r.Icon className="mt-1 h-4 w-4 shrink-0" style={{ color: r.tone }} strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: r.tone }}>
              {r.label}
            </p>
            <p className="mt-0.5 text-[15px] leading-[1.7] text-[var(--prem-text)]/90">
              {r.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
