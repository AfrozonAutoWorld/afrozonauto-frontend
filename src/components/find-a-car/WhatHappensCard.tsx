'use client';

const STEPS = [
  {
    title: 'Team reviews your request',
    description:
      'Our sourcing team checks your spec against current US inventory and auction listings.',
  },
  {
    title: 'You receive a full quote',
    description:
      'We send you vehicle options with complete landed cost to Nigeria — no surprises.',
  },
  {
    title: 'Approve and pay deposit',
    description: 'Confirm your chosen vehicle and pay 30% into secure escrow to lock it in.',
  },
  {
    title: 'We handle everything else',
    description:
      'Purchase, inspection, export, shipping, and customs clearance — door to door.',
  },
];

export function WhatHappensCard() {
  return (
    <div className="w-full max-w-[438px] p-6 bg-white rounded-2xl shadow-[0px_1px_24px_2px_rgba(0,0,0,0.2)] flex flex-col gap-8">
      <div className="flex flex-col gap-0">
        <h3 className="font-body font-semibold text-base leading-6 text-[#1A1A1A]">
          What happens after you submit?
        </h3>
        <p className="font-body text-sm leading-5 text-[#B8B8B8]">
          What happens after you submit?
        </p>
      </div>

      <div className="flex flex-col gap-6 relative">
        {STEPS.map((step, index) => (
          <div key={index} className="flex gap-4 items-start relative">
            {/* Vertical connector line (except after last) */}
            {index < STEPS.length - 1 && (
              <div
                className="absolute left-3.5 top-9 w-px h-[calc(100%+8px)] bg-[#E8E8E8] -translate-y-1"
                aria-hidden
              />
            )}
            <div className="flex flex-col justify-center items-center w-7 h-7 rounded-full bg-[#1A1A1A] text-white shrink-0 z-[1]">
              <span className="font-body font-semibold text-sm leading-5">{index + 1}</span>
            </div>
            <div className="flex flex-col gap-2 pt-0.5 flex-1 min-w-0">
              <h4 className="font-body font-semibold text-sm leading-5 text-[#1A1A1A]">
                {step.title}
              </h4>
              <p className="font-body text-sm leading-5 text-[#B8B8B8]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
