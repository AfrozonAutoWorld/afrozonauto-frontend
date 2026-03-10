import type { ReactNode } from 'react';
import { HeroSellBreadcrumb } from './HeroSellBreadcrumb';
import { HeroSellHeadline } from './HeroSellHeadline';

export interface HeroSellSectionProps {
  breadcrumbs?: ReactNode;
  headerText?: string;
  descriptionText?: string;
}

export function HeroSellSection({
  breadcrumbs,
  headerText,
  descriptionText,
}: Readonly<HeroSellSectionProps>) {
  return (
    <section className="relative w-full" aria-label="Page header">
      <div className="flex flex-col items-start gap-[17px] w-full px-4 pt-12 pb-12 mx-auto max-w-7xl sm:px-6 sm:pt-16 sm:pb-16 lg:px-8">
        {breadcrumbs ?? <HeroSellBreadcrumb />}
        {headerText != null && descriptionText != null && (
          <HeroSellHeadline headerText={headerText} descriptionText={descriptionText} />
        )}
      </div>
    </section>
  );
}
