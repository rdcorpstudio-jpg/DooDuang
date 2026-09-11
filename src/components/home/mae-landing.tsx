"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

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

const TOPICS = [
  {
    id: "life",
    label: "ภาพรวมชีวิต",
    hint: "มองภาพกว้าง ก่อนเลือกทาง",
    icon: "✧",
    panelTitle: "มองชีวิตเป็นภาพกว้าง\nแล้วค่อยเลือกก้าวถัดไป",
    panelBody:
      "ชวนมองพื้นดวงตามศาสตร์ที่ใช้ ร่วมกับคำถามและบริบทชีวิตของคุณ เพื่อแยกให้ออกว่าเรื่องไหนควรเตรียมตัว เรื่องไหนควรทบทวน และเรื่องไหนลงมือได้เลย",
    bullets: [
      "จุดเด่นและลักษณะนิสัยตามคำพยากรณ์",
      "ประเด็นชีวิตที่อยากให้ความสำคัญในช่วงนี้",
      "คำถามชวนคิดและแนวทางนำไปปรับใช้",
    ],
    question: "ถ้าเริ่มเปลี่ยนได้หนึ่งเรื่อง\nวันนี้ฉันอยากเริ่มตรงไหน?",
  },
  {
    id: "work",
    label: "งานและการเงิน",
    hint: "ทบทวนความพร้อมและโอกาส",
    icon: "◈",
    panelTitle: "ให้ความตั้งใจมีทิศทาง\nให้การตัดสินใจมีข้อมูล",
    panelBody:
      "ใช้คำพยากรณ์เป็นมุมมองประกอบการสำรวจจุดแข็ง ความคาดหวัง และข้อกังวลเรื่องงาน แล้วกลับมาประเมินโอกาส รายรับรายจ่าย และความเสี่ยงจากข้อมูลจริง",
    bullets: [
      "จุดแข็งด้านการทำงานตามมุมมองของศาสตร์",
      "เรื่องที่ควรทบทวนก่อนเปลี่ยนงานหรือเริ่มสิ่งใหม่",
      "คำถามเพื่อวางแผนเงินและเตรียมความพร้อม",
    ],
    question: "โอกาสที่อยากคว้า\nฉันเตรียมตัวพร้อมแค่ไหนแล้ว?",
  },
  {
    id: "fortune",
    label: "โชคลาภและจังหวะ",
    hint: "เปิดรับโอกาสอย่างมีสติ",
    icon: "✦",
    panelTitle: "เปิดใจให้โอกาส\nพร้อมดูแลสิ่งที่มีอยู่",
    panelBody:
      "สำรวจเรื่องจังหวะและโอกาสในมุมของความเชื่อ พร้อมชวนคิดถึงสิ่งที่เตรียมได้ด้วยตัวเอง การอ่านดวงไม่สามารถรับรองลาภลอย เลขรางวัล หรือผลกำไรได้",
    bullets: [
      "แนวโน้มเรื่องโอกาสตามคำพยากรณ์",
      "สิ่งที่ควรเตรียมเพื่อเปิดรับโอกาสจริง",
      "ข้อควรระวังในการตัดสินใจจากความคาดหวัง",
    ],
    question: "หากโอกาสมาถึง\nฉันพร้อมรับโดยไม่เสี่ยงเกินตัวไหม?",
  },
  {
    id: "family",
    label: "ความรักและครอบครัว",
    hint: "เข้าใจตัวเองและคนที่ห่วงใย",
    icon: "♡",
    panelTitle: "เข้าใจใจเรา\nเพื่อดูแลความสัมพันธ์",
    panelBody:
      "ชวนทบทวนความต้องการ วิธีสื่อสาร และสิ่งที่กังวลในความสัมพันธ์ ใช้คำพยากรณ์เป็นเพียงมุมมองหนึ่ง โดยฟังความรู้สึกและข้อเท็จจริงจากคนที่เกี่ยวข้องด้วย",
    bullets: [
      "มุมมองเรื่องนิสัยและความสัมพันธ์ตามศาสตร์",
      "ประเด็นที่อาจนำไปพูดคุยอย่างอ่อนโยน",
      "แนวทางดูแลใจตนเองและขอบเขตความสัมพันธ์",
    ],
    question: "มีเรื่องไหนที่เราจะลอง\nฟังกันให้มากขึ้นได้บ้าง?",
  },
] as const;

const REFLECTIONS = [
  {
    n: "01",
    title: "พยายามมาก แต่เรื่องงานยังไม่เดินหน้า",
    body: "ชวนมองจุดแข็ง สิ่งที่กำลังฝืน และทางเลือกที่ยังไม่ได้ลอง ควบคู่กับโอกาสจริงที่มีอยู่ตรงหน้า",
  },
  {
    n: "02",
    title: "เรื่องเงินและโอกาส ยังไม่ลงตัว",
    body: "ทบทวนสิ่งที่คาดหวัง สิ่งที่ควรระวัง และความพร้อมของตัวเอง ก่อนตัดสินใจด้วยความหวังหรือความกังวล",
  },
  {
    n: "03",
    title: "ห่วงคนในบ้าน จนลืมฟังใจตัวเอง",
    body: "ให้พื้นที่กับความรู้สึก มองความสัมพันธ์อย่างอ่อนโยน และหาเรื่องเล็ก ๆ ที่เริ่มพูดคุยกันได้",
  },
  {
    n: "04",
    title: "กำลังจะเริ่มใหม่ แต่ยังไม่มั่นใจ",
    body: "ใช้มุมมองจากการอ่านดวงเป็นคำถามประกอบการวางแผน แล้วตรวจสอบข้อมูลและความพร้อมก่อนก้าวต่อ",
  },
] as const;

const PROMISES = [
  {
    n: "๑",
    title: "เข้าใจง่าย มีสิ่งให้คิดต่อ",
    body: "เล่าคำพยากรณ์ด้วยภาษาที่เข้าใจได้ พร้อมคำถามและแนวทางทบทวนชีวิตที่นำกลับไปใช้ได้",
  },
  {
    n: "๒",
    title: "ให้กำลังใจ ไม่ตัดสินชีวิต",
    body: "มองคำทำนายเป็นมุมมองหนึ่ง ไม่ตีตราว่าใครดวงเสีย และไม่ใช้ความกลัวเร่งให้ตัดสินใจ",
  },
  {
    n: "๓",
    title: "เคารพการเลือกของคุณ",
    body: "ไม่รับรองว่าจะเปลี่ยนชะตาหรือร่ำรวยทันที ทุกทางเลือกควรพิจารณาร่วมกับความเป็นจริง",
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

/** Main home `/` — 9:16 sacred navy/gold Mae landing */
export function MaeLanding() {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("life");
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
      {/* HERO — full-bleed 9:16 plate */}
      <section className="relative flex h-full min-h-full flex-col overflow-hidden px-5 pb-6 pt-3">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 50%" }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/bg/mae-bg-poster.jpg?v=new1"
          >
            <source src="/videos/mae-bg.mp4?v=new1" type="video/mp4" />
          </video>
          {/* Soft edge only — keep plate bright, text readable at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg, rgba(16,24,39,0.12) 0%, transparent 20%, transparent 52%, rgba(16,24,39,0.5) 78%, rgba(16,24,39,0.72) 100%)
              `,
            }}
          />
        </div>

        {/* Brand mark — slightly below hands, mid frame */}
        <div
          className="pointer-events-none absolute left-1/2 z-10 w-[min(68%,13.5rem)] -translate-x-1/2 -translate-y-1/2 sm:w-[14.5rem]"
          style={{ top: "45%" }}
        >
          <Reveal visible={mounted} delay={60} variant="glow">
            <Image
              src="/images/brand/mae-wordmark-sm.png?v=clear1"
              alt="แม่มั่งมี พามู"
              width={400}
              height={200}
              priority
              unoptimized
              className="mae-logo-breathe h-auto w-full object-contain"
            />
          </Reveal>
        </div>

        {/* Spacer — keeps headline/copy mid-lower, tight under wordmark */}
        <div className="relative z-0 min-h-[52%] w-full shrink-0" aria-hidden />

        <div
          className={cn(
            "mae-hero-copy mae-hero-stagger relative z-10 mb-6 flex w-full flex-col items-center pt-1 text-center sm:mb-8",
            mounted && "is-visible"
          )}
        >
          <h1 className="mt-0 flex flex-col items-center gap-0 overflow-visible font-sans text-white">
            <span className="text-[1.55rem] font-bold leading-[1.3] tracking-[0.03em] sm:text-[1.65rem]">
              เข้าใจจังหวะชีวิต
            </span>
            <span className="mae-hero-gold-line text-[1.55rem] font-bold leading-[1.3] tracking-[0.03em] sm:text-[1.65rem]">
              ก้าวต่ออย่างอุ่นใจ
            </span>
          </h1>

          <p className="mx-auto mt-2.5 max-w-[18.5rem] text-[12.5px] leading-[1.6] tracking-[0.01em] text-white/85">
            บางช่วง… เราตั้งใจเต็มที่
            <br />
            แต่หลายอย่างกลับไม่เป็นอย่างหวัง
            <br />
            ลองให้การอ่านดวง เป็นอีกมุมในการทบทวนตัวเอง
          </p>

          <Link
            href="/reading"
            className="mae-gold-cta group relative mx-auto mt-5 flex h-11 w-full max-w-[240px] items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="text-[14px] font-bold tracking-wide">
              เลือกเรื่องที่อยากรู้
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </Link>

          <a
            href="#belief"
            className="mae-concept-link mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/85 transition hover:text-white"
          >
            <span className="underline decoration-white/50 underline-offset-[5px]">
              อ่านแนวคิดแม่มั่งมี
            </span>
            <span className="mae-concept-arrow" aria-hidden>
              ↓
            </span>
          </a>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] leading-snug text-[#c5cdd9]/85">
            <span style={{ color: C.gold }} aria-hidden>
              ✦
            </span>
            อ่านดวงอย่างมีสติ · ทุกการตัดสินใจยังเป็นของคุณ
          </p>
        </div>
      </section>

      {/* BELIEF — cultural history (restored) + 30/70 */}
      <MaeSection
        id="belief"
        className="mae-belief-plate relative overflow-hidden px-5 pb-11 pt-11"
        style={{ color: C.ink }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(1.2px 1.2px at 18% 20%, rgba(213,177,111,0.7), transparent),
              radial-gradient(1px 1px at 72% 14%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.4px 1.4px at 88% 42%, rgba(213,177,111,0.55), transparent),
              radial-gradient(1px 1px at 30% 70%, rgba(120,150,190,0.45), transparent)
            `,
          }}
        />

        <div className="relative">
          <p
            className="mb-3 flex items-center gap-2.5 text-[12px] font-medium"
            style={{ color: C.goldDark }}
          >
            <span className="font-sacred text-[13px]">01</span>
            <span className="h-3 w-px bg-[#c9b187]" aria-hidden />
            ความเชื่อที่ส่งต่อกันมา
          </p>

          <h2
            className="font-sacred text-[1.55rem] leading-[1.35] tracking-tight"
            style={{ color: "#192438" }}
          >
            จากตำราที่ส่งต่อ
            <br />
            สู่คำถามของชีวิตวันนี้
          </h2>

          <p
            className="mt-4 font-sacred text-[14px] leading-relaxed"
            style={{ color: "#9b7a43" }}
          >
            ศาสตร์แห่งความเชื่อ
            <br />
            <span style={{ color: "#192438" }}>ศิลป์แห่งการเข้าใจชีวิต</span>
          </p>

          <div
            className="mt-4 space-y-3.5 text-[13px] leading-[1.85]"
            style={{ color: "#596374" }}
          >
            <p>
              เรื่องดวงชะตาอยู่ในวัฒนธรรมไทยมายาวนาน
              เป็นศาสตร์การพยากรณ์ตามความเชื่อที่ผู้คนใช้มองความเป็นไปของชีวิต
            </p>
            <p>
              หลักฐานหนึ่งคือตำราพรหมชาติในรูปแบบสมุดไทย
              ซึ่งบันทึกเรื่องนักษัตรและคำพยากรณ์ไว้ British Library
              เก็บรักษาต้นฉบับที่ระบุปี ค.ศ. 1885 หรือ พ.ศ. 2428
              สะท้อนว่าความเชื่อเรื่องดวงมีร่องรอยให้ศึกษาย้อนกลับไปได้หลายชั่วอายุคน
            </p>
            <p>
              สำหรับแม่มั่งมี คุณค่าที่อยากส่งต่อคือการชวนให้คุณหยุดฟังตัวเอง
              มองเรื่องเดิมจากอีกมุม และเตรียมพร้อมกับสิ่งที่กำลังจะเลือก
              โดยให้ความเชื่อเดินไปพร้อมกับเหตุผลและการลงมือทำ
            </p>
          </div>

          <a
            href="https://www.bl.uk/manuscripts/FullDisplay.aspx?ref=Or_3593"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium underline underline-offset-[5px] transition hover:opacity-80"
            style={{ color: "#9b7a43", textDecorationColor: "rgba(155,122,67,0.55)" }}
          >
            อ่านที่มาทางวัฒนธรรมจาก British Library
            <span aria-hidden>↗</span>
          </a>

          <p
            className="mt-4 text-[11px] leading-relaxed"
            style={{ color: "#8a94a3" }}
          >
            หลักฐานทางประวัติศาสตร์แสดงถึงการมีอยู่ของความเชื่อ
            ไม่ใช่หลักฐานรับรองความแม่นยำของคำพยากรณ์
          </p>
        </div>

        <div
          className="relative mt-10 rounded-[4px] px-1 py-10 text-center"
          style={{ background: "#f7f6f2" }}
        >
          <p
            className="text-[12px] font-medium tracking-wide"
            style={{ color: "#9a8055" }}
          >
            แนวคิดที่แม่มั่งมีอยากชวนคุณเก็บไว้
          </p>
          <h3
            className="mt-3 font-sacred text-[1.55rem] leading-[1.35] tracking-tight"
            style={{ color: "#1a2433" }}
          >
            เชื่อในจังหวะฟ้า
            <br />
            และเชื่อในมือตัวเอง
          </h3>

          <div className="mt-9 grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-1">
            <div className="text-center">
              <p
                className="font-sacred text-[3.6rem] leading-none tracking-tight"
                style={{ color: "#9a8055" }}
              >
                30
              </p>
              <p
                className="mt-2.5 font-sacred text-[1.05rem]"
                style={{ color: "#1a2433" }}
              >
                ลิขิตฟ้า
              </p>
              <p
                className="mt-1.5 text-[11px] leading-relaxed"
                style={{ color: "#666666" }}
              >
                ยอมรับสิ่งที่ควบคุมไม่ได้
                <br />
                เปิดใจมองจังหวะและความเปลี่ยนแปลง
              </p>
            </div>

            <span
              className="pt-4 text-[1.35rem] font-light"
              style={{ color: "#a8a8a8" }}
              aria-hidden
            >
              +
            </span>

            <div className="text-center">
              <p
                className="font-sacred text-[3.6rem] leading-none tracking-tight"
                style={{ color: "#1a2433" }}
              >
                70
              </p>
              <p
                className="mt-2.5 font-sacred text-[1.05rem]"
                style={{ color: "#1a2433" }}
              >
                มานะตน
              </p>
              <p
                className="mt-1.5 text-[11px] leading-relaxed"
                style={{ color: "#666666" }}
              >
                เตรียมพร้อม เลือกอย่างมีสติ
                <br />
                และลงมือสร้างทางของตัวเอง
              </p>
            </div>
          </div>

          <div
            className="mx-auto mt-9 h-px w-[88%]"
            style={{ background: "#e0ddd6" }}
            aria-hidden
          />

          <p
            className="mt-6 text-[13px] leading-relaxed"
            style={{ color: "#4a5564" }}
          >
            การอ่านดวงอาจช่วยตั้งคำถามให้ชัดขึ้น
            <br />
            <span className="font-medium" style={{ color: "#1a2433" }}>
              ส่วนคำตอบของชีวิต ยังต้องค่อย ๆ สร้างด้วยการกระทำ
            </span>
          </p>
          <p
            className="mt-4 text-[11px] leading-relaxed"
            style={{ color: "#8a8a8a" }}
          >
            “30 ลิขิตฟ้า 70 มานะตน” เป็นคติเปรียบเปรยเรื่องความเชื่อและความเพียร
            <br />
            ไม่ใช่สัดส่วนทางวิทยาศาสตร์หรือสูตรคำนวณความสำเร็จ
          </p>
        </div>
      </MaeSection>

      {/* REFLECTIONS */}
      <MaeSection className="px-5 py-11" style={{ background: C.paper, color: C.ink }}>
        <p
          className="mb-3 flex items-center gap-2.5 text-[12px] font-medium"
          style={{ color: C.goldDark }}
        >
          <span className="font-sacred text-[13px]">02</span>
          <span className="h-3 w-px bg-[#c9b187]" aria-hidden />
          ในวันที่ใจมีคำถาม
        </p>
        <h2 className="font-sacred text-[1.45rem] leading-snug">
          รู้สึกเหมือนโชค
          <br />
          ยังไม่เข้าข้าง?
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: C.muted }}>
          บางที สิ่งแรกที่เราต้องการ
          <br />
          อาจเป็นเวลาทบทวนอย่างใจเย็น
          <br />
          ว่าอะไรติดขัด และอะไรพอเริ่มแก้ได้
        </p>
        <p className="mt-4 text-[13px] leading-relaxed" style={{ color: C.ink }}>
          เรื่องที่ไม่เป็นใจ ไม่ได้แปลว่า
          <br />
          <span className="font-medium">คุณจะไม่มีทางไปต่อ</span>
        </p>
        <div className="mt-6">
          {REFLECTIONS.map((item, i) => (
            <article
              key={item.n}
              className={cn("flex gap-3 py-4", i > 0 && "border-t")}
              style={{ borderColor: C.line }}
            >
              <span
                className="shrink-0 pt-0.5 font-sacred text-[14px]"
                style={{ color: "#95733b" }}
              >
                {item.n}
              </span>
              <div>
                <h3 className="text-[14px] font-medium leading-snug">{item.title}</h3>
                <p
                  className="mt-1.5 text-[12px] leading-relaxed"
                  style={{ color: C.muted }}
                >
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </MaeSection>

      {/* TOPICS */}
      <MaeSection id="reading" className="px-5 py-11" style={{ background: C.navy }}>
        <p
          className="mb-3 flex items-center gap-2.5 text-[12px] font-medium"
          style={{ color: C.gold }}
        >
          <span className="font-sacred text-[13px]">03</span>
          <span className="h-3 w-px bg-[#b9a077]/50" aria-hidden />
          เริ่มจากเรื่องที่อยู่ในใจ
        </p>
        <h2 className="font-sacred text-[1.45rem] leading-snug text-white">
          วันนี้ อยากเข้าใจเรื่องไหน?
        </h2>
        <p className="mt-2 text-[13px] text-[#b7c0cf]">
          เลือกหัวข้อ เพื่อดูว่าการอ่านดวงจะชวนคุณทบทวนอะไรบ้าง
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {TOPICS.map((t) => {
            const on = t.id === topic;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                className="mae-topic-chip rounded-[12px] px-3 py-3.5 text-left"
                style={
                  on
                    ? { background: C.gold, color: C.navy }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "#e8e2d4",
                        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.22)",
                      }
                }
              >
                <span className="block text-[13px] font-semibold leading-snug">
                  {t.label}
                </span>
                <span
                  className="mt-0.5 block text-[11px] leading-snug"
                  style={{ color: on ? "rgba(16,24,39,0.7)" : "#8a94a3" }}
                >
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={topic}
          className="mae-topic-panel mt-4 rounded-[16px] px-4 py-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.2)",
          }}
        >
          <p className="text-[12px] font-medium" style={{ color: C.gold }}>
            แนวทางการอ่านดวง · {active.label}
          </p>
          <p className="mt-2 whitespace-pre-line font-sacred text-[1.15rem] leading-snug text-[#f7f3ea]">
            {active.panelTitle}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#a8b0bf]">
            {active.panelBody}
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-[#c5cdd9]">
            {active.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span style={{ color: C.gold }} aria-hidden>
                  ·
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div
            className="mt-4 rounded-[12px] px-3.5 py-3"
            style={{ background: "rgba(213,177,111,0.1)" }}
          >
            <p className="text-[11px] font-medium" style={{ color: C.gold }}>
              คำถามที่น่าลองถามตัวเอง
            </p>
            <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-[#e8e2d4]">
              “{active.question}”
            </p>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[#8a94a3]">
            ตัวอย่างขอบเขตเนื้อหา ไม่ใช่คำพยากรณ์เฉพาะบุคคล
          </p>
          <Link
            href="/reading"
            className="mae-gold-cta group relative mx-auto mt-4 flex h-11 w-full max-w-[260px] items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98]"
          >
            <span className="text-[14px] font-semibold tracking-wide">
              ไปเริ่มดูดวง
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
        </div>
      </MaeSection>

      {/* PROMISE */}
      <MaeSection className="px-5 py-11" style={{ background: C.paper, color: C.ink }}>
        <p className="mb-2 text-[12px] font-medium" style={{ color: C.goldDark }}>
          ความอุ่นใจเริ่มจากความชัดเจน
        </p>
        <h2 className="font-sacred text-[1.4rem] leading-snug">
          อ่านดวงกับแนวคิดของแม่มั่งมี
        </h2>
        <div className="mt-6">
          {PROMISES.map((p, i) => (
            <article
              key={p.n}
              className={cn(
                "grid grid-cols-[2rem_1fr] gap-x-3 py-5",
                i > 0 && "border-t"
              )}
              style={{ borderColor: C.line }}
            >
              <span
                className="font-sacred text-[1.5rem] leading-none"
                style={{ color: "#a48247" }}
              >
                {p.n}
              </span>
              <div>
                <h3 className="text-[14px] font-medium">{p.title}</h3>
                <p
                  className="mt-1.5 text-[12px] leading-relaxed"
                  style={{ color: C.muted }}
                >
                  {p.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </MaeSection>

      {/* FAQ */}
      <MaeSection
        id="faq"
        className="border-t px-5 py-11"
        style={{ background: C.soft, borderColor: "#e7e3dc", color: C.ink }}
      >
        <p className="mb-2 text-[12px] font-medium" style={{ color: C.goldDark }}>
          รู้ให้ชัด ก่อนเริ่มอ่านดวง
        </p>
        <h2 className="font-sacred text-[1.4rem] leading-snug">
          คำถามที่หลายคนอยากรู้
        </h2>
        <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
          ความเชื่อเป็นเรื่องส่วนบุคคล คุณเลือกได้ว่าจะนำมุมมองใดไปใช้
        </p>
        <div className="mt-5">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              className={cn("group", i > 0 && "border-t")}
              style={{ borderColor: C.line }}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 text-[13px] font-medium leading-snug marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  className="shrink-0 text-[16px] transition duration-300 group-open:rotate-45"
                  style={{ color: C.goldDark }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="mae-faq-body">
                <div>
                  <p
                    className="pb-4 text-[12px] leading-relaxed"
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
      <MaeSection className="px-5 py-12 text-center" style={{ background: C.navy }}>
        <span className="text-[1.6rem]" style={{ color: C.gold }} aria-hidden>
          ✦
        </span>
        <p
          className="mt-2 text-[12px] font-medium tracking-wide"
          style={{ color: C.gold }}
        >
          แม่มั่งมี · อ่านดวงอุ่นใจ
        </p>
        <h2 className="mt-3 font-sacred text-[1.4rem] leading-snug text-white">
          เราอาจเลือกทุกจังหวะของชีวิตไม่ได้
          <br />
          <span style={{ color: C.gold }}>แต่เลือกก้าวต่อไปได้เสมอ</span>
        </h2>
        <p className="mt-3 text-[13px] text-[#bec7d5]">
          เริ่มจากเรื่องที่อยู่ในใจ แล้วค่อย ๆ มองทางข้างหน้าไปด้วยกัน
        </p>
        <Link
          href="/reading"
          className="mae-gold-cta group relative mx-auto mt-7 flex h-12 w-full max-w-[280px] items-center justify-center gap-2 overflow-hidden rounded-full px-6 outline-none transition active:scale-[0.98]"
        >
          <span className="text-[14px] font-semibold tracking-wide">
            เลือกเรื่องที่อยากรู้
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </Link>
        <p className="mt-6 text-[11px] leading-relaxed text-[#8a94a3]">
          ความเชื่ออย่างมีสติ · ความเพียรอย่างมีทิศทาง
        </p>
        <p className="mt-3 text-[11px] leading-relaxed text-[#8a94a3]">
          โหราศาสตร์เป็นความเชื่อส่วนบุคคล คำพยากรณ์ไม่รับรองเหตุการณ์ในอนาคต
          <br />
          หน้าแนะนำบริการนี้ยังไม่รับข้อมูลเกิดหรือชำระเงิน
          <br />© 2026 Mae Mangmee
        </p>
      </MaeSection>
    </div>
  );
}
