'use client';

import Link from 'next/link';
import { MapPin, Fuel, Gauge, Car } from 'lucide-react';
import type { MarketplaceVehicle } from '@/lib/marketplace/types';

export function MarketplaceVehicleCard({ vehicle }: { vehicle: MarketplaceVehicle }) {
  const primaryImage = vehicle.images?.find((i) => i.is_primary)?.url || vehicle.images?.[0]?.url;

  return (
    <Link
      href={`/marketplace/${vehicle.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Marketplace
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {vehicle.mileage > 0 && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {vehicle.mileage.toLocaleString()} mi
            </span>
          )}
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {vehicle.fuel_type}
          </span>
          {(vehicle.location_city || vehicle.location_state) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {vehicle.location_state || vehicle.location_city}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-bold text-emerald-600">
            ${Number(vehicle.price_usd).toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">{vehicle.transmission}</span>
        </div>
      </div>
    </Link>
  );
}
