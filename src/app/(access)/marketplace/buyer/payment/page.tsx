import { VerifyPaymentCallback } from "@/views/VerifyPayment";
import { firstSearchParam } from "@/lib/nextSearchParams";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export default function PaymentPage({ searchParams }: PageProps) {
  return (
    <VerifyPaymentCallback
      reference={firstSearchParam(searchParams, "reference")}
      trxref={firstSearchParam(searchParams, "trxref")}
      transactionId={firstSearchParam(searchParams, "transaction_id")}
      cancelled={firstSearchParam(searchParams, "cancelled")}
    />
  );
}
