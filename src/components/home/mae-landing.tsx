"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { id: "life", label: "ภาพรวมชีวิต", hint: "มองภาพกว้าง ก่อนเลือกทาง" },
  { id: "work", label: "งานและการเงิน", hint: "ทบทวนความพร้อมและโอกาส" },
  { id: "fortune", label: "โชคลาภและจังหวะ", hint: "เปิดรับโอกาสอย่างมีสติ" },
  { id: "family", label: "ความรักและครอบครัว", hint: "เข้าใจตัวเองและคนที่ห่วงใย" },
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
    body: "ให้พื้นที่กับความรู้สึก มองความสัมพันธ์อย่างอ่อนโยน และหาเรื่องเล็ก ๆ ที่เริ่มพูดง่ายขึ้นได้",
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
    body: "ไม่รับรองว่าจะเปลี่ยนชะตาหรือร่ำรวยทันที ทุกทางเลือกควรพิจารณาควบคู่กับความเป็นจริง",
  },
] as const;

const FAQS = [
  {
    q: "ดูดวงแล้ว ชีวิตจะดีขึ้นทันทีไหม?",
    a: "การอ่านดวงไม่สามารถรับรองได้ว่าชีวิตจะดีขึ้นทันที แต่อาจเป็นพื้นที่ให้ทบทวนและมองทางเลือก การคลี่คลายปัญหายังขึ้นอยู่กับสาเหตุจริง การตัดสินใจ การลงมือทำ และปัจจัยแวดล้อมของแต่ละคน",
  },
  {
    q: "“30 ลิขิตฟ้า 70 มานะตน” หมายถึงอะไร?",
    a: "เราใช้เป็นคติเปรียบเปรยว่า ชีวิตมีทั้งสิ่งที่ควบคุมไม่ได้ และสิ่งที่เราลงมือได้ ตัวเลขนี้ไม่ใช่ผลวิจัย แต่ชวนให้เห็นความสำคัญของความเพียรและการเตรียมพร้อม",
  },
  {
    q: "ไม่รู้เวลาเกิด ยังอ่านดวงได้หรือไม่?",
    a: "ขึ้นอยู่กับศาสตร์และวิธีพยากรณ์ที่เลือก บางวิธีใช้เพียงวันเดือนปีเกิด หากไม่ทราบ ควรแจ้งตามจริง เพื่อให้ทราบข้อจำกัดก่อนเริ่ม",
  },
  {
    q: "ถ้าอ่านดวงแล้วเจอช่วงที่ไม่ดี ควรทำอย่างไร?",
    a: "ไม่จำเป็นต้องตื่นตระหนก ให้มองเป็นคำถามสำหรับเตรียมตัว ตรวจสอบว่ามีปัญหาจริงอะไรที่ต้องดูแล และเริ่มจากสิ่งที่ทำได้",
  },
] as const;

function Reveal({
  visible,
  delay,
  children,
  className,
}: {
  visible: boolean;
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "translate-y-3 opacity-0 transition-[opacity,transform] duration-700 ease-out",
        visible && "translate-y-0 opacity-100",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Alternate home `/mae` — 9:16 sacred navy/gold, content from reference site */
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

        <Reveal
          visible={mounted}
          delay={0}
          className="absolute left-3 top-2.5 z-10 sm:left-3.5 sm:top-3"
        >
          <Image
            src="/images/brand/mae-wordmark-sm.png?v=gold2"
            alt="แม่มั่งมี พามู"
            width={400}
            height={200}
            priority
            unoptimized
            className="h-auto w-[5rem] object-contain object-left-top sm:w-[5.35rem]"
          />
        </Reveal>

        <Reveal
          visible={mounted}
          delay={80}
          className="mae-hero-copy relative z-10 mt-auto mb-[10%] text-center pb-1"
        >
          <p
            className="mb-3 flex items-center justify-center gap-2 text-[13px] font-medium"
            style={{ color: C.gold }}
          >
            <span aria-hidden>✦</span>
            ความเชื่อที่เป็นเคียงคู่ความเพียร
          </p>
          <h1 className="font-sacred text-[2.35rem] font-normal leading-[1.25] tracking-tight text-white sm:text-[2.55rem]">
            เข้าใจจังหวะชีวิต
            <br />
            <span style={{ color: C.gold }}>ก้าวต่ออย่างอุ่นใจ</span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-[21rem] text-[14px] leading-relaxed text-[#c5cdd9]">
            บางช่วง… เราตั้งใจเต็มที่
            <br />
            แต่หลายอย่างกลับไม่เป็นอย่างหวัง
          </p>

          <Link
            href="/reading"
            className="mae-gold-cta group relative mx-auto mt-5 flex w-full max-w-[280px] items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45"
          >
            <span className="text-[15px] font-semibold tracking-wide">
              เลือกเรื่องที่อยากรู้
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </Link>
          <a
            href="#belief"
            className="mae-concept-link mt-3.5 inline-flex items-center gap-1.5 text-[13px] text-white/90 transition hover:text-white"
          >
            <span className="underline decoration-white/55 underline-offset-[5px]">
              แนวคิดของแม่มั่งมี
            </span>
            <span className="mae-concept-arrow" aria-hidden>
              ↓
            </span>
          </a>
          <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#b2bdcd]">
            <span style={{ color: C.gold }} aria-hidden>
              ✦
            </span>
            อ่านดวงอย่างมีสติ · ทุกการตัดสินใจยังเป็นของคุณ
          </p>
        </Reveal>

        <Reveal visible={mounted} delay={240} className="relative z-10 pt-4">
          <div
            className="flex items-center justify-between gap-3 border-t pt-3 text-[11px]"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <span className="tracking-wide" style={{ color: "#b9a077" }}>
              อ่านดวง · อ่านใจ · อ่านทาง
            </span>
            <a href="#belief" style={{ color: C.gold }}>
              เลื่อนเพื่ออ่านต่อ ↓
            </a>
          </div>
        </Reveal>
      </section>

      {/* BELIEF — cultural history (restored) + 30/70 */}
      <section
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

        <div className="mae-liquid-glass-light relative mt-8 rounded-[20px] px-4 pb-5 pt-6">
          <h3
            className="text-center font-sacred text-[1.28rem] leading-snug"
            style={{ color: "#0c2a57" }}
          >
            เชื่อในจังหวะฟ้า
            <br />
            และเชื่อในมือตัวเอง
          </h3>
          <div
            className="mx-auto mt-3.5 h-px w-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(155,122,67,0.65), transparent)",
            }}
            aria-hidden
          />

          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-1.5">
            <div className="text-center">
              <span
                className="mx-auto mb-2 block text-[15px]"
                style={{ color: "#b8975a" }}
                aria-hidden
              >
                ✦
              </span>
              <p
                className="font-sacred text-[3rem] leading-none tracking-tight"
                style={{ color: "#b8975a" }}
              >
                30
              </p>
              <p
                className="mt-2 font-sacred text-[1rem]"
                style={{ color: "#9b7a43" }}
              >
                ลิขิตฟ้า
              </p>
              <p
                className="mt-1 text-[11px] leading-relaxed"
                style={{ color: "#596374" }}
              >
                ยอมรับสิ่งที่
                <br />
                ควบคุมไม่ได้
              </p>
            </div>

            <span
              className="pt-9 font-sacred text-[1.4rem]"
              style={{ color: "#b5a389" }}
              aria-hidden
            >
              +
            </span>

            <div className="text-center">
              <span
                className="mx-auto mb-2 block text-[14px]"
                style={{ color: "#9b7a43" }}
                aria-hidden
              >
                ✿
              </span>
              <p
                className="font-sacred text-[3rem] leading-none tracking-tight"
                style={{ color: "#0c2a57" }}
              >
                70
              </p>
              <p
                className="mt-2 font-sacred text-[1rem]"
                style={{ color: "#0c2a57" }}
              >
                มานะตน
              </p>
              <p
                className="mt-1 text-[11px] leading-relaxed"
                style={{ color: "#596374" }}
              >
                เตรียมพร้อม
                <br />
                เลือกอย่างมีสติ
              </p>
            </div>
          </div>

          <div className="mae-liquid-glass-chip mt-6 rounded-[14px] px-3.5 py-3.5 text-center">
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "#0c2a57" }}
            >
              การอ่านดวงอาจช่วยตั้งคำถามให้ชัดขึ้น
            </p>
            <p
              className="mt-0.5 text-[12px] font-medium leading-relaxed"
              style={{ color: "#9b7a43" }}
            >
              ส่วนคำตอบของชีวิต สร้างด้วยการกระทำ
            </p>
          </div>
        </div>

        <p
          className="relative mt-5 text-center text-[11px] leading-relaxed"
          style={{ color: "#8a94a3" }}
        >
          30 / 70 เป็นแนวคิดเปรียบเปรย ไม่ใช่สัดส่วนทางวิทยาศาสตร์
        </p>
      </section>

      {/* REFLECTIONS */}
      <section className="px-5 py-11" style={{ background: C.paper, color: C.ink }}>
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
          บางที สิ่งแรกที่เราต้องการ อาจเป็นเวลาทบทวนอย่างใจเย็น
          ว่าอะไรติดขัด และอะไรพอเริ่มแก้ได้
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
      </section>

      {/* TOPICS */}
      <section id="reading" className="px-5 py-11" style={{ background: C.navy }}>
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
                className="rounded-[12px] px-3 py-3.5 text-left transition"
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
          className="mt-4 rounded-[16px] px-4 py-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.2)",
          }}
        >
          <p className="text-[12px] font-medium" style={{ color: C.gold }}>
            แนวทางการอ่านดวง · {active.label}
          </p>
          <p className="mt-2 font-sacred text-[1.15rem] leading-snug text-[#f7f3ea]">
            {active.hint}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#a8b0bf]">
            ชวนแยกให้ออกว่าเรื่องไหนควรเตรียมตัว เรื่องไหนทบทวน
            และเรื่องไหนลงมือได้เลย
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
      </section>

      {/* PROMISE */}
      <section className="px-5 py-11" style={{ background: C.paper, color: C.ink }}>
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
      </section>

      {/* FAQ */}
      <section
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
                  className="shrink-0 text-[16px] transition group-open:rotate-45"
                  style={{ color: C.goldDark }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p
                className="pb-4 text-[12px] leading-relaxed"
                style={{ color: C.muted }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="px-5 py-12 text-center" style={{ background: C.navy }}>
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
          โหราศาสตร์เป็นความเชื่อส่วนบุคคล คำพยากรณ์ไม่รับรองเหตุการณ์ในอนาคต
          <br />© 2026 Mae Mangmee
        </p>
      </section>
    </div>
  );
}
