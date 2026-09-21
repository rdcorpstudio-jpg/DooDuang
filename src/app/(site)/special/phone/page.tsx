import { FortunePhonePage } from "@/components/fortune/fortune-phone-page";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `วิเคราะห์เบอร์ — ${APP_NAME}`,
  description: "วิเคราะห์เบอร์มือถือเทียบโปรไฟล์ งาน เงิน ความรัก และการใช้เบอร์",
};

export default function PhoneReadingPage() {
  return (
    <div className="preview-page-scroll relative h-full overflow-y-auto overscroll-contain">
      <FortunePhonePage />
    </div>
  );
}
