import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../lib/api/vehicle";
import type { Vehicle, VehicleCategory, VehicleFilters, VehicleListResponse } from "../types/";
import { useState, useEffect, useCallback, useRef } from "react";

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

  return {
    vehicles: queryResult.data?.vehicles ?? [],
    meta: queryResult.data?.meta,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
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

/**
 * Infinite list: append batches on "Load more" or when sentinel is visible.
 * Backend returns one page per request and hasMore; no need for total when using API.
 */
export function useInfiniteVehicles(baseFilters?: Omit<VehicleFilters, "page" | "limit">) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Vehicle[]>([]);
  const lastAppliedPageRef = useRef(0);

  const filters: VehicleFilters = {
    ...baseFilters,
    page,
    limit: VEHICLES_PAGE_SIZE,
  };

  const { vehicles, meta, isLoading, isError, error, refetch, isFetching } = useVehicles(filters);

  // Accumulate: page 1 replaces, page > 1 appends (only once per page)
  useEffect(() => {
    if (vehicles == null) return;
    if (page === 1) {
      lastAppliedPageRef.current = 1;
      setAccumulated(vehicles);
    } else if (page > lastAppliedPageRef.current) {
      lastAppliedPageRef.current = page;
      setAccumulated((prev) => [...prev, ...vehicles]);
    }
  }, [page, vehicles]);

  const prevFilterKeyRef = useRef<string>("");
  useEffect(() => {
    const filterKey = [
      baseFilters?.category,
      baseFilters?.make,
      baseFilters?.model,
      baseFilters?.search,
    ].join("|");
    if (prevFilterKeyRef.current === filterKey) return;
    prevFilterKeyRef.current = filterKey;

    setPage(1);
    setAccumulated([]);
    lastAppliedPageRef.current = 0;
  }, [
    baseFilters?.make,
    baseFilters?.model,
    baseFilters?.vehicleType,
    baseFilters?.yearMin,
    baseFilters?.yearMax,
    baseFilters?.priceMin,
    baseFilters?.priceMax,
    baseFilters?.state,
    baseFilters?.search,
    baseFilters?.category,
  ]);

  // When category (including "All") changes, refetch so we get fresh data for the new key
  const prevCategoryRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const next = baseFilters?.category ?? "__all__";
    if (prevCategoryRef.current === next) return;
    prevCategoryRef.current = next;
    refetch();
  }, [baseFilters?.category, refetch]);

  const hasMore = meta?.hasMore ?? (vehicles?.length === VEHICLES_PAGE_SIZE);
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  return {
    vehicles: accumulated,
    hasMore,
    loadMore,
    isLoading,
    isFetching,
    isFetchingMore: isFetching && page > 1,
    isError,
    error,
    refetch: () => {
      setPage(1);
      setAccumulated([]);
      refetch();
    },
    meta,
  };
}
