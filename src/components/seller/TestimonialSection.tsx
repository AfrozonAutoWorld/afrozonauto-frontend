'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS: Array<{
  id: string;
  quote: string;
  authorName: string;
  soldDetail: string;
  avatar?: string;
}> = [
  {
    id: 'chidi-1',
    quote:
      "I listed my Highlander on a Friday, had an offer by Monday, and the money was in my account by Thursday. Couldn't believe how smooth it was.",
    authorName: 'Chidi Umeano',
    soldDetail: 'Sold: 2019 Honda CR-V · Lagos',
  },
  {
    id: 'chidi-2',
    quote:
      "I listed my Highlander on a Friday, had an offer by Monday, and the money was in my account by Thursday. Couldn't believe how smooth it was.",
    authorName: 'Chidi Umeano',
    soldDetail: 'Sold: 2019 Honda CR-V · Lagos',
  },
  {
    id: 'chidi-3',
    quote:
      "I listed my Highlander on a Friday, had an offer by Monday, and the money was in my account by Thursday. Couldn't believe how smooth it was.",
    authorName: 'Chidi Umeano',
    soldDetail: 'Sold: 2019 Honda CR-V · Lagos',
  },
  {
    id: 'amara',
    quote:
      "Fast, transparent, and I got more than I would selling locally. Will recommend to anyone selling from the US.",
    authorName: 'Amara Okonkwo',
    soldDetail: 'Sold: 2020 Toyota Camry · Abuja',
  },
  {
    id: 'tunde',
    quote:
      "The escrow gave me peace of mind. Money was released the same day I handed over the keys.",
    authorName: 'Tunde Adeyemi',
    soldDetail: 'Sold: 2018 Honda Accord · Port Harcourt',
  },
  {
    id: 'nneka',
    quote:
      "From listing to payment in under two weeks. The team kept me updated at every step. Highly recommend.",
    authorName: 'Nneka Eze',
    soldDetail: 'Sold: 2021 Toyota RAV4 · Enugu',
  },
  {
    id: 'obi',
    quote:
      "I was skeptical at first but the process was seamless. Got a fair price and the buyer was serious.",
    authorName: 'Obi Nwosu',
    soldDetail: 'Sold: 2017 Lexus RX 350 · Onitsha',
  },
  {
    id: 'chioma',
    quote:
      "No more dealing with tire-kickers. Afrozon matched me with a verified buyer and handled everything.",
    authorName: 'Chioma Okoli',
    soldDetail: 'Sold: 2019 Honda Pilot · Lagos',
  },
  {
    id: 'ade',
    quote:
      "Best decision I made. Sold my car from Texas and had the money in my Nigerian account in days.",
    authorName: 'Ade Bakare',
    soldDetail: 'Sold: 2020 Hyundai Tucson · Ibadan',
  },
  {
    id: 'funke',
    quote:
      "The valuation was spot-on and the offer came quickly. Whole experience was stress-free.",
    authorName: 'Funke Akindele',
    soldDetail: 'Sold: 2018 Mazda CX-5 · Abeokuta',
  },
  {
    id: 'emeka',
    quote:
      "Escrow protected both of us. I got paid, buyer got the car. No drama, no delays.",
    authorName: 'Emeka Okafor',
    soldDetail: 'Sold: 2019 Nissan Pathfinder · Owerri',
  },
];

const GAP = 32;
const STARS = 5;

function TestimonialCard({
  quote,
  authorName,
  soldDetail,
  avatar,
  cardRef,
}: Readonly<{
  quote: string;
  authorName: string;
  soldDetail: string;
  avatar?: string;
  cardRef?: React.RefObject<HTMLElement | null>;
}>) {
  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      className="box-border flex w-[280px] shrink-0 flex-col gap-[15px] rounded-2xl border border-[#47586E] bg-[#1B2A38] p-6 sm:w-[320px] md:w-[380px]"
      aria-label={`Testimonial by ${authorName}`}
    >
      <div className="flex flex-row items-center gap-0.5">
        {Array.from({ length: STARS }, (_, i) => i).map((starIndex) => (
          <Star
            key={starIndex}
            className="h-5 w-5 shrink-0 text-[#FFB703]"
            fill="#FFB703"
            stroke="#FFB703"
            aria-hidden
          />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <blockquote className="font-body text-base font-normal italic leading-6 text-[#E8E8E8]">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="flex flex-row items-start gap-1.5">
          <div className="flex overflow-hidden justify-center items-center w-10 h-10 text-sm font-medium text-amber-900 bg-amber-200 rounded-full shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="object-cover w-full h-full"
              />
            ) : (
              <span aria-hidden>
                {authorName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-base font-semibold leading-6 text-white font-body">
              {authorName}
            </span>
            <span className="font-body text-sm font-normal leading-5 text-[#B8B8B8]">
              {soldDetail}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const update = () => {
      const cw = content.scrollWidth;
      const tw = container.clientWidth;
      setMaxScroll(Math.max(0, cw - tw));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const cardEl = firstCardRef.current;
    const cardWidth = cardEl ? cardEl.getBoundingClientRect().width : 312;
    const scrollBy = cardWidth + GAP;
    const current = x.get();
    const delta = direction === 'left' ? scrollBy : -scrollBy;
    const next = Math.max(-maxScroll, Math.min(0, current + delta));
    animate(x, next, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#1D242D] py-20"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative blur */}
      <div
        className="pointer-events-none absolute left-[83.33%] right-[-16.67%] top-[-310px] bottom-[310px] rounded-full bg-[rgba(0,166,126,0.05)] blur-[32px]"
        aria-hidden
      />

      <div className="flex relative flex-col gap-14 justify-center items-start px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        {/* Header + nav */}
        <div className="flex flex-row flex-wrap gap-4 justify-between items-end mx-auto w-full">
          <div className="flex flex-col flex-1 gap-4 min-w-0">
            <h2
              id="testimonials-heading"
              className="font-sans text-[32px] font-bold leading-10 text-white"
            >
              Real sellers. Real results.
            </h2>
            <p className="font-body text-base font-normal leading-6 text-[#B2BBC6]">
              Hear from people who&apos;ve already sold through Afrozon.
            </p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#969696] transition-colors hover:bg-gray-100"
              aria-label="Scroll testimonials left"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#969696] transition-colors hover:bg-gray-100"
              aria-label="Scroll testimonials right"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="overflow-hidden relative w-full min-w-0"
        >
          {/* Divider line (design spec) */}
          <div
            className="absolute left-0 right-0 top-12 z-0 h-0.5 bg-[#1E293B]"
            aria-hidden
          />
          <motion.div
            ref={contentRef}
            className="flex relative z-10 flex-row gap-8 py-2 w-max cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -maxScroll, right: 0 }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {TESTIMONIALS.map((t, index) => {
              const { id, ...cardProps } = t;
              return (
                <TestimonialCard
                  key={id}
                  {...cardProps}
                  cardRef={index === 0 ? firstCardRef : undefined}
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
