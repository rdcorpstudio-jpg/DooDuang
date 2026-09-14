import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";
import { SiteVisitTracker } from "@/components/analytics/site-visit-tracker";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full overflow-hidden sacred-page-bg">
      <Suspense fallback={null}>
        <SiteVisitTracker />
        <FeatureOpenTracker />
      </Suspense>
      {children}
    </div>
  );
}
