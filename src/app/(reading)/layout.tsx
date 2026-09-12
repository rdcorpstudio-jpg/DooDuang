import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden sacred-page-bg">
      <Suspense fallback={null}>
        <FeatureOpenTracker />
      </Suspense>
      {children}
    </div>
  );
}
