export const DEFAULT_DEPOSIT_AMOUNT = 500;

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
  ARCHIVED: 'Archived',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW_REQUEST: 'New Request',
  DEPOSIT_PENDING: 'Deposit Pending',
  DEPOSIT_PAID: 'Deposit Paid',
  ADMIN_VERIFYING: 'Admin Verifying',
  VERIFIED_AVAILABLE: 'Verified Available',
  FINAL_PAYMENT_PENDING: 'Final Payment Pending',
  FINAL_PAID: 'Final Paid',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  SOLD: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  NEW_REQUEST: 'bg-blue-100 text-blue-700',
  DEPOSIT_PENDING: 'bg-amber-100 text-amber-700',
  DEPOSIT_PAID: 'bg-emerald-100 text-emerald-700',
  ADMIN_VERIFYING: 'bg-cyan-100 text-cyan-700',
  VERIFIED_AVAILABLE: 'bg-teal-100 text-teal-700',
  FINAL_PAYMENT_PENDING: 'bg-amber-100 text-amber-700',
  FINAL_PAID: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
};
