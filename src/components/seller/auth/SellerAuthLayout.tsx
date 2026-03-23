'use client';

import type { ReactNode } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SellerAuthStep = 'signup' | 'verify_identity' | 'list_vehicle';

type SellerAuthLayoutProps = {
  activeStep: SellerAuthStep;
  children: ReactNode;
};

type StepItem = {
  id: SellerAuthStep;
  label: string;
};

const STEPS: StepItem[] = [
  { id: 'signup', label: 'Sign up your account' },
  { id: 'verify_identity', label: 'Verify identity' },
  { id: 'list_vehicle', label: 'List your vehicle' },
];

function StepPill({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-4 py-3',
        active ? 'bg-[#0D7A4A]' : 'bg-[#E8E8E8]',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-3',
          active
            ? 'bg-white text-[#0D7A4A]'
            : done
              ? 'bg-[#0D7A4A] text-white'
              : 'bg-[#666666] text-white',
        )}
      >
        {done ? '✓' : number}
      </span>
      <span
        className={cn(
          'font-body text-xs leading-4',
          active ? 'font-medium text-white' : 'font-semibold text-[#666666]',
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function SellerAuthLayout({
  activeStep,
  children,
}: SellerAuthLayoutProps) {
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_minmax(540px,1fr)] lg:gap-10 lg:px-8 lg:py-8">
        <aside className="relative isolate overflow-hidden rounded-2xl bg-[#111827]">
          <img
            src="/noise_image.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-soft-light"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-[-25%] h-[120%] w-[180%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#00A67E_28%,#036951_100%)] opacity-75 blur-[70px]"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[360px] w-full max-w-[338px] flex-col items-center justify-center gap-10 px-6 py-10 text-center md:min-h-[520px] lg:min-h-full">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-[54px] w-[53px] items-center justify-center rounded-xl bg-[#0D7A4A]/50">
                <Car className="h-6 w-6 text-[#E6F6F4]" />
              </span>
              <h2 className="font-sans text-[32px] font-bold leading-10 text-white">
                Start selling today
              </h2>
              <p className="font-body text-sm leading-5 text-[#E8E8E8]">
                Complete these quick steps to get your vehicle in front of
                verified buyers
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              {STEPS.map((step, index) => (
                <StepPill
                  key={step.id}
                  number={index + 1}
                  label={step.label}
                  active={index === activeIndex}
                  done={index < activeIndex}
                />
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-full items-center py-2 lg:py-8">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </div>
  );
}
