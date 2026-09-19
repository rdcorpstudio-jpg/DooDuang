import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Secondary content — collapsed until the user opens it. */
export function MoreDetails({
  title,
  children,
  className,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={cn("group rounded-[18px] px-3.5 py-3", className)}
      style={{
        background: "rgba(16,24,39,0.45)",
        boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.28)",
      }}
      open={defaultOpen || undefined}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-1 text-[14px] font-semibold leading-snug text-[#e8d19a] outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-[#d5b16f]/45 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 transition duration-200 group-open:rotate-180"
          strokeWidth={2.2}
        />
      </summary>
      <div className="mt-3 space-y-3.5">{children}</div>
    </details>
  );
}
