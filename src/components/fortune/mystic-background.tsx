"use client";

import { cn } from "@/lib/utils";

interface MysticBackgroundProps {
  className?: string;
  intensity?: "soft" | "normal";
}

/** No-op — global StarfieldBackground in PhoneFrame is the shared page BG. */
export function MysticBackground({ className }: MysticBackgroundProps) {
  return <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden />;
}
