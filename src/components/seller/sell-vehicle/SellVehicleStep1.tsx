'use client';

import { useState } from 'react';

const inputBase =
  'w-full h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
const labelBase = 'font-body text-sm font-medium leading-5 text-[#414651]';
const pillInactive =
  'px-3 py-1.5 rounded-full font-body text-sm font-medium leading-5 text-[#666666] bg-white border border-[#B8B8B8] transition-colors hover:border-[#0D7A4A] hover:text-[#0D7A4A]';
const pillActive =
  'bg-[#E6F6F4] rounded-full px-3 py-1.5 border border-[#0D7A4A] text-[#0D7A4A] font-body text-sm font-medium leading-5';
const KEYS_OPTIONS = ['1 key', '2 keys', '3+ keys'] as const;

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

export function SellVehicleStep1() {
  const [keysCount, setKeysCount] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Year, Make, Model */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Year" required>
          <select className={inputBase} defaultValue="">
            <option value="">Select year</option>
          </select>
        </Field>
        <Field label="Make" required>
          <select className={inputBase} defaultValue="">
            <option value="">Select make</option>
          </select>
        </Field>
        <Field label="Model" required>
          <input type="text" className={inputBase} placeholder="e.g. Highlander, RX 350" />
        </Field>
      </div>

      {/* Row 2: Trim, Body Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Trim (optional)" className="sm:col-span-2">
          <input
            type="text"
            className={inputBase}
            placeholder="e.g. XLE, F Sport, Limited, AMG Line"
          />
        </Field>
        <Field label="Body Style" required>
          <select className={inputBase} defaultValue="">
            <option value="">Select body style</option>
          </select>
        </Field>
      </div>

      {/* Row 3: Mileage, Drivetrain, Transmission */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Mileage" required>
          <input type="text" className={inputBase} placeholder="e.g. 68000" />
        </Field>
        <Field label="Drivetrain">
          <select className={inputBase} defaultValue="">
            <option value="">Select</option>
          </select>
        </Field>
        <Field label="Transmission">
          <select className={inputBase} defaultValue="">
            <option value="">Select</option>
          </select>
        </Field>
      </div>

      {/* Row 4: Fuel Type, Exterior Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Fuel Type">
          <select className={inputBase} defaultValue="">
            <option value="">Select</option>
          </select>
        </Field>
        <Field label="Exterior Color">
          <input
            type="text"
            className={inputBase}
            placeholder="e.g. Pearl White, Midnight Black"
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
              onClick={() => setKeysCount(opt)}
              className={keysCount === opt ? pillActive : pillInactive}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
