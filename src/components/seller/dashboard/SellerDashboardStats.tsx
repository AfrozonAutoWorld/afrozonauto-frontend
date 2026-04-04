'use client';

import type { ComponentType } from 'react';
import { Wallet, Tag, Handshake, Hourglass } from 'lucide-react';

type SellerDashboardStatsProps = {
  totalEarningsUsd: number;
  activeListings: number;
  totalCarsSold: number;
  pendingReview: number;
};

type StatCard = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function SellerDashboardStats({
  totalEarningsUsd,
  activeListings,
  totalCarsSold,
  pendingReview,
}: SellerDashboardStatsProps) {
  const cards: StatCard[] = [
    {
      label: 'Total Earned',
      value: formatCurrency(totalEarningsUsd),
      icon: Wallet,
    },
    {
      label: 'Active Listings',
      value: String(activeListings),
      icon: Tag,
    },
    {
      label: 'Total Cars Sold',
      value: String(totalCarsSold),
      icon: Handshake,
    },
    {
      label: 'Pending Review',
      value: String(pendingReview),
      icon: Hourglass,
    },
  ];

  return (
    <section
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Seller KPI cards"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="flex min-h-[9.5rem] flex-col justify-between rounded-lg border-[1.5px] border-[#E5E7EB] bg-white p-3 sm:p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="font-sans text-3xl font-bold leading-10 text-[#111827]">
                {card.value}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded border border-[#E5E7EB]">
              <card.icon className="h-5 w-5 text-[#374151]" />
            </span>
          </div>
          <p className="font-jakarta text-sm font-medium leading-5 text-[#111827]">
            {card.label}
          </p>
        </article>
      ))}
    </section>
  );
}
