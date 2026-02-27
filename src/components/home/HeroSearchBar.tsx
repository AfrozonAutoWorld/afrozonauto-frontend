'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

export function HeroSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col items-stretch p-2 isolate w-full max-w-[788px] min-h-[72px] sm:h-[76px] bg-white rounded-2xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-h-0">
        <div className="relative flex flex-col flex-1 min-w-0 isolate">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#B8B8B8] pointer-events-none z-10"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by VIN, make, model, body style or fuel (e.g. '10ARJYBS7RC154562', 'Honda Civic', 'SUV', 'Electric')"
            className="flex-1 w-full min-w-0 pl-12 pr-4 py-[18px] bg-white rounded-xl font-body text-[16px] leading-6 text-gray-900 placeholder:text-[#B8B8B8] border-0 focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/30"
            aria-label="Search vehicles"
          />
        </div>
        <button
          type="submit"
          className="flex flex-row justify-center items-center shrink-0 gap-2 px-6 py-3 sm:py-4 h-12 sm:h-14 bg-[#0D7A4A] rounded-lg font-body font-medium text-[16px] leading-[21px] text-white hover:bg-[#0C623C] transition-colors"
        >
          Search
          <ArrowRight className="w-6 h-6 text-white" aria-hidden />
        </button>
      </div>
    </form>
  );
}
