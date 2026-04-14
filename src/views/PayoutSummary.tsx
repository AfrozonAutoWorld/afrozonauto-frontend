"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Shield,
  X,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatCurrency } from "../lib/pricingCalculator";
import { showToast } from "@/lib/showNotification";
import {
  ordersApi,
  type OrderStatusUpdateValue,
} from "@/lib/api/orders";
import {
  useOrder,
  usePlatformBankAccounts,
} from "@/hooks/useOrderQueries";
import { sumPaymentsTowardPaid } from "@/lib/orderPaymentUtils";

function getOrderPrimaryImage(order: any): string {
  const fallbackImage = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

  const primaryImage = order.vehicleSnapshot?.apiData?.listing?.retailListing?.primaryImage
    || order.vehicleSnapshot?.apiData?.listing?.wholesaleListing?.primaryImage;

  if (primaryImage) return primaryImage;

  if (order.vehicleSnapshot?.images && order.vehicleSnapshot.images.length > 0) {
    return order.vehicleSnapshot.images[0];
  }

  if (order.vehicle?.images && order.vehicle.images.length > 0) {
    return order.vehicle.images[0];
  }

  return fallbackImage;
}

function getOrderVehicleName(order: any): string {
  const snapshot = order.vehicleSnapshot;
  const vehicle = order.vehicle;

  if (snapshot?.year && snapshot?.make && snapshot?.model) {
    return `${snapshot.year} ${snapshot.make} ${snapshot.model}`;
  }

  if (vehicle?.year && vehicle?.make && vehicle?.model) {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  }

  return order.requestNumber || `Order #${order.id}`;
}

const FULLY_PAID_STATUSES = ["BALANCE_PAID", "DELIVERED", "CANCELLED"];
const MANUAL_REVIEW_STATUSES = [
  "PENDING_REVIEW",
  "PAYMENT_UNDER_REVIEW",
  "AWAITING_APPROVAL",
];

function toNgn(usd: number, rate = 1550) {
  return Math.round((usd || 0) * rate);
}

function compactVin(vin?: string) {
  if (!vin) return "VIN unavailable";
  if (vin.length <= 4) return "VIN: ****";
  return `VIN: *************${vin.slice(-4)}`;
}

export function PayoutSummary() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [vinCopied, setVinCopied] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    "deposit" | "full" | "balance"
  >("deposit");

  const { order, isLoading, isError, refetch } = useOrder(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-emerald-600 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 max-w-md text-center bg-white rounded-xl shadow-sm">
          <AlertCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Order Not Found</h2>
          <p className="mb-4 text-gray-600">
            We couldn't find the order you're looking for.
          </p>
          <button
            onClick={() => router.push("/marketplace/buyer")}
            className="px-6 py-3 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 max-w-md text-center bg-white rounded-xl shadow-sm">
          <AlertCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Error Loading Order</h2>
          <p className="mb-4 text-gray-600">
            There was an error fetching your order details. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }



  const vehicleName = getOrderVehicleName(order);
  const vehicleImage = getOrderPrimaryImage(order);
  const totalCostUsd =
    order.paymentBreakdown?.totalUsd ??
    order.totalLandedCostUsd ??
    order.quotedPriceUsd ??
    0;
  const exchangeRate = 1550;
  const totalCostNgn = toNgn(totalCostUsd, exchangeRate);
  const depositAmountUsd =
    order.depositAmountUsd ?? order.paymentBreakdown?.totalUsedDeposit ?? 0;
  const depositAmountNgn = toNgn(depositAmountUsd, exchangeRate);

  const totalPaid = sumPaymentsTowardPaid(order.payments);
  const remainingBalanceUsd = Math.max(totalCostUsd - totalPaid, 0);
  const remainingBalanceNgn = toNgn(remainingBalanceUsd, exchangeRate);
  const depositAlreadyPaid =
    order.status === "DEPOSIT_PAID" || FULLY_PAID_STATUSES.includes(order.status);
  const isClosedStatus = FULLY_PAID_STATUSES.includes(order.status);
  const isManualReviewStatus = MANUAL_REVIEW_STATUSES.includes(order.status);

  const shippingMethodLabel = order.shippingMethod === "CONTAINER"
    ? "Container"
    : "Roll-on/Roll-off (RoRo)";
  const destinationLabel = [order.destinationCity, order.destinationState]
    .filter(Boolean)
    .join(", ") || "Delivery location pending";

  const amountDueNowUsd = depositAlreadyPaid ? remainingBalanceUsd : depositAmountUsd;
  const amountDueNowNgn = toNgn(amountDueNowUsd, exchangeRate);
  const optionConfig = {
    deposit: {
      title: "30% Deposit",
      subtitle: "Reserve this car today. Pay the remaining 70% before it ships.",
      amountUsd: depositAmountUsd,
      amountNgn: depositAmountNgn,
      disabled: depositAlreadyPaid || depositAmountUsd <= 0,
    },
    full: {
      title: "Full Payment",
      subtitle: "Pay the total amount now. Your car ships within 45 days of confirmation.",
      amountUsd: totalCostUsd,
      amountNgn: totalCostNgn,
      disabled: totalCostUsd <= 0,
    },
    balance: {
      title: "Remaining Balance",
      subtitle: "Complete your outstanding balance before shipment.",
      amountUsd: remainingBalanceUsd,
      amountNgn: remainingBalanceNgn,
      disabled: !depositAlreadyPaid || remainingBalanceUsd <= 0,
    },
    amountDueNowUsd,
    amountDueNowNgn,
  };

  const canOpenManualPayment =
    !isClosedStatus &&
    !isManualReviewStatus &&
    optionConfig.amountDueNowUsd > 0;

  const handleCopyVin = async () => {
    const vin = order.vehicleSnapshot?.vin;
    if (!vin) return;

    try {
      await navigator.clipboard.writeText(vin);
      setVinCopied(true);
      setTimeout(() => setVinCopied(false), 1800);
    } catch {
      setVinCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "Home", href: "/" },
            { label: "Browse Cars", href: "/marketplace" },
            { label: "Vehicle Details", href: "/marketplace" },
            { label: vehicleName, href: `/marketplace/buyer/order/${order.id}` },
            { label: "Payout" },
          ]}
          linkClassName="text-sm text-[#9CA3AF] hover:text-[#546881]"
          currentClassName="text-sm font-semibold text-[#546881]"
          separatorClassName="h-4 w-4 text-[#D1D5DB]"
        />

        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#546881] transition hover:bg-gray-50"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <section className="grid items-center gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl bg-[#BBD6DD]">
            <img src={vehicleImage} alt={vehicleName} className="h-full min-h-[220px] w-full object-cover" />
          </div>

          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-lg bg-[#006557] px-3 py-1 text-sm font-medium text-[#E8E8E8]">
              Available
            </span>

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-base text-[#546881]">
                <MapPin className="w-4 h-4" />
                {order.vehicleSnapshot?.dealerName || "Dealer unavailable"}
                {(order.vehicleSnapshot?.dealerCity || order.vehicleSnapshot?.dealerState) ? ` - ${order.vehicleSnapshot?.dealerCity || ""}${order.vehicleSnapshot?.dealerState ? `, ${order.vehicleSnapshot.dealerState}` : ""}` : ""}
              </p>
              <h1 className="font-sans text-3xl font-bold text-[#1A1A1A]">{vehicleName}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#546881]">
                <span>{order.vehicleSnapshot?.vehicleType || "Coupe"}</span>
                <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                <span>{order.vehicleSnapshot?.transmission || "AWD"}</span>
                <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />
                <span>{order.vehicleSnapshot?.fuelType || "Diesel"}</span>
              </div>
              <div className="flex gap-2 items-center w-fit">
                <span className="inline-flex rounded-lg bg-[#F0F2F5] px-3 py-1.5 text-sm text-[#546881]">
                  {compactVin(order.vehicleSnapshot?.vin)}
                </span>
                {/* <button
                  type="button"
                  onClick={handleCopyVin}
                  disabled={!order.vehicleSnapshot?.vin}
                  className="inline-flex items-center justify-center rounded-lg border border-[#D1D5DB] bg-white p-2 text-[#546881] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={vinCopied ? "VIN copied" : "Copy VIN"}
                  title={vinCopied ? "VIN copied" : "Copy VIN"}
                >
                  {vinCopied ? (
                    <Check className="h-4 w-4 text-[#0D7A4A]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button> */}
              </div>
            </div>
          </div>
        </section>

        <hr className="my-8 border-[#E5E7EB]" />

        <section className="space-y-5">

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
            <div className="space-y-5">
              <div>
                <h2 className="font-sans text-3xl font-bold text-[#1A1A1A]">Payment Options</h2>
                <p className="mt-2 text-base text-[#64748B]">
                  You can choose to pay 30% to secure your car or pay in full now.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={optionConfig.deposit.disabled || isClosedStatus}
                  onClick={() => setSelectedPaymentOption("deposit")}
                  className={`relative rounded-2xl border px-4 py-6 text-left transition ${
                    selectedPaymentOption === "deposit"
                      ? "border-[#0D7A4A] bg-[#E6F6F4]"
                      : "border-[#D1D5DB] bg-white"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span
                    className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                      selectedPaymentOption === "deposit"
                        ? "border-[#008000] bg-[#008000] text-white"
                        : "border-[#969696] text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                  <p className={`text-sm font-semibold ${selectedPaymentOption === "deposit" ? "text-[#0D7A4A]" : "text-[#1A1A1A]"}`}>
                    {optionConfig.deposit.title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#969696]">{optionConfig.deposit.subtitle}</p>
                  <p className={`mt-5 font-sans text-2xl font-bold ${selectedPaymentOption === "deposit" ? "text-[#0D7A4A]" : "text-[#1A1A1A]"}`}>
                    {formatCurrency(optionConfig.deposit.amountNgn, "NGN")}
                  </p>
                  <p className="text-[10px] text-[#969696]">due today</p>
                </button>

                <button
                  type="button"
                  disabled={optionConfig.full.disabled || isClosedStatus}
                  onClick={() => setSelectedPaymentOption("full")}
                  className={`relative rounded-2xl border px-4 py-6 text-left transition ${
                    selectedPaymentOption === "full"
                      ? "border-[#0D7A4A] bg-[#E6F6F4]"
                      : "border-[#969696] bg-white"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span
                    className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                      selectedPaymentOption === "full"
                        ? "border-[#008000] bg-[#008000] text-white"
                        : "border-[#969696] text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                  <p className={`text-sm font-semibold ${selectedPaymentOption === "full" ? "text-[#0D7A4A]" : "text-[#1A1A1A]"}`}>
                    {optionConfig.full.title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#969696]">{optionConfig.full.subtitle}</p>
                  <p className={`mt-5 font-sans text-2xl font-bold ${selectedPaymentOption === "full" ? "text-[#0D7A4A]" : "text-[#1A1A1A]"}`}>
                    {formatCurrency(optionConfig.full.amountNgn, "NGN")}
                  </p>
                  <p className="text-[10px] text-[#969696]">due today</p>
                </button>
              </div>

              <div className="flex gap-3 rounded-2xl p-6 text-sm text-[#666666]">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  {selectedPaymentOption === "deposit"
                    ? "You are paying a 30% deposit to secure this vehicle. The balance will be due before your car is shipped."
                    : "You are paying the full amount now. Our team will begin fulfilment immediately after payment confirmation."}{" "}
                  For inquiries,{" "}
                  <Link href="/contact" className="font-medium underline">
                    Contact Us
                  </Link>
                  .
                </p>
              </div>
            </div>
          <div className="space-y-5">
              <h2 className="font-sans text-3xl font-bold text-[#1A1A1A]">Payout Summary</h2>
              <div className="px-5 py-6 space-y-4 bg-white rounded-2xl">
                <div className="flex gap-4 justify-between items-center text-base">
                  <span>Shipping method</span>
                  <span className="text-right font-semibold text-[#374151]">{shippingMethodLabel}</span>
                </div>
                <div className="flex gap-4 justify-between items-center text-base">
                  <span>Delivery location</span>
                  <span className="text-right font-semibold text-[#374151]">{destinationLabel}</span>
                </div>
                <div className="pt-4">
                  <h3 className="mb-4 font-sans text-xl font-semibold text-[#111827]">Price Breakdown</h3>
                  <div className="space-y-4 text-base text-[#374151]">
                    <Row label="Vehicle Price" value={formatCurrency(order.paymentBreakdown?.breakdown?.vehiclePriceUsd || 0)} />
                    <Row label="Afrozon Sourcing Fee" value={formatCurrency(order.paymentBreakdown?.breakdown?.sourcingFee || 0, "USD", { preciseUsd: true })} />
                    <Row label="Pre-Purchase Inspection" value={formatCurrency(order.paymentBreakdown?.breakdown?.prePurchaseInspectionUsd || 0)} />
                    <Row label="US Handling Fee" value={formatCurrency(order.paymentBreakdown?.breakdown?.usHandlingFeeUsd || 0)} />
                    <Row label="Shipping Cost" value={formatCurrency(order.paymentBreakdown?.breakdown?.shippingCostUsd || 0)} />
                    <div className="border-t border-[#E5E7EB] pt-4">
                      <Row
                        label="Total"
                        value={`${formatCurrency(totalCostUsd, "USD", { preciseUsd: true })} (${formatCurrency(totalCostNgn, "NGN")})`}
                      />
                    </div>
                    <Row
                      label={`Amount due today (${selectedPaymentOption === "full" ? "100%" : "30%"})`}
                      value={formatCurrency(
                        selectedPaymentOption === "full" ? totalCostNgn : depositAmountNgn,
                        "NGN",
                      )}
                      valueClassName="font-bold text-[#0D7A4A] text-lg"
                    />
                  </div>
                </div>
                <p className="text-sm italic text-[#003B33]">
                  * Exchange rate: $1 = ₦{exchangeRate} NGN. Prices are estimates and may vary based on market conditions.
                </p>
              </div>
            </div>
            </div>
          <aside className="rounded-2xl bg-white p-6 shadow-[0_1px_24px_2px_rgba(0,0,0,0.08)] h-fit">
            <p className="text-lg text-[#969696]">Amount due today</p>
            <p className="mt-2 font-sans text-4xl font-bold text-[#0D7A4A]">
              {formatCurrency(
                selectedPaymentOption === "full" ? totalCostNgn : depositAmountNgn,
                "NGN",
              )}
            </p>
            <p className="mt-2 text-lg text-[#969696]">
              {formatCurrency(
                selectedPaymentOption === "full" ? totalCostUsd : depositAmountUsd,
                "USD",
                { preciseUsd: true },
              )}{" "}
              at ₦{exchangeRate}/$1
            </p>

            {isManualReviewStatus ? (
              <div className="p-4 mt-8 text-sm text-amber-800 bg-amber-50 rounded-xl border border-amber-200">
                Payment proof submitted. Our team is currently reviewing and will update your order once approved.
              </div>
            ) : isClosedStatus ? (
              <div className="flex gap-2 items-center p-4 mt-8 text-sm text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle className="w-5 h-5" />
                Payment complete
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowManualPaymentModal(true)}
                disabled={!canOpenManualPayment}
                className="mt-8 flex w-full items-center justify-center rounded-lg bg-[#0D7A4A] px-6 py-4 text-lg font-medium text-white transition hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Proceed to payment
              </button>
            )}

            <div className="mt-8 space-y-4">
              <SafetyLine text="Your payment is held securely in escrow until delivery is confirmed" />
              <SafetyLine text="All vehicles inspected before purchase by Afrozon" />
              <SafetyLine text="Full refund if vehicle does not pass final inspection" />
            </div>
          </aside>
          </div>

        </section>
      </div>

      {showManualPaymentModal && (
        <ManualPaymentModal
          orderId={order.id}
          currentStatus={order.status}
          amountNgn={
            selectedPaymentOption === "full"
              ? totalCostNgn
              : selectedPaymentOption === "balance"
              ? remainingBalanceNgn
              : depositAmountNgn
          }
          amountUsd={
            selectedPaymentOption === "full"
              ? totalCostUsd
              : selectedPaymentOption === "balance"
              ? remainingBalanceUsd
              : depositAmountUsd
          }
          onClose={() => setShowManualPaymentModal(false)}
          orderRef={order.requestNumber || order.id}
          onStatusUpdated={async () => {
            await queryClient.invalidateQueries({ queryKey: ["orders"] });
            setShowManualPaymentModal(false);
            router.push("/marketplace/buyer");
          }}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName = "text-right font-semibold text-[#374151]",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex gap-4 justify-between items-center">
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

function SafetyLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#484848]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D1FAE5]">
        <Check className="h-3.5 w-3.5 text-[#008000]" />
      </span>
      <span>{text}</span>
    </div>
  );
}

function ManualPaymentModal({
  orderId,
  currentStatus,
  amountNgn,
  amountUsd,
  orderRef,
  onClose,
  onStatusUpdated,
}: {
  orderId: string;
  currentStatus: string;
  amountNgn: number;
  amountUsd: number;
  orderRef: string;
  onClose: () => void;
  onStatusUpdated?: () => void | Promise<void>;
}) {
  const { bankAccounts, isLoading: isBankAccountsLoading } = usePlatformBankAccounts();
  const [selectedBankId, setSelectedBankId] = useState("");
  const [accountCopied, setAccountCopied] = useState(false);
  const [bankSelected, setBankSelected] = useState(false);

  useEffect(() => {
    if (!selectedBankId && bankAccounts.length > 0) {
      setSelectedBankId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankId]);

  const selectedBank =
    bankAccounts.find((account) => account.id === selectedBankId) ?? null;
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const sequence: OrderStatusUpdateValue[] = [];

      if (currentStatus === "PENDING_QUOTE") {
        sequence.push("QUOTE_SENT");
      }

      if (currentStatus === "PENDING_QUOTE" || currentStatus === "QUOTE_SENT") {
        sequence.push("QUOTE_ACCEPTED");
      }

      if (
        currentStatus === "PENDING_QUOTE" ||
        currentStatus === "QUOTE_SENT" ||
        currentStatus === "QUOTE_ACCEPTED"
      ) {
        sequence.push("DEPOSIT_PENDING");
      }

      for (const status of sequence) {
        await ordersApi.updateOrderStatus(orderId, status);
      }
    },
    onSuccess: async () => {
      setBankSelected(true);
      setTimeout(() => setBankSelected(false), 1800);
      showToast({
        type: "success",
        message: "Bank account selected. Order status updated to deposit pending.",
      });
      await onStatusUpdated?.();
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to update order status. Please try again.",
      });
    },
  });

  const handleCopyAccountNumber = async () => {
    if (!selectedBank?.accountNumber) return;

    try {
      await navigator.clipboard.writeText(selectedBank.accountNumber);
      setAccountCopied(true);
      setTimeout(() => setAccountCopied(false), 1800);
    } catch {
      setAccountCopied(false);
    }
  };

  const handleUseBankAccount = () => {
    if (!selectedBank || updateStatusMutation.isPending) return;
    updateStatusMutation.mutate();
  };

  return (
    <div
      className="overflow-y-auto fixed inset-0 z-50 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-payment-title"
    >
      <div className="flex justify-center items-center px-4 py-8 min-h-full sm:px-6">
        <div className="relative p-6 w-full max-w-lg bg-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-start mb-5">
          <div>
            <h3 id="manual-payment-title" className="font-sans text-2xl font-bold text-[#1A1A1A]">
              Manual Payment
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Online Paystack checkout is currently disabled for this flow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 rounded-md hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          </div>

          <div className="mb-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-sm text-[#64748B]">Amount to transfer</p>
          <p className="mt-1 font-sans text-3xl font-bold text-[#0D7A4A]">
            {formatCurrency(amountNgn, "NGN")}
          </p>
          <p className="text-sm text-[#64748B]">{formatCurrency(amountUsd, "USD", { preciseUsd: true })}</p>
          <p className="mt-2 text-xs text-[#64748B]">
            Use order ref <span className="font-semibold text-[#1A1A1A]">{orderRef}</span> as your transfer narration.
          </p>
          </div>

          <div className="space-y-4 rounded-xl border border-[#E5E7EB] p-4 text-sm text-[#374151]">
          <div>
            <p className="font-semibold text-[#1A1A1A]">Bank details</p>
            <label htmlFor="bank-account-select" className="mt-3 mb-1 block text-xs font-medium text-[#64748B]">
              Select bank account
            </label>
            <select
              id="bank-account-select"
              value={selectedBankId}
              onChange={(event) => setSelectedBankId(event.target.value)}
              disabled={isBankAccountsLoading || bankAccounts.length === 0}
              className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-base text-[#1A1A1A] outline-none focus:border-[#0D7A4A] focus:ring-2 focus:ring-[#0D7A4A]/20 sm:py-2 sm:text-sm"
            >
              {bankAccounts.length === 0 && (
                <option value="">No bank accounts available</option>
              )}
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label || account.bankName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-lg bg-[#F8FAFC] p-3">
            <p>Bank: {selectedBank?.bankName || "N/A"}</p>
            <p>Account Name: {selectedBank?.accountName || "N/A"}</p>
            <div className="flex gap-3 justify-between items-center">
              <p>Account Number: {selectedBank?.accountNumber || "N/A"}</p>
              <button
                type="button"
                onClick={handleCopyAccountNumber}
                disabled={!selectedBank?.accountNumber}
                className="inline-flex items-center justify-center rounded-md border border-[#D1D5DB] bg-white p-1.5 text-[#546881] transition hover:bg-[#F9FAFB]"
                aria-label={accountCopied ? "Account number copied" : "Copy account number"}
                title={accountCopied ? "Account number copied" : "Copy account number"}
              >
                {accountCopied ? <Check className="h-4 w-4 text-[#0D7A4A]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseBankAccount}
            disabled={!selectedBank || updateStatusMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateStatusMutation.isPending ? (
              <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
            ) : bankSelected ? (
              <Check className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {updateStatusMutation.isPending
              ? "Updating status..."
              : bankSelected
              ? "Bank account selected"
              : "Use bank account"}
          </button>
          </div>

          <div className="p-3 mt-5 text-xs text-amber-800 bg-amber-50 rounded-lg">
          After transfer, our team will manually review and approve your payment. Status will update on this order page.
          </div>

          <div className="flex flex-wrap gap-3 justify-end items-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
          >
            Close
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0D7A4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b6840]"
          >
            <Shield className="w-4 h-4" />
            Contact support
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}