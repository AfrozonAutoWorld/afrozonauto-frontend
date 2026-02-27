'use client';

import { useCallback, useEffect, useState } from 'react';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface FilterPriceRangeProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  helperText?: string;
}

export function FilterPriceRange({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  helperText,
}: FilterPriceRangeProps) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);

  useEffect(() => {
    setLocalMin(valueMin);
    setLocalMax(valueMax);
  }, [valueMin, valueMax]);

  const range = max - min;
  const leftPct = range ? ((localMin - min) / range) * 100 : 0;
  const rightPct = range ? ((localMax - min) / range) * 100 : 100;
  const trackWidthPct = rightPct - leftPct;

  const commit = useCallback(() => {
    const lo = Math.min(localMin, localMax);
    const hi = Math.max(localMin, localMax);
    onChange(lo, hi);
  }, [localMin, localMax, onChange]);

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    setLocalMin(Math.max(min, Math.min(v, localMax)));
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isFinite(v)) return;
    setLocalMax(Math.max(localMin, Math.min(v, max)));
  };

  return (
    <div className="flex flex-col items-start w-full gap-2 py-2 px-4">
      <div className="flex flex-row justify-between items-start w-full">
        <span className="font-body text-xs font-bold leading-4 text-filter-muted">
          MIN
        </span>
        <span className="font-body text-xs font-bold leading-4 text-filter-muted">
          MAX
        </span>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <span className="font-body text-xs font-bold leading-4 text-filter-dark">
          {formatPrice(localMin)}
        </span>
        <span className="font-body text-xs font-bold leading-4 text-filter-dark">
          {formatPrice(localMax)}
        </span>
      </div>
      <div className="relative w-full py-2">
        <div
          className="h-1.5 w-full rounded-lg bg-filter-border"
          role="presentation"
        />
        <div
          className="absolute top-2 h-1.5 rounded-lg bg-filter-primary"
          style={{
            left: `${leftPct}%`,
            width: `${trackWidthPct}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinInput}
          onMouseUp={commit}
          onTouchEnd={commit}
          className="absolute top-0 left-0 w-full h-5 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:-mt-0.5
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-filter-surface
            [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_var(--filter-primary)]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab
            [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-filter-surface
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-filter-primary
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-in-out
            [&::-moz-range-thumb]:cursor-grab"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxInput}
          onMouseUp={commit}
          onTouchEnd={commit}
          className="absolute top-0 left-0 w-full h-5 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:-mt-0.5
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-filter-surface
            [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_var(--filter-primary)]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-in-out
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab
            [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-filter-surface
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-filter-primary
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-in-out
            [&::-moz-range-thumb]:cursor-grab"
          aria-label="Maximum price"
        />
      </div>
      {helperText && (
        <p className="font-body text-xs font-normal leading-4 text-filter-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
