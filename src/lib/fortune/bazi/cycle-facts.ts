/**
 * Facts for AI cycle reading — engine numbers only; prose comes from the model.
 */

import type { BaziChart } from "@/lib/fortune/bazi/buildBaziChart";
import {
  BRANCHES,
  BRANCH_BREAKS,
  BRANCH_CLASHES,
  BRANCH_COMBINATIONS,
  BRANCH_HARMS,
  BRANCH_PUNISHMENTS,
  ELEMENTS,
  SELF_PUNISHMENTS,
  STEM_CLASHES,
  STEM_COMBINATIONS,
  STEMS,
  tenGod,
} from "@/lib/fortune/bazi/buildBaziChart";

export type CycleHitKind =
  | "合"
  | "冲"
  | "刑"
  | "害"
  | "破"
  | "伏吟"
  | "天干合"
  | "天干冲";

export type CycleRelationHit = {
  kind: CycleHitKind;
  /** Chinese pair chars for engine audit */
  pair: string;
  /** natal pillar label e.g. วัน / เดือน */
  withNatal: string;
  /** Short Thai life hint — AI may rewrite */
  lifeHint: string;
};

export type CyclePillarFacts = {
  pillar: string;
  stem: string;
  branch: string;
  stemElement: string;
  branchElement: string;
  stemGod: string;
  branchGod: string;
  elementVsDayMaster: "ส่งเสริม" | "กลาง" | "ควรระวัง";
  hits: CycleRelationHit[];
};

export type BaziCycleFacts = {
  annualYear: number;
  cycleKey: string;
  dayMaster: string;
  dayMasterElement: string;
  strengthStatus: string;
  favorElements: string[];
  avoidNote: string;
  luck: null | (CyclePillarFacts & {
    ageFrom: number;
    ageTo: number;
  });
  annual: CyclePillarFacts & { year: number };
  natalPillars: string[];
};

const NATAL_LABELS = ["ปี", "เดือน", "วัน", "เวลา"] as const;

const HIT_LIFE: Record<CycleHitKind, string> = {
  合: "มีจังหวะเชื่อมต่อ รวมพลัง หรือผูกพันกับเรื่อง/คนที่เกี่ยวข้อง",
  冲: "มีจังหวะเปลี่ยนแปลง สภาพแวดล้อมหรือบทบาทขยับแรงกว่าปกติ",
  刑: "มีแรงเสียดสี กดดัน หรือต้องปรับกติกากับคนรอบตัว",
  害: "อาจรู้สึกถูกเบียดหรือไม่สบายใจในความสัมพันธ์/ความร่วมมือ",
  破: "เรื่องที่เคยมั่นคงอาจถูกรบกวน ต้องจัดระเบียบใหม่",
  伏吟: "ธีมเดิมซ้ำเข้ามาอีกครั้ง — ทบทวนของค้างก่อนเปิดของใหม่",
  天干合: "มีแรงดึงดูดหรือโอกาสจับคู่ในระดับความคิด/บทบาท",
  天干冲: "แนวคิดหรือทิศทางปะทะกัน ต้องเลือกข้างให้ชัด",
};

function samePair(a: number, b: number, pair: readonly number[]) {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function elementStance(
  element: keyof typeof ELEMENTS,
  favorIds: string[],
  avoidText: string,
): "ส่งเสริม" | "กลาง" | "ควรระวัง" {
  const label = ELEMENTS[element].label;
  if (favorIds.includes(element) || favorIds.includes(label)) return "ส่งเสริม";
  if (avoidText.includes(label)) return "ควรระวัง";
  return "กลาง";
}

function hitsAgainstNatal(
  natal: { stem: number; branch: number; jiazi: number }[],
  stemIdx: number,
  branchIdx: number,
): CycleRelationHit[] {
  const hits: CycleRelationHit[] = [];
  const push = (
    kind: CycleHitKind,
    pair: string,
    withNatal: string,
  ) => {
    hits.push({ kind, pair, withNatal, lifeHint: HIT_LIFE[kind] });
  };

  for (let i = 0; i < natal.length; i++) {
    const n = natal[i];
    const label = NATAL_LABELS[i] ?? `เสา${i}`;
    const branchPair = BRANCHES[branchIdx].char + BRANCHES[n.branch].char;
    const stemPair = STEMS[stemIdx].char + STEMS[n.stem].char;

    if (stemIdx === n.stem && branchIdx === n.branch) {
      push("伏吟", stemPair + branchPair.slice(1), label);
    }
    if (STEM_COMBINATIONS.some((r) => samePair(stemIdx, n.stem, r.pair))) {
      push("天干合", stemPair, label);
    }
    if (STEM_CLASHES.some((p) => samePair(stemIdx, n.stem, p))) {
      push("天干冲", stemPair, label);
    }
    if (BRANCH_COMBINATIONS.some((r) => samePair(branchIdx, n.branch, r.pair))) {
      push("合", branchPair, label);
    }
    if (BRANCH_CLASHES.some((p) => samePair(branchIdx, n.branch, p))) {
      push("冲", branchPair, label);
    }
    if (BRANCH_HARMS.some((p) => samePair(branchIdx, n.branch, p))) {
      push("害", branchPair, label);
    }
    if (BRANCH_BREAKS.some((p) => samePair(branchIdx, n.branch, p))) {
      push("破", branchPair, label);
    }
    if (samePair(branchIdx, n.branch, [0, 3])) {
      push("刑", branchPair, label);
    }
    if (branchIdx === n.branch && SELF_PUNISHMENTS.includes(branchIdx)) {
      push("刑", branchPair, label);
    }
  }

  for (const triple of BRANCH_PUNISHMENTS) {
    const natalSet = new Set(natal.map((p) => p.branch));
    if (!triple.includes(branchIdx)) continue;
    const present = triple.filter((b) => b === branchIdx || natalSet.has(b));
    if (present.length >= 2) {
      push(
        "刑",
        present.map((b) => BRANCHES[b].char).join(""),
        "หลายเสา",
      );
    }
  }

  // de-dupe by kind+pair+withNatal
  const seen = new Set<string>();
  return hits.filter((h) => {
    const k = `${h.kind}|${h.pair}|${h.withNatal}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function pillarIndicesFromChart(chart: BaziChart) {
  return chart.pillars.map((p) => {
    const stem = STEMS.findIndex((s) => s.char === p.stem.char);
    const branch = BRANCHES.findIndex((b) => b.char === p.branch.char);
    return {
      stem,
      branch,
      jiazi: stem >= 0 && branch >= 0 ? ((stem % 10) + (branch % 12) * 0) : 0,
    };
  });
}

function buildPillarFacts(
  pillar: string,
  dmStemIdx: number,
  favorIds: string[],
  avoidNote: string,
  natal: { stem: number; branch: number; jiazi: number }[],
): CyclePillarFacts | null {
  if (pillar.length < 2) return null;
  const stemChar = pillar[0];
  const branchChar = pillar[1];
  const stemIdx = STEMS.findIndex((s) => s.char === stemChar);
  const branchIdx = BRANCHES.findIndex((b) => b.char === branchChar);
  if (stemIdx < 0 || branchIdx < 0) return null;
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  const hiddenMain = branch.hidden[0];
  return {
    pillar,
    stem: stem.char,
    branch: branch.char,
    stemElement: ELEMENTS[stem.element].label,
    branchElement: ELEMENTS[branch.element].label,
    stemGod: tenGod(dmStemIdx, stemIdx).label,
    branchGod: tenGod(dmStemIdx, hiddenMain).label,
    elementVsDayMaster: elementStance(
      stem.element,
      favorIds,
      avoidNote,
    ),
    hits: hitsAgainstNatal(natal, stemIdx, branchIdx),
  };
}

/** Snapshot of 大运 + 流年 for prompts / caching key. */
export function buildBaziCycleFacts(chart: BaziChart): BaziCycleFacts | null {
  const annualYear = chart.meta?.currentAnnual?.year;
  const annualPillar = chart.meta?.currentAnnual?.pillar;
  if (!annualYear || !annualPillar) return null;

  const dmStemIdx = STEMS.findIndex((s) => s.char === chart.dayMaster.char);
  if (dmStemIdx < 0) return null;

  const favorIds = chart.strength.favor.map((f) => f.id);
  const avoidNote = chart.strength.avoid || "";
  const natal = pillarIndicesFromChart(chart).filter(
    (p) => p.stem >= 0 && p.branch >= 0,
  );

  const luckMeaning = chart.currentCycleMeaning.luck;
  const luck = luckMeaning
    ? (() => {
        const base = buildPillarFacts(
          luckMeaning.pillar,
          dmStemIdx,
          favorIds,
          avoidNote,
          natal,
        );
        if (!base) return null;
        return {
          ...base,
          ageFrom: luckMeaning.ageFrom,
          ageTo: luckMeaning.ageTo,
        };
      })()
    : null;

  const annual = buildPillarFacts(
    annualPillar,
    dmStemIdx,
    favorIds,
    avoidNote,
    natal,
  );
  if (!annual) return null;

  const cycleKey = `${luck?.pillar ?? "none"}|${annualYear}|${annualPillar}`;

  return {
    annualYear,
    cycleKey,
    dayMaster: chart.dayMaster.char,
    dayMasterElement: ELEMENTS[chart.dayMaster.element].label,
    strengthStatus: chart.strength.status,
    favorElements: chart.strength.favor.map((f) => f.label),
    avoidNote,
    luck,
    annual: { ...annual, year: annualYear },
    natalPillars: chart.pillars.map(
      (p) => `${p.label}:${p.stem.char}${p.branch.char}`,
    ),
  };
}
