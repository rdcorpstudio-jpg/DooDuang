import Link from "next/link";
import type { Metadata } from "next";
import { HomeGate } from "@/components/home/home-gate";
import {
  APP_NAME,
  APP_PURPOSE,
  HOME_CHOOSE_HREF,
  LAYOUT_META_DESCRIPTION,
  LAYOUT_META_TITLE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: LAYOUT_META_TITLE,
  description: LAYOUT_META_DESCRIPTION,
};

export default function HomePage() {
  return (
    <>
      <section className="sr-only">
        <h1>{APP_NAME}</h1>
        <p>{APP_PURPOSE}</p>
        <Link href={HOME_CHOOSE_HREF}>ดูคำทำนาย</Link>
        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        <Link href="/terms">ข้อกำหนดการใช้งาน</Link>
      </section>
      <HomeGate />
    </>
  );
}
