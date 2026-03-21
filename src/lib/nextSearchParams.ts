/** Normalize Next.js App Router `searchParams` values (string | string[] | undefined). */
export function firstSearchParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  const v = params?.[key];
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}
