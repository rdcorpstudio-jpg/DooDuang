import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";
import { SiteVisitTracker } from "@/components/analytics/site-visit-tracker";
import { TrialAppGate } from "@/components/auth/trial-app-gate";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col sacred-page-bg">
      <Suspense fallback={null}>
        <SiteVisitTracker />
        <FeatureOpenTracker />
        <TrialAppGate />
      </Suspense>
      <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {children}
      </main>
    </div>
  );
}
