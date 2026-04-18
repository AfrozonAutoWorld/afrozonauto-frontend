import type { VehicleFilters } from '@/types';
import type { ActiveFilterChip } from '@/components/vehicles/ActiveFiltersBar';
import { formatMultiFilterLabel } from '@/lib/multiFilter';

type Filters = Omit<VehicleFilters, 'page' | 'limit'>;
type OnFilterChange = (newFilters: Partial<VehicleFilters>) => void;

/**
 * Build the list of active filter chips from current filters (for ActiveFiltersBar).
 */
export function buildActiveFilterChips(
  baseFilters: Filters,
  onFilterChange: OnFilterChange
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  const add = (id: string, label: string, clear: () => void) => {
    chips.push({ id, label, onRemove: clear });
  };

  if (baseFilters.search?.trim()) {
    add('search', `“${baseFilters.search.trim()}”`, () => onFilterChange({ search: undefined }));
  }
  if (baseFilters.make) {
    add('make', baseFilters.make, () => onFilterChange({ make: undefined, model: undefined }));
  }
  if (baseFilters.model) {
    add('model', baseFilters.model, () => onFilterChange({ model: undefined }));
  }
  if (baseFilters.yearMin != null || baseFilters.yearMax != null) {
    const from = baseFilters.yearMin ?? 'Any';
    const to = baseFilters.yearMax ?? 'Any';
    add('year', `${from}-${to}`, () =>
      onFilterChange({ yearMin: undefined, yearMax: undefined })
    );
  }
  if (baseFilters.condition) {
    const label =
      baseFilters.condition === 'cpo'
        ? 'CPO'
        : baseFilters.condition[0].toUpperCase() + baseFilters.condition.slice(1);
    add('condition', label, () => onFilterChange({ condition: undefined }));
  }
  if (baseFilters.vehicleType) {
    add('vehicleType', baseFilters.vehicleType, () => onFilterChange({ vehicleType: undefined }));
  }
  if (baseFilters.bodyStyle) {
    add('bodyStyle', formatMultiFilterLabel(baseFilters.bodyStyle), () =>
      onFilterChange({ bodyStyle: undefined }),
    );
  }
  if (baseFilters.fuelType) {
    add('fuelType', formatMultiFilterLabel(baseFilters.fuelType), () =>
      onFilterChange({ fuelType: undefined }),
    );
  }
  if (baseFilters.transmission) {
    add('transmission', formatMultiFilterLabel(baseFilters.transmission), () =>
      onFilterChange({ transmission: undefined }),
    );
  }
  if (baseFilters.drivetrain) {
    add('drivetrain', formatMultiFilterLabel(baseFilters.drivetrain), () =>
      onFilterChange({ drivetrain: undefined }),
    );
  }
  if (baseFilters.exteriorColor) {
    add('exteriorColor', formatMultiFilterLabel(baseFilters.exteriorColor), () =>
      onFilterChange({ exteriorColor: undefined }),
    );
  }
  if (baseFilters.interiorColor) {
    add('interiorColor', formatMultiFilterLabel(baseFilters.interiorColor), () =>
      onFilterChange({ interiorColor: undefined }),
    );
  }
  if (baseFilters.priceMin != null || baseFilters.priceMax != null) {
    add(
      'price',
      `${baseFilters.priceMin?.toLocaleString() ?? 'Any'}–${
        baseFilters.priceMax?.toLocaleString() ?? 'Any'
      }`,
      () => onFilterChange({ priceMin: undefined, priceMax: undefined })
    );
  }
  if (baseFilters.mileageMax != null) {
    add(
      'mileage',
      `Under ${baseFilters.mileageMax.toLocaleString()} mi`,
      () => onFilterChange({ mileageMax: undefined })
    );
  }
  if (baseFilters.browse === 'trending') {
    add('browse', 'Featured vehicles', () => onFilterChange({ browse: undefined }));
  } else if (baseFilters.browse === 'recommended') {
    add('browse', 'Recommended for you', () => onFilterChange({ browse: undefined }));
  } else if (baseFilters.browse === 'specialty') {
    add('browse', 'Specialty vehicles', () => onFilterChange({ browse: undefined }));
  }
  if (baseFilters.featured === true) {
    add('featured', 'Featured only', () => onFilterChange({ featured: undefined }));
  }
  /** DB-only catalog (all vehicles in our DB; no `Vehicle.source` filter). */
  if (baseFilters.includeApi === false) {
    add('dbOnly', 'Afrozon sellers', () =>
      onFilterChange({ includeApi: true, status: undefined }),
    );
  }

  return chips;
}
