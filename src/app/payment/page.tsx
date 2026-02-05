'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { VerifyPaymentCallback } from '@/views/VerifyPayment';

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <VerifyPaymentCallback />
    </ProtectedRoute>
  );
}
