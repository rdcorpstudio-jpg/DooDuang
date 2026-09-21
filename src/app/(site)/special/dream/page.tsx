import { FortuneDreamPage } from "@/components/fortune/fortune-dream-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `ทำนายฝัน — ${APP_NAME}`,
  description: "เล่าความฝัน แม่ตีความให้วันละครั้ง พร้อมเลขเด็ด",
};

export default function DreamReadingPage() {
  return (
    <div className="preview-page-scroll relative h-full overflow-y-auto overscroll-contain">
      <FortuneDreamPage />
    </div>
  );
}
