import type { VehicleStatus } from '@/lib/marketplace/types';

export type SellerListingStatusPresentation = {
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  heading: string;
  subtext: string;
};

/**
 * Banner + badge styling aligned with admin workflow: pending (amber), approved (green), rejected (red).
 */
export function getSellerListingStatusPresentation(
  uiStatus: VehicleStatus,
  options?: { adminNotes?: string | null },
): SellerListingStatusPresentation {
  const notes = options?.adminNotes?.trim();

  switch (uiStatus) {
    case 'APPROVED':
      return {
        borderClass: 'border-l-[4px] border-emerald-500',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeLabel: 'Approved',
        heading: 'Current Status: Approved',
        subtext: 'Your listing is live and visible to buyers.',
      };
    case 'REJECTED':
      return {
        borderClass: 'border-l-[4px] border-red-500',
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-700',
        badgeLabel: 'Rejected',
        heading: 'Current Status: Rejected',
        subtext: notes
          ? `Reason: ${notes}`
          : 'Review the feedback, update your listing, and resubmit for another review.',
      };
    case 'SOLD':
      return {
        borderClass: 'border-l-[4px] border-blue-500',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-800',
        badgeLabel: 'Sold',
        heading: 'Current Status: Sold',
        subtext: 'This vehicle has been marked as sold.',
      };
    case 'DRAFT':
      return {
        borderClass: 'border-l-[4px] border-gray-400',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        badgeLabel: 'Draft',
        heading: 'Current Status: Draft',
        subtext: 'Finish your listing and submit it when you are ready.',
      };
    case 'ARCHIVED':
      return {
        borderClass: 'border-l-[4px] border-gray-400',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-600',
        badgeLabel: 'Archived',
        heading: 'Current Status: Archived',
        subtext: 'This listing is no longer active.',
      };
    case 'PENDING_REVIEW':
    default:
      return {
        borderClass: 'border-l-[4px] border-amber-500',
        badgeBg: 'bg-[#FCF4ED]',
        badgeText: 'text-[#E3863B]',
        badgeLabel: 'Pending',
        heading: 'Current Status: Pending Review',
        subtext: 'Our team is reviewing your listing. This usually takes 24–48 hours.',
      };
  }
}
