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
  return /^\+[1-9]\d{9,14}$/.test(value);
}
