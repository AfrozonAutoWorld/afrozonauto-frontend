/**
 * Bank transfers often sit in PROCESSING until an admin confirms; they should still
 * count toward "paid" in buyer-facing progress UI (exclude failed/refunded only).
 */
export function paymentCountsTowardPaid(status: string | undefined): boolean {
  const s = (status ?? '').toUpperCase();
  if (!s) return false;
  return !['FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(s);
}

export function getPaymentAmountUsd(payment: {
  amountUsd?: number;
  amount_usd?: number;
}): number {
  const n = payment.amountUsd ?? payment.amount_usd ?? 0;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export function sumPaymentsTowardPaid(
  payments: Array<{ status?: string; amountUsd?: number; amount_usd?: number }> | undefined,
): number {
  if (!payments?.length) return 0;
  return payments.reduce((sum, payment) => {
    if (!paymentCountsTowardPaid(payment.status)) return sum;
    return sum + getPaymentAmountUsd(payment);
  }, 0);
}

export function orderHasProcessingPayment(
  payments: Array<{ status?: string }> | undefined,
): boolean {
  return payments?.some((p) => (p.status ?? '').toUpperCase() === 'PROCESSING') ?? false;
}
