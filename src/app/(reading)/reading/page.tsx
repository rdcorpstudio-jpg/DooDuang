import { Suspense } from "react";
import { ReadingWizard } from "@/components/fortune/reading-wizard";

export default function ReadingPage() {
  return (
    <Suspense fallback={<div className="relative h-full" aria-hidden />}>
      <ReadingWizard />
    </Suspense>
  );
}
