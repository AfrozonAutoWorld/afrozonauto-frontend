"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useVerifyPayment } from "@/hooks/usePaymentMutation";

const PaymentCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const {
    mutate: verifyPayment,
    data,
    isPending,
    isSuccess,
    isError,
    error,
  } = useVerifyPayment();

  useEffect(() => {
    if (!reference) return;

    verifyPayment(
      { reference },
      {
        onSuccess: (result) => {
          const orderId = result?.payment?.orderId;
          if (orderId) {
            router.replace(`/marketplace/buyer/order/${orderId}`);
          } else {
            router.replace("/marketplace/buyer");
          }
        },
      },
    );
  }, [reference, verifyPayment, router]);

  if (!reference) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            Missing payment reference
          </h1>
          <p className="mb-4 text-sm text-gray-600">
            We couldn't find a payment reference in the URL. Please start the
            checkout process again.
          </p>
          <button
            onClick={() => router.push("/marketplace/buyer")}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
        {isPending && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-600" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">
              Verifying your payment
            </h1>
            <p className="text-sm text-gray-600">
              Please wait while we confirm your transaction.
            </p>
          </>
        )}

        {isSuccess && !isPending && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">
              Payment verified
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              Redirecting you to your order details...
            </p>
          </>
        )}

        {isError && !isPending && (
          <>
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-2 text-xl font-semibold text-gray-900">
              Payment verification failed
            </h1>
            <p className="mb-4 text-sm text-gray-600">
              {(error as any)?.message ||
                "There was a problem verifying your payment. If money was deducted, please contact support."}
            </p>
            <button
              onClick={() => router.push("/marketplace/buyer")}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;

