import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paymentsApi,
  type PaymenInit,
  type PaymentInitResponse,
  type PaymentVerification,
} from "@/lib/api/payment";
import { showToast } from "@/lib/showNotification";
import { ApiError } from "@/lib/api/client";

export function useInitializePayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentInitResponse["data"]["data"], ApiError, PaymenInit>(
    {
      mutationFn: async (payload) => {
        const res = await paymentsApi.paymentInit(payload);
        return res.data.data.data;
      },

      onSuccess: (data) => {
        showToast({
          type: "success",
          message: "Payment initialized successfully!",
        });

        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        }
      },

      onError: (error) => {
        showToast({
          type: "error",
          message: error.message || "Failed to initialize payment",
        });
      },
    },
  );
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentVerification, ApiError, { reference: string }>({
    mutationFn: async ({ reference }) => {
      const res = await paymentsApi.paymentVerify(reference);
      return res.data.data.data;
    },

    onSuccess: ({ success, message }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });

      showToast({
        type: success ? "success" : "error",
        message:
          message ||
          (success
            ? "Payment verified successfully!"
            : "Payment verification failed"),
      });
    },

    onError: (error) => {
      showToast({
        type: "error",
        message: error.message || "Failed to verify payment",
      });
    },
  });
}
