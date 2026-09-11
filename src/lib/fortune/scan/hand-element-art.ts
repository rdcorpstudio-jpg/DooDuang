import type { HandNatureId } from "@/lib/fortune/scan/types";

/** Palm hand-nature artwork (square art by element) */
export const HAND_ELEMENT_ART: Record<HandNatureId, string> = {
  earth: "/images/elements/earth.webp",
  air: "/images/elements/air.webp",
  fire: "/images/elements/fire.webp",
  water: "/images/elements/water.webp",
};

export function handElementArt(nature: HandNatureId | string | undefined) {
  if (nature === "earth" || nature === "air" || nature === "fire" || nature === "water") {
    return HAND_ELEMENT_ART[nature];
  }
  return HAND_ELEMENT_ART.earth;
}
