"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Grid, List, ChevronDown, AlertCircle, Store } from 'lucide-react';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleCardSkeleton } from '../components/vehicles/VehicleCardSkeleton';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { MarketplaceVehicleCard } from '../components/marketplace/MarketplaceVehicleCard';
import { useInfiniteVehicles, useCategories } from '../hooks/useVehicles';
import { useMarketplaceVehicles } from '../hooks/useMarketplace';
import type { VehicleFilters as VehicleFilterType } from '../types';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export function VehicleListing() {
  const { data: marketplaceVehicles } = useMarketplaceVehicles();
  const { categories } = useCategories();

  const [baseFilters, setBaseFilters] = useState<Omit<VehicleFilterType, 'page' | 'limit'>>({
    includeApi: true,
    status: 'AVAILABLE',
    category: '',
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
    setBaseFilters(prev => ({
      ...prev,
      search: debouncedSearch || undefined,
      sortBy: sortBy === 'newest' ? 'createdAt' :
        sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' :
          sortBy === 'year_desc' ? 'year' : 'mileage',
      sortOrder: sortBy === 'price_desc' || sortBy === 'year_desc' ? 'desc' : 'asc',
    }));
  }, [debouncedSearch, sortBy]);

  const {
    vehicles,
    hasMore,
    loadMore,
    isLoading,
    isFetching,
    isFetchingMore,
    isError,
    error,
    refetch,
    meta,
  } = useInfiniteVehicles(baseFilters);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        loadMore();
      },
      { rootMargin: '300px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleFilterChange = (newFilters: Partial<VehicleFilterType>) => {
    setBaseFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setBaseFilters({
      includeApi: true,
      status: 'AVAILABLE',
      category: '',
    });
  };

  const setCategory = (slug: string) => {
    setBaseFilters((prev) => ({ ...prev, category: slug }));
  };

  const isAll = !baseFilters?.category;
  const activeCategoryLabel = baseFilters?.category
    ? categories?.find((c) => c?.slug === baseFilters?.category)?.label ?? null
    : null;
  const listingLabel = activeCategoryLabel ? `${activeCategoryLabel} vehicles` : 'All vehicle listings';

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 w-full max-w-md bg-white rounded-xl shadow-lg">
          <div className="flex gap-3 items-center mb-4 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Error Loading Vehicles</h2>
          </div>
          <p className="mb-6 text-gray-600">{error?.message ?? 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="py-3 w-full text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="py-12 bg-gradient-to-r from-gray-900 to-emerald-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Browse Vehicles
          </h1>
          <p className="mb-6 max-w-xl text-lg text-gray-300">
            Your next ride is one scroll away — vetted US cars, shipped to Nigeria. Discover, compare, and load more as you go.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model, or VIN (e.g Chevelle, 10ARJYBS7RC154562, etc)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-4 pr-4 pl-12 w-full text-lg rounded-xl border-0 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Marketplace Listings */}
      {marketplaceVehicles && marketplaceVehicles.length > 0 && (
        <div className="px-4 pt-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex gap-2 items-center mb-4">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Marketplace Listings</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {marketplaceVehicles.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {marketplaceVehicles.map((v, idx) => (
              <MarketplaceVehicleCard key={v?.id ?? `marketplace-${idx}`} vehicle={v} />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Category chips */}
        {/* {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <span className="mr-1 text-sm font-medium text-gray-600">Category:</span>
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isAll
                  ? 'text-white bg-emerald-600'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((cat, idx) => (
              <button
                key={cat?.id ?? `cat-${idx}`}
                type="button"
                onClick={() => setCategory(cat?.slug ?? '')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  baseFilters?.category === cat?.slug
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat?.label ?? ''}
              </button>
            ))}
          </div>
        )} */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="lg:w-64 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <VehicleFilters
              filters={baseFilters as VehicleFilterType}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
              <div className="flex gap-4 items-center">
                <p className="text-gray-600">
                  {isLoading && `Finding ${activeCategoryLabel ? activeCategoryLabel.toLowerCase() + ' ' : ''}vehicles...`}
                  {!isLoading && vehicles.length === 0 && `No vehicles in ${activeCategoryLabel ? `this category` : 'this search'}`}
                  {!isLoading && vehicles.length > 0 && (hasMore ? `${listingLabel} — scroll for more` : listingLabel)}
                </p>
              </div>

              <div className="flex gap-4 items-center">
                {/* View Toggle */}
                <div className="hidden gap-2 items-center p-1 bg-white rounded-lg border border-gray-200 sm:flex">
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
                    className="px-4 py-2 pr-10 bg-white rounded-lg border border-gray-200 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="year_desc">Year: Newest</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {(isLoading || (vehicles.length === 0 && isFetching)) && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && !isFetching && vehicles.length === 0 && (
              <div className="p-12 text-center bg-white rounded-xl">
                <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No vehicles found</h3>
                <p className="mb-4 text-gray-600">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {!isLoading && vehicles.length > 0 && (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {vehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle?.vin ? `${vehicle.vin}-${index}` : `${vehicle?.id ?? index}-${index}`}
                      vehicle={vehicle}
                      viewMode={viewMode}
                    />
                  ))}

                  {isFetchingMore &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <VehicleCardSkeleton key={`more-${i}`} />
                    ))}
                </div>

                <div ref={sentinelRef} className="h-1 min-h-[1px]" aria-hidden />

                {/* Load more button */}
                {hasMore && !isFetchingMore && (
                  <div className="flex justify-center py-10">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="px-8 py-3 font-medium text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
                    >
                      Load more vehicles
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}