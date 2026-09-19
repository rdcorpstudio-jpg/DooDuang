export const HOME_TOPIC_IDS = ["career", "money", "love", "overview"] as const;

export type HomeTopicId = (typeof HOME_TOPIC_IDS)[number];

export type HomeTopic = {
  id: HomeTopicId;
  title: string;
  blurb: string;
  loginTitle: string;
  /** After profile + login, where to continue */
  afterLogin: string;
  artwork: string;
  /** Crop so the focal subject stays in the card hero */
  artworkPosition: string;
};

export const HOME_TOPICS: readonly HomeTopic[] = [
  {
    id: "career",
    title: "การงาน",
    blurb: "งาน · โอกาส · การเปลี่ยนแปลง",
    loginTitle: "มาดูเรื่องการงานกัน",
    afterLogin: "/reading/aspect?id=career&from=reading",
    artwork: "/prediction/work.png",
    artworkPosition: "58% 18%",
  },
  {
    id: "money",
    title: "การเงิน",
    blurb: "เงิน · โอกาส · จังหวะ",
    loginTitle: "มาดูเรื่องการเงินกัน",
    afterLogin: "/reading/aspect?id=money&from=reading",
    artwork: "/prediction/finance.png",
    artworkPosition: "52% 20%",
  },
  {
    id: "love",
    title: "ความรัก",
    blurb: "ความสัมพันธ์ · คนรัก · คนในใจ",
    loginTitle: "มาดูเรื่องความรักกัน",
    afterLogin: "/reading/aspect?id=love&from=reading",
    artwork: "/prediction/love.png",
    artworkPosition: "50% 26%",
  },
  {
    id: "overview",
    title: "ภาพรวม",
    blurb: "ดูทุกด้านในช่วงนี้",
    loginTitle: "มาดูภาพรวมกัน",
    afterLogin: "/reading",
    artwork: "/prediction/overall.png",
    artworkPosition: "50% 22%",
  },
] as const;

export function parseHomeTopicId(value?: string | null): HomeTopicId | null {
  if (!value) return null;
  return HOME_TOPIC_IDS.includes(value as HomeTopicId)
    ? (value as HomeTopicId)
    : null;
}

export function homeTopicById(id: HomeTopicId) {
  return HOME_TOPICS.find((t) => t.id === id)!;
}

/** Choose → gender → birth → name (login is not an extra fill step) */
export const ONBOARD_FUNNEL_TOTAL = 4;

/** Choose-topic card → gender wizard */
export function homeTopicWizardHref(id: HomeTopicId) {
  return `/reading?topic=${id}`;
}

/** Login ‹ กลับ → nickname, keeping the wizard draft */
export function homeTopicResumeNameHref(id: HomeTopicId) {
  return `/reading?topic=${id}&step=name`;
}

/** After nickname → login, then the chosen reading */
export function homeTopicPostProfileLoginHref(id: HomeTopicId) {
  const topic = homeTopicById(id);
  return `/login?callbackUrl=${encodeURIComponent(topic.afterLogin)}&topic=${id}`;
}
