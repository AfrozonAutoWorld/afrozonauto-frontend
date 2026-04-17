import type { VehicleFilters } from '@/types';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export const VALID_SORT_OPTIONS: SortOption[] = [
  'newest',
  'price_asc',
  'price_desc',
  'year_desc',
  'mileage_asc',
];

/** Single mapping from UI sort → API fields (avoids a second React effect fighting URL sync). */
export function sortOptionToApiSort(
  sort: SortOption
): Pick<VehicleFilters, 'sortBy' | 'sortOrder'> {
  return {
    sortBy:
      sort === 'newest'
        ? 'createdAt'
        : sort === 'price_asc' || sort === 'price_desc'
          ? 'price'
          : sort === 'year_desc'
            ? 'year'
            : 'mileage',
    sortOrder:
      sort === 'newest' || sort === 'price_desc' || sort === 'year_desc'
        ? 'desc'
        : 'asc',
  };
}

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
  if (filters.browse === 'trending') p.set('browse', 'trending');
  else if (filters.browse === 'recommended') p.set('browse', 'recommended');
  else if (filters.browse === 'specialty') p.set('browse', 'specialty');
  if (!filters.browse && filters.section) p.set('section', filters.section);
  if (filters.yearMin != null) p.set('yearMin', String(filters.yearMin));
  if (filters.yearMax != null) p.set('yearMax', String(filters.yearMax));
  if (filters.priceMin != null) p.set('priceMin', String(filters.priceMin));
  if (filters.priceMax != null) p.set('priceMax', String(filters.priceMax));
  if (filters.mileageMax != null) p.set('mileageMax', String(filters.mileageMax));
  if (!filters.browse && filters.featured === true) p.set('featured', 'true');
  if (filters.includeApi === false) {
    p.set('includeApi', 'false');
    /** Afrozon sellers: DB-only for-sale inventory. */
    p.set('status', 'AVAILABLE');
  } else if (filters.status) {
    p.set('status', filters.status);
  }
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
  const section = searchParams.get('section') ?? '';
  const browseParam = searchParams.get('browse') ?? '';
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const yearMin = searchParams.get('yearMin');
  const yearMax = searchParams.get('yearMax');
  const mileageMax = searchParams.get('mileageMax');
  const sortParam = searchParams.get('sort');
  const featured = searchParams.get('featured');
  /** Old links used `source=SELLER` for DB-only; marketplace no longer uses `source` for inventory. */
  const legacySellerSource = (searchParams.get('source') ?? '') === 'SELLER';
  const includeApi = searchParams.get('includeApi');
  const statusParam = searchParams.get('status') ?? '';

  const browseFromUrl: FiltersForUrl['browse'] =
    browseParam === 'trending' || browseParam === 'recommended' || browseParam === 'specialty'
      ? (browseParam as FiltersForUrl['browse'])
      : featured === 'true'
        ? 'trending'
        : section === 'recommended'
          ? 'recommended'
          : section === 'specialty'
            ? 'specialty'
            : undefined;

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
    ...(browseFromUrl && { browse: browseFromUrl }),
    ...(section && !browseFromUrl && { section: section as 'recommended' | 'specialty' }),
    ...(priceMin != null && { priceMin: Number(priceMin) }),
    ...(priceMax != null && { priceMax: Number(priceMax) }),
    ...(yearMin != null && { yearMin: Number(yearMin) }),
    ...(yearMax != null && { yearMax: Number(yearMax) }),
    ...(mileageMax != null && { mileageMax: Number(mileageMax) }),
    ...(featured === 'true' && !browseFromUrl && { featured: true }),
    ...((includeApi === 'false' || legacySellerSource) && {
      includeApi: false,
      status: 'AVAILABLE' as FiltersForUrl['status'],
    }),
    ...(statusParam &&
      includeApi !== 'false' &&
      !legacySellerSource && { status: statusParam as FiltersForUrl['status'] }),
  };

  const sort: SortOption =
    sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : 'newest';

  if (browseFromUrl && (make || model || category || q)) {
    delete (filters as { browse?: FiltersForUrl['browse'] }).browse;
  }

  return { filters, sort };
}
