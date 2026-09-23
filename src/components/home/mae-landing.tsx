"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  Settings2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { ReviewCard } from "@/components/home/review-card";
import { MAE_HOME_REVIEWS, MAE_REVIEWS } from "@/lib/reviews";

/** Colors from https://mae-mangmee.tawin-ton.chatgpt.site/ — fixed */
const C = {
  navy: "#101827",
  navySoft: "#17243a",
  gold: "#d5b16f",
  goldDark: "#806031",
  ink: "#192438",
  muted: "#596374",
  soft: "#f6f5f2",
  paper: "#ffffff",
  line: "#e1e3e7",
} as const;

const TOPICS: {
  id: string;
  short: string;
  label: string;
  iconSrc: string;
  panelTitle: string;
  bullets: string[];
  question: string;
}[] = [
  {
    id: "life",
    short: "ชีวิต",
    label: "ภาพรวมชีวิต",
    iconSrc: "/images/home/topics/life.webp",
    panelTitle: "มองภาพกว้าง\nก่อนเลือกก้าวถัดไป",
    bullets: [
      "เห็นเรื่องที่ควรทบทวนในช่วงนี้",
      "แยกสิ่งที่ควรเตรียมตัวออกจากสิ่งที่ลงมือได้เลย",
    ],
    question: "ถ้าเริ่มเปลี่ยนได้หนึ่งเรื่อง วันนี้ฉันอยากเริ่มตรงไหน?",
  },
  {
    id: "work",
    short: "งาน-เงิน",
    label: "งานและการเงิน",
    iconSrc: "/images/home/topics/work-money.webp",
    panelTitle: "ให้ความตั้งใจมีทิศทาง\nให้การตัดสินใจมีข้อมูล",
    bullets: [
      "มองจุดแข็งและโอกาสงานในช่วงนี้",
      "ทบทวนความพร้อมก่อนตัดสินใจเรื่องเงิน",
    ],
    question: "โอกาสที่อยากคว้า ฉันเตรียมตัวพร้อมแค่ไหนแล้ว?",
  },
  {
    id: "fortune",
    short: "จังหวะ",
    label: "โชคลาภและจังหวะ",
    iconSrc: "/images/home/topics/timing.webp",
    panelTitle: "เปิดใจให้โอกาส\nพร้อมดูแลสิ่งที่มีอยู่",
    bullets: [
      "มองจังหวะที่ควรเปิดรับ",
      "เตรียมตัวรับโอกาสโดยไม่เสี่ยงเกินตัว",
    ],
    question: "หากโอกาสมาถึง ฉันพร้อมรับโดยไม่เสี่ยงเกินตัวไหม?",
  },
  {
    id: "family",
    short: "ความรัก",
    label: "ความรักและครอบครัว",
    iconSrc: "/images/home/topics/love.webp",
    panelTitle: "เข้าใจใจเรา\nเพื่อดูแลความสัมพันธ์",
    bullets: [
      "ทบทวนสิ่งที่อยากสื่อสารกับคนสำคัญ",
      "ดูแลใจตัวเองควบคู่กับความสัมพันธ์",
    ],
    question: "มีเรื่องไหนที่เราจะลองฟังกันให้มากขึ้นได้บ้าง?",
  },
];

const REFLECTIONS = [
  {
    n: "01",
    title: "พยายามมาก แต่เรื่องงานยังไม่เดินหน้า",
    points: ["มองจุดแข็งที่ยังไม่ได้ใช้", "เลือกโอกาสที่ทำได้จริง"],
  },
  {
    n: "02",
    title: "เรื่องเงินและโอกาส ยังไม่ลงตัว",
    points: ["ทบทวนสิ่งที่คาดหวังกับความพร้อม", "ระวังตัดสินใจด้วยความกังวล"],
  },
  {
    n: "03",
    title: "ห่วงคนในบ้าน จนลืมฟังใจตัวเอง",
    points: ["ให้พื้นที่กับความรู้สึกของตัวเอง", "หาเรื่องเล็ก ๆ ที่เริ่มคุยกันได้"],
  },
  {
    n: "04",
    title: "กำลังจะเริ่มใหม่ แต่ยังไม่มั่นใจ",
    points: ["ใช้ดวงเป็นมุมมองประกอบการวางแผน", "เช็กความพร้อมก่อนก้าวต่อ"],
  },
] as const;

const PROMISES = [
  {
    n: "1",
    label: "UNDERSTAND · NOT FEAR",
    title: "อ่านเพื่อเข้าใจ ไม่ใช่เพื่อกลัว",
    body: "ดวงไม่ควรทำให้คุณหยุดเดิน แต่ควรช่วยให้เห็นทางเลือกที่ชัดขึ้น",
  },
  {
    n: "2",
    label: "ENCOURAGE · NOT JUDGE",
    title: "ให้กำลังใจ ไม่ตัดสินชีวิต",
    body: "มองคำทำนายเป็นมุมมองหนึ่ง ไม่ตีตราว่าใครดวงเสีย และไม่ใช้ความกลัวเร่งให้ตัดสินใจ",
  },
  {
    n: "3",
    label: "RESPECT · YOUR CHOICE",
    title: "เคารพการเลือกของคุณ",
    body: "ทุกทางเลือกควรพิจารณาร่วมกับความเป็นจริง ส่วนคนเลือกทางยังเป็นคุณ",
  },
] as const;

const FAQS = [
  {
    q: "ดูดวงแล้ว ชีวิตจะดีขึ้นทันทีไหม?",
    a: "การอ่านดวงไม่สามารถรับรองได้ว่าชีวิตจะดีขึ้นทันที แต่อาจเป็นพื้นที่ให้ทบทวนและมองทางเลือก การคลี่คลายปัญหายังขึ้นอยู่กับสาเหตุจริง การตัดสินใจ การลงมือทำ และปัจจัยแวดล้อมของแต่ละคน",
  },
  {
    q: "“30 ลิขิตฟ้า 70 มานะตน” หมายถึงอะไร?",
    a: "เราใช้เป็นคติเปรียบเปรยว่า ชีวิตมีทั้งสิ่งที่ควบคุมไม่ได้และสิ่งที่เราลงมือได้ ตัวเลขนี้ไม่ใช่ผลวิจัยหรือสัดส่วนที่พิสูจน์แล้ว แต่ชวนให้เห็นความสำคัญของความเพียรและการเตรียมพร้อม",
  },
  {
    q: "ไม่รู้เวลาเกิด ยังอ่านดวงได้หรือไม่?",
    a: "ขึ้นอยู่กับศาสตร์และวิธีพยากรณ์ที่เลือก บางวิธีใช้เพียงวันเดือนปีเกิด ขณะที่การผูกดวงบางแบบต้องใช้เวลาและสถานที่เกิด หากไม่ทราบ ควรแจ้งตามจริง เพื่อให้ผู้ให้บริการอธิบายข้อจำกัดก่อนเริ่ม",
  },
  {
    q: "ถ้าอ่านดวงแล้วเจอช่วงที่ไม่ดี ควรทำอย่างไร?",
    a: "ไม่จำเป็นต้องตื่นตระหนกหรือรีบซื้อพิธีแก้ดวง ให้มองเป็นคำถามสำหรับเตรียมตัว ตรวจสอบว่ามีปัญหาจริงอะไรที่ต้องดูแล และเริ่มจากสิ่งที่ทำได้ เช่น วางแผน พูดคุย หรือขอคำปรึกษาที่ตรงกับเรื่องนั้น",
  },
  {
    q: "ใช้ดวงตัดสินใจเรื่องสำคัญได้แค่ไหน?",
    a: "ใช้เป็นมุมมองประกอบได้ตามความเชื่อ แต่เรื่องสุขภาพ การลงทุน กฎหมาย และความปลอดภัย ควรอาศัยข้อเท็จจริงและผู้เชี่ยวชาญที่เกี่ยวข้องเป็นหลัก คำพยากรณ์ไม่สามารถแทนคำแนะนำเฉพาะด้านได้",
  },
] as const;

function Reveal({
  visible,
  delay,
  children,
  className,
  style,
  variant = "up",
}: {
  visible: boolean;
  delay: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "up" | "scale" | "glow";
}) {
  return (
    <div
      className={cn(
        "mae-reveal",
        variant === "scale" && "mae-reveal--scale",
        variant === "glow" && "mae-reveal--glow",
        visible && "is-visible",
        className
      )}
      style={{ ["--mae-delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function MaeSection({
  id,
  className,
  style,
  children,
  delay = 0,
}: {
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.12 });

  return (
    <section
      ref={ref}
      id={id}
      className={cn("mae-section-reveal", inView && "is-visible", className)}
      style={{ ["--mae-delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </section>
  );
}

/** Shared 01–05 section eyebrow — always left, same size, same · separator */
function MaeSectionLabel({
  n,
  children,
}: {
  n: string;
  children: ReactNode;
}) {
  return (
    <p className="mb-2.5 flex w-full items-center justify-start gap-2 text-left text-[15px] font-medium tracking-wide text-[#d5b16f]">
      <span className="font-sacred text-[15px] leading-none">{n}</span>
      <span
        className="inline-block font-sans text-[15px] leading-none opacity-55"
        aria-hidden
      >
        {"\u00B7"}
      </span>
      <span className="leading-none">{children}</span>
    </p>
  );
}

function MaeSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="w-full text-left font-sacred text-[1.65rem] leading-[1.32] tracking-tight">
      {children}
    </h2>
  );
}

/** Main home `/` — 9:16 sacred navy/gold Mae landing */
export function MaeLanding() {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("life");
  const [openReflection, setOpenReflection] = useState<string>("01");
  const active = TOPICS.find((t) => t.id === topic) ?? TOPICS[0];

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="mae-landing h-full max-w-full overflow-x-hidden overflow-y-auto overscroll-y-contain text-white"
      style={{ background: C.navy }}
    >
      {/* HERO — same composition + type scale on phone and desktop mockup */}
      <section className="mae-hero-plate relative flex h-full min-h-full flex-col overflow-hidden px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 40%" }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/bg/mae-bg-poster.webp?v=new1"
          >
            <source src="/videos/mae-bg.mp4?v=new1" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, rgba(16,24,39,0.1) 0%, transparent 18%, transparent 48%, rgba(16,24,39,0.45) 72%, rgba(16,24,39,0.78) 100%)
              `,
            }}
          />
        </div>

        <div className="mae-hero-spacer relative z-0 w-full shrink-0" aria-hidden />

        <div
          className={cn(
            "mae-hero-copy mae-hero-stagger relative z-10 mt-auto flex w-full flex-col items-center text-center",
            mounted && "is-visible"
          )}
        >
          <h1 className="mx-auto mt-0 flex w-full flex-col items-center overflow-visible font-sacred text-white">
            <span className="text-center text-[2.05rem] font-normal leading-[1.42] tracking-[0.02em] text-white">
              เข้าใจจังหวะชีวิต
            </span>
            <span className="mae-hero-gold-line mt-1.5 text-center text-[2.15rem] font-normal leading-[1.45] tracking-[0.02em]">
              ก้าวต่ออย่างอุ่นใจ
            </span>
          </h1>

          <p className="mae-hero-lede mx-auto mt-1.5 w-full max-w-[19rem] text-center text-[12.5px] leading-[1.7] tracking-[0.015em] text-[#d8dee8]/88">
            บางช่วง… เราตั้งใจเต็มที่
            <br />
            แต่หลายอย่างกลับไม่เป็นอย่างหวัง
            <br />
            <span className="text-[#e8d19a]/88">
              ลองให้การอ่านดวง เป็นอีกมุมในการทบทวน
              <span className="whitespace-nowrap">ตัวเอง</span>
            </span>
          </p>

          <Link
            href="/welcome/preview"
            className="wallpaper-dl-btn mae-cta-nudge group relative mx-auto mt-3.5 flex h-[3.4rem] w-full max-w-[280px] items-center gap-2.5 overflow-hidden rounded-[16px] px-2.5 text-left outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="wallpaper-dl-btn__icon relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]">
              <Sparkles className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </span>
            <span className="relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-visible">
              <span className="block text-[14.5px] font-bold leading-[1.3] tracking-wide">
                เลือกเรื่องที่อยากรู้
              </span>
              <span className="block text-[11.5px] font-medium leading-[1.3] opacity-70">
                เริ่มอ่านดวงกับแม่มั่งมี
              </span>
            </span>
            <ChevronRight
              className="relative z-[1] mr-0.5 h-5 w-5 shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
            <span
              className="wallpaper-dl-btn__shine pointer-events-none absolute inset-0"
              aria-hidden
            />
          </Link>

          {/* Award — group centered under CTA */}
          <div className="mae-hero-award mx-auto mt-2.5 flex w-fit max-w-[min(100%,20.5rem)] items-center justify-center gap-1.5 text-left">
            <span className="mae-award-glow relative flex h-[3.85rem] w-[3.85rem] shrink-0 items-center justify-center">
              <Image
                src="/images/brand/diamond-trophy-transparent.webp"
                alt="รางวัลเพชรสยาม"
                width={72}
                height={72}
                unoptimized
                className="mae-award-trophy relative z-[1] h-[3.7rem] w-[3.7rem] object-contain"
              />
            </span>
            <div className="min-w-0 py-0.5 text-left">
              <p className="text-[9.5px] font-semibold tracking-[0.18em] text-[#d5b16f]/90">
                เกียรติยศ
              </p>
              <p className="mae-gold-text mt-0.5 font-sacred text-[1.14rem] leading-snug tracking-tight">
                รางวัลเพชรสยาม 2026
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug tracking-[0.01em] text-[#c5cdd9]/88">
                สาขา ธุรกิจบริการออนไลน์ยอดเยี่ยม
              </p>
            </div>
          </div>
        </div>

        <a
          href="#belief"
          className="mae-concept-link group mt-4 inline-flex flex-col items-center gap-1 outline-none transition active:opacity-80"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <span
              className="text-[10px] leading-none transition group-hover:opacity-100"
              style={{ color: C.gold }}
              aria-hidden
            >
              ✦
            </span>
            <span className="mae-gold-text text-[14px] font-medium tracking-[0.04em] sm:text-[15.5px]">
              อ่านแนวคิดแม่มั่งมี
            </span>
          </span>
          <span
            className="mae-concept-arrow flex h-4 w-4 items-center justify-center rounded-full"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
              background: "rgba(16,24,39,0.35)",
            }}
            aria-hidden
          >
            <ArrowDown
              className="h-2.5 w-2.5"
              style={{ color: C.gold }}
              strokeWidth={2.6}
            />
          </span>
        </a>
      </section>

      {/* BELIEF */}
      <MaeSection
        id="belief"
        className="mae-belief-plate relative overflow-hidden px-5 pt-7 pb-8"
      >
        <div className="mae-belief-frame relative mx-auto w-full max-w-[22.5rem]">
          <header className="w-full text-left">
            <MaeSectionLabel n="01">บทความแนะนำ</MaeSectionLabel>
            <MaeSectionTitle>
              <span className="mae-hero-gold-line">ศาสตร์แห่งความเชื่อ</span>
              <br />
              <span className="mae-hero-gold-line">ศิลป์แห่งการเข้าใจชีวิต</span>
            </MaeSectionTitle>
          </header>

          {/* Body — left, shared rhythm */}
          <div className="mt-8 space-y-6">
            <section>
              <h3 className="flex items-center gap-2.5 text-[15.5px] font-semibold leading-snug text-[#e8d19a]">
                <span className="h-[1.05em] w-[3px] shrink-0 rounded-full bg-[#d5b16f]" aria-hidden />
                เรื่องราวของความเชื่อ
              </h3>
              <p className="mt-2.5 text-[15.5px] leading-[1.8] text-[#c5cdd9]">
                เรื่องดวงชะตาอยู่ในวัฒนธรรมไทยมายาวนาน เป็นศาสตร์การพยากรณ์ตามความเชื่อ
                ที่ผู้คนใช้มองความเป็นไปของชีวิต
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2.5 text-[15.5px] font-semibold leading-snug text-[#e8d19a]">
                <span className="h-[1.05em] w-[3px] shrink-0 rounded-full bg-[#d5b16f]" aria-hidden />
                สิ่งที่แม่มั่งมีอยากส่งต่อ
              </h3>
              <p className="mt-2.5 text-[15.5px] leading-[1.8] text-[#c5cdd9]">
                สำหรับแม่มั่งมี คุณค่าที่อยากส่งต่อคือการชวนให้คุณหยุดฟังตัวเอง
                มองเรื่องเดิมจากอีกมุม และเตรียมพร้อมกับสิ่งที่กำลังจะเลือก
                โดยให้ความเชื่อเดินไปพร้อมกับเหตุผลและการลงมือทำ
              </p>
            </section>
          </div>

          {/* Closing + 30/70 — centered, cards unchanged */}
          <div className="mt-9 text-center">
            <p className="text-[14.5px] font-medium tracking-[0.06em] text-[#d5b16f]">
              แนวคิดที่อยากชวนคุณเก็บไว้
            </p>
            <h3 className="mt-2.5 font-sacred text-[1.55rem] leading-[1.35] tracking-tight">
              <span className="mae-hero-gold-line">เชื่อในจังหวะฟ้า</span>
              <br />
              <span className="mae-hero-gold-line">และเชื่อในมือตัวเอง</span>
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-2.5 text-left">
              <div className="mae-belief-cell mae-belief-cell--accent px-3 py-4 text-center">
                <p className="font-sacred text-[2.35rem] leading-none text-[#d5b16f]">
                  30
                </p>
                <p className="mt-2 font-sacred text-[1.05rem] text-white">ลิขิตฟ้า</p>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-[#b7c0cf]">
                  ยอมรับสิ่งที่ควบคุมไม่ได้
                </p>
              </div>
              <div className="mae-belief-cell px-3 py-4 text-center">
                <p className="font-sacred text-[2.35rem] leading-none text-white">70</p>
                <p className="mt-2 font-sacred text-[1.05rem] text-white">มานะตน</p>
                <p className="mt-2 text-[13.5px] leading-[1.65] text-[#b7c0cf]">
                  เลือกอย่างมีสติแล้วลงมือ
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaeSection>

      {/* REFLECTIONS */}
      <MaeSection
        className="relative overflow-hidden px-5 pt-11 pb-8"
        style={{ background: C.navy }}
      >
        <div className="relative mx-auto max-w-[22.5rem]">
          <MaeSectionLabel n="02">ในวันที่ใจมีคำถาม</MaeSectionLabel>
          <MaeSectionTitle>
            <span className="mae-hero-gold-line">รู้สึกเหมือนโชคยังไม่เข้าข้าง?</span>
          </MaeSectionTitle>

          <p
            className="mt-5 rounded-[16px] px-4 py-3.5 text-[15.5px] leading-[1.8] text-[#c5cdd9]"
            style={{
              background: "rgba(8,14,26,0.45)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
            }}
          >
            บางทีสิ่งที่ต้องการ อาจเป็นเวลาทบทวน ว่าอะไรติดขัด และอะไรเริ่มแก้ได้
          </p>

          <p className="mt-4 flex items-start gap-2 text-[15.5px] leading-[1.75] text-[#e8d19a]">
            <span
              className="mt-1 h-4 w-[3px] shrink-0 rounded-full bg-[#d5b16f]"
              aria-hidden
            />
            เรื่องที่ไม่เป็นใจ ไม่ได้แปลว่า คุณจะไม่มีทางไปต่อ
          </p>

          <h3 className="mt-7 font-sacred text-[1.2rem] leading-snug text-white">
            ตอนนี้เรื่องไหนตรงกับคุณที่สุด?
          </h3>

          <div className="mt-3">
            {REFLECTIONS.map((item) => (
              <details
                key={item.n}
                className="group border-b"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
                open={openReflection === item.n}
                onToggle={(e) => {
                  const el = e.currentTarget;
                  if (el.open) setOpenReflection(item.n);
                  else if (openReflection === item.n) setOpenReflection("");
                }}
              >
                <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sacred text-[13px]"
                    style={{
                      color: "#e8d19a",
                      boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
                      background: "rgba(213,177,111,0.08)",
                    }}
                  >
                    {item.n}
                  </span>
                  <span className="min-w-0 flex-1 pt-1 text-[15.5px] font-semibold leading-snug text-[#f0ece3]">
                    {item.title}
                  </span>
                  <ChevronDown
                    className="mt-1.5 h-4 w-4 shrink-0 text-[#9aa3b2] transition duration-200 group-open:rotate-180"
                    strokeWidth={2.2}
                  />
                </summary>
                <ul className="space-y-2.5 pb-3.5 pl-11 text-[14.5px] leading-[1.7] text-[#b7c0cf]">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "#6ea8e8" }}
                        aria-hidden
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </MaeSection>

      {/* TOPICS */}
      <MaeSection id="reading" className="px-5 pt-10 pb-10" style={{ background: C.navy }}>
        <div className="mx-auto max-w-[22.5rem]">
          <MaeSectionLabel n="03">เรื่องที่ตรงกับใจ</MaeSectionLabel>
          <MaeSectionTitle>
            <span className="mae-hero-gold-line">วันนี้ อยากเข้าใจเรื่องไหน?</span>
          </MaeSectionTitle>
          <p className="mt-2.5 text-[15.5px] leading-[1.75] text-[#b7c0cf]">
            เลือกหนึ่งเรื่อง แล้วแม่มั่งมีจะช่วยชวนคุณมองให้ชัดขึ้น
          </p>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {TOPICS.map((t) => {
              const on = t.id === topic;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className="flex flex-col items-center gap-1.5 rounded-[14px] px-1 py-3 transition active:scale-[0.97]"
                  style={
                    on
                      ? {
                          background: "rgba(213,177,111,0.12)",
                          boxShadow:
                            "inset 0 0 0 1.5px rgba(213,177,111,0.75), 0 0 18px rgba(213,177,111,0.18)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                        }
                  }
                >
                  <span
                    className="relative flex h-9 w-9 items-center justify-center transition-opacity"
                    style={{ opacity: on ? 1 : 0.62 }}
                  >
                    <Image
                      src={t.iconSrc}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="object-contain"
                    />
                  </span>
                  <span
                    className="text-[11.5px] font-medium leading-none"
                    style={{ color: on ? "#f0ece3" : "#9aa3b2" }}
                  >
                    {t.short}
                  </span>
                  {on ? (
                    <span
                      className="mt-0.5 h-[2px] w-5 rounded-full bg-[#d5b16f]"
                      aria-hidden
                    />
                  ) : (
                    <span className="mt-0.5 h-[2px] w-5" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <div key={topic} className="mae-topic-panel mt-6">
            <p className="text-[13px] font-medium tracking-wide text-[#d5b16f]">
              {active.label}
            </p>
            <p className="mt-2 whitespace-pre-line font-sacred text-[1.35rem] leading-[1.35] text-white">
              {active.panelTitle}
            </p>
            <ul className="mt-3.5 space-y-2.5 text-[15px] leading-[1.75] text-[#c5cdd9]">
              {active.bullets.map((b) => (
                <li key={b} className="flex gap-2.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d5b16f]"
                    aria-hidden
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div
              className="mt-4 flex gap-3 rounded-[14px] px-3.5 py-3.5"
              style={{
                background: "rgba(8,14,26,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
              }}
            >
              <MessageCircle
                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#9bb4d4]"
                strokeWidth={1.8}
              />
              <div className="min-w-0">
                <p className="text-[12px] font-medium tracking-wide text-[#9bb4d4]">
                  คำถามชวนคิด
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-[#f0ece3]">
                  “{active.question}”
                </p>
              </div>
            </div>

            <Link
              href="/welcome/preview"
              className="mae-gold-cta group relative mx-auto mt-5 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98]"
            >
              <span className="text-[15px] font-semibold tracking-wide">
                เริ่มดูดวง
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
          </div>
        </div>
      </MaeSection>

      {/* PROMISE — diamond timeline */}
      <MaeSection className="relative overflow-hidden px-5 pt-11 pb-8" style={{ background: C.navy }}>
        <div className="relative mx-auto w-full max-w-[22.5rem] text-left">
          <MaeSectionLabel n="04">แนวคิดของแม่มั่งมี</MaeSectionLabel>
          <MaeSectionTitle>
            <span className="mae-hero-gold-line">อ่านดวง เพื่อมองชีวิตให้ชัดขึ้น</span>
          </MaeSectionTitle>
          <p className="mt-2.5 max-w-[20rem] text-left text-[15.5px] leading-[1.75] text-[#b7c0cf]">
            คำทำนายที่ดีควรช่วยให้เข้าใจตัวเอง ไม่ใช่ทำให้กลัว
          </p>
        </div>

        <div className="mae-promise-rail relative mx-auto mt-7 max-w-[22.5rem]">
          {PROMISES.map((p) => (
            <article key={p.n} className="mae-promise-step relative flex gap-4 pb-6 last:pb-0">
              <div className="relative z-[1] flex w-10 shrink-0 justify-center pt-1">
                <span className="mae-promise-diamond" aria-hidden>
                  <span className="mae-promise-diamond-num font-sacred">{p.n}</span>
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-sacred text-[11.5px] font-medium tracking-[0.14em] text-[#d5b16f]">
                  {p.label}
                </p>
                <h3 className="mt-1.5 text-[16.5px] font-semibold leading-snug text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.75] text-[#a8b0bd]">
                  {p.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-[22.5rem] text-center font-sacred text-[1.4rem] leading-[1.45]">
          <span className="mae-hero-gold-line">“ดวงเป็นเข็มทิศ</span>
          <br />
          <span className="mae-hero-gold-line">ส่วนคนเลือกทางยังเป็นคุณ”</span>
        </p>
      </MaeSection>

      {/* REVIEWS */}
      <MaeSection
        id="reviews"
        className="px-5 pt-10 pb-12"
        style={{ background: C.navy }}
      >
        <div className="mx-auto max-w-[22.5rem]">
          <MaeSectionLabel n="05">รีวิวจากผู้ใช้งาน</MaeSectionLabel>
          <MaeSectionTitle>
            <span className="mae-hero-gold-line">คนที่เคยอ่าน เล่าไว้แบบนี้</span>
          </MaeSectionTitle>

          <div className="mt-5 flex items-center gap-3.5">
            <div className="shrink-0">
              <p className="font-sacred text-[2.05rem] leading-none text-[#e8d19a]">
                5.0
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className="inline-flex gap-px text-[13px] leading-none text-[#d5b16f]"
                  aria-hidden
                >
                  ★★★★★
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[#9aa3b2]">
                จาก 70K+ รีวิว
              </p>
            </div>

            <span
              className="h-11 w-px shrink-0 self-center"
              style={{ background: "rgba(255,255,255,0.12)" }}
              aria-hidden
            />

            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {(
                [
                  { label: "อ่านง่าย", Icon: BookOpen },
                  { label: "คำแนะนำชัด", Icon: Lightbulb },
                  { label: "ใช้งานสะดวก", Icon: Settings2 },
                ] as const
              ).map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium text-[#c5cdd9]"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(155,180,210,0.28)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Icon className="h-3 w-3 text-[#9bb4d4]" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {MAE_HOME_REVIEWS.map((r) => (
              <ReviewCard key={r.id} review={r} variant="card" />
            ))}
          </div>

          <Link
            href="/reviews"
            className="mae-review-card mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-medium text-[#e8d19a] transition active:scale-[0.98]"
          >
            ดูทั้งหมด {MAE_REVIEWS.length} รีวิว+
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </Link>
        </div>
      </MaeSection>

      {/* FAQ */}
      <MaeSection
        id="faq"
        className="border-t px-5 pt-12 pb-12"
        style={{ background: C.soft, borderColor: "#e7e3dc", color: C.ink }}
      >
        <div className="mx-auto max-w-[22.5rem]">
          <p
            className="mb-2.5 text-[13px] font-medium tracking-wide"
            style={{ color: C.goldDark }}
          >
            รู้ให้ชัด ก่อนเริ่มอ่านดวง
          </p>
          <h2 className="font-sacred text-[1.65rem] leading-[1.32] tracking-tight">
            คำถามที่หลายคนอยากรู้
          </h2>
          <p className="mt-2.5 text-[15.5px] leading-[1.8]" style={{ color: C.muted }}>
            ความเชื่อเป็นเรื่องส่วนบุคคล คุณเลือกได้ว่าจะนำมุมมองใดไปใช้
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-[22.5rem]">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              className={cn("group", i > 0 && "border-t")}
              style={{ borderColor: C.line }}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 text-[16px] font-semibold leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  className="shrink-0 text-[18px] transition duration-300 group-open:rotate-45"
                  style={{ color: C.goldDark }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="mae-faq-body">
                <div>
                  <p
                    className="pb-4 text-[15.5px] leading-[1.8]"
                    style={{ color: C.muted }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </MaeSection>

      {/* CLOSING */}
      <MaeSection className="px-5 pt-12 pb-12 text-center" style={{ background: C.navy }}>
        <div className="mx-auto max-w-[22.5rem]">
          <span className="text-[1.45rem]" style={{ color: C.gold }} aria-hidden>
            ✦
          </span>
          <p
            className="mt-2.5 text-[13px] font-medium tracking-wide"
            style={{ color: C.gold }}
          >
            แม่มั่งมี · อ่านดวงอุ่นใจ
          </p>
          <h2 className="mx-auto mt-3 max-w-[20rem] font-sacred text-[1.55rem] leading-[1.35] text-white">
            เราอาจเลือกทุกจังหวะของชีวิตไม่ได้
            <br />
            <span style={{ color: C.gold }}>แต่เลือกก้าวต่อไปได้เสมอ</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[20rem] text-[15.5px] leading-[1.8] text-[#bec7d5]">
            เริ่มจากเรื่องที่อยู่ในใจ แล้วค่อย ๆ มองทางข้างหน้าไปด้วยกัน
          </p>
          <Link
            href="/welcome/preview"
            className="mae-gold-cta group relative mx-auto mt-6 flex h-12 w-full max-w-[280px] items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98]"
          >
            <span className="text-[14px] font-semibold tracking-wide">
              เลือกเรื่องที่อยากรู้
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
          <p className="mt-7 text-[14px] leading-[1.7] text-[#8a94a3]">
            ความเชื่ออย่างมีสติ · ความเพียรอย่างมีทิศทาง
          </p>
          <Link
            href="/reviews"
            className="mt-3 inline-block text-[14.5px] font-medium"
            style={{ color: C.gold }}
          >
            อ่านรีวิวจากผู้ใช้
          </Link>
          <p className="mt-3 text-[11px] leading-[1.7] text-[#8a94a3]">
            © 2026 Mae Mangmee
          </p>
        </div>
      </MaeSection>
    </div>
  );
}
