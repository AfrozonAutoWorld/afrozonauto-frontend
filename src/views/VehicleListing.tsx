import { useState, useEffect } from 'react';
import { Search, Grid, List, ChevronDown, AlertCircle } from 'lucide-react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { useVehicles } from '../hooks/useVehicles';
import type { VehicleFilters as VehicleFilterType } from '../types';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export function VehicleListing() {
  const [filters, setFilters] = useState<VehicleFilterType>({
    page: 1,
    limit: 50,
    includeApi: true,
    status: 'AVAILABLE',
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when search or sort changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch || undefined,
      sortBy: sortBy === 'newest' ? 'createdAt' :
        sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' :
          sortBy === 'year_desc' ? 'year' : 'mileage',
      sortOrder: sortBy === 'price_desc' || sortBy === 'year_desc' ? 'desc' : 'asc',
      page: 1, // Reset to first page on filter change
    }));
  }, [debouncedSearch, sortBy]);

  const { vehicles, meta, isLoading, isError, error, refetch } = useVehicles(filters);


  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleFilterChange = (newFilters: Partial<VehicleFilterType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery(''); // Clear the search bar
    setSortBy('newest'); // Reset sort
    setFilters({
      page: 1,
      limit: 50,
      includeApi: true,
      status: 'AVAILABLE',
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error Loading Vehicles</h2>
          </div>
          <p className="text-gray-600 mb-6">{error?.message || 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const vehiclesOnPage = vehicles.length;

  const totalVehicles =
    meta?.total && meta.total > 0
      ? meta.total
      : vehicles?.length || meta?.fromApi || 0;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Browse Vehicles
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            {isLoading ? (
              'Loading vehicles...'
            ) : (
              `${totalVehicles} verified vehicles available for import to Nigeria`
            )}
            {meta?.fromApi !== undefined && meta.fromApi > 0 && (
              ` (${meta.fromApi} from live listings)`
            )}

          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by model, or VIN(e.g Chevelle, 10ARJYBS7RC154562, etc)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <VehicleFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">

              <p className="text-gray-600">
                {isLoading ? (
                  'Loading vehicles...'
                ) : totalVehicles === 0 ? (
                  'No vehicles found'
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold">
                      {vehicles.length > 0 ? `${vehiclesOnPage}` : '0'}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold">{totalVehicles.toLocaleString()}</span>{' '}
                    vehicles
                  </>
                )}
              </p>
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="hidden sm:flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="year_desc">Year: Newest</option>
                    {/* <option value="mileage_asc">Mileage: Lowest</option> */}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading vehicles...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && vehicles.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSortBy('newest');
                    setFilters({
                      page: 1,
                      limit: 50,
                      includeApi: true,
                      status: 'AVAILABLE',
                    });
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear All Filters
                </button>

              </div>
            )}

            {/* Vehicle Grid/List */}
            {!isLoading && vehicles.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">

                <div className="text-sm text-gray-500">
                  Page {filters.page} of {meta.pages}
                </div>

                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {(() => {
                    const currentPage = filters.page || 1;
                    const totalPages = meta.pages;
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);

                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                      const page = startPage + i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${filters.page === page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}

                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === meta.pages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}