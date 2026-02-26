import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { VehicleFilters, VehicleType } from '../../types';
import { VEHICLE_MAKES } from '../../lib/pricingCalculator';
import { states } from '../../lib/state';
import { carModels } from '../../lib/carModels';
import { useMakeModelsReference } from '../../hooks/useVehicles';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface VehicleFiltersProps {
  filters: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
  onClearFilters?: () => void;
}

const vehicleTypes: VehicleType[] = ['CAR', 'SUV', 'TRUCK', 'VAN', 'SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'CONVERTIBLE', 'MOTORCYCLE'];

const conditionOptions = [
  { value: '' as const, label: 'All' },
  { value: 'new' as const, label: 'New' },
  { value: 'used' as const, label: 'Used' },
  { value: 'cpo' as const, label: 'CPO (Certified Pre-Owned)' },
];

const bodyStyleOptions = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Pickup Truck', 'Truck'];

const fuelOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-In Hybrid', 'Flex Fuel'];

const transmissionOptions = ['Automatic', 'Manual', 'CVT', 'Dual-Clutch', 'Single-Speed'];

const drivetrainOptions = ['AWD', 'FWD', 'RWD', '4WD'];

const exteriorColorOptions = ['Black', 'White', 'Gray', 'Silver', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange', 'Beige', 'Gold'];

const interiorColorOptions = ['Black', 'Gray', 'Beige', 'Brown', 'White', 'Red', 'Blue', 'Tan'];

const priceRanges = [
  { label: 'Under $10,000', min: 1, max: 10000 },
  { label: '$10,000 - $20,000', min: 10000, max: 20000 },
  { label: '$20,000 - $30,000', min: 20000, max: 30000 },
  { label: '$30,000 - $50,000', min: 30000, max: 50000 },
  { label: 'Over $50,000', min: 50000, max: 999999 },
];

// Single years from current year down to 2005 (no range — avoids "first 40 all same year" when sorted by other fields)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => currentYear - i);

const mileagePresets = [
  { label: 'Any', value: undefined },
  { label: 'Under 30k mi', value: 30000 },
  { label: 'Under 60k mi', value: 60000 },
  { label: 'Under 100k mi', value: 100000 },
  { label: 'Under 150k mi', value: 150000 },
];

export function VehicleFilters({ filters, onFilterChange, onClearFilters }: VehicleFiltersProps) {
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

  const makeOptions =
    Object.keys(makeModels).length > 0 ? Object.keys(makeModels).sort() : VEHICLE_MAKES;

  // Sync local mileage with filters when filters are cleared externally
  useEffect(() => {
    const externalMileage = filters.mileageMax?.toString() || '';
    if (externalMileage !== localMileage) {
      setLocalMileage(externalMileage);
      setDebouncedMileage(externalMileage);
    }
  }, [filters.mileageMax]);

  // Debounce the mileage input - only updates after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMileage(localMileage);
    }, 500);

    return () => clearTimeout(timer);
  }, [localMileage]);

  // Apply the debounced mileage to filters
  useEffect(() => {
    const mileage = debouncedMileage ? parseInt(debouncedMileage) : undefined;

    // Only update if valid and different from current filter
    if ((mileage === undefined || !isNaN(mileage)) && mileage !== filters.mileageMax) {
      onFilterChange({ ...filters, mileageMax: mileage });
    }
  }, [debouncedMileage]);

  const handleMakeChange = (make: string) => {
    onFilterChange({
      ...filters,
      make: make || undefined,
      model: undefined, // reset model when make changes to avoid stale model filter
    });
  };

  const handleTypeChange = (type: VehicleType | '') => {
    const allowedTypes: VehicleFilters['vehicleType'][] = ['CAR', 'SUV', 'TRUCK', 'VAN', 'SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'CONVERTIBLE', 'MOTORCYCLE'];

    onFilterChange({
      ...filters,
      vehicleType: allowedTypes.includes(type as any) ? (type as any) : undefined,
    });
  };

  const handlePriceChange = (rangeIndex: number) => {
    if (rangeIndex === -1) {
      onFilterChange({ ...filters, priceMin: undefined, priceMax: undefined });
    } else {
      const range = priceRanges[rangeIndex];
      onFilterChange({ ...filters, priceMin: range.min, priceMax: range.max });
    }
  };

  const handleYearChange = (year: number | '') => {
    if (year === '' || year === 0) {
      onFilterChange({ ...filters, yearMin: undefined, yearMax: undefined });
    } else {
      onFilterChange({ ...filters, yearMin: year, yearMax: year });
    }
  };

  const handleStateChange = (stateAbbrev: string) => {
    onFilterChange({ ...filters, state: stateAbbrev || undefined });
  };

  const handleModelChange = (model: string) => {
    onFilterChange({ ...filters, model: model || undefined });
  };

  const handleConditionChange = (v: string) => {
    const value = v === 'new' || v === 'used' || v === 'cpo' ? v : undefined;
    onFilterChange({ ...filters, condition: value });
  };

  const handleBodyStyleChange = (v: string) => {
    onFilterChange({ ...filters, bodyStyle: v || undefined });
  };

  const handleFuelChange = (v: string) => {
    onFilterChange({ ...filters, fuelType: v || undefined });
  };

  const handleTransmissionChange = (v: string) => {
    onFilterChange({ ...filters, transmission: (v || undefined) as VehicleFilters['transmission'] });
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

  const handleMileagePresetChange = (value: number | undefined) => {
    onFilterChange({ ...filters, mileageMax: value });
    setLocalMileage(value?.toString() ?? '');
    setDebouncedMileage(value?.toString() ?? '');
  };

  const handleZipChange = (v: string) => {
    onFilterChange({ ...filters, zip: v || undefined });
  };

  const handleDistanceChange = (v: string) => {
    const num = v ? parseInt(v, 10) : undefined;
    onFilterChange({ ...filters, distance: Number.isFinite(num) && num! > 0 ? num : undefined });
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
  ].filter(v => v !== undefined && v !== '').length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Make</label>
        <SearchableSelect
          options={makeOptions.map((make) => ({ value: make, label: make }))}
          value={filters.make}
          onValueChange={(v) => handleMakeChange(v ?? '')}
          placeholder="All Makes"
          searchPlaceholder="Search makes..."
          emptyText="No make found."
        />
      </div>

      {filters.make && availableModels.length > 0 && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Model</label>
          <SearchableSelect
            options={availableModels.map((model) => ({ value: model, label: model }))}
            value={filters.model}
            onValueChange={(v) => handleModelChange(v ?? '')}
            placeholder="All Models"
            searchPlaceholder="Search models..."
            emptyText="No model found."
          />
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Type</label>
        <SearchableSelect
          options={vehicleTypes.map((type) => ({ value: type, label: type }))}
          value={filters.vehicleType || undefined}
          onValueChange={(v) => handleTypeChange((v ?? '') as VehicleType | '')}
          placeholder="All Types"
          searchPlaceholder="Search types..."
          emptyText="No type found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Condition</label>
        <SearchableSelect
          options={conditionOptions.map((o) => ({ value: o.value || 'all', label: o.label }))}
          value={filters.condition ?? 'all'}
          onValueChange={(v) => handleConditionChange(v === 'all' ? '' : v ?? '')}
          placeholder="All"
          searchPlaceholder="Search..."
          emptyText="No option found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Body Style</label>
        <SearchableSelect
          options={bodyStyleOptions.map((s) => ({ value: s, label: s }))}
          value={filters.bodyStyle}
          onValueChange={(v) => handleBodyStyleChange(v ?? '')}
          placeholder="All body styles"
          searchPlaceholder="Search..."
          emptyText="No style found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Price Range (USD)</label>
        <SearchableSelect
          options={priceRanges.map((range, index) => ({
            value: String(index),
            label: range.label,
          }))}
          value={
            filters.priceMin !== undefined
              ? String(
                  priceRanges.findIndex(
                    (r) => r.min === filters.priceMin && r.max === filters.priceMax
                  )
                )
              : undefined
          }
          onValueChange={(v) =>
            handlePriceChange(v === undefined ? -1 : parseInt(v, 10))
          }
          placeholder="All Prices"
          searchPlaceholder="Search price ranges..."
          emptyText="No range found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Fuel Type</label>
        <SearchableSelect
          options={fuelOptions.map((f) => ({ value: f, label: f }))}
          value={filters.fuelType}
          onValueChange={(v) => handleFuelChange(v ?? '')}
          placeholder="All fuel types"
          searchPlaceholder="Search..."
          emptyText="No fuel type found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Transmission</label>
        <SearchableSelect
          options={transmissionOptions.map((t) => ({ value: t, label: t }))}
          value={filters.transmission}
          onValueChange={(v) => handleTransmissionChange(v ?? '')}
          placeholder="All transmissions"
          searchPlaceholder="Search..."
          emptyText="No transmission found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Drivetrain</label>
        <SearchableSelect
          options={drivetrainOptions.map((d) => ({ value: d, label: d }))}
          value={filters.drivetrain}
          onValueChange={(v) => handleDrivetrainChange(v ?? '')}
          placeholder="All drivetrains"
          searchPlaceholder="Search..."
          emptyText="No drivetrain found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Year</label>
        <SearchableSelect
          options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
          value={
            filters.yearMin !== undefined && filters.yearMin === filters.yearMax
              ? String(filters.yearMin)
              : undefined
          }
          onValueChange={(v) =>
            handleYearChange(v === undefined ? '' : parseInt(v, 10))
          }
          placeholder="All Years"
          searchPlaceholder="Search years..."
          emptyText="No year found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Max Mileage</label>
        <SearchableSelect
          options={mileagePresets.map((p) => ({ value: p.value?.toString() ?? '', label: p.label }))}
          value={filters.mileageMax?.toString() ?? ''}
          onValueChange={(v) => handleMileagePresetChange(v ? parseInt(v, 10) : undefined)}
          placeholder="Any mileage"
          searchPlaceholder="Search..."
          emptyText="No option found."
        />
        <input
          type="number"
          min={0}
          placeholder="Or enter max miles"
          value={localMileage}
          onChange={(e) => setLocalMileage(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Exterior Color</label>
        <SearchableSelect
          options={exteriorColorOptions.map((c) => ({ value: c, label: c }))}
          value={filters.exteriorColor}
          onValueChange={(v) => handleExteriorColorChange(v ?? '')}
          placeholder="Any color"
          searchPlaceholder="Search..."
          emptyText="No color found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Interior Color</label>
        <SearchableSelect
          options={interiorColorOptions.map((c) => ({ value: c, label: c }))}
          value={filters.interiorColor}
          onValueChange={(v) => handleInteriorColorChange(v ?? '')}
          placeholder="Any color"
          searchPlaceholder="Search..."
          emptyText="No color found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Location (US State)</label>
        <SearchableSelect
          options={states.map((s) => ({ value: s.abbrevCode, label: s.fullName }))}
          value={filters.state}
          onValueChange={(v) => handleStateChange(v ?? '')}
          placeholder="All States"
          searchPlaceholder="Search states..."
          emptyText="No state found."
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">ZIP Code</label>
        <input
          type="text"
          placeholder="e.g. 90210"
          value={filters.zip ?? ''}
          onChange={(e) => handleZipChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Distance (miles from ZIP)</label>
        <input
          type="number"
          min={1}
          max={500}
          placeholder="e.g. 50"
          value={filters.distance ?? ''}
          onChange={(e) => handleDistanceChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="px-4 py-2 w-full text-sm font-medium text-red-600 rounded-lg border border-red-200 transition-colors hover:text-red-700 hover:bg-red-50"
        >
          Clear All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm min-h-dvh scrollbar-hide">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
          <FilterContent />
        </div>
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex gap-2 items-center px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-200"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="overflow-y-auto absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white">
              <div className="flex sticky top-0 justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="py-3 w-full font-medium text-white bg-emerald-600 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}