import { Suspense } from "react";
import { APP_NAME } from "@/lib/site";
import { OnboardingPreview } from "@/components/onboarding/onboarding-preview";

export const metadata = {
  title: `สิ่งที่จะได้รับ — ${APP_NAME}`,
  description: "ปัดดูตัวอย่างสิทธิ์พรีเมียมของแม่มั่งมี",
};

export default function WelcomePreviewPage() {
  return (
    <Suspense fallback={<div className="relative h-full bg-[#0b1220]" aria-hidden />}>
      <OnboardingPreview />
    </Suspense>
  );
}
