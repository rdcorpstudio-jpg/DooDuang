import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { PremiumHomePage } from "@/components/fortune/premium-home-page";

export const metadata = {
  title: `ดวงวันนี้ — ${APP_NAME}`,
  description: "ดูดวงรายวัน จังหวะชีวิต และแนวทางสำหรับคุณ",
};

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#9AB8DC]">
          กำลังเปิด…
        </div>
      }
    >
      <PremiumHomePage />
    </Suspense>
  );
}
