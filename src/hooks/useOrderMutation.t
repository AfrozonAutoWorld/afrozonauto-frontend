import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersApi, type RequestVehicle, type VehicleOrder } from '@/lib/api/orders';
import { showToast } from '@/lib/showNotification';
import { ApiError } from '@/lib/api/client';

/**
 * Create a new vehicle request/order
 */
export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestVehicle) => ordersApi.requestVehicle(data),
    onSuccess: (order: VehicleOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      if (order.id) {
        queryClient.setQueryData(['orders', order.id], order);
      }

      showToast({
        type: 'success',
        message: 'Request sent successfully!',
      });

      router.push('/dashboard');
    },
    onError: (error: ApiError) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to submit request',
      });
    },
  });
}