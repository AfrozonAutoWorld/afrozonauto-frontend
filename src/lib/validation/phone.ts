export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\+/g, "")}`;
  }
  return `+${cleaned.replace(/\+/g, "")}`;
}

export function isValidInternationalPhone(value: string) {
  // Enforce Nigeria format strictly when country code is +234 (10 local digits).
  if (value.startsWith("+234")) {
    return /^\+234\d{10}$/.test(value);
  }

  // Fallback: E.164-like validation for other country codes.
  return /^\+[1-9]\d{9,14}$/.test(value);
}
