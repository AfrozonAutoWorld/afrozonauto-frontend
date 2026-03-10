'use client';

import { useState } from 'react';

const inputBase =
  'w-full h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
const labelBase = 'font-body text-sm font-medium leading-5 text-[#414651]';
const pillInactive =
  'px-3 py-1.5 rounded-full font-body text-sm font-medium leading-5 text-[#666666] bg-white border border-[#B8B8B8] transition-colors hover:border-[#0D7A4A] hover:text-[#0D7A4A]';
const pillActive =
  'bg-[#E6F6F4] rounded-full px-3 py-1.5 border border-[#0D7A4A] text-[#0D7A4A] font-body text-sm font-medium leading-5';

const CONTACT_METHODS = ['WhatsApp', 'Email', 'Text Message'] as const;
const BEST_TIME_OPTIONS = [
  { value: '', label: 'Select Time' },
  { value: 'morning', label: 'Morning (8am – 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm – 5pm)' },
  { value: 'evening', label: 'Evening (5pm – 8pm)' },
  { value: 'anytime', label: 'Anytime' },
] as const;

/** Placeholder summary until we have shared form state from steps 1–3 */
const DEFAULT_SUMMARY = {
  vehicle: '2022 Toyota Camry',
  mileage: '680,000 mi',
  condition: 'Poor',
  title: 'Clean',
  photosCount: 4,
  priceDisplay: 'Requesting Afrozon valuation',
} as const;

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

export interface SellVehicleStep4Props {
  /** Optional summary from previous steps; falls back to placeholder */
  summary?: {
    vehicle?: string;
    mileage?: string;
    condition?: string;
    title?: string;
    photosCount?: number;
    priceDisplay?: string;
  };
}

export function SellVehicleStep4({ summary }: Readonly<SellVehicleStep4Props>) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [contactMethods, setContactMethods] = useState<Set<string>>(new Set());
  const [confirmChecked, setConfirmChecked] = useState(false);

  const s = { ...DEFAULT_SUMMARY, ...summary };
  const photosLabel = s.photosCount === 1 ? '1 added' : `${s.photosCount} added`;

  const toggleContactMethod = (method: string) => {
    setContactMethods((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: First name, Last name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" required>
          <input
            type="text"
            className={inputBase}
            placeholder="e.g., Biobele"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-label="First name"
          />
        </Field>
        <Field label="Last name" required>
          <input
            type="text"
            className={inputBase}
            placeholder="e.g., Owen"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-label="Last name"
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email address" required>
        <input
          type="email"
          className={inputBase}
          placeholder="e.g., owenbiobele@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
      </Field>

      {/* Row: Phone (with +1), Best time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone Number" required>
          <div className="flex flex-row rounded-lg border border-[#D5D7DA] bg-white shadow-[0px_1px_2px_rgba(10,13,18,0.05)] overflow-hidden focus-within:ring-2 focus-within:ring-[#0D7A4A]/20 focus-within:border-[#0D7A4A]">
            <span className="flex items-center px-3.5 h-11 bg-[#E8E8E8] font-body text-base leading-6 text-[#181D27]">
              +1
            </span>
            <input
              type="tel"
              className="flex-1 min-w-0 h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] bg-transparent border-0 focus:outline-none"
              placeholder="800 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Phone number"
            />
          </div>
        </Field>
        <Field label="Best Time to Reach You" required>
          <select
            className={inputBase}
            value={bestTime}
            onChange={(e) => setBestTime(e.target.value)}
            aria-label="Best time to reach you"
          >
            {BEST_TIME_OPTIONS.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* City / State */}
      <Field label="City / State (Vehicle Location)" required>
        <input
          type="text"
          className={inputBase}
          placeholder="e.g., Houston, TX"
          value={cityState}
          onChange={(e) => setCityState(e.target.value)}
          aria-label="City and state"
        />
      </Field>

      {/* Preferred Contact Method */}
      <div className="flex flex-col gap-2">
        <span className={labelBase}>Preferred Contact Method</span>
        <div className="flex flex-wrap gap-3">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => toggleContactMethod(method)}
              className={contactMethods.has(method) ? pillActive : pillInactive}
            >
              {method}
            </button>
          ))}
        </div>
        <p className="font-body text-sm font-normal leading-5 text-[#B8B8B8]">
          You can choose more than one preferred contact method
        </p>
      </div>

      {/* Vehicle Summary */}
      <div className="rounded-lg bg-[#F0F2F5] p-6 flex flex-col gap-4">
        <SummaryRow label="Vehicle" value={s.vehicle} />
        <SummaryRow label="Mileage" value={s.mileage} />
        <SummaryRow label="Condition" value={s.condition} />
        <SummaryRow label="Title" value={s.title} />
        <SummaryRow label="Photos" value={photosLabel} />
        <SummaryRow label="Price" value={s.priceDisplay} last />
      </div>

      {/* Confirmation checkbox */}
      <label className="flex flex-row items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmChecked}
          onChange={(e) => setConfirmChecked(e.target.checked)}
          className="mt-0.5 w-[18px] h-[18px] rounded-[2px] border border-[#969696] text-[#0D7A4A] focus:ring-[#0D7A4A]"
          aria-label="Confirm details and consent"
        />
        <span className="font-body text-sm font-normal leading-5 text-[#666666]">
          I confirm these details are accurate and I consent to Afrozon contacting me with an offer.
        </span>
      </label>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  last,
}: Readonly<{ label: string; value: string; last?: boolean }>) {
  return (
    <div
      className={`flex flex-row justify-between items-center py-2 ${last ? '' : 'border-b border-[#B8B8B8]'}`}
    >
      <span className="font-body text-base font-normal leading-6 text-[#666666]">{label}</span>
      <span className="font-body text-base font-semibold leading-6 text-[#1A1A1A]">{value}</span>
    </div>
  );
}
