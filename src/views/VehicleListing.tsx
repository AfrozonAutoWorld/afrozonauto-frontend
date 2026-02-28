'use client';

import { useRef } from 'react';
import { Search, Store } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { HeroSection, HeroBreadcrumb } from '@/components/home';
import { FeaturedCarCard } from '../components/home/FeaturedCarCard';
import { VehicleCardSkeleton } from '../components/vehicles/VehicleCardSkeleton';
import { VehicleFilters } from '../components/vehicles/VehicleFilters';
import { MarketplaceVehicleCard } from '../components/marketplace/MarketplaceVehicleCard';
import { useInfiniteVehicles, useCategories } from '../hooks/useVehicles';
import { useMarketplaceVehicles } from '../hooks/useMarketplace';
import { useMarketplaceFilters } from '../hooks/useMarketplaceFilters';
import { useInfiniteScrollSentinel } from '../hooks/useInfiniteScrollSentinel';
import { useSavedVehiclesApi, useToggleSaved } from '../hooks/useSavedVehiclesApi';
import { buildActiveFilterChips } from '../lib/activeFilterChips';
import type { VehicleFilters as VehicleFilterType, Vehicle } from '../types';
import { ActiveFiltersBar } from '../components/vehicles/ActiveFiltersBar';
import { ResultsSortBar } from '../components/vehicles/ResultsSortBar';
import { AlertCircle } from 'lucide-react';

export function VehicleListing() {
  const { status } = useSession();
  const { data: marketplaceVehicles } = useMarketplaceVehicles();
  const { categories } = useCategories();
  const { isSaved } = useSavedVehiclesApi();
  const { toggle, isPending } = useToggleSaved();
  const showSave = status === 'authenticated';

  const {
    baseFilters,
    sortBy,
    viewMode,
    vehiclesFilterKey,
    handleFilterChange,
    handleClearFilters,
    handleSortChange,
    setCategory,
  } = useMarketplaceFilters();

  const {
    vehicles,
    reachedEnd,
    loadMore,
    isLoading,
    isInitialLoading,
    isFetching,
    isFetchingMore,
    isError,
    error,
    refetch,
    meta,
    isFetched,
  } = useInfiniteVehicles(baseFilters, vehiclesFilterKey);

  const listShown = vehicles.length > 0 || isFetchingMore;
  const sentinelRef = useInfiniteScrollSentinel(loadMore, listShown);

  const activeFilterChips = buildActiveFilterChips(baseFilters, handleFilterChange);
  const hasActiveFilters = activeFilterChips.length > 0;

  const activeCategoryLabel = baseFilters?.category
    ? categories?.find((c) => c?.slug === baseFilters?.category)?.label ?? null
    : null;
  const listingLabel = activeCategoryLabel
    ? `${activeCategoryLabel} vehicles`
    : 'All vehicle listings';

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

  const gridClass =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
      : 'space-y-4';

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection
        breadcrumbs={<HeroBreadcrumb />}
        minHeightClass="min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]"
      />

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
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <VehicleFilters
              filters={baseFilters as VehicleFilterType}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              resultCount={meta?.total ?? 0}
            />
          </aside>

          <div className="flex flex-col flex-1 gap-4 min-w-0">
            {hasActiveFilters && (
              <ActiveFiltersBar chips={activeFilterChips} onClearAll={handleClearFilters} />
            )}
            <ResultsSortBar
              total={meta?.total}
              isLoading={isLoading}
              label={listingLabel}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            {isInitialLoading && (
              <div className={gridClass}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {isFetched &&
              !isFetching &&
              vehicles.length === 0 &&
              !isFetchingMore &&
              (meta == null || meta.total === 0) && (
                <div className="p-12 text-center bg-white rounded-xl">
                  <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No vehicles found
                  </h3>
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

            {!isInitialLoading && (vehicles.length > 0 || isFetchingMore) && (
              <>
                <div className={gridClass}>
                  {vehicles.map((vehicle, index) => (
                    <FeaturedCarCard
                      key={
                        vehicle?.vin
                          ? `${vehicle.vin}-${index}`
                          : `${vehicle?.id ?? index}-${index}`
                      }
                      vehicle={vehicle as Vehicle}
                      // isSaved={showSave ? isSaved((vehicle as Vehicle).id) : undefined}
                      // onSaveClick={showSave ? (v) => toggle(v) : undefined}
                    />
                  ))}
                  {isFetchingMore &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <VehicleCardSkeleton key={`more-${i}`} />
                    ))}
                </div>

                <div ref={sentinelRef} className="h-1 min-h-[1px]" aria-hidden />

                {!reachedEnd && !isFetchingMore && (
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
                {reachedEnd && vehicles.length > 0 && (
                  <div className="py-10 text-center text-gray-500">
                    You have reached the end
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
