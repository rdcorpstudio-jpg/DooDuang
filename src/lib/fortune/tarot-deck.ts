/** Rider–Waite style deck — 78 cards (22 Major + 56 Minor) */

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";

export type TarotCardDef = {
  id: string;
  arcana: "major" | "minor";
  suit?: TarotSuit;
  /** Major: 0–21. Minor: 1–14 (Ace–King). */
  number: number;
  nameEn: string;
  nameTh: string;
  /** Roman numeral for majors, e.g. "VI" */
  label: string;
  upright: string;
  reversed: string;
  deep: string;
  affirmation: string;
  reflection: string;
};

const ROMAN = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
] as const;

const MAJOR: Array<
  Omit<TarotCardDef, "arcana" | "label" | "number" | "id"> & { id: string; n: number }
> = [
  {
    id: "fool",
    n: 0,
    nameEn: "The Fool",
    nameTh: "คนโง่",
    upright: "เริ่มต้นใหม่ด้วยใจเบา — วันนี้เหมาะกับการลองก้าวแรก",
    reversed: "ระวังประมาทหรือลังเลจนพลาดจังหวะดี",
    deep: "ไพ่คนโง่ชวนให้เชื่อในความเป็นไปได้ แม้ยังไม่เห็นแผนครบ การเริ่มด้วยความไว้วางใจตัวเองเล็ก ๆ มักเปิดทางที่คาดไม่ถึง",
    affirmation: "ฉันกล้าเริ่มต้นใหม่ด้วยใจเปิด",
    reflection: "มีเรื่องไหนที่คุณอยากลอง แม้ยังไม่พร้อมร้อยเปอร์เซ็นต์?",
  },
  {
    id: "magician",
    n: 1,
    nameEn: "The Magician",
    nameTh: "นักมายากล",
    upright: "คุณมีเครื่องมือครบ — ลงมือทำให้ไอเดียเป็นรูป",
    reversed: "พลังกระจาย — โฟกัสหนึ่งเรื่องก่อนจะเห็นผล",
    deep: "นักมายากลบอกว่าทักษะ โอกาส และเจตนาพร้อมแล้ว ขาดแค่การจัดระเบียบและลงมือจริง",
    affirmation: "ฉันเปลี่ยนความคิดเป็นการกระทำได้",
    reflection: "วันนี้คุณจะใช้ทักษะที่มีทำอะไรให้เห็นผลชัด?",
  },
  {
    id: "high-priestess",
    n: 2,
    nameEn: "The High Priestess",
    nameTh: "หญิงสงฆ์",
    upright: "ฟังสัญชาตญาณ — คำตอบเงียบ ๆ ชัดกว่าเสียงรอบข้าง",
    reversed: "อย่าเก็บความรู้สึกจนมืด — ตรวจข้อมูลให้สมดุล",
    deep: "หญิงสงฆ์ชวนให้เงียบลงชั่วคราว ความรู้ภายในจะชัดเมื่อไม่รีบตอบทุกคน",
    affirmation: "ฉันเชื่อสัญชาตญาณและตรวจสอบด้วยใจสงบ",
    reflection: "มีอะไรที่ใจคุณรู้แล้ว แต่ยังไม่กล้าเชื่อ?",
  },
  {
    id: "empress",
    n: 3,
    nameEn: "The Empress",
    nameTh: "จักรพรรดินี",
    upright: "เติบโต อุดมสมบูรณ์ — ดูแลตัวเองและสิ่งที่รัก",
    reversed: "ระวังดูแลคนอื่นจนลืมตัวเอง",
    deep: "จักรพรรดินีหนุนการสร้างสรรค์ ความอบอุ่น และการเลี้ยงดูไอเดียให้โต",
    affirmation: "ฉันดูแลตัวเองและสิ่งที่กำลังเติบโต",
    reflection: "วันนี้คุณจะเติมความอุดมให้ชีวิตส่วนไหน?",
  },
  {
    id: "emperor",
    n: 4,
    nameEn: "The Emperor",
    nameTh: "จักรพรรดิ",
    upright: "วางโครง มั่นคง — ตัดสินใจด้วยโครงสร้างชัด",
    reversed: "อย่ายึดอำนาจหรือกฎเดิมจนตัน",
    deep: "จักรพรรดิให้พลังจัดระบบ ขอบเขต และการเป็นผู้นำที่รับผิดชอบ",
    affirmation: "ฉันสร้างความมั่นคงด้วยวินัยที่อ่อนโยน",
    reflection: "เรื่องไหนควรตั้งกฎให้ชัดขึ้นวันนี้?",
  },
  {
    id: "hierophant",
    n: 5,
    nameEn: "The Hierophant",
    nameTh: "นักบวช",
    upright: "เรียนรู้จากครู ระบบ หรือประเพณีที่ไว้ใจได้",
    reversed: "อย่าทำตามโดยไม่คิด — หาความหมายของตัวเอง",
    deep: "นักบวชชี้ถึงความรู้ที่ส่งต่อ คำแนะนำจากผู้รู้ และพิธีเล็ก ๆ ที่ให้หลักยึด",
    affirmation: "ฉันเปิดใจเรียนรู้และเลือกสิ่งที่เข้ากับคุณค่าของฉัน",
    reflection: "ใครหรือหลักคิดไหนที่ช่วยให้คุณเดินถูกทาง?",
  },
  {
    id: "lovers",
    n: 6,
    nameEn: "The Lovers",
    nameTh: "คู่รัก",
    upright: "เลือกอย่างจริงใจ และสื่อสารกับคนสำคัญ",
    reversed: "ลังเลหรือไม่ตรงใจ — อย่าเลือกเพราะความกลัว",
    deep: "คู่รักไม่ใช่แค่ความรัก แต่เป็นการเลือกที่ยืนบนคุณค่าของตัวเอง",
    affirmation: "ฉันเลือกสิ่งที่สอดคล้องกับใจ",
    reflection: "ทางไหนทำให้คุณรู้สึกเป็นตัวเองมากกว่า?",
  },
  {
    id: "chariot",
    n: 7,
    nameEn: "The Chariot",
    nameTh: "รถศึก",
    upright: "มุ่งไปข้างหน้า — ความตั้งใจจะพาไปถึง",
    reversed: "ทิศทางกระจัด — จัดแรงผลักให้ไปทางเดียว",
    deep: "รถศึกหนุนชัยชนะจากการควบคุมทิศทาง ไม่ใช่การฝืนทุกอย่าง",
    affirmation: "ฉันขับเคลื่อนเป้าหมายด้วยโฟกัสชัด",
    reflection: "วันนี้คุณจะเก็บแรงไปที่เป้าหมายไหนเป็นหลัก?",
  },
  {
    id: "strength",
    n: 8,
    nameEn: "Strength",
    nameTh: "พลัง",
    upright: "อ่อนโยนแต่มั่นคง — ใช้ใจเย็นเอาชนะความกดดัน",
    reversed: "สงสัยตัวเอง — อย่าใช้ความแข็งกระด้างบังความกลัว",
    deep: "พลังแท้คือการถืออารมณ์ไว้ได้โดยไม่ทำร้ายตัวเองหรือคนอื่น",
    affirmation: "ฉันเข้มแข็งด้วยความใจเย็น",
    reflection: "สถานการณ์ไหนที่ต้องใช้ความอดทนมากกว่าแรงดึง?",
  },
  {
    id: "hermit",
    n: 9,
    nameEn: "The Hermit",
    nameTh: "ฤๅษี",
    upright: "ถอยมานิด เพื่อฟังเสียงตัวเองให้ชัด",
    reversed: "อย่าแยกตัวจนโดดเดี่ยวเกินไป",
    deep: "ฤๅษีเชิญให้มองใน คำตอบจากประสบการณ์ของตัวเองมักคมกว่าคำแนะนำรอบข้าง",
    affirmation: "ฉันให้เวลากับปัญญาภายใน",
    reflection: "ถ้าได้อยู่เงียบ ๆ คุณอยากได้คำตอบเรื่องอะไร?",
  },
  {
    id: "wheel",
    n: 10,
    nameEn: "Wheel of Fortune",
    nameTh: "วงล้อโชคชะตา",
    upright: "จังหวะหมุน — พร้อมรับการเปลี่ยนอย่างยืดหยุ่น",
    reversed: "รู้สึกติดวงจร — เปลี่ยนมุมเล็กน้อยจะขยับได้",
    deep: "วงล้อบอกว่าสถานการณ์ไม่หยุดนิ่ง ใช้โมเมนตัมอย่างมีสติ",
    affirmation: "ฉันไหลไปกับจังหวะใหม่ด้วยสติ",
    reflection: "การเปลี่ยนแปลงรอบตัวเปิดโอกาสอะไรให้คุณ?",
  },
  {
    id: "justice",
    n: 11,
    nameEn: "Justice",
    nameTh: "ความยุติธรรม",
    upright: "ชั่งน้ำหนักให้แฟร์ — ความจริงจะช่วยเคลียร์",
    reversed: "ระวังอคติหรือเลี่ยงความรับผิดชอบ",
    deep: "ความยุติธรรมชวนให้ตัดสินด้วยข้อเท็จจริงและรับผลจากการเลือกของตน",
    affirmation: "ฉันเลือกอย่างยุติธรรมต่อตัวเองและผู้อื่น",
    reflection: "มีเรื่องไหนที่ควรคุยหรือเคลียร์ให้ตรงไปตรงมา?",
  },
  {
    id: "hanged-man",
    n: 12,
    nameEn: "The Hanged Man",
    nameTh: "คนแขวนคอ",
    upright: "หยุดนิ่งชั่วคราวเพื่อเห็นมุมใหม่",
    reversed: "อย่าเสียสละโดยไม่มีจุดหมาย หรือยื้อการปล่อยวาง",
    deep: "การพักและยอมเปลี่ยนมุมมองมักปลดล็อกทางตันได้ดีกว่าฝืนเดิน",
    affirmation: "ฉันยอมหยุดเพื่อเห็นสิ่งที่เคยมองข้าม",
    reflection: "ถ้ามองปัญหาจากมุมตรงข้าม คุณจะเห็นอะไร?",
  },
  {
    id: "death",
    n: 13,
    nameEn: "Death",
    nameTh: "ความตาย",
    upright: "จบรอบเก่าเพื่อเปิดรอบใหม่ — ปล่อยสิ่งที่หมดอายุ",
    reversed: "ยึดติดสิ่งเก่า — การเปลี่ยนช้าแต่จำเป็น",
    deep: "ไพ่ความตายคือการเปลี่ยนผ่าน ไม่ใช่หายนะ การปิดบทช่วยให้เริ่มบทถัดไปได้จริง",
    affirmation: "ฉันปล่อยสิ่งที่จบแล้วด้วยความเคารพ",
    reflection: "มีอะไรที่ควรปิดให้จบเพื่อให้ชีวิตเบาขึ้น?",
  },
  {
    id: "temperance",
    n: 14,
    nameEn: "Temperance",
    nameTh: "ความพอดี",
    upright: "ผสมผสานให้สมดุล — ค่อย ๆ ปรับจนไหลลื่น",
    reversed: "สุดโต่งเกินไป — หาจุดกลางกลับมา",
    deep: "ความพอดีสอนการผสมแรง ความอดทน และการรักษาจังหวะที่ยั่งยืน",
    affirmation: "ฉันหาสมดุลด้วยความอดทน",
    reflection: "ส่วนไหนของวันนี้ควรผ่อนหรือเติมให้พอดีขึ้น?",
  },
  {
    id: "devil",
    n: 15,
    nameEn: "The Devil",
    nameTh: "ปีศาจ",
    upright: "เห็นพันธนาการ — ความอยากหรือนิสัยที่ฉุดไว้",
    reversed: "เริ่มปลดโซ่ — มีพลังเลิกยึดติดได้",
    deep: "ปีศาจชี้สิ่งที่ผูกมัดด้วยความเคยชินหรือความกลัว การเห็นมันชัดคือขั้นแรกของการปลด",
    affirmation: "ฉันเลือกเสรีภาพมากกว่าความเคยชินที่ทำร้าย",
    reflection: "มีนิสัยหรือความสัมพันธ์ไหนที่รู้สึกเหมือนโซ่?",
  },
  {
    id: "tower",
    n: 16,
    nameEn: "The Tower",
    nameTh: "หอคอย",
    upright: "สั่นคลอนเพื่อเคลียร์ของปลอม — เกิดใหม่หลังพายุ",
    reversed: "เลี่ยงการพังแบบฉับพลันได้ถ้ายอมปรับก่อน",
    deep: "หอคอยทำลายโครงสร้างที่ไม่จริง การยอมรับความจริงแม้เจ็บ จะเปิดพื้นที่สร้างใหม่",
    affirmation: "ฉันผ่านความสั่นคลอนไปสู่ความจริงที่มั่นคงกว่า",
    reflection: "มีอะไรที่พังแล้วกลับทำให้คุณโล่งขึ้น?",
  },
  {
    id: "star",
    n: 17,
    nameEn: "The Star",
    nameTh: "ดวงดาว",
    upright: "ความหวังและการฟื้นพลัง — ตั้งใจใหม่แบบเบา ๆ",
    reversed: "หมดไฟชั่วคราว — เติมน้ำใจตัวเองก่อนฝันใหญ่",
    deep: "ดวงดาวบอกถึงการเยียวยา ความเชื่อมั่น และการมองไปข้างหน้าอย่างสงบ",
    affirmation: "ฉันเปิดรับแสงใหม่และเชื่อในจังหวะของฉัน",
    reflection: "ความหวังเล็ก ๆ ที่อยากดูแลวันนี้คืออะไร?",
  },
  {
    id: "moon",
    n: 18,
    nameEn: "The Moon",
    nameTh: "พระจันทร์",
    upright: "สัญชาตญาณคม — อย่ารีบสรุปจากเงา",
    reversed: "ความสับสนคลาย — ความจริงเริ่มโผล่",
    deep: "พระจันทร์ชวนฟังความรู้สึกภายใน ระวังการเดาและความกลัวเกินจริง",
    affirmation: "ฉันฟังสัญชาตญาณและตรวจความจริงด้วยใจสงบ",
    reflection: "มีอะไรที่คุณกลัวจากเงา แต่ยังไม่ได้ตรวจจริง?",
  },
  {
    id: "sun",
    n: 19,
    nameEn: "The Sun",
    nameTh: "ดวงอาทิตย์",
    upright: "สดใส มั่นใจ — ฉลองความคืบหน้าได้",
    reversed: "ความสุขมีเงื่อนไข — อย่ากดดันให้สมบูรณ์แบบ",
    deep: "ดวงอาทิตย์หนุนความอบอุ่น ความชัดเจน และการมองเห็นผลลัพธ์",
    affirmation: "ฉันฉายแสงอย่างเป็นธรรมชาติ",
    reflection: "วันนี้คุณอยากฉลองเรื่องไหนของตัวเอง?",
  },
  {
    id: "judgement",
    n: 20,
    nameEn: "Judgement",
    nameTh: "การพิพากษา",
    upright: "เรียกตัวเองให้ตื่น — พร้อมตัดสินใจรอบใหญ่",
    reversed: "อย่าตัดสินตัวเองรุนแรงเกินไป",
    deep: "การพิพากษาคือเสียงเรียกให้ยอมรับบทเรียนและก้าวสู่เวอร์ชันใหม่",
    affirmation: "ฉันตอบรับการเรียกของตัวเองด้วยความกล้า",
    reflection: "มีบทเรียนไหนที่พร้อมจะปิดและเริ่มใหม่?",
  },
  {
    id: "world",
    n: 21,
    nameEn: "The World",
    nameTh: "โลก",
    upright: "ครบวงจร — สำเร็จและพร้อมรอบถัดไป",
    reversed: "ใกล้จบแต่ยังขาดชิ้น — ปิดงานค้างก่อนฉลอง",
    deep: "โลกคือการบูรณาการ ประสบการณ์ครบและพร้อมเปิดเส้นทางใหม่ที่สมบูรณ์กว่า",
    affirmation: "ฉันจบรอบนี้อย่างสมบูรณ์และเปิดรับรอบใหม่",
    reflection: "อะไรที่ใกล้สำเร็จแล้ว แค่ต้องการก้าวสุดท้าย?",
  },
];

const SUIT_META: Record<
  TarotSuit,
  { th: string; en: string; theme: string; deepLead: string }
> = {
  wands: {
    th: "ไม้เท้า",
    en: "Wands",
    theme: "ไฟ พลัง ไอเดีย การลงมือ",
    deepLead: "สำรับไม้เท้าพูดถึงแรงบันดาลใจ การลงมือ และความกล้าผลักดัน",
  },
  cups: {
    th: "ถ้วย",
    en: "Cups",
    theme: "น้ำ อารมณ์ ความสัมพันธ์",
    deepLead: "สำรับถ้วยพูดถึงหัวใจ ความสัมพันธ์ และการไหลของความรู้สึก",
  },
  swords: {
    th: "ดาบ",
    en: "Swords",
    theme: "ลม ความคิด การสื่อสาร",
    deepLead: "สำรับดาบพูดถึงความคิด ความจริง และการตัดสินใจคม ๆ",
  },
  pentacles: {
    th: "เหรียญ",
    en: "Pentacles",
    theme: "ดิน งาน เงิน ความมั่นคง",
    deepLead: "สำรับเหรียญพูดถึงร่างกาย งาน การเงิน และการสร้างของจริง",
  },
};

type RankDef = {
  n: number;
  id: string;
  nameEn: string;
  nameTh: string;
  label: string;
  uprightBy: Record<TarotSuit, string>;
  reversedBy: Record<TarotSuit, string>;
};

const RANKS: RankDef[] = [
  {
    n: 1,
    id: "ace",
    nameEn: "Ace",
    nameTh: "เอซ",
    label: "A",
    uprightBy: {
      wands: "ประกายไอเดียใหม่ — จุดไฟแล้วลงมือก้าวแรก",
      cups: "หัวใจเปิดรับความรู้สึกใหม่ — ให้อารมณ์ไหลอย่างจริงใจ",
      swords: "ความคิดคมชัด — ความจริงหรือไอเดียใหม่พุ่งเข้ามา",
      pentacles: "โอกาสรูปธรรม — เมล็ดแห่งความมั่นคงกำลังงอก",
    },
    reversedBy: {
      wands: "ไฟยังไม่ติด — อย่ารอแรงบันดาลใจเพอร์เฟกต์",
      cups: "ปิดกั้นความรู้สึก — ลองเปิดใจทีละนิด",
      swords: "ความคิดฟุ้งหรือข่าวลือ — ชะลอสรุป",
      pentacles: "โอกาสเลื่อน — ตรวจแผนเงิน/งานก่อนรับ",
    },
  },
  {
    n: 2,
    id: "two",
    nameEn: "Two",
    nameTh: "สอง",
    label: "II",
    uprightBy: {
      wands: "มองไกลและวางแผน — เลือกทิศก่อนพุ่ง",
      cups: "เชื่อมสัมพันธ์ — การแลกเปลี่ยนความรู้สึกสำคัญ",
      swords: "ลังเลระหว่างสองทาง — หาข้อมูลเพิ่มก่อนตัดใจ",
      pentacles: "ทรงตัวหลายงาน — จัดสมดุลให้ไม่ล้ม",
    },
    reversedBy: {
      wands: "กลัวก้าว — อย่าวางแผนจนไม่เริ่ม",
      cups: "ความสัมพันธ์ไม่สมดุล — คุยให้ชัด",
      swords: "เลี่ยงการตัดสินใจจนตัน",
      pentacles: "ภาระล้น — วางของที่ไม่จำเป็นลง",
    },
  },
  {
    n: 3,
    id: "three",
    nameEn: "Three",
    nameTh: "สาม",
    label: "III",
    uprightBy: {
      wands: "ขยายวิสัยทัศน์ — ผลเริ่มเห็นหลังลงแรง",
      cups: "ฉลองกับเพื่อน — ความสุขจากการแบ่งปัน",
      swords: "เจ็บจากความจริง — ปล่อยให้ใจหายแล้วเรียนรู้",
      pentacles: "ร่วมมือสร้างฝีมือ — งานทีมดีขึ้น",
    },
    reversedBy: {
      wands: "ดีเลย์หรือมองแคบเกินไป",
      cups: "วงสัมพันธ์เย็น — หาพื้นที่ที่อุ่นกว่า",
      swords: "ยื้อความเจ็บ — พร้อมปล่อยเมื่อไหร่?",
      pentacles: "งานร่วมสะดุด — ปรับบทบาทให้ชัด",
    },
  },
  {
    n: 4,
    id: "four",
    nameEn: "Four",
    nameTh: "สี่",
    label: "IV",
    uprightBy: {
      wands: "รากฐานและฉลองบ้าน/ทีม — ความมั่นคงอุ่นใจ",
      cups: "เบื่อหน่ายชั่วคราว — มองโอกาสที่อยู่ใกล้",
      swords: "พักสมอง — กู้พลังก่อนคิดต่อ",
      pentacles: "เก็บออมและยึดมั่น — ความมั่นคงสำคัญ",
    },
    reversedBy: {
      wands: "ความไม่มั่นคงในบ้าน/ทีม — เคลียร์ให้เรียบ",
      cups: "พลาดโอกาสเพราะเหม่อ",
      swords: "พักไม่พอหรือกระวนกระวาย",
      pentacles: "ยึดติดวัตถุ/ความกลัวสูญเสียมากไป",
    },
  },
  {
    n: 5,
    id: "five",
    nameEn: "Five",
    nameTh: "ห้า",
    label: "V",
    uprightBy: {
      wands: "แข่งหรือขัดแย้ง — ใช้เป็นแรงขัดเกลาไม่ใช่ทำลาย",
      cups: "เสียดายสิ่งที่หก — หันมามองสิ่งที่ยังเหลือ",
      swords: "ชนะแต่เจ็บ — ระวังคำพูดที่บาด",
      pentacles: "รู้สึกขาดแคลน — ขอความช่วยเหลือได้",
    },
    reversedBy: {
      wands: "ความขัดแย้งคลาย — ประนีประนอมได้",
      cups: "เริ่มรับและเดินต่อ",
      swords: "พร้อมคืนดีหรือวางอาวุธคำพูด",
      pentacles: "สถานการณ์เงิน/กายเริ่มดีขึ้น",
    },
  },
  {
    n: 6,
    id: "six",
    nameEn: "Six",
    nameTh: "หก",
    label: "VI",
    uprightBy: {
      wands: "ได้รับการยอมรับ — ความสำเร็จเล็ก ๆ ที่น่าฉลอง",
      cups: "ความคิดถึงและความอบอุ่นจากอดีต",
      swords: "ข้ามไปสู่ที่สงบกว่า — ทิ้งพายุไว้ข้างหลัง",
      pentacles: "ให้และรับอย่างยุติธรรม — แบ่งปันทรัพยากร",
    },
    reversedBy: {
      wands: "คำชมช้าหรือไม่มั่นใจในชัยชนะ",
      cups: "ติดอดีตจนมองปัจจุบันไม่ชัด",
      swords: "ยังพาปัญหาเดินทางไปด้วย",
      pentacles: "การให้ไม่สมดุล — ตรวจขอบเขต",
    },
  },
  {
    n: 7,
    id: "seven",
    nameEn: "Seven",
    nameTh: "เจ็ด",
    label: "VII",
    uprightBy: {
      wands: "ยืนหยัดป้องกันสิ่งที่สร้างมา",
      cups: "ตัวเลือกเพ้อฝันเยอะ — คัดเหลือที่ทำได้จริง",
      swords: "กลยุทธ์หรือเลี่ยงตรง ๆ — ใช้สติไม่ใช่โกง",
      pentacles: "รอผลจากที่ลงแรง — อดทนและประเมินงอก",
    },
    reversedBy: {
      wands: "หมดแรงป้องกัน — เลือกศึกที่คุ้ม",
      cups: "กลับสู่ความจริงจากความฝันฟุ้ง",
      swords: "ถูกจับได้หรือแผนไม่โปร่ง",
      pentacles: "ใจร้อนกับผลลัพธ์ — ปรับวิธีไม่ทิ้งงาน",
    },
  },
  {
    n: 8,
    id: "eight",
    nameEn: "Eight",
    nameTh: "แปด",
    label: "VIII",
    uprightBy: {
      wands: "ข่าวสารและความคืบหน้าเร็ว — เตรียมรับจังหวะ",
      cups: "เดินออกจากสิ่งที่ไม่เติมเต็ม",
      swords: "ติดกับดักความคิด — มองทางออกที่เคยมองข้าม",
      pentacles: "ฝึกฝนฝีมือ — ทำซ้ำจนชำนาญ",
    },
    reversedBy: {
      wands: "ดีเลย์หรือข่าวสับสน",
      cups: "ลังเลจะจาก — ฟังใจอีกครั้ง",
      swords: "เริ่มเห็นทางออกจากความกลัว",
      pentacles: "งานจำเจหรือคุณภาพตก — กลับสู่ความตั้งใจ",
    },
  },
  {
    n: 9,
    id: "nine",
    nameEn: "Nine",
    nameTh: "เก้า",
    label: "IX",
    uprightBy: {
      wands: "เหนื่อยแต่ยังยืนได้ — ใกล้เส้นชัยแล้ว",
      cups: "ความพอใจส่วนตัว — อวยพรสิ่งที่สร้างไว้",
      swords: "กังวลตอนกลางคืน — แยกความกลัวจากข้อเท็จจริง",
      pentacles: "พึ่งพาตัวเองได้ — ความมั่งคั่งจากความอดทน",
    },
    reversedBy: {
      wands: "ใกล้หมดแรง — ขอพักและทีมช่วย",
      cups: "ความสุขไม่เต็ม — หาสิ่งที่ขาดจริง",
      swords: "ความกังวลเริ่มคลายเมื่อพูดออก",
      pentacles: "รู้สึกไม่มั่นคงแม้มีของ — ตรวจคุณค่าในใจ",
    },
  },
  {
    n: 10,
    id: "ten",
    nameEn: "Ten",
    nameTh: "สิบ",
    label: "X",
    uprightBy: {
      wands: "แบกมากไป — แบ่งงานหรือวางบางส่วน",
      cups: "ความสุขครอบครัว/วงใกล้ชิดอบอุ่น",
      swords: "จบรอบเจ็บปวด — รุ่งอรุณหลังคืนยาว",
      pentacles: "มรดก ความมั่นคงระยะยาว ครอบครัว",
    },
    reversedBy: {
      wands: "ปล่อยภาระได้แล้ว — อย่าแบกคนเดียว",
      cups: "ความขัดในบ้าน — ซ่อมด้วยการคุย",
      swords: "ยื้อบทจบ — พร้อมปล่อยเมื่อไหร่?",
      pentacles: "ความมั่นคงสั่น — ตรวจรากฐานเงิน/ความสัมพันธ์",
    },
  },
  {
    n: 11,
    id: "page",
    nameEn: "Page",
    nameTh: "เด็กถือสาร",
    label: "P",
    uprightBy: {
      wands: "ข่าวดีหรือไอเดียสนุก — ลองด้วยความอยากรู้",
      cups: "ข้อความจากใจ — อ่อนโยนและเปิดรับ",
      swords: "เรียนรู้ข้อมูลใหม่ — ถามเก่ง ฟังให้ดี",
      pentacles: "โอกาสเรียน/งานเล็ก ๆ ที่นำไปสู่ของจริง",
    },
    reversedBy: {
      wands: "ไอเดียยังดิบ — อย่ารีบประกาศ",
      cups: "อารมณ์ไม่เสถียรหรือข่าวใจสับสน",
      swords: "ข่าวลือหรือพูดเร็วเกินคิด",
      pentacles: "ขาดวินัยเล็กน้อย — ตั้งก้าวแรกให้ชัด",
    },
  },
  {
    n: 12,
    id: "knight",
    nameEn: "Knight",
    nameTh: "อัศวิน",
    label: "Kn",
    uprightBy: {
      wands: "พุ่งไปข้างหน้าด้วยไฟ — กล้าแต่มีทิศ",
      cups: "โรแมนติกและตามหัวใจ — เสนอความจริงใจ",
      swords: "ตัดใจเร็วและคม — พูดตรงแต่รู้จังหวะ",
      pentacles: "ค่อยเป็นค่อยไปอย่างมั่นคง — ความขยันชนะ",
    },
    reversedBy: {
      wands: "ใจร้อนจนเผา — ชะลอก่อนชน",
      cups: "ฝันเปล่าหรือไม่คงเส้นคงวา",
      swords: "คำพูดคมเกินไปหรือรีบสรุป",
      pentacles: "ช้าจนอืด — ขยับทีละนิดก็ได้",
    },
  },
  {
    n: 13,
    id: "queen",
    nameEn: "Queen",
    nameTh: "ราชินี",
    label: "Q",
    uprightBy: {
      wands: "มั่นใจ มีเสน่ห์ สร้างแรงบันดาลใจให้คนรอบข้าง",
      cups: "เข้าใจอารมณ์ลึก — โอบอุ้มด้วยความเมตตา",
      swords: "คิดชัด พูดจริง ด้วยปัญญาและขอบเขต",
      pentacles: "ดูแลบ้าน/งาน/เงินอย่างอบอุ่นและจริงจัง",
    },
    reversedBy: {
      wands: "ความมั่นใจสั่นหรือควบคุมด้วยไฟแรง",
      cups: "อารมณ์ท่วมหรือดูแลจนหมดแรง",
      swords: "เย็นชาหรือวิจารณ์แรงเกิน",
      pentacles: "ยึดความมั่นคงจนไม่ยืดหยุ่น",
    },
  },
  {
    n: 14,
    id: "king",
    nameEn: "King",
    nameTh: "ราชา",
    label: "K",
    uprightBy: {
      wands: "นำด้วยวิสัยทัศน์ — ตัดสินใจแล้วพาทีมไป",
      cups: "คุมอารมณ์อย่างสุกและเมตตา",
      swords: "ตัดสินด้วยเหตุผลและความยุติธรรม",
      pentacles: "สร้างความมั่งคั่งและระบบที่พึ่งได้",
    },
    reversedBy: {
      wands: "เผด็จการหรือไร้ทิศ — ฟังทีมมากขึ้น",
      cups: "กดอารมณ์หรือใช้ความรู้สึกควบคุม",
      swords: "เผด็จการทางความคิด — เปิดรับมุมอื่น",
      pentacles: "ยึดวัตถุหรือกลัวสูญเสียจนตัน",
    },
  },
];

function buildMinor(): TarotCardDef[] {
  const suits = Object.keys(SUIT_META) as TarotSuit[];
  const out: TarotCardDef[] = [];

  for (const suit of suits) {
    const meta = SUIT_META[suit];
    for (const rank of RANKS) {
      const upright = rank.uprightBy[suit];
      const reversed = rank.reversedBy[suit];
      out.push({
        id: `${rank.id}-${suit}`,
        arcana: "minor",
        suit,
        number: rank.n,
        nameEn: `${rank.nameEn} of ${meta.en}`,
        nameTh: `${rank.nameTh}แห่ง${meta.th}`,
        label: rank.label,
        upright,
        reversed,
        deep: `${meta.deepLead} (${meta.theme}). ${upright} ถ้ากลับหัว ให้ระวังว่า${reversed.replace(/^/, "")}`,
        affirmation: `ฉันใช้พลัง${meta.th}อย่างมีสติและจริงใจ`,
        reflection: `วันนี้พลัง${meta.th}ชวนให้คุณโฟกัสเรื่องอะไรเป็นพิเศษ?`,
      });
    }
  }

  return out;
}

export const TAROT_DECK: TarotCardDef[] = [
  ...MAJOR.map((m) => ({
    id: m.id,
    arcana: "major" as const,
    number: m.n,
    nameEn: m.nameEn,
    nameTh: m.nameTh,
    label: ROMAN[m.n] ?? String(m.n),
    upright: m.upright,
    reversed: m.reversed,
    deep: m.deep,
    affirmation: m.affirmation,
    reflection: m.reflection,
  })),
  ...buildMinor(),
];

export const TAROT_DECK_COUNT = TAROT_DECK.length; // 78

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

/** Pick one card + orientation from seed (deterministic “random”). */
export function drawTarotCard(seed: string): {
  card: TarotCardDef;
  upright: boolean;
  brief: string;
} {
  const card = TAROT_DECK[hashSeed(seed) % TAROT_DECK.length]!;
  const upright = hashSeed(`${seed}-orient`) % 2 === 0;
  return {
    card,
    upright,
    brief: upright ? card.upright : card.reversed,
  };
}

/** Draw N unique cards from the deck using a seed. */
export function drawTarotSpread(seed: string, count: number): TarotCardDef[] {
  const n = Math.min(count, TAROT_DECK.length);
  const used = new Set<number>();
  const out: TarotCardDef[] = [];
  let h = hashSeed(seed);
  while (out.length < n) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const idx = h % TAROT_DECK.length;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(TAROT_DECK[idx]!);
  }
  return out;
}
