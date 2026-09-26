"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Noto_Serif_Thai } from "next/font/google";
import { MAE_REVIEWS } from "@/lib/reviews";
import { StoryPremium } from "@/components/story/story-premium";
import { StorySectionTwo } from "@/components/story/story-section-two";
import "./story-landing.css";

const storySerif = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const STORY_IMAGES = {
  hero: "/images/bg/story-moon.jpg",
  year: "/images/home/predict/year-banner.webp",
  bazi: "/images/home/predict/bazi-banner.webp",
  couple: "/images/home/predict/couple-banner.webp",
  calendar: "/images/home/calendar-cover.webp",
} as const;

const FEATURES = [
  {
    key: "year" as const,
    tone: "annual",
    href: "/premium/year",
    label: "ดวงปี",
    title: "ปีนี้อะไรควรเริ่มก่อน?",
    body: "อ่านภาพรวมงาน เงิน ความรักตลอดปี",
  },
  {
    key: "bazi" as const,
    tone: "bazi",
    href: "/reading/bazi",
    label: "ปาจื้อ",
    title: "จังหวะชีวิตเราเป็นแบบไหน?",
    body: "ดูพื้นดวงและช่วงที่เปลี่ยนไป",
  },
  {
    key: "couple" as const,
    tone: "pair",
    href: "/premium/couple",
    label: "ดวงคู่",
    title: "ความสัมพันธ์ควรคุยเรื่องไหน?",
    body: "เห็นจุดที่เข้ากันและเรื่องที่ต้องคุย",
  },
  {
    key: "calendar" as const,
    tone: "calendar",
    href: "/calendar",
    label: "ปฏิทินมงคล",
    title: "จะนัดวันสำคัญเมื่อไรดี?",
    body: "ดูช่วงเวลาที่เหมาะกับแผนของคุณ",
  },
] as const;

const JOIN_URL = "https://www.maemangmee.com/welcome/preview";

const DAILY = [
  {
    href: "/reading/tarot",
    image: "/images/story/tiles/tarot.jpg",
    title: "ไพ่รายวัน",
    body: "เปิดหนึ่งใบ อ่านเรื่องที่ควรใส่ใจวันนี้",
  },
  {
    href: "/reading/shirt",
    image: "/images/story/tiles/shirt.jpg",
    title: "สีเสื้อมงคล",
    body: "วันนี้ใส่สีไหนดี",
  },
  {
    href: "/reading/seamsee",
    image: "/images/story/tiles/seamsee.jpg",
    title: "เซียมซี",
    body: "เปิดอ่านวันละใบ",
  },
] as const;

const MORE = [
  {
    href: "/special/lucky-numbers",
    label: "เลขมงคล",
    image: "/images/story/tiles/lucky.jpg",
  },
  {
    href: "/special/phone",
    label: "วิเคราะห์เบอร์",
    image: "/images/story/tiles/phone.jpg",
  },
  {
    href: "/special/dream",
    label: "ทำนายฝัน",
    image: "/images/story/tiles/dream.jpg",
  },
  {
    href: "/reading/face",
    label: "โหงวเฮ้ง",
    image: "/images/story/tiles/face.jpg",
  },
  {
    href: "/reading/palm",
    label: "ลายมือ",
    image: "/images/story/tiles/palm.jpg",
  },
  {
    href: "/reading/wallpaper",
    label: "วอลเปเปอร์",
    image: "/images/story/tiles/wallpaper.jpg",
  },
] as const;

const HERO_SETS = [
  [
    { title: "งานช่วงนี้", sub: "เรื่องที่กำลังรอคำตอบ", image: "/images/story/cards/work.jpg" },
    { title: "จังหวะชีวิต", sub: "เดือนก่อน — วันนี้", image: "/images/story/cards/timing.jpg" },
    { title: "การเงิน", sub: "ภาพรวมของคุณ", image: "/images/story/cards/money.jpg" },
  ],
  [
    { title: "ไพ่รายวัน", sub: "ตัวอย่างพรีเมียม", image: "/images/story/cards/tarot.jpg" },
    { title: "สีมงคลวันนี้", sub: "ตัวอย่างคำแนะนำวัน", image: "/images/story/cards/color.jpg" },
    { title: "ฤกษ์วันนี้", sub: "ตัวอย่างปฏิทิน", image: "/images/story/cards/timing-day.jpg" },
  ],
  [
    { title: "ตัวตนของคุณ", sub: "มองตัวเองให้ชัดขึ้น", image: "/images/story/cards/self.jpg" },
    { title: "ดวงรายปี", sub: "ตัวอย่างพรีเมียม", image: "/images/story/cards/year.jpg" },
    { title: "ความรัก", sub: "ภาพรวมของคุณ", image: "/images/story/cards/love.jpg" },
  ],
] as const;

const HERO_LINES: { icon: string; title: string; text: string }[][] = [
  [
    { icon: "/images/icons/hero/12_energy.webp", title: "งานไปต่อได้ไหม", text: "เดินหน้า หรือทบทวนก่อนหนึ่งจังหวะ" },
    { icon: "/images/icons/hero/07_guidance.webp", title: "จุดที่กำลังเปลี่ยน", text: "เห็นช่วงที่พลิกจากเดือนก่อน" },
    { icon: "/images/icons/hero/11_ritual.webp", title: "เงินที่ต้องดูก่อน", text: "จัดรายจ่าย และจังหวะที่ยังไม่รีบ" },
  ],
  [
    { icon: "/images/icons/hero/10_daily_calendar.webp", title: "ใส่ใจวันนี้", text: "เปิดอ่านสั้น ๆ ก่อนเริ่มวัน" },
    { icon: "/images/icons/hero/02_lucky_color.webp", title: "สีที่เข้ากับวันนี้", text: "เลือกโทนให้ตรงเรื่องในใจ" },
    { icon: "/images/icons/hero/03_right_timing.webp", title: "จังหวะลงมือ", text: "ดูช่วงเวลาที่เข้ากับแผน" },
  ],
  [
    { icon: "/images/icons/hero/04_self_identity.webp", title: "จุดแข็งของตัวเอง", text: "เห็นชัดว่าอะไรเป็นแรงคุณ" },
    { icon: "/images/icons/hero/05_auspicious_date.webp", title: "เรื่องสำคัญทั้งปี", text: "เห็นภาพรวมก่อนเลือกทาง" },
    { icon: "/images/icons/hero/06_love.webp", title: "เรื่องรักที่ค้าง", text: "เข้าใจก่อน แล้วค่อยคุยให้ชัด" },
  ],
];

const STORY_REVIEW_STATS = [
  { value: "98%", label: "อ่านง่าย" },
  { value: "96%", label: "ตรงกับชีวิตจริง" },
  { value: "95%", label: "ใช้ทุกวัน" },
] as const;

const STORY_REVIEWS = [
  {
    name: "ศรัณย์ภา S.",
    role: "พนักงานออฟฟิศ",
    date: "12 ก.พ. 2567",
    initial: "ศ",
    featured: false,
    quote: "อ่านง่ายมากค่ะ คำทำนายตรงกับสิ่งที่กำลังเจอในช่วงนี้ โดยเฉพาะเรื่องงาน รู้สึกดีกำลังใจขึ้นเยอะเลยค่ะ",
  },
  {
    name: "ณัฐวุฒิ T.",
    role: "เจ้าของธุรกิจ",
    date: "5 ก.ค. 2567",
    initial: "ณ",
    featured: true,
    quote: "แม่บอกตรงมากครับ โดยเฉพาะเรื่องการงาน ช่วยให้ตัดสินใจได้ง่ายขึ้น รู้สึกเหมือนมีที่ปรึกษาดี ๆ อยู่ข้าง ๆ ทุกวัน",
  },
  {
    name: "มินตรา K.",
    role: "ฟรีแลนซ์",
    date: "28 ส.ค. 2567",
    initial: "ม",
    featured: false,
    quote: "ชอบดูดวงรายวันในเสื้อมงคลมากค่ะ เป็นไกด์ไลน์ในการใช้ชีวิต รู้สึกว่าแต่ละวันมีทิศทางมากขึ้น แนะนำได้เลยว่าดีค่ะ",
  },
  {
    name: "ธนภัทร P.",
    role: "นักศึกษามหาวิทยาลัย",
    date: "15 ต.ค. 2567",
    initial: "ธ",
    featured: false,
    quote: "เพิ่งเริ่มดูดวงครั้งแรก รู้สึกว่าเข้าใจได้ไม่ยาก ไม่ซับซ้อน และหลายอย่างตรงกับชีวิตจริงมากครับ จะกลับมาใช้อีกแน่นอน",
  },
] as const;

function HeroLineIcon({ src }: { src: string }) {
  return (
    <span className="story-hero-ico" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={64} height={64} />
    </span>
  );
}

const HERO_SLOTS = ["left", "middle", "right"] as const;

export function StoryHome() {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDir, setHeroDir] = useState<1 | -1>(1);
  const heroMoved = useRef(false);
  const heroTimer = useRef<number | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const heroDragX = useRef(0);
  const landingRef = useRef<HTMLDivElement>(null);
  const featureSwipeRef = useRef<HTMLDivElement>(null);
  const featureAnim = useRef<number | null>(null);
  const featureDrag = useRef({
    x: 0,
    y: 0,
    left: 0,
    lastX: 0,
    lastT: 0,
    vx: 0,
    active: false,
    moved: false,
    axis: null as "x" | "y" | null,
  });
  const hero = STORY_IMAGES.hero;

  useEffect(() => {
    const el = featureSwipeRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const scroller = el.closest(".story-landing");
      if (!(scroller instanceof HTMLElement)) return;
      scroller.scrollTop += event.deltaY;
      event.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function clearHeroTimer() {
    if (heroTimer.current != null) {
      window.clearInterval(heroTimer.current);
      heroTimer.current = null;
    }
  }

  function startHeroTimer() {
    clearHeroTimer();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer.current = window.setInterval(() => {
      heroMoved.current = true;
      setHeroDir(1);
      setHeroIndex((current) => (current + 1) % HERO_SETS.length);
    }, 5000);
  }

  useEffect(() => {
    startHeroTimer();
    return clearHeroTimer;
  }, []);

  useEffect(() => {
    const root = landingRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-story-reveal], [data-story-stagger]")];
    if (reduce) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const reveal = () => {
      const limit = root.getBoundingClientRect().bottom - root.clientHeight * 0.08;
      nodes.forEach((node) => {
        if (node.classList.contains("is-in")) return;
        if (node.getBoundingClientRect().top < limit) node.classList.add("is-in");
      });
    };
    reveal();
    root.addEventListener("scroll", reveal, { passive: true });
    return () => root.removeEventListener("scroll", reveal);
  }, []);

  function moveHero(delta: number) {
    const step: 1 | -1 = delta < 0 ? -1 : 1;
    heroMoved.current = true;
    setHeroDir(step);
    setHeroIndex((current) => (current + step + HERO_SETS.length) % HERO_SETS.length);
    startHeroTimer();
  }

  function featureStep(el: HTMLDivElement) {
    const card = el.firstElementChild as HTMLElement | null;
    return (card?.offsetWidth ?? el.clientWidth) + 12;
  }

  function animateFeatureScroll(el: HTMLDivElement, target: number) {
    if (featureAnim.current !== null) cancelAnimationFrame(featureAnim.current);
    const start = el.scrollLeft;
    const change = target - start;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (Math.abs(change) < 1 || reduce) {
      el.scrollLeft = target;
      el.classList.remove("is-dragging");
      return;
    }
    const duration = 340;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      el.scrollLeft = start + change * eased;
      if (p < 1) featureAnim.current = requestAnimationFrame(tick);
      else {
        featureAnim.current = null;
        el.classList.remove("is-dragging");
      }
    };
    featureAnim.current = requestAnimationFrame(tick);
  }

  function onFeaturePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = featureSwipeRef.current;
    if (!el) return;
    if (featureAnim.current !== null) cancelAnimationFrame(featureAnim.current);
    featureAnim.current = null;
    const now = performance.now();
    featureDrag.current = {
      x: event.clientX,
      y: event.clientY,
      left: el.scrollLeft,
      lastX: event.clientX,
      lastT: now,
      vx: 0,
      active: true,
      moved: false,
      axis: null,
    };
    el.classList.add("is-dragging");
    el.setPointerCapture(event.pointerId);
  }

  function onFeaturePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = featureDrag.current;
    const el = featureSwipeRef.current;
    if (!drag.active || !el) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (drag.axis === "y") {
      const scroller = el.closest(".story-landing");
      if (scroller instanceof HTMLElement) {
        scroller.scrollTop -= event.clientY - drag.y;
      }
      drag.y = event.clientY;
      if (Math.abs(dy) > 6) drag.moved = true;
      return;
    }
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 1);
    drag.vx = (event.clientX - drag.lastX) / dt;
    drag.lastX = event.clientX;
    drag.lastT = now;
    if (Math.abs(dx) > 6) drag.moved = true;
    el.scrollLeft = drag.left - dx;
  }

  function onFeaturePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = featureDrag.current;
    const el = featureSwipeRef.current;
    drag.active = false;
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    if (!el || drag.axis !== "x") {
      el?.classList.remove("is-dragging");
      return;
    }
    const step = Math.max(featureStep(el), 1);
    let index = el.scrollLeft / step;
    if (drag.vx < -0.35) index = Math.floor(index) + 1;
    else if (drag.vx > 0.35) index = Math.ceil(index) - 1;
    else index = Math.round(index);
    index = Math.min(FEATURES.length - 1, Math.max(0, index));
    animateFeatureScroll(el, index * step);
  }

  return (
    <div
      ref={landingRef}
      className={`story-landing relative h-full overflow-y-auto overscroll-contain ${storySerif.variable}`}
      onScroll={() => {
        const el = landingRef.current;
        if (!el) return;
        setPastHero(el.scrollTop > el.clientHeight * 0.72);
        const photo = el.querySelector<HTMLElement>(".story-hero-photo");
        if (!photo) return;
        const shift = Math.min(el.scrollTop * 0.22, 96);
        photo.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : "";
      }}
    >
      <section className="story-hero" id="top">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="story-hero-photo" src={hero} alt="" />
        ) : null}
        <div className="story-shell story-hero-copy">
          <h1>
            บางเรื่องในชีวิต
            <br />
            <span className="story-gold mae-gold-text">แค่รู้จังหวะ</span>
            <br />
            ก็กล้าเดินต่อ
          </h1>
          <p className="story-hero-sub">
            ลองดูว่าช่วงนี้ เรื่องไหนควรไปต่อ เรื่องไหนควรรอก่อน
          </p>
          <div
            className="story-hero-gallery"
            onPointerDown={(event) => {
              heroDragX.current = event.clientX;
              clearHeroTimer();
            }}
            onPointerUp={(event) => {
              const dx = event.clientX - heroDragX.current;
              if (Math.abs(dx) > 40) moveHero(dx < 0 ? 1 : -1);
              else startHeroTimer();
            }}
          >
            <button
              type="button"
              className="story-hero-arrow story-hero-arrow--prev"
              aria-label="ภาพก่อนหน้า"
              onClick={() => moveHero(-1)}
            >
              ‹
            </button>
            <div
              key={heroIndex}
              className={
                heroMoved.current
                  ? `story-hero-stage story-hero-stage--${heroDir > 0 ? "next" : "prev"}`
                  : "story-hero-stage"
              }
            >
              {HERO_SETS[heroIndex].map((card, index) => (
                <article
                  key={`${heroIndex}-${card.title}`}
                  className={`story-hero-fan story-hero-fan--${HERO_SLOTS[index]}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" />
                  <div>
                    <h2>{card.title}</h2>
                    <small>{card.sub}</small>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="story-hero-arrow story-hero-arrow--next"
              aria-label="ภาพถัดไป"
              onClick={() => moveHero(1)}
            >
              ›
            </button>
          </div>
          <ul key={heroIndex} className="story-hero-benefits">
            {HERO_LINES[heroIndex].map((line) => (
              <li key={line.title}>
                <HeroLineIcon src={line.icon} />
                <strong>{line.title}</strong>
                <small>{line.text}</small>
              </li>
            ))}
          </ul>
          <Link className="story-button" href={JOIN_URL}>
            ลองดูดวงของฉันฟรี <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <StorySectionTwo />

      <section className="story-features" id="features" data-story-reveal>
        <div className="story-shell">
          <p className="story-eyebrow">02 / คำถามที่อยากรู้ต่อ</p>
          <h2>
            อยากดูเรื่องไหน
            <br />
            <span className="story-gold mae-gold-text">ให้ลึกขึ้นอีกนิด?</span>
          </h2>
          <p className="story-lead">
            แต่ละฟีเจอร์เริ่มจากคำถามคนละแบบ เลือกอ่านเฉพาะเรื่องที่อยู่ในใจก็ได้
          </p>
          <div
            ref={featureSwipeRef}
            className="story-feature-swipe"
            onPointerDown={onFeaturePointerDown}
            onPointerMove={onFeaturePointerMove}
            onPointerUp={onFeaturePointerUp}
            onPointerCancel={onFeaturePointerUp}
            onClickCapture={(event) => {
              if (!featureDrag.current.moved) return;
              event.preventDefault();
              event.stopPropagation();
              featureDrag.current.moved = false;
            }}
            onScroll={() => {
              const el = featureSwipeRef.current;
              if (!el) return;
              const next = Math.round(el.scrollLeft / Math.max(featureStep(el), 1));
              setFeatureIndex(Math.min(FEATURES.length - 1, Math.max(0, next)));
            }}
          >
            {FEATURES.map((item) => {
              const image = STORY_IMAGES[item.key];
              return (
                <Link
                  key={item.href}
                  href={JOIN_URL}
                  draggable={false}
                  className={`story-feature story-feature--${item.tone}`}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="story-feature-photo" src={image} alt="" />
                  ) : (
                    <span className="story-feature-art" aria-hidden />
                  )}
                  <span className="story-feature-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="story-feature-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="story-feature-dots" aria-hidden>
            {FEATURES.map((item, index) => (
              <span
                key={item.href}
                className={index === featureIndex ? "is-on" : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="story-daily" data-story-reveal>
        <div className="story-shell">
          <p className="story-eyebrow">03 / เปิดดูได้ทุกวัน</p>
          <h2>
            บางวันก็อยาก
            <br />
            <span className="story-gold mae-gold-text">ดูแค่เรื่องวันนี้</span>
          </h2>
          <p className="story-lead">
            มีทั้งคำอ่านสั้น ๆ และเรื่องสายมูเล็ก ๆ ที่หยิบไปใช้ในวันนั้นได้
          </p>
          <div className="story-more" data-story-stagger aria-label="ฟีเจอร์อื่น">
            {MORE.map((item) => (
              <Link key={item.label} href={JOIN_URL}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="story-daily-list" data-story-stagger>
            {DAILY.map((item) => (
              <Link key={item.title} href={JOIN_URL} className="story-daily-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="story-mini-photo" src={item.image} alt="" />
                <span>
                  <b>{item.title}</b>
                  <small>{item.body}</small>
                </span>
                <span className="story-feature-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="story-reviews" id="reviews" data-story-reveal>
        <div className="story-shell">
          <div className="story-review-head">
            <h2>รีวิวหลังจากได้เปิดดวง</h2>
            <p className="story-review-lead">เสียงจริงจากคนที่เข้ามาเปิดคำทำนายกับเรา</p>
          </div>
          <div className="story-review-summary">
            <div className="story-review-scorebox">
              <p className="story-review-score">4.9/5</p>
              <p className="story-review-stars" aria-label="5 จาก 5 ดาว">
                ★★★★★
              </p>
              <p className="story-review-count">จาก 12,458 รีวิว</p>
            </div>
            <div className="story-review-stats">
              {STORY_REVIEW_STATS.map((stat) => (
                <div key={stat.value} className="story-review-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="story-review-list" data-story-stagger>
            {STORY_REVIEWS.map((review) => (
              <article
                key={review.name}
                className={review.featured ? "story-review-card story-review-card--featured" : "story-review-card"}
              >
                {review.featured ? (
                  <span className="story-review-badge">
                    <svg viewBox="0 0 16 16" aria-hidden>
                      <path d="M8 1.2 9.4 4.6 13 5.1 10.4 7.6 11.1 11.2 8 9.5 4.9 11.2 5.6 7.6 3 5.1 6.6 4.6Z" />
                    </svg>
                    รีวิวแนะนำ
                  </span>
                ) : null}
                <header>
                  <span className="story-review-avatar" aria-hidden>
                    {review.initial}
                  </span>
                  <span className="story-review-who">
                    <b>{review.name}</b>
                    <small>{review.role}</small>
                  </span>
                  <time>{review.date}</time>
                </header>
                <p className="story-review-stars" aria-hidden>
                  ★★★★★
                </p>
                <p className="story-review-quote">“{review.quote}”</p>
              </article>
            ))}
          </div>
          <Link className="story-review-more" href={JOIN_URL}>
            ดูทั้งหมด {MAE_REVIEWS.length} รีวิว →
          </Link>
        </div>
      </section>

      <StoryPremium />

      <div className={pastHero ? "story-cta-bar" : "story-cta-bar story-cta-bar--off"}>
        <Link className="story-button" href={JOIN_URL}>
          ลองดูดวงของฉันฟรี <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
