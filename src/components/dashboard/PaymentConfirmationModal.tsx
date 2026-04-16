'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import {
  X,
  ChevronDown,
  CalendarDays,
  Info,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/pricingCalculator';
import type { Order } from '@/lib/api/orders';
import { getOrderVehicleName } from './orderHelpers';
import { sumPaymentsTowardPaid } from '@/lib/orderPaymentUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

type PaymentModalOrder = Pick<
  Order,
  | 'id'
  | 'createdAt'
  | 'paymentBreakdown'
  | 'totalLandedCostLocal'
  | 'totalLandedCostUsd'
  | 'quotedPriceUsd'
  | 'vehicleSnapshot'
  | 'requestNumber'
  | 'payments'
  | 'exchangeRate'
>;

type PaymentConfirmationModalProps = {
  isOpen: boolean;
  order: PaymentModalOrder | null;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmitConfirmation?: (payload: {
    bankTransferredFrom: string;
    transactionReference: string;
    amountTransferred: string;
    transferDate: string;
    proofFile: File;
  }) => Promise<void>;
};

type ModalStep = 'form' | 'success';

function toNgnFromUsd(usd: number, rate: number) {
  return Math.round((usd || 0) * rate);
}

/** Parse digits from formatted NGN input (same idea as OrderStatusView). */
function parseNgnInput(raw: string): number {
  const n = Number(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function PaymentConfirmationModal({
  isOpen,
  order,
  onClose,
  isSubmitting = false,
  onSubmitConfirmation,
}: Readonly<PaymentConfirmationModalProps>) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>('form');
  const [bankTransferredFrom, setBankTransferredFrom] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [amountTransferred, setAmountTransferred] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const pricing = useMemo(() => {
    if (!order) return null;
    const exchangeRate =
      typeof order.exchangeRate === 'number' && order.exchangeRate > 0 ? order.exchangeRate : 1550;
    const totalUsd =
      order.paymentBreakdown?.totalUsd ??
      order.totalLandedCostUsd ??
      order.quotedPriceUsd ??
      0;
    const totalNgn =
      order.totalLandedCostLocal ?? toNgnFromUsd(totalUsd, exchangeRate);
    const paidUsd = sumPaymentsTowardPaid(order.payments);
    const paidNgn = toNgnFromUsd(paidUsd, exchangeRate);
    const remainingNgn = Math.max(totalNgn - paidNgn, 0);
    return {
      exchangeRate,
      totalUsd,
      totalNgn,
      paidUsd,
      paidNgn,
      remainingNgn,
    };
  }, [order]);

  const defaultAmountLabel = useMemo(() => {
    if (!pricing) return '';
    return formatCurrency(pricing.remainingNgn, 'NGN');
  }, [pricing?.remainingNgn]);

  /**
   * Reset when the modal opens (`isOpen` → true) only. Do not depend on
   * `defaultAmountLabel` or `order` — refetches would re-run this and wipe the form.
   * `defaultAmountLabel` is read from the same render where `isOpen` became true.
   */
  useEffect(() => {
    if (!isOpen) return;
    setStep('form');
    setBankTransferredFrom('');
    setTransactionReference('');
    setAmountTransferred(defaultAmountLabel);
    setTransferDate('');
    setProofFile(null);
    setDatePickerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: reset only on open, not when pricing/order updates
  }, [isOpen]);

  /** If the order updates to ₦0 remaining while the modal is open, clear any stale amount. */
  useEffect(() => {
    if (!isOpen || !pricing) return;
    if (pricing.remainingNgn === 0) {
      setAmountTransferred(formatCurrency(0, 'NGN'));
    }
  }, [isOpen, pricing?.remainingNgn]);

  if (!isOpen || !order || !pricing) return null;

  const amountEnteredNgn = parseNgnInput(amountTransferred);
  const hasPayableBalance = pricing.remainingNgn > 0;
  /** Partial payments OK only when there is a positive remaining balance. */
  const amountExceedsRemaining =
    hasPayableBalance && amountEnteredNgn > pricing.remainingNgn;
  /** User entered money when the order already shows ₦0 remaining — block submit. */
  const amountEnteredWhenNoBalanceOwed =
    !hasPayableBalance && amountEnteredNgn > 0;
  const amountIsValid =
    hasPayableBalance &&
    amountEnteredNgn > 0 &&
    amountEnteredNgn <= pricing.remainingNgn;
  const estimatedBalanceAfter =
    hasPayableBalance && !amountExceedsRemaining
      ? Math.max(pricing.remainingNgn - amountEnteredNgn, 0)
      : pricing.remainingNgn;

  const isFormValid =
    bankTransferredFrom.trim() &&
    transactionReference.trim() &&
    amountTransferred.trim() &&
    amountIsValid &&
    transferDate &&
    proofFile;

  const handleSubmit = async () => {
    if (!isFormValid || !proofFile) return;
    if (onSubmitConfirmation) {
      await onSubmitConfirmation({
        bankTransferredFrom,
        transactionReference,
        amountTransferred,
        transferDate,
        proofFile,
      });
    }
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="relative w-full max-w-[614px] rounded-3xl border border-[#E8E8E8] bg-white p-4 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F9FAFB] text-[#546881]"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {step === 'form' ? (
          <div className="max-h-[84vh] space-y-6 overflow-y-auto pr-1">
            <div className="space-y-2 pt-1">
              <h3 className="font-sans text-[24px] font-bold leading-[1.3] text-[#1A1A1A]">
                Confirm Your Payment
              </h3>
              <p className="text-sm text-[#969696]">
                Enter the details from your payment at the bank so we can verify your payment and secure your vehicle.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xl font-semibold text-[#1A1A1A]">{getOrderVehicleName(order)}</p>
                <p className="text-base text-[#374151]">Manual transfer</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Amount due now</p>
                <p className="font-sans text-3xl font-semibold text-[#0D7A4A]">
                  {formatCurrency(pricing.remainingNgn, 'NGN')}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8E8E8] bg-[#F9FAFB] px-4 py-3 text-sm">
              <div className="flex justify-between gap-4 text-[#374151]">
                <span>Order total</span>
                <span className="font-medium">{formatCurrency(pricing.totalNgn, 'NGN')}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 text-[#374151]">
                <span>Already paid (recorded)</span>
                <span className="font-medium text-[#0D7A4A]">{formatCurrency(pricing.paidNgn, 'NGN')}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 border-t border-[#E5E7EB] pt-2 font-semibold text-[#1A1A1A]">
                <span>Remaining balance</span>
                <span>{formatCurrency(pricing.remainingNgn, 'NGN')}</span>
              </div>
              <p className="mt-2 text-xs text-[#6B7280]">
                {hasPayableBalance ? (
                  <>
                    You can pay any amount <span className="font-medium text-[#374151]">up to</span> this remaining
                    balance (partial payments are fine). You cannot enter more than the remaining balance.
                  </>
                ) : (
                  <span className="font-medium text-[#92400E]">
                    There is no remaining balance on this order. Do not submit another payment here.
                  </span>
                )}
              </p>
            </div>

            {!hasPayableBalance && (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                role="status"
              >
                <p className="font-medium">Nothing left to pay</p>
                <p className="mt-1 text-amber-800">
                  This order is fully paid. Close this dialog or contact support if you think this is wrong.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                  <label htmlFor="bank-transferred-from" className="mb-1.5 block text-sm font-medium text-[#414651]">Bank you transferred from</label>
                <div className="relative">
                  <select
                      id="bank-transferred-from"
                    value={bankTransferredFrom}
                    onChange={(event) => setBankTransferredFrom(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#D5D7DA] bg-white px-3 pr-10 text-base text-[#181D27] outline-none focus:border-[#0D7A4A]"
                  >
                    <option value="">Select bank</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="UBA">UBA</option>
                    <option value="Access Bank">Access Bank</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#717680]" />
                </div>
              </div>

              <div>
                <label htmlFor="transaction-reference" className="mb-1.5 block text-sm font-medium text-[#414651]">Transaction Reference/Session ID</label>
                <input
                  id="transaction-reference"
                  value={transactionReference}
                  onChange={(event) => setTransactionReference(event.target.value)}
                  placeholder="Enter reference"
                  className="h-11 w-full rounded-lg border border-[#D5D7DA] px-3 text-base text-[#181D27] outline-none focus:border-[#0D7A4A]"
                />
                <p className="mt-1 text-xs text-[#969696]">
                  This is the reference number from your bank alert, SMS, or receipt
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="amount-transferred" className="mb-1.5 block text-sm font-medium text-[#414651]">
                    Amount Transferred (NGN)
                  </label>
                  <input
                    id="amount-transferred"
                    value={amountTransferred}
                    onChange={(event) => setAmountTransferred(event.target.value)}
                    placeholder={defaultAmountLabel}
                    aria-invalid={amountExceedsRemaining || amountEnteredWhenNoBalanceOwed}
                    disabled={!hasPayableBalance}
                    className={`h-11 w-full rounded-lg border px-3 text-base outline-none focus:border-[#0D7A4A] ${
                      !hasPayableBalance
                        ? 'cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]'
                        : amountExceedsRemaining || amountEnteredWhenNoBalanceOwed
                          ? 'border-[#DC2626] bg-[#FEF2F2] text-[#181D27]'
                          : 'border-[#D5D7DA] text-[#181D27]'
                    }`}
                  />
                  {amountEnteredWhenNoBalanceOwed && (
                    <p className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                      Remaining balance is {formatCurrency(0, 'NGN')}. You cannot submit a payment for this order.
                    </p>
                  )}
                  {amountExceedsRemaining && hasPayableBalance && (
                    <p className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                      Enter at most {formatCurrency(pricing.remainingNgn, 'NGN')} (remaining balance). Partial
                      amounts below that are allowed.
                    </p>
                  )}
                  {amountEnteredNgn > 0 &&
                    hasPayableBalance &&
                    !amountExceedsRemaining &&
                    !amountEnteredWhenNoBalanceOwed && (
                    <p className="mt-1.5 text-xs text-[#6B7280]">
                      After this payment is verified, estimated remaining balance:{' '}
                      <span className="font-medium text-[#374151]">
                        {formatCurrency(estimatedBalanceAfter, 'NGN')}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-[#414651]">Date of Transfer</span>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        id="transfer-date"
                        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#D5D7DA] bg-white px-3 text-left text-base text-[#181D27] outline-none focus:border-[#0D7A4A]"
                      >
                        <span className={transferDate ? 'text-[#181D27]' : 'text-[#969696]'}>
                          {transferDate
                            ? format(parse(transferDate, 'yyyy-MM-dd', new Date()), 'd MMM yyyy')
                            : 'Select date'}
                        </span>
                        <CalendarDays className="h-5 w-5 shrink-0 text-[#6B7280]" aria-hidden />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto max-w-[min(100vw-1.5rem,22rem)] p-0 sm:max-w-none"
                      align="start"
                      sideOffset={6}
                      collisionPadding={12}
                    >
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={new Date(2020, 0)}
                        endMonth={new Date()}
                        selected={
                          transferDate
                            ? parse(transferDate, 'yyyy-MM-dd', new Date())
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            setTransferDate(format(date, 'yyyy-MM-dd'));
                            setDatePickerOpen(false);
                          }
                        }}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="mt-1 text-xs text-[#969696]">Use the calendar — month and year are in the dropdowns.</p>
                </div>
              </div>

              <div>
                <label htmlFor="proof-of-payment" className="mb-1.5 block text-sm font-medium text-[#414651]">Upload Proof of Payment</label>
                <label className="flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#546881] bg-[#F9FAFB] px-4 text-center">
                  <span className="text-xs text-[#1A1A1A]">
                    {proofFile ? proofFile.name : 'Click to upload receipt or debit alert screenshot'}
                  </span>
                  <span className="mt-1 text-xs text-[#969696]">JPG • PNG • PDF • Max 5MB</span>
                  <input
                    id="proof-of-payment"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-[#666666]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Make sure the amount matches exactly. Discrepancies will delay verification by our team.</p>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-[53px] w-full rounded-lg border border-[#969696] text-base font-medium text-[#666666] sm:w-[188px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting || !hasPayableBalance}
                className="h-[53px] w-full rounded-lg bg-[#0D7A4A] px-6 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Confirmation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex min-h-[460px] max-w-[422px] flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#E6F6F4]">
              <CheckCircle className="h-20 w-20 text-[#0D7A4A]" strokeWidth={1.8} />
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-3xl font-bold text-[#1A1A1A]">Transfer Submitted!</h3>
              <p className="text-base text-[#969696]">
                We have received your payment confirmation. Our team will verify your transfer within 2-4 business hours and update your order status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/marketplace/buyer');
              }}
              className="h-16 rounded-lg bg-[#1D242D] px-8 text-lg font-medium text-white"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
