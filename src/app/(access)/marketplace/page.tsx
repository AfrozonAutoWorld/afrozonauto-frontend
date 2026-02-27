'use client';

import { Suspense } from 'react';
import { VehicleListing } from '@/views/VehicleListing';

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <VehicleListing />
    </Suspense>
  );
}
