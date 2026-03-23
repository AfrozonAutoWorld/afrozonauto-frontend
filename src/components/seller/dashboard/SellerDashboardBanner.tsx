'use client';

import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type SellerDashboardBannerProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function SellerDashboardBanner({
  searchTerm,
  onSearchTermChange,
}: SellerDashboardBannerProps) {
  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(90deg,#0A3C34_0%,#085030_100%)]"
      aria-label="Seller dashboard search"
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 font-body text-xs text-[#E8E8E8] sm:text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            HOME
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#E8E8E8]" aria-hidden />
          <Link
            href="/seller/landing"
            className="hover:text-white transition-colors"
          >
            SELL YOUR CAR
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#E8E8E8]" aria-hidden />
          <span className="font-semibold text-[#E6F6F4]">SELLER DASHBOARD</span>
        </nav>

        <div className="relative w-full max-w-3xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B8B8B8]"
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Search live cars..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-4 font-jakarta text-sm text-[#111827] placeholder:text-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#2CE69B]/40"
            aria-label="Search seller listings"
          />
        </div>
      </div>
    </section>
  );
}
