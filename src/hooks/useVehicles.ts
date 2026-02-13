import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../lib/api/vehicle";
import type {
  Vehicle,
  VehicleFilters,
  VehicleListResponse,
  VehicleMeta,
} from "../types/";
import { useMemo, useState } from "react";

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

const FRONTEND_PAGE_SIZE = 30;
const API_PAGE_SIZE = 100;

interface EnhancedMeta extends VehicleMeta {
  frontendPage: number;
  frontendPages: number;
  frontendPageSize: number;
  apiPage: number;
  apiPages: number;
  displayStart: number;
  displayEnd: number;
}

export function useVehiclesWithPagination(
  baseFilters?: Omit<VehicleFilters, "page" | "limit">,
) {
  const [frontendPage, setFrontendPage] = useState(1);

  // Calculate which API page we need based on frontend page
  const apiPage = useMemo(() => {
    return Math.ceil((frontendPage * FRONTEND_PAGE_SIZE) / API_PAGE_SIZE);
  }, [frontendPage]);

  // Fetch vehicles with API pagination
  const apiFilters: VehicleFilters = {
    ...baseFilters,
    page: apiPage,
    limit: API_PAGE_SIZE,
  };

  const {
    vehicles: allVehicles,
    meta,
    isLoading,
    isError,
    error,
    refetch,
  } = useVehicles(apiFilters);

  // Calculate frontend pagination
  const { paginatedVehicles, enhancedMeta } = useMemo(() => {
    if (!allVehicles.length || !meta) {
      return {
        paginatedVehicles: [],
        enhancedMeta: null,
      };
    }

    // Calculate total vehicles across all API pages
    const totalVehicles = meta.total || meta.fromApi || 0;
    const totalFrontendPages = Math.ceil(totalVehicles / FRONTEND_PAGE_SIZE);

    // Calculate which slice of vehicles to show on current frontend page
    const globalStartIndex = (frontendPage - 1) * FRONTEND_PAGE_SIZE;
    const globalEndIndex = frontendPage * FRONTEND_PAGE_SIZE;

    // Calculate local indices within the current API page
    const apiPageStartIndex = (apiPage - 1) * API_PAGE_SIZE;
    const localStartIndex = globalStartIndex - apiPageStartIndex;
    const localEndIndex = Math.min(
      globalEndIndex - apiPageStartIndex,
      allVehicles.length,
    );

    const paginatedVehicles = allVehicles.slice(localStartIndex, localEndIndex);

    const enhancedMeta: EnhancedMeta = {
      ...meta,
      frontendPage,
      frontendPages: totalFrontendPages,
      frontendPageSize: FRONTEND_PAGE_SIZE,
      apiPage,
      apiPages: meta.pages,
      displayStart: globalStartIndex + 1,
      displayEnd: Math.min(globalEndIndex, totalVehicles),
    };

    return { paginatedVehicles, enhancedMeta };
  }, [allVehicles, meta, frontendPage, apiPage]);

  const goToPage = (page: number) => {
    if (enhancedMeta && page >= 1 && page <= enhancedMeta.frontendPages) {
      setFrontendPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextPage = () => {
    if (enhancedMeta && frontendPage < enhancedMeta.frontendPages) {
      goToPage(frontendPage + 1);
    }
  };

  const prevPage = () => {
    if (frontendPage > 1) {
      goToPage(frontendPage - 1);
    }
  };

  return {
    vehicles: paginatedVehicles,
    allVehicles, // All vehicles from current API page (useful for debugging)
    meta: enhancedMeta,
    isLoading,
    isError,
    error,
    refetch,
    // Pagination controls
    currentPage: frontendPage,
    totalPages: enhancedMeta?.frontendPages || 0,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: enhancedMeta
      ? frontendPage < enhancedMeta.frontendPages
      : false,
    hasPrevPage: frontendPage > 1,
    // Reset pagination
    resetPagination: () => setFrontendPage(1),
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
