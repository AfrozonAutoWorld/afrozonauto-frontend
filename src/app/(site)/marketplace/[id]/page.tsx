'use client';

import { useParams } from 'next/navigation';
import { MarketplaceVehicleDetail } from '@/views/MarketplaceVehicleDetail';

export default function MarketplaceVehicleDetailPage() {
  const params = useParams();
  return <MarketplaceVehicleDetail vehicleId={params.id as string} />;
}
