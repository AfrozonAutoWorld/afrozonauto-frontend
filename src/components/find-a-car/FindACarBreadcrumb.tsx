import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function FindACarBreadcrumb() {
  return (
    <nav
      className="flex isolate flex-row gap-6 items-center font-body"
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="flex-none order-0 shrink-0 text-[14px] leading-5 font-normal text-[#969696] hover:text-[#1A1A1A] transition-colors"
      >
        HOME
      </Link>
      <ChevronRight
        className="w-4 h-4 shrink-0 order-1 text-[#484848]"
        aria-hidden
      />
      <span className="flex-none order-2 shrink-0 text-[14px] leading-5 font-semibold text-[#484848]">
        FIND A CAR
      </span>
    </nav>
  );
}
