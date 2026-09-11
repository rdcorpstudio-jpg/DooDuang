// 子时: เปลี่ยนเสาวัน 00:00; เวลา 23:xx ใช้ก้านวันปฏิทินเดิมคำนวณเสาชั่วโมงด้วย。
// 节气: lunar-typescript 1.8.6 (ShouXing astronomy); เทียบเวลา UTC ของขอบ 12 节。
// ปีเริ่มที่立春; เดือนเริ่มที่节จริง; วันใช้ Gregorian JDN; ไม่ทำ true solar time。
// 藏干: 1 ก้าน=[1], 2=[0.7,0.3], 3=[0.6,0.3,0.1]; รวมกิ่งละ 1。
// 用神: 扶抑พื้นฐาน + เดือน/ราก/印比; เป็นเกณฑ์ตีความที่เปิดเผย ไม่ใช่ข้อยุติทุกสำนัก。

// Generated from src/ by scripts/make-single.mjs; runtime dependency: lunar-typescript@1.8.6.

// ---- types.ts ----
export type BaziInput = {
  birthDate: string;
  birthTime?: string;
  gender: "female" | "male" | "other";
  timezone?: string;
  birthPlace?: string;
};
export type BaziElement = "wood" | "fire" | "earth" | "metal" | "water";
export type BaziPolarity = "yang" | "yin";
export type BaziStem = { char: string; pinyin: string; th: string; element: BaziElement; polarity: BaziPolarity };
export type BaziBranch = { char: string; animal: string; stage: string; element: BaziElement; hiddenStems?: BaziStem[] };
export type BaziPillar = {
  key: "year" | "month" | "day" | "hour";
  label: string;
  stem: BaziStem;
  branch: BaziBranch;
  gods: { label: string; tone: string }[];
  isDayMaster?: boolean;
};
export type PillarIndices = { stem: number; branch: number; jiazi: number };
export type BaziChart = {
  input: { birthDate: string; birthTime: string; gender: string };
  meta?: {
    unknownTime?: boolean;
    timezone?: string;
    methodNotes?: string[];
    luckGenderRule?: string;
    engineVersion?: string;
    referenceInstant?: string;
    birthInstant?: string;
    yearBoundary?: string;
    monthBoundary?: string;
    warnings?: string[];
    solarTermSource?: string;
    luck?: { direction: "forward" | "backward"; boundary: string; boundaryName: string; distanceDays: number; startAgeYears: number; yearLengthDays: number };
    currentAnnual?: { year: number; pillar: string; startsAt: string; endsAt: string };
    annualBoundaries?: { year: number; startsAt: string; endsAt: string }[];
    hourSensitive?: string[];
    strength?: { method: string; supportShare: number; seasonSupport: number; rootSupport: number; score: number; thresholds: { weak: number; strong: number }; specialStructuresAssessed: false };
  };
  dayMaster: BaziStem;
  zodiac: { char: string; animal: string; element: BaziElement };
  lunarDate: string;
  pillars: BaziPillar[];
  elements: { id: BaziElement; label: string; count: number; color: string }[];
  strength: { status: string; statusZh: string; scoreLabel: string; favor: { id: BaziElement; label: string; color: string }[]; avoid: string };
  stars: { name: string; meaning: string }[];
  relations: { label: string; tone: string }[];
  specials: { label: string; value: string; note: string }[];
  luckPillars: { age: number; top: string; bottom: string; topColor: string; bottomColor: string; stem?: BaziStem; branch?: BaziBranch }[];
  annual: { year: number; top: string; bottom: string; topColor: string; bottomColor: string; god: string }[];
  deepMeaning: { dayMasterTitle: string; dayMasterBody: string; gods: { title: string; body: string }[] };
  currentCycleNote: string;
};

// ---- constants.ts ----
/** Recursive runtime immutability prevents a consumer from corrupting future charts. */
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export const ELEMENT_ORDER: readonly BaziElement[] = freeze(['wood', 'fire', 'earth', 'metal', 'water']);
export const ELEMENTS = freeze({
  wood: { label: 'ไม้', color: '#6dbf7a' }, fire: { label: 'ไฟ', color: '#e87a6a' },
  earth: { label: 'ดิน', color: '#d5b16f' }, metal: { label: 'ทอง', color: '#e8e4dc' },
  water: { label: 'น้ำ', color: '#6a9fd8' },
} as const);
export const STEMS: readonly BaziStem[] = freeze([
  { char: '甲', pinyin: 'Jia', th: 'ไม้ หยาง', element: 'wood', polarity: 'yang' },
  { char: '乙', pinyin: 'Yi', th: 'ไม้ หยิน', element: 'wood', polarity: 'yin' },
  { char: '丙', pinyin: 'Bing', th: 'ไฟ หยาง', element: 'fire', polarity: 'yang' },
  { char: '丁', pinyin: 'Ding', th: 'ไฟ หยิน', element: 'fire', polarity: 'yin' },
  { char: '戊', pinyin: 'Wu', th: 'ดิน หยาง', element: 'earth', polarity: 'yang' },
  { char: '己', pinyin: 'Ji', th: 'ดิน หยิน', element: 'earth', polarity: 'yin' },
  { char: '庚', pinyin: 'Geng', th: 'ทอง หยาง', element: 'metal', polarity: 'yang' },
  { char: '辛', pinyin: 'Xin', th: 'ทอง หยิน', element: 'metal', polarity: 'yin' },
  { char: '壬', pinyin: 'Ren', th: 'น้ำ หยาง', element: 'water', polarity: 'yang' },
  { char: '癸', pinyin: 'Gui', th: 'น้ำ หยิน', element: 'water', polarity: 'yin' },
]);
/** Hidden stems are ordered main, middle, residual; their weights total 1 per branch.
 * One stem [1]; two [0.7,0.3]; three [0.6,0.3,0.1]. These are declared
 * modelling weights, not a uniquely classical numerical law. Seasonal adjustment
 * is applied ONLY in the separate strength calculation, never in element counts. */
export const HIDDEN_WEIGHTS: Readonly<Record<number, readonly number[]>> = freeze({1:[1],2:[0.7,0.3],3:[0.6,0.3,0.1]});
export const BRANCHES = freeze([
  { char: '子', animal: 'หนู', element: 'water' as BaziElement, hidden: [9] },
  { char: '丑', animal: 'วัว', element: 'earth' as BaziElement, hidden: [5,9,7] },
  { char: '寅', animal: 'เสือ', element: 'wood' as BaziElement, hidden: [0,2,4] },
  { char: '卯', animal: 'กระต่าย', element: 'wood' as BaziElement, hidden: [1] },
  { char: '辰', animal: 'มังกร', element: 'earth' as BaziElement, hidden: [4,1,9] },
  { char: '巳', animal: 'งู', element: 'fire' as BaziElement, hidden: [2,4,6] },
  { char: '午', animal: 'ม้า', element: 'fire' as BaziElement, hidden: [3,5] },
  { char: '未', animal: 'แพะ', element: 'earth' as BaziElement, hidden: [5,3,1] },
  { char: '申', animal: 'ลิง', element: 'metal' as BaziElement, hidden: [6,8,4] },
  { char: '酉', animal: 'ไก่', element: 'metal' as BaziElement, hidden: [7] },
  { char: '戌', animal: 'สุนัข', element: 'earth' as BaziElement, hidden: [4,7,3] },
  { char: '亥', animal: 'หมู', element: 'water' as BaziElement, hidden: [8,0] },
]);
export const JIAZI: readonly string[] = freeze(Array.from({length:60},(_,i)=>STEMS[i%10].char+BRANCHES[i%12].char));
export const GODS = freeze([
  { zh:'比肩', label:'เพื่อนแท้', tone:'peer', meaning:'ธาตุเดียวและขั้วเดียวกับเจ้าชะตา สื่อถึงความเป็นตัวเองและการร่วมมือกับคนระดับเดียวกัน' },
  { zh:'劫财', label:'เพื่อนท้า', tone:'peer', meaning:'ธาตุเดียวต่างขั้ว สื่อถึงการแข่งขันและการแบ่งปันทรัพยากร' },
  { zh:'食神', label:'ผู้สร้างสรรค์', tone:'output', meaning:'ธาตุที่เจ้าชะตาส่งกำลังให้และขั้วเดียวกัน สื่อถึงการสร้างผลงานอย่างต่อเนื่อง' },
  { zh:'伤官', label:'ผู้แสดง', tone:'output', meaning:'ธาตุที่เจ้าชะตาส่งกำลังให้แต่ต่างขั้ว สื่อถึงการแสดงความคิดและตั้งคำถามกับข้อจำกัด' },
  { zh:'偏财', label:'ทรัพย์จร', tone:'wealth', meaning:'ธาตุที่เจ้าชะตาควบคุมและขั้วเดียวกัน สื่อถึงการจัดสรรทรัพยากรที่เปลี่ยนแปลง' },
  { zh:'正财', label:'ทรัพย์ประจำ', tone:'wealth', meaning:'ธาตุที่เจ้าชะตาควบคุมแต่ต่างขั้ว สื่อถึงการจัดการทรัพยากรอย่างเป็นระบบ' },
  { zh:'七杀', label:'ผู้ท้าทาย', tone:'officer', meaning:'ธาตุที่ควบคุมเจ้าชะตาและขั้วเดียวกัน สื่อถึงแรงผลักดันและความท้าทาย' },
  { zh:'正官', label:'อำนาจตำแหน่ง', tone:'officer', meaning:'ธาตุที่ควบคุมเจ้าชะตาแต่ต่างขั้ว สื่อถึงบทบาท ความรับผิดชอบ และกติกา' },
  { zh:'偏印', label:'อุปถัมภ์เฉียง', tone:'resource', meaning:'ธาตุที่ส่งกำลังให้เจ้าชะตาและขั้วเดียวกัน สื่อถึงการเรียนรู้เฉพาะทางและมุมมองที่ต่างออกไป' },
  { zh:'正印', label:'อุปถัมภ์', tone:'resource', meaning:'ธาตุที่ส่งกำลังให้เจ้าชะตาแต่ต่างขั้ว สื่อถึงความรู้ การดูแล และการสนับสนุน' },
]);
export const GROWTH_STAGES = freeze([
  {zh:'长生', th:'เริ่มก่อกำเนิด'}, {zh:'沐浴', th:'ชำระปรับตัว'}, {zh:'冠带', th:'เติบโตตั้งตัว'},
  {zh:'临官', th:'เข้ารับหน้าที่'}, {zh:'帝旺', th:'รุ่งเรืองสูงสุด'}, {zh:'衰', th:'เริ่มลดกำลัง'},
  {zh:'病', th:'กำลังถดถอย'}, {zh:'死', th:'สงบนิ่ง'}, {zh:'墓', th:'เก็บสะสม'},
  {zh:'绝', th:'สิ้นวัฏจักรเดิม'}, {zh:'胎', th:'ก่อตัวใหม่'}, {zh:'养', th:'บ่มเพาะ'},
]);
/** 阳顺阴逆; 戊随丙、己随丁 (fire/earth shared palaces convention). */
export const GROWTH_START = freeze([11,6,2,9,2,9,5,0,8,3]);
export const STEM_COMBINATIONS = freeze([
  {pair:[0,5],element:'earth'}, {pair:[1,6],element:'metal'}, {pair:[2,7],element:'water'},
  {pair:[3,8],element:'wood'}, {pair:[4,9],element:'fire'},
]);
export const STEM_CLASHES = freeze([[0,6],[1,7],[2,8],[3,9]]);
export const BRANCH_COMBINATIONS = freeze([
  {pair:[0,1],element:'earth'}, {pair:[2,11],element:'wood'}, {pair:[3,10],element:'fire'},
  {pair:[4,9],element:'metal'}, {pair:[5,8],element:'water'}, {pair:[6,7],element:'earth'},
]);
export const BRANCH_TRINES = freeze([
  {branches:[8,0,4],element:'water'}, {branches:[11,3,7],element:'wood'},
  {branches:[2,6,10],element:'fire'}, {branches:[5,9,1],element:'metal'},
]);
export const BRANCH_CLASHES = freeze([[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]]);
export const BRANCH_HARMS = freeze([[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]]);
export const BRANCH_BREAKS = freeze([[0,9],[1,4],[2,11],[3,6],[5,8],[7,10]]);
export const BRANCH_PUNISHMENTS = freeze([[2,5,8],[1,10,7]]);
export const SELF_PUNISHMENTS = freeze([4,6,9,11]);

// ---- converters.ts ----
export const mod = (n:number,m:number):number => ((n%m)+m)%m;
export function fromJiazi(index:number):PillarIndices {
  if (!Number.isInteger(index)) throw new RangeError('Jiazi index must be an integer');
  const jiazi=mod(index,60); return {stem:jiazi%10,branch:jiazi%12,jiazi};
}
export function toJiazi(stem:number,branch:number):number {
  if(!Number.isInteger(stem)||stem<0||stem>9||!Number.isInteger(branch)||branch<0||branch>11) throw new RangeError('Invalid stem/branch index');
  const index=JIAZI.indexOf(STEMS[stem].char+BRANCHES[branch].char);
  if(index<0) throw new RangeError('Stem and branch parity must match');
  return index;
}
export function tenGod(dayStem:number,targetStem:number):typeof GODS[number] {
  if(!STEMS[dayStem]||!STEMS[targetStem]) throw new RangeError('Invalid stem index');
  const dm=STEMS[dayStem], target=STEMS[targetStem];
  const delta=mod(ELEMENT_ORDER.indexOf(target.element)-ELEMENT_ORDER.indexOf(dm.element),5);
  return GODS[delta*2+(dm.polarity===target.polarity?0:1)];
}
export function growthStage(dayStem:number,branch:number):typeof GROWTH_STAGES[number] {
  if(!STEMS[dayStem]||!BRANCHES[branch]) throw new RangeError('Invalid stem/branch index');
  return GROWTH_STAGES[mod((branch-GROWTH_START[dayStem])*(dayStem%2===0?1:-1),12)];
}
export function branchFor(branch:number,dayStem:number):BaziBranch {
  const b=BRANCHES[branch], stage=growthStage(dayStem,branch);
  return {char:b.char,animal:b.animal,element:b.element,stage:`${stage.zh} · ${stage.th}`,hiddenStems:b.hidden.map(i=>({...STEMS[i]}))};
}
export function hourBranch(hour:number):number {
  if(!Number.isInteger(hour)||hour<0||hour>23) throw new RangeError('Hour must be 0–23');
  return Math.floor((hour+1)/2)%12;
}
/** 五鼠遁: 子-hour stem is twice the current CIVIL day-stem modulo five.
 * Both 23:xx and 00:xx use their respective civil day; never silently advance at 23. */
export function hourPillar(dayStem:number,hour:number):PillarIndices {
  if(!STEMS[dayStem]) throw new RangeError('Invalid day stem');
  const branch=hourBranch(hour), stem=((dayStem%5)*2+branch)%10;
  return {stem,branch,jiazi:toJiazi(stem,branch)};
}
export function dayVoid(dayIndex:number):number[] {
  const xun=Math.floor(fromJiazi(dayIndex).jiazi/10);
  return [mod(10-2*xun,12),mod(11-2*xun,12)];
}

// ---- calendar.ts ----
// 子时: day pillar changes at local civil midnight; 23:00 stays on the same day.
// 节气: lunar-typescript 1.8.6 / ShouXing astronomy, not fixed Gregorian dates.
// Solar-term fields encode fixed UTC+08; convert to UTC before comparisons.
// 藏干 weights and basic 扶抑用神 are documented in the interpretation module.
// Birth range: Gregorian 1900–2100; civil time, no true-solar-time correction.

import { Solar } from "lunar-typescript";

export const MIN_BIRTH_YEAR = 1900;
export const MAX_BIRTH_YEAR = 2100;
export const MIN_SOLAR_TERM_YEAR = 1899;
export const MAX_SOLAR_TERM_YEAR = 2200;
export const DAY_MS = 86_400_000;

export type CivilDateTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type ParsedBirth = Omit<CivilDateTime, "second"> & {
  time: string;
  timezone: string;
  unknownTime: boolean;
  instantMs: number;
};

export type SolarTerm = {
  name: string;
  instantMs: number;
  longitude: number;
  isJie: boolean;
};

/**
 * HKO's solar longitude definitions, in Gregorian-year order.
 * The 12 Jie (even indices here) open Bazi months; the Qi do not.
 * https://www.hko.gov.hk/en/gts/time/24solarterms.htm
 */
export const SOLAR_TERM_DEFINITIONS = Object.freeze([
  { name: "小寒", longitude: 285, isJie: true },
  { name: "大寒", longitude: 300, isJie: false },
  { name: "立春", longitude: 315, isJie: true },
  { name: "雨水", longitude: 330, isJie: false },
  { name: "惊蛰", longitude: 345, isJie: true },
  { name: "春分", longitude: 0, isJie: false },
  { name: "清明", longitude: 15, isJie: true },
  { name: "谷雨", longitude: 30, isJie: false },
  { name: "立夏", longitude: 45, isJie: true },
  { name: "小满", longitude: 60, isJie: false },
  { name: "芒种", longitude: 75, isJie: true },
  { name: "夏至", longitude: 90, isJie: false },
  { name: "小暑", longitude: 105, isJie: true },
  { name: "大暑", longitude: 120, isJie: false },
  { name: "立秋", longitude: 135, isJie: true },
  { name: "处暑", longitude: 150, isJie: false },
  { name: "白露", longitude: 165, isJie: true },
  { name: "秋分", longitude: 180, isJie: false },
  { name: "寒露", longitude: 195, isJie: true },
  { name: "霜降", longitude: 210, isJie: false },
  { name: "立冬", longitude: 225, isJie: true },
  { name: "小雪", longitude: 240, isJie: false },
  { name: "大雪", longitude: 255, isJie: true },
  { name: "冬至", longitude: 270, isJie: false },
].map((term) => Object.freeze(term)));

const TERM_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  DA_XUE: "大雪", DONG_ZHI: "冬至", XIAO_HAN: "小寒", DA_HAN: "大寒",
  LI_CHUN: "立春", YU_SHUI: "雨水", JING_ZHE: "惊蛰",
});

function checkedYear(year: number, min: number, max: number): void {
  if (!Number.isInteger(year) || year < min || year > max) {
    throw new RangeError(`Gregorian year must be an integer between ${min} and ${max}.`);
  }
}

/** Strict Gregorian validation: JavaScript's Date would otherwise normalize Feb 30. */
export function validateCivilDate(year: number, month: number, day: number): void {
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1) {
    throw new RangeError("Invalid Gregorian date.");
  }
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > days[month - 1]!) throw new RangeError("Invalid Gregorian date.");
}

function formatter(timezone: string): Intl.DateTimeFormat {
  if (typeof timezone !== "string" || timezone.length === 0) {
    throw new RangeError("timezone must be a valid IANA timezone name.");
  }
  try {
    return new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone: timezone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    });
  } catch {
    throw new RangeError(`Invalid or unsupported IANA timezone: ${timezone}.`);
  }
}

function partsWithFormatter(instantMs: number, fmt: Intl.DateTimeFormat): CivilDateTime {
  const values: Record<string, number> = {};
  for (const part of fmt.formatToParts(new Date(instantMs))) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return {
    year: values.year!, month: values.month!, day: values.day!,
    hour: values.hour!, minute: values.minute!, second: values.second!,
  };
}

/** Uses the host's Intl/IANA database, never the host's default timezone. */
export function localDateParts(instantMs: number, timezone: string): CivilDateTime {
  if (!Number.isFinite(instantMs) || Math.abs(instantMs) > 8.64e15) {
    throw new RangeError("instantMs must be a finite valid ECMAScript timestamp.");
  }
  return partsWithFormatter(instantMs, formatter(timezone));
}

function utcEncoding(p: CivilDateTime): number {
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/**
 * Resolve civil time without a timezone package. Sample offsets on both sides
 * of a possible timezone transition, construct all candidate UTC instants, and
 * round-trip each through Intl. Zero matches = a skipped clock time; multiple
 * matches = a repeated clock time. Both are rejected rather than silently
 * picking a birth instant. Bangkok has no DST during 1940–2100.
 * Historical second-level offsets (e.g. Bangkok before 1920) are preserved.
 */
export function civilToInstant(parts: CivilDateTime, timezone: string): number {
  validateCivilDate(parts.year, parts.month, parts.day);
  if (!Number.isInteger(parts.hour) || parts.hour < 0 || parts.hour > 23 ||
      !Number.isInteger(parts.minute) || parts.minute < 0 || parts.minute > 59 ||
      !Number.isInteger(parts.second) || parts.second < 0 || parts.second > 59) {
    throw new RangeError("Invalid civil time.");
  }
  const fmt = formatter(timezone);
  const wallMs = utcEncoding(parts);
  const offsets = new Set<number>();
  // ±48 h brackets even whole-day international-date-line transitions.
  for (let hours = -48; hours <= 48; hours += 6) {
    const sampleMs = wallMs + hours * 3_600_000;
    offsets.add(utcEncoding(partsWithFormatter(sampleMs, fmt)) - sampleMs);
  }
  const matches: number[] = [];
  for (const offsetMs of offsets) {
    const candidate = wallMs - offsetMs;
    const roundTrip = partsWithFormatter(candidate, fmt);
    if (utcEncoding(roundTrip) === wallMs) matches.push(candidate);
  }
  if (matches.length === 0) {
    throw new RangeError(`Nonexistent local birth time in ${timezone} (timezone clock gap).`);
  }
  if (matches.length > 1) {
    throw new RangeError(`Ambiguous local birth time in ${timezone} (timezone clock overlap).`);
  }
  return matches[0]!;
}

export function parseBirth(input: {
  birthDate: string; birthTime?: string; timezone?: string;
}): ParsedBirth {
  if (typeof input?.birthDate !== "string" || input.birthDate.length !== 10 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    throw new TypeError("birthDate must use Gregorian CE YYYY-MM-DD.");
  }
  const [year, month, day] = input.birthDate.split("-").map(Number) as [number, number, number];
  checkedYear(year, MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
  validateCivilDate(year, month, day);
  const unknownTime = input.birthTime === undefined;
  const time = unknownTime ? "12:00" : input.birthTime!;
  if (typeof time !== "string" || time.length !== 5 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new TypeError("birthTime must use HH:mm from 00:00 through 23:59.");
  }
  const [hour, minute] = time.split(":").map(Number) as [number, number];
  const timezone = input.timezone === undefined ? "Asia/Bangkok" : input.timezone;
  const instantMs = civilToInstant({ year, month, day, hour, minute, second: 0 }, timezone);
  return { year, month, day, hour, minute, time, timezone, unknownTime, instantMs };
}

/**
 * Astronomical implementation delegated only to pinned lunar-typescript 1.8.6.
 * It ports ShouXing's solar longitude solver with nutation/aberration and ΔT.
 * Its Solar values are fixed Chinese standard-time fields (UTC+08), NOT UTC
 * or historical Asia/Shanghai civil time. Never parse them using Date(string).
 * https://6tail.cn/calendar/lunar.jieqi.html
 * https://github.com/6tail/lunar-typescript/blob/master/src/lib/ShouXingUtil.ts
 * Precision to a displayed second is not a guarantee of absolute accuracy;
 * callers should flag births within a few minutes of a boundary for review.
 */
export function getSolarTerms(year: number): SolarTerm[] {
  checkedYear(year, MIN_SOLAR_TERM_YEAR, MAX_SOLAR_TERM_YEAR);
  // July always belongs to the requested Chinese lunar year, avoiding January
  // table-cycle ambiguities. The source table includes padding from both years.
  const table = Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable();
  const terms: SolarTerm[] = [];
  for (const [key, solar] of Object.entries(table)) {
    if (solar.getYear() !== year) continue;
    const name = TERM_ALIASES[key] ?? key;
    const definition = SOLAR_TERM_DEFINITIONS.find((term) => term.name === name);
    if (!definition) throw new Error(`Unknown astronomical solar term: ${key}.`);
    const instantMs = Date.UTC(
      solar.getYear(), solar.getMonth() - 1, solar.getDay(),
      solar.getHour(), solar.getMinute(), solar.getSecond(),
    ) - 8 * 3_600_000;
    if (!terms.some((term) => term.name === name)) terms.push({ ...definition, instantMs });
  }
  terms.sort((a, b) => a.instantMs - b.instantMs);
  if (terms.length !== 24 || terms.filter((term) => term.isJie).length !== 12) {
    throw new Error(`Incomplete solar-term ephemeris for ${year}.`);
  }
  return terms;
}

/** Proleptic Gregorian JDN at noon of the named civil date. No timezone involved. */
export function gregorianJdn(year: number, month: number, day: number): number {
  validateCivilDate(year, month, day);
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 甲子 = index 0. Epoch: Gregorian 2000-01-07, JDN 2451551, a 甲子 day.
 * Thus index = positiveModulo(JDN + 49, 60). At 23:xx this function receives
 * the original civil date, preserving the selected midnight day boundary.
 * JDN algorithm: https://aa.usno.navy.mil/faq/JD_formula
 * Cross-checked against independently published upstream EightChar fixtures.
 */
export function dayJiaziIndex(year: number, month: number, day: number): number {
  return ((gregorianJdn(year, month, day) + 49) % 60 + 60) % 60;
}

/**
 * Standard Chinese calendar label for the INPUT CIVIL DATE, matching ordinary
 * Gregorian→Chinese almanac tables (HKO), not a recalculated UTC+07 lunar
 * calendar. The lunar year changes at Chinese New Year; Bazi year changes at
 * Li Chun, so their year pillars can legitimately differ.
 * New-moon, leap-month, and month-length rules come from the pinned package.
 * https://www.hko.gov.hk/en/gts/time/conversion1_text.htm
 */
export function getLunarDate(year: number, month: number, day: number): string {
  checkedYear(year, MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
  validateCivilDate(year, month, day);
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
}

// ---- interpretation.ts ----
const POSITIONS = ['ปี', 'เดือน', 'วัน', 'เวลา'] as const;
const round = (value: number): number => Math.round(value * 1e10) / 1e10;
const elementItem = (id: BaziElement) => ({ id, ...ELEMENTS[id] });

/** These functions accept year/month/day/hour, with exactly four valid pillars. */
function checked(pillars: PillarIndices[]): void {
  if (pillars.length !== 4) throw new RangeError('Expected four pillars in year/month/day/hour order');
  for (const p of pillars) {
    if (toJiazi(p.stem, p.branch) !== p.jiazi) throw new RangeError('Inconsistent pillar indices');
  }
}

/** Each visible stem contributes 1, including the day master. Each branch
 * contributes a TOTAL of 1 via its hidden stems; do not add its main element again.
 * Main/middle/residual: 0.6/0.3/0.1; two hidden stems: 0.7/0.3; one: 1.
 * Thus the five element counts sum to 8. These explicit display weights are
 * engineering choices, not an ancient canonical quantitative energy measure. */
export function analyzeElements(pillars: PillarIndices[]): BaziChart['elements'] {
  checked(pillars);
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const p of pillars) {
    counts[STEMS[p.stem].element] += 1;
    const hidden = BRANCHES[p.branch].hidden;
    hidden.forEach((stem, i) => { counts[STEMS[stem].element] += HIDDEN_WEIGHTS[hidden.length][i]; });
  }
  return ELEMENT_ORDER.map(id => ({ ...elementItem(id), count: round(counts[id]) }));
}

/** Basic 扶抑 (support/suppress) model; NOT 格局, 從格, 化氣, 調候 or 通關.
 * No classical school defines one universal strength percentage.
 *
 * supportShare: peer + resource mass among THREE other visible stems and FOUR
 * branch qi totals, denominator 7. The day master is excluded from self-support.
 * seasonSupport: month main qi -> 旺 1, 相 .8, 休 .5, 囚 .25, 死 .1.
 * Earth-storage months use earth as main qi for the WHOLE solar month; this
 * model does not implement daily 人元司令 or the last-18-days school.
 * rootSupport: average same-ELEMENT hidden qi across four branches, [0,1].
 * score = .50 * supportShare + .30 * seasonSupport + .20 * rootSupport.
 * Below .42 weak; above .58 strong; inclusive middle interval approximately
 * balanced. We deliberately expose the raw components, thresholds and method.
 * A combination does not automatically transform qi; counts are never altered.
 */
export function analyzeStrength(pillars: PillarIndices[]): {
  strength: BaziChart['strength']; details: NonNullable<BaziChart['meta']>['strength'];
} {
  checked(pillars);
  const dm = STEMS[pillars[2].stem].element;
  const dmIndex = ELEMENT_ORDER.indexOf(dm);
  const resource = ELEMENT_ORDER[mod(dmIndex - 1, 5)];
  const output = ELEMENT_ORDER[mod(dmIndex + 1, 5)];
  const wealth = ELEMENT_ORDER[mod(dmIndex + 2, 5)];
  const officer = ELEMENT_ORDER[mod(dmIndex + 3, 5)];
  const supportive = (element: BaziElement): boolean => element === dm || element === resource;
  let support = 0;
  let roots = 0;
  pillars.forEach((p, position) => {
    if (position !== 2 && supportive(STEMS[p.stem].element)) support += 1;
    const hidden = BRANCHES[p.branch].hidden;
    hidden.forEach((stem, i) => {
      const weight = HIDDEN_WEIGHTS[hidden.length][i];
      const element = STEMS[stem].element;
      if (supportive(element)) support += weight;
      if (element === dm) roots += weight;
    });
  });
  const season = ELEMENT_ORDER.indexOf(BRANCHES[pillars[1].branch].element);
  // Offset measured from seasonal ruler to DM: 0 旺; 1 相; 2 死; 3 囚; 4 休.
  const seasonSupport = [1, .8, .1, .25, .5][mod(dmIndex - season, 5)];
  const supportShare = support / 7;
  const rootSupport = roots / 4;
  const score = .5 * supportShare + .3 * seasonSupport + .2 * rootSupport;
  const thresholds = { weak: .42, strong: .58 };
  const weak = score < thresholds.weak;
  const strong = score > thresholds.strong;
  const favor: BaziElement[] = weak ? [resource, dm] : strong ? [output, wealth, officer] : [];
  const avoid = weak
    ? `ตามแบบจำลอง扶抑เบื้องต้น ควรระวังการเพิ่ม${ELEMENTS[output].label}/${ELEMENTS[wealth].label}/${ELEMENTS[officer].label}มากเกินไป`
    : strong
      ? `ตามแบบจำลอง扶抑เบื้องต้น ควรระวังการเพิ่ม${ELEMENTS[resource].label}/${ELEMENTS[dm].label}มากเกินไป`
      : 'ค่อนข้างสมดุลในแบบจำลองนี้ ยังไม่กำหนดธาตุเสริมหรือเลี่ยงตายตัว';
  return {
    strength: {
      status: weak ? 'เจ้าชะตาอ่อน (ประเมินเบื้องต้น)' : strong ? 'เจ้าชะตาแข็ง (ประเมินเบื้องต้น)' : 'ค่อนข้างสมดุล (ประเมินเบื้องต้น)',
      statusZh: weak ? '身弱' : strong ? '身强' : '中和',
      scoreLabel: `ดัชนีกำลังหนุน ${(score * 100).toFixed(1)}/100 · แบบจำลอง扶抑`,
      favor: favor.map(elementItem),
      avoid,
    },
    details: {
      method: 'basic-fuyi-v1: 0.50*supportShare + 0.30*seasonSupport + 0.20*rootSupport; day-master excluded from support; no special structures',
      supportShare: round(supportShare), seasonSupport, rootSupport: round(rootSupport),
      score: round(score), thresholds, specialStructuresAssessed: false,
    },
  };
}

/** 天乙 table of 三命通會 卷三: 甲戊庚牛羊; 庚 is 丑未 here,
 * not the 寅午 variant. Day stem only, no daytime/nighttime subdivision. */
export const TIANYI: readonly (readonly number[])[] = Object.freeze([
  [1, 7], [0, 8], [9, 11], [9, 11], [1, 7], [0, 8], [1, 7], [2, 6], [3, 5], [3, 5],
].map(pair => Object.freeze(pair)));
/** Common day-stem 文昌 table: 辛子 variant, not the 辛戌 textual variant. */
export const WENCHANG: readonly number[] = Object.freeze([5, 6, 8, 9, 8, 9, 11, 0, 2, 3]);
/** 子平阳刃: yin stems have no 羊刃 under this explicitly chosen convention. */
export const YANGREN: Readonly<Record<number, number>> = Object.freeze({ 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 });
/** Keyed by branch modulo 4: water, metal, fire, wood trines. */
export const SHENSHA_TRINE_TARGETS = Object.freeze({
  huagai: Object.freeze([4, 1, 10, 7]),
  yima: Object.freeze([2, 11, 8, 5]),
  taohua: Object.freeze([9, 6, 3, 0]),
});

/** Formula-based symbolic stars, never a promise of wealth/illness/events.
 * Huagai/Yima/Taohua use both year AND day branch, reported with their reference
 * pillar, checking ALL four branches including that reference. In particular,
 * a storage-branch day may carry day-derived Huagai on its own pillar.
 * Tianyi/Wenchang/Yangren use the day stem, checking all four natal branches.
 */
export function detectStars(pillars: PillarIndices[]): BaziChart['stars'] {
  checked(pillars);
  const stars: BaziChart['stars'] = [];
  const trineStars = [
    { name: '华盖 · ดาวศิลป์', targets: SHENSHA_TRINE_TARGETS.huagai, meaning: 'สัญลักษณ์ของสมาธิ งานสร้างสรรค์ และการใคร่ครวญ' },
    { name: '驿马 · ดาวเดินทาง', targets: SHENSHA_TRINE_TARGETS.yima, meaning: 'สัญลักษณ์ของการเคลื่อนไหว การเดินทาง และการเปลี่ยนบริบท' },
    { name: '桃花 · ดาวเสน่ห์', targets: SHENSHA_TRINE_TARGETS.taohua, meaning: 'สัญลักษณ์ของการเข้าสังคม เสน่ห์ และความสัมพันธ์' },
  ];
  for (const rule of trineStars) {
    const hits: string[] = [];
    for (const reference of [0, 2]) {
      const branch = rule.targets[pillars[reference].branch % 4];
      const positions = pillars.flatMap((p, i) => p.branch === branch ? [POSITIONS[i]] : []);
      if (positions.length) hits.push(`อิงกิ่ง${POSITIONS[reference]} → ${BRANCHES[branch].char} ที่เสา${positions.join('/')}`);
    }
    if (hits.length) stars.push({ name: rule.name, meaning: `${rule.meaning}; ${hits.join('; ')}` });
  }
  const dayStem = pillars[2].stem;
  const blade = YANGREN[dayStem];
  const stemStars = [
    { name: '天乙贵人 · ผู้อุปถัมภ์', targets: TIANYI[dayStem], meaning: 'สัญลักษณ์ของความช่วยเหลือและผู้ชี้แนะ' },
    { name: '文昌 · ดาวการเรียนรู้', targets: [WENCHANG[dayStem]], meaning: 'สัญลักษณ์ของการศึกษา การเรียบเรียง และการสื่อสารด้วยภาษา' },
    { name: '羊刃 · ดาวพลังกล้า', targets: blade === undefined ? [] : [blade], meaning: 'สัญลักษณ์ของความมุ่งมั่นเข้มข้น ควรใช้ร่วมกับความยืดหยุ่น; ใช้กฎเฉพาะก้านหยาง' },
  ];
  for (const rule of stemStars) {
    const hits = pillars.flatMap((p, i) => rule.targets.includes(p.branch) ? [`${POSITIONS[i]}(${BRANCHES[p.branch].char})`] : []);
    if (hits.length) stars.push({ name: rule.name, meaning: `${rule.meaning}; อิงก้านวัน${STEMS[dayStem].char} พบที่เสา${hits.join('/')}` });
  }
  return stars;
}

/** Relations describe configurations only. 合/三合 is not proof of 化;
 * no automatic alteration of stems, elements, strength or future events.
 * The two three-branch punishments require all three; two present are explicitly
 * labelled incomplete rather than silently promoted into complete 三刑.
 */
export function detectRelations(pillars: PillarIndices[]): BaziChart['relations'] {
  checked(pillars);
  const result: BaziChart['relations'] = [];
  const samePair = (a: number, b: number, pair: readonly number[]) =>
    (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const a = pillars[i], b = pillars[j];
      const position = `${POSITIONS[i]}–${POSITIONS[j]}`;
      const stemPair = STEMS[a.stem].char + STEMS[b.stem].char;
      const branchPair = BRANCHES[a.branch].char + BRANCHES[b.branch].char;
      if (STEM_COMBINATIONS.some(rule => samePair(a.stem, b.stem, rule.pair)))
        result.push({ label: `天干合 ${stemPair} (${position}) · จับคู่ก้าน ยังไม่ตัดสินการแปรธาตุ`, tone: 'harmony' });
      if (STEM_CLASHES.some(pair => samePair(a.stem, b.stem, pair)))
        result.push({ label: `天干冲 ${stemPair} (${position}) · ก้านปะทะ`, tone: 'tension' });
      if (BRANCH_COMBINATIONS.some(rule => samePair(a.branch, b.branch, rule.pair)))
        result.push({ label: `六合 ${branchPair} (${position}) · กิ่งจับคู่ ยังไม่ตัดสินการแปรธาตุ`, tone: 'harmony' });
      const pairRules = [
        { pairs: BRANCH_CLASHES, name: '六冲', meaning: 'กิ่งปะทะ' },
        { pairs: BRANCH_HARMS, name: '六害', meaning: 'กิ่งขัดกัน' },
        { pairs: BRANCH_BREAKS, name: '六破', meaning: 'กิ่งรบกวนกัน' },
      ];
      for (const rule of pairRules) {
        if (rule.pairs.some(pair => samePair(a.branch, b.branch, pair)))
          result.push({ label: `${rule.name} ${branchPair} (${position}) · ${rule.meaning}`, tone: 'tension' });
      }
      if (samePair(a.branch, b.branch, [0, 3]))
        result.push({ label: `子卯相刑 ${branchPair} (${position}) · ความขัดแย้งเชิงสัญลักษณ์`, tone: 'tension' });
      if (a.branch === b.branch && SELF_PUNISHMENTS.includes(a.branch))
        result.push({ label: `自刑 ${branchPair} (${position}) · กิ่งเดิมซ้ำในกลุ่ม自刑`, tone: 'tension' });
    }
  }
  const branches = new Set(pillars.map(p => p.branch));
  for (const trine of BRANCH_TRINES) {
    if (trine.branches.every(b => branches.has(b))) {
      const chars = trine.branches.map(b => BRANCHES[b].char).join('');
      result.push({ label: `三合 ${chars} · กลุ่ม${ELEMENTS[trine.element as BaziElement].label}ครบสามกิ่ง ยังไม่ตัดสินการแปรธาตุ`, tone: 'harmony' });
    }
  }
  for (const triple of BRANCH_PUNISHMENTS) {
    const present = triple.filter(b => branches.has(b));
    if (present.length >= 2) {
      result.push({ label: `${present.length === 3 ? '三刑ครบสามกิ่ง' : '相刑บางส่วน (ยังไม่ครบ三刑)'} ${present.map(b => BRANCHES[b].char).join('')}`, tone: 'tension' });
    }
  }
  return result;
}

/** Common auxiliary-palace convention, NOT Zi Wei Dou Shu palaces.
 * Let m=solar Jie month number (寅=1 ... 丑=12), h=hour branch (子=0 ... 亥=11).
 * Ming: 子起正月逆至生月, 生时加其上顺数至卯 -> branch mod(4-m-h,12).
 * Shen: 子起正月顺至生月, 生时加其上逆数至酉 -> branch mod(m+h-10,12).
 * Both stems use 五虎遁 from the natal Li-Chun year stem. All use solar Jie
 * month, consistently; lunar-month and Zhongqi-month schools are not mixed in.
 * Taiyuan here is the popular month-stem+1/month-branch+3 shortcut. It is NOT
 * the actual-minus-300-days formula described in 三命通會 論胎元.
 */
export function buildSpecials(pillars: PillarIndices[]): BaziChart['specials'] {
  checked(pillars);
  const [year, month, day, hour] = pillars;
  const monthNumber = mod(month.branch - 2, 12) + 1;
  const mingBranch = mod(4 - monthNumber - hour.branch, 12);
  const shenBranch = mod(monthNumber + hour.branch - 10, 12);
  const auxiliary = (branch: number): string => {
    const stem = mod((year.stem % 5) * 2 + 2 + mod(branch - 2, 12), 10);
    return STEMS[stem].char + BRANCHES[branch].char;
  };
  const voids = dayVoid(day.jiazi);
  const voidHits = pillars.flatMap((p, i) => voids.includes(p.branch) ? [POSITIONS[i]] : []);
  return [
    {
      label: '空亡 · กิ่งว่างประจำวัน', value: voids.map(b => BRANCHES[b].char).join(''),
      note: `สองกิ่งที่เหลือจาก旬ของเสาวัน${STEMS[day.stem].char}${BRANCHES[day.branch].char}; ${voidHits.length ? `พบที่เสา${voidHits.join('/')}` : 'ไม่พบในกิ่งทั้งสี่'} ไม่ตีความว่าเป็นผลร้ายโดยลำพัง`,
    },
    {
      label: '胎元 · ไท่หยวน',
      value: STEMS[mod(month.stem + 1, 10)].char + BRANCHES[mod(month.branch + 3, 12)].char,
      note: 'ใช้สูตรย่อแพร่หลาย: ก้านเดือนเดินหน้า 1 และกิ่งเดือนเดินหน้า 3; ไม่ใช่วันปฏิสนธิจริงหรือวิธีถอยหลัง 300 วัน',
    },
    {
      label: '命宫 · วังชีวิต', value: auxiliary(mingBranch),
      note: 'ใช้เดือน节气 (寅=1) และ时辰: 子เริ่มเดือนแรก นับเดือนย้อน แล้วนับเวลาเดินหน้าถึง卯; ก้านตาม五虎遁ของปี立春',
    },
    {
      label: '身宫 · วังกาย', value: auxiliary(shenBranch),
      note: 'ใช้เดือน节气 (寅=1) และ时辰: 子เริ่มเดือนแรก นับเดือนเดินหน้า แล้วนับเวลาย้อนถึง酉; เป็นสูตรประกอบปาจื้อ ไม่ใช่วัง紫微斗数',
    },
  ];
}

// ---- index.ts ----
export const ENGINE_VERSION = '1.0.0';
/** Used ONLY to display continuous age/current decade; not to locate solar terms.
 * 3 elapsed days = 1 起运 year, with unrounded fractional age retained. */
export const AGE_YEAR_DAYS = 365.2425;
export const JIE_MONTHS = Object.freeze(['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒']);

export function liChun(year:number):SolarTerm {
  const term=getSolarTerms(year).find(t=>t.name==='立春');
  if(!term) throw new Error(`Missing Li Chun for ${year}`);
  return term;
}

/** Equality belongs to the new year: [Li Chun N, Li Chun N+1). */
export function solarYearAt(instantMs:number,timezone='Asia/Bangkok'):number {
  const year=localDateParts(instantMs,timezone).year;
  return instantMs>=liChun(year).instantMs?year:year-1;
}

function surroundingJie(year:number):SolarTerm[] {
  return [year-1,year,year+1].flatMap(getSolarTerms).filter(t=>t.isJie).sort((a,b)=>a.instantMs-b.instantMs);
}

export function fourPillars(birth:ParsedBirth): { pillars:PillarIndices[]; solarYear:number; monthBoundary:SolarTerm; yearBoundary:SolarTerm; jie:SolarTerm[] } {
  const solarYear=solarYearAt(birth.instantMs,birth.timezone);
  const year=fromJiazi(solarYear-4);
  const jie=surroundingJie(birth.year);
  const monthBoundary=jie.filter(t=>t.instantMs<=birth.instantMs).at(-1);
  if(!monthBoundary) throw new Error('No previous Jie available');
  const monthIndex=JIE_MONTHS.indexOf(monthBoundary.name);
  if(monthIndex<0) throw new Error('Invalid Jie month');
  // 五虎遁: 甲己年丙寅起, 乙庚年戊寅起, 丙辛年庚寅起, 丁壬年壬寅起, 戊癸年甲寅起.
  const monthStem=mod((year.stem%5)*2+2+monthIndex,10), monthBranch=mod(2+monthIndex,12);
  const month={stem:monthStem,branch:monthBranch,jiazi:toJiazi(monthStem,monthBranch)};
  const day=fromJiazi(dayJiaziIndex(birth.year,birth.month,birth.day));
  return {pillars:[year,month,day,hourPillar(day.stem,birth.hour)],solarYear,monthBoundary,yearBoundary:liChun(solarYear),jie};
}

export function buildLuck(pillars:PillarIndices[],birth:ParsedBirth,gender:BaziInput['gender'],jie:SolarTerm[]): {
  luckPillars:BaziChart['luckPillars']; details:NonNullable<NonNullable<BaziChart['meta']>['luck']>;
} {
  const male=gender!=='female', yang=pillars[0].stem%2===0;
  const forward=male===yang;
  // Only 节 (12 month openers), never 中气. Exact equality yields zero age.
  const target=forward?jie.find(t=>t.instantMs>=birth.instantMs):jie.filter(t=>t.instantMs<=birth.instantMs).at(-1);
  if(!target) throw new Error('Missing luck boundary');
  const distanceDays=Math.abs(target.instantMs-birth.instantMs)/DAY_MS;
  const startAgeYears=distanceDays/3;
  const luckPillars=Array.from({length:10},(_,i)=>{
    const p=fromJiazi(pillars[1].jiazi+(forward?1:-1)*(i+1)), stem={...STEMS[p.stem]}, branch=branchFor(p.branch,pillars[2].stem);
    return {age:startAgeYears+i*10,top:stem.char,bottom:branch.char,topColor:ELEMENTS[stem.element].color,bottomColor:ELEMENTS[branch.element].color,stem,branch};
  });
  return {luckPillars,details:{direction:forward?'forward':'backward',boundary:new Date(target.instantMs).toISOString(),boundaryName:target.name,distanceDays,startAgeYears,yearLengthDays:AGE_YEAR_DAYS}};
}

function annualRange(year:number):{year:number;startsAt:string;endsAt:string} {
  return {year,startsAt:new Date(liChun(year).instantMs).toISOString(),endsAt:new Date(liChun(year+1).instantMs).toISOString()};
}

function referenceMs(iso:string):number {
  // Accept explicit UTC only; forbid implementation-dependent date parsing.
  if(typeof iso!=='string'||iso.trim()!==iso||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(iso)) throw new TypeError('referenceInstant must be a UTC ISO string, e.g. 2026-09-11T00:00:00Z');
  const [year,month,day]=iso.slice(0,10).split('-').map(Number);
  validateCivilDate(year,month,day);
  const hour=Number(iso.slice(11,13)), minute=Number(iso.slice(14,16)), second=Number(iso.slice(17,19));
  if(hour>23||minute>59||second>59) throw new RangeError('Invalid referenceInstant time');
  const ms=Date.parse(iso);
  if(!Number.isFinite(ms)) throw new RangeError('Invalid referenceInstant');
  return ms;
}

/** Pure core. Same input + reference UTC instant => same chart (same Intl tzdb).
 * A clock argument is necessary because current-year annual rows cannot be a
 * pure function of unchanging birth data alone. Does not mutate the input. */
export function buildBaziChartAt(input:BaziInput,referenceInstant:string):BaziChart {
  const birth=parseBirth(input);
  if(!['male','female','other'].includes(input.gender)) throw new TypeError('gender must be male, female, or other');
  const now=referenceMs(referenceInstant), currentYear=localDateParts(now,birth.timezone).year;
  if(currentYear<1900||currentYear>2192) throw new RangeError('Reference year must be 1900–2192');
  const calc=fourPillars(birth), ps=calc.pillars, dm=ps[2].stem;
  const keys=['year','month','day','hour'] as const, labels=['ปี','เดือน','วัน','เวลา'];
  const pillars:BaziPillar[]=ps.map((p,i)=>{
    // Day's visible stem is the day master, not an additional peer god.
    // Order of remaining labels: visible stem (when non-day), then hidden stems.
    const godStems=i===2?BRANCHES[p.branch].hidden:[p.stem,...BRANCHES[p.branch].hidden];
    return {key:keys[i],label:labels[i],stem:{...STEMS[p.stem]},branch:branchFor(p.branch,dm),gods:godStems.map(s=>{const g=tenGod(dm,s);return {label:g.label,tone:g.tone};}),...(i===2?{isDayMaster:true}:{})};
  });
  const analysis=analyzeStrength(ps), luck=buildLuck(ps,birth,input.gender,calc.jie);
  const annualBoundaries=Array.from({length:8},(_,i)=>annualRange(currentYear+i));
  const annual:BaziChart['annual']=annualBoundaries.map(({year})=>{
    const p=fromJiazi(year-4), stem=STEMS[p.stem], branch=BRANCHES[p.branch];
    return {year,top:stem.char,bottom:branch.char,topColor:ELEMENTS[stem.element].color,bottomColor:ELEMENTS[branch.element].color,god:tenGod(dm,p.stem).label};
  });
  const activeYear=solarYearAt(now,birth.timezone), activeYearRange=annualRange(activeYear);
  const currentAnnual={...activeYearRange,pillar:JIAZI[mod(activeYear-4,60)]};
  const warnings:string[]=[];
  if(birth.unknownTime) warnings.push('ไม่ทราบเวลาเกิด: เสาเวลาใช้ 12:00 เป็นสมมติฐาน สมดุลธาตุ ดาว ความสัมพันธ์ และอายุเริ่มวัยจรจึงขึ้นกับสมมติฐานนี้');
  if(calc.jie.some(t=>Math.abs(t.instantMs-birth.instantMs)<=120_000)) warnings.push('เวลาเกิดอยู่ภายใน 2 นาทีจากขอบ节 ควรเทียบปฏิทินดาราศาสตร์และความเที่ยงของเวลาเกิดก่อนสรุปเสา');
  if(birth.unknownTime&&calc.jie.some(t=>{const p=localDateParts(t.instantMs,birth.timezone);return p.year===birth.year&&p.month===birth.month&&p.day===birth.day;})) warnings.push('วันเกิดตรงวันเปลี่ยน节และไม่ทราบเวลา: เสาเดือนหรือเสาปีอาจเปลี่ยนได้');
  const currentAge=(now-birth.instantMs)/(DAY_MS*AGE_YEAR_DAYS);
  const activeLuck=luck.luckPillars.find(l=>currentAge>=l.age&&currentAge<l.age+10);
  const currentCycleNote=currentAge<0?'วันอ้างอิงอยู่ก่อนวันเกิด จึงยังไม่มีวัยจรปัจจุบัน':activeLuck?
    `วัยจร ${activeLuck.top}${activeLuck.bottom} ช่วงอายุ ${activeLuck.age.toFixed(2)}–${(activeLuck.age+10).toFixed(2)} ปี · ปีจรปัจจุบัน ${currentAnnual.pillar} (เริ่มที่立春)`:
    currentAge<luck.details.startAgeYears?`ยังไม่เริ่มวัยจรแรก เริ่มประมาณอายุ ${luck.details.startAgeYears.toFixed(2)} ปี · ปีจรปัจจุบัน ${currentAnnual.pillar}`:
    `อายุปัจจุบันอยู่นอก 10 วัยจรที่แสดง · ปีจรปัจจุบัน ${currentAnnual.pillar}`;
  const presentGods=new Set(pillars.flatMap(p=>p.gods.map(g=>g.label)));
  return {
    input:{birthDate:input.birthDate,birthTime:birth.time,gender:input.gender},
    meta:{
      engineVersion:ENGINE_VERSION,unknownTime:birth.unknownTime,timezone:birth.timezone,
      luckGenderRule:input.gender==='other'?'treated_as_male':'traditional_binary',
      referenceInstant:new Date(now).toISOString(),birthInstant:new Date(birth.instantMs).toISOString(),
      yearBoundary:new Date(calc.yearBoundary.instantMs).toISOString(),monthBoundary:new Date(calc.monthBoundary.instantMs).toISOString(),
      solarTermSource:'lunar-typescript@1.8.6 / ShouXing',warnings,luck:luck.details,currentAnnual,annualBoundaries,strength:analysis.details,
      hourSensitive:birth.unknownTime?['pillars.hour','elements','strength','stars','relations','specials.命宫','specials.身宫','luckPillars.age']:[],
      methodNotes:[
        'ใช้วันเกรกอเรียนท้องถิ่น เปลี่ยนเสาวันที่ 00:00 และใช้ก้านวันเดียวกันคำนวณเสาชั่วโมง 23:xx ไม่มี true solar time',
        'ขอบปี立春และเดือน12节เป็นเวลาสากล; ค่า节气จากปฏิทินจีน UTC+08 ถูกแปลงเป็น UTC ก่อนเปรียบเทียบ',
        'lunarDate คือวันที่จันทรคติจีนมาตรฐานที่ตรงกับวันเกรกอเรียนท้องถิ่น ไม่ใช่สร้างปฏิทินจันทรคติไทยขึ้นใหม่; ปีจันทรคติเปลี่ยนที่ตรุษจีน',
        'zodiac ใช้กิ่งปีปาจื้อที่เปลี่ยนที่立春 จึงอาจต่างจากนักษัตรปีจันทรคติช่วงรอยต่อ',
        'ก้านฟ้าก้านละ1; 藏干ต่อกิ่งรวม1: ก้านเดียว1 / สองก้าน0.7,0.3 / สามก้าน0.6,0.3,0.1',
        '长生ใช้阳顺阴逆และ火土同宫; 羊刃ใช้เฉพาะก้านหยาง; 天乙ใช้甲戊庚พบ丑未',
        '身强弱และ扶抑用神เป็นแบบจำลองพื้นฐานที่อธิบายคะแนนได้ ไม่ประเมิน格局พิเศษ/从格/调候/化气; 合ไม่ทำให้แปลงธาตุอัตโนมัติ',
        'วัยจรใช้ระยะถึง节ถัดไปหรือก่อนหน้าเป็นวินาที÷86400÷3; อายุเริ่มเป็นปีทศนิยมและแต่ละวัยจร10ปี',
        'annual.year=N หมายถึงช่วง立春ปีNถึงก่อน立春ปีN+1; ก่อน立春ของปีปัจจุบันให้ใช้meta.currentAnnualดูปีจรที่กำลังมีผล',
        'currentCycleNote ใช้อายุจากเวลาที่ผ่านไป÷365.2425วันต่อปี; ไม่มีการปัดอายุเริ่มวัยจรก่อนเลือกช่วง',
        'gods เรียงก้านที่ปรากฏก่อน ตามด้วย藏干หลัก/รอง/เศษ; เสาวันไม่เพิ่ม比肩จากตัวเจ้าชะตาเอง',
      ],
    },
    dayMaster:{...STEMS[dm]},zodiac:{char:BRANCHES[ps[0].branch].char,animal:BRANCHES[ps[0].branch].animal,element:BRANCHES[ps[0].branch].element},
    lunarDate:getLunarDate(birth.year,birth.month,birth.day),pillars,elements:analyzeElements(ps),strength:analysis.strength,
    stars:detectStars(ps),relations:detectRelations(ps),specials:buildSpecials(ps),luckPillars:luck.luckPillars,annual,
    deepMeaning:{
      dayMasterTitle:`เจ้าชะตา ${STEMS[dm].char} · ${STEMS[dm].th}`,
      dayMasterBody:`ก้านวัน ${STEMS[dm].char} เป็นจุดอ้างอิงสิบเทพของดวงนี้ เดือน ${JIAZI[ps[1].jiazi]} เป็นหลักพิจารณาฤดูกาล ผลกำลังเจ้าชะตาอยู่ในกลุ่ม ${analysis.strength.status} ตามเกณฑ์扶抑พื้นฐาน รายละเอียดต้องอ่านร่วมกับก้าน ราก และความสัมพันธ์ทั้งดวง`,
      gods:GODS.filter(g=>presentGods.has(g.label)).map(g=>({title:`${g.label} (${g.zh})`,body:g.meaning})),
    },currentCycleNote,
  };
}

/** Drop-in API: the sole clock-reading adapter. Supply referenceInstant to
 * remain deterministic, or use buildBaziChartAt directly in pure pipelines.
 * No clock value is captured at module import (safe across year boundaries). */
export function buildBaziChart(input:BaziInput,options:{referenceInstant?:string}={}):BaziChart {
  return buildBaziChartAt(input,options.referenceInstant??new Date().toISOString());
}
