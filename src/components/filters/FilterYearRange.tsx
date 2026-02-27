'use client';

import { ChevronDown } from 'lucide-react';

export interface FilterYearRangeProps {
  yearFrom: number | undefined;
  yearTo: number | undefined;
  yearOptions: number[];
  onFromChange: (year: number | undefined) => void;
  onToChange: (year: number | undefined) => void;
}

export function FilterYearRange({
  yearFrom,
  yearTo,
  yearOptions,
  onFromChange,
  onToChange,
}: FilterYearRangeProps) {
  return (
    <div className="flex flex-row items-center w-full gap-4 px-4 py-2">
      <div className="flex flex-col justify-center items-start flex-1 gap-1.5">
        <label className="font-body text-[10px] font-normal leading-3 text-filter-muted">
          FROM
        </label>
        <select
          value={yearFrom ?? ''}
          onChange={(e) =>
            onFromChange(e.target.value ? Number(e.target.value) : undefined)
          }
          className="flex flex-row justify-between items-center w-full h-7 py-1 px-2.5 gap-3 bg-filter-surface border border-filter-border rounded-lg font-body text-xs font-normal leading-4 text-filter-subtle focus:outline-none focus:ring-2 focus:ring-filter-primary focus:border-transparent"
          aria-label="Year from"
        >
          <option value="">Select</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col justify-center items-start flex-1 gap-1.5">
        <label className="font-body text-[10px] font-normal leading-3 text-filter-muted">
          TO
        </label>
        <select
          value={yearTo ?? ''}
          onChange={(e) =>
            onToChange(e.target.value ? Number(e.target.value) : undefined)
          }
          className="flex flex-row justify-between items-center w-full h-7 py-1 px-2.5 gap-3 bg-filter-surface border border-filter-border rounded-lg font-body text-xs font-normal leading-4 text-filter-subtle focus:outline-none focus:ring-2 focus:ring-filter-primary focus:border-transparent"
          aria-label="Year to"
        >
          <option value="">Select</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
