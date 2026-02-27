'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FilterGroup as FilterGroupType } from './types';
import { FilterCheckboxList } from './FilterCheckboxList';
import { FilterRadioList } from './FilterRadioList';
import { FilterYearRange } from './FilterYearRange';
import { FilterPriceRange } from './FilterPriceRange';
import { FilterColorSwatches } from './FilterColorSwatches';
export interface FilterGroupProps {
  group: FilterGroupType;
}

export function FilterGroup({ group }: FilterGroupProps) {
  const [open, setOpen] = useState(true);
  const isActive = group.hasActiveFilters ?? false;

  const headerLabelClass = isActive ? 'text-filter-primary-dark' : 'text-filter-dark';

  const listBodyClass =
    group.type === 'checkbox' || group.type === 'radio'
      ? 'flex flex-col items-start w-full max-h-48 overflow-y-auto scrollbar-hide'
      : 'flex flex-col items-start w-full';

  return (
    <div className="flex flex-col items-start w-full border-b bg-filter-surface border-filter-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex flex-row gap-2 justify-between items-center px-4 py-2 w-full h-10 rounded-none bg-filter-surface focus:outline-none focus:ring-2 focus:ring-inset focus:ring-filter-primary"
        aria-expanded={open}
        aria-controls={`filter-group-${group.id}`}
        id={`filter-group-${group.id}-button`}
      >
        <div className="flex flex-row gap-2 items-center">
          {isActive && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-filter-primary-light shrink-0"
              aria-hidden
            />
          )}
          <span className={`text-xs font-normal leading-4 font-body ${headerLabelClass}`}>
            {group.title}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-filter-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          id={`filter-group-${group.id}`}
          role="region"
          aria-labelledby={`filter-group-${group.id}-button`}
          className={listBodyClass}
        >
          {group.type === 'checkbox' && (
            <FilterCheckboxList
              options={group.options}
              selected={group.selected}
              onChange={group.onChange}
            />
          )}
          {group.type === 'radio' && (
            <FilterRadioList
              options={group.options}
              value={group.value}
              onChange={group.onChange}
              indicator={group.indicator}
              shape={group.shape}
            />
          )}
          {group.type === 'yearRange' && (
            <FilterYearRange
              yearFrom={group.yearFrom}
              yearTo={group.yearTo}
              yearOptions={group.yearOptions}
              onFromChange={group.onFromChange}
              onToChange={group.onToChange}
            />
          )}
          {group.type === 'priceRange' && (
            <FilterPriceRange
              min={group.min}
              max={group.max}
              valueMin={group.valueMin}
              valueMax={group.valueMax}
              onChange={group.onChange}
              helperText={group.helperText}
            />
          )}
          {group.type === 'colorSwatches' && (
            <FilterColorSwatches
              options={group.options}
              selected={group.selected}
              onChange={group.onChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
