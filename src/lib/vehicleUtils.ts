import type { Vehicle } from '@/types';

function trimUrl(v: string | undefined | null): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

/**
 * Single place for “hero” image on cards and list rows.
 *
 * Order: **thumbnail** (explicit primary when admin/seed sets it) → **images[0]**
 * → **Auto.dev** `apiData.listing` retail/wholesale `primaryImage` (API-only rows).
 *
 * `normalizeVehicleForUi` already fills `images` + `thumbnail` from Auto.dev retail when needed,
 * so Auto.dev listings usually resolve via thumbnail or images without hitting nested paths.
 */
export function getPrimaryImage(vehicle: Vehicle): string | null {
  const thumb = trimUrl(vehicle.thumbnail);
  if (thumb) return thumb;

  if (Array.isArray(vehicle.images)) {
    for (const u of vehicle.images) {
      const s = trimUrl(u);
      if (s) return s;
    }
  }

  const fromListing =
    vehicle.apiData?.listing?.retailListing?.primaryImage ??
    vehicle.apiData?.listing?.wholesaleListing?.primaryImage;
  return trimUrl(fromListing as string | undefined);
}
