import type { MarketplaceVehicle, VehicleStatus } from '@/lib/marketplace/types';

/** Seller listing row from seller-vehicles APIs (camelCase JSON). */
export type SellerListingVehicle = {
  id: string;
  userId?: string | null;
  status: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  vehicleType?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  engineSize?: string | null;
  drivetrain?: string | null;
  mileage?: number | null;
  vin: string;
  manualNotes?: string | null;
  adminNotes?: string | null;
  features?: string[];
  dealerName?: string | null;
  dealerCity?: string | null;
  city?: string | null;
  dealerState?: string | null;
  bodyStyle?: string | null;
  trim?: string | null;
  viewCount?: number | null;
  saveCount?: number | null;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  /** Present on full listing GET — used to prefill sell form */
  condition?: string | null;
  titleStatus?: string[] | null;
  accidentHistory?: string | null;
  knownIssues?: string[] | null;
  modifications?: string | null;
  keys?: number | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  zipCode?: string | null;
  preferredContact?: string | null;
  bestTimeToReach?: string | null;
  showAskingPrice?: boolean | null;
};

/**
 * Map backend enum values to dashboard `VehicleStatus` (labels + filters).
 */
export function mapPrismaStatusToDashboardStatus(status: string): VehicleStatus {
  switch (status) {
    case 'AVAILABLE':
      return 'APPROVED';
    case 'REVIEWING':
    case 'PENDING_REVIEW':
      return 'PENDING_REVIEW';
    case 'REJECTED':
      return 'REJECTED';
    case 'SOLD':
      return 'SOLD';
    case 'PENDING':
    case 'UNAVAILABLE':
    case 'RESERVED':
      return 'PENDING_REVIEW';
    default:
      return 'PENDING_REVIEW';
  }
}

export function mapSellerApiVehicleToMarketplace(v: SellerListingVehicle): MarketplaceVehicle {
  const images = Array.isArray(v.images) ? v.images : [];
  const title = [v.year, v.make, v.model].filter(Boolean).join(' ').trim() || 'Listing';
  const uiStatus = mapPrismaStatusToDashboardStatus(v.status);

  return {
    id: v.id,
    seller_id: v.userId ?? '',
    status: uiStatus,
    title,
    make: v.make,
    model: v.model,
    year: v.year,
    price_usd: v.priceUsd ?? 0,
    vehicle_type: v.vehicleType ?? '',
    exterior_color: v.exteriorColor ?? '',
    interior_color: v.interiorColor ?? '',
    transmission: v.transmission ?? '',
    fuel_type: v.fuelType ?? '',
    engine_size: v.engineSize ?? '',
    drivetrain: v.drivetrain ?? '',
    mileage: v.mileage ?? 0,
    vin: v.vin,
    description: v.manualNotes ?? '',
    features: v.features ?? [],
    location_city: v.city ?? v.dealerCity ?? '',
    location_state: v.dealerState ?? '',
    rejection_reason: uiStatus === 'REJECTED' ? v.adminNotes ?? null : null,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
    images: images.map((url, i) => ({
      id: `${v.id}-img-${i}`,
      vehicle_id: v.id,
      url,
      is_primary: i === 0,
      sort_order: i,
      created_at: v.createdAt,
    })),
  };
}
