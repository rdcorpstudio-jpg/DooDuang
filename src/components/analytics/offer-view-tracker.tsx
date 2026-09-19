"use client";

import { useEffect } from "react";
import { trackOfferView } from "@/lib/analytics/client";

/** Fire offer_view on dedicated price / package screens. */
export function OfferViewTracker({ path }: { path: string }) {
  useEffect(() => {
    trackOfferView({ path });
  }, [path]);
  return null;
}
