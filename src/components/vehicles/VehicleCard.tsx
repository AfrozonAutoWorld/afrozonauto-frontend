import { Link } from 'react-router-dom';
import { MapPin, Gauge, Calendar, Heart, ArrowRight } from 'lucide-react';
import type { Vehicle } from '../../types';
import { formatCurrency, calculateLandedCost } from '../../lib/pricingCalculator';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSave?: (vehicleId: string) => void;
  isSaved?: boolean;
}

export function VehicleCard({ vehicle, onSave, isSaved }: VehicleCardProps) {
  const landedCost = calculateLandedCost(
    vehicle.price_usd,
    vehicle.vehicle_type,
    'RoRo',
    'Lagos'
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={vehicle.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {vehicle.vehicle_type}
          </span>
        </div>
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave(vehicle.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isSaved
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
          <h3 className="text-lg font-semibold text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.dealer_city}, {vehicle.dealer_state}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{vehicle.mileage?.toLocaleString()} mi</span>
          </div>
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
              <p className="text-lg font-bold text-gray-900">{formatCurrency(vehicle.price_usd)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Est. Landed (Lagos)</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(landedCost.breakdown.total_usd)}
              </p>
            </div>
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
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
