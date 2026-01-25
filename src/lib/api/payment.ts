import { apiClient } from "./client";
import type { Payment } from "../../types";

export interface CreatePaymentData {
  requestId: string;
  paymentType: "deposit" | "balance" | "full_payment";
  amountUsd: number;
  paymentMethod: string;
}

export interface PaymentResponse {
  payment: Payment;
  paymentUrl?: string;
}

export const paymentsApi = {
  getAll: () => apiClient.get<Payment[]>("/payments", true),

  getByRequestId: (requestId: string) =>
    apiClient.get<Payment[]>(`/payments/request/${requestId}`, true),

  create: (data: CreatePaymentData) =>
    apiClient.post<PaymentResponse>("/payments", data, true),

  verify: (paymentId: string, reference: string) =>
    apiClient.post<Payment>(
      `/payments/${paymentId}/verify`,
      { reference },
      true
    ),
};
