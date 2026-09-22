/** localStorage flag — UI-only skip past login while developing. */
export const LOCAL_AUTH_BYPASS_KEY = "dooduang-local-auth-bypass";

/** True only in `next dev` (never production builds). */
export function isLocalDevUi(): boolean {
  return process.env.NODE_ENV === "development";
}

export function hasLocalAuthBypass(): boolean {
  if (!isLocalDevUi()) return false;
  try {
    return localStorage.getItem(LOCAL_AUTH_BYPASS_KEY) === "1";
  } catch {
    return false;
  }
}

export function enableLocalAuthBypass() {
  if (!isLocalDevUi()) return;
  try {
    localStorage.setItem(LOCAL_AUTH_BYPASS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearLocalAuthBypass() {
  try {
    localStorage.removeItem(LOCAL_AUTH_BYPASS_KEY);
  } catch {
    /* ignore */
  }
}
