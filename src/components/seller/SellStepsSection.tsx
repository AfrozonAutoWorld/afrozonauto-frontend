'use client';

import type { LucideIcon } from 'lucide-react';
import {
  SquarePen,
  Search,
  Shield,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const SELL_STEPS: Array<{
  step: number;
  title: string;
  description: string;
  timeTag: string;
  Icon: LucideIcon;
}> = [
  {
    step: 1,
    title: 'List your vehicle',
    description:
      'Share basic details, photos and asking price. (or let us value it)',
    timeTag: '5 min',
    Icon: SquarePen,
  },
  {
    step: 2,
    title: 'We review',
    description:
      'Our team verifies your listing and matches it with active buyers.',
    timeTag: '24-48 hrs',
    Icon: Search,
  },
  {
    step: 3,
    title: 'Receive an offer',
    description:
      'Get a verified offer from a serious buyer. Accept or negotiate freely.',
    timeTag: '1-3 days',
    Icon: Shield,
  },
  {
    step: 4,
    title: 'Escrow & Handover',
    description:
      'Buyer deposits into escrow. You hand over the vehicle once funds are confirmed.',
    timeTag: 'Same day',
    Icon: CreditCard,
  },
  {
    step: 5,
    title: 'Get Paid',
    description:
      'Funds released to you immediately. Wire, Zelle, or check — your choice.',
    timeTag: '1-2 days',
    Icon: DollarSign,
  },
];

export function SellStepsSection() {
  const router = useRouter();
  return (
    <section
      className="py-4 w-full bg-white md:py-10"
      aria-labelledby="sell-steps-heading"
    >
      <div className="flex flex-col px-4 py-6 mx-auto w-full max-w-7xl md:pt-12 md:pb-12 sm:gap-12 sm:px-6 sm:pt-20 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-24">
        {/* Header: title, subtitle, CTA */}
        <div className="flex flex-col gap-6 justify-between items-start py-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <h2
              id="sell-steps-heading"
              className="font-sans text-[32px] font-bold leading-10 text-[#1D242D]"
            >
              Sell in 5 Simple Steps
            </h2>
            <p className="font-body text-base font-normal leading-6 text-[#64748B]">
              From listing to payment — we guide you every step of the way.
            </p>
          </div>
          <Button
            className="flex h-16 shrink-0 items-center justify-center gap-2.5 rounded-lg bg-[#0D7A4A] py-[18px] px-8 font-body text-lg font-medium leading-7 text-white hover:bg-[#0a6540]"
            onClick={() => router.push('/seller/sell-your-car')}
          >
            Start Listing Now
          </Button>
        </div>

        {/* Steps row with connecting line */}
        <div className="flex relative flex-col gap-10 justify-center isolation-isolate sm:flex-row sm:flex-wrap sm:gap-8">
          {/* Horizontal divider through icon centers - desktop only */}
          <div
            className="hidden sm:block absolute left-[10%] right-[10%] top-[35px] z-0 h-0.5 bg-[#E5FCF0] sm:left-[15%] sm:right-[15%]"
            aria-hidden
          />

          {SELL_STEPS.map(({ step, title, description, timeTag, Icon }) => (
            <div
              key={step}
              className="group relative z-10 flex w-full min-w-0 flex-1 flex-col items-center gap-4 text-center transition-transform duration-200 hover:-translate-y-1 sm:min-w-[180px] sm:w-auto"
            >
              {/* Icon circle + step badge */}
              <div className="flex flex-col gap-2 items-center w-full">
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#E5FCF0] bg-white text-[#0D7A4A] transition-colors duration-200 group-hover:bg-[#0D7A4A] group-hover:text-white group-hover:border-[#0D7A4A]"
                >
                  <Icon
                    className="h-[17.48px] w-[17.48px] shrink-0 text-current"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#0D7A4A] font-body text-[10px] font-normal leading-3 text-white"
                    aria-hidden
                  >
                    {step}
                  </span>
                </div>
              </div>

              {/* Title + description + time tag */}
              <div className="flex flex-col gap-2 items-center px-0">
                <h3 className="w-full text-center font-sans text-lg font-semibold leading-7 text-[#1A1A1A]">
                  {title}
                </h3>
                <p className="text-center font-body text-sm font-normal leading-5 text-[#909DAD]">
                  {description}
                </p>
              </div>
              <div className="flex justify-center px-4 w-full">
                <span className="inline-flex items-center rounded-lg bg-[#E6F6F4] px-2 py-0.5 font-body text-[10px] font-normal leading-3 text-[#666666]">
                  {timeTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
