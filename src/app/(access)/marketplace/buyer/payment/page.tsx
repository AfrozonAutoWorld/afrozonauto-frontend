import { VerifyPaymentCallback } from '@/views/VerifyPayment';
import { Suspense } from 'react';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Verify Payment...</div>}>
      <VerifyPaymentCallback />
    </Suspense>

  );
}
