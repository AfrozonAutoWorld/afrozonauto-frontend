import type { VehicleFilters } from '@/types';
import type { ActiveFilterChip } from '@/components/vehicles/ActiveFiltersBar';

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
  if (baseFilters.bodyStyle) {
    add('bodyStyle', baseFilters.bodyStyle, () => onFilterChange({ bodyStyle: undefined }));
  }
  if (baseFilters.fuelType) {
    add('fuelType', baseFilters.fuelType, () => onFilterChange({ fuelType: undefined }));
  }
  if (baseFilters.drivetrain) {
    add('drivetrain', baseFilters.drivetrain, () => onFilterChange({ drivetrain: undefined }));
  }
  if (baseFilters.exteriorColor) {
    add('exteriorColor', baseFilters.exteriorColor, () =>
      onFilterChange({ exteriorColor: undefined })
    );
  }
  if (baseFilters.interiorColor) {
    add('interiorColor', baseFilters.interiorColor, () =>
      onFilterChange({ interiorColor: undefined })
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

  return chips;
}
