import { Suspense } from "react";
import { FeatureOpenTracker } from "@/components/analytics/feature-open-tracker";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col sacred-page-bg">
      <Suspense fallback={null}>
        <FeatureOpenTracker />
      </Suspense>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
