'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { vehiclesApi } from '@/lib/api/vehicle';
import { showToast } from '@/lib/showNotification';
import type { Vehicle } from '@/types';
import { useSaveVehicle, useCreateSavePayload } from './useVehicleMutate';

export interface SavedVehicleItem {
  vehicle: Vehicle;
  savedAt: string;
}

/** Fetch current user's saved vehicles (only when authenticated). */
export function useSavedVehiclesApi() {
  const { status } = useSession();
  const enabled = status === 'authenticated';

  const query = useQuery({
    queryKey: ['vehicles', 'saved'],
    queryFn: vehiclesApi.getSavedVehicles,
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  const savedIds = new Set(
    (query.data ?? []).map((item) => item.vehicle.id).filter(Boolean)
  );

  return {
    items: query.data ?? [],
    savedIds,
    isSaved: (vehicleId: string) => savedIds.has(vehicleId),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Add vehicle to saved list. */
export function useAddSavedVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesApi.addSavedVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'recommended'] });
      showToast({ type: 'success', message: 'Vehicle saved' });
    },
    onError: (err: Error) => {
      showToast({ type: 'error', message: err.message || 'Failed to save vehicle' });
    },
  });
}

/** Remove vehicle from saved list. */
export function useRemoveSavedVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesApi.removeSavedVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'recommended'] });
      showToast({ type: 'success', message: 'Removed from saved' });
    },
    onError: (err: Error) => {
      showToast({ type: 'error', message: err.message || 'Failed to remove' });
    },
  });
}

/**
 * Toggle save: if vehicle is from API (temp id), persist it first then add to saved; otherwise add/remove.
 */
export function useToggleSaved() {
  const { isSaved, refetch } = useSavedVehiclesApi();
  const addSaved = useAddSavedVehicle();
  const removeSaved = useRemoveSavedVehicle();
  const saveToDb = useSaveVehicle();
  const createPayload = useCreateSavePayload();
  const queryClient = useQueryClient();

  const toggle = async (vehicle: Vehicle) => {
    const id = vehicle?.id ?? '';
    const saved = isSaved(id);

    if (saved) {
      if (!id.startsWith('temp-')) await removeSaved.mutateAsync(id);
      return;
    }

    if (id.startsWith('temp-')) {
      const payload = createPayload(vehicle);
      const savedVehicle = await saveToDb.mutateAsync(payload);
      await addSaved.mutateAsync(savedVehicle.id);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    } else {
      await addSaved.mutateAsync(id);
    }
  };

  return {
    toggle,
    isSaved: (vehicleId: string) => isSaved(vehicleId),
    isPending: addSaved.isPending || removeSaved.isPending || saveToDb.isPending,
  };
}
