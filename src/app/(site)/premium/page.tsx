import { APP_NAME } from "@/lib/site";
import { PremiumHomePage } from "@/components/fortune/premium-home-page";

export const metadata = {
  title: `ดวงพรีเมียม — ${APP_NAME}`,
  description:
    "ปลดล็อกหน้าดวงเต็ม ปฏิทินฤกษ์ จังหวะเดือน และเนื้อหาเชิงลึก",
};

export default function PremiumPage() {
  return <PremiumHomePage />;
}
