'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Car,
  MapPin,
  Fuel,
  Gauge,
  Settings,
  Palette,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMarketplaceVehicle } from '@/hooks/useMarketplace';
import { useAuthStore } from '@/lib/authStore';

interface Props {
  vehicleId: string;
}

export function MarketplaceVehicleDetail({ vehicleId }: Props) {
  const router = useRouter();
  const { data: vehicle, isLoading, error } = useMarketplaceVehicle(vehicleId);
  const { isAuthenticated } = useAuthStore();
  const [currentImage, setCurrentImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Not Found</h2>
        <p className="text-gray-500 mb-6">This vehicle may no longer be available.</p>
        <Link href="/vehicles" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Browse Vehicles
        </Link>
      </div>
    );
  }

  const images = vehicle.images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const displayTitle = vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Gauge, label: 'Mileage', value: vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A' },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuel_type },
    { icon: Car, label: 'Drivetrain', value: vehicle.drivetrain },
    { icon: Settings, label: 'Engine', value: vehicle.engine_size || 'N/A' },
    { icon: Palette, label: 'Exterior', value: vehicle.exterior_color || 'N/A' },
    { icon: Palette, label: 'Interior', value: vehicle.interior_color || 'N/A' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Vehicles
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-gray-100 rounded-2xl overflow-hidden relative aspect-[16/10]">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]?.url}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentImage ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImage(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === currentImage ? 'border-emerald-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {vehicle.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}

          {vehicle.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              Marketplace Listing
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
            {(vehicle.location_city || vehicle.location_state) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                {[vehicle.location_city, vehicle.location_state].filter(Boolean).join(', ')}
              </div>
            )}
            <p className="text-3xl font-bold text-emerald-600 mb-6">
              ${Number(vehicle.price_usd).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <s.icon className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">{s.label}: </span>
                    <span className="font-medium text-gray-900">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {vehicle.vin && (
              <div className="text-sm text-gray-500 mb-6 bg-gray-50 rounded-lg px-3 py-2">
                VIN: <span className="font-mono text-gray-700">{vehicle.vin}</span>
              </div>
            )}

            <div className="space-y-3">
              {isAuthenticated ? (
                <Link
                  href={`/marketplace/request/${vehicleId}`}
                  className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
                >
                  Request This Vehicle
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
                >
                  Sign In to Request
                </Link>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>All purchases are verified and secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
