'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { VehicleFilters } from '@/types';
import {
  buildMarketplaceQueryString,
  parseMarketplaceSearchParams,
  sortOptionToApiSort,
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

  const baseFiltersRef = useRef(baseFilters);
  baseFiltersRef.current = baseFilters;

  const searchParamsString = searchParams?.toString() ?? '';

  // One sync from URL: filters + sort UI + API sort fields in a single setState (no chained effect).
  useEffect(() => {
    const { filters, sort } = parseMarketplaceSearchParams(searchParams);
    const apiSort = sortOptionToApiSort(sort);
    setSortBy(sort);
    setBaseFilters(() => {
      const next = { ...DEFAULT_FILTERS, ...filters, ...apiSort };
      delete (next as { source?: unknown }).source;
      return next;
    });
  }, [searchParamsString]);

  const updateUrlFromFilters = useCallback(
    (filters: Omit<VehicleFilters, 'page' | 'limit'>, sortOverride?: SortOption) => {
      router.replace(
        `/marketplace?${buildMarketplaceQueryString(filters, sortOverride ?? sortBy)}`,
        { scroll: false }
      );
    },
    [router, sortBy]
  );

  /**
   * Must track live filter state (not only the URL string). `router.replace` is async, so
   * `searchParams` can lag behind `baseFilters` for a frame — infinite scroll would miss resets.
   * Align with `vehiclesQueryKey` fields (excluding page/limit).
   */
  const vehiclesFilterKey = useMemo(
    () =>
      [
        sortBy,
        baseFilters.category ?? '',
        baseFilters.make ?? '',
        baseFilters.model ?? '',
        baseFilters.vehicleType ?? '',
        baseFilters.bodyStyle ?? '',
        baseFilters.condition ?? '',
        baseFilters.transmission ?? '',
        baseFilters.fuelType ?? '',
        baseFilters.drivetrain ?? '',
        baseFilters.exteriorColor ?? '',
        baseFilters.interiorColor ?? '',
        baseFilters.mileageMax ?? '',
        baseFilters.zip ?? '',
        baseFilters.distance ?? '',
        baseFilters.sortBy ?? '',
        baseFilters.sortOrder ?? '',
        baseFilters.search ?? '',
        baseFilters.yearMin ?? '',
        baseFilters.yearMax ?? '',
        baseFilters.priceMin ?? '',
        baseFilters.priceMax ?? '',
        baseFilters.state ?? '',
        baseFilters.featured ?? '',
        baseFilters.recommended ?? '',
        baseFilters.specialty ?? '',
        baseFilters.source ?? '',
        baseFilters.includeApi ?? '',
        baseFilters.browse ?? '',
        baseFilters.status ?? '',
      ].join('|'),
    [sortBy, baseFilters]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<VehicleFilters>) => {
      const next = { ...baseFilters, ...newFilters };
      const keys = Object.keys(newFilters);
      const shouldDropBrowse =
        baseFilters.browse &&
        keys.some((k) => k !== 'includeApi');
      if (shouldDropBrowse) {
        delete (next as { browse?: undefined }).browse;
      }
      setBaseFilters(next);
      updateUrlFromFilters(next);
    },
    [baseFilters, updateUrlFromFilters]
  );

  const handleClearFilters = useCallback(() => {
    setSortBy('newest');
    setBaseFilters({ ...DEFAULT_FILTERS, ...sortOptionToApiSort('newest') });
    router.replace('/marketplace', { scroll: false });
    queryClient.invalidateQueries({ queryKey: VEHICLES_LIST_QUERY_KEY });
  }, [router, queryClient]);

  const handleSortChange = useCallback((value: SortOption) => {
    const next = { ...baseFiltersRef.current, ...sortOptionToApiSort(value) };
    setSortBy(value);
    setBaseFilters(next);
    router.replace(`/marketplace?${buildMarketplaceQueryString(next, value)}`, { scroll: false });
  }, [router]);

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
