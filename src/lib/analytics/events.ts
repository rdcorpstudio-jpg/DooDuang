/** Canonical product analytics event names */
export const ANALYTICS_EVENT_NAMES = [
  "signup",
  "login",
  "profile_saved",
  "checkout_started",
  "payment_succeeded",
  "thanks_line_cta",
  "feature_open",
  "feature_complete",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const CLIENT_ANALYTICS_EVENT_NAMES = [
  "feature_open",
  "thanks_line_cta",
] as const satisfies readonly AnalyticsEventName[];

export type ClientAnalyticsEventName =
  (typeof CLIENT_ANALYTICS_EVENT_NAMES)[number];

/** Menu / product feature ids (align with feature-menu-page) */
export const ANALYTICS_FEATURES = [
  "daily",
  "tarot",
  "shirt",
  "work",
  "money",
  "love",
  "health",
  "bazi",
  "face",
  "palm",
  "couple",
  "self-map",
  "year",
  "report",
  "wallpaper",
  "reading",
] as const;

export type AnalyticsFeature = (typeof ANALYTICS_FEATURES)[number];

export const ANALYTICS_FEATURE_LABELS: Record<AnalyticsFeature, string> = {
  daily: "ดวงรายวัน",
  tarot: "ไพ่รายวัน",
  shirt: "สีเสื้อมงคล",
  work: "การงาน",
  money: "การเงิน",
  love: "ความรัก",
  health: "สุขภาพ",
  bazi: "ปาจื้อ",
  face: "โหงวเฮ้ง",
  palm: "ลายมือ",
  couple: "ดวงคู่",
  "self-map": "แผนที่ตัวเอง",
  year: "ดวงรายปี",
  report: "รายงาน",
  wallpaper: "วอลเปเปอร์",
  reading: "ดูดวงเบื้องต้น",
};

export const FUNNEL_STEPS: {
  name: AnalyticsEventName;
  label: string;
}[] = [
  { name: "signup", label: "สมัครใหม่" },
  { name: "login", label: "เข้าสู่ระบบ" },
  { name: "profile_saved", label: "บันทึกโปรไฟล์" },
  { name: "feature_open", label: "เปิดฟีเจอร์" },
  { name: "feature_complete", label: "ใช้ฟีเจอร์สำเร็จ" },
  { name: "checkout_started", label: "เริ่มชำระเงิน" },
  { name: "payment_succeeded", label: "ชำระสำเร็จ" },
  { name: "thanks_line_cta", label: "กดเพิ่มเพื่อน LINE" },
];

const EVENT_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const CLIENT_EVENT_SET = new Set<string>(CLIENT_ANALYTICS_EVENT_NAMES);
const FEATURE_SET = new Set<string>(ANALYTICS_FEATURES);

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return EVENT_SET.has(value);
}

export function isClientAnalyticsEventName(
  value: string
): value is ClientAnalyticsEventName {
  return CLIENT_EVENT_SET.has(value);
}

export function isAnalyticsFeature(value: string): value is AnalyticsFeature {
  return FEATURE_SET.has(value);
}

/** Map classic ReadingType → analytics feature id */
export function readingTypeToFeature(
  type: string
): AnalyticsFeature | undefined {
  switch (type) {
    case "daily":
      return "daily";
    case "love":
      return "love";
    case "career":
      return "work";
    case "money":
      return "money";
    case "health":
      return "health";
    case "overall":
      return "reading";
    case "tarot":
      return "tarot";
    default:
      return undefined;
  }
}

/** Resolve feature from pathname + search (client page views) */
export function featureFromPath(
  pathname: string,
  search = ""
): AnalyticsFeature | undefined {
  const path = pathname.replace(/\/$/, "") || "/";
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);

  if (path === "/premium") return "daily";
  if (path === "/premium/couple") return "couple";
  if (path === "/premium/self-map") return "self-map";
  if (path === "/premium/year" || path.startsWith("/premium/year/")) return "year";
  if (path === "/premium/report") return "report";

  if (path === "/reading/tarot") return "tarot";
  if (path === "/reading/shirt") return "shirt";
  if (path === "/reading/bazi") return "bazi";
  if (path === "/reading/face") return "face";
  if (path === "/reading/palm") return "palm";
  if (path === "/reading/wallpaper") return "wallpaper";

  if (path === "/reading/aspect") {
    const id = params.get("id");
    if (id === "career") return "work";
    if (id === "money" || id === "love" || id === "health") return id;
  }

  if (path.startsWith("/reading/") && path !== "/reading") {
    const type = path.slice("/reading/".length);
    return readingTypeToFeature(type);
  }

  return undefined;
}
