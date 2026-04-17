'use client';

import { useState, useEffect, useCallback } from 'react';
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

  /** Pagination reset: URL is the only source of truth for “which list query”. */
  const vehiclesFilterKey = searchParamsString;

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
    setSortBy(value);
    setBaseFilters((prev) => {
      const next = { ...prev, ...sortOptionToApiSort(value) };
      router.replace(`/marketplace?${buildMarketplaceQueryString(next, value)}`, { scroll: false });
      return next;
    });
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
