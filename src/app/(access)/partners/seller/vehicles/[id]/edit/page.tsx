'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { SellerVehicleForm } from '@/views/SellerVehicleForm';

export default function EditVehiclePage() {
  const params = useParams();
  return (
    <ProtectedRoute>
      <SellerVehicleForm vehicleId={params.id as string} />
    </ProtectedRoute>
  );
}
