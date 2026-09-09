import { APP_NAME } from "@/lib/site";
import { PremiumWeekPage } from "@/components/fortune/premium-week-page";

export const metadata = {
  title: `สัปดาห์นี้ — ${APP_NAME}`,
};

export default function Page() {
  return <PremiumWeekPage />;
}
