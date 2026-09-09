import type { HandNatureId } from "@/lib/fortune/scan/types";

/** Palm hand-nature artwork (square art by element) */
export const HAND_ELEMENT_ART: Record<HandNatureId, string> = {
  earth: "/images/elements/earth.jpg",
  air: "/images/elements/air.jpg",
  fire: "/images/elements/fire.jpg",
  water: "/images/elements/water.jpg",
};

export function handElementArt(nature: HandNatureId | string | undefined) {
  if (nature === "earth" || nature === "air" || nature === "fire" || nature === "water") {
    return HAND_ELEMENT_ART[nature];
  }
  return HAND_ELEMENT_ART.earth;
}
