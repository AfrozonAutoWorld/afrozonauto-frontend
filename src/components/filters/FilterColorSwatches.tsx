'use client';

import { Check } from 'lucide-react';
import type { FilterColorOption } from './types';

export interface FilterColorSwatchesProps {
  options: FilterColorOption[];
  selected: string[];
  onChange: (value: string, selected: boolean) => void;
}

export function FilterColorSwatches({
  options,
  selected,
  onChange,
}: FilterColorSwatchesProps) {
  return (
    <div className="flex flex-row flex-wrap gap-2 content-start items-center px-4 py-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value, !isSelected)}
            className="flex relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-filter-primary focus:ring-offset-2"
            style={{
              backgroundColor: opt.hex,
              borderColor: isSelected ? 'var(--filter-primary)' : 'transparent',
              boxShadow: opt.hex === '#FFFFFF' ? '0 1px 2px 2px rgba(0,0,0,0.05)' : undefined,
            }}
            aria-pressed={isSelected}
            aria-label={`${opt.value} ${isSelected ? 'selected' : ''}`}
          >
            {isSelected && (
              <span className="flex absolute inset-0 justify-center items-center">
                <Check
                  className="w-4 h-4 text-white drop-shadow"
                  strokeWidth={3}
                  aria-hidden
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
