'use client';

import Link from 'next/link';
import { Car, Package, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/pricingCalculator';
import type { Order } from '@/lib/api/orders';

type DepositPendingOrderViewProps = {
  order: Order;
  onConfirmPayment: () => void;
};

function toNgn(usd: number, rate = 1550) {
  return Math.round((usd || 0) * rate);
}

function getVehicleName(order: Order) {
  const snapshot = order.vehicleSnapshot;
  if (snapshot?.year && snapshot?.make && snapshot?.model) {
    return `${snapshot.year} ${snapshot.make} ${snapshot.model}`;
  }
  return order.requestNumber || `Order #${order.id}`;
}

function getVehicleImage(order: Order) {
  return (
    order.vehicleSnapshot?.apiData?.listing?.retailListing?.primaryImage ||
    order.vehicleSnapshot?.apiData?.listing?.wholesaleListing?.primaryImage ||
    order.vehicleSnapshot?.images?.[0] ||
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200'
  );
}

export function DepositPendingOrderView({
  order,
  onConfirmPayment,
}: Readonly<DepositPendingOrderViewProps>) {
  const vehicleName = getVehicleName(order);
  const vehicleImage = getVehicleImage(order);
  const exchangeRate = 1550;

  const totalUsd =
    order.paymentBreakdown?.totalUsd ??
    order.totalLandedCostUsd ??
    order.quotedPriceUsd ??
    0;
  const totalNgn =
    order.totalLandedCostLocal ??
    toNgn(totalUsd, exchangeRate);

  const paidUsd =
    order.payments?.reduce((sum, payment) => {
      return payment.status?.toUpperCase() === 'COMPLETED'
        ? sum + (payment.amountUsd ?? payment.amount_usd ?? 0)
        : sum;
    }, 0) ?? 0;
  const paidNgn = toNgn(paidUsd, exchangeRate);
  const balanceNgn = Math.max(totalNgn - paidNgn, 0);
  const progressPercent =
    totalNgn > 0 ? Math.min(100, Math.round((paidNgn / totalNgn) * 100)) : 0;

  const breakdown = order.paymentBreakdown?.breakdown;
  const dealerParts = [
    order.vehicleSnapshot?.dealerName || 'N/A',
    order.vehicleSnapshot?.dealerCity || '',
    order.vehicleSnapshot?.dealerState || '',
  ].filter(Boolean);
  const dealerDisplay = dealerParts.join(', ');

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 flex items-center gap-2 text-[#111827]">
            <Car className="w-5 h-5" />
            <h2 className="text-xl font-medium">Vehicle Information</h2>
          </div>

          <img
            src={vehicleImage}
            alt={vehicleName}
            className="h-[260px] w-full rounded-2xl object-cover"
          />

          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
            <InfoBlock label="Name" value={vehicleName} />
            <InfoBlock label="VIN" value={order.vehicleSnapshot?.vin || 'N/A'} />
            <InfoBlock label="Fuel Type" value={order.vehicleSnapshot?.fuelType || 'N/A'} />
            <InfoBlock
              label="Mileage"
              value={`${order.vehicleSnapshot?.mileage?.toLocaleString?.() ?? order.vehicleSnapshot?.mileage ?? 0} mi`}
            />
            <InfoBlock
              label="Dealer"
              value={dealerDisplay}
              className="sm:col-span-2"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 flex items-center gap-2 text-[#111827]">
            <Package className="w-5 h-5" />
            <h2 className="text-xl font-medium">Shipping and Delivery</h2>
          </div>
          <div className="space-y-6">
            <InfoBlock label="Shipping Method" value={order.shippingMethod || 'N/A'} />
            <InfoBlock
              label="Delivery Address"
              value={[
                order.destinationCity,
                order.destinationState,
                order.destinationCountry,
              ]
                .filter(Boolean)
                .join(', ') || 'Pending'}
            />
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#484848]">Landed Cost Summary</h2>

          <div className="space-y-3">
            <Row label="Estimated Delivery" value="45 days after payment" />
            <Row
              label="Total landed cost"
              value={`${formatCurrency(totalNgn, 'NGN')} (${formatCurrency(totalUsd)})`}
              valueClassName="font-bold text-[#0D7A4A]"
            />
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-xl font-semibold text-[#111827]">Price Breakdown</h3>
            <div className="space-y-3 text-[#374151]">
              <Row label="Vehicle Price" value={formatCurrency(breakdown?.vehiclePriceUsd || 0)} />
              <Row label="Afrozon Sourcing Fee" value={formatCurrency(breakdown?.sourcingFee || 0)} />
              <Row label="Pre-Purchase Inspection" value={formatCurrency(breakdown?.prePurchaseInspectionUsd || 0)} />
              <Row label="US Handling Fee" value={formatCurrency(breakdown?.usHandlingFeeUsd || 0)} />
              <Row label="Shipping Cost" value={formatCurrency(breakdown?.shippingCostUsd || 0)} />
              <div className="border-t border-[#E5E7EB] pt-3">
                <Row label="Total" value={formatCurrency(totalUsd)} valueClassName="font-bold text-[#0D7A4A]" />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <Row label="Paid" value={formatCurrency(paidNgn, 'NGN')} valueClassName="text-[#0D7A4A] font-semibold" />
            <div className="h-2.5 w-full rounded-full bg-[#D9D9D9]">
              <div
                className="h-2.5 rounded-full bg-[#0D7A4A]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <Row label="Balance" value={formatCurrency(balanceNgn, 'NGN')} valueClassName="text-[#D94B4B] font-semibold" />
          </div>

          <div className="mt-6 space-y-3">
            <MetaRow label="Payment Option" value="Manual confirmation" />
            <MetaRow label="Order Request Date" value={formatDate(order.createdAt)} />
          </div>

          <button
            type="button"
            onClick={onConfirmPayment}
            className="mt-6 h-14 w-full rounded-lg bg-[#0D7A4A] px-6 text-lg font-medium text-white"
          >
            Confirm Payment
          </button>
        </article>

        <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-5 text-2xl font-bold text-[#484848]">Documents</h2>
          <div className="space-y-4">
            <DocButton label="Invoice" />
            <DocButton label="Inspection Report" />
          </div>
        </article>

        <p className="text-right text-base text-[#484848]">
          Have a question?{' '}
          <Link href="/contact" className="font-semibold text-[#0D7A4A]">
            Contact Us
          </Link>
        </p>
      </section>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  className = '',
}: Readonly<{
  label: string;
  value: string;
  className?: string;
}>) {
  return (
    <div className={className}>
      <p className="text-base text-[#6B7280]">{label}</p>
      <p className="mt-1 text-base font-medium text-[#111827]">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName = 'text-[#374151] font-semibold',
}: Readonly<{
  label: string;
  value: string;
  valueClassName?: string;
}>) {
  return (
    <div className="flex gap-4 justify-between items-center">
      <span className="text-base">{label}</span>
      <span className={`text-right ${valueClassName}`}>{value}</span>
    </div>
  );
}

function MetaRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2.5">
      <span className="text-base text-[#6B7280]">{label}</span>
      <span className="text-sm text-[#111827]">{value}</span>
    </div>
  );
}

function DocButton({ label }: Readonly<{ label: string }>) {
  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-between rounded-lg border border-[#B8B8B8] px-5 text-left"
    >
      <span className="text-base text-[#666666]">{label}</span>
      <Download className="h-5 w-5 text-[#666666]" />
    </button>
  );
}
