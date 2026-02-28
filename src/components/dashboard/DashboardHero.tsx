'use client';

import Link from 'next/link';

export interface DashboardHeroProps {
  userName: string;
}

export function DashboardHero({ userName }: DashboardHeroProps) {
  return (
    <section
      className="relative w-full min-h-[200px] sm:min-h-[240px] bg-gradient-to-r from-gray-900 to-emerald-900 overflow-hidden"
      aria-label="Dashboard welcome"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-gray-300 mt-1 text-sm sm:text-base">
            Manage your vehicle imports
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center shrink-0 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500 transition-colors"
        >
          Browse Vehicles
        </Link>
      </div>
    </section>
  );
}
