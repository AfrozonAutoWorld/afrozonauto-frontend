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
        message: error.message || "Failed to add address",
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

export function useGetDefaultAddress() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["addresses", "default"],
    queryFn: async () => {
      try {
        const response = await addressApi.getDefualtAllAddress();
        const defaultAddress = response?.data?.data;
        return defaultAddress ? [defaultAddress] : [];
      } catch (err: any) {
        if (err?.status === 404 || err?.response?.status === 404) {
          return [];
        }
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const isNotFound =
    error &&
    ((error as any)?.status === 404 ||
      (error as any)?.response?.status === 404);

  return {
    defaultAddresses: data || [],
    isLoading,
    isError: isError && !isNotFound,
    isNotFound,
    error,
    refetch,
  };
}
