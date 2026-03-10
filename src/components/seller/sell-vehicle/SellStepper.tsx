'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { key: 'vehicle', number: 1, label: 'Vehicle' },
  { key: 'condition', number: 2, label: 'Condition' },
  { key: 'photos-price', number: 3, label: 'Photos & Price' },
  { key: 'contact', number: 4, label: 'Contact' },
] as const;

export type SellStepKey = (typeof STEPS)[number]['key'];

export interface SellStepperProps {
  currentStep: SellStepKey;
}

export function SellStepper({ currentStep }: Readonly<SellStepperProps>) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full relative">
      {/* Connecting line behind circles */}
      <div
        className="absolute top-5 left-6 right-6 h-0.5 bg-[#E5E7EB] pointer-events-none hidden sm:block"
        aria-hidden
      />

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const circleStyle = isCompleted
          ? 'bg-[#0D7A4A] text-white'
          : isCurrent
            ? 'bg-[#1A1A1A] text-white'
            : 'bg-white border border-[#D5D7DA] text-[#969696]';

        return (
          <div
            key={step.key}
            className="flex flex-col items-center gap-2 z-[1] flex-1 sm:flex-none"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div
              className={`flex justify-center items-center w-8 h-8 rounded-full shrink-0 ${circleStyle}`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="font-body text-sm font-medium">{step.number}</span>
              )}
            </div>
            <span
              className={`font-body text-xs sm:text-sm font-medium text-center ${
                isCompleted || isCurrent ? 'text-[#1A1A1A]' : 'text-[#969696]'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { STEPS as SELL_STEPS };
