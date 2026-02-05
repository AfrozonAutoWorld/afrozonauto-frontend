import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
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
} from 'lucide-react';
import { PriceCalculator } from '../components/vehicles/PriceCalculator';
import { formatCurrency } from '../lib/pricingCalculator';
import { useVehicle } from '../hooks/useVehicles';
import { useAuthQuery } from '../hooks/useAuth';
import { useCostBreakdown } from '../hooks/useOrders';

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthQuery();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS'>('RORO');

  const { vehicle, isLoading, isError, error } = useVehicle(id || '');
  const { costBreakdown, isLoading: isCostBreakdownLoading } = useCostBreakdown(id, shippingMethod);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Vehicle</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'Failed to load vehicle details'}</p>
          <button
            onClick={() => router.push('/vehicles')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/vehicles')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  const handleRequestVehicle = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    router.push(`/request/${vehicle.id}`);
  };


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    {
      icon: Car,
      label: 'Make',
      value: vehicle.make
    },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType },
    { icon: Settings, label: 'Engine', value: vehicle.engineSize },
    { icon: MapPin, label: 'Location', value: `${vehicle.dealerCity}, ${vehicle.dealerState}` },
  ];

  const images = vehicle.images ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10]">
                <img
                  src={images[currentImageIndex] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />

                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {vehicle.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleSaveVehicle}
                  disabled={isSaving || isSaved}
                  className={`p-3 rounded-full transition-colors ${isSaved
                    ? 'bg-red-500 text-white cursor-not-allowed'
                    : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                  title={isSaved ? 'Already saved' : 'Save vehicle'}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-white/90 rounded-full text-gray-600 hover:bg-emerald-500 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div> */}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                      {vehicle.vehicleType}
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                      {vehicle.status}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{vehicle.dealerName} - {vehicle.dealerCity}, {vehicle.dealerState}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">US Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(vehicle.priceUsd)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map((spec, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <spec.icon className="w-4 h-4" />
                        <span className="text-sm">{spec.label}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{spec.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">VIN Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-mono text-lg text-gray-900">{vehicle.vin}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Full VIN history report will be provided after inspection
                  </p>
                </div>
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Important Disclaimer</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Afrozon purchases vehicles on your behalf from verified US sources and handles
                    export and delivery. All prices are estimates and subject to market conditions.
                    A professional inspection will be conducted before final purchase approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <PriceCalculator
              vehiclePrice={vehicle.priceUsd}
              vehicleType={vehicle.vehicleType}
              costBreakdown={costBreakdown}
              isLoading={isCostBreakdownLoading}
              onShippingMethodChange={setShippingMethod}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <button
                onClick={handleRequestVehicle}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Request This Vehicle
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                30% deposit required to secure this vehicle
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Afrozon?</h3>
              <div className="space-y-3">
                {[
                  'Professional pre-purchase inspection',
                  'Full VIN history report',
                  'Secure escrow payment',
                  'Door-to-door delivery',
                  'Real-time tracking',
                  'Customer support throughout',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
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