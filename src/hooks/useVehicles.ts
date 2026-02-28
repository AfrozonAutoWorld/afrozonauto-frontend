import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../lib/api/vehicle";
import type { Vehicle, VehicleCategory, VehicleFilters, VehicleListResponse } from "../types/";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export function useTrendingVehicles() {
  const queryResult = useQuery<Vehicle[], Error>({
    queryKey: ["vehicles", "trending"],
    queryFn: () => vehiclesApi.getTrending(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  return {
    vehicles: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export interface RecommendedVehicleItem {
  vehicle: Vehicle;
  reason?: string;
}

export function useRecommendedVehicles(limit?: number) {
  const queryResult = useQuery<RecommendedVehicleItem[], Error>({
    queryKey: ["vehicles", "recommended", limit],
    queryFn: () => vehiclesApi.getRecommended(limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  return {
    items: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useCategories() {
  const queryResult = useQuery<VehicleCategory[], Error>({
    queryKey: ["vehicles", "categories"],
    queryFn: () => vehiclesApi.getCategories(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  return {
    categories: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useMakeModelsReference() {
  const queryResult = useQuery<Record<string, string[]>, Error>({
    queryKey: ["vehicles", "reference", "models"],
    queryFn: () => vehiclesApi.getMakeModelsReference(),
    staleTime: 1000 * 60 * 60 * 24, // 24h
    refetchOnWindowFocus: false,
  });
  return {
    makeModels: queryResult.data ?? {},
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/** Stable query key from filter primitives so the key doesn't change every render (avoids infinite loop) */
function vehiclesQueryKey(filters?: VehicleFilters): unknown[] {
  if (!filters) return ["vehicles", "list"];
  return [
    "vehicles",
    "list",
    filters.category ?? "",
    filters.make ?? "",
    filters.model ?? "",
    filters.vehicleType ?? "",
    filters.bodyStyle ?? "",
    filters.condition ?? "",
    filters.transmission ?? "",
    filters.fuelType ?? "",
    filters.drivetrain ?? "",
    filters.exteriorColor ?? "",
    filters.interiorColor ?? "",
    filters.mileageMax ?? "",
    filters.zip ?? "",
    filters.distance ?? "",
    filters.page ?? 1,
    filters.limit ?? 24,
    filters.sortBy ?? "",
    filters.sortOrder ?? "",
    filters.search ?? "",
    filters.yearMin ?? "",
    filters.yearMax ?? "",
    filters.priceMin ?? "",
    filters.priceMax ?? "",
    filters.state ?? "",
  ];
}

const EMPTY_VEHICLES: Vehicle[] = [];

export function useVehicles(filters?: VehicleFilters) {
  const queryKey = vehiclesQueryKey(filters);
  const queryResult = useQuery<VehicleListResponse, Error>({
    queryKey,
    queryFn: async () => {
      return await vehiclesApi.getAll(filters);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const vehicles = queryResult.data?.vehicles ?? EMPTY_VEHICLES;

  return {
    vehicles,
    meta: queryResult.data?.meta,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
    isFetched: queryResult.isFetched,
  };
}

export function useVehicle(id: string) {
  const queryResult = useQuery<Vehicle, Error>({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await vehiclesApi.getById(id);
      return (response as { data?: Vehicle })?.data ?? (response as Vehicle);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  return {
    vehicle: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export const VEHICLES_PAGE_SIZE = 24;

/** After this many consecutive pages where the API returned a full page but we showed 0 (filtered out), we stop and show "reached the end". */
const MAX_CONSECUTIVE_EMPTY_FULL_PAGES = 2;

/**
 * Infinite list: append batches on "Load more" or when sentinel is visible.
 * Backend returns one page per request and hasMore; no need for total when using API.
 * @param baseFilters - filter state (can be new object each render)
 * @param filterKey - stable string from parent (useMemo over primitives). When this changes, page resets to 1.
 */
export function useInfiniteVehicles(
  baseFilters?: Omit<VehicleFilters, "page" | "limit">,
  filterKey?: string
) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Vehicle[]>([]);
  const [reachedEnd, setReachedEnd] = useState(false);
  const lastAppliedPageRef = useRef(0);
  const consecutiveEmptyFullPagesRef = useRef(0);

  const filters: VehicleFilters = {
    ...baseFilters,
    page,
    limit: VEHICLES_PAGE_SIZE,
  };

  const { vehicles, meta, isLoading, isError, error, refetch, isFetching, isFetched } = useVehicles(filters);

  // Accumulate and detect end:
  // 1) API returned short (fromApi < limit) → true end.
  // 2) Not using API and short page → true end.
  // 3) API returned full page but we showed 0 (all filtered out): after N consecutive such pages, stop to avoid infinite "Load more" with no new items.
  useEffect(() => {
    if (vehicles == null) return;
    const usedApi = meta?.apiUsed === true;
    const apiReturnedShort = usedApi && (meta?.fromApi ?? 0) < VEHICLES_PAGE_SIZE;
    const shortPageNoApi = !usedApi && vehicles.length < VEHICLES_PAGE_SIZE;
    const fullPageButZeroShown = usedApi && (meta?.fromApi ?? 0) >= VEHICLES_PAGE_SIZE && vehicles.length === 0;

    if (fullPageButZeroShown) {
      consecutiveEmptyFullPagesRef.current += 1;
      if (consecutiveEmptyFullPagesRef.current >= MAX_CONSECUTIVE_EMPTY_FULL_PAGES) {
        setReachedEnd(true);
      }
    } else {
      consecutiveEmptyFullPagesRef.current = 0;
      if ((apiReturnedShort || shortPageNoApi) && (vehicles.length > 0 || (page === 1 && isFetched))) {
        setReachedEnd(true);
      }
    }

    if (page === 1) {
      lastAppliedPageRef.current = 1;
      setAccumulated(vehicles);
    } else if (page > lastAppliedPageRef.current && vehicles.length > 0) {
      lastAppliedPageRef.current = page;
      setAccumulated((prev) => [...prev, ...vehicles]);
    }
  }, [page, vehicles, isFetched, meta]);

  const stableKey = filterKey ?? "";
  const prevFilterKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevFilterKeyRef.current;
    prevFilterKeyRef.current = stableKey;
    if (prev === null) return;
    if (prev === stableKey) return;
    setPage(1);
    setAccumulated([]);
    setReachedEnd(false);
    lastAppliedPageRef.current = 0;
    consecutiveEmptyFullPagesRef.current = 0;
  }, [stableKey]);

  // Show accumulated when we have it, else current query result.
  const displayVehicles = accumulated.length > 0 ? accumulated : vehicles;

  const isFetchingRef = useRef(false);
  const reachedEndRef = useRef(false);
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);
  useEffect(() => {
    reachedEndRef.current = reachedEnd;
  }, [reachedEnd]);
  // Keep fetching until we get a short page; then we show "You have reached the end". Don't rely on backend hasMore.
  const loadMore = useCallback(() => {
    if (isFetchingRef.current || reachedEndRef.current) return;
    setPage((p) => p + 1);
  }, []);

  const isInitialLoading = isLoading && page === 1;

  return {
    vehicles: displayVehicles,
    hasMore: !reachedEnd,
    reachedEnd,
    loadMore,
    isLoading,
    isInitialLoading,
    isFetching,
    isFetchingMore: isFetching && page > 1,
    isError,
    error,
    isFetched,
    refetch: () => {
      setPage(1);
      setAccumulated([]);
      setReachedEnd(false);
      consecutiveEmptyFullPagesRef.current = 0;
      refetch();
    },
    meta,
  };
}
