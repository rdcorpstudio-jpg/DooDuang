import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { PremiumYearPage } from "@/components/fortune/premium-year-page";

export const metadata = {
  title: `จังหวะปี — ${APP_NAME}`,
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-center text-[14px] text-[#8A82B0]">
          กำลังเปิด…
        </div>
      }
    >
      <PremiumYearPage />
    </Suspense>
  );
}
