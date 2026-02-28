'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import type { SourcingRequestCreated } from '@/lib/api/sourcingRequests';

export interface FindACarSuccessCardProps {
  data: SourcingRequestCreated;
  onGoHome?: () => void;
}

function formatYearRange(yearFrom: number | null, yearTo: number | null): string {
  if (yearFrom == null && yearTo == null) return 'Any';
  if (yearFrom == null && yearTo != null) return `Any - ${yearTo}`;
  if (yearFrom != null && yearTo == null) return `${yearFrom} - Any`;
  return `${yearFrom} - ${yearTo}`;
}

const SUMMARY_ROWS: { key: string; label: string; getValue: (d: SourcingRequestCreated) => string }[] = [
  { key: 'vehicle', label: 'Vehicle', getValue: (d) => `${d.make} ${d.model}` },
  {
    key: 'yearRange',
    label: 'Year range',
    getValue: (d) => formatYearRange(d.yearFrom, d.yearTo),
  },
  {
    key: 'submittedBy',
    label: 'Submitted by',
    getValue: (d) => `${d.firstName} ${d.lastName}`,
  },
  { key: 'quoteSentTo', label: 'Quote sent to', getValue: (d) => d.email },
  { key: 'expectedResponse', label: 'Expected response', getValue: () => 'Within 48 hours' },
];

export function FindACarSuccessCard({ data, onGoHome }: FindACarSuccessCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.requestNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div
      className="flex flex-col w-full max-w-[737px] p-10 gap-6 bg-white border border-[#E8E8E8] rounded-3xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.2)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-9">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-[#E6F6F4] flex items-center justify-center shrink-0">
              <CheckCircle className="w-10 h-10 text-[#0D7A4A]" strokeWidth={2} aria-hidden />
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="font-sans font-bold text-xl leading-7 text-[#1A1A1A]">
                Request submitted!
              </h2>
              <p className="font-body text-base leading-6 text-[#666666] max-w-[397px]">
                Our sourcing team has received your request. We&apos;ll locate your vehicle and send
                a full quote within 48 hours.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2.5 px-3 py-2.5 h-11 bg-[#1A1A1A] rounded-lg font-body text-base leading-6 text-white hover:bg-[#2d2d2d] transition-colors"
          >
            <Copy className="w-6 h-6 shrink-0" aria-hidden />
            <span>Reference: {data.requestNumber}</span>
          </button>
          {copied && (
            <span className="text-sm font-body text-[#0D7A4A]" role="status">
              Copied to clipboard
            </span>
          )}
        </div>

        <div className="w-full p-6 bg-[#F0F2F5] rounded-lg flex flex-col divide-y divide-[#B8B8B8]">
          {SUMMARY_ROWS.map((row) => (
            <div
              key={row.key}
              className="flex flex-row justify-between items-center gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="font-body text-base leading-6 text-[#666666]">{row.label}</span>
              <span className="font-body font-semibold text-base leading-6 text-[#1A1A1A] text-right">
                {row.getValue(data)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGoHome}
          className="inline-flex items-center justify-center gap-2 px-4 py-4 h-14 bg-[#0D7A4A] rounded-lg font-body font-medium text-base leading-[21px] text-white hover:bg-[#0a6340] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 shrink-0" aria-hidden />
          Go back home
        </button>
      </div>
    </div>
  );
}
