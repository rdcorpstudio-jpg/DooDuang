import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";
import { SiteVisitTracker } from "@/components/analytics/site-visit-tracker";

export default function StoryLoginHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteVisitTracker />
        <FeatureOpenTracker />
      </Suspense>
      {children}
    </>
  );
}
