import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { HomeDraft } from "@/components/fortune/home-draft";
import { MaePageLoading } from "@/components/layout/mae-page-loading";

export const metadata = {
  title: `หน้าหลัก — ${APP_NAME}`,
  description: "ดวงวันนี้ สีเสื้อ ฤกษ์ และทางลัดดูดวง",
};

/** บ้านหลักแอป (ฟรี) */
export default function HomeAppPage() {
  return (
    <Suspense fallback={<MaePageLoading />}>
      <div className="preview-page-scroll relative h-full min-h-0 overflow-y-auto overscroll-contain">
        <HomeDraft />
      </div>
    </Suspense>
  );
}
