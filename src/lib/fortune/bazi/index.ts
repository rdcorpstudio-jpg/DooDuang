/** Classical Bazi engine — re-export for app UI. */
export {
  buildBaziChart,
  buildBaziChartAt,
  ENGINE_VERSION,
  ELEMENTS,
  ELEMENT_ORDER,
  STEMS,
  BRANCHES,
} from "@/lib/fortune/bazi/buildBaziChart";

export type {
  BaziInput,
  BaziChart,
  BaziElement,
  BaziPolarity,
  BaziStem,
  BaziBranch,
  BaziPillar,
} from "@/lib/fortune/bazi/buildBaziChart";

import { ELEMENTS } from "@/lib/fortune/bazi/buildBaziChart";
import type { BaziElement } from "@/lib/fortune/bazi/buildBaziChart";

export function elementColor(id: BaziElement) {
  return ELEMENTS[id].color;
}
