/**
 * อ่านดวงจร (วัยจร + ปีจร) แบบเล่าเรื่อง — ไม่แปะพจนานุกรมสิบเทพ
 * ใช้ผลคำนวณเสาจาก engine เป็นกรอบ แล้วแปลเป็นภาษาคน
 */

export type CycleGodKey =
  | "เพื่อนแท้"
  | "เพื่อนท้า"
  | "ผู้สร้างสรรค์"
  | "ผู้แสดง"
  | "ทรัพย์จร"
  | "ทรัพย์ประจำ"
  | "ผู้ท้าทาย"
  | "อำนาจตำแหน่ง"
  | "อุปถัมภ์เฉียง"
  | "อุปถัมภ์";

type GodAngle = {
  /** ธีมช่วงยาว (วัยจร) */
  decade: string;
  /** มุมเมื่อเป็นปีจร */
  year: string;
  doTip: string;
  watchTip: string;
};

const GOD_ANGLE: Record<CycleGodKey, GodAngle> = {
  เพื่อนแท้: {
    decade:
      "ช่วงนี้ชีวิตดันให้ยืนบนเท้าตัวเอง ทำงานกับคนระดับเดียวกัน และรักษาอัตลักษณ์ให้ชัด",
    year: "ปีนี้เรื่องตัวตน การร่วมมือ และการแบ่งบทบาทจะชัดขึ้น",
    doTip: "รับงานที่ทำเองได้จริง และคุยขอบเขตกับทีมให้ชัด",
    watchTip: "อย่ารับภาระแทนคนอื่นจนแรงตัวเองหมด",
  },
  เพื่อนท้า: {
    decade:
      "ช่วงนี้มีการแข่งขัน แบ่งทรัพยากร และต้องพิสูจน์ฝีมือบ่อยขึ้น",
    year: "ปีนี้มีโอกาสแย่งจังหวะหรือแบ่งเค้กกับคนรอบตัว",
    doTip: "แข่งด้วยผลงานที่วัดได้ ไม่แข่งด้วยอารมณ์",
    watchTip: "ระวังทะเลาะเรื่องส่วนแบ่งจนเสียความสัมพันธ์ระยะยาว",
  },
  ผู้สร้างสรรค์: {
    decade:
      "ช่วงนี้เหมาะสร้างผลงานต่อเนื่อง ปล่อยของออกมา และสะสมฝีมือ",
    year: "ปีนี้มีช่องว่างให้ผลิตผลงานหรือบริการที่จับต้องได้",
    doTip: "ตั้งเป้าส่งมอบเป็นรอบสั้น ๆ ให้เห็นรูปบ่อย",
    watchTip: "อย่าเปิดโปรเจกต์ใหม่มากเกินจนไม่มีชิ้นไหนจบ",
  },
  ผู้แสดง: {
    decade:
      "ช่วงนี้ความคิดและการแสดงออกเด่น ชอบตั้งคำถามและอยากได้พื้นที่พูด",
    year: "ปีนี้เสียงของคุณมีน้ำหนักขึ้น ทั้งในงานและความสัมพันธ์",
    doTip: "ใช้การสื่อสารผลักไอเดียให้กลายเป็นข้อเสนอหรือผลงาน",
    watchTip: "อย่าเถียงเพื่อชนะจนพังความร่วมมือ",
  },
  ทรัพย์จร: {
    decade:
      "ช่วงนี้เงินและโอกาสมาแบบไม่คงที่ มีทั้งทางลัดและทางเสี่ยง",
    year: "ปีนี้จังหวะรายได้หรือดีลมีโอกาสขยับแบบฉับพลัน",
    doTip: "เก็บกำไรเป็นระบบ และแยกเงินเสี่ยงออกจากเงินใช้จริง",
    watchTip: "อย่าโยนเงินก้อนใหญ่ตามกระแสโดยไม่มีแผนสำรอง",
  },
  ทรัพย์ประจำ: {
    decade:
      "ช่วงนี้เน้นรายได้มั่นคง งานที่วัดผลได้ และการจัดการเงินเป็นระบบ",
    year: "ปีนี้เรื่องเงินเดือน ค่างาน หรือบัญชีจะถูกจับตาชัดขึ้น",
    doTip: "ทำให้ของที่มีอยู่สร้างรายได้ชัดเจน และปิดรายจ่ายรั่ว",
    watchTip: "อย่ารับงานถูกเกินจนคุณภาพและแรงตัวเองพัง",
  },
  ผู้ท้าทาย: {
    decade:
      "ช่วงนี้แรงกดดันและโจทย์ยากเข้ามาบ่อย ต้องตัดสินใจเร็วและรับผิดชอบหนัก",
    year: "ปีนี้มีโอกาสเจอบททดสอบ ตำแหน่งยาก หรือคนที่ท้าทายคุณ",
    doTip: "เลือกศึกที่คุ้ม แล้วทุ่มแรงทีละเรื่อง",
    watchTip: "อย่าฝืนสู้ทุกแนวพร้อมกันจนหมดแรง",
  },
  อำนาจตำแหน่ง: {
    decade:
      "ช่วงนี้บทบาท ความรับผิดชอบ และกติกาองค์กรมีผลกับชีวิตชัด",
    year: "ปีนี้ตำแหน่ง หน้าที่ หรือภาพลักษณ์ต่อคนอื่นถูกจับตามอง",
    doTip: "ทำตามที่รับปากให้ครบ และสื่อสารสถานะงานให้โปร่งใส",
    watchTip: "อย่ารับตำแหน่งหรือคำสัญญาที่ทำจริงไม่ได้",
  },
  อุปถัมภ์เฉียง: {
    decade:
      "ช่วงนี้ได้มุมความรู้เฉพาะทาง ครูแบบไม่ทางการ หรือทางลัดการเรียนรู้",
    year: "ปีนี้มีโอกาสเจอข้อมูล/คนชี้ทางที่นอกตำรา",
    doTip: "เก็บความรู้เป็นระบบ แล้วทดลองใช้กับงานจริง",
    watchTip: "อย่าเชื่อทุกคำแนะนำโดยไม่กรองกับเป้าหมายตัวเอง",
  },
  อุปถัมภ์: {
    decade:
      "ช่วงนี้ได้รับการพยุงจากความรู้ คนดูแล หรือสถาบันที่ให้ความมั่นคง",
    year: "ปีนี้เรื่องเรียน การรับรอง หรือผู้ใหญ่ที่ช่วยเหลือมีน้ำหนัก",
    doTip: "ใช้ช่วงนี้สะสมความรู้และเครือข่ายที่จริงจัง",
    watchTip: "อย่าพึ่งคนอื่นจนไม่ฝึกยืนเอง",
  },
};

function asGodKey(label: string): CycleGodKey {
  if (label in GOD_ANGLE) return label as CycleGodKey;
  return "เพื่อนแท้";
}

function strengthAdvice(status: string, favorLabels: string): {
  line: string;
  pace: string;
} {
  const weak = status.includes("อ่อน");
  const strong = status.includes("แข็ง") || status.includes("旺");
  if (weak) {
    return {
      line: favorLabels
        ? `ตอนนี้เจ้าชะตาค่อนข้างอ่อน — เกื้อด้วยธาตุ${favorLabels} และอย่าเปิดแนวรบหลายทาง`
        : "ตอนนี้เจ้าชะตาค่อนข้างอ่อน — เลือกลงแรงทีละเรื่อง และพักให้พอ",
      pace: "ช้าและชัดดีกว่าเร็วแล้วพัง",
    };
  }
  if (strong) {
    return {
      line: favorLabels
        ? `ตอนนี้เจ้าชะตามีแรง — ใช้ธาตุ${favorLabels}ช่วยพาแรงไปทางสร้างผล ไม่ไปทางปะทะ`
        : "ตอนนี้เจ้าชะตามีแรง — ใช้แรงสร้างผลที่วัดได้ ไม่ใช้แรงชนทุกเรื่อง",
      pace: "เดินหน้าได้ แต่ต้องมีขอบเขต",
    };
  }
  return {
    line: favorLabels
      ? `กำลังเจ้าชะตาค่อนข้างกลาง ๆ — ธาตุที่ช่วยสมดุลคือ ${favorLabels}`
      : "กำลังเจ้าชะตาค่อนข้างกลาง ๆ — รักษาจังหวะสม่ำเสมอจะได้ผลดีกว่าหักโหม",
    pace: "รักษาจังหวะสม่ำเสมอ",
  };
}

export type CycleNarrativeInput = {
  luck: null | {
    pillar: string;
    ageFrom: number;
    ageTo: number;
    stemGod: string;
    branchGod: string;
  };
  annual: {
    pillar: string;
    year: number;
    stemGod: string;
    branchGod: string;
  };
  strengthStatus: string;
  favorLabels: string;
};

export type CycleNarrative = {
  luck: null | {
    pillar: string;
    ageFrom: number;
    ageTo: number;
    stemGod: string;
    title: string;
    body: string;
  };
  annual: {
    pillar: string;
    year: number;
    stemGod: string;
    title: string;
    body: string;
  };
  combo: string;
};

/** สร้างคำอธิบายดวงจรแบบเล่าเรื่อง — คนละโปรไฟล์+ช่วงจร ได้ข้อความชุดเดียวกัน (deterministic) */
export function buildCycleNarrative(input: CycleNarrativeInput): CycleNarrative {
  const strength = strengthAdvice(input.strengthStatus, input.favorLabels);
  const annualKey = asGodKey(input.annual.stemGod);
  const annualAngle = GOD_ANGLE[annualKey];
  const annualBranchKey = asGodKey(input.annual.branchGod);
  const annualBranch = GOD_ANGLE[annualBranchKey];

  const luck = input.luck
    ? (() => {
        const stemKey = asGodKey(input.luck.stemGod);
        const branchKey = asGodKey(input.luck.branchGod);
        const stem = GOD_ANGLE[stemKey];
        const branch = GOD_ANGLE[branchKey];
        return {
          pillar: input.luck.pillar,
          ageFrom: input.luck.ageFrom,
          ageTo: input.luck.ageTo,
          stemGod: input.luck.stemGod,
          title: `ธีม 10 ปี · ${input.luck.pillar}`,
          body: `${stem.decade} พื้นหลังช่วงนี้ยังดึงเรื่อง「${input.luck.branchGod}」เข้ามาด้วย — ${branch.decade} ${strength.line}`,
        };
      })()
    : null;

  const annual = {
    pillar: input.annual.pillar,
    year: input.annual.year,
    stemGod: input.annual.stemGod,
    title: `ปีนี้ ${input.annual.year} · ${input.annual.pillar}`,
    body: `${annualAngle.year} ชั้นพื้นของปียังแตะเรื่อง「${input.annual.branchGod}」— ${annualBranch.year} จังหวะที่เหมาะคือ${strength.pace}`,
  };

  let combo: string;
  if (luck) {
    const luckKey = asGodKey(luck.stemGod);
    const luckAngle = GOD_ANGLE[luckKey];
    const sameFamily = luck.stemGod === annual.stemGod;
    const bridge = sameFamily
      ? `ปีนี้เดินในทิศเดียวกับธีม 10 ปีเรื่อง「${luck.stemGod}」— ยิ่งโฟกัสเรื่องนี้จะเห็นผลชัด`
      : `ธีม 10 ปีเอนไปทาง「${luck.stemGod}」ส่วนปีนี้เน้น「${annual.stemGod}」— ใช้ปีนี้เป็นจังหวะย่อยบนธีมใหญ่ ไม่ต้องทิ้งธีมหลัก`;
    combo = `${bridge}

ควรทำ: ${luckAngle.doTip} และ${annualAngle.doTip}

ควรระวัง: ${luckAngle.watchTip} ${annualAngle.watchTip}`;
  } else {
    combo = `ยังไม่อยู่ในช่วงวัยจรที่แสดงชัด — ใช้อ่านปีนี้เป็นหลักก่อน

ควรทำ: ${annualAngle.doTip}

ควรระวัง: ${annualAngle.watchTip}`;
  }

  return { luck, annual, combo };
}
