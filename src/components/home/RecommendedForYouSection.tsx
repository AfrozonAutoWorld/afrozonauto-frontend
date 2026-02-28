'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle } from '@/types';
import { FeaturedCarCard } from './FeaturedCarCard';
import { VehicleCardSkeleton } from '@/components/vehicles/VehicleCardSkeleton';
import { calculateLandedCost } from '@/lib/pricingCalculator';

export interface RecommendedVehicle {
  vehicle: Vehicle;
  reason?: string;
}

export interface RecommendedForYouSectionProps {
  vehicles: RecommendedVehicle[] | Vehicle[];
  isLoading?: boolean;
  defaultReason?: string;
  showLandedPrice?: boolean;
}

const CARD_WIDTH = 400;
const GAP = 24;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;
const DEFAULT_REASON = 'Near-new, under 15k miles, exceptional condition at this price';

export function RecommendedForYouSection({
  vehicles,
  isLoading = false,
  defaultReason = DEFAULT_REASON,
  showLandedPrice = true,
}: RecommendedForYouSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const normalized = vehicles.map((v) =>
    'vehicle' in v ? v : { vehicle: v, reason: defaultReason }
  );
  const displayList = normalized.slice(0, 12);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const update = () => {
      const cw = content.getBoundingClientRect().width;
      const tw = container.clientWidth;
      setMaxScroll(Math.max(0, cw - tw));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, [displayList.length]);

  const scroll = (direction: 'left' | 'right') => {
    const current = x.get();
    const delta = direction === 'left' ? SCROLL_AMOUNT : -SCROLL_AMOUNT;
    const next = Math.max(-maxScroll, Math.min(0, current + delta));
    animate(x, next, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <section className="py-20 bg-[#F9FAFB]" aria-labelledby="recommended-for-you-heading">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="recommended-for-you-heading"
              className="font-sans font-bold text-2xl sm:text-3xl text-[#0F172A]"
            >
              Recommended for you
            </h2>
            <p className="mt-1 font-body text-sm sm:text-base text-[#64748B]">
              Hand-picked vehicles that match your preferences and budget
            </p>
          </div>
          <Link
            href="/marketplace"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 font-body font-medium text-[#0D7A4A] hover:text-[#0C623C] transition-colors shrink-0"
          >
            View all vehicles
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : displayList.length === 0 ? null : (
          <>
            <div ref={containerRef} className="overflow-hidden -mx-1">
              <motion.div
                ref={contentRef}
                className="flex flex-row gap-6 w-max cursor-grab active:cursor-grabbing"
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -maxScroll, right: 0 }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                whileTap={{ cursor: 'grabbing' }}
              >
                {displayList.map(({ vehicle, reason }) => {
                  const landed = showLandedPrice
                    ? calculateLandedCost(
                        vehicle.priceUsd ?? 0,
                        vehicle.vehicleType ?? 'SUV',
                        'RORO'
                      ).breakdown.total_ngn
                    : undefined;
                  return (
                    <div
                      key={vehicle.id}
                      className="shrink-0 w-[min(400px,85vw)] max-w-[400px]"
                    >
                      <FeaturedCarCard
                        vehicle={vehicle}
                        landedPriceNgn={landed}
                        badge="recommended"
                        recommendationReason={reason ?? defaultReason}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8E8E8] bg-white text-[#546881] hover:bg-gray-50 hover:border-[#ccc] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#E8E8E8] bg-white text-[#546881] hover:bg-gray-50 hover:border-[#ccc] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
