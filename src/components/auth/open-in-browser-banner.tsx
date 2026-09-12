"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import {
  copyPageUrl,
  getInAppBrowserKind,
  openInExternalBrowser,
  type InAppBrowserKind,
} from "@/lib/browser/in-app-browser";
import { cn } from "@/lib/utils";

/** In-app WebView (IG/LINE/FB): action buttons only — no essay */
export function OpenInBrowserBanner({
  className,
  compact = false,
  pageUrl,
}: {
  className?: string;
  compact?: boolean;
  /** Prefer login handoff URL when opening from auth buttons */
  pageUrl?: string;
}) {
  const [kind, setKind] = useState<InAppBrowserKind>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setKind(getInAppBrowserKind());
  }, []);

  if (!kind) return null;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => openInExternalBrowser(pageUrl)}
        className={cn(
          "mae-gold-cta inline-flex w-full items-center justify-center gap-1.5 rounded-full font-semibold outline-none transition active:scale-[0.99]",
          compact ? "h-10 text-[13px]" : "h-11 text-[14px]"
        )}
      >
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.2} />
        เปิดในเบราว์เซอร์หลัก
      </button>
      <button
        type="button"
        onClick={() => {
          void (async () => {
            const ok = await copyPageUrl(pageUrl);
            if (!ok) return;
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          })();
        }}
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-full font-semibold text-[#e8d19a] outline-none transition active:scale-[0.99]",
          compact ? "h-9 text-[12px]" : "h-10 text-[13px]"
        )}
        style={{
          background: "rgba(16,24,39,0.55)",
          boxShadow: "inset 0 0 0 1px rgba(213,177,111,0.35)",
        }}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
        {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
      </button>
    </div>
  );
}
