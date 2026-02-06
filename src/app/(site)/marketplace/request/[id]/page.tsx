'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { BuyerRequestVehicle } from '@/views/BuyerRequestVehicle';

export default function RequestVehiclePage() {
  const params = useParams();
  return (
    <ProtectedRoute>
      <BuyerRequestVehicle vehicleId={params.id as string} />
    </ProtectedRoute>
  );
}
