import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useVerifyPayment } from '../hooks/usePayments';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'cancelled';

export function VerifyPaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  const { mutateAsync: verifyPayment } = useVerifyPayment();

  useEffect(() => {
    const handlePaymentVerification = async () => {
      try {
        // Get payment reference from URL params
        const reference = searchParams.get('reference');
        //  const provider = searchParams.get('provider') || 'paystack';
        const trxref = searchParams.get('trxref'); // Paystack uses this
        const transaction_id = searchParams.get('transaction_id'); // Flutterwave uses this

        // Handle cancelled payments
        const cancelled = searchParams.get('cancelled');
        if (cancelled === 'true') {
          setStatus('cancelled');
          setMessage('Payment was cancelled. You will be redirected to your dashboard.');
          setTimeout(() => router.push('/dashboard'), 3000);
          return;
        }

        // Determine the actual payment reference
        const paymentReference = reference || trxref || transaction_id;

        if (!paymentReference) {
          setStatus('failed');
          setMessage('No payment reference found. Please contact support if you were charged.');
          setTimeout(() => router.push('/dashboard'), 5000);
          return;
        }

        // Verify the payment
        setMessage('Verifying payment with payment provider...');
        await verifyPayment({
          reference: paymentReference,
          // provider: provider as 'paystack' | 'flutterwave'
        });

        // Payment verified successfully
        setStatus('success');
        setMessage('Payment successful! Redirecting to your dashboard...');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (error: any) {
        console.error('Payment verification failed:', error);

        setStatus('failed');

        // Provide more specific error messages
        if (error?.response?.data?.message) {
          setMessage(error.response.data.message);
        } else if (error?.message) {
          setMessage(error.message);
        } else {
          setMessage('Payment verification failed. Please contact support if you were charged.');
        }

        // Still redirect to dashboard after 5 seconds so user can see their order status
        setTimeout(() => router.push('/dashboard'), 5000);
      }
    };

    handlePaymentVerification();
  }, [searchParams, verifyPayment, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}

          {(status === 'failed' || status === 'cancelled') && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        {/* Status Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {status === 'verifying' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'failed' && 'Payment Failed'}
          {status === 'cancelled' && 'Payment Cancelled'}
        </h2>

        {/* Status Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Progress indicator for verifying state */}
        {status === 'verifying' && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-2/3" />
          </div>
        )}

        {/* Action buttons for failed/cancelled states */}
        {(status === 'failed' || status === 'cancelled') && (
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        )}

        {/* Success state - show automatic redirect message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              You will be automatically redirected to your dashboard in a few seconds...
            </p>
          </div>
        )}

        {/* Verifying state - helpful info */}
        {status === 'verifying' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Please wait while we confirm your payment with the payment provider.
              This usually takes just a few seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}