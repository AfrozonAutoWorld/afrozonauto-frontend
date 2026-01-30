import { apiClient } from "./client";
import { ApiSuccessResponse, Order } from "./orders";

export interface VerifyPayment {
  identifier: string;
  type: string;
  shippingMethod: string;
}
export interface PaymenInit {
  orderId: string;
  provider: string;
  paymentType: string; // FULL_PAYMENT | DEPOSIT | BALANCE
}
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

export interface PaymentMetadata {
  failureReason?: string;
  provider?: string;
  providerResponse?: any;
}
export type Currency = "USD" | "NGN" | null;

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amountUsd: number;
  amountLocal: number | null;
  localCurrency: Currency;
  exchangeRate: number | null;
  paymentType: string;
  paymentMethod: string | null;
  paymentProvider: string;
  status: string;
  escrowStatus: string;
  transactionRef: string;
  providerTransactionId: string | null;
  receiptUrl: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  refundedBy: string | null;
  description: string | null;
  metadata: PaymentMetadata | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  order: Order;
}
export interface PaymentInitResponse {
  success: boolean;
  message: string;
  data: {
    data: {
      authorizationUrl: string;
      reference: string;
      accessCode: string;
    };
  };
}

export interface PaymentByIdResponse {
  success: boolean;
  message: string;
  data: {
    data: Payment;
  };
  timestamp: string;
}

export interface PaymentVerification {
  success: boolean;
  payment: Payment;
  verification?: any;
  message?: string;
}

export interface PaymentVerification {
  success: boolean; // payment success
  payment: Payment; // payment object
  verification?: any; // provider raw data
  message?: string; // failure message
}

export interface PaymentVerifyResponse {
  success: boolean; // API success
  message: string;
  data: {
    data: PaymentVerification; // ✅ correct wrapper
  };
  timestamp: string;
}

export const paymentsApi = {
  getAllPayments: () =>
    apiClient.get<ApiSuccessResponse<Payment[]>>("/payments"),

  getCurrentUserPayment: () => apiClient.get<PaymentResponse>(`/payments/all/`),

  getPaymentById: (paymentId: string) =>
    apiClient.get<PaymentByIdResponse>(`/payments/payment-id/${paymentId}`),

  paymentInit: (data: PaymenInit) =>
    apiClient.post<PaymentInitResponse>("/payments/init", data),

  paymentVerify: (paymentId: string, provider: string) =>
    apiClient.post<PaymentVerifyResponse>(
      `/payments/verify/${paymentId}?provider=${provider}`,
      {},
    ),
};
