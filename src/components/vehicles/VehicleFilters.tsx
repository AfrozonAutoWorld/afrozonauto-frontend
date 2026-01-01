import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { VehicleSearchFilters, VehicleType } from '../../types';
import { VEHICLE_MAKES, US_STATES } from '../../lib/pricingCalculator';

interface VehicleFiltersProps {
  filters: VehicleSearchFilters;
  onFilterChange: (filters: VehicleSearchFilters) => void;
}

const vehicleTypes: VehicleType[] = ['Car', 'SUV', 'Truck', 'Van', 'Sedan', 'Coupe', 'Hatchback', 'Wagon', 'Convertible'];
const priceRanges = [
  { label: 'Under $10,000', min: 0, max: 10000 },
  { label: '$10,000 - $20,000', min: 10000, max: 20000 },
  { label: '$20,000 - $30,000', min: 20000, max: 30000 },
  { label: '$30,000 - $50,000', min: 30000, max: 50000 },
  { label: 'Over $50,000', min: 50000, max: 999999 },
];

const yearRanges = [
  { label: '2023+', min: 2023, max: 2025 },
  { label: '2020 - 2022', min: 2020, max: 2022 },
  { label: '2017 - 2019', min: 2017, max: 2019 },
  { label: '2014 - 2016', min: 2014, max: 2016 },
  { label: 'Before 2014', min: 2000, max: 2013 },
];

export function VehicleFilters({ filters, onFilterChange }: VehicleFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMakeChange = (make: string) => {
    onFilterChange({ ...filters, make: make || undefined });
  };

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, vehicleType: type as VehicleType || undefined });
  };

  const handlePriceChange = (rangeIndex: number) => {
    if (rangeIndex === -1) {
      onFilterChange({ ...filters, priceMin: undefined, priceMax: undefined });
    } else {
      const range = priceRanges[rangeIndex];
      onFilterChange({ ...filters, priceMin: range.min, priceMax: range.max });
    }
  };

  const handleYearChange = (rangeIndex: number) => {
    if (rangeIndex === -1) {
      onFilterChange({ ...filters, yearMin: undefined, yearMax: undefined });
    } else {
      const range = yearRanges[rangeIndex];
      onFilterChange({ ...filters, yearMin: range.min, yearMax: range.max });
    }
  };

  const handleStateChange = (state: string) => {
    onFilterChange({ ...filters, state: state || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
        <select
          value={filters.make || ''}
          onChange={(e) => handleMakeChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All Makes</option>
          {VEHICLE_MAKES.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
        <select
          value={filters.vehicleType || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {vehicleTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <select
          value={
            filters.priceMin !== undefined
              ? priceRanges.findIndex(r => r.min === filters.priceMin && r.max === filters.priceMax)
              : -1
          }
          onChange={(e) => handlePriceChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value={-1}>All Prices</option>
          {priceRanges.map((range, index) => (
            <option key={index} value={index}>{range.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
        <select
          value={
            filters.yearMin !== undefined
              ? yearRanges.findIndex(r => r.min === filters.yearMin && r.max === filters.yearMax)
              : -1
          }
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value={-1}>All Years</option>
          {yearRanges.map((range, index) => (
            <option key={index} value={index}>{range.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location (US State)</label>
        <select
          value={filters.state || ''}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All States</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Mileage</label>
        <input
          type="number"
          placeholder="e.g., 50000"
          value={filters.mileageMax || ''}
          onChange={(e) => onFilterChange({ ...filters, mileageMax: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All Filters ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <FilterContent />
        </div>
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
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
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium"
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
