import { Suspense } from "react";
import { ReadingWizard } from "@/components/fortune/reading-wizard";

export default function ReadingPage() {
  return (
    <Suspense fallback={<div className="relative h-full bg-[#0a0e18]" aria-hidden />}>
      <ReadingWizard />
    </Suspense>
  );
}
