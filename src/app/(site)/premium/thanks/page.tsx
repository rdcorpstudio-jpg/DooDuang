import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { PremiumThanksPage } from "@/components/fortune/premium-thanks-page";

export const metadata = {
  title: `ชำระสำเร็จ — ${APP_NAME}`,
  description: "ปลดล็อกพรีเมียมแล้ว เพิ่มเพื่อนใน LINE เพื่อรับอัปเดตจากแม่มั่งมี",
};

export default function PremiumThanksRoute() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
          กำลังเปิด…
        </div>
      }
    >
      <PremiumThanksPage />
    </Suspense>
  );
}
