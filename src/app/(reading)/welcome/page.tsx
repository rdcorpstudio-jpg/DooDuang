import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { OnboardingIntakeForm } from "@/components/onboarding/onboarding-intake";
import { MaePageLoading } from "@/components/layout/mae-page-loading";

export const metadata = {
  title: `เริ่มต้น — ${APP_NAME}`,
  description: "บอกชื่อเล่น แล้วเลือกเรื่องที่อยากให้แม่ดู ก่อนเริ่มดูดวง",
};

export default function WelcomePage() {
  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<MaePageLoading label="กำลังเปิด…" />}>
        <OnboardingIntakeForm />
      </Suspense>
    </div>
  );
}
