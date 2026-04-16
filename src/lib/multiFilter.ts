/** Comma-separated multi-select values in filter state / URLs (values must not contain `,`). */
export const MULTI_FILTER_SEP = ',';

export function splitMultiFilter(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return [];
  return raw.split(MULTI_FILTER_SEP).map((s) => s.trim()).filter(Boolean);
}

export function joinMultiFilter(values: string[]): string | undefined {
  const v = values.filter(Boolean);
  return v.length ? v.join(MULTI_FILTER_SEP) : undefined;
}

export function formatMultiFilterLabel(raw: string | undefined): string {
  return splitMultiFilter(raw).join(', ');
}
