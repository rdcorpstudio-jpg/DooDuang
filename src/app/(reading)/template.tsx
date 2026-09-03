"use client";

import { PageTransition } from "@/components/ui/reveal";

export default function ReadingTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
