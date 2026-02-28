'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useMakeModelsReference } from '@/hooks/useVehicles';

const CONDITION_OPTIONS = [
  { value: 'used', label: 'Used' },
  { value: 'new', label: 'New/near-new' },
  { value: 'either', label: 'Either - flexible' },
] as const;

const currentYear = new Date().getFullYear();
const yearOptions = [
  { value: '', label: 'Any' },
  ...Array.from({ length: currentYear - 1995 + 1 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  }),
];

export interface FindACarStep1Data {
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  trim: string;
  condition: 'used' | 'new' | 'either';
}

export interface FindACarStep1FormProps {
  initialData?: Partial<FindACarStep1Data>;
  onNext: (data: FindACarStep1Data) => void;
}

const defaultData: FindACarStep1Data = {
  make: '',
  model: '',
  yearFrom: '',
  yearTo: '',
  trim: '',
  condition: 'new',
};

export function FindACarStep1Form({ initialData, onNext }: FindACarStep1FormProps) {
  const { makeModels } = useMakeModelsReference();
  const [data, setData] = useState<FindACarStep1Data>({ ...defaultData, ...initialData });

  const makeOptions = Object.keys(makeModels || {}).sort();

  const handleNext = () => {
    onNext(data);
  };

  const canNext = Boolean(data.make?.trim() && data.model?.trim());

  return (
    <div className="flex flex-col w-full max-w-[737px] p-6 sm:p-10 gap-6 bg-white border border-[#E8E8E8] rounded-3xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-2">
        <h2 className="font-sans text-xl font-bold leading-7 text-black">
          Which car are you looking for?
        </h2>
        <p className="font-body text-sm leading-5 text-[#B8B8B8]">
          Be as specific as you can — the more detail, the faster we can source it.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm leading-5 text-[#414651]">
              Make <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={makeOptions.map((m) => ({ value: m, label: m }))}
              value={data.make || undefined}
              onValueChange={(v) => setData((prev) => ({ ...prev, make: v || '', model: '' }))}
              placeholder="Select make"
              searchPlaceholder="Search makes..."
              emptyText="No make found."
              className="w-full"
              triggerClassName="h-11 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base text-[#181D27] placeholder:text-[#B8B8B8]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm leading-5 text-[#414651]">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="eg., Highlander, RX 350"
              value={data.model}
              onChange={(e) => setData((prev) => ({ ...prev, model: e.target.value }))}
              className="h-11 w-full px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm leading-5 text-[#414651]">
              Year (from)
            </label>
            <SearchableSelect
              options={yearOptions}
              value={data.yearFrom || undefined}
              onValueChange={(v) => setData((prev) => ({ ...prev, yearFrom: v || '' }))}
              placeholder="Any"
              searchPlaceholder="Search..."
              emptyText="No year found."
              className="w-full"
              triggerClassName="h-11 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base text-[#181D27]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body font-medium text-sm leading-5 text-[#414651]">
              Year (to)
            </label>
            <SearchableSelect
              options={yearOptions}
              value={data.yearTo || undefined}
              onValueChange={(v) => setData((prev) => ({ ...prev, yearTo: v || '' }))}
              placeholder="Any"
              searchPlaceholder="Search..."
              emptyText="No year found."
              className="w-full"
              triggerClassName="h-11 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base text-[#181D27]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm leading-5 text-[#414651]">
            Trim / Package
          </label>
          <input
            type="text"
            placeholder="eg., XLE, F Sport, Limited, AMG Line"
            value={data.trim}
            onChange={(e) => setData((prev) => ({ ...prev, trim: e.target.value }))}
            className="h-11 w-full px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]"
          />
          <p className="font-body text-sm leading-5 text-[#B8B8B8]">
            Optional — leave blank if you are flexible on trim
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body font-medium text-sm leading-5 text-[#414651]">
            Condition
          </label>
          <div className="flex flex-wrap gap-3">
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setData((prev) => ({ ...prev, condition: opt.value }))}
                className={`px-4 py-2.5 rounded-lg font-body text-sm leading-5 transition-colors ${
                  data.condition === opt.value
                    ? 'bg-[#E6F6F4] border border-[#0D7A4A] text-[#0D7A4A]'
                    : 'bg-white border border-[#B8B8B8] text-[#666666] hover:border-[#969696]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#D5D7DA] pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
        <p className="font-body text-xs leading-4 text-[#969696] order-2 sm:order-1">
          Step 1 of 3
        </p>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          className="flex items-center justify-center gap-2 px-6 py-3.5 h-14 bg-[#1D242D] rounded-lg font-body font-medium text-base leading-[21px] text-white hover:bg-[#2d3640] disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-1 sm:order-2"
        >
          Next: Preferences
          <ArrowRight className="w-6 h-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
