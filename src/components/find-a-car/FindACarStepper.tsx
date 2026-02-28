'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { key: 'car', number: 1, label: 'Car' },
  { key: 'preferences', number: 2, label: 'Preferences' },
  { key: 'contact', number: 3, label: 'Contact' },
] as const;

export type FindACarStepKey = (typeof STEPS)[number]['key'];

export interface FindACarStepperProps {
  currentStep: FindACarStepKey;
}

export function FindACarStepper({ currentStep }: FindACarStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Connector line after step 0 (between Car and Preferences): green if step 0 completed
  const line1Green = currentIndex >= 1;
  // Connector line after step 1 (between Preferences and Contact): green if step 1 completed
  const line2Green = currentIndex >= 2;

  return (
    <div className="flex flex-row justify-between items-center gap-8 w-full max-w-[602px] relative">
      {/* Connecting lines (between circles) */}
      <div
        className={`absolute top-[17px] left-7 right-7 h-px pointer-events-none hidden sm:block ${
          line1Green ? 'bg-[#008000]' : 'bg-[#969696]'
        }`}
        style={{ width: 'calc(50% - 28px)' }}
        aria-hidden
      />
      <div
        className={`absolute top-4 left-1/2 right-7 h-px pointer-events-none hidden sm:block -translate-x-px ${
          line2Green ? 'bg-[#008000]' : 'bg-[#969696]'
        }`}
        style={{ width: 'calc(50% - 56px)' }}
        aria-hidden
      />

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isInactive = index > currentIndex;

        return (
          <div
            key={step.key}
            className="flex flex-col items-center gap-2 z-[1] flex-1 sm:flex-none"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div
              className={`flex flex-col justify-center items-center w-7 h-7 rounded-full shrink-0 ${
                isCompleted
                  ? 'bg-[#008000] border-[3px] border-[#E6F6F4] text-white'
                  : isCurrent
                    ? 'bg-[#1A1A1A] border-[3px] border-[#969696] text-white'
                    : 'bg-white border-[1.5px] border-[#969696] text-[#969696]'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
              ) : (
                <span className="font-body font-semibold text-sm leading-5 text-center">
                  {step.number}
                </span>
              )}
            </div>
            <span
              className={`font-body font-semibold text-xs leading-4 text-center ${
                isCompleted ? 'text-[#008000]' : isCurrent ? 'text-[#1A1A1A]' : 'text-[#969696]'
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
