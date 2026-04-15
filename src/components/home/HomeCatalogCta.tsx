'use client';

import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';

/**
 * Prominent link to the full marketplace (GET /vehicles), distinct from curated home rails.
 */
export function HomeCatalogCta() {
  return (
    <div className="border-b border-slate-200/90 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="self-start text-sm text-slate-600 font-body sm:self-auto">
          Search filters, sort, and browse our full inventory — not only the curated picks below.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-[#0D7A4A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0C623C] sm:self-auto"
        >
          <LayoutGrid className="h-4 w-4" aria-hidden />
          View all vehicles
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
