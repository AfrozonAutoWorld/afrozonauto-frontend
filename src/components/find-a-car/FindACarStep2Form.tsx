'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Ship, Container, Check, Clock } from 'lucide-react';

const BUDGET_PRESETS = [
  { value: '10000', label: '$10k' },
  { value: '15000', label: '$15k' },
  { value: '20000', label: '$20k' },
  { value: '30000', label: '$30k' },
  { value: '50000', label: '$50k' },
  { value: '', label: 'No limit' },
] as const;

const EXTERIOR_COLORS = [
  { value: 'white', hex: '#FFFFFF' },
  { value: 'black', hex: '#1A1A1A' },
  { value: 'silver', hex: '#C0C0C0' },
  { value: 'grey', hex: '#6B6B6B' },
  { value: 'blue', hex: '#1A3A6B' },
  { value: 'red', hex: '#8B0000' },
  { value: 'green', hex: '#3A5C2A' },
  { value: 'brown', hex: '#8B6914' },
  { value: 'orange', hex: '#FF8C00' },
  { value: 'yellow', hex: '#FFD700' },
] as const;

const SHIPPING_OPTIONS = [
  {
    value: 'roro',
    label: 'RoRo',
    description: 'Roll-on/Roll-off. Most popular, lower cost.',
    days: '~45 days',
    icon: Ship,
  },
  {
    value: 'container',
    label: 'Container',
    description: 'Full container. More protection, higher cost.',
    days: '~60 days',
    icon: Container,
  },
] as const;

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3', label: 'Within 1-3 months' },
  { value: '3-6', label: 'Within 3-6 months' },
  { value: 'flexible', label: 'Flexible - no rush' },
] as const;

export interface FindACarStep2Data {
  budgetUsd: string;
  exteriorColor: string;
  anyColor: boolean;
  shipping: 'roro' | 'container';
  timeline: string;
}

export interface FindACarStep2FormProps {
  initialData?: Partial<FindACarStep2Data>;
  onBack: () => void;
  onNext: (data: FindACarStep2Data) => void;
}

const defaultData: FindACarStep2Data = {
  budgetUsd: '',
  exteriorColor: 'white',
  anyColor: false,
  shipping: 'roro',
  timeline: 'asap',
};

export function FindACarStep2Form({ initialData, onBack, onNext }: FindACarStep2FormProps) {
  const [data, setData] = useState<FindACarStep2Data>({ ...defaultData, ...initialData });

  const handleNext = () => onNext(data);

  const inputBase =
    'h-11 w-full px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
  const labelClass = 'font-body font-medium text-sm leading-5 text-[#414651]';
  const hintClass = 'font-body text-sm leading-5 text-[#B8B8B8]';

  const selectedColor = data.anyColor ? null : data.exteriorColor;

  return (
    <div className="flex flex-col w-full max-w-[737px] p-6 sm:p-10 gap-6 bg-white border border-[#E8E8E8] rounded-3xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-2">
        <h2 className="font-sans font-bold text-xl leading-7 text-black">Your preferences</h2>
        <p className="font-body text-sm leading-5 text-[#B8B8B8]">
          We&apos;ll send your quote and sourcing updates to these details.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Maximum budget */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            Maximum budget (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="$ eg., 20000"
            value={data.budgetUsd}
            onChange={(e) => setData((prev) => ({ ...prev, budgetUsd: e.target.value }))}
            className={inputBase}
          />
          <div className="flex flex-wrap gap-3">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    budgetUsd: preset.value,
                  }))
                }
                className={`px-2.5 py-1 rounded-full font-body text-sm leading-5 border transition-colors ${
                  data.budgetUsd === preset.value
                    ? 'bg-[#E6F6F4] border-[#0D7A4A] text-[#0D7A4A]'
                    : 'bg-white border-[#B8B8B8] text-[#666666] hover:border-[#969696]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className={hintClass}>
            US vehicle price only — we&apos;ll show total landed cost at quote stage
          </p>
        </div>

        {/* Preferred exterior color */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Preferred exterior color</label>
          <div className="flex flex-wrap items-center gap-2">
            {EXTERIOR_COLORS.map((c) => {
              const isLight = ['white', 'silver', 'yellow'].includes(c.value);
              const selected = selectedColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setData((prev) => ({ ...prev, exteriorColor: c.value, anyColor: false }))
                  }
                  className={`relative w-6 h-6 rounded-full border-2 shrink-0 transition-colors ${
                    selected ? 'border-[#0D7A4A] ring-2 ring-[#0D7A4A]/20' : 'border-transparent hover:border-[#969696]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.value}
                  aria-pressed={selected}
                  aria-label={`Color ${c.value}`}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      {isLight ? (
                        <span className="w-4 h-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </span>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md" strokeWidth={3} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setData((prev) => ({ ...prev, anyColor: true }))}
              className={`px-2.5 py-1 rounded-full font-body text-sm leading-5 border transition-colors ${
                data.anyColor
                  ? 'bg-[#E6F6F4] border-[#0D7A4A] text-[#0D7A4A]'
                  : 'bg-white border-[#B8B8B8] text-[#666666] hover:border-[#969696]'
              }`}
            >
              Any colour
            </button>
          </div>
        </div>

        {/* Shipping preference */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Shipping preference</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHIPPING_OPTIONS.map((opt) => {
              const isSelected = data.shipping === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, shipping: opt.value }))}
                  className={`relative flex flex-col items-start p-6 gap-4 rounded-2xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[#E6F6F4] border border-[#0D7A4A]'
                      : 'bg-white border border-[#969696] hover:border-[#666666]'
                  }`}
                >
                  <span
                    className={`absolute top-4 right-4 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-[#008000]' : 'border border-[#969696] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <Icon
                      className={`w-4 h-4 ${isSelected ? 'text-[#0D7A4A]' : 'text-[#1A1A1A]'}`}
                      aria-hidden
                    />
                    <span
                      className={`font-body font-semibold text-sm leading-5 ${
                        isSelected ? 'text-[#0D7A4A]' : 'text-[#1A1A1A]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="font-body text-xs leading-4 text-[#969696]">
                      {opt.description}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs leading-4 ${
                      isSelected
                        ? 'bg-[#E6F6F4] text-[#0D7A4A]'
                        : 'bg-[#E8E8E8] text-[#1A1A1A]'
                    }`}
                  >
                    <Clock className="w-3 h-3" aria-hidden />
                    {opt.days}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* When do you need it? */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>When do you need it?</label>
          <div className="flex flex-col gap-2">
            {TIMELINE_OPTIONS.map((opt) => {
              const isSelected = data.timeline === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, timeline: opt.value }))}
                  className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[#E6F6F4] border-[#0D7A4A]'
                      : 'bg-white border border-[#969696] hover:border-[#666666]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#0D7A4A] bg-[#0D7A4A]'
                        : 'border-[#969696] bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white" aria-hidden />
                    )}
                  </span>
                  <span
                    className={`font-body text-xs leading-4 ${
                      isSelected ? 'text-[#0D7A4A]' : 'text-[#969696]'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#D5D7DA] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3.5 h-14 border border-[#666666] rounded-lg font-body font-medium text-base leading-[21px] text-[#666666] hover:bg-[#f5f5f5] transition-colors order-2 sm:order-1"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden />
          Back
        </button>
        <p className="font-body text-xs leading-4 text-[#969696] order-1 sm:order-2">
          Step 2 of 3
        </p>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center justify-center gap-2 px-6 py-3.5 h-14 bg-[#1D242D] rounded-lg font-body font-medium text-base leading-[21px] text-white hover:bg-[#2d3640] transition-colors order-3"
        >
          Next: Your details
          <ArrowRight className="w-6 h-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
