'use client';

import { useMemo } from 'react';
import { VEHICLE_MAKES } from '@/lib/pricingCalculator';
import { carModels } from '@/lib/carModels';
import { useMakeModelsReference } from '@/hooks/useVehicles';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';

const inputBase =
  'w-full h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
const labelBase = 'font-body text-sm font-medium leading-5 text-[#414651]';
const pillInactive =
  'px-3 py-1.5 rounded-full font-body text-sm font-medium leading-5 text-[#666666] bg-white border border-[#B8B8B8] transition-colors hover:border-[#0D7A4A] hover:text-[#0D7A4A]';
const pillActive =
  'bg-[#E6F6F4] rounded-full px-3 py-1.5 border border-[#0D7A4A] text-[#0D7A4A] font-body text-sm font-medium leading-5';
const KEYS_OPTIONS = ['1 key', '2 keys', '3+ keys'] as const;

const BODY_STYLES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Pickup Truck', 'Truck'] as const;
const FUEL_OPTIONS = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-In Hybrid', 'Flex Fuel'] as const;
const TRANSMISSION_OPTIONS = ['Automatic', 'Manual', 'CVT', 'Dual-Clutch', 'Single-Speed'] as const;
const DRIVETRAIN_OPTIONS = ['AWD', 'FWD', 'RWD', '4WD'] as const;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

function Field({
  label,
  required,
  children,
  className,
}: Readonly<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={className}>
      <label className={`block mb-1.5 ${labelBase}`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export interface SellVehicleStep1Value {
  year: string;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  mileage: string;
  drivetrain?: string;
  transmission?: string;
  fuelType?: string;
  exteriorColor?: string;
  keysCount?: string | null;
}

export interface SellVehicleStep1Props {
  value: SellVehicleStep1Value;
  onChange: React.Dispatch<React.SetStateAction<SellVehicleStep1Value>>;
}

export function SellVehicleStep1({ value, onChange }: Readonly<SellVehicleStep1Props>) {
  const { makeModels } = useMakeModelsReference();

  const makeOptions = useMemo(
    () => (Object.keys(makeModels).length ? Object.keys(makeModels).sort() : VEHICLE_MAKES),
    [makeModels],
  );

  const makeSelectOptions: SearchableSelectOption[] = useMemo(
    () => makeOptions.map((m) => ({ value: m, label: m })),
    [makeOptions],
  );

  const modelOptions = useMemo(() => {
    if (value.make && makeModels[value.make]?.length) {
      return makeModels[value.make];
    }
    if (value.make && carModels[value.make as keyof typeof carModels]) {
      return carModels[value.make as keyof typeof carModels];
    }
    return [] as string[];
  }, [value.make, makeModels]);

  const modelSelectOptions: SearchableSelectOption[] = useMemo(
    () => modelOptions.map((m) => ({ value: m, label: m })),
    [modelOptions],
  );

  const handleFieldChange = (field: keyof SellVehicleStep1Value, fieldValue: string | null) => {
    onChange((prev) => ({
      ...prev,
      [field]: fieldValue,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Year, Make, Model */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Year" required>
          <SearchableSelect
            options={YEAR_OPTIONS.map((year) => ({ value: year.toString(), label: year.toString() }))}
            value={value.year || undefined}
            onValueChange={(next) => handleFieldChange('year', next ?? '')}
            placeholder="Select year"
            searchPlaceholder="Search or type year"
            emptyText="No years found."
          />
        </Field>
        <Field label="Make" required>
          <SearchableSelect
            options={makeSelectOptions}
            value={value.make || undefined}
            onValueChange={(next) => {
              // Avoid accidentally clearing the make when user just opens/closes or clicks the placeholder
              if (next === undefined && value.make) {
                return;
              }
              const nextMake = next ?? '';
              handleFieldChange('make', nextMake);
              // Reset model when make changes
              if (nextMake !== value.make) {
                handleFieldChange('model', '');
              }
            }}
            placeholder="Select make or type"
            searchPlaceholder="Search or type make"
            emptyText="No makes found."
          />
        </Field>
        <Field label="Model" required>
          <SearchableSelect
            options={modelSelectOptions}
            value={value.model || undefined}
            onValueChange={(next) => handleFieldChange('model', next ?? '')}
            placeholder="e.g. Highlander, RX 350"
            searchPlaceholder="Search or type model"
            emptyText="No models found."
          />
        </Field>
      </div>

      {/* Row 2: Trim, Body Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Trim (optional)" className="sm:col-span-2">
          <input
            type="text"
            className={inputBase}
            placeholder="e.g. XLE, F Sport, Limited, AMG Line"
            value={value.trim ?? ''}
            onChange={(e) => handleFieldChange('trim', e.target.value)}
          />
        </Field>
        <Field label="Body Style" required>
          <select
            className={inputBase}
            value={value.bodyStyle}
            onChange={(e) => handleFieldChange('bodyStyle', e.target.value)}
          >
            <option value="">Select body style</option>
            {BODY_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Row 3: Mileage, Drivetrain, Transmission */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Mileage" required>
          <input
            type="text"
            className={inputBase}
            placeholder="e.g. 68000"
            value={value.mileage}
            onChange={(e) => handleFieldChange('mileage', e.target.value)}
          />
        </Field>
        <Field label="Drivetrain">
          <select
            className={inputBase}
            value={value.drivetrain}
            onChange={(e) => handleFieldChange('drivetrain', e.target.value)}
          >
            <option value="">Select</option>
            {DRIVETRAIN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transmission">
          <select
            className={inputBase}
            value={value.transmission}
            onChange={(e) => handleFieldChange('transmission', e.target.value)}
          >
            <option value="">Select</option>
            {TRANSMISSION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Row 4: Fuel Type, Exterior Color */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fuel Type">
          <select
            className={inputBase}
            value={value.fuelType}
            onChange={(e) => handleFieldChange('fuelType', e.target.value)}
          >
            <option value="">Select</option>
            {FUEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Exterior Color">
          <input
            type="text"
            className={inputBase}
            placeholder="e.g. Pearl White, Midnight Black"
            value={value.exteriorColor ?? ''}
            onChange={(e) => handleFieldChange('exteriorColor', e.target.value)}
          />
        </Field>
      </div>

      {/* Number of Keys */}
      <fieldset className="flex flex-col gap-2">
        <legend className={labelBase}>
          Number of Keys <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-row flex-wrap gap-3">
          {KEYS_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleFieldChange('keysCount', opt)}
              className={value.keysCount === opt ? pillActive : pillInactive}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
