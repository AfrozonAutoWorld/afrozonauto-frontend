import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface SellStepCardProps {
  title: string;
  description: string;
  children: ReactNode;
  stepLabel: string;
  nextLabel?: string;
  onNext?: () => void;
  backLabel?: string;
  onBack?: () => void;
}

export function SellStepCard({
  title,
  description,
  children,
  stepLabel,
  nextLabel,
  onNext,
  backLabel,
  onBack,
}: Readonly<SellStepCardProps>) {
  return (
    <div className="flex flex-col w-full bg-white border border-[#E8E8E8] rounded-3xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex flex-col gap-6 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-xl font-bold leading-7 text-[#1A1A1A]">
            {title}
          </h2>
          <p className="font-body text-sm font-normal leading-5 text-[#B8B8B8]">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-6">{children}</div>
      </div>

      <div className="flex flex-col border-t border-[#D5D7DA]">
        <div className="flex flex-row items-center justify-between gap-4 px-6 py-4 sm:px-8 sm:py-4 md:px-10">
          <div className="min-w-0 flex-1 flex justify-start">
            {onBack && backLabel ? (
              <button
                type="button"
                onClick={onBack}
                className="flex flex-row items-center gap-2 py-2 px-4 h-14 border border-[#666666] text-[#666666] font-body text-base font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                {backLabel}
              </button>
            ) : null}
          </div>
          <span className="font-body text-xs font-normal text-[#969696] shrink-0">
            {stepLabel}
          </span>
          <div className="min-w-0 flex-1 flex justify-end">
          {onNext && nextLabel ? (
            <button
              type="button"
              onClick={onNext}
              className="flex flex-row items-center justify-end gap-2 py-2 px-4 h-14 bg-[#1D242D] text-white font-body text-base font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              {nextLabel}
              <ArrowRight className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            </button>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
