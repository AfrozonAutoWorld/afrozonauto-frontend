'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';

const DELIVERY_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Kano',
  'Ibadan',
  'Benin City',
  'Calabar',
  'Enugu',
  'Kaduna',
  'Warri',
  'Aba',
  'Onitsha',
  'Uyo',
  'Owerri',
  'Ilorin',
  'Abeokuta',
  'Akure',
  'Ado-Ekiti',
  'Jos',
  'Maiduguri',
].map((city) => ({ value: city, label: city }));

export interface FindACarStep3Data {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  deliveryCity: string;
  additionalNotes: string;
  consentContact: boolean;
}

export interface FindACarStep3FormProps {
  initialData?: Partial<FindACarStep3Data>;
  onBack: () => void;
  onSubmit: (data: FindACarStep3Data) => void;
  isSubmitting?: boolean;
}

const defaultData: FindACarStep3Data = {
  firstName: '',
  lastName: '',
  email: '',
  phoneCountryCode: '+234',
  phoneNumber: '',
  deliveryCity: '',
  additionalNotes: '',
  consentContact: false,
};

export function FindACarStep3Form({ initialData, onBack, onSubmit, isSubmitting }: FindACarStep3FormProps) {
  const [data, setData] = useState<FindACarStep3Data>({ ...defaultData, ...initialData });

  const handleSubmit = () => {
    onSubmit(data);
  };

  const canSubmit =
    Boolean(data.firstName?.trim()) &&
    Boolean(data.lastName?.trim()) &&
    Boolean(data.email?.trim()) &&
    Boolean(data.phoneNumber?.trim()) &&
    data.consentContact;

  const inputBase =
    'h-11 w-full px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 focus:border-[#0D7A4A]';
  const labelClass = 'font-body font-medium text-sm leading-5 text-[#414651]';
  const hintClass = 'font-body text-sm leading-5 text-[#B8B8B8]';

  return (
    <div
      className="flex flex-col w-full max-w-[737px] p-6 sm:p-10 gap-6 bg-white border border-[#E8E8E8] rounded-3xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.2)] relative"
      aria-busy={isSubmitting}
      aria-live="polite"
    >
      {isSubmitting && (
        <div
          className="absolute inset-0 rounded-3xl bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center"
          aria-hidden
        >
          <Loader2 className="w-8 h-8 text-[#0D7A4A] animate-spin" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h2 className="font-sans font-bold text-xl leading-7 text-black">Your preferences</h2>
        <p className="font-body text-sm leading-5 text-[#B8B8B8]">
          Help us narrow it down to exactly what you want.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Biobele"
              value={data.firstName}
              onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
              className={inputBase}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Owen"
              value={data.lastName}
              onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
              className={inputBase}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="e.g., owenbiobele@gmail.com"
            value={data.email}
            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
            className={inputBase}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex w-full rounded-lg border border-[#D5D7DA] bg-white shadow-[0px_1px_2px_rgba(10,13,18,0.05)] overflow-hidden focus-within:ring-2 focus-within:ring-[#0D7A4A]/20 focus-within:border-[#0D7A4A]">
            <span className="flex items-center px-3.5 h-11 bg-[#E8E8E8] font-body text-base leading-6 text-[#181D27] shrink-0">
              +234
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="800 000 000"
              value={data.phoneNumber}
              onChange={(e) => setData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="flex-1 min-w-0 h-11 px-3.5 py-2.5 font-body text-base leading-6 text-[#181D27] placeholder:text-[#B8B8B8] border-0 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Delivery location</label>
          <SearchableSelect
            options={DELIVERY_CITIES}
            value={data.deliveryCity || undefined}
            onValueChange={(v) => setData((prev) => ({ ...prev, deliveryCity: v || '' }))}
            placeholder="Select delivery city"
            searchPlaceholder="Search cities..."
            emptyText="No city found."
            className="w-full"
            triggerClassName="h-11 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-body text-base text-[#181D27] placeholder:text-[#B8B8B8]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Additional notes</label>
          <textarea
            placeholder="Any specific details like interior color preference, features you must have, anything we should know..."
            value={data.additionalNotes}
            onChange={(e) => setData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
            rows={4}
            className={`min-h-[92px] resize-y ${inputBase} py-3`}
          />
          <p className={hintClass}>
            Optional but helpful — more detail means a faster match
          </p>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consentContact}
            onChange={(e) => setData((prev) => ({ ...prev, consentContact: e.target.checked }))}
            className="mt-0.5 w-[18px] h-[18px] rounded border-2 border-[#49454F] text-[#0D7A4A] focus:ring-[#0D7A4A]/20"
          />
          <span className="font-body text-sm leading-5 text-[#666666]">
            I agree to be contacted by Afrozon AutoGlobal regarding this request. I understand my
            details will be used only for sourcing this vehicle.{' '}
            <Link
              href="/privacy"
              className="text-[#0D7A4A] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 rounded"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>

      <div className="border-t border-[#D5D7DA] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-3.5 h-14 border border-[#666666] rounded-lg font-body font-medium text-base leading-[21px] text-[#666666] hover:bg-[#f5f5f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-2 sm:order-1"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden />
          Back
        </button>
        <p className="font-body text-xs leading-4 text-[#969696] order-1 sm:order-2">
          Step 3 of 3
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-3.5 h-14 bg-[#1D242D] rounded-lg font-body font-medium text-base leading-[21px] text-white hover:bg-[#2d3640] disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              Submit request
              <ArrowRight className="w-6 h-6" aria-hidden />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
