"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  getInAppBrowserKind,
  openInExternalBrowser,
  type InAppBrowserKind,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

/** In-app WebView (LINE/FB): single handoff button — no copy / no copy */
export function OpenInBrowserBanner({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [kind, setKind] = useState<InAppBrowserKind>(null);

  useEffect(() => {
    setKind(getInAppBrowserKind());
  }, []);

  if (!kind) return null;

  return (
    <button
      type="button"
      onClick={() => openInExternalBrowser()}
      className={cn(
        "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#241C4F] font-semibold text-white outline-none transition active:scale-[0.99]",
        compact ? "h-10 text-[13px]" : "h-11 text-[14px]",
        className
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
      เปิดในเบราว์เซอร์หลัก
    </button>
  );
}
