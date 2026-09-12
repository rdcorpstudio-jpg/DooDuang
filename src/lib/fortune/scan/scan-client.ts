import type {
  FaceReadingPack,
  PalmReadingPack,
} from "@/lib/fortune/scan/types";

export class AiScanError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AiScanError";
    this.code = code;
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("อ่านรูปไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

function messageForScanFailure(status: number, code?: string, error?: string) {
  if (status === 401 || code === "UNAUTHENTICATED") {
    return "ต้องเข้าสู่ระบบก่อนใช้ฟีเจอร์นี้";
  }
  if (status === 403 || code === "PREMIUM_REQUIRED") {
    return "ต้องเป็นสมาชิกพรีเมียมก่อนสแกน";
  }
  if (status === 503 || code === "NO_API_KEY") {
    return "ยังไม่ได้ตั้งค่า OPENAI_API_KEY บนเซิร์ฟเวอร์";
  }
  if (status === 413) {
    return error || "รูปใหญ่เกินไป ลองถ่ายใหม่";
  }
  if (status === 400) {
    return error || "รูปไม่ถูกต้อง";
  }
  if (status === 502 || code === "AI_FAILED") {
    return "วิเคราะห์ด้วย AI ไม่สำเร็จ ลองใหม่อีกครั้ง";
  }
  return error || "เชื่อมต่อ AI ไม่สำเร็จ";
}

/** Call server OpenAI vision scan. Throws if unavailable / failed. */
export async function requestAiScanPack(
  mode: "face",
  files: File | File[]
): Promise<FaceReadingPack>;
export async function requestAiScanPack(
  mode: "palm",
  files: File | File[]
): Promise<PalmReadingPack>;
export async function requestAiScanPack(
  mode: "face" | "palm",
  files: File | File[]
): Promise<FaceReadingPack | PalmReadingPack> {
  const list = Array.isArray(files) ? files : [files];
  const imageDataUrls = await Promise.all(list.map(fileToDataUrl));
  let res: Response;
  try {
    res = await fetch("/api/fortune/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, imageDataUrls }),
    });
  } catch {
    throw new AiScanError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
  }

  let data: {
    pack?: FaceReadingPack | PalmReadingPack;
    error?: string;
    code?: string;
  } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw new AiScanError("เซิร์ฟเวอร์ตอบกลับผิดพลาด");
  }

  if (!res.ok || !data.pack) {
    throw new AiScanError(
      messageForScanFailure(res.status, data.code, data.error),
      data.code
    );
  }

  return data.pack;
}
