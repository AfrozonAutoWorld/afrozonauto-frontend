'use client';

import { SlidersHorizontal } from 'lucide-react';

export interface FilterSidebarHeaderProps {
  activeCount: number;
  onClearAll: () => void;
}

export function FilterSidebarHeader({ activeCount, onClearAll }: FilterSidebarHeaderProps) {
  return (
    <div className="flex flex-row justify-between items-center flex-none w-full h-[52px] px-4 gap-10 bg-filter-surface">
      <div className="flex flex-row items-center gap-1.5">
        <SlidersHorizontal className="w-4 h-4 text-filter-label" aria-hidden />
        <span className="font-body text-sm font-semibold leading-5 text-filter-label">
          Filters
        </span>
        {activeCount > 0 && (
          <span
            className="flex items-center justify-center min-w-[12px] h-3 rounded-full bg-filter-primary-active text-filter-surface font-body text-[10px] leading-3 font-normal"
            aria-label={`${activeCount} filters applied`}
          >
            {activeCount}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClearAll}
        className="font-body text-xs font-normal leading-4 text-filter-primary hover:underline focus:outline-none focus:ring-2 focus:ring-filter-primary focus:ring-offset-2 rounded"
      >
        Clear all
      </button>
    </div>
  );
}
