/**
 * Shared types for the reusable filter UI.
 * Use these to add new categories or groups without hardcoding structure.
 */

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterColorOption {
  value: string;
  hex: string;
  count?: number;
}

export type FilterGroupType =
  | 'checkbox'
  | 'radio'
  | 'yearRange'
  | 'priceRange'
  | 'colorSwatches';

export interface FilterGroupBase {
  id: string;
  title: string;
  /** When true, show green dot and primary-dark label */
  hasActiveFilters?: boolean;
}

export interface FilterGroupCheckbox extends FilterGroupBase {
  type: 'checkbox';
  options: FilterOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}

export interface FilterGroupRadio extends FilterGroupBase {
  type: 'radio';
  options: FilterOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  /** Optional visual indicator for selection (defaults to 'check'). */
  indicator?: 'dot' | 'check';
  /** Optional shape of the control (defaults to 'square'). */
  shape?: 'square' | 'round';
}

export interface FilterGroupYearRange extends FilterGroupBase {
  type: 'yearRange';
  yearFrom: number | undefined;
  yearTo: number | undefined;
  yearOptions: number[];
  onFromChange: (year: number | undefined) => void;
  onToChange: (year: number | undefined) => void;
}

export interface FilterGroupPriceRange extends FilterGroupBase {
  type: 'priceRange';
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  helperText?: string;
}

export interface FilterGroupColorSwatches extends FilterGroupBase {
  type: 'colorSwatches';
  options: FilterColorOption[];
  selected: string[];
  onChange: (value: string, selected: boolean) => void;
}

export type FilterGroup =
  | FilterGroupCheckbox
  | FilterGroupRadio
  | FilterGroupYearRange
  | FilterGroupPriceRange
  | FilterGroupColorSwatches;

export interface FilterCategoryConfig {
  id: string;
  title: string;
  groups: FilterGroup[];
}
