import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeroBreadcrumb } from '@/components/home';
import { HeroHeadline } from '../home/HeroHeadline';
import { Button } from '../ui/button';

export interface HeroSectionProps {
  breadcrumbs?: ReactNode;
  headerText?: string;
  descriptionText?: string;
  shouldShowSearch?: boolean;
  shouldShowFilters?: boolean;
  /** Override min-height classes, e.g. 'min-h-[320px] sm:min-h-[360px] lg:min-h-[380px]' */
  minHeightClass?: string;
  /** Optional custom search content for non-home pages. */
  searchSlot?: ReactNode;
  /** Optional custom filters row. */
  filtersSlot?: ReactNode;
  showButton?: boolean;
}

export function HeroSection({
  breadcrumbs,
  headerText,
  descriptionText,
  shouldShowSearch = true,
  shouldShowFilters = true,
  minHeightClass,
  searchSlot,
  filtersSlot,
  showButton = false,
}: HeroSectionProps) {
  const minHeight =
    minHeightClass ?? 'min-h-[400px] sm:min-h-[500px] lg:min-h-[586px]';
  const showSearch = searchSlot != null ? true : shouldShowSearch;
  const showFilters = filtersSlot != null ? true : shouldShowFilters;

  return (
    <section
      className={`relative w-full ${minHeight} bg-[linear-gradient(90deg,#0A3C34_0%,#085030_100%)]`}
      aria-label="Browse vehicles"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="flex relative flex-col gap-8 items-start px-4 pt-12 pb-12 mx-auto max-w-7xl sm:gap-12 sm:px-6 sm:pt-20 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="flex flex-col items-start gap-[17px] w-full ">
          {breadcrumbs ?? <HeroBreadcrumb />}
          {headerText != null && descriptionText != null && <HeroHeadline headerText={headerText} descriptionText={descriptionText} />}
        </div>

        {showButton && (
          <div className="flex flex-col gap-6 items-start w-full">
            <Link href="/seller/register">
              <Button
                className="flex flex-row justify-end items-center py-[18px] px-8 gap-2.5 h-16 bg-[#0D7A4A] rounded-lg font-body font-medium text-lg leading-7 text-white hover:bg-[#0a6540]"
              >
                Become a seller — Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
