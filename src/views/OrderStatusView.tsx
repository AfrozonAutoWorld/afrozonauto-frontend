'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useOrder } from '@/hooks/useOrderQueries';
import { DepositPendingOrderView } from '@/components/orders/DepositPendingOrderView';
import { PaymentConfirmationModal } from '@/components/dashboard/PaymentConfirmationModal';
import { paymentsApi } from '@/lib/api/payment';
import { showToast } from '@/lib/showNotification';
import { PayoutSummary } from './PayoutSummary';

function parseNgnToUsd(amountTransferred: string, exchangeRate = 1550) {
  const numeric = Number(amountTransferred.replace(/[^\d.]/g, ''));
  if (!numeric || Number.isNaN(numeric)) return undefined;
  return numeric / exchangeRate;
}

export function OrderStatusView() {
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { order, isLoading, isError, refetch } = useOrder(id ?? '');
  const uploadEvidenceMutation = useMutation({
    mutationFn: async ({ file, amountTransferred }: { file: File; amountTransferred: string }) => {
      if (!order) return;
      const amountUsd = parseNgnToUsd(amountTransferred);
      await paymentsApi.uploadOrderPaymentEvidence({
        orderId: order.id,
        evidence: file,
        paymentType: "DEPOSIT",
        amountUsd,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: 'Payment confirmation submitted successfully.',
      });
      refetch();
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Unable to submit payment confirmation. Please try again.',
      });
      throw error;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Unable to load order</h2>
          <p className="mb-4 text-gray-600">Please try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (order.status === 'DEPOSIT_PENDING' || order.status === 'HALF_DEPOSIT_PAID') {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
        <DepositPendingOrderView
          order={order}
          onConfirmPayment={() => {
            setShowPaymentModal(true);
          }}
        />
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          order={order}
          onClose={() => setShowPaymentModal(false)}
          isSubmitting={uploadEvidenceMutation.isPending}
          onSubmitConfirmation={async ({ proofFile, amountTransferred }) => {
            await uploadEvidenceMutation.mutateAsync({
              file: proofFile,
              amountTransferred,
            });
          }}
        />
      </div>
    );
  }

  return <PayoutSummary />;
}
