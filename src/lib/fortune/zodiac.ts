export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface ZodiacInfo {
  id: ZodiacSign;
  name: string;
  thaiName: string;
  symbol: string;
  element: string;
  dateRange: string;
}

export const ZODIAC_SIGNS: ZodiacInfo[] = [
  {
    id: "aries",
    name: "Aries",
    thaiName: "เมษ",
    symbol: "I",
    element: "ไฟ",
    dateRange: "21 มี.ค. – 19 เม.ย.",
  },
  {
    id: "taurus",
    name: "Taurus",
    thaiName: "พฤษภ",
    symbol: "II",
    element: "ดิน",
    dateRange: "20 เม.ย. – 20 พ.ค.",
  },
  {
    id: "gemini",
    name: "Gemini",
    thaiName: "เมถุน",
    symbol: "III",
    element: "ลม",
    dateRange: "21 พ.ค. – 20 มิ.ย.",
  },
  {
    id: "cancer",
    name: "Cancer",
    thaiName: "กรกฎ",
    symbol: "IV",
    element: "น้ำ",
    dateRange: "21 มิ.ย. – 22 ก.ค.",
  },
  {
    id: "leo",
    name: "Leo",
    thaiName: "สิงห์",
    symbol: "V",
    element: "ไฟ",
    dateRange: "23 ก.ค. – 22 ส.ค.",
  },
  {
    id: "virgo",
    name: "Virgo",
    thaiName: "กันย์",
    symbol: "VI",
    element: "ดิน",
    dateRange: "23 ส.ค. – 22 ก.ย.",
  },
  {
    id: "libra",
    name: "Libra",
    thaiName: "ตุลย์",
    symbol: "VII",
    element: "ลม",
    dateRange: "23 ก.ย. – 22 ต.ค.",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    thaiName: "พิจิก",
    symbol: "VIII",
    element: "น้ำ",
    dateRange: "23 ต.ค. – 21 พ.ย.",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    thaiName: "ธนู",
    symbol: "IX",
    element: "ไฟ",
    dateRange: "22 พ.ย. – 21 ธ.ค.",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    thaiName: "มังกร",
    symbol: "X",
    element: "ดิน",
    dateRange: "22 ธ.ค. – 19 ม.ค.",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    thaiName: "กุมภ์",
    symbol: "XI",
    element: "ลม",
    dateRange: "20 ม.ค. – 18 ก.พ.",
  },
  {
    id: "pisces",
    name: "Pisces",
    thaiName: "มีน",
    symbol: "XII",
    element: "น้ำ",
    dateRange: "19 ก.พ. – 20 มี.ค.",
  },
];

export type ReadingType =
  | "daily"
  | "love"
  | "career"
  | "money"
  | "health"
  | "overall"
  | "tarot";

export interface ReadingOption {
  id: ReadingType;
  title: string;
  subtitle: string;
  description: string;
  symbol: string;
  gradient: string;
  accent: string;
  pattern: "stars" | "moon" | "sun" | "floral" | "geometric";
}

export const READING_OPTIONS: ReadingOption[] = [
  {
    id: "daily",
    title: "ดวงรายวัน",
    subtitle: "Daily",
    description: "ดูดวงประจำวันตามราศีของคุณ",
    symbol: "I",
    gradient: "from-amber-400 via-yellow-300 to-orange-400",
    accent: "border-amber-400/60",
    pattern: "sun",
  },
  {
    id: "love",
    title: "ความรัก",
    subtitle: "Love",
    description: "ความสัมพันธ์ คนที่ชอบ และหัวใจของคุณ",
    symbol: "II",
    gradient: "from-rose-400 via-pink-400 to-fuchsia-400",
    accent: "border-rose-400/60",
    pattern: "floral",
  },
  {
    id: "career",
    title: "การงาน",
    subtitle: "Career",
    description: "งาน ตำแหน่ง โอกาสใหม่ และความก้าวหน้า",
    symbol: "III",
    gradient: "from-indigo-500 via-blue-500 to-cyan-400",
    accent: "border-indigo-400/60",
    pattern: "geometric",
  },
  {
    id: "money",
    title: "การเงิน",
    subtitle: "Wealth",
    description: "โชคลาภ รายได้ การลงทุน และความมั่งคั่ง",
    symbol: "IV",
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    accent: "border-emerald-400/60",
    pattern: "geometric",
  },
  {
    id: "health",
    title: "สุขภาพ",
    subtitle: "Health",
    description: "พลังกาย จิตใจ และความสมดุลในชีวิต",
    symbol: "V",
    gradient: "from-teal-400 via-cyan-400 to-sky-400",
    accent: "border-teal-400/60",
    pattern: "floral",
  },
  {
    id: "overall",
    title: "ภาพรวมชีวิต",
    subtitle: "Life Path",
    description: "ทิศทางชีวิต โอกาส และสิ่งที่รอคุณอยู่",
    symbol: "VI",
    gradient: "from-brand-purple-dark via-brand-purple to-brand-purple-light",
    accent: "border-brand-purple-light/60",
    pattern: "stars",
  },
  {
    id: "tarot",
    title: "ไพ่ทาโรต์",
    subtitle: "Tarot",
    description: "จั่วไพ่ 3 ใบ อดีต · ปัจจุบัน · อนาคต",
    symbol: "VII",
    gradient: "from-brand-purple-dark via-brand-purple to-brand-purple-deep",
    accent: "border-purple-500/60",
    pattern: "moon",
  },
];

export const HOME_CATEGORY_IDS = ["love", "career", "money", "overall"] as const;

export type HomeCategoryId = (typeof HOME_CATEGORY_IDS)[number];

export const HOME_CATEGORY_OPTIONS: ReadingOption[] = HOME_CATEGORY_IDS.map(
  (id) => READING_OPTIONS.find((o) => o.id === id)!
);
