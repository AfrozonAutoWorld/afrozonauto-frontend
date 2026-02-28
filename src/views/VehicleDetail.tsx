'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MapPin,
  Car,
  Calendar,
  Fuel,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { GradientPageBar } from '@/components/ui/GradientPageBar';
import { PriceCalculator } from '../components/vehicles/PriceCalculator';
import { formatCurrency } from '../lib/pricingCalculator';
import { useVehicle } from '../hooks/useVehicles';
import { useSession } from 'next-auth/react';
import { useCostBreakdown } from '@/hooks/useOrderQueries';
import { useSavedVehiclesApi, useToggleSaved } from '@/hooks/useSavedVehiclesApi';
import { useCreateOrder } from '@/hooks/useOrderMutation';
import type { Vehicle } from '../types';

type ShippingMethod = 'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS';

interface VehicleSpec {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | undefined;
}

interface VehicleImageGalleryProps {
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  alt: string;
}

function VehicleImageGallery({
  images,
  currentIndex,
  onNext,
  onPrev,
  onSelectIndex,
  alt,
}: VehicleImageGalleryProps) {
  const hasMultiple = images.length > 1;
  const src =
    images[currentIndex] ||
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="overflow-hidden relative bg-white rounded-2xl shadow-sm">
      <div className="relative aspect-[16/10]">
        <img src={src} alt={alt} className="object-cover w-full h-full" />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="flex absolute left-4 top-1/2 justify-center items-center w-10 h-10 text-white rounded-full transition-colors -translate-y-1/2 bg-black/50 hover:bg-black/70"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex absolute right-4 top-1/2 justify-center items-center w-10 h-10 text-white rounded-full transition-colors -translate-y-1/2 bg-black/50 hover:bg-black/70"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {hasMultiple && (
          <div className="flex absolute bottom-4 left-1/2 gap-2 -translate-x-1/2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleDetailHeader({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
      <div>
        <div className="flex gap-2 items-center mb-2">
          <span className="px-3 py-1 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
            {vehicle.vehicleType}
          </span>
          <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {vehicle.status}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex gap-2 items-center mt-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>
            {vehicle.dealerName} - {vehicle.dealerCity}, {vehicle.dealerState}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">US Price</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(vehicle.priceUsd)}
        </p>
      </div>
    </div>
  );
}

function VehicleSpecsGrid({ specs }: { specs: VehicleSpec[] }) {
  return (
    <div className="pt-6 border-t border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Vehicle Specifications
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {specs.map((spec, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-2 items-center mb-1 text-gray-500">
              <spec.icon className="w-4 h-4" />
              <span className="text-sm">{spec.label}</span>
            </div>
            <p className="font-semibold text-gray-900">
              {spec.value ?? 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehicleVinSection({ vin }: { vin: string }) {
  return (
    <div className="pt-6 mt-6 border-t border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        VIN Information
      </h2>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="font-mono text-lg text-gray-900">{vin}</p>
        <p className="mt-2 text-sm text-gray-500">
          Full VIN history report will be provided after inspection
        </p>
      </div>
    </div>
  );
}

function VehicleFeaturesSection({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <div className="pt-6 mt-6 border-t border-gray-100">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Features</h2>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-2 items-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehicleDisclaimerCard() {
  return (
    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
      <div className="flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Important Disclaimer
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Afrozon purchases vehicles on your behalf from verified US sources
            and handles export and delivery. All prices are estimates and
            subject to market conditions. A professional inspection will be
            conducted before final purchase approval.
          </p>
        </div>
      </div>
    </div>
  );
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('RORO');

  const { vehicle, isLoading, isError, error } = useVehicle(id || '');
  const { costBreakdown, isLoading: isCostBreakdownLoading } = useCostBreakdown(id, shippingMethod);
  const { status } = useSession();
  const { isSaved } = useSavedVehiclesApi();
  const { toggle, isPending: isSavePending } = useToggleSaved();

  const createOrderMutation = useCreateOrder();


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-emerald-600 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="px-4 mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Error Loading Vehicle</h2>
          <p className="mb-6 text-gray-600">{error?.message || 'Failed to load vehicle details'}</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="px-4 mx-auto max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Vehicle Not Found</h2>
          <p className="mb-6 text-gray-600">The vehicle you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  const handleRequestVehicle = () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Create the order request
    createOrderMutation.mutate({
      identifier: vehicle.id,
      type: vehicle.vin || vehicle.id,
      shippingMethod: shippingMethod,
    });
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setShippingMethod(method);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const specs: VehicleSpec[] = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    {
      icon: Car,
      label: 'Make',
      value: vehicle.make
    },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType },
    { icon: Settings, label: 'Engine', value: vehicle.engineSize },
    { icon: MapPin, label: 'Location', value: `${vehicle.dealerCity || 'N/A'}, ${vehicle.dealerState || 'N/A'}` },
  ];

  const images = vehicle.images ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <GradientPageBar
        backLabel="Back to search"
        rightContent={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <VehicleImageGallery
              images={images}
              currentIndex={currentImageIndex}
              onNext={nextImage}
              onPrev={prevImage}
              onSelectIndex={setCurrentImageIndex}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            />

            <div className="p-6 bg-white rounded-2xl shadow-sm">
              <div className="flex flex-wrap gap-4 justify-between items-start">
                <VehicleDetailHeader vehicle={vehicle as Vehicle} />
                {status === 'authenticated' && (
                  <button
                    type="button"
                    onClick={() => toggle(vehicle as Vehicle)}
                    disabled={isSavePending}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isSaved(vehicle.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved(vehicle.id) ? 'fill-current' : ''}`} />
                    {isSaved(vehicle.id) ? 'Saved' : 'Save vehicle'}
                  </button>
                )}
              </div>
              <VehicleSpecsGrid specs={specs} />
              <VehicleVinSection vin={vehicle.vin} />
              {vehicle.features && vehicle.features.length > 0 && (
                <VehicleFeaturesSection features={vehicle.features} />
              )}
            </div>

            <VehicleDisclaimerCard />
          </div>

          <div className="space-y-6">
            <PriceCalculator
              vehiclePrice={vehicle.priceUsd}
              vehicleType={vehicle.vehicleType}
              costBreakdown={costBreakdown}
              isLoading={isCostBreakdownLoading}
              onShippingMethodChange={handleShippingMethodChange}
            />

            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <button
                onClick={handleRequestVehicle}
                disabled={createOrderMutation.isPending}
                className="flex gap-2 justify-center items-center py-4 w-full text-lg font-semibold text-white bg-emerald-600 rounded-xl transition-colors hover:bg-emerald-700"
              >
                <Shield className="w-5 h-5" />
                Request This Vehicle
              </button>
              <p className="mt-3 text-sm text-center text-gray-500">
                30% deposit required to secure this vehicle
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Why Choose Afrozon?</h3>
              <div className="space-y-3">
                {[
                  'Professional pre-purchase inspection',
                  'Full VIN history report',
                  'Secure escrow payment',
                  'Door-to-door delivery',
                  'Real-time tracking',
                  'Customer support throughout',
                ].map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}