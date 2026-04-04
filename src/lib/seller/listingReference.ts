/** Compact human-readable reference from a listing id (e.g. Mongo ObjectId). */
export function formatListingReferenceId(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, '').slice(0, 12);
  if (hex.length < 8) {
    return `#${id.slice(0, 8).toUpperCase()}`;
  }
  const parts = [hex.slice(0, 4), hex.slice(4, 8), hex.slice(8, 12)].filter(Boolean);
  return `#${parts.join('-').toUpperCase()}`;
}
