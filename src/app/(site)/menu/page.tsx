import { APP_NAME } from "@/lib/site";
import { FeatureMenuPage } from "@/components/fortune/feature-menu-page";

export const metadata = {
  title: `เมนู — ${APP_NAME}`,
  description: "เลือกดูดวง ปาจื้อ โหงวเฮ้ง ลายมือ และของมงคล",
};

export default function MenuPage() {
  return <FeatureMenuPage />;
}
