import { APP_NAME } from "@/lib/site";
import { AdminAnalyticsPage } from "@/components/admin/admin-analytics-page";

export const metadata = {
  title: `Analytics — ${APP_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsRoute() {
  return <AdminAnalyticsPage />;
}
