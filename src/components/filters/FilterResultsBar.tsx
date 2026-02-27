'use client';

import { Heart } from 'lucide-react';

export interface FilterResultsBarProps {
  resultCount: number;
  onSaveSearch?: () => void;
}

export function FilterResultsBar({ resultCount, onSaveSearch }: FilterResultsBarProps) {
  return (
    <div className="flex flex-col justify-center items-center flex-none w-full gap-2 px-4 h-[52px]">
      <p className="font-body text-xs font-bold leading-4 text-filter-dark w-full">
        {resultCount.toLocaleString()} results
      </p>
      {onSaveSearch && (
        <button
          type="button"
          onClick={onSaveSearch}
          className="flex flex-row justify-center items-center flex-none w-full gap-2 py-1.5 px-3 h-7 bg-filter-surface border border-filter-border rounded-lg font-body text-[10px] font-normal leading-3 text-filter-dark hover:bg-filter-bg focus:outline-none focus:ring-2 focus:ring-filter-primary focus:ring-offset-2"
        >
          <Heart className="w-4 h-4" aria-hidden />
          Save Search
        </button>
      )}
    </div>
  );
}
