'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PopularMakeCard } from './PopularMakeCard';

export interface MakeItem {
  name: string;
  vehicleCount: number;
  logo?: string | React.ReactNode;
}

const DEFAULT_MAKES: MakeItem[] = [
  { name: 'Toyota', vehicleCount: 142 },
  { name: 'Lexus', vehicleCount: 87 },
  { name: 'Honda', vehicleCount: 98 },
  { name: 'Mercedes', vehicleCount: 54 },
  { name: 'BMW', vehicleCount: 41 },
  { name: 'Ford', vehicleCount: 89 },
];

export interface PopularMakesSectionProps {
  /** Override default makes. If not provided, uses default list. */
  makes?: MakeItem[];
}

export function PopularMakesSection({ makes = DEFAULT_MAKES }: PopularMakesSectionProps) {
  return (
    <section className="py-16 bg-[#F8FAFC]" aria-labelledby="popular-makes-heading">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2
              id="popular-makes-heading"
              className="font-sans font-bold text-2xl sm:text-3xl text-[#0F172A]"
            >
              Popular Makes
            </h2>
            <p className="mt-1 font-body text-sm sm:text-base text-[#64748B]">
              Tap a brand to see all available vehicles
            </p>
          </div>
          <Link
            href="/marketplace"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 font-body font-medium text-[#0D7A4A] hover:text-[#0C623C] transition-colors shrink-0"
          >
            All makes
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
        <motion.div
          className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 scroll-smooth scrollbar-hide"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.1 },
            },
            hidden: {},
          }}
        >
          {makes.map((make) => (
            <motion.div
              key={make.name}
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="shrink-0"
            >
              <PopularMakeCard
                name={make.name}
                vehicleCount={make.vehicleCount}
                logo={make.logo}
                href={`/marketplace?make=${encodeURIComponent(make.name)}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
