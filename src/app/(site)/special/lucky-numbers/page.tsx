import { FortuneLuckyNumbersPage } from "@/components/fortune/fortune-lucky-numbers-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `เลขมงคลประจำวัน — ${APP_NAME}`,
  description: "เลขมงคล 3 ตัวประจำวัน อ้างอิงโหราศาสตร์ไทย อัปเดตใหม่ทุกวัน",
};

export default function LuckyNumbersPage() {
  return (
    <div className="preview-page-scroll relative h-full min-h-0 overflow-y-auto overscroll-contain">
      <FortuneLuckyNumbersPage />
    </div>
  );
}
