import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "../lib/api/address";
import { showToast } from "../lib/showNotification";
import { ApiError } from "../lib/api/client";
import { AddressInput } from "../lib/validation/auth.schema";

export function useAddressMutate() {
  const queryClient = useQueryClient();

  const addUserAddressMutation = useMutation({
    mutationFn: (data: AddressInput) => addressApi.addUserAddress(data),

    onSuccess: () => {
      // Refetch user data to get updated addresses
      queryClient.invalidateQueries({ queryKey: ["addressess", ""] });
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] });
      showToast({
        type: "success",
        message: "Address added successfully!",
      });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to add address",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressInput }) =>
      addressApi.updateAddress(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] });
      showToast({
        type: "success",
        message: "Address updated successfully!",
      });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to update address",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => addressApi.deleteAddress(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] });
      showToast({
        type: "success",
        message: "Address deleted successfully.",
      });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to delete address",
      });
    },
  });

  return {
    updateAddress: updateAddressMutation.mutateAsync,
    addUserAddress: addUserAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
  };
}
export function useGetAddresses() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await addressApi.getAllAddresses();
      // Extract the actual data from the nested response
      return response?.data?.data || [];
    },
    retry: 1,
  });

  return {
    addresses: data || [], // Always return an array, even if empty
    isLoading,
    isError,
    refetch,
  };
}

function isEmptyDefaultAddress(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "object") return true;
  const obj = value as Record<string, unknown>;
  return !obj.id && Object.keys(obj).length === 0;
}

export function useGetDefaultAddress() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["addresses", "default"],
    queryFn: async () => {
      const response = await addressApi.getDefualtAllAddress();
      const raw = response?.data?.data;
      if (raw == null || isEmptyDefaultAddress(raw)) return [];
      const defaultAddress = raw && typeof raw === "object" && "id" in raw ? raw : null;
      return defaultAddress ? [defaultAddress] : [];
    },
    retry: 1,
  });

  return {
    defaultAddresses: data || [],
    isLoading,
    isError,
    refetch,
  };
}
