'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

export function HeroSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams?.get('q') ?? '';
  const [query, setQuery] = useState(qFromUrl);

  useEffect(() => {
    setQuery(qFromUrl);
  }, [qFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams?.toString() ?? '');
    const trimmed = query.trim();
    if (trimmed) p.set('q', trimmed);
    else p.delete('q');
    const qs = p.toString();
    router.push(`/marketplace${qs ? `?${qs}` : ''}`);
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
            placeholder="Search by VIN, make, or model (e.g. VIN, Toyota, Civic)"
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
