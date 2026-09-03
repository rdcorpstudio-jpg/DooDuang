"use client";

import { PageTransition } from "@/components/ui/reveal";

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
