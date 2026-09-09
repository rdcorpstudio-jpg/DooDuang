"use client";

import { PageTransition } from "@/components/ui/reveal";

/** Remounts on every route change — soft enter for the whole app. */
export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
