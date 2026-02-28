'use client';

import { Suspense } from 'react';
import { FindACar } from '@/views/FindACar';

export default function FindACarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <FindACar />
    </Suspense>
  );
}
