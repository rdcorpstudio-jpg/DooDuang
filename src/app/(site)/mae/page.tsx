import type { Metadata } from "next";
import { MaeLanding } from "@/components/home/mae-landing";

export const metadata: Metadata = {
  title: "แม่มั่งมี — อ่านดวงอุ่นใจ",
  description:
    "เข้าใจจังหวะชีวิต ก้าวต่ออย่างอุ่นใจ — อ่านดวงอย่างมีสติ ผ่านแนวคิด 30 ลิขิตฟ้า 70 มานะตน",
};

export default function MaeHomePage() {
  return <MaeLanding />;
}
