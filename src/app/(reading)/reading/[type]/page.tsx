import { Suspense } from "react";
import { ReadingForm } from "./reading-form";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function ReadingTypePage({ params }: PageProps) {
  const { type } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <ReadingForm type={type} />
    </Suspense>
  );
}
