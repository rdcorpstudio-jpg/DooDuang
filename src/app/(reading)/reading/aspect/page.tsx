import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { AspectDetailPage } from "@/components/fortune/aspect-detail-page";

export const metadata = {
  title: `ดวงรายวัน — ${APP_NAME}`,
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
      <AspectDetailPage backHref="/reading" />
    </Suspense>
  );
}
