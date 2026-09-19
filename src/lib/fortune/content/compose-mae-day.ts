import type { FortuneTone } from "@/lib/fortune/analyze";
import type { DayMarker } from "@/lib/fortune/auspicious-calendar";
import library from "@/lib/fortune/content/maemangmee-daily-library.json";
import { getZodiacByBirthDate } from "@/lib/fortune/zodiac";

export type MaeToneLabel = "หนุนเต็มที่" | "ระวัง" | "เปราะบาง";

export type MaeAspectId = "work" | "money" | "love" | "health" | "luck";

const TONE_TO_LABEL: Record<FortuneTone, MaeToneLabel> = {
  high: "หนุนเต็มที่",
  mid: "ระวัง",
  low: "เปราะบาง",
};

const WEEKDAY_IDS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const ASPECT_LABEL: Record<MaeAspectId, string> = {
  work: "การงาน",
  money: "การเงิน",
  love: "ความรัก",
  health: "สุขภาพ",
  luck: "โชค",
};

const COLOR_HEX: Record<string, string> = {
  กรมท่า: "#1e3a5f",
  ฟ้าน้ำทะเล: "#2a6f8f",
  ฟ้าหม่น: "#6a8fa8",
  ฟ้าสด: "#3db4e6",
  ฟ้า: "#6eb5e0",
  น้ำเงินเข้ม: "#2f4f8f",
  เขียวมะกอก: "#6b7c3a",
  เขียวเข้ม: "#1f6b45",
  เขียวหยก: "#2f8f6b",
  เขียวนีออน: "#39ff14",
  เขียว: "#3d9b6a",
  แดงอิฐ: "#b04a3a",
  แดงไวน์: "#7a2436",
  แดงสด: "#d44545",
  ส้มไหม้: "#c45c28",
  ส้มอิฐ: "#c56a3a",
  ส้มสด: "#e87840",
  ชมพูกุหลาบ: "#e891b0",
  ชมพูหม่น: "#d9a0b0",
  ชมพูสด: "#ff6fae",
  ชมพู: "#e891b0",
  ครีมอุ่น: "#f0e0c8",
  น้ำตาลอ่อน: "#c4a484",
  น้ำตาลเข้ม: "#6b4a32",
  เหลืองมัสตาร์ด: "#c9a23a",
  เหลืองสด: "#f0c020",
  เหลือง: "#e0b84a",
  ขาวนวล: "#f3efe6",
  ขาวจ้า: "#ffffff",
  ขาว: "#f5f5f5",
  เทาเงิน: "#9aa4b2",
  เทาเข้ม: "#4a5563",
  ทองอ่อน: "#d5b16f",
  ทองเงา: "#e6c76a",
  ม่วงพลัม: "#7a4a72",
  ม่วงเข้ม: "#4a2d6b",
  ม่วง: "#7b5ea7",
  ดำสนิท: "#141416",
  ดำ: "#2a2a2e",
  เบจ: "#d9c7a8",
  เงินเงา: "#c0c8d4",
  เงิน: "#b8c0cc",
  พีช: "#e8a878",
};

function hexForColorName(name: string): string {
  if (COLOR_HEX[name]) return COLOR_HEX[name]!;
  // Longest-key match (e.g. "ม่วงเข้ม" before "ม่วง")
  const keys = Object.keys(COLOR_HEX).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (name.includes(key)) return COLOR_HEX[key]!;
  }
  return "#6b7280";
}

function parseColorNames(text: string): string[] {
  const skip =
    /^(ธาตุ|เหมาะ|อารมณ์|สีแรง|ดึง|พัก|ลด|แสง|พลัง|เติม|ลุค)/;
  return text
    .split(/[·+,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length <= 18 && !skip.test(s));
}

function colorsFromText(text: string): { name: string; hex: string }[] {
  const names = parseColorNames(text).slice(0, 2);
  return names.map((name) => ({
    name,
    hex: hexForColorName(name),
  }));
}

function firstColorName(text: string) {
  return parseColorNames(text)[0] ?? "ทองอ่อน";
}

/** แปลงบรรทัดคลังสี → คำแนะนำที่ขึ้นต้นด้วยสีจริง */
function adviceFromSupportLine(line: string): string {
  const parts = line
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const color = parts[0] ?? "สีมงคล";
  const element = parts[1];
  const rest = parts.slice(2).join(" · ");
  if (rest && element) return `${color}รับกับ${element} — ${rest}`;
  if (rest) return `${color} — ${rest}`;
  if (element) return `${color}รับกับ${element} วันนี้`;
  return line;
}

/** เลือกโน้ตที่พูดถึงสีของกลุ่มก่อน — ไม่ให้หัวสีกับเนื้อหาคนละเรื่อง */
function pickNoteForColors(
  pool: readonly string[],
  seed: string,
  salt: string,
  colors: { name: string }[],
): string {
  const names = colors.map((c) => c.name).filter(Boolean);
  const matched = pool.filter((n) => names.some((name) => n.includes(name)));
  const picked = matched.length
    ? pick(matched, seed, salt)
    : pick(pool, seed, salt);
  const lead = names.join(" · ");
  if (!lead) return picked;
  if (names.some((name) => picked.includes(name))) return picked;
  return `โทน${lead} — ${picked}`;
}

type Lib = typeof library;

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function pick<T>(arr: readonly T[], seed: string, salt: string): T {
  if (!arr.length) throw new Error(`Empty pool: ${salt}`);
  return arr[hashSeed(`${seed}::${salt}`) % arr.length]!;
}

/** สรุปบนการ์ดดวงวันนี้ — ไม่เกิน ~3 บรรทัดบนมือถือ */
const MAX_DAY_SUMMARY_CHARS = 96;

function clampDaySummary(text: string, max = MAX_DAY_SUMMARY_CHARS): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const cut = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf("ๆ"));
  const base = (cut > max * 0.55 ? slice.slice(0, cut) : slice).trimEnd();
  return /[…。.!?]$/.test(base) ? base : `${base}…`;
}

function bangkokParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"), // Mon, Tue, …
  };
}

function yearThemeIndex(birthYear: number, asOfYear: number) {
  const cycle = ((asOfYear - birthYear) % 12 + 12) % 12;
  return cycle; // 0..11 → yearThemes[i]
}

export function fortuneToneToMaeLabel(tone: FortuneTone): MaeToneLabel {
  return TONE_TO_LABEL[tone];
}

export function maeUiMicrocopy() {
  return library.uiMicrocopy;
}

export function pickMaeMarkerHint(marker: DayMarker, seed: string, dayIso: string) {
  const pack = (library.markerPacks as Lib["markerPacks"])[marker];
  return {
    label: pack.label,
    hint: pick(pack.hints, seed, `marker:${marker}:${dayIso}`),
  };
}

export function pickMaeAspectLine(
  aspect: MaeAspectId,
  tone: FortuneTone,
  seed: string,
  dayIso: string
) {
  const label = fortuneToneToMaeLabel(tone);
  const pool = library.aspectPools[aspect][label] as string[];
  return pick(pool, seed, `aspect:${aspect}:${label}:${dayIso}`);
}

export type MaeComposedDay = {
  dayIso: string;
  premium: boolean;
  dayCard: {
    title: string;
    summary: string;
    cautions: string[];
    doNow: string;
    avoid: string;
  };
  dailyAspects: Array<{
    id: MaeAspectId;
    label: string;
    tone: FortuneTone;
    toneLabel: MaeToneLabel;
    body: string;
  }>;
  luckyShirt: {
    todaySupportLabel: string;
    todayColorName: string;
    todayColorHex: string;
    /** คำแนะนำสีเด่นวันนี้ — ตรงกับ todayColorName เสมอ */
    todayNote: string;
    groups: Array<{
      id: string;
      label: string;
      forbidden?: boolean;
      colorsText: string;
      colors: { name: string; hex: string }[];
      note: string;
    }>;
  };
  auspiciousToday: {
    signalLabel: string;
    dayName: string;
    dayHint: string;
    goodWindow: { label: string; time: string; status: MaeToneLabel; hint: string };
    avoidWindow: { label: string; time: string; status: MaeToneLabel; hint: string };
    elementLine: string;
    locationNote?: string;
  };
  yearTheme: Lib["yearThemes"][number];
  monthTheme: Lib["monthThemes"][number];
  weekdayTheme: Lib["weekdayThemes"][number];
};

/**
 * Compose Mae daily copy from the 12-year piece library.
 * Same birth signature + date → same result (deterministic).
 * Premium depth: time / place / focus reshape the seed.
 */
export function composeMaeDay(opts: {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  nickname?: string;
  gender?: string;
  focus?: string;
  asOf?: Date;
  premium?: boolean;
  aspectTones?: Partial<Record<MaeAspectId, FortuneTone>>;
  markers?: DayMarker[];
}): MaeComposedDay {
  const asOf = opts.asOf ?? new Date();
  const parts = bangkokParts(asOf);
  const dayIso = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  const birthYear = Number(opts.birthDate.slice(0, 4)) || 2000;
  const placeKey = (opts.birthPlace ?? "").trim() || "no-place";
  const timeKey = (opts.birthTime ?? "").trim() || "unknown-time";
  const focusKey = opts.focus ?? "life";
  const seed = [
    opts.birthDate,
    timeKey,
    placeKey,
    opts.nickname ?? "",
    opts.gender ?? "",
    focusKey,
    "mae-day",
    dayIso,
  ].join("::");
  const zodiac = getZodiacByBirthDate(opts.birthDate);
  const premium = Boolean(opts.premium);

  const yearTheme =
    library.yearThemes[yearThemeIndex(birthYear, parts.year)] ??
    library.yearThemes[0]!;
  const monthTheme =
    library.monthThemes.find((m) => m.id === parts.month) ??
    library.monthThemes[parts.month - 1] ??
    library.monthThemes[0]!;

  const wdKey =
    (WEEKDAY_IDS.includes(parts.weekday as (typeof WEEKDAY_IDS)[number])
      ? parts.weekday
      : WEEKDAY_IDS[asOf.getDay()]) as string;
  const weekdayTheme =
    library.weekdayThemes.find((w) => w.id === wdKey) ??
    library.weekdayThemes[0]!;

  const title = pick(library.dayTitlePools, seed, "title");
  const cautionA = pick(library.cautionPools, seed, "caution-a");
  let cautionB = pick(library.cautionPools, seed, "caution-b");
  if (cautionB === cautionA) {
    cautionB = pick(library.cautionPools, seed, "caution-b2");
  }
  const doNow = pick(library.actionPools.doNow, seed, "action-do");
  let avoidAction = pick(library.actionPools.avoid, seed, "action-avoid");
  if (avoidAction === doNow) {
    avoidAction = pick(library.actionPools.avoid, seed, "action-avoid-2");
  }

  const defaultTones: Record<MaeAspectId, FortuneTone> = {
    work: "high",
    money: "mid",
    love: "low",
    health: "mid",
    luck: "high",
    ...opts.aspectTones,
  };

  // Soft bias from weekday theme
  if (weekdayTheme.toneBias === "หนุนเต็มที่") defaultTones.work = "high";
  if (weekdayTheme.toneBias === "ระวัง") defaultTones.money = "mid";
  if (weekdayTheme.toneBias === "เปราะบาง") defaultTones.love = "low";

  const aspectOrder: MaeAspectId[] = (() => {
    switch (focusKey) {
      case "work":
        return ["work", "money", "luck", "health", "love"];
      case "money":
        return ["money", "work", "luck", "love", "health"];
      case "love":
        return ["love", "health", "luck", "work", "money"];
      case "health":
        return ["health", "love", "luck", "work", "money"];
      default:
        return ["luck", "work", "money", "love", "health"];
    }
  })();

  const dailyAspects = aspectOrder.map((id) => {
    const tone = defaultTones[id];
    const toneLabel = fortuneToneToMaeLabel(tone);
    return {
      id,
      label: ASPECT_LABEL[id],
      tone,
      toneLabel,
      body: pickMaeAspectLine(id, tone, seed, dayIso),
    };
  });

  /** วันหนุนดีไม่ต้องมีข้อระวังทุกวัน — 0 / 1 / 2 ตามโทนวัน */
  const lowCount = dailyAspects.filter((a) => a.tone === "low").length;
  const midCount = dailyAspects.filter((a) => a.tone === "mid").length;
  const biasWeight =
    weekdayTheme.toneBias === "หนุนเต็มที่"
      ? 0
      : weekdayTheme.toneBias === "ระวัง"
        ? 1
        : 2;
  const cautionScore =
    biasWeight + lowCount + (midCount >= 3 ? 1 : 0) + (hashSeed(`${seed}::caution-n`) % 2);
  const cautionCount =
    cautionScore <= 1 ? 0 : cautionScore <= 3 ? 1 : 2;
  const cautions: string[] =
    cautionCount === 0
      ? []
      : cautionCount === 1
        ? [cautionA]
        : [
            cautionA,
            premium
              ? pick(library.cautionPools, seed, "caution-premium")
              : cautionB,
          ];

  const supportLine = pick(library.shirtPools.supportColors, seed, "shirt-support");
  const forbidLine = pick(library.shirtPools.forbiddenPairs, seed, "shirt-forbid");

  const workColors = colorsFromText(
    pick(library.shirtPools.supportColors, seed, "shirt-work")
  );
  const moneyColors = colorsFromText(
    pick(library.shirtPools.supportColors, seed, "shirt-money")
  );
  const luckColors = colorsFromText(
    pick(library.shirtPools.supportColors, seed, "shirt-luck")
  );
  const loveColors = colorsFromText(
    pick(library.shirtPools.supportColors, seed, "shirt-love")
  );
  const forbidColors = colorsFromText(forbidLine);

  const noteWork = pickNoteForColors(
    library.shirtPools.notes["หนุนงาน"],
    seed,
    "note-work",
    workColors,
  );
  const noteMoney = pickNoteForColors(
    library.shirtPools.notes["หนุนเงิน"],
    seed,
    "note-money",
    moneyColors,
  );
  const noteLuck = pickNoteForColors(
    library.shirtPools.notes["หนุนโชค"],
    seed,
    "note-luck",
    luckColors,
  );
  const noteLove = pickNoteForColors(
    library.shirtPools.notes["หนุนรัก"],
    seed,
    "note-love",
    loveColors,
  );
  const todayColorName = firstColorName(supportLine);
  const todayNote = adviceFromSupportLine(supportLine);

  const primaryMarker = (opts.markers ?? []).find((m) =>
    ["chaos", "victory", "fortune", "holy"].includes(m)
  ) as DayMarker | undefined;
  const markerMeta = primaryMarker
    ? pickMaeMarkerHint(primaryMarker, seed, dayIso)
    : {
        label: "จังหวะของวันนี้",
        hint: pick(library.auspiciousWindowPools.good, seed, "day-hint-fallback"),
      };

  const goodLine = pick(library.auspiciousWindowPools.good, seed, "window-good");
  const avoidLine = pick(library.auspiciousWindowPools.avoid, seed, "window-avoid");

  // Stable window hours from seed
  const h = hashSeed(`${seed}::windows`);
  const goodStart = 8 + (h % 3); // 8–10
  const goodEnd = goodStart + 2;
  const avoidStart = 14 + ((h >>> 3) % 3); // 14–16
  const avoidEnd = Math.min(21, avoidStart + 3 + ((h >>> 5) % 2));

  const fmt = (n: number) => `${String(n).padStart(2, "0")}:00`;
  const goodTime = `${fmt(goodStart)}-${fmt(goodEnd)}`;
  const avoidTime = `${fmt(avoidStart)}-${fmt(avoidEnd)}`;

  // สรุปบนการ์ด: ไม่เกิน ~3 บรรทัด — ไม่ต่อหลายท่อน
  let summary: string;
  if (premium) {
    summary = clampDaySummary(
      pick(library.premiumModifiers, seed, "premium-mod"),
    );
  } else {
    summary = clampDaySummary(
      `${weekdayTheme.titlePattern} ${monthTheme.do}`,
    );
  }

  const dayCard = {
    title: premium
      ? pick(library.dayTitlePools, seed, "title-premium")
      : title,
    summary,
    cautions,
    doNow,
    avoid: avoidAction,
  };

  return {
    dayIso,
    premium,
    dayCard,
    dailyAspects,
    luckyShirt: {
      todaySupportLabel: "สีที่หนุนวันนี้",
      todayColorName,
      todayColorHex: hexForColorName(todayColorName),
      todayNote,
      groups: [
        {
          id: "forbidden",
          label: "สีพักวันนี้",
          forbidden: true,
          colorsText: forbidColors.map((c) => c.name).join(" · "),
          colors: forbidColors,
          note: forbidLine.includes("·")
            ? forbidLine
            : `โทน${forbidColors.map((c) => c.name).join(" · ")} วันนี้ยังไม่ค่อยเหมาะ — ${forbidLine}`,
        },
        {
          id: "work",
          label: "หนุนงาน",
          colorsText: workColors.map((c) => c.name).join(" · "),
          colors: workColors,
          note: noteWork,
        },
        {
          id: "money",
          label: "หนุนเงิน",
          colorsText: moneyColors.map((c) => c.name).join(" · "),
          colors: moneyColors,
          note: noteMoney,
        },
        {
          id: "luck",
          label: "หนุนโชค",
          colorsText: luckColors.map((c) => c.name).join(" · "),
          colors: luckColors,
          note: noteLuck,
        },
        {
          id: "love",
          label: "หนุนรัก",
          colorsText: loveColors.map((c) => c.name).join(" · "),
          colors: loveColors,
          note: noteLove,
        },
      ],
    },
    auspiciousToday: {
      signalLabel: "จังหวะของวันนี้",
      dayName: markerMeta.label,
      dayHint: markerMeta.hint,
      goodWindow: {
        label: "ช่วงฤกษ์ดี",
        time: goodTime,
        status: "หนุนเต็มที่",
        hint: goodLine,
      },
      avoidWindow: {
        label: "ช่วงชะลอ",
        time: avoidTime,
        status: "ระวัง",
        hint: avoidLine,
      },
      elementLine: `ธาตุประจำตัวของคุณ · ${zodiac.element}`,
      locationNote:
        opts.birthPlace?.trim()
          ? `คำนวณร่วมกับที่เกิด · ${opts.birthPlace.trim()}`
          : premium
            ? "เพิ่มสถานที่เกิดแล้วดวงจะละเอียดขึ้น"
            : undefined,
    },
    yearTheme,
    monthTheme,
    weekdayTheme,
  };
}
