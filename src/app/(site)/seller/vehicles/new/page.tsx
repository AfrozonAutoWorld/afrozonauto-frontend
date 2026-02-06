'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SellerVehicleForm } from '@/views/SellerVehicleForm';

export default function NewVehiclePage() {
  return (
    <ProtectedRoute>
      <SellerVehicleForm />
    </ProtectedRoute>
  );
}
