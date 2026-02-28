'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { VehicleFilters } from '@/types';
import {
  buildMarketplaceQueryString,
  parseMarketplaceSearchParams,
  type SortOption,
} from '@/lib/marketplaceUrl';

const VEHICLES_LIST_QUERY_KEY = ['vehicles', 'list'] as const;

const DEFAULT_FILTERS: Omit<VehicleFilters, 'page' | 'limit'> = {
  includeApi: true,
  category: '',
  sortBy: 'createdAt',
  sortOrder: 'asc',
};

export interface UseMarketplaceFiltersResult {
  baseFilters: Omit<VehicleFilters, 'page' | 'limit'>;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  vehiclesFilterKey: string;
  handleFilterChange: (newFilters: Partial<VehicleFilters>) => void;
  handleClearFilters: () => void;
  handleSortChange: (value: SortOption) => void;
  setCategory: (slug: string) => void;
  updateUrlFromFilters: (filters: Omit<VehicleFilters, 'page' | 'limit'>, sortOverride?: SortOption) => void;
}

export function useMarketplaceFilters(): UseMarketplaceFiltersResult {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [baseFilters, setBaseFilters] = useState<Omit<VehicleFilters, 'page' | 'limit'>>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const searchParamsString = searchParams?.toString() ?? '';

  // Sync from URL (shareable links + back button restores state)
  useEffect(() => {
    const { filters, sort } = parseMarketplaceSearchParams(searchParams);
    setBaseFilters((prev) => ({ ...prev, ...filters }));
    setSortBy(sort);
  }, [searchParamsString]);

  // Map sortBy UI option to API sortBy/sortOrder
  useEffect(() => {
    setBaseFilters((prev) => ({
      ...prev,
      sortBy:
        sortBy === 'newest'
          ? 'createdAt'
          : sortBy === 'price_asc' || sortBy === 'price_desc'
            ? 'price'
            : sortBy === 'year_desc'
              ? 'year'
              : 'mileage',
      sortOrder: sortBy === 'price_desc' || sortBy === 'year_desc' ? 'desc' : 'asc',
    }));
  }, [sortBy]);

  const updateUrlFromFilters = useCallback(
    (filters: Omit<VehicleFilters, 'page' | 'limit'>, sortOverride?: SortOption) => {
      router.replace(
        `/marketplace?${buildMarketplaceQueryString(filters, sortOverride ?? sortBy)}`,
        { scroll: false }
      );
    },
    [router, sortBy]
  );

  const vehiclesFilterKey = useMemo(
    () =>
      [
        searchParamsString,
        sortBy,
        baseFilters?.category ?? '',
        baseFilters?.make ?? '',
        baseFilters?.model ?? '',
        baseFilters?.bodyStyle ?? '',
        baseFilters?.fuelType ?? '',
        baseFilters?.drivetrain ?? '',
        baseFilters?.yearMin ?? '',
        baseFilters?.yearMax ?? '',
        baseFilters?.priceMin ?? '',
        baseFilters?.priceMax ?? '',
        baseFilters?.search ?? '',
        baseFilters?.vehicleType ?? '',
        baseFilters?.condition ?? '',
        baseFilters?.transmission ?? '',
        baseFilters?.exteriorColor ?? '',
        baseFilters?.interiorColor ?? '',
        baseFilters?.mileageMax ?? '',
        baseFilters?.state ?? '',
      ].join('|'),
    [
      searchParamsString,
      sortBy,
      baseFilters?.category,
      baseFilters?.make,
      baseFilters?.model,
      baseFilters?.bodyStyle,
      baseFilters?.fuelType,
      baseFilters?.drivetrain,
      baseFilters?.yearMin,
      baseFilters?.yearMax,
      baseFilters?.priceMin,
      baseFilters?.priceMax,
      baseFilters?.search,
      baseFilters?.vehicleType,
      baseFilters?.condition,
      baseFilters?.transmission,
      baseFilters?.exteriorColor,
      baseFilters?.interiorColor,
      baseFilters?.mileageMax,
      baseFilters?.state,
    ]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<VehicleFilters>) => {
      const next = { ...baseFilters, ...newFilters };
      setBaseFilters(next);
      updateUrlFromFilters(next);
    },
    [baseFilters, updateUrlFromFilters]
  );

  const handleClearFilters = useCallback(() => {
    router.replace('/marketplace', { scroll: false });
    setSortBy('newest');
    setBaseFilters((prev) => ({
      ...DEFAULT_FILTERS,
      includeApi: prev.includeApi,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    }));
    queryClient.invalidateQueries({ queryKey: VEHICLES_LIST_QUERY_KEY });
  }, [router, queryClient]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      updateUrlFromFilters(baseFilters, value);
    },
    [baseFilters, updateUrlFromFilters]
  );

  const setCategory = useCallback(
    (slug: string) => {
      const next = { ...baseFilters, category: slug };
      setBaseFilters(next);
      updateUrlFromFilters(next);
    },
    [baseFilters, updateUrlFromFilters]
  );

  return {
    baseFilters,
    sortBy,
    viewMode,
    setViewMode,
    vehiclesFilterKey,
    handleFilterChange,
    handleClearFilters,
    handleSortChange,
    setCategory,
    updateUrlFromFilters,
  };
}
