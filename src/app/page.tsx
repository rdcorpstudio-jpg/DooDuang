import Link from "next/link";
import { APP_NAME } from "@/lib/site";
import { HomeScroll } from "@/components/home/home-scroll";

export default function HomePage() {
  return (
    <>
      <section className="sr-only">
        <h1>{APP_NAME}</h1>
        <p>
          {APP_NAME} เป็นเว็บดูดวงออนไลน์ เปิดไพ่ทาโรต์ ดวงความรัก การงาน การเงิน
          และสุขภาพได้ทันทีโดยไม่ต้องเข้าสู่ระบบ เข้าสู่ระบบด้วย Google
          เฉพาะเมื่อต้องการบันทึกประวัติหรือซื้อเครดิต
        </p>
        <Link href="/reading">เริ่มดูดวง</Link>
        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        <Link href="/terms">ข้อกำหนดการใช้งาน</Link>
      </section>
      <HomeScroll />
    </>
  );
}
