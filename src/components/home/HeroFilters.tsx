'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { VEHICLE_MAKES } from '@/lib/pricingCalculator';
import { useMakeModelsReference } from '@/hooks/useVehicles';

const BODY_STYLES = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Wagon',
  'Van',
  'Pickup Truck',
  'Truck',
] as const;

const PRICE_PRESETS = [
  { value: 15000, label: 'Up to $15,000' },
  { value: 30000, label: 'Up to $30,000' },
  { value: 50000, label: 'Up to $50,000' },
  { value: 80000, label: 'Up to $80,000' },
  { value: 120000, label: 'Up to $120,000' },
] as const;

export function HeroFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { makeModels } = useMakeModelsReference();

  const currentMake = searchParams?.get('make') ?? '';
  const currentModel = searchParams?.get('model') ?? '';
  const currentBodyStyle = searchParams?.get('bodyStyle') ?? '';
  const currentPriceMax = searchParams?.get('priceMax') ?? '';

  const makeOptions = useMemo(
    () => (Object.keys(makeModels).length ? Object.keys(makeModels).sort() : VEHICLE_MAKES),
    [makeModels],
  );

  const modelOptions = useMemo(
    () =>
      currentMake && makeModels[currentMake]?.length
        ? makeModels[currentMake]
        : [],
    [currentMake, makeModels],
  );

  const applyParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const wrapperClasses =
    'relative shrink-0 h-11 bg-white/10 border border-white/20 backdrop-blur-[6px] rounded-lg flex items-center px-2.5';
  const selectClasses =
    'w-full pr-6 bg-transparent border-none outline-none appearance-none font-body text-[14px] leading-5 text-white';

  return (
    <div className="flex flex-row flex-nowrap gap-4 items-center w-full overflow-x-auto pb-1 -mx-1 scroll-smooth">
      {/* Make */}
      <div className={`${wrapperClasses} min-w-[140px]`}>
        <select
          value={currentMake}
          onChange={(e) => {
            const value = e.target.value;
            applyParam({ make: value || null, model: null });
          }}
          className={selectClasses}
        >
          <option value="">Any Make</option>
          {makeOptions.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 w-4 h-4 text-white pointer-events-none" aria-hidden />
      </div>

      {/* Model */}
      <div className={`${wrapperClasses} min-w-[150px]`}>
        <select
          value={currentModel}
          onChange={(e) => {
            const value = e.target.value;
            applyParam({ model: value || null });
          }}
          disabled={!currentMake || !modelOptions.length}
          className={`${selectClasses} ${
            !currentMake || !modelOptions.length ? 'text-white/40' : ''
          }`}
        >
          {!currentMake || !modelOptions.length ? (
            <option value="">Select make first</option>
          ) : (
            <>
              <option value="">Any Model</option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </>
          )}
        </select>
        <ChevronDown className="absolute right-2.5 w-4 h-4 text-white pointer-events-none" aria-hidden />
      </div>

      {/* Body style */}
      <div className={`${wrapperClasses} min-w-[160px]`}>
        <select
          value={currentBodyStyle}
          onChange={(e) => {
            const value = e.target.value;
            applyParam({ bodyStyle: value || null });
          }}
          className={selectClasses}
        >
          <option value="">Any Body Style</option>
          {BODY_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 w-4 h-4 text-white pointer-events-none" aria-hidden />
      </div>

      {/* Max price */}
      <div className={`${wrapperClasses} min-w-[170px]`}>
        <select
          value={currentPriceMax}
          onChange={(e) => {
            const value = e.target.value;
            applyParam({ priceMax: value || null });
          }}
          className={selectClasses}
        >
          <option value="">Max Price (USD)</option>
          {PRICE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 w-4 h-4 text-white pointer-events-none" aria-hidden />
      </div>

      {/* Advanced search */}
      <Link
        href="/marketplace"
        className="shrink-0 flex flex-row justify-center items-center gap-2.5 py-2.5 px-2.5 h-11 backdrop-blur-[6px] rounded-lg font-body font-normal text-[14px] leading-5 text-white hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        Advanced search
        <SlidersHorizontal className="w-6 h-6 text-white shrink-0" aria-hidden />
      </Link>
    </div>
  );
}
