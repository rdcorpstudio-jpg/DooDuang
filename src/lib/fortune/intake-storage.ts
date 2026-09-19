import type { FortuneFocus } from "@/lib/fortune/analyze";

/**
 * ข้อมูลฟอร์มสั้นก่อนซื้อ (ชื่อเรียก + เรื่องที่อยากดู)
 * เก็บชั่วคราวใน sessionStorage แล้วนำไปเติมในฟอร์มเชิงลึกหลังชำระเงิน
 */
export const INTAKE_KEY = "dooduang-intake";

export type OnboardingIntake = {
  nickname: string;
  /** เรื่องที่อยากดู — ก่อนซื้อเลือกหลักได้ 1 เรื่อง */
  focus: FortuneFocus;
};

export function readIntake(): OnboardingIntake | null {
  try {
    const raw = sessionStorage.getItem(INTAKE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingIntake>;
    if (!parsed?.nickname || !parsed.nickname.trim()) return null;
    return {
      nickname: parsed.nickname.trim(),
      focus: (parsed.focus as FortuneFocus) || "life",
    };
  } catch {
    return null;
  }
}

export function writeIntake(intake: OnboardingIntake) {
  try {
    sessionStorage.setItem(
      INTAKE_KEY,
      JSON.stringify({
        nickname: intake.nickname.trim(),
        focus: intake.focus,
      }),
    );
  } catch {
    /* ignore */
  }
}

export function clearIntake() {
  try {
    sessionStorage.removeItem(INTAKE_KEY);
  } catch {
    /* ignore */
  }
}
