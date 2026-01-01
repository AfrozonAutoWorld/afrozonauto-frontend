import { useState, useMemo } from 'react';
import { Search, Grid, List, ChevronDown } from 'lucide-react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { mockVehicles } from '../lib/mockVehicles';
import type { VehicleSearchFilters, Vehicle } from '../types';

type SortOption = 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc' | 'newest';

export function VehicleListing() {
  const [filters, setFilters] = useState<VehicleSearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredVehicles = useMemo(() => {
    let result = [...mockVehicles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.vin.toLowerCase().includes(query)
      );
    }

    if (filters.make) {
      result = result.filter((v) => v.make === filters.make);
    }

    if (filters.vehicleType) {
      result = result.filter((v) => v.vehicle_type === filters.vehicleType);
    }

    if (filters.priceMin !== undefined) {
      result = result.filter((v) => v.price_usd >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      result = result.filter((v) => v.price_usd <= filters.priceMax!);
    }

    if (filters.yearMin !== undefined) {
      result = result.filter((v) => v.year >= filters.yearMin!);
    }

    if (filters.yearMax !== undefined) {
      result = result.filter((v) => v.year <= filters.yearMax!);
    }

    if (filters.mileageMax !== undefined) {
      result = result.filter((v) => (v.mileage || 0) <= filters.mileageMax!);
    }

    if (filters.state) {
      result = result.filter((v) => v.dealer_state === filters.state);
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price_usd - b.price_usd);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price_usd - a.price_usd);
        break;
      case 'year_desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'mileage_asc':
        result.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [filters, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Browse Vehicles
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            {filteredVehicles.length} verified vehicles available for import to Nigeria
          </p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, or VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <VehicleFilters filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredVehicles.length}</span> vehicles
              </p>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="year_desc">Year: Newest</option>
                    <option value="mileage_asc">Mileage: Lowest</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
