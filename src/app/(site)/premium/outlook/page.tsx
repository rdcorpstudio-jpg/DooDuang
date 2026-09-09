import { APP_NAME } from "@/lib/site";
import { PremiumOutlookPage } from "@/components/fortune/premium-outlook-page";

export const metadata = {
  title: `จังหวะ 3 วัน — ${APP_NAME}`,
};

export default function Page() {
  return <PremiumOutlookPage />;
}
