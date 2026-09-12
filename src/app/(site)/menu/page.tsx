import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { FeatureMenuPage } from "@/components/fortune/feature-menu-page";

export const metadata = {
  title: `เมนู — ${APP_NAME}`,
  description: "เลือกดูดวง ปาจื้อ โหงวเฮ้ง ลายมือ และของมงคล",
};

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#f7f4ec]/55">
          กำลังเปิดเมนู…
        </div>
      }
    >
      <FeatureMenuPage />
    </Suspense>
  );
}
