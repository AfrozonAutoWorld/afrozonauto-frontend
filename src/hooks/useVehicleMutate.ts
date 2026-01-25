import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi, SaveVehiclePayload } from "../lib/api/vehicle";
import type { Vehicle } from "../types/";

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
