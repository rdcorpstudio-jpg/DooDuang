import { FortunePhonePage } from "@/components/fortune/fortune-phone-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `วิเคราะห์เบอร์ — ${APP_NAME}`,
  description: "ใส่เบอร์มือถือ แม่วิเคราะห์พลังตัวเลขให้วันละครั้ง",
};

export default function PhoneReadingPage() {
  return (
    <div className="preview-page-scroll relative h-full overflow-y-auto overscroll-contain">
      <FortunePhonePage />
    </div>
  );
}
