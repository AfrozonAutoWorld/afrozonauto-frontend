import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi, SaveVehiclePayload } from "../lib/api/vehicle";
import { ordersApi, RequestVehicle, VehicleOrder } from "../lib/api/orders";
import type { Vehicle } from "../types/";
import { showToast } from "../lib/showNotification";
import { ApiError } from "../lib/api/client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { savedVehiclesStore } from "../lib/saveVehicleStore";

export const useRequestOrderVehicle = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestVehicle) => ordersApi.requestVehicle(data),

    onSuccess: (order: VehicleOrder) => {
      const requestNumber = order.requestNumber;

      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (order.id) {
        queryClient.setQueryData(["order", order.id], order);
      }

      if (requestNumber) {
        showToast({
          type: "success",
          message: "Request sent successfully!",
        });

        router.push("/dashboard");
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

export function useSavedVehicles() {
  const [savedVehicleIds, setSavedVehicleIds] = useState<Set<string>>(() =>
    savedVehiclesStore.getSavedVehicleIds(),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      savedVehiclesStore;
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const refetch = () => {
    setSavedVehicleIds(savedVehiclesStore.getSavedVehicleIds());
  };

  return {
    savedVehicleIds,
    isVehicleSaved: (id: string) => savedVehicleIds.has(id),
    refetch,
  };
}

/**
 * Hook to save a vehicle using API with optimistic updates
 */
export function useSaveVehicle() {
  const queryClient = useQueryClient();
  const { refetch: refetchSaved } = useSavedVehicles();

  return useMutation({
    mutationFn: (payload: SaveVehiclePayload) =>
      vehiclesApi.saveVehicle(payload),

    onMutate: async (payload) => {
      // Optimistically add to localStorage
      const tempId = payload.vin; // Use VIN temporarily
      savedVehiclesStore.addSavedVehicle(tempId, payload.vin);
      refetchSaved();

      return { tempId };
    },

    onSuccess: (savedVehicle, _payload, context) => {
      // Update localStorage with actual vehicle ID from server
      if (context?.tempId && savedVehicle.id !== context.tempId) {
        savedVehiclesStore.removeSavedVehicle(context.tempId);
        savedVehiclesStore.addSavedVehicle(savedVehicle.id, savedVehicle.vin);
      }

      refetchSaved();
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      showToast({
        type: "success",
        message: "Vehicle saved successfully!",
      });
    },

    onError: (error: Error, _payload, context) => {
      // Rollback localStorage on error
      if (context?.tempId) {
        savedVehiclesStore.removeSavedVehicle(context.tempId);
        refetchSaved();
      }

      showToast({
        type: "error",
        message: error.message || "Failed to save vehicle",
      });
    },
  });
}

/**
 * Helper hook to build SaveVehiclePayload from a Vehicle
 */
export function useCreateSavePayload() {
  return (vehicle: Vehicle): SaveVehiclePayload => {
    return {
      vin: vehicle.vin,
      listing: {
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.priceUsd,
        mileage: vehicle.mileage || 0,
        bodyStyle: vehicle.vehicleType,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        exteriorColor: vehicle.exteriorColor || "Unknown",
        interiorColor: vehicle.interiorColor || "Unknown",
        dealerName: vehicle.dealerName,
        dealerState: vehicle.dealerState,
        dealerCity: vehicle.dealerCity,
        dealerZipCode: vehicle.dealerZipCode || "",
        features: vehicle.features || [],
      },
      photos: vehicle.images || [],
      specs: {
        engine: vehicle.engineSize || "",
        horsepower: vehicle.horsepower || 0,
        torque: vehicle.torque || 0,
      },
    };
  };
}
