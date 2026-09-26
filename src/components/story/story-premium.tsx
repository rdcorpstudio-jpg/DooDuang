"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./premium-vertical.css";
import { FORTUNE_PACKAGE_LABEL, FORTUNE_UNLOCK_LIST_PRICE, FORTUNE_UNLOCK_PRICE } from "@/lib/site";

const YEARS = 1;
const SAVINGS = FORTUNE_UNLOCK_LIST_PRICE - FORTUNE_UNLOCK_PRICE;

const FEATURES = [
  {
    image: "/images/story/feature-icons/01-daily-fortune.webp",
    name: "ดวงรายวัน",
    description: "อ่านทุกเช้า เห็นเรื่องที่ควรไปต่อและเรื่องที่ยังไม่ต้องรีบ",
    detail: "อ่านภาพรวมของวัน พร้อมคำแนะนำเรื่องที่ควรทำและเรื่องที่ควรค่อย ๆ ตัดสินใจ",
  },
  {
    image: "/images/story/feature-icons/02-tarot.webp",
    name: "ไพ่ทาโรต์",
    description: "เปิดหนึ่งใบ อ่านจังหวะใจของวันนั้น",
    detail: "เปิดไพ่ประจำวัน แล้วอ่านคำแปลเป็นอีกมุมมองสำหรับเรื่องที่กำลังอยู่ในใจ",
  },
  {
    image: "/images/story/feature-icons/03-auspicious-shirt.webp",
    name: "สีเสื้อมงคล",
    description: "สีที่หนุนวันนี้ และสีที่ยังไม่ต้องใส่",
    detail: "ดูสีประจำวันไว้เป็นไอเดียก่อนแต่งตัว เลือกใช้ตามความสบายใจของคุณ",
  },
  {
    image: "/images/story/feature-icons/04-fortune-sticks.webp",
    name: "เซียมซี",
    description: "เขย่าแล้วเปิดคำทำนายวันละใบ",
    detail: "เปิดคำทำนายจากเซียมซี พร้อมข้อคิดและคำแนะนำที่นำกลับมาทบทวนกับตัวเองได้",
  },
  {
    image: "/images/story/feature-icons/05-bazi.webp",
    name: "ปาจื้อ",
    description: "อ่านฐานดวงจากวันเกิด เห็นจังหวะชีวิตทั้งปี",
    detail: "อ่านพื้นฐานจากข้อมูลวันเกิดตามศาสตร์ปาจื้อ พร้อมมุมมองเรื่องจังหวะชีวิตตลอดปี",
  },
  {
    image: "/images/story/feature-icons/06-face-reading.webp",
    name: "โหงวเฮ้ง",
    description: "สแกนใบหน้า อ่านนิสัยและจุดที่ควรระวัง",
    detail: "อ่านภาพรวมตามศาสตร์โหงวเฮ้ง เพื่อเป็นมุมมองในการสำรวจตัวเองตามความเชื่อส่วนบุคคล",
  },
  {
    image: "/images/story/feature-icons/07-palm-reading.webp",
    name: "ลายมือ",
    description: "อ่านเส้นมือ เห็นทางที่ชีวิตกำลังพาไป",
    detail: "อ่านเส้นฝ่ามือเป็นอีกมุมมองของทางที่กำลังเดิน และจุดที่ควรค่อย ๆ ดูให้ชัด",
  },
  {
    image: "/images/story/feature-icons/08-love-match.webp",
    name: "ดวงคู่",
    description: "ดูจุดที่เข้ากัน และเรื่องที่ควรคุยกัน",
    detail: "ดูภาพรวมของสองคน ทั้งจุดที่เข้ากันและเรื่องที่ควรค่อย ๆ คุยให้เข้าใจตรงกัน",
  },
  {
    image: "/images/story/feature-icons/09-self-map.webp",
    name: "แผนที่ตัวตน",
    description: "เห็นจุดแข็งและทิศทางที่เหมาะกับคุณ",
    detail: "อ่านจุดแข็ง นิสัย และทิศทางที่เข้ากับตัวคุณ ไว้ใช้ประกอบการตัดสินใจ",
  },
  {
    image: "/images/story/feature-icons/10-yearly-fortune.webp",
    name: "ดวงรายปี",
    description: "ภาพรวมทั้งปี งาน เงิน และความรัก",
    detail: "ดูภาพรวมตลอดปี ทั้งเรื่องงาน เงิน และความรัก เพื่อวางจังหวะให้ตัวเอง",
  },
  {
    image: "/images/story/feature-icons/11-auspicious-calendar.webp",
    name: "ปฏิทินมงคล",
    description: "เลือกวันสำคัญได้ตลอดทั้งปี",
    detail: "เปิดปฏิทินทั้งปี เลือกวันที่เหมาะสำหรับเรื่องสำคัญ และวันที่ยังไม่ต้องรีบ",
  },
  {
    image: "/images/story/feature-icons/12-lucky-wallpaper.webp",
    name: "วอลเปเปอร์นำโชค",
    description: "ภาพพื้นหลังประจำวัน สุ่มคุณภาพเต็ม",
    detail: "รับภาพพื้นหลังประจำวัน เก็บไว้ใช้ตามความสบายใจ",
  },
  {
    image: "/images/story/feature-icons/13-lucky-number.webp",
    name: "เลขมงคล",
    description: "เลขประจำวัน พร้อมความหมายและคู่เลข",
    detail: "ดูเลขประจำวัน พร้อมความหมายไว้เป็นไอเดีย ไม่ใช่คำรับประกันผล",
  },
  {
    image: "/images/story/feature-icons/14-dream-reading.webp",
    name: "ทำนายฝัน",
    description: "พิมพ์ความฝัน แม่ตีความให้",
    detail: "เล่าความฝัน แล้วอ่านคำตีความเป็นมุมมองประกอบการคิดต่อ",
  },
  {
    image: "/images/story/feature-icons/15-phone-number-analysis.webp",
    name: "วิเคราะห์เบอร์",
    description: "ใส่เบอร์มือถือ ดูพลังเลขในเบอร์นั้น",
    detail: "อ่านภาพรวมของเลขในเบอร์มือถือ ตามความเชื่อส่วนบุคคล",
  },
  {
    image: "/images/story/feature-icons/16-consult-mae.webp",
    name: "ปรึกษาแม่",
    description: "คุยเรื่องที่อยู่ในใจ แล้วได้คำตอบกลับไปคิด",
    detail: "ส่งเรื่องที่คาใจ แล้วอ่านคำตอบกลับไปทบทวนก่อนตัดสินใจเอง",
  },
] as const;

function Chevron() {
  return (
    <svg className="mmmp-chevron" viewBox="0 0 12 20" aria-hidden>
      <path d="m3 3 6 7-6 7" />
    </svg>
  );
}

export function StoryPremium() {
  const price = FORTUNE_UNLOCK_PRICE.toLocaleString("th-TH");
  const original = FORTUNE_UNLOCK_LIST_PRICE.toLocaleString("th-TH");
  const featureScrollRef = useRef<HTMLDivElement>(null);
  const [featureMore, setFeatureMore] = useState(true);

  useEffect(() => {
    const root = featureScrollRef.current;
    if (!root) return;

    const syncMore = () => {
      setFeatureMore(root.scrollTop + root.clientHeight < root.scrollHeight - 8);
    };

    syncMore();
    root.addEventListener("scroll", syncMore, { passive: true });
    root.addEventListener("toggle", syncMore, true);

    return () => {
      root.removeEventListener("scroll", syncMore);
      root.removeEventListener("toggle", syncMore, true);
    };
  }, []);

  return (
    <div className="mmm-premium-slot">
      <section className="mmm-premium" id="premium" aria-labelledby="mmm-premium-heading">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mmmp-scenery" src="/images/story/premium/scenery.webp" width={900} height={1599} alt="" aria-hidden />
        <svg className="mmmp-celestial" viewBox="0 0 300 300" fill="none" aria-hidden>
          <g stroke="currentColor" strokeWidth="0.65">
            <circle cx="150" cy="150" r="146" />
            <circle cx="150" cy="150" r="133" />
            <circle cx="150" cy="150" r="106" />
            <circle cx="150" cy="150" r="75" />
            <path d="M4 150h292M150 4v292M47 47l206 206M47 253 253 47M23 77l254 146M77 23l146 254M23 223 277 77M77 277 223 23" />
            <path d="m150 17 115 199H35Z M150 283 35 84h230Z" />
          </g>
          <g fill="currentColor">
            <circle cx="150" cy="17" r="2.5" />
            <circle cx="265" cy="216" r="2.5" />
            <circle cx="35" cy="216" r="2.5" />
            <circle cx="150" cy="283" r="2.5" />
            <circle cx="35" cy="84" r="2.5" />
            <circle cx="265" cy="84" r="2.5" />
          </g>
        </svg>

        <div className="mmmp-intro" data-story-reveal>
          <div className="mmmp-emblem" aria-hidden>
            <span />
            <svg viewBox="0 0 40 40" aria-hidden>
              <path d="M24 3A16 16 0 1 0 34 30 15 15 0 0 1 24 3Z" />
              <path d="m31 5 1.5 4.5L37 11l-4.5 1.5L31 17l-1.5-4.5L25 11l4.5-1.5ZM36 22l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
            </svg>
            <span />
          </div>
          <p className="mmmp-eyebrow">แพ็กเกจพรีเมียม</p>
          <h2 className="mmmp-title" id="mmm-premium-heading">
            <span>จากวันนี้</span>
            <span className="mmmp-title-gold">ไปอีก {YEARS} ปี</span>
          </h2>
          <p className="mmmp-intro-copy">เห็นช่วงที่ควรเดินหน้า และช่วงที่ควรตั้งหลัก</p>
        </div>

        <div className="mmmp-package" data-story-reveal>
          <div className="mmmp-sale" aria-label="ราคาพิเศษ">
            <b lang="en">SALE</b>
            <span>
              <s>{original}</s> <span aria-hidden>→</span> <strong>{price}</strong>
            </span>
          </div>
          <div className="mmmp-price-area">
            <p className="mmmp-price" aria-label={`${price} บาท ใช้งาน ${FORTUNE_PACKAGE_LABEL}`}>
              <span className="mmmp-price-amount" aria-hidden>
                <span className="mmmp-baht">฿</span>
                <span className="mmmp-price-number">{price}</span>
              </span>
              <span className="mmmp-duration" aria-hidden>
                / {FORTUNE_PACKAGE_LABEL}
              </span>
            </p>
            <p className="mmmp-old-price">
              จาก <s>{original} บาท</s> <span aria-hidden> · </span>
              <span className="mmmp-save">ประหยัด {SAVINGS.toLocaleString("th-TH")} บาท</span>
            </p>
            <p className="mmmp-payment-copy">
              <svg className="mmmp-icon" viewBox="0 0 24 24" aria-hidden>
                <path d="m5 12 4 4L19 6" />
              </svg>
              จ่ายครั้งเดียว · ใช้งาน <span>{FORTUNE_PACKAGE_LABEL}เต็ม</span>
            </p>
          </div>
          <div className="mmmp-divider" aria-hidden>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 1c1.1 7.2 3.8 9.9 11 11-7.2 1.1-9.9 3.8-11 11C10.9 15.8 8.2 13.1 1 12 8.2 10.9 10.9 8.2 12 1Z" />
            </svg>
          </div>
          <p className="mmmp-includes">
            ปลดล็อกคำทำนายแบบเต็ม
            <br />
            พร้อมฟีเจอร์สำคัญ <span>ตลอด {FORTUNE_PACKAGE_LABEL}</span>
          </p>
          <div className={featureMore ? "mmmp-feature-frame has-more" : "mmmp-feature-frame"}>
            <div
              ref={featureScrollRef}
              className="mmmp-feature-scroll"
              aria-label="ฟีเจอร์ในแพ็กเกจพรีเมียม"
            >
            <div className="mmmp-features">
            {FEATURES.map((feature) => (
              <details key={feature.name} className="mmmp-feature">
                <summary>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="mmmp-feature-art" src={feature.image} width={192} height={192} alt="" />
                  <span className="mmmp-feature-text">
                    <span className="mmmp-feature-name">{feature.name}</span>
                    <span className="mmmp-feature-description">{feature.description}</span>
                  </span>
                  <Chevron />
                </summary>
                <p className="mmmp-feature-detail">{feature.detail}</p>
              </details>
            ))}
            </div>
            </div>
          </div>
        </div>

        <div className="mmmp-action" data-story-reveal>
          <Link className="mmmp-cta" href="https://www.maemangmee.com/welcome/preview">
            <svg className="mmmp-cta-lock" viewBox="0 0 28 36" aria-hidden>
              <path d="M6 15V9a8 8 0 0 1 16 0v6" fill="none" strokeWidth="3" />
              <rect x="2" y="14" width="24" height="21" rx="3" stroke="none" />
              <circle cx="14" cy="23" r="3" fill="#efd390" stroke="none" />
              <path d="M14 25v4" fill="none" stroke="#efd390" strokeWidth="2.5" />
            </svg>
            <span className="mmmp-cta-text">
              <strong>อ่านดวงแบบเต็ม</strong>
            </span>
            <Chevron />
          </Link>
        </div>
      </section>
    </div>
  );
}
