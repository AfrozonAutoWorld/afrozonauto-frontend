'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronDown,
  Calendar,
  Info,
  CircleCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/pricingCalculator';
import { Order } from '@/lib/api/orders';
import { getOrderVehicleName } from './orderHelpers';

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

  const computedAmount = useMemo(() => {
    if (!order) return '';
    const totalNgn =
      order.totalLandedCostLocal ??
      Math.round(
        (((order.paymentBreakdown as any)?.totalUsd) ||
          (order.totalLandedCostUsd as number) ||
          (order.quotedPriceUsd as number) ||
          0) * 1550,
      );
    return formatCurrency(totalNgn, 'NGN');
  }, [order]);

  useEffect(() => {
    if (!isOpen) return;
    setStep('form');
    setBankTransferredFrom('');
    setTransactionReference('');
    setAmountTransferred(computedAmount);
    setTransferDate('');
    setProofFile(null);
  }, [isOpen, computedAmount]);

  if (!isOpen || !order) return null;

  const isFormValid =
    bankTransferredFrom.trim() &&
    transactionReference.trim() &&
    amountTransferred.trim() &&
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

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-[#1A1A1A]">{getOrderVehicleName(order)}</p>
                <p className="text-base text-[#374151]">Manual transfer</p>
              </div>
              <p className="font-sans text-3xl font-semibold text-[#0D7A4A]">{amountTransferred || computedAmount}</p>
            </div>

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
                  <label htmlFor="amount-transferred" className="mb-1.5 block text-sm font-medium text-[#414651]">Amount Transferred (NGN)</label>
                  <input
                    id="amount-transferred"
                    value={amountTransferred}
                    onChange={(event) => setAmountTransferred(event.target.value)}
                    className="h-11 w-full rounded-lg border border-[#D5D7DA] px-3 text-base text-[#181D27] outline-none focus:border-[#0D7A4A]"
                  />
                </div>
                <div>
                  <label htmlFor="transfer-date" className="mb-1.5 block text-sm font-medium text-[#414651]">Date of Transfer</label>
                  <div className="relative">
                    <input
                      id="transfer-date"
                      type="date"
                      value={transferDate}
                      onChange={(event) => setTransferDate(event.target.value)}
                      className="h-11 w-full rounded-lg border border-[#D5D7DA] px-3 pr-10 text-base text-[#181D27] outline-none focus:border-[#0D7A4A]"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                  </div>
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
                disabled={!isFormValid || isSubmitting}
                className="h-[53px] w-full rounded-lg bg-[#0D7A4A] px-6 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Confirmation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex min-h-[460px] max-w-[422px] flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#E6F6F4]">
              <CircleCheck className="h-20 w-20 text-[#0D7A4A]" strokeWidth={1.8} />
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
