'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminVehicleReview } from '@/views/AdminVehicleReview';

export default function AdminVehiclesPage() {
  return (
    <ProtectedRoute>
      <AdminVehicleReview />
    </ProtectedRoute>
  );
}
