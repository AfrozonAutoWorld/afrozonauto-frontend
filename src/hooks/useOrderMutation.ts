import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ordersApi,
  type RequestVehicle,
  type VehicleOrder,
} from "@/lib/api/orders";
import { showToast } from "@/lib/showNotification";
import { ApiError } from "@/lib/api/client";

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<VehicleOrder, ApiError, RequestVehicle>({
    mutationFn: async (data: RequestVehicle) => {
      const res = await ordersApi.requestVehicle(data);
      return res.data.data.data;
    },
    onSuccess: (order: VehicleOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (order.id) {
        queryClient.setQueryData(["orders", order.id], order);
      }

      showToast({
        type: "success",
        message: "Request sent successfully! Redirecting to checkout page...",
      });

      router.push(`/marketplace/buyer/order/${order.id}`);
    },
    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to submit request",
      });
    },
  });
}
