import type { FortuneTone } from "@/lib/fortune/analyze";
import type {
  FaceAspectCopy,
  FaceAspectId,
  FaceShapeCopy,
  FaceShapeId,
  HandNatureCopy,
  HandNatureId,
  PalmLineCopy,
  PalmLineId,
} from "@/lib/fortune/scan/types";
import library from "@/lib/fortune/content/face-palm-library-th.json";

/** คลังโหงวเฮ้ง + ลายมือ — จาก DooDuang-face-palm-th.json */
const FACE_SHAPES = library.faceReading.faceShapes as Record<
  FaceShapeId,
  Record<FortuneTone, FaceShapeCopy>
>;

const FACE_ASPECTS = library.faceReading.aspects as Record<
  FaceAspectId,
  Record<FortuneTone, FaceAspectCopy>
>;

const PALM_LINES = library.palmReading.lines as Record<
  PalmLineId,
  Record<FortuneTone, PalmLineCopy>
>;

const HAND_NATURES = library.palmReading.handNatures as Record<
  HandNatureId,
  HandNatureCopy
>;

export const FACE_SHAPE_LABEL_TH: Record<FaceShapeId, string> = {
  oval: "หน้ามนสมส่วน",
  long: "หน้ายาวสง่า",
  heart: "หน้าหัวใจ",
  square: "หน้าเหลี่ยมมั่นคง",
};

export const PALM_LINE_LABEL_TH: Record<PalmLineId, string> = {
  life: "เส้นชีวิต",
  heart: "เส้นหัวใจ",
  head: "เส้นสมอง",
};

export const HAND_NATURE_LABEL_TH: Record<HandNatureId, string> = {
  earth: "มือดิน",
  air: "มือลม",
  fire: "มือไฟ",
  water: "มือน้ำ",
};

export function pickFaceShapeCopy(shape: FaceShapeId, tone: FortuneTone) {
  return FACE_SHAPES[shape][tone];
}

export function pickFaceAspectCopy(id: FaceAspectId, tone: FortuneTone) {
  return FACE_ASPECTS[id][tone];
}

export function pickPalmLineCopy(id: PalmLineId, tone: FortuneTone) {
  return PALM_LINES[id][tone];
}

export function pickHandNatureCopy(id: HandNatureId) {
  return HAND_NATURES[id];
}
