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
  callbackUrl?: string;
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
  calculation: {
    totalAmountUsd: number;
    paymentAmount: number;
    depositPercentage: number;
    isDeposit: boolean;
    remainingBalance: number;
    paymentType: "FULL_PAYMENT" | "DEPOSIT" | "BALANCE";
  };
  isDeposit: boolean;
  depositPercentage: number;
  remainingBalance: number;
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
  success: boolean;
  payment: Payment;
  verification?: any;
  message?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data: {
    data: PaymentVerification;
  };
  timestamp: string;
}

export const paymentsApi = {
  getAllPayments: () =>
    apiClient.get<ApiSuccessResponse<Payment[]>>("/payments/all"),

  getCurrentUserPayment: () =>
    apiClient.get<PaymentResponse>(`/payments/user-mine`),

  getPaymentById: (paymentId: string) =>
    apiClient.get<PaymentByIdResponse>(`/payments/payment-id/${paymentId}`),

  paymentInit: (data: PaymenInit) =>
    apiClient.post<PaymentInitResponse>("/payments/init", data),

  paymentVerify: (reference: string) =>
    apiClient.patch<PaymentVerifyResponse>(
      `/payments/verify/${reference}?provider=paystack`,
      {},
    ),
};
