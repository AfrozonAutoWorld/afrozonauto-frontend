'use client';

import type { FilterCategoryConfig } from './types';
import { FilterGroup } from '.';

export interface FilterCategoryProps {
  category: FilterCategoryConfig;
}

export function FilterCategory({ category }: FilterCategoryProps) {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex flex-row items-center w-full h-8 py-2.5 px-4 gap-2.5 border-t border-filter-border">
        <span className="font-body text-[10px] font-bold leading-3 uppercase tracking-wide text-filter-muted">
          {category.title}
        </span>
      </div>
      <div className="flex flex-col items-start w-full bg-filter-surface">
        {category.groups.map((group) => (
          <FilterGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}


