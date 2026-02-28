'use client';

import Link from 'next/link';
import { Search, Car } from 'lucide-react';

export function FindMyCarBanner() {
  return (
    <section className="py-16 bg-[#F9FAFB]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 rounded-3xl bg-[linear-gradient(90deg,#00A67E_0%,#059669_100%)] shadow-[0px_25px_50px_-12px_rgba(0,166,126,0.2)]">
          {/* Large car illustration background */}
          <div className="pointer-events-none absolute -right-40 -bottom-40 w-[420px] h-[420px] rotate-[-6.87deg] opacity-30">
            <div className="flex items-center justify-center w-full h-full rounded-[48px] bg-white/10">
              <Car className="w-80 h-80 text-white/50" aria-hidden />
            </div>
          </div>

          {/* Content */}
          <div className="flex relative flex-col gap-6 max-w-2xl md:max-w-3xl">
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-[40px] lg:leading-[52px] font-bold text-white">
              Can&apos;t find the car you want?
            </h2>
            <p className="text-base leading-relaxed font-body sm:text-lg text-white/90">
              Our expert broker service can source any vehicle from major US auction houses and
              private dealerships specifically for you. Tell us what you need, and we&apos;ll find it.
            </p>

            <Link
              href="/find-a-car"
              className="inline-flex items-center gap-2 px-8 py-4 mt-2 text-base sm:text-lg font-medium text-white bg-[#003B33] rounded-lg shadow-sm hover:bg-[#012821] transition-colors w-fit"
            >
              <span>Find my car</span>
              <Search className="w-5 h-5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

