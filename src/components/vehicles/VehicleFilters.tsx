'use client';

import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { VehicleFilters as VehicleFilterType, VehicleType } from '../../types';
import { VEHICLE_MAKES } from '../../lib/pricingCalculator';
import { carModels } from '../../lib/carModels';
import { useMakeModelsReference } from '../../hooks/useVehicles';
import { AdvancedFilterSidebar } from '@/components/filters';
import type { FilterCategoryConfig } from '@/components/filters';
import type { FilterGroup } from '@/components/filters/types';

interface VehicleFiltersProps {
  filters: VehicleFilterType;
  onFilterChange: (filters: VehicleFilterType) => void;
  onClearFilters?: () => void;
  /** Optional total result count to show in the sidebar */
  resultCount?: number;
}

const vehicleTypes: VehicleType[] = ['CAR', 'SUV', 'TRUCK', 'VAN', 'SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'CONVERTIBLE', 'MOTORCYCLE'];

const conditionOptions = [
  { value: '', label: 'All conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'cpo', label: 'CPO (Certified Pre-Owned)' },
];

const bodyStyleOptions = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Pickup Truck', 'Truck'];

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
  const [localMileage, setLocalMileage] = useState<string>(filters.mileageMax?.toString() || '');
  const [debouncedMileage, setDebouncedMileage] = useState<string>(filters.mileageMax?.toString() || '');

  const { makeModels } = useMakeModelsReference();

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const resolveMakeKey = (make: string) => {
    if (makeModels[make]) return make;
    const target = normalize(make);
    const hit = Object.keys(makeModels).find((k) => normalize(k) === target);
    return hit ?? make;
  };

  const resolvedMakeKey = filters.make ? resolveMakeKey(filters.make) : undefined;
  const availableModels =
    resolvedMakeKey && makeModels[resolvedMakeKey]?.length
      ? makeModels[resolvedMakeKey]
      : (filters.make && carModels[filters.make as keyof typeof carModels]
        ? carModels[filters.make as keyof typeof carModels]
        : []);

  const makeOptions = Object.keys(makeModels).length > 0 ? Object.keys(makeModels).sort() : VEHICLE_MAKES;

  useEffect(() => {
    const externalMileage = filters.mileageMax?.toString() || '';
    if (externalMileage !== localMileage) {
      setLocalMileage(externalMileage);
      setDebouncedMileage(externalMileage);
    }
  }, [filters.mileageMax]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMileage(localMileage), 500);
    return () => clearTimeout(timer);
  }, [localMileage]);

  useEffect(() => {
    const mileage = debouncedMileage ? parseInt(debouncedMileage, 10) : undefined;
    if ((mileage === undefined || !isNaN(mileage)) && mileage !== filters.mileageMax) {
      onFilterChange({ ...filters, mileageMax: mileage });
    }
  }, [debouncedMileage]);

  const handleMakeChange = (make: string) => {
    onFilterChange({ ...filters, make: make || undefined, model: undefined });
  };

  const handleModelChange = (model: string) => {
    onFilterChange({ ...filters, model: model || undefined });
  };

  const handleConditionChange = (v: string) => {
    const value = (v === 'new' || v === 'used' || v === 'cpo' ? v : undefined) as VehicleFilterType['condition'];
    onFilterChange({ ...filters, condition: value });
  };

  const handleBodyStyleChange = (v: string) => {
    onFilterChange({ ...filters, bodyStyle: v || undefined });
  };

  const handleFuelChange = (v: string) => {
    onFilterChange({ ...filters, fuelType: v || undefined });
  };

  const handleTransmissionChange = (v: string) => {
    onFilterChange({ ...filters, transmission: (v || undefined) as VehicleFilterType['transmission'] });
  };

  const handleDrivetrainChange = (v: string) => {
    onFilterChange({ ...filters, drivetrain: v || undefined });
  };

  const handleExteriorColorChange = (v: string) => {
    onFilterChange({ ...filters, exteriorColor: v || undefined });
  };

  const handleInteriorColorChange = (v: string) => {
    onFilterChange({ ...filters, interiorColor: v || undefined });
  };

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
    const num = value ? parseInt(value, 10) : undefined;
    onFilterChange({ ...filters, mileageMax: num });
    setLocalMileage(value);
    setDebouncedMileage(value);
  };

  const clearFilters = () => {
    setLocalMileage('');
    setDebouncedMileage('');
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange({
        page: filters.page,
        limit: filters.limit,
        includeApi: filters.includeApi,
        status: filters.status,
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
  ].filter((v) => v !== undefined && v !== '').length;

  const categories = useMemo((): FilterCategoryConfig[] => {
    const conditionOpts = conditionOptions.map((o) => ({ value: o.value, label: o.label }));
    const makeOpts = makeOptions.map((m) => ({ value: m, label: m }));
    const modelOpts = availableModels.map((m) => ({ value: m, label: m }));
    const mileageOpts = mileagePresets.map((p) => ({ value: p.value, label: p.label }));
    const bodyOpts = bodyStyleOptions.map((b) => ({ value: b, label: b }));
    const fuelOpts = fuelOptions.map((f) => ({ value: f, label: f }));
    const transOpts = transmissionOptions.map((t) => ({ value: t, label: t }));
    const driveOpts = drivetrainOptions.map((d) => ({ value: d, label: d }));
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

    const modelGroup: FilterGroup[] =
      filters.make && modelOpts.length > 0
        ? [
            {
              id: 'model',
              type: 'radio',
              title: 'Model',
              hasActiveFilters: !!filters.model,
              options: modelOpts,
              value: filters.model ?? undefined,
              onChange: handleModelChange,
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
            id: 'make',
            type: 'radio',
            title: 'Make',
            hasActiveFilters: !!filters.make,
            options: makeOpts,
            value: filters.make ?? undefined,
            onChange: handleMakeChange,
          },
          ...modelGroup,
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
        ],
      },
      {
        id: 'style',
        title: 'STYLE',
        groups: [
          {
            id: 'bodyStyle',
            type: 'radio',
            title: 'Body style',
            hasActiveFilters: !!filters.bodyStyle,
            options: bodyOpts,
            value: filters.bodyStyle ?? undefined,
            onChange: handleBodyStyleChange,
          },
          {
            id: 'exteriorColor',
            type: 'colorSwatches',
            title: 'Exterior color',
            hasActiveFilters: !!filters.exteriorColor,
            options: extColorOpts,
            selected: filters.exteriorColor ? [filters.exteriorColor] : [],
            onChange: (value, selected) => {
              handleExteriorColorChange(selected ? value : '');
            },
          },
          {
            id: 'interiorColor',
            type: 'colorSwatches',
            title: 'Interior color',
            hasActiveFilters: !!filters.interiorColor,
            options: intColorOpts,
            selected: filters.interiorColor ? [filters.interiorColor] : [],
            onChange: (value, selected) => {
              handleInteriorColorChange(selected ? value : '');
            },
          },
        ],
      },
      {
        id: 'performance',
        title: 'PERFORMANCE',
        groups: [
          {
            id: 'fuelType',
            type: 'radio',
            title: 'Fuel type',
            hasActiveFilters: !!filters.fuelType,
            options: fuelOpts,
            value: filters.fuelType ?? undefined,
            onChange: handleFuelChange,
          },
          {
            id: 'transmission',
            type: 'radio',
            title: 'Transmission',
            hasActiveFilters: !!filters.transmission,
            options: transOpts,
            value: filters.transmission ?? undefined,
            onChange: handleTransmissionChange,
          },
          {
            id: 'drivetrain',
            type: 'radio',
            title: 'Drive train',
            hasActiveFilters: !!filters.drivetrain,
            options: driveOpts,
            value: filters.drivetrain ?? undefined,
            onChange: handleDrivetrainChange,
          },
        ],
      },
    ];
  }, [
    filters,
    makeOptions,
    availableModels,
    yearOptions,
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
