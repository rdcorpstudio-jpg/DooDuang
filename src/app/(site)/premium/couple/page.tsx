import { APP_NAME } from "@/lib/site";
import { PremiumCouplePage } from "@/components/fortune/premium-couple-page";

export const metadata = {
  title: `ดวงคู่ — ${APP_NAME}`,
};

export default function Page() {
  return <PremiumCouplePage />;
}
