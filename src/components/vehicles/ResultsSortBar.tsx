'use client';

import { ChevronDown } from 'lucide-react';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export interface ResultsSortBarProps {
  total?: number;
  isLoading: boolean;
  label: string;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

const sortLabelMap: Record<SortOption, string> = {
  newest: 'Best Match',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  year_desc: 'Year: Newest',
  mileage_asc: 'Mileage: Low to High',
};

export function ResultsSortBar({ total, isLoading, label, sortBy, onSortChange }: ResultsSortBarProps) {
  const countText =
    total != null && total > 0
      ? `Showing ${total.toLocaleString()} vehicles`
      : isLoading
        ? 'Finding vehicles...'
        : label;

  return (
    <div className="flex flex-row justify-between items-center w-full px-8 py-4 bg-white border border-filter-border rounded-2xl">
      <p className="font-body text-sm font-medium leading-5 text-filter-muted truncate">
        {countText}
      </p>
      <div className="flex flex-row items-center gap-4 shrink-0">
        <span className="font-body text-sm font-medium leading-5 text-filter-muted">
          Sort by
        </span>
        <div className="relative inline-flex items-center h-9 px-4 pr-8 bg-[#E8E8E8] border border-[#E5E7EB] rounded-lg">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="pr-6 bg-transparent border-none outline-none font-body text-sm font-normal leading-5 text-[#484848] appearance-none"
          >
            <option value="newest">{sortLabelMap.newest}</option>
            <option value="price_asc">{sortLabelMap.price_asc}</option>
            <option value="price_desc">{sortLabelMap.price_desc}</option>
            <option value="year_desc">{sortLabelMap.year_desc}</option>
            <option value="mileage_asc">{sortLabelMap.mileage_asc}</option>
          </select>
          <ChevronDown className="absolute right-2 w-4 h-4 text-[#374151]" aria-hidden />
        </div>
      </div>
    </div>
  );
}

