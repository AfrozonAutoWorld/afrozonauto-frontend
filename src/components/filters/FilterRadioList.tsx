'use client';

import { Check } from 'lucide-react';
import type { FilterOption } from './types';

export interface FilterRadioListProps {
  options: FilterOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** Visual indicator for the selected state. Defaults to 'check'. */
  indicator?: 'dot' | 'check';
  /** Shape of the control. Defaults to 'square'. */
  shape?: 'square' | 'round';
  /**
   * When true (default), clicking the already-selected option clears the filter (`onChange('')`).
   * This matches checkbox-style check/uncheck UX while keeping a single active value per group.
   */
  allowUncheck?: boolean;
}

interface FilterRadioRowProps {
  option: FilterOption;
  selected: boolean;
  onSelect: () => void;
  indicator: 'dot' | 'check';
  shape: 'square' | 'round';
}

function FilterRadioRow({
  option,
  selected,
  onSelect,
  indicator,
  shape,
}: FilterRadioRowProps) {
  const shapeClass = shape === 'round' ? 'rounded-full' : 'rounded-md';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className="flex flex-row justify-between items-center w-full h-[33px] py-2 px-4 pl-6 gap-2 bg-filter-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-filter-primary text-left"
    >
      <div className="flex flex-row gap-2 items-center min-w-0">
        <span
          className={`flex flex-shrink-0 w-6 h-6 border-2 ${shapeClass} ${
            selected
              ? 'border-filter-primary bg-filter-primary'
              : 'border-filter-checkbox-border bg-filter-surface'
          }`}
          aria-hidden
        >
          {selected && (
            <span className="flex justify-center items-center w-full h-full">
              {indicator === 'check' ? (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
          )}
        </span>
        <span className="text-xs font-normal leading-4 truncate font-body text-filter-label">
          {option.label}
        </span>
      </div>
      {option.count != null && (
        <span className="text-xs font-normal leading-4 font-body text-filter-muted shrink-0">
          {option.count.toLocaleString()}
        </span>
      )}
    </button>
  );
}

export function FilterRadioList({
  options,
  value,
  onChange,
  indicator = 'check',
  shape = 'square',
  allowUncheck = true,
}: FilterRadioListProps) {
  const normalizedValue = value ?? '';

  return (
    <div className="flex flex-col items-start w-full" role="group">
      {options.map((option) => {
        const selected = normalizedValue === option.value;
        return (
          <FilterRadioRow
            key={option.value === '' ? '__all__' : option.value}
            option={option}
            selected={selected}
            onSelect={() => {
              if (allowUncheck && selected) {
                onChange('');
              } else {
                onChange(option.value);
              }
            }}
            indicator={indicator}
            shape={shape}
          />
        );
      })}
    </div>
  );
}
