'use client';

import Link from 'next/link';
import { Plus, ChevronDown } from 'lucide-react';

export type DateRangeFilter = 'this_month' | 'last_3_months' | 'all_time';

type SellerDashboardTopBarProps = {
  firstName?: string;
  dateRange: DateRangeFilter;
  onDateRangeChange: (value: DateRangeFilter) => void;
  /** When false, "New Listing" is shown disabled (e.g. seller not yet verified). */
  canCreateListing: boolean;
};

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'all_time', label: 'All Time' },
];

export function SellerDashboardTopBar({
  firstName,
  dateRange,
  onDateRangeChange,
  canCreateListing,
}: SellerDashboardTopBarProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-sans text-3xl font-bold leading-tight text-[#111827]">
          Welcome back{firstName ? `, ${firstName}` : ''}!
        </h1>
        <p className="mt-1 font-body text-xl text-[#111827]">See all your listings here.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-44">
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
            className="h-10 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 pr-10 font-jakarta text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Filter period"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#374151]"
            aria-hidden
          />
        </div>

        {canCreateListing ? (
          <Link
            href="/seller/sell-your-car"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] px-4 font-body text-sm font-medium text-white transition-colors hover:bg-[#0b6b41]"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
        ) : (
          <span
            className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#9CA3AF] px-4 font-body text-sm font-medium text-white opacity-90"
            title="New listings are available once your seller account is verified."
            aria-disabled="true"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </span>
        )}
      </div>
    </div>
  );
}
