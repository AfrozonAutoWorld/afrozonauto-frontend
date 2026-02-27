/**
 * Make logo URLs from avto-dev vehicle-logotypes (imgix CDN).
 * @see https://github.com/avto-dev/vehicle-logotypes
 * Pattern: https://vl.imgix.net/img/{slug}-logo.png
 */

const CDN_BASE = 'https://vl.imgix.net/img';

/** Known make name -> CDN slug (when not just lowercase). */
const MAKE_TO_SLUG: Record<string, string> = {
  'mercedes': 'mercedes-benz',
  'mercedes-benz': 'mercedes-benz',
  'land rover': 'land-rover',
  'aston martin': 'aston-martin',
  'alfa romeo': 'alfa-romeo',
  'mini': 'mini',
  'rolls-royce': 'rolls-royce',
  'rolls royce': 'rolls-royce',
};

/**
 * Returns a CDN URL for the make’s logo, or undefined if no slug is derived.
 * Use in <img src={...} onError={...} /> and show a fallback (e.g. first letter) on error.
 */
export function getMakeLogoUrl(makeName: string): string {
  const normalized = (makeName ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return '';
  const slug = MAKE_TO_SLUG[normalized] ?? normalized.replace(/\s+/g, '-');
  return `${CDN_BASE}/${slug}-logo.png`;
}
