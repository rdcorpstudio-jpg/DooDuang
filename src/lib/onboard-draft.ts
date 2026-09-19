import type { Gender } from "@/components/ui/sacred-form";
import type { HomeTopicId } from "@/lib/home-topics";

const KEY = "dooduang-onboard-draft";

export type OnboardFormStep = "gender" | "birth" | "name";

export type OnboardDraft = {
  topic: HomeTopicId | null;
  gender: Gender | "";
  birthDate: string;
  nickname: string;
  realName: string;
  formStep: OnboardFormStep;
};

export function readOnboardDraft(): OnboardDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeOnboardDraft(draft: OnboardDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function clearOnboardDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
