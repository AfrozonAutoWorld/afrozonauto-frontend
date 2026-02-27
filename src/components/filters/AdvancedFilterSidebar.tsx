'use client';

import { FilterSidebarHeader } from './FilterSidebarHeader';
import { FilterResultsBar } from './FilterResultsBar';
import { FilterCategory } from './FilterCategory';
import type { FilterCategoryConfig } from './types';

export interface AdvancedFilterSidebarProps {
  activeFilterCount: number;
  resultCount: number;
  categories: FilterCategoryConfig[];
  onClearAll: () => void;
  onSaveSearch?: () => void;
}

/**
 * Reusable expanded filter sidebar. Pass `categories` to control sections;
 * adding a new category = adding an entry to the array with its groups.
 */
export function AdvancedFilterSidebar({
  activeFilterCount,
  resultCount,
  categories,
  onClearAll,
  onSaveSearch,
}: AdvancedFilterSidebarProps) {
  return (
    <aside
      className="flex flex-col justify-center items-start flex-none w-full overflow-x-hidden rounded-2xl border border-filter-border bg-filter-bg gap-2"
      aria-label="Filters"
    >
      <FilterSidebarHeader activeCount={activeFilterCount} onClearAll={onClearAll} />
      <FilterResultsBar resultCount={resultCount} onSaveSearch={onSaveSearch} />
      <div className="flex flex-col items-start w-full">
        {categories.map((category) => (
          <FilterCategory key={category.id} category={category} />
        ))}
      </div>
    </aside>
  );
}

