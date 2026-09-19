/**
 * Resolve birth place → IANA timezone + Thai region flavor.
 * Thailand is one civil zone (Asia/Bangkok); region still biases content.
 * International keywords map to common IANA zones for BaZi local time.
 */

export type BirthRegion =
  | "bangkok"
  | "central"
  | "north"
  | "northeast"
  | "south"
  | "east"
  | "west"
  | "international"
  | "unknown";

export type BirthPlaceResolved = {
  raw: string;
  normalized: string;
  timezone: string;
  region: BirthRegion;
  /** −1 … +1 flavor bias for day scores / copy seeds */
  regionBias: number;
  labelTh: string;
  /** True when we matched a non-default timezone (not just Bangkok default). */
  timezoneExplicit: boolean;
};

const DEFAULT_TZ = "Asia/Bangkok";

const REGION_BIAS: Record<BirthRegion, number> = {
  bangkok: 0.15,
  central: 0.1,
  north: -0.25,
  northeast: 0.2,
  south: -0.15,
  east: 0.05,
  west: -0.1,
  international: 0.35,
  unknown: 0,
};

const REGION_LABEL: Record<BirthRegion, string> = {
  bangkok: "กรุงเทพฯ",
  central: "ภาคกลาง",
  north: "ภาคเหนือ",
  northeast: "ภาคอีสาน",
  south: "ภาคใต้",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  international: "ต่างประเทศ",
  unknown: "ไม่ระบุ",
};

type Rule = { re: RegExp; region: BirthRegion; timezone?: string };

const PLACE_RULES: Rule[] = [
  // International first
  { re: /ญี่ปุ่น|tokyo|japan|大阪|osaka/i, region: "international", timezone: "Asia/Tokyo" },
  { re: /เกาหลี|korea|seoul|서울/i, region: "international", timezone: "Asia/Seoul" },
  { re: /ฮ่องกง|hong\s*kong/i, region: "international", timezone: "Asia/Hong_Kong" },
  { re: /จีน|beijing|shanghai|china|ปักกิ่ง|เซี่ยงไฮ้/i, region: "international", timezone: "Asia/Shanghai" },
  { re: /สิงคโปร์|singapore/i, region: "international", timezone: "Asia/Singapore" },
  { re: /มาเล|malaysia|kuala|kl\b/i, region: "international", timezone: "Asia/Kuala_Lumpur" },
  { re: /เวียดนาม|vietnam|hanoi|saigon|โฮจิมินห์/i, region: "international", timezone: "Asia/Ho_Chi_Minh" },
  { re: /พม่า|myanmar|yangon|rangoon/i, region: "international", timezone: "Asia/Yangon" },
  { re: /ลาว|laos|vientiane/i, region: "international", timezone: "Asia/Vientiane" },
  { re: /กัมพูชา|cambodia|phnom/i, region: "international", timezone: "Asia/Phnom_Penh" },
  { re: /ดูไบ|dubai|uae|emirates/i, region: "international", timezone: "Asia/Dubai" },
  { re: /อินเดีย|india|delhi|mumbai/i, region: "international", timezone: "Asia/Kolkata" },
  { re: /ออสเตรเลีย|australia|sydney|melbourne/i, region: "international", timezone: "Australia/Sydney" },
  { re: /ลอนดอน|london|อังกฤษ|uk\b|britain/i, region: "international", timezone: "Europe/London" },
  { re: /ฝรั่งเศส|paris|france/i, region: "international", timezone: "Europe/Paris" },
  { re: /เยอรมน|berlin|germany/i, region: "international", timezone: "Europe/Berlin" },
  { re: /อเมริก|usa|united\s*states|new\s*york|los\s*angeles|california/i, region: "international", timezone: "America/New_York" },
  { re: /แคนาดา|canada|toronto|vancouver/i, region: "international", timezone: "America/Toronto" },

  // Thailand regions
  { re: /กรุงเทพ|bangkok|bkk|กทม/i, region: "bangkok" },
  {
    re: /เชียงใหม่|เชียงราย|ลำปาง|ลำพูน|แพร่|น่าน|พะเยา|แม่ฮ่องสอน|เชียง|north/i,
    region: "north",
  },
  {
    re: /ขอนแก่น|อุดร|อุบล|นครราชสีมา|โคราข|บุรีรัมย์|สุรินทร์|ศรีสะเกษ|ร้อยเอ็ด|มหาสารคาม|กาฬสินธุ์|สกล|นครพนม|มุกดาหาร|ยโสธร|อำนาจ|หนองคาย|หนองบัว|เลย|ชัยภูมิ|อีสาน|isan|isaan/i,
    region: "northeast",
  },
  {
    re: /ภูเก็ต|สงขลา|หาดใหญ่|นครศรี|สุราษฎร์|กระบี่|พังงา|ตรัง|พัทลุง|สตูล|ยะลา|ปัตตานี|นราธิวาส|ชุมพร|ระนอง|ภาคใต้|phuket|hat\s*yai/i,
    region: "south",
  },
  {
    re: /ชลบุรี|พัทยา|ระยอง|จันทบุรี|ตราด|ฉะเชิงเทรา|ปราจีน|สระแก้ว|ภาคตะวันออก|pattaya/i,
    region: "east",
  },
  {
    re: /กาญจนบุรี|ราชบุรี|เพชรบุรี|ประจวบ|ตาก|ภาคตะวันตก/i,
    region: "west",
  },
  {
    re: /อยุธยา|อ่างทอง|ลพบุรี|สิงห์บุรี|ชัยนาท|สระบุรี|นนทบุรี|ปทุม|สมุทร|นครปฐม|สุพรรณ|นครสวรรค์|อุทัย|กำแพงเพชร|พิษณุโลก|สุโขทัย|พิจิตร|เพชรบูรณ์|ภาคกลาง/i,
    region: "central",
  },
];

function normalizePlace(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^จ\.?\s*/i, "")
    .replace(/^จังหวัด\s*/i, "");
}

export function resolveBirthPlace(place?: string | null): BirthPlaceResolved {
  const raw = (place ?? "").trim();
  if (!raw) {
    return {
      raw: "",
      normalized: "",
      timezone: DEFAULT_TZ,
      region: "unknown",
      regionBias: 0,
      labelTh: REGION_LABEL.unknown,
      timezoneExplicit: false,
    };
  }

  const normalized = normalizePlace(raw);
  for (const rule of PLACE_RULES) {
    if (rule.re.test(normalized) || rule.re.test(raw)) {
      const timezone = rule.timezone ?? DEFAULT_TZ;
      return {
        raw,
        normalized,
        timezone,
        region: rule.region,
        regionBias: REGION_BIAS[rule.region],
        labelTh:
          rule.region === "international"
            ? normalized
            : `${REGION_LABEL[rule.region]} · ${normalized}`,
        timezoneExplicit: Boolean(rule.timezone),
      };
    }
  }

  // Unmatched Thai-looking text → Bangkok zone, central flavor
  return {
    raw,
    normalized,
    timezone: DEFAULT_TZ,
    region: "central",
    regionBias: REGION_BIAS.central,
    labelTh: normalized,
    timezoneExplicit: false,
  };
}

export function timezoneFromBirthPlace(place?: string | null): string {
  return resolveBirthPlace(place).timezone;
}
