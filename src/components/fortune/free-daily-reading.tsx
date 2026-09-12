"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronLeft,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Sun,
  TriangleAlert,
  Users,
  User,
} from "lucide-react";
import { FortuneIcon } from "@/components/fortune/fortune-icon";
import { APP_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Sample free-daily copy - design preview only (wire real pack later). */
const SAMPLE = {
  birthDay: "เกิดวันศุกร์",
  element: "ธาตุน้ำ",
  rhythm: {
    label: "จังหวะวันนี้",
    headline: "ค่อย ๆ เดินหน้า อย่างมั่นใจ",
    body: "จัดการเรื่องค้างให้จบ แล้วค่อยเริ่มสิ่งใหม่",
    tip: "โฟกัส: ทำเรื่องสำคัญทีละอย่าง",
  },
  work: {
    title: "การงาน",
    body: "งานที่ค้างอยู่เริ่มเห็นทางออก ลองจัดลำดับความสำคัญ และตรวจรายละเอียดก่อนส่ง",
    tip: "คำแนะนำ: เช็กเวลาก่อนรับงานใหม่",
  },
  money: {
    title: "การเงิน",
    body: "แยกสิ่งจำเป็นกับสิ่งที่อยากได้ ก่อนตัดสินใจซื้อ และเผื่องบสำหรับเรื่องสำคัญ",
    tip: "ระวังรายจ่ายเล็ก ๆ ที่สะสม",
  },
  shirts: [
    {
      topic: "งาน",
      name: "น้ำเงิน",
      src: "/images/shirts/royal-blue.webp",
    },
    {
      topic: "เงิน",
      name: "ครีม",
      src: "/images/shirts/white.webp",
    },
    {
      topic: "รัก",
      name: "เขียวอ่อน",
      src: "/images/shirts/green.webp",
    },
  ],
  numbers: [2, 6, 9],
  tarot: {
    name: "THE STAR",
    src: "/images/tarot/17_XVII_THE_STAR.webp",
    summary: "ความหวังและการเริ่มต้นใหม่",
    line: "วันนี้ลองให้โอกาสตัวเองอีกครั้ง",
    quote:
      "ไม่จำเป็นต้องเห็นทั้งเส้นทาง แค่เริ่มจากสิ่งเล็ก ๆ ที่ทำได้ ก็เป็นก้าวที่มีความหมาย.",
  },
  maeQuote: "ไม่ต้องรีบเท่าใคร แค่ก้าวในจังหวะของเรา.",
  love: {
    subtitle: "ความสัมพันธ์วันนี้เป็นอย่างไร",
    single:
      "เปิดพื้นที่ให้บทสนทนาใหม่ ๆ ค่อย ๆ รู้จักกัน โดยไม่ต้องรีบหาคำตอบ.",
    couple:
      "เลือกเวลาที่พร้อมคุย ฟังกันให้จบ แล้วค่อยบอกสิ่งที่ตัวเองรู้สึก.",
  },
  talk: {
    subtitle:
      "เตรียมประเด็นสำคัญก่อนเริ่มคุย หากยังไม่เข้าใจตรงกัน ลองถามให้ชัด.",
    tip: "พูดให้ชัด ด้วยความอ่อนโยน.",
  },
  care: {
    subtitle:
      "เว้นช่วงจากหน้าจอและความวุ่นวาย ให้ตัวเองได้พักโดยไม่ต้องรู้สึกผิด.",
    dos: [
      "เลือกเรื่องสำคัญหนึ่งอย่างให้เสร็จ",
      "กันเวลาเล็ก ๆ ไว้ให้ตัวเอง",
    ],
    donts: [
      "อย่ารับปากเกินกำลัง",
      "ให้เวลาตัวเองคิดก่อนตอบ",
    ],
  },
} as const;

function formatThaiLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function GoldSpark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute text-[9px] leading-none text-[#d5b16f]",
        className
      )}
      style={{ textShadow: "0 0 6px rgba(213,177,111,0.55)" }}
    >
      {"\u2726"}
    </span>
  );
}

function StarCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mae-aspect-card relative px-3.5 py-3.5", className)}>
      <GoldSpark className="left-2.5 top-2" />
      <GoldSpark className="right-2.5 top-2" />
      <GoldSpark className="bottom-2 left-2.5" />
      <GoldSpark className="bottom-2 right-2.5" />
      {children}
    </section>
  );
}

function TipBar({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-3 flex items-center gap-2 rounded-[12px] px-3 py-2.5"
      style={{
        background: "rgba(8,12,22,0.72)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
      }}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#d5b16f]">
        {icon}
      </span>
      <p className="min-w-0 text-left text-[12px] font-medium leading-snug text-[#e8d19a]">
        {children}
      </p>
    </div>
  );
}

function AspectRow({
  image,
  imageAlt,
  fallbackIcon,
  title,
  body,
  tip,
  tipIcon,
  eyebrow,
}: {
  image?: string;
  imageAlt: string;
  fallbackIcon?: React.ReactNode;
  title: string;
  body: string;
  tip: string;
  tipIcon: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <StarCard>
      <div className="flex items-start gap-3">
        <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-[10%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(213,177,111,0.35) 0%, transparent 70%)",
            }}
          />
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              width={72}
              height={72}
              className="relative z-[1] h-[68px] w-[68px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          ) : (
            <span className="relative z-[1] text-[#d5b16f]">{fallbackIcon}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5 text-left">
          {eyebrow ? (
            <p className="text-[12px] font-semibold tracking-wide text-[#d5b16f]">
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={cn(
              "font-semibold leading-snug text-[#f7f4ec]",
              eyebrow ? "mt-1 text-[16px]" : "text-[16px]"
            )}
          >
            {title}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#c5cdd9]/85">
            {body}
          </p>
        </div>
      </div>
      <TipBar icon={tipIcon}>{tip}</TipBar>
    </StarCard>
  );
}

function SectionOrnament() {
  return (
    <div className="flex items-center gap-2 px-2 py-1" aria-hidden>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(213,177,111,0.55))",
        }}
      />
      <span className="inline-flex items-center gap-1 text-[#d5b16f]">
        <span className="text-[11px]">{"\u263D"}</span>
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="text-[11px]">{"\u263E"}</span>
      </span>
      <span
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg, rgba(213,177,111,0.55), transparent)",
        }}
      />
    </div>
  );
}

function SectionHead({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-2.5 text-left">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-[#d5b16f]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-sacred text-[1.05rem] font-semibold tracking-wide text-[#d5b16f]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#c5cdd9]/75">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Free daily fortune - design preview matching Mae navy/gold refs.
 * Isolated page; not wired into main reading flow yet.
 */
export function FreeDailyReading({
  className,
  backHref = "/preview/result",
}: {
  className?: string;
  backHref?: string;
}) {
  const dateLabel = formatThaiLongDate();

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[480px] px-3 pb-14 pt-2",
        className
      )}
    >
      <header className="relative flex items-center justify-between px-1 py-2">
        <Link
          href={backHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#d5b16f] outline-none transition active:scale-95"
          aria-label="กลับ"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2">
          <span
            className="hidden h-px w-6 sm:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(213,177,111,0.7))",
            }}
          />
          <p className="truncate text-center text-[13px] font-semibold tracking-wide text-[#e8d19a]">
            {APP_NAME}
          </p>
          <span
            className="hidden h-px w-6 sm:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(213,177,111,0.7), transparent)",
            }}
          />
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#d5b16f] outline-none transition active:scale-95"
          aria-label="บันทึก"
        >
          <Bookmark className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </header>

      <div className="relative mt-1 px-1 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-6 h-28 w-28 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(213,177,111,0.35), transparent 68%)",
          }}
        />
        <h1 className="text-[1.55rem] font-bold tracking-wide text-[#f7f4ec]">
          ดวงของคุณวันนี้
        </h1>
        <p className="mt-1 text-[13px] text-[#c5cdd9]/80">{dateLabel}</p>

        <div className="mt-3 flex items-center justify-center gap-2.5">
          <span
            className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
            style={{
              boxShadow: "inset 0 0 0 1.5px rgba(213,177,111,0.65)",
              background: "rgba(16,24,39,0.9)",
            }}
          >
            <Image
              src="/images/elements/water.webp"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </span>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-[#f7f4ec]">
              {SAMPLE.birthDay}{" "}
              <span className="font-medium text-[#d5b16f]">
                {SAMPLE.element}
              </span>
            </p>
            <p className="text-[11px] text-[#9aa3b2]">ตัวอย่างคำทำนาย</p>
          </div>
        </div>
      </div>

      {/* PAGE 1 - aspects */}
      <div className="mt-5 space-y-3">
        <AspectRow
          eyebrow={SAMPLE.rhythm.label}
          title={SAMPLE.rhythm.headline}
          body={SAMPLE.rhythm.body}
          tip={SAMPLE.rhythm.tip}
          imageAlt=""
          fallbackIcon={<Sun className="h-10 w-10" strokeWidth={1.4} />}
          tipIcon={<FortuneIcon name="compass" size={16} plain />}
        />
        <AspectRow
          title={SAMPLE.work.title}
          body={SAMPLE.work.body}
          tip={SAMPLE.work.tip}
          image="/images/daily/work.webp"
          imageAlt="การงาน"
          tipIcon={<FortuneIcon name="article" size={16} plain />}
        />
        <AspectRow
          title={SAMPLE.money.title}
          body={SAMPLE.money.body}
          tip={SAMPLE.money.tip}
          image="/images/daily/money.webp"
          imageAlt="การเงิน"
          tipIcon={<FortuneIcon name="finance" size={16} plain />}
        />
        <AspectRow
          title="ความรัก"
          body={SAMPLE.love.subtitle}
          tip="เปิดใจฟังก่อนสรุป - ดูรายละเอียดด้านล่าง"
          image="/images/daily/love.webp"
          imageAlt="ความรัก"
          tipIcon={<Heart className="h-3.5 w-3.5" strokeWidth={2} />}
        />
      </div>

      <div className="my-5">
        <SectionOrnament />
      </div>

      {/* PAGE 2 - lucky / tarot / quote */}
      <div className="space-y-3.5">
        <StarCard>
          <SectionHead
            icon={<FortuneIcon name="shirt" size={22} plain />}
            title="สีเสื้อมงคลวันนี้"
            subtitle="เสริมพลังในทุกเรื่องของวัน"
          />
          <div className="grid grid-cols-3 gap-2.5">
            {SAMPLE.shirts.map((s) => (
              <div key={s.topic} className="text-center">
                <div
                  className="relative mx-auto aspect-square w-full overflow-hidden rounded-[14px]"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
                  }}
                >
                  <Image
                    src={s.src}
                    alt={s.name}
                    fill
                    className="object-cover"
                    sizes="110px"
                  />
                </div>
                <p className="mt-1.5 text-[12px] font-semibold text-[#f7f4ec]">
                  {s.topic}
                </p>
                <p className="text-[11px] text-[#d5b16f]">{s.name}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-[#9aa3b2]">
            เลือกสีตามความตั้งใจของวันนี้
          </p>
        </StarCard>

        <StarCard className="text-center">
          <SectionHead
            icon={<FortuneIcon name="compass" size={22} plain />}
            title="เลขประจำวัน"
            subtitle="ตัวเลขที่ส่งพลังดีกับคุณในวันนี้"
          />
          <div className="relative py-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mx-auto max-w-[14rem] rounded-full opacity-30"
              style={{
                background:
                  "radial-gradient(circle, rgba(213,177,111,0.28), transparent 70%)",
              }}
            />
            <p className="relative font-sacred text-[2.1rem] font-bold tracking-[0.12em] text-[#d5b16f]">
              {SAMPLE.numbers.join(" \u00B7 ")}
            </p>
          </div>
          <p className="text-[11px] text-[#9aa3b2]">
            ใช้เป็นสัญลักษณ์เตือนใจในวันนี้
          </p>
        </StarCard>

        <StarCard>
          <SectionHead
            icon={<FortuneIcon name="sparkle" size={20} plain />}
            title="ไพ่ประจำวัน"
            subtitle="พลังงานจากไพ่ที่ช่วยนำทางวันนี้"
          />
          <div className="flex items-start gap-3">
            <div
              className="relative h-[148px] w-[96px] shrink-0 overflow-hidden rounded-[12px]"
              style={{
                boxShadow:
                  "inset 0 0 0 1.5px rgba(213,177,111,0.7), 0 10px 24px rgba(0,0,0,0.35)",
              }}
            >
              <Image
                src={SAMPLE.tarot.src}
                alt={SAMPLE.tarot.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <p className="font-sacred text-[1.15rem] font-bold tracking-wide text-[#d5b16f]">
                {SAMPLE.tarot.name}
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-[#f7f4ec]">
                {SAMPLE.tarot.summary}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#c5cdd9]/85">
                {SAMPLE.tarot.line}
              </p>
              <div className="my-2.5 flex items-center gap-2" aria-hidden>
                <span
                  className="h-px flex-1"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(213,177,111,0.55), transparent)",
                  }}
                />
                <span className="text-[8px] text-[#d5b16f]">{"\u25C6"}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-[#9aa3b2]">
                {SAMPLE.tarot.quote}
              </p>
            </div>
          </div>
        </StarCard>

        <StarCard>
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#d5b16f]">
              <FortuneIcon name="moon" size={28} plain />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold tracking-wide text-[#d5b16f]">
                แม่มั่งมีฝากไว้
              </p>
              <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-[#f7f4ec]">
                {SAMPLE.maeQuote}
              </p>
            </div>
          </div>
        </StarCard>
      </div>

      <div className="my-5">
        <SectionOrnament />
      </div>

      {/* PAGE 3 - love / talk / care */}
      <div className="space-y-4">
        <div>
          <SectionHead
            icon={<Heart className="h-5 w-5" strokeWidth={1.8} />}
            title="ความรัก"
            subtitle={SAMPLE.love.subtitle}
          />
          <div className="space-y-2.5">
            <div
              className="flex items-start gap-3 rounded-[14px] px-3 py-3"
              style={{
                background: "rgba(16,24,39,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
              }}
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#d5b16f]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
                }}
              >
                <User className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-[13px] font-semibold text-[#d5b16f]">
                  คนโสด
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#f7f4ec]/88">
                  {SAMPLE.love.single}
                </p>
              </div>
            </div>
            <div
              className="flex items-start gap-3 rounded-[14px] px-3 py-3"
              style={{
                background: "rgba(16,24,39,0.72)",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
              }}
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#d5b16f]"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.45)",
                }}
              >
                <Users className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-[13px] font-semibold text-[#d5b16f]">
                  คนมีคู่
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#f7f4ec]/88">
                  {SAMPLE.love.couple}
                </p>
              </div>
            </div>
          </div>
        </div>

        <SectionOrnament />

        <div>
          <SectionHead
            icon={<MessageCircle className="h-5 w-5" strokeWidth={1.8} />}
            title="การติดต่อและเจรจา"
            subtitle={SAMPLE.talk.subtitle}
          />
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-3.5 py-3"
            style={{
              background: "rgba(16,24,39,0.72)",
              boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.32)",
            }}
          >
            <Lightbulb
              className="h-[18px] w-[18px] shrink-0 text-[#d5b16f]"
              strokeWidth={2}
            />
            <p className="text-[13.5px] font-semibold text-[#f7f4ec]">
              {SAMPLE.talk.tip}
            </p>
          </div>
        </div>

        <SectionOrnament />

        <div>
          <SectionHead
            icon={<FortuneIcon name="moon" size={22} plain />}
            title="ดูแลกายและใจ"
            subtitle={SAMPLE.care.subtitle}
          />
          <div className="space-y-2.5">
            <div
              className="rounded-[16px] px-3.5 py-3.5 text-left"
              style={{
                background:
                  "linear-gradient(145deg, rgba(8,42,34,0.95), rgba(12,58,48,0.88))",
                boxShadow: "inset 0 0 0 1px rgba(110,190,150,0.35)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(110,190,150,0.25)] text-[#9ed9b8]">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                <p className="text-[13px] font-semibold text-[#b8e6cc]">
                  สิ่งที่ควรทำ
                </p>
              </div>
              <ul className="mt-2.5 space-y-1.5 pl-1">
                {SAMPLE.care.dos.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-[12.5px] leading-relaxed text-[#e8f5ee]/92"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9ed9b8]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-[16px] px-3.5 py-3.5 text-left"
              style={{
                background:
                  "linear-gradient(145deg, rgba(42,28,8,0.95), rgba(58,40,12,0.88))",
                boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.4)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(213,177,111,0.2)] text-[#e8d19a]">
                  <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <p className="text-[13px] font-semibold text-[#e8d19a]">
                  สิ่งที่ควรระวัง
                </p>
              </div>
              <ul className="mt-2.5 space-y-1.5 pl-1">
                {SAMPLE.care.donts.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-[12.5px] leading-relaxed text-[#f7f4ec]/88"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#d5b16f]" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[10.5px] tracking-wide text-[#6b7380]">
        ตัวอย่างคำทำนายสำหรับการออกแบบ - ยังไม่ผูกกับ flow หลัก
      </p>
    </div>
  );
}
