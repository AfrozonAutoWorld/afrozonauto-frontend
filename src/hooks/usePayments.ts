import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PaymenInit,
  Payment,
  PaymentByIdResponse,
  paymentsApi,
  PaymentVerification,
  VerifyPayment,
} from "../lib/api/payment";
import { VehicleOrder } from "../lib/api/orders";
import { showToast } from "../lib/showNotification";
import { useNavigate } from "react-router";
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
    order: queryResult.data,
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
  const navigate = useNavigate();

  return useMutation<Payment, ApiError, PaymenInit>({
    // mutationFn returns Payment
    mutationFn: async (data: PaymenInit) => {
      const res = await paymentsApi.paymentInit(data);
      return res.data.data[0]; // unwrap the Payment from PaymentResponse
    },
    onSuccess: (payment: Payment) => {
      showToast({
        type: "success",
        message: "Payment initialized successfully!",
      });

      navigate("/dashboard", {
        state: { paymentId: payment.id },
      });
    },
    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message:
          error.message || "Failed to initialize payment. Please try again.",
      });
    },
  });
};

export const useVerifyPayment = () => {
  const navigate = useNavigate();

  return useMutation<
    PaymentVerification,
    ApiError,
    { paymentId: string; provider: string }
  >({
    mutationFn: async ({ paymentId, provider }) => {
      const res = await paymentsApi.paymentVerify(paymentId, provider);
      return res.data.data; // ✅ returns PaymentVerification
    },

    onSuccess: ({ success, payment, message }) => {
      if (success) {
        showToast({
          type: "success",
          message: "Payment verified successfully!",
        });

        navigate("/dashboard", {
          state: { paymentId: payment.id },
        });
      } else {
        showToast({
          type: "error",
          message:
            message ||
            payment.metadata?.failureReason ||
            "Payment verification failed",
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
