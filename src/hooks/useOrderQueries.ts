import { useQuery } from "@tanstack/react-query";
import {
  ordersApi,
  type PaginatedOrders,
  type Order,
  type CostBreakdown,
} from "@/lib/api/orders";

export function useOrders() {
  const queryResult = useQuery<PaginatedOrders, Error>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await ordersApi.getAllOrder();
      return res.data.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  };
}

export function useOrder(orderId: string) {
  const queryResult = useQuery<Order, Error>({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await ordersApi.getOrderById(orderId);
      return res.data.data.data;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    order: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useCostBreakdown(
  vehicleId: string | undefined,
  shippingMethod: "RORO" | "CONTAINER" | "AIR_FREIGHT" | "EXPRESS",
) {
  const queryResult = useQuery<CostBreakdown, Error>({
    queryKey: ["orders", "costBreakdown", vehicleId, shippingMethod],
    queryFn: async () => {
      const res = await ordersApi.getPredefinePrices(
        vehicleId!,
        shippingMethod,
      );
      return res.data.data.data;
    },
    enabled: !!vehicleId && !!shippingMethod,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    costBreakdown: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}
