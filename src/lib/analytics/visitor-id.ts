const VISITOR_KEY = "dd-visitor-id";

/** Stable anonymous visitor id for analytics (localStorage). */
export function getOrCreateVisitorId(): string {
  try {
    if (typeof window === "undefined") return `v_${Date.now()}`;
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now()}`;
  }
}
