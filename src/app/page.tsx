'use client';

import { Suspense } from 'react';
import { Home } from '@/views/Home';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
