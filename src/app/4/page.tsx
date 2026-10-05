import type { Metadata } from "next";
import { DailyDrawGate } from "@/components/gate/daily-draw-gate";
import { APP_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `เปิดไพ่ดูดวงรายวัน · ${APP_NAME}`,
  description:
    "เปิดไพ่ดูดวงรายวันกับแม่มั่งมี อ่านคำทำนายสั้น ๆ แล้วสมัครเพื่ออ่านต่อแบบเต็ม",
};

export default function DailyDrawGatePage() {
  return <DailyDrawGate />;
}
