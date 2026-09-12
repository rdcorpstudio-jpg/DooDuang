import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/site";
import { HomeGate } from "@/components/home/home-gate";

export const metadata: Metadata = {
  title: "แม่มั่งมี — อ่านดวงอุ่นใจ",
  description:
    "เข้าใจจังหวะชีวิต ก้าวต่ออย่างอุ่นใจ — อ่านดวงอย่างมีสติ ผ่านแนวคิด 30 ลิขิตฟ้า 70 มานะตน",
};

export default function HomePage() {
  return (
    <>
      <section className="sr-only">
        <h1>{APP_NAME}</h1>
        <p>
          {APP_NAME} เป็นเว็บดูดวงออนไลน์ เปิดไพ่ทาโรต์ ดวงความรัก การงาน การเงิน
          และสุขภาพได้ทันทีโดยไม่ต้องเข้าสู่ระบบ กรอกอีเมลหลังดูดวงเพื่อรับลิงก์ดูผลซ้ำ
        </p>
        <Link href="/reading">เริ่มดูดวง</Link>
        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        <Link href="/terms">ข้อกำหนดการใช้งาน</Link>
      </section>
      <HomeGate />
    </>
  );
}
