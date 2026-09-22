import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";
import { SiteVisitTracker } from "@/components/analytics/site-visit-tracker";
import { TrialAppGate } from "@/components/auth/trial-app-gate";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden sacred-page-bg">
      <Suspense fallback={null}>
        <SiteVisitTracker />
        <FeatureOpenTracker />
        <TrialAppGate />
      </Suspense>
      {children}
    </div>
  );
}
