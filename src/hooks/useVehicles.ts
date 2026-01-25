import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../lib/api/vehicle";
import type { Vehicle, VehicleFilters, VehicleListResponse } from "../types/";

export function useVehicles(filters?: VehicleFilters) {
  const queryResult = useQuery<VehicleListResponse, Error>({
    queryKey: ["vehicles", filters],
    queryFn: () => vehiclesApi.getAll(filters),
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
    queryFn: () => vehiclesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    vehicle: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useVehicleSearch(
  query: string,
  filters?: Omit<VehicleFilters, "search">,
) {
  const queryResult = useQuery<VehicleListResponse, Error>({
    queryKey: ["vehicles", "search", query, filters],
    queryFn: () => vehiclesApi.search(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return {
    vehicles: queryResult.data?.vehicles ?? [],
    meta: queryResult.data?.meta,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useVehiclePagination(
  filters: VehicleFilters,
  onPageChange?: (page: number) => void,
) {
  const { vehicles, meta, isLoading, error } = useVehicles(filters);

  const goToPage = (page: number) => {
    if (meta && page >= 1 && page <= meta.pages) {
      onPageChange?.(page);
    }
  };

  const nextPage = () => {
    if (meta && filters.page && filters.page < meta.pages) {
      goToPage(filters.page + 1);
    }
  };

  const prevPage = () => {
    if (meta && filters.page && filters.page > 1) {
      goToPage(filters.page - 1);
    }
  };

  return {
    vehicles,
    meta,
    isLoading,
    error,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: meta ? (filters.page ?? 1) < meta.pages : false,
    hasPrevPage: (filters.page ?? 1) > 1,
    currentPage: filters.page ?? 1,
  };
}
