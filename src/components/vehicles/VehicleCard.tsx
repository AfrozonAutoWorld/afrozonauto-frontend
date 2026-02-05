import Link from 'next/link';
import { MapPin, Calendar, Heart, ArrowRight } from 'lucide-react';
import { Vehicle } from '../../types';
import { formatCurrency } from '../../lib/pricingCalculator';

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: 'grid' | 'list';
  onSave?: (vehicleId: string) => void;
  isSaved?: boolean;
}

export function getPrimaryImage(vehicle: Vehicle): string {
  const fallbackImage = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

  const primaryImage = vehicle.apiData?.listing?.retailListing?.primaryImage
    || vehicle.apiData?.listing?.wholesaleListing?.primaryImage;

  if (primaryImage) return primaryImage;

  if (vehicle.images && vehicle.images.length > 0) {
    return vehicle.images[0];
  }

  return fallbackImage;
}

// function getMileage(vehicle: Vehicle): number | undefined {
//   return vehicle.mileage
//     || vehicle.apiData?.listing?.retailListing?.miles
//     || vehicle.apiData?.listing?.wholesaleListing?.miles;
// }

export function VehicleCard({ vehicle, onSave, isSaved }: VehicleCardProps) {
  // const landedCost = calculateLandedCost(
  //   vehicle.priceUsd,
  //   vehicle.vehicleType,
  //   'RoRo',
  //   'Lagos'
  // );

  const primaryImage = getPrimaryImage(vehicle);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {vehicle.vehicleType}
          </span>
        </div>
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave(vehicle.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
              }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 text-start">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.dealerCity}, {vehicle.dealerState}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {/* {mileage && (
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{mileage ? `${mileage.toLocaleString()} mi` : 'No Mileage'}</span>
            </div>
          )} */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{vehicle.year}</span>
          </div>
          <span className="text-gray-400">|</span>
          <span>{vehicle.transmission}</span>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-500">US Price</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(vehicle.priceUsd)}</p>
            </div>
            {/* <div className="text-right">
              <p className="text-xs text-gray-500">Est. Landed (Lagos)</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(landedCost.breakdown.total_usd)}
              </p>
            </div> */}
          </div>

          <Link
            href={`/vehicles/${vehicle.id}`}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}