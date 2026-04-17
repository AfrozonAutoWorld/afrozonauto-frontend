'use client';

import { useState, useMemo, useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { VehicleFilters as VehicleFilterType, VehicleType } from '../../types';
import { mergeMakeOptionsWithReference } from '../../lib/pricingCalculator';
import { getModelNamesForMake } from '../../lib/carModels';
import { useMakeModelsReference } from '../../hooks/useVehicles';
import { AdvancedFilterSidebar } from '@/components/filters';
import type { FilterCategoryConfig } from '@/components/filters';
import type { FilterGroup } from '@/components/filters/types';
import { joinMultiFilter, splitMultiFilter } from '@/lib/multiFilter';

function toggleCsvValue(
  current: string | undefined,
  value: string,
  checked: boolean
): string | undefined {
  const set = new Set(splitMultiFilter(current));
  if (checked) set.add(value);
  else set.delete(value);
  return joinMultiFilter([...set]);
}

/** All inventory + API merge (default). */
const INVENTORY_VALUE_ALL = '';
/** Full DB catalog only (no Auto.dev); does not use `Vehicle.source`. */
const INVENTORY_VALUE_DB_ONLY = 'db_only';

interface VehicleFiltersProps {
  filters: VehicleFilterType;
  onFilterChange: (filters: VehicleFilterType) => void;
  onClearFilters?: () => void;
  /** Optional total result count to show in the sidebar */
  resultCount?: number;
}

const vehicleTypes: Array<{ value: VehicleType; label: string }> = [
  { value: 'CAR', label: 'Car' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
];

const conditionOptions = [
  { value: '', label: 'All conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'cpo', label: 'CPO (Certified Pre-Owned)' },
];

const bodyStyleOptions = ['Car', 'SUV', 'Truck', 'Van', 'Minivan'];

const fuelOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-In Hybrid', 'Flex Fuel'];

const transmissionOptions = ['Automatic', 'Manual', 'CVT', 'Dual-Clutch', 'Single-Speed'];

const drivetrainOptions = ['AWD', 'FWD', 'RWD', '4WD'];

const exteriorColorHex: Record<string, string> = {
  Black: '#1A1A1A',
  White: '#FFFFFF',
  Gray: '#6B6B6B',
  Silver: '#C0C0C0',
  Blue: '#1A3A6B',
  Red: '#8B0000',
  Green: '#3A5C2A',
  Brown: '#8B6914',
  Yellow: '#FFD700',
  Orange: '#FF8C00',
  Beige: '#C0C0C0',
  Gold: '#FFD700',
};

const exteriorColorOptions = ['Black', 'White', 'Gray', 'Silver', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange', 'Beige', 'Gold'];

const interiorColorOptions = ['Black', 'Gray', 'Beige', 'Brown', 'White', 'Red', 'Blue', 'Tan'];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => currentYear - i);

const mileagePresets = [
  { value: '', label: 'Any mileage' },
  { value: '30000', label: 'Under 30,000 mi' },
  { value: '60000', label: 'Under 60,000 mi' },
  { value: '100000', label: 'Under 100,000 mi' },
  { value: '150000', label: 'Under 150,000 mi' },
];

const PRICE_MIN = 1000;
const PRICE_MAX = 150000;

export function VehicleFilters({ filters, onFilterChange, onClearFilters, resultCount = 0 }: VehicleFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { makeModels } = useMakeModelsReference();

  const selectedMakes = useMemo(() => splitMultiFilter(filters.make), [filters.make]);

  /** Union of model names across selected makes; filter value stays flat CSV OR semantics. */
  const mergedModelNames = useMemo(() => {
    if (selectedMakes.length === 0) return [];
    const set = new Set<string>();
    for (const make of selectedMakes) {
      for (const m of getModelNamesForMake(make, makeModels)) {
        set.add(m);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [selectedMakes, makeModels]);

  const makeOptions = useMemo(
    () => mergeMakeOptionsWithReference(makeModels),
    [makeModels]
  );

  const handleMakeToggle = useCallback(
    (value: string, checked: boolean) => {
      onFilterChange({
        ...filters,
        make: toggleCsvValue(filters.make, value, checked),
        model: undefined,
      });
    },
    [filters, onFilterChange]
  );

  const handleModelToggle = useCallback(
    (value: string, checked: boolean) => {
      onFilterChange({
        ...filters,
        model: toggleCsvValue(filters.model, value, checked),
      });
    },
    [filters, onFilterChange]
  );

  const handleConditionChange = (v: string) => {
    const value = (v === 'new' || v === 'used' || v === 'cpo' ? v : undefined) as VehicleFilterType['condition'];
    onFilterChange({ ...filters, condition: value });
  };

  const handleVehicleTypeToggle = useCallback(
    (value: string, checked: boolean) => {
      const allowed = new Set<string>(vehicleTypes.map((t) => t.value));
      if (!allowed.has(value)) return;
      onFilterChange({
        ...filters,
        vehicleType: toggleCsvValue(filters.vehicleType as string | undefined, value, checked) as VehicleFilterType['vehicleType'],
      });
    },
    [filters, onFilterChange]
  );

  const handleYearFromChange = (year: number | undefined) => {
    onFilterChange({ ...filters, yearMin: year });
  };

  const handleYearToChange = (year: number | undefined) => {
    onFilterChange({ ...filters, yearMax: year });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceMin: min, priceMax: max });
  };

  const handleMileageChange = (value: string) => {
    const num = value ? Number.parseInt(value, 10) : undefined;
    onFilterChange({ mileageMax: num });
  };

  const inventoryScopeValue = useMemo(() => {
    if (filters.includeApi === false) return INVENTORY_VALUE_DB_ONLY;
    return INVENTORY_VALUE_ALL;
  }, [filters.includeApi]);

  const handleInventoryScopeChange = useCallback(
    (v: string) => {
      if (v === INVENTORY_VALUE_DB_ONLY) {
        onFilterChange({
          ...filters,
          source: undefined,
          includeApi: false,
          status: 'AVAILABLE',
        });
        return;
      }
      onFilterChange({ ...filters, source: undefined, includeApi: true, status: undefined });
    },
    [filters, onFilterChange],
  );

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange({
        page: filters.page,
        limit: filters.limit,
        includeApi: true,
        source: undefined,
        status: undefined,
        category: filters.category,
      });
    }
  };

  const activeFiltersCount = [
    filters.make,
    filters.vehicleType,
    filters.model,
    filters.condition,
    filters.bodyStyle,
    filters.transmission,
    filters.fuelType,
    filters.drivetrain,
    filters.exteriorColor,
    filters.interiorColor,
    filters.priceMin,
    filters.priceMax,
    filters.yearMin,
    filters.yearMax,
    filters.mileageMax,
    filters.state,
    filters.zip,
    filters.distance,
    filters.search,
  ].filter((v) => v !== undefined && v !== '').length + (inventoryScopeValue !== INVENTORY_VALUE_ALL ? 1 : 0);

  const categories = useMemo((): FilterCategoryConfig[] => {
    const conditionOpts = conditionOptions.map((o) => ({ value: o.value, label: o.label }));
    const vehicleTypeOpts = vehicleTypes.map((t) => ({ value: t.value, label: t.label }));
    const makeOpts = makeOptions.map((m) => ({ value: m, label: m }));
    const mileageOpts = mileagePresets.map((p) => ({ value: p.value, label: p.label }));
    const inventoryOpts = [
      { value: INVENTORY_VALUE_ALL, label: 'All inventory' },
      { value: INVENTORY_VALUE_DB_ONLY, label: 'Afrozon sellers' },
    ];
    const bodyOpts = bodyStyleOptions.map((b) => ({ value: b, label: b }));
    const fuelOpts = fuelOptions.map((f) => ({ value: f, label: f }));
    const transOpts = transmissionOptions.map((t) => ({ value: t, label: t }));
    const driveOpts = drivetrainOptions.map((d) => ({ value: d, label: d }));
    const makeSelected = splitMultiFilter(filters.make);
    const modelSelected = splitMultiFilter(filters.model);
    const vehicleTypeSelected = splitMultiFilter(filters.vehicleType as string | undefined);
    const bodySelected = splitMultiFilter(filters.bodyStyle);
    const fuelSelected = splitMultiFilter(filters.fuelType);
    const transSelected = splitMultiFilter(filters.transmission);
    const driveSelected = splitMultiFilter(filters.drivetrain);
    const extColorSelected = splitMultiFilter(filters.exteriorColor);
    const intColorSelected = splitMultiFilter(filters.interiorColor);
    const extColorOpts = exteriorColorOptions.map((c) => ({
      value: c,
      label: c,
      hex: exteriorColorHex[c] ?? '#999',
    }));
    const intColorOpts = interiorColorOptions.map((c) => ({
      value: c,
      label: c,
      hex: exteriorColorHex[c] ?? '#999',
    }));

    const modelGroups: FilterGroup[] =
      mergedModelNames.length > 0
        ? [
            {
              id: 'model',
              type: 'checkbox' as const,
              title: 'Model',
              hasActiveFilters: mergedModelNames.some((m) => modelSelected.includes(m)),
              options: mergedModelNames.map((m) => ({ value: m, label: m })),
              selected: modelSelected.filter((m) => mergedModelNames.includes(m)),
              onChange: handleModelToggle,
            },
          ]
        : [];

    return [
      {
        id: 'basics',
        title: 'BASICS',
        groups: [
          {
            id: 'condition',
            type: 'radio',
            title: 'Condition',
            hasActiveFilters: !!filters.condition,
            options: conditionOpts,
            value: filters.condition ?? '',
            onChange: handleConditionChange,
          },
          {
            id: 'vehicleType',
            type: 'checkbox',
            title: 'Vehicle type',
            hasActiveFilters: vehicleTypeSelected.length > 0,
            options: vehicleTypeOpts,
            selected: vehicleTypeSelected,
            onChange: handleVehicleTypeToggle,
          },
          {
            id: 'make',
            type: 'checkbox',
            title: 'Make',
            hasActiveFilters: makeSelected.length > 0,
            options: makeOpts,
            selected: makeSelected,
            onChange: handleMakeToggle,
          },
          ...modelGroups,
          {
            id: 'year',
            type: 'yearRange',
            title: 'Year',
            hasActiveFilters: filters.yearMin != null || filters.yearMax != null,
            yearFrom: filters.yearMin,
            yearTo: filters.yearMax,
            yearOptions,
            onFromChange: handleYearFromChange,
            onToChange: handleYearToChange,
          },
          {
            id: 'price',
            type: 'priceRange',
            title: 'Price (USD)',
            hasActiveFilters: filters.priceMin != null || filters.priceMax != null,
            min: PRICE_MIN,
            max: PRICE_MAX,
            valueMin: filters.priceMin ?? PRICE_MIN,
            valueMax: filters.priceMax ?? PRICE_MAX,
            onChange: handlePriceRangeChange,
            helperText: 'US vehicle price. Total landed cost shown on cards',
          },
          {
            id: 'mileage',
            type: 'radio',
            title: 'Mileage',
            hasActiveFilters: filters.mileageMax != null,
            options: mileageOpts,
            value: filters.mileageMax?.toString() ?? '',
            onChange: handleMileageChange,
          },
          {
            id: 'inventory',
            type: 'radio',
            title: 'Inventory source',
            hasActiveFilters: inventoryScopeValue !== INVENTORY_VALUE_ALL,
            options: inventoryOpts,
            value: inventoryScopeValue,
            onChange: handleInventoryScopeChange,
            // helperText:
            //   inventoryScopeValue === INVENTORY_VALUE_DB_ONLY
            //     ? 'Every vehicle we have stored (seller uploads, imports, etc.). No live catalog fill.'
            //     : undefined,
          },
        ],
      },
      {
        id: 'style',
        title: 'STYLE',
        groups: [
          {
            id: 'bodyStyle',
            type: 'checkbox',
            title: 'Body style',
            hasActiveFilters: bodySelected.length > 0,
            options: bodyOpts,
            selected: bodySelected,
            onChange: (value, checked) =>
              onFilterChange({
                ...filters,
                bodyStyle: toggleCsvValue(filters.bodyStyle, value, checked),
              }),
          },
          {
            id: 'exteriorColor',
            type: 'colorSwatches',
            title: 'Exterior color',
            hasActiveFilters: extColorSelected.length > 0,
            options: extColorOpts,
            selected: extColorSelected,
            onChange: (value, selected) =>
              onFilterChange({
                ...filters,
                exteriorColor: toggleCsvValue(filters.exteriorColor, value, selected),
              }),
          },
          {
            id: 'interiorColor',
            type: 'colorSwatches',
            title: 'Interior color',
            hasActiveFilters: intColorSelected.length > 0,
            options: intColorOpts,
            selected: intColorSelected,
            onChange: (value, selected) =>
              onFilterChange({
                ...filters,
                interiorColor: toggleCsvValue(filters.interiorColor, value, selected),
              }),
          },
        ],
      },
      {
        id: 'performance',
        title: 'PERFORMANCE',
        groups: [
          {
            id: 'fuelType',
            type: 'checkbox',
            title: 'Fuel type',
            hasActiveFilters: fuelSelected.length > 0,
            options: fuelOpts,
            selected: fuelSelected,
            onChange: (value, checked) =>
              onFilterChange({
                ...filters,
                fuelType: toggleCsvValue(filters.fuelType, value, checked),
              }),
          },
          {
            id: 'transmission',
            type: 'checkbox',
            title: 'Transmission',
            hasActiveFilters: transSelected.length > 0,
            options: transOpts,
            selected: transSelected,
            onChange: (value, checked) =>
              onFilterChange({
                ...filters,
                transmission: toggleCsvValue(filters.transmission, value, checked),
              }),
          },
          {
            id: 'drivetrain',
            type: 'checkbox',
            title: 'Drive train',
            hasActiveFilters: driveSelected.length > 0,
            options: driveOpts,
            selected: driveSelected,
            onChange: (value, checked) =>
              onFilterChange({
                ...filters,
                drivetrain: toggleCsvValue(filters.drivetrain, value, checked),
              }),
          },
        ],
      },
    ];
  }, [
    filters,
    makeOptions,
    mergedModelNames,
    yearOptions,
    handleMakeToggle,
    handleModelToggle,
    handleVehicleTypeToggle,
  ]);

  const sidebarContent = (
    <AdvancedFilterSidebar
      activeFilterCount={activeFiltersCount}
      resultCount={resultCount}
      categories={categories}
      onClearAll={clearFilters}
    />
  );

  return (
    <>
      <div className="hidden flex-shrink-0 h-screen lg:block">
        {sidebarContent}
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex gap-2 items-center px-4 py-2 rounded-lg border text-filter-label bg-filter-surface border-filter-border"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-filter-primary text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="overflow-y-auto absolute top-0 right-0 bottom-0 w-full max-w-[294px] bg-filter-bg">
              <div className="flex sticky top-0 z-10 justify-between items-center px-4 py-3 border-b bg-filter-surface border-filter-border">
                <h3 className="text-lg font-semibold font-body text-filter-label">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-filter-muted hover:text-filter-label"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-0">
                {sidebarContent}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
