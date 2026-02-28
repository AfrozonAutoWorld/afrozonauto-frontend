import type { VehicleFilters } from '@/types';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export const VALID_SORT_OPTIONS: SortOption[] = [
  'newest',
  'price_asc',
  'price_desc',
  'year_desc',
  'mileage_asc',
];

type FiltersForUrl = Omit<VehicleFilters, 'page' | 'limit'>;

/**
 * Build marketplace query string from filters and sort (for shareable URLs).
 */
export function buildMarketplaceQueryString(
  filters: FiltersForUrl,
  sortBy: SortOption
): string {
  const p = new URLSearchParams();
  if (filters.search) p.set('q', filters.search);
  if (filters.make) p.set('make', filters.make);
  if (filters.model) p.set('model', filters.model);
  if (filters.category) p.set('category', filters.category);
  if (filters.bodyStyle) p.set('bodyStyle', filters.bodyStyle);
  if (filters.fuelType) p.set('fuelType', filters.fuelType);
  if (filters.drivetrain) p.set('drivetrain', filters.drivetrain);
  if (filters.vehicleType) p.set('vehicleType', filters.vehicleType);
  if (filters.condition) p.set('condition', filters.condition);
  if (filters.transmission) p.set('transmission', filters.transmission);
  if (filters.exteriorColor) p.set('exteriorColor', filters.exteriorColor);
  if (filters.interiorColor) p.set('interiorColor', filters.interiorColor);
  if (filters.state) p.set('state', filters.state);
  if (filters.yearMin != null) p.set('yearMin', String(filters.yearMin));
  if (filters.yearMax != null) p.set('yearMax', String(filters.yearMax));
  if (filters.priceMin != null) p.set('priceMin', String(filters.priceMin));
  if (filters.priceMax != null) p.set('priceMax', String(filters.priceMax));
  if (filters.mileageMax != null) p.set('mileageMax', String(filters.mileageMax));
  p.set('sort', sortBy);
  return p.toString();
}

export interface ParsedMarketplaceParams {
  filters: Partial<FiltersForUrl>;
  sort: SortOption;
}

/**
 * Parse search params into filters and sort (for reading from URL).
 */
export function parseMarketplaceSearchParams(
  searchParams: URLSearchParams | null
): ParsedMarketplaceParams {
  const defaults: ParsedMarketplaceParams = {
    filters: {},
    sort: 'newest',
  };
  if (!searchParams) return defaults;

  const q = searchParams.get('q') ?? '';
  const make = searchParams.get('make') ?? '';
  const model = searchParams.get('model') ?? '';
  const category = searchParams.get('category') ?? '';
  const bodyStyle = searchParams.get('bodyStyle') ?? '';
  const fuelType = searchParams.get('fuelType') ?? '';
  const drivetrain = searchParams.get('drivetrain') ?? '';
  const vehicleType = searchParams.get('vehicleType') ?? '';
  const condition = searchParams.get('condition') ?? '';
  const transmission = searchParams.get('transmission') ?? '';
  const exteriorColor = searchParams.get('exteriorColor') ?? '';
  const interiorColor = searchParams.get('interiorColor') ?? '';
  const state = searchParams.get('state') ?? '';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const yearMin = searchParams.get('yearMin');
  const yearMax = searchParams.get('yearMax');
  const mileageMax = searchParams.get('mileageMax');
  const sortParam = searchParams.get('sort');

  const filters: Partial<FiltersForUrl> = {
    ...(q && { search: q }),
    ...(make && { make }),
    ...(model && { model }),
    ...(category && { category }),
    ...(bodyStyle && { bodyStyle }),
    ...(fuelType && { fuelType }),
    ...(drivetrain && { drivetrain }),
    ...(vehicleType && { vehicleType: vehicleType as FiltersForUrl['vehicleType'] }),
    ...(condition && { condition: condition as FiltersForUrl['condition'] }),
    ...(transmission && { transmission: transmission as FiltersForUrl['transmission'] }),
    ...(exteriorColor && { exteriorColor }),
    ...(interiorColor && { interiorColor }),
    ...(state && { state }),
    ...(priceMin != null && { priceMin: Number(priceMin) }),
    ...(priceMax != null && { priceMax: Number(priceMax) }),
    ...(yearMin != null && { yearMin: Number(yearMin) }),
    ...(yearMax != null && { yearMax: Number(yearMax) }),
    ...(mileageMax != null && { mileageMax: Number(mileageMax) }),
  };

  const sort: SortOption =
    sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : 'newest';

  return { filters, sort };
}
