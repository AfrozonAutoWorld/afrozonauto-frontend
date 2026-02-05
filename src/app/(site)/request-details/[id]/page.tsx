'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RequestDetail } from '@/views/RequestDetails';

export default function RequestDetailsPage() {
  return (
    <ProtectedRoute>
      <RequestDetail />
    </ProtectedRoute>
  );
}
