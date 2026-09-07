/**
 * พื้นฐานดวง — JSON-ready for OpenAPI.
 * UI only renders from this shape.
 */
export type FortuneFoundation = {
  sectionTitle: string;
  sectionSubtitle?: string;

  profile: {
    nickname: string;
    birthDate: string;
    age: number;
    genderLabel?: string;
  };

  /** Top summary card */
  headline: {
    tag: string;
    title: string;
    body: string;
  };

  /** Identity snapshot */
  identity: {
    archetype: string;
    summary: string;
    zodiacNameTh: string;
    element: string;
    quality?: string;
    dateRange?: string;
    lifePathNumber: number;
    lucky: {
      colors: string[];
      numbers: number[];
      day?: string;
      direction?: string;
    };
  };

  /** Past vs present compare */
  compare: {
    past: { label: string; title: string; body: string };
    present: { label: string; title: string; body: string };
  };

  /** Accordion topics — click to expand detail */
  topics: Array<{
    id: string;
    name: string;
    subtitle: string;
    accent: "violet" | "amber" | "rose" | "cyan" | "indigo";
    past: { label: string; body: string };
    present: { label: string; body: string };
    tip: string;
  }>;

  /** Short takeaways */
  actions: Array<{
    n: string;
    title: string;
    body: string;
  }>;

  keywords: string[];
};

const ACCENT = {
  violet: { accent: "#cfb4f1", wash: "rgba(197,162,255,0.12)" },
  amber: { accent: "#dfc58e", wash: "rgba(234,203,135,0.12)" },
  rose: { accent: "#e3a9c4", wash: "rgba(227,169,196,0.12)" },
  cyan: { accent: "#b3d3d8", wash: "rgba(161,211,217,0.12)" },
  indigo: { accent: "#bdb9eb", wash: "rgba(189,185,235,0.12)" },
} as const;

export function foundationAccent(key: FortuneFoundation["topics"][number]["accent"]) {
  return ACCENT[key];
}

/** Detailed mock — replace with API JSON of the same shape */
export function buildMockFoundation(input: {
  nickname: string;
  birthDate: string;
  age: number;
  genderLabel?: string;
}): FortuneFoundation {
  return {
    sectionTitle: "พื้นฐานดวง",
    sectionSubtitle: "แตะแต่ละด้านเพื่ออ่านรายละเอียด",
    profile: {
      nickname: input.nickname,
      birthDate: input.birthDate,
      age: input.age,
      genderLabel: input.genderLabel,
    },
    headline: {
      tag: "ภาพรวมจากพื้นฐานดวง",
      title: "ตั้งหลัก แล้วไปต่อทีละเรื่อง",
      body: `${input.nickname} มีพลังแบบนักสร้างรากฐาน — เหมาะกับการจัดลำดับสิ่งสำคัญก่อน แล้วค่อยขยายผลทีละขั้น`,
    },
    identity: {
      archetype: "นักสร้างรากฐาน",
      summary:
        "คิดเป็นระบบ รับผิดชอบสูง และมักเป็นที่พึ่งของคนรอบตัว จังหวะชีวิตดีขึ้นเมื่อไม่กดดันตัวเองเกินจำเป็น",
      zodiacNameTh: "กันย์",
      element: "ดิน",
      quality: "เปลี่ยนแปลง",
      dateRange: "23 ส.ค. – 22 ก.ย.",
      lifePathNumber: 7,
      lucky: {
        colors: ["เขียวเข้ม", "น้ำเงินคราม", "ขาวมุก"],
        numbers: [3, 7, 12],
        day: "วันพุธ",
        direction: "ทิศตะวันออกเฉียงเหนือ",
      },
    },
    compare: {
      past: {
        label: "พื้นฐานโดยรวม",
        title: "หลายเรื่องในเวลาเดียวกัน",
        body: "มักรับภาระหลายทางพร้อมกัน จนพลังกระจายและตัดสินใจช้าลง",
      },
      present: {
        label: "แนวทางที่เหมาะ",
        title: "เลือกสิ่งสำคัญให้ชัด",
        body: "กลับมาใช้เวลากับเรื่องที่จัดการได้ทีละขั้น จะเห็นผลชัดกว่า",
      },
    },
    topics: [
      {
        id: "work",
        name: "การงาน / การเรียน",
        subtitle: "เคลียร์เรื่องค้างให้เป็นลำดับ",
        accent: "violet",
        past: {
          label: "แนวโน้มจากพื้นฐาน",
          body: "เก่งงานที่ต้องวางแผนและตรวจคุณภาพ แต่ถ้ามีหลายหน้าที่พร้อมกันจะแบ่งแรงได้ยาก",
        },
        present: {
          label: "ช่วงนี้ควรโฟกัส",
          body: "เลือกงานสำคัญที่สุดก่อน และตกลงขอบเขตกับกำหนดส่งให้ชัดเจน",
        },
        tip: "ลองทำวันนี้ · จบงานค้างให้ได้ 1 เรื่อง",
      },
      {
        id: "money",
        name: "การเงิน",
        subtitle: "กลับมาเห็นภาพรายจ่ายชัดขึ้น",
        accent: "amber",
        past: {
          label: "แนวโน้มจากพื้นฐาน",
          body: "ระวังรายจ่ายเล็ก ๆ สะสม หรือการช่วยเหลือคนอื่นจนเงินส่วนตัวบางลง",
        },
        present: {
          label: "ช่วงนี้ควรโฟกัส",
          body: "ทบทวนสิ่งที่จ่ายประจำ และแยกความจำเป็นออกจากสิ่งที่อยากได้",
        },
        tip: "ลองทำวันนี้ · จดรายจ่ายที่จำได้ 3 รายการ",
      },
      {
        id: "love",
        name: "ความรัก",
        subtitle: "เริ่มจากเข้าใจความรู้สึกตัวเอง",
        accent: "rose",
        past: {
          label: "แนวโน้มจากพื้นฐาน",
          body: "แสดงความรักผ่านการดูแลมากกว่าคำพูด บางครั้งเก็บเรื่องคิดไว้คนเดียว",
        },
        present: {
          label: "ช่วงนี้ควรโฟกัส",
          body: "สื่อสารตรง ๆ เรื่องความต้องการ โดยไม่ต้องรีบสรุปความสัมพันธ์",
        },
        tip: "ลองทำวันนี้ · เขียนสิ่งที่ให้ความสำคัญในความสัมพันธ์",
      },
      {
        id: "people",
        name: "ครอบครัว / คนรอบตัว",
        subtitle: "ใส่ใจคนอื่น พร้อมรักษาพื้นที่ตัวเอง",
        accent: "cyan",
        past: {
          label: "แนวโน้มจากพื้นฐาน",
          body: "มักเป็นที่พึ่งของคนใกล้ชิด จนบางครั้งไม่มีเวลาพักของตัวเอง",
        },
        present: {
          label: "ช่วงนี้ควรโฟกัส",
          body: "แบ่งเวลาให้ตัวเองและคนรอบตัวในแบบที่ไหว พูดเมื่อรู้สึกว่ามีภาระมากเกินไป",
        },
        tip: "ลองทำวันนี้ · บอกความต้องการของตัวเองอย่างสุภาพ",
      },
      {
        id: "energy",
        name: "การพักผ่อน / พลังใจ",
        subtitle: "ให้เวลาพักมีที่อยู่ในวันของคุณ",
        accent: "indigo",
        past: {
          label: "แนวโน้มจากพื้นฐาน",
          body: "มาตรฐานสูงทำให้ใจยังไม่พัก แม้ร่างกายจะว่างแล้วก็ตาม",
        },
        present: {
          label: "ช่วงนี้ควรโฟกัส",
          body: "เว้นพื้นที่เล็ก ๆ ระหว่างวันให้กิจกรรมที่ผ่อนคลายและไม่ต้องเร่งรีบ",
        },
        tip: "ลองทำวันนี้ · ให้เวลาตัวเองพักเงียบ ๆ สักครู่",
      },
    ],
    actions: [
      {
        n: "01",
        title: "โฟกัสเรื่องสำคัญ",
        body: "เลือกสิ่งที่อยากทำให้สำเร็จที่สุดเพียงหนึ่งเรื่อง",
      },
      {
        n: "02",
        title: "เผื่อพื้นที่ให้ตัวเอง",
        body: "ก่อนรับเรื่องใหม่ ลองดูว่าเวลาที่มีเพียงพอไหม",
      },
      {
        n: "03",
        title: "เริ่มจากก้าวเล็ก ๆ",
        body: "จัดการเรื่องค้างหนึ่งอย่าง แล้วให้ตัวเองได้พัก",
      },
    ],
    keywords: ["รอบคอบ", "พึ่งพาได้", "รักความเรียบร้อย", "ชอบพัฒนา", "อ่อนไหวภายใน"],
  };
}
