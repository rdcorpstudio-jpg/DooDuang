import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { PremiumPayPage } from "@/components/fortune/premium-pay-page";

export const metadata = {
  title: `ชำระเงิน — ${APP_NAME}`,
  description: "เลือกวิธีชำระสิทธิ์พรีเมียมแม่มั่งมี แล้วดำเนินการบน Stripe Checkout",
};

export default function PremiumPayRoute() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
          กำลังเปิด…
        </div>
      }
    >
      <PremiumPayPage />
    </Suspense>
  );
}
