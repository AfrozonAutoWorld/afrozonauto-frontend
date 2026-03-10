'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ArrowLeft, CheckCircle2 } from 'lucide-react';

const WHAT_HAPPENS = [
  'Team reviews your listing (within 24 hrs)',
  'Matched with a verified buyer',
  'You receive a formal offer via your preferred contact method',
  'Accept, negotiate, or decline, the choice is yours.',
] as const;

export interface SellVehicleSuccessProps {
  referenceId: string;
  onGoHome?: () => void;
}

export function SellVehicleSuccess({ referenceId, onGoHome }: Readonly<SellVehicleSuccessProps>) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const goHome = () => {
    if (onGoHome) onGoHome();
    else router.push('/');
  };

  return (
    <div className="flex flex-col gap-6 items-center mx-auto w-full max-w-2xl">
      {/* Success icon + title + message + reference */}
      <div className="flex flex-col gap-8 items-center w-full">
        <div className="flex flex-col gap-6 items-center">
          <div className="w-[120px] h-[120px] rounded-full bg-[#E6F6F4] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-14 h-14 text-[#0D7A4A]" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="flex flex-col gap-3 items-center text-center">
            <h2 className="font-sans text-xl font-bold leading-7 text-[#1A1A1A]">
              Listing Received
            </h2>
            <p className="font-body text-base font-normal leading-6 text-[#666666] max-w-[397px]">
              Our team will review your vehicle and get back to you with a verified offer within 48
              hours.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-row items-center justify-center gap-2.5 px-3 py-2.5 h-11 bg-[#1A1A1A] text-white font-body text-base font-normal leading-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Copy className="w-6 h-6 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>Reference: {referenceId}</span>
          {copied && (
            <span className="text-sm font-medium text-[#0D7A4A] ml-1">Copied!</span>
          )}
        </button>
      </div>

      {/* What Happens Next card */}
      <div className="flex flex-col gap-4 p-6 w-full bg-white rounded-2xl">
        <h3 className="font-body text-base font-semibold leading-6 text-[#1A1A1A]">
          What Happens Next?
        </h3>
        <ol className="list-decimal list-inside font-body text-base font-normal leading-6 text-[#666666] space-y-2 pl-0">
          {WHAT_HAPPENS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>

      {/* Go back home */}
      <button
        type="button"
        onClick={goHome}
        className="flex flex-row items-center justify-center gap-2 py-4 px-6 h-14 bg-[#0D7A4A] text-white font-body text-base font-medium leading-5 rounded-lg hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-6 h-6 shrink-0" strokeWidth={1.5} aria-hidden />
        Go back home
      </button>
    </div>
  );
}
