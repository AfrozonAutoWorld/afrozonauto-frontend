import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../lib/api/requests";

export function useRequests() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: requestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      requestsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  return {
    requests,
    isLoading,
    createRequest: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useRequest(id: string) {
  const { data: request, isLoading } = useQuery({
    queryKey: ["requests", id],
    queryFn: () => requestsApi.getById(id),
    enabled: !!id,
  });

  return { request, isLoading };
}
