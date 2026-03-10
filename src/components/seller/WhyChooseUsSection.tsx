import type { LucideIcon } from 'lucide-react';
import {
  HandCoins,
  LockKeyhole,
  Zap,
  HeartHandshake,
} from 'lucide-react';

const FEATURE_CARDS: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: 'Best Price',
    description:
      'US-to-Nigeria demand means your car is worth more to our buyers than locally.',
    Icon: HandCoins,
  },
  {
    title: 'Fully Secure',
    description:
      'Escrow-protected payments. No cash risk, no wire fraud, no scams.',
    Icon: LockKeyhole,
  },
  {
    title: 'Fast Turnaround',
    description:
      'Most sellers receive an offer within 72 hours of submitting their vehicle.',
    Icon: Zap,
  },
  {
    title: "We'll Handle It All",
    description:
      'Title transfer, export paperwork, shipping logistics — all on our side.',
    Icon: HeartHandshake,
  },
];

const STAT_PANELS: Array<{ value: string; description: string }> = [
  {
    value: '94%',
    description:
      'of sellers say they got a better price than private sale',
  },
  {
    value: '₦0',
    description: 'fees to list — we only earn when your car sells',
  },
  {
    value: '48hr',
    description: 'maximum wait time for your first offer',
  },
];

function FeatureCard({
  title,
  description,
  Icon,
}: Readonly<{
  title: string;
  description: string;
  Icon: LucideIcon;
}>) {
  return (
    <article className="flex flex-col gap-12 px-6 py-8 w-full bg-white rounded-2xl">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#003B33]">
        <Icon
          className="h-6 w-6 text-[#E6F6F4]"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-0">
        <h3 className="font-sans text-lg font-semibold leading-7 text-[#484848]">
          {title}
        </h3>
        <p className="font-body text-sm font-normal leading-5 text-[#546881]">
          {description}
        </p>
      </div>
    </article>
  );
}

export function WhyChooseUsSection() {
  return (
    <section
      className="w-full bg-[#F9FAFB] py-20"
      aria-labelledby="why-choose-us-heading"
    >
      <div className="flex flex-col gap-5 px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2
            id="why-choose-us-heading"
            className="font-sans text-[32px] font-bold leading-10 text-[#1D242D]"
          >
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="font-body text-base font-normal leading-6 text-[#64748B]">
            We take the complexity out of selling internationally, so you focus
            on getting paid.
          </p>
        </div>

        {/* Cards row: left column | center green card | right column */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column: 2 cards */}
          <div className="flex w-full flex-col gap-[23px]">
            {FEATURE_CARDS.slice(0, 2).map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>

          {/* Center: green stats card */}
          <div className="relative flex w-full flex-1 flex-col justify-center overflow-hidden rounded-3xl px-12 py-12 shadow-[0px_25px_50px_-12px_rgba(0,166,126,0.2)] isolation-isolate bg-[linear-gradient(90deg,#00A67E_0%,#059669_100%)]">
            {/* Optional: faint car outline in background */}
            <div
              className="pointer-events-none absolute -right-32 -bottom-40 z-0 h-[320px] w-[320px] opacity-20"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="h-full w-full rotate-[-7deg] text-white"
              >
                <path d="M5 17h14v-5H5v5Zm2-3h2v2H7v-2Zm8 0h2v2h-2v-2ZM4 12l2-4h12l2 4" />
                <circle cx="7.5" cy="17" r="1.5" />
                <circle cx="16.5" cy="17" r="1.5" />
              </svg>
            </div>
            <div className="flex relative z-10 flex-col gap-4">
              {STAT_PANELS.map((panel) => (
                <div
                  key={panel.value}
                  className="flex flex-col gap-1 rounded-lg bg-[rgba(51,124,87,0.8)] px-6 py-4"
                >
                  <span className="font-sans text-[32px] font-bold leading-10 text-white">
                    {panel.value}
                  </span>
                  <p className="text-base font-normal leading-6 text-white font-body">
                    {panel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: 2 cards */}
          <div className="flex w-full flex-col gap-[23px]">
            {FEATURE_CARDS.slice(2, 4).map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
