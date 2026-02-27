'use client';

import type { FilterOption } from './types';
import { Checkbox } from '@/components/ui/checkbox';

export interface FilterCheckboxListProps {
  options: FilterOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}

function FilterCheckboxRow({
  option,
  checked,
  onToggle,
}: {
  option: FilterOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex flex-row justify-between items-center w-full h-[33px] py-2 px-4 pl-6 gap-2 bg-filter-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-filter-primary text-left"
    >
      <div className="flex flex-row items-center gap-2 min-w-0">
        <Checkbox
          checked={checked}
          className="h-[18px] w-[18px] rounded-[2px] border-2 border-filter-checkbox-border data-[state=checked]:bg-filter-primary data-[state=checked]:border-filter-primary"
          aria-hidden
        />
        <span className="font-body text-xs font-normal leading-4 text-filter-label truncate">
          {option.label}
        </span>
      </div>
      {option.count != null && (
        <span className="font-body text-xs font-normal leading-4 text-filter-muted shrink-0">
          {option.count.toLocaleString()}
        </span>
      )}
    </button>
  );
}

export function FilterCheckboxList({ options, selected, onChange }: FilterCheckboxListProps) {
  return (
    <div className="flex flex-col items-start w-full">
      {options.map((option) => (
        <FilterCheckboxRow
          key={option.value}
          option={option}
          checked={selected.includes(option.value)}
          onToggle={() => onChange(option.value, !selected.includes(option.value))}
        />
      ))}
    </div>
  );
}

