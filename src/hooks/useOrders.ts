import { useQuery } from "@tanstack/react-query";
import { ordersApi, PaginatedOrders } from "../lib/api/orders";

export function useAllOrders() {
  const queryResult = useQuery<PaginatedOrders, Error>({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getAllOrder(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    orders: queryResult.data?.orders ?? [],
    total: queryResult.data?.total ?? 0,
    page: queryResult.data?.page ?? 1,
    limit: queryResult.data?.limit ?? 10,
    totalPages: queryResult.data?.totalPages ?? 1,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
}

export function useGetOrder(orderId: string) {
  const queryResult = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId, // Only run query if orderId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    order: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
}

export const useCostBreakdown = (
  vehicleId: string | undefined,
  shippingMethod: "RORO" | "CONTAINER" | "AIR_FREIGHT" | "EXPRESS",
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["costBreakdown", vehicleId, shippingMethod],
    queryFn: () => ordersApi.getPredefinePrices(vehicleId!, shippingMethod),
    enabled: !!vehicleId && !!shippingMethod,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    costBreakdown: data,
    isLoading,
    isError,
    error,
  };
};
