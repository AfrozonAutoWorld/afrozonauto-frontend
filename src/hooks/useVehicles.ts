import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../lib/api/vehicle";
import type { Vehicle, VehicleFilters, VehicleListResponse } from "../types/";
import { useState, useEffect } from "react";

export function useVehicles(filters?: VehicleFilters) {
  const queryResult = useQuery<VehicleListResponse, Error>({
    queryKey: ["vehicles", filters],
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
      return response.data;
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

export function useVehiclesWithPagination(
  baseFilters?: Omit<VehicleFilters, "page" | "limit">,
) {
  const [page, setPage] = useState(1);
  const pageSize = 50; // Show 50 vehicles per page

  const { vehicles, meta, isLoading, isError, error, refetch, isFetching } =
    useVehicles({
      ...baseFilters,
      page,
      limit: pageSize,
    });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
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
  ]);

  const goToPage = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextPage = () => {
    if (meta && page < meta.pages) {
      goToPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  return {
    vehicles,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    // Pagination controls
    currentPage: page,
    totalPages: meta?.pages || 0,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: meta ? page < meta.pages : false,
    hasPrevPage: page > 1,
    resetPagination: () => setPage(1),
  };
}
