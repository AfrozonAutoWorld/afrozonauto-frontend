'use client';

import { X } from 'lucide-react';

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface ActiveFiltersBarProps {
  chips: ActiveFilterChip[];
  onClearAll: () => void;
}

export function ActiveFiltersBar({ chips, onClearAll }: ActiveFiltersBarProps) {
  return (
    <div className="flex flex-row justify-between items-center w-full px-8 py-6 bg-white border border-filter-border rounded-2xl">
      <div className="flex flex-row items-center gap-6 min-w-0">
        <span className="font-body text-sm font-medium leading-5 text-filter-muted shrink-0">
          Filters:
        </span>
        <div className="flex flex-row flex-wrap items-center gap-3 min-w-0">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center justify-center h-7 px-2.5 py-1 gap-1 rounded-full bg-[#1A1A1A] text-white font-body text-sm font-medium leading-5"
            >
              <span className="truncate max-w-[8rem]">{chip.label}</span>
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/40">
                <X className="w-2.5 h-2.5 text-white" strokeWidth={2.5} aria-hidden />
              </span>
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onClearAll}
        className="font-sans text-xs font-normal leading-4 text-filter-primary hover:underline shrink-0"
      >
        Clear all
      </button>
    </div>
  );
}

