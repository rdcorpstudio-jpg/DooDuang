/** Normalize Thai mobile numbers to E.164 (+66...). Returns null if invalid. */
export function normalizeThaiMobile(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  let national = digits;
  if (digits.startsWith("66")) {
    national = digits.slice(2);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (hasPlus) {
    return null;
  }

  if (!/^[689]\d{8}$/.test(national)) return null;
  return `+66${national}`;
}

/** BoostSMS uses 08xxxxxxxx, not E.164. */
export function toThaiNationalMobile(e164: string) {
  if (e164.startsWith("+66") && e164.length === 12) {
    return `0${e164.slice(3)}`;
  }
  return e164;
}
