import type { Metadata } from "next";
import { Landing3DailyTarot } from "@/components/story/landing3-daily-tarot";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `ไพ่ประจำวัน · ${APP_NAME}`,
  description:
    "เปิดไพ่ประจำวันกับแม่มั่งมี อ่านคำทำนายสั้น ๆ แล้วสมัครเพื่ออ่านต่อแบบเต็ม",
};

export default function DailyTarotGatePage() {
  return <Landing3DailyTarot />;
}
