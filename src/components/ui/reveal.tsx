"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "glow";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "reveal-up",
  scale: "reveal-scale",
  glow: "reveal-glow",
};

export function useRevealMounted(delayMs = 40) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return mounted;
}

export function Reveal({
  visible,
  delay = 0,
  variant = "up",
  className,
  children,
}: {
  visible: boolean;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(VARIANT_CLASS[variant], visible && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Staggers direct children on mount — works wrapping server-rendered pages. */
export function AnimatedPage({
  children,
  className,
  delayMs = 40,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const mounted = useRevealMounted(delayMs);

  return (
    <div className={cn("stagger-in", mounted && "is-visible", className)}>
      {children}
    </div>
  );
}

/** Soft route enter used by layout templates. */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-transition h-full">{children}</div>;
}
