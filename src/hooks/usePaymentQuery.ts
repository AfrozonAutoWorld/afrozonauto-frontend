import { useQuery } from "@tanstack/react-query";
import { paymentsApi, type Payment } from "@/lib/api/payment";

export function usePayments() {
  const queryResult = useQuery<Payment[], Error>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await paymentsApi.getAllPayments();
      return res.data.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    payments: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function useUserPayments() {
  const queryResult = useQuery({
    queryKey: ["payments", "user"],
    queryFn: () => paymentsApi.getCurrentUserPayment(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    payments: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export function usePayment(paymentId: string) {
  const queryResult = useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => paymentsApi.getPaymentById(paymentId),
    enabled: !!paymentId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    payment: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
