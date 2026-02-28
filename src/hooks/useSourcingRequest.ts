import { useMutation } from '@tanstack/react-query';
import {
  sourcingRequestsApi,
  type CreateSourcingRequestPayload,
  type SourcingRequestCreated,
} from '@/lib/api/sourcingRequests';
import { ApiError } from '@/lib/api/client';
import { showToast } from '@/lib/showNotification';

export function useCreateSourcingRequest() {
  return useMutation<SourcingRequestCreated, ApiError, CreateSourcingRequestPayload>({
    mutationFn: async (payload: CreateSourcingRequestPayload) => {
      const res = await sourcingRequestsApi.create(payload);
      const body = res?.data as { data?: SourcingRequestCreated | { data?: SourcingRequestCreated } };
      const inner = body?.data;
      if (inner != null && typeof inner === 'object' && 'data' in inner) return inner.data as SourcingRequestCreated;
      return inner as SourcingRequestCreated;
    },
    onSuccess: (data: SourcingRequestCreated) => {
      showToast({
        type: 'success',
        message: `Request submitted. Your reference: ${data.requestNumber}. We'll email you at ${data.email} within 48 hours.`,
      });
    },
    onError: (error: ApiError) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to submit request. Please try again.',
      });
    },
  });
}
