import { APP_NAME } from "@/lib/site";
import { PremiumSelfMapPage } from "@/components/fortune/premium-self-map-page";

export const metadata = {
  title: `แผนที่ตัวเอง — ${APP_NAME}`,
};

export default function Page() {
  return <PremiumSelfMapPage />;
}
