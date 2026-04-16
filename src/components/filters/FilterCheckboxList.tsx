'use client';

import { Check } from 'lucide-react';
import type { FilterOption } from './types';

export interface FilterCheckboxListProps {
  options: FilterOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
  /** Match FilterRadioList: check icon vs dot (default check). */
  indicator?: 'dot' | 'check';
  /** Match FilterRadioList: square vs round outer shape (default square). */
  shape?: 'square' | 'round';
}

function FilterCheckboxRow({
  option,
  checked,
  onToggle,
  indicator,
  shape,
}: {
  option: FilterOption;
  checked: boolean;
  onToggle: () => void;
  indicator: 'dot' | 'check';
  shape: 'square' | 'round';
}) {
  const shapeClass = shape === 'round' ? 'rounded-full' : 'rounded-md';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex flex-row justify-between items-center w-full h-[33px] py-2 px-4 pl-6 gap-2 bg-filter-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-filter-primary text-left"
    >
      <div className="flex flex-row gap-2 items-center min-w-0">
        <span
          className={`flex flex-shrink-0 justify-center items-center w-6 h-6 border-2 ${shapeClass} ${
            checked
              ? 'border-filter-primary bg-filter-primary'
              : 'border-filter-checkbox-border bg-filter-surface'
          }`}
          aria-hidden
        >
          {checked && (
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

export function FilterCheckboxList({
  options,
  selected,
  onChange,
  indicator = 'check',
  shape = 'square',
}: FilterCheckboxListProps) {
  return (
    <div className="flex flex-col items-start w-full" role="group">
      {options.map((option) => (
        <FilterCheckboxRow
          key={option.value}
          option={option}
          checked={selected.includes(option.value)}
          onToggle={() => onChange(option.value, !selected.includes(option.value))}
          indicator={indicator}
          shape={shape}
        />
      ))}
    </div>
  );
}

