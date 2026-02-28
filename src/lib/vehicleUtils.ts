import type { Vehicle } from '@/types';

/**
 * Returns the primary image URL for a vehicle, or null if none.
 * No fallback – if no image, don't show the vehicle.
 */
export function getPrimaryImage(vehicle: Vehicle): string | null {
  const primaryImage =
    vehicle.apiData?.listing?.retailListing?.primaryImage ||
    vehicle.apiData?.listing?.wholesaleListing?.primaryImage;

  if (primaryImage) return primaryImage;
  if (vehicle?.images?.length) return vehicle.images[0];
  return null;
}
