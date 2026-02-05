import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PaymenInit,
  Payment,
  PaymentInitResponse,
  paymentsApi,
  PaymentVerification,
} from "../lib/api/payment";
import { showToast } from "../lib/showNotification";
import { ApiError } from "../lib/api/client";

export function useAllPayments() {
  const queryResult = useQuery<Payment[], Error>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await paymentsApi.getAllPayments();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    allPayments: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
}

export function useUserPayments() {
  const queryResult = useQuery({
    queryKey: ["user-payments"],
    queryFn: () => paymentsApi.getCurrentUserPayment(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    order: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
}

export function usePaymentById(paymentId: string) {
  const queryResult = useQuery({
    queryKey: ["payment-by-id", paymentId],
    queryFn: () => paymentsApi.getPaymentById(paymentId),
    enabled: !!paymentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    order: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
}
export const usePaymentInit = () => {
  return useMutation<PaymentInitResponse["data"]["data"], ApiError, PaymenInit>(
    {
      mutationFn: async (data: PaymenInit) => {
        const res = await paymentsApi.paymentInit(data);
        // res.data.data.data contains { authorizationUrl, reference, accessCode }
        return res.data.data;
      },
      onSuccess: (data) => {
        showToast({
          type: "success",
          message: "Payment initialized successfully!",
        });

        // Automatically redirect to payment gateway
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        }
      },
      onError: (error: ApiError) => {
        showToast({
          type: "error",
          message:
            error.message || "Failed to initialize payment. Please try again.",
        });
      },
    },
  );
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<PaymentVerification, ApiError, { reference: string }>({
    mutationFn: async ({ reference }) => {
      const res = await paymentsApi.paymentVerify(reference);
      // res.data.data.data contains PaymentVerification
      return res.data.data;
    },

    onSuccess: ({ success, message }) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      if (success) {
        showToast({
          type: "success",
          message: message || "Payment verified successfully!",
        });

        // Don't navigate away, let the parent component handle refresh
        // navigate("/dashboard", {
        //   state: { paymentId: payment.id },
        // });
      } else {
        showToast({
          type: "error",
          message: message || "Payment verification failed",
        });
      }
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to verify payment.",
      });
    },
  });
};
