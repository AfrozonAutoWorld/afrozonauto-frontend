'use client';

import { useState, useEffect } from 'react';
import {
  Ship,
  Container,
  Clock,
  Check,
  ChevronDown,
} from 'lucide-react';
import type { VehicleType } from '../../types';
import {
  formatCurrency,
  NIGERIAN_STATES,
} from '../../lib/pricingCalculator';
import type { CostBreakdown } from '../../lib/api/orders';
import { cn } from '@/lib/utils';

export interface PriceCalculatorProps {
  vehiclePrice: number;
  vehicleType: VehicleType;
  costBreakdown?: CostBreakdown | null;
  isLoading?: boolean;
  /** True while refetching (e.g. after shipping method change). */
  isFetching?: boolean;
  onShippingMethodChange?: (
    method: 'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS',
  ) => void;
  /** When omitted, the request CTA is not shown (e.g. calculator-only views). */
  onRequestVehicle?: () => void;
  requestLoading?: boolean;
  requestDisabled?: boolean;
}

const usd = { preciseUsd: true as const };

function num(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function PriceCalculator({
  costBreakdown,
  isLoading,
  isFetching = false,
  onShippingMethodChange,
  onRequestVehicle,
  requestLoading,
  requestDisabled,
}: PriceCalculatorProps) {
  const [shippingMethod, setShippingMethod] = useState<
    'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS'
  >('RORO');
  const [destinationState, setDestinationState] = useState('Port Harcourt');

  useEffect(() => {
    const apiMethod = costBreakdown?.paymentBreakdown?.shippingMethod;
    if (apiMethod) {
      const normalized = String(apiMethod).toUpperCase() as
        | 'RORO'
        | 'CONTAINER'
        | 'AIR_FREIGHT'
        | 'EXPRESS';
      const valid: Array<'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS'> = [
        'RORO',
        'CONTAINER',
        'AIR_FREIGHT',
        'EXPRESS',
      ];
      if (valid.includes(normalized)) {
        setShippingMethod(normalized);
      }
    }
  }, [costBreakdown?.paymentBreakdown?.shippingMethod]);

  const paymentData = costBreakdown?.paymentBreakdown;
  const methodForEstimate = (
    paymentData?.shippingMethod != null
      ? String(paymentData.shippingMethod).toUpperCase()
      : shippingMethod
  ) as typeof shippingMethod;
  const estimatedDeliveryDays =
    methodForEstimate === 'RORO'
      ? 45
      : methodForEstimate === 'CONTAINER'
        ? 60
        : methodForEstimate === 'AIR_FREIGHT'
          ? 15
          : 7;

  const handleShippingMethodChange = (
    method: 'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS',
  ) => {
    setShippingMethod(method);
    onShippingMethodChange?.(method);
  };

  const b = paymentData?.breakdown;
  const costItems = b
    ? [
        {
          label: 'Vehicle Price',
          value: num(b.vehiclePriceUsd),
        },
        {
          label: 'Pre-Purchase Inspection',
          value: num(b.prePurchaseInspectionUsd),
        },
        {
          label: 'US Handling Fee',
          value: num(b.usHandlingFeeUsd),
        },
        {
          label: 'Afrozon Sourcing Fee',
          value: num(b.sourcingFee),
        },
        {
          label: 'Shipping Cost',
          value: num(b.shippingCostUsd),
        },
      ]
    : [];

  const computedTotalUsd = costItems.reduce((sum, item) => sum + item.value, 0);

  const exchangeRate = 1550;
  const apiTotalUsd = paymentData != null ? num(paymentData.totalUsd) : 0;
  const apiMatchesLines =
    apiTotalUsd > 0 && Math.abs(apiTotalUsd - computedTotalUsd) < 0.02;
  const displayTotalUsd =
    apiTotalUsd > 0 ? (apiMatchesLines ? apiTotalUsd : computedTotalUsd) : computedTotalUsd;
  const totalNgn = Math.round(displayTotalUsd * exchangeRate);

  const pricingBusy =
    isLoading || (isFetching && !paymentData);

  const deliveryLabel = `${estimatedDeliveryDays} days after payment`;

  return (
    <div className="flex w-full flex-col gap-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6 md:gap-9">
      <h2 className="font-sans text-xl font-bold leading-8 text-[#546881] sm:text-2xl sm:leading-[30px]">
        Landing Cost Calculator
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-sm font-medium leading-5 text-[#414651]">
            Shipping Method
          </span>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => handleShippingMethodChange('RORO')}
              className={cn(
                'relative isolate flex flex-1 flex-col gap-4 rounded-2xl border p-5 text-left transition-colors',
                shippingMethod === 'RORO'
                  ? 'border-[#0D7A4A] bg-[#E6F6F4]'
                  : 'border-[#969696] bg-white',
              )}
            >
              {shippingMethod === 'RORO' && (
                <span className="absolute right-4 top-4 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#008000]">
                  <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                </span>
              )}
              <div className="flex flex-col gap-1.5 pr-6">
                <Ship
                  className={cn(
                    'h-4 w-4',
                    shippingMethod === 'RORO' ? 'text-[#0D7A4A]' : 'text-neutral-900',
                  )}
                  strokeWidth={1.5}
                />
                <p
                  className={cn(
                    'font-body text-sm font-semibold leading-5',
                    shippingMethod === 'RORO'
                      ? 'text-[#0D7A4A]'
                      : 'text-[#1A1A1A]',
                  )}
                >
                  RoRo
                </p>
                <p className="font-jakarta text-xs font-normal leading-4 text-[#969696]">
                  Roll-on/Roll-off. Most popular, lower cost.
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-xs leading-4',
                  shippingMethod === 'RORO'
                    ? 'bg-[#E6F6F4] text-[#0D7A4A]'
                    : 'bg-[#E8E8E8] text-[#1A1A1A]',
                )}
              >
                <Clock className="h-3 w-3" strokeWidth={1} />
                ~45 days
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleShippingMethodChange('CONTAINER')}
              className={cn(
                'relative isolate flex flex-1 flex-col gap-4 rounded-2xl border p-5 text-left transition-colors',
                shippingMethod === 'CONTAINER'
                  ? 'border-[#0D7A4A] bg-[#E6F6F4]'
                  : 'border-[#969696] bg-white',
              )}
            >
              {shippingMethod === 'CONTAINER' && (
                <span className="absolute right-4 top-4 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#008000]">
                  <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                </span>
              )}
              <div className="flex flex-col gap-1.5 pr-6">
                <Container
                  className={cn(
                    'h-4 w-4',
                    shippingMethod === 'CONTAINER'
                      ? 'text-[#0D7A4A]'
                      : 'text-neutral-900',
                  )}
                  strokeWidth={1.5}
                />
                <p
                  className={cn(
                    'font-body text-sm font-semibold leading-5',
                    shippingMethod === 'CONTAINER'
                      ? 'text-[#0D7A4A]'
                      : 'text-[#1A1A1A]',
                  )}
                >
                  Container
                </p>
                <p className="font-jakarta text-xs font-normal leading-4 text-[#969696]">
                  Full container. More protection, higher cost.
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-xs leading-4',
                  shippingMethod === 'CONTAINER'
                    ? 'bg-[#E6F6F4] text-[#0D7A4A]'
                    : 'bg-[#E8E8E8] text-[#1A1A1A]',
                )}
              >
                <Clock className="h-3 w-3" strokeWidth={1} />
                ~60 days
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="delivery-location"
            className="font-body text-sm font-medium leading-5 text-[#414651]"
          >
            Delivery Location
          </label>
          <div className="relative">
            <select
              id="delivery-location"
              value={destinationState}
              onChange={(e) => setDestinationState(e.target.value)}
              className="font-body h-11 w-full appearance-none rounded-lg border border-[#D5D7DA] bg-white py-2.5 pl-3.5 pr-10 text-base leading-6 text-neutral-800 shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:border-[#0D7A4A] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20"
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state === 'Port Harcourt'
                    ? 'Port Harcourt, Rivers State'
                    : state}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#717680]"
              aria-hidden
            />
          </div>
        </div>
      </div>

      {pricingBusy ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-50 py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D7A4A] border-t-transparent" />
          <p className="font-body text-sm text-gray-600">Calculating costs…</p>
        </div>
      ) : paymentData ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="font-body text-base font-normal leading-6 text-black">
                Estimated Delivery
              </span>
              <span className="font-body text-right text-base font-normal leading-6 text-[#546881]">
                {deliveryLabel}
              </span>
            </div>
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="font-body text-base font-normal leading-6 text-black">
                Total landed cost
              </span>
              <span className="text-right font-body text-lg font-bold leading-7 text-[#0D7A4A]">
                {formatCurrency(totalNgn, 'NGN')} (
                {formatCurrency(displayTotalUsd, 'USD', usd)})
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-lg font-semibold leading-7 text-[#111827]">
              Price Breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {costItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row items-center justify-between gap-8"
                >
                  <span className="font-body text-base font-normal leading-6 text-[#374151]">
                    {item.label}
                  </span>
                  <span className="text-right font-body text-base font-semibold leading-6 text-[#374151]">
                    {formatCurrency(item.value, 'USD', usd)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="flex flex-row items-center justify-between gap-8">
                <span className="font-body text-base font-normal leading-6 text-[#374151]">
                  Total
                </span>
                <span className="text-right font-body text-lg font-bold leading-7 text-[#0D7A4A]">
                  {formatCurrency(displayTotalUsd, 'USD', usd)}
                </span>
              </div>
            </div>
            <p className="font-body text-sm italic leading-5 text-[#003B33]">
              * Exchange rate: $1 = {exchangeRate.toLocaleString()} NGN; prices are
              estimates and may vary based on market conditions.
            </p>
          </div>

          {onRequestVehicle != null && (
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={onRequestVehicle}
                disabled={requestDisabled || requestLoading}
                className="font-body flex w-full items-center justify-center rounded-lg bg-[#0D7A4A] px-8 py-[18px] text-lg font-medium leading-7 text-white transition-colors hover:bg-[#0a633e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestLoading ? 'Submitting…' : 'Request this vehicle'}
              </button>
              <p className="text-center font-body text-sm font-normal leading-5 text-[#1D242D]">
                30% deposit required to secure this vehicle
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-center font-body text-sm text-amber-800">
            Unable to load pricing information. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}
