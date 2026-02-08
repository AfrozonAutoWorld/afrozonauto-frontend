'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SellerDashboard } from '@/views/SellerDashboard';

export default function SellerPage() {
  return (
    <ProtectedRoute>
      <SellerDashboard />
    </ProtectedRoute>
  );
}
