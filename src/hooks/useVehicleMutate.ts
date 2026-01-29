import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi, SaveVehiclePayload } from "../lib/api/vehicle";
import { ordersApi, RequestVehicle, VehicleOrder } from "../lib/api/orders";
import type { Vehicle } from "../types/";
import { showToast } from "../lib/showNotification";
import { ApiError } from "../lib/api/client";
import { useNavigate } from "react-router-dom";

interface UseSaveVehicleOptions {
  onSuccess?: (data: Vehicle) => void;
  onError?: (error: Error) => void;
}

export function useSaveVehicle(options?: UseSaveVehicleOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SaveVehiclePayload) =>
      vehiclesApi.saveVehicle(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      queryClient.setQueryData(["vehicle", data.id], data);

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return {
    saveVehicle: mutation.mutate,
    saveVehicleAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// You can also create a hook for toggling saved/favorited vehicles
interface ToggleSaveVehiclePayload {
  vehicleId: string;
  isSaved: boolean;
}

export function useToggleSaveVehicle(options?: {
  onSuccess?: (isSaved: boolean) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ vehicleId, isSaved }: ToggleSaveVehiclePayload) => {
      return { vehicleId, isSaved };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });

      options?.onSuccess?.(data.isSaved);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return {
    toggleSave: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}

export const useRequestOrderVehicle = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RequestVehicle) => ordersApi.requestVehicle(data),

    onSuccess: (order: VehicleOrder) => {
      const requestNumber = order.requestNumber;

      if (requestNumber) {
        showToast({
          type: "success",
          message: "Request sent successfully!",
        });

        navigate("/dashboard", {
          state: { newRequest: requestNumber },
        });
      }
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to submit request. Please try again.",
      });
    },
  });
};
