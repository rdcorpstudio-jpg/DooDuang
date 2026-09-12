import { APP_NAME } from "@/lib/site";
import { PremiumReportPage } from "@/components/fortune/premium-report-page";

export const metadata = {
  title: `สรุปดวง — ${APP_NAME}`,
  description: "รายงานสรุปดวงจากวันเกิดและราศีของคุณ",
};

export default function Page() {
  return <PremiumReportPage />;
}
