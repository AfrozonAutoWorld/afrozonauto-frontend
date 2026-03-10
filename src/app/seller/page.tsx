'use client';

import { Suspense } from 'react';
import { SellerDashboard } from '@/views/SellerDashboard';

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<SellerDashboardSkeleton />}>
      <SellerDashboard />
    </Suspense>
  );
}

function SellerDashboardSkeleton() {
  return (
    <div className="min-h-[60vh] px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
