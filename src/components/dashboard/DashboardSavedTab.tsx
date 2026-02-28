'use client';

import Link from 'next/link';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import { useSavedVehiclesApi, useRemoveSavedVehicle } from '@/hooks/useSavedVehiclesApi';
import { FeaturedCarCard } from '@/components/home/FeaturedCarCard';
import { VehicleCardSkeleton } from '@/components/vehicles/VehicleCardSkeleton';
import { calculateLandedCost } from '@/lib/pricingCalculator';
export function DashboardSavedTab() {
  const { items, isLoading } = useSavedVehiclesApi();
  const removeSaved = useRemoveSavedVehicle();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved vehicles</h3>
        <p className="text-gray-600 mb-4">
          Save vehicles you&apos;re interested in to view them later.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Browse Vehicles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ vehicle, savedAt }) => {
          const landed = calculateLandedCost(
            vehicle.priceUsd ?? 0,
            vehicle.vehicleType ?? 'SUV',
            'RORO'
          ).breakdown.total_ngn;
          return (
            <div key={vehicle.id} className="relative group">
              <FeaturedCarCard
                vehicle={vehicle}
                landedPriceNgn={landed}
                badge="verified"
              />
              <button
                type="button"
                onClick={() => removeSaved.mutate(vehicle.id)}
                disabled={removeSaved.isPending}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                aria-label="Remove from saved"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-500">
        {items.length} saved vehicle{items.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
