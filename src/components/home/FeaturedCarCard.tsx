import Link from 'next/link';
import { MapPin, Calendar, Settings2, Check, ArrowRight } from 'lucide-react';
import type { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/pricingCalculator';
import { getPrimaryImage } from '@/components/vehicles/VehicleCard';
import Image from 'next/image';
export interface FeaturedCarCardProps {
  vehicle: Vehicle;
  /** Optional landed price in NGN. If not provided, a placeholder is shown. */
  landedPriceNgn?: number;
}

function VehicleImageTags({ vehicle }: { vehicle: Vehicle }) {
  const tags: string[] = [];
  if (vehicle.vehicleType) tags.push(vehicle.vehicleType);
  if (vehicle.drivetrain && (vehicle.drivetrain === '4WD' || vehicle.drivetrain === 'AWD')) {
    tags.push(vehicle.drivetrain);
  }
  if (tags.length === 0) return null;
  return (
    <div className="absolute left-3.5 bottom-3 flex flex-row items-center gap-2">
      {tags.map((label) => (
        <span
          key={label}
          className="inline-flex items-center justify-center py-0.5 px-2.5 rounded-full bg-[#1D242D]/60 border border-white/20 backdrop-blur-[6px] font-body font-bold text-[10px] leading-3 text-white shadow-sm"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <div className="flex absolute top-4 right-4 flex-row gap-1 items-center px-2 py-1 rounded-lg bg-white/90">
      <span className="flex items-center justify-center w-[11px] h-[10px] text-[#00A67E]" aria-hidden>
        <Check className="w-[11px] h-[10px]" strokeWidth={3} />
      </span>
      <span className="font-body font-bold text-[10px] leading-3 text-[#1D242D]">
        VERIFIED
      </span>
    </div>
  );
}

const fallbackImage = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

export function FeaturedCarCard({ vehicle, landedPriceNgn }: FeaturedCarCardProps) {
  const primaryImage = getPrimaryImage(vehicle);
  const location = [vehicle.dealerCity, vehicle.dealerState].filter(Boolean).join(', ') || '—';
  const href = `/marketplace/${vehicle.id}`;

  return (
    <article className="box-border flex flex-col items-start w-full max-w-[400px] bg-white border border-[#F1F5F9] rounded-2xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden isolate">
      {/* Image container */}
      <div className="relative w-full aspect-[398/215] flex-none bg-gray-100 shrink-0">
        <Image
          src={primaryImage}
          fill
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <VehicleImageTags vehicle={vehicle} />
        <VerifiedBadge />
      </div>

      {/* Content container - padding 24px, gap 24px */}
      <div className="flex flex-col gap-6 items-start p-6 w-full min-w-0">
        {/* Title + specs - Frame 28 */}
        <div className="flex flex-col gap-1 items-start w-full">
          <h3 className="font-sans font-bold text-[20px] leading-7 text-[#0F172A] w-full">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <div className="flex flex-row gap-6 items-center pb-3 w-full">
            <div className="flex flex-row gap-1 items-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#546881]" aria-hidden />
              <span className="font-body font-normal text-xs leading-4 text-[#546881]">{location}</span>
            </div>
            <div className="flex flex-row gap-1 items-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#64748B]" aria-hidden />
              <span className="font-body font-normal text-xs leading-4 text-[#546881]">{vehicle.year}</span>
            </div>
            <div className="flex flex-row gap-1 items-center shrink-0">
              <Settings2 className="w-3.5 h-3.5 text-[#64748B]" aria-hidden />
              <span className="font-body font-normal text-xs leading-4 text-[#546881]">
                {vehicle.transmission ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Divider - Line 1 */}
        <div className="w-full border-t border-[#E8E8E8] -my-1" aria-hidden />

        {/* Price row + View button */}
        <div className="flex flex-row gap-2 justify-between items-center w-full">
          <div className="flex flex-col gap-1 items-start">
            <p className="font-body font-bold text-[10px] leading-3 text-[#546881]">US PRICE</p>
            <p className="font-sans font-bold text-2xl leading-[30px] text-[#1D242D]">
              {formatCurrency(vehicle.priceUsd ?? 0)}
            </p>
            {landedPriceNgn != null && (
              <p className="font-body font-bold text-[10px] leading-3 text-[#0D7A4A]">
                {formatCurrency(landedPriceNgn, 'NGN')} landed in Nigeria
              </p>
            )}
          </div>
          <Link
            href={href}
            className="shrink-0 flex flex-row justify-end items-center gap-2 py-2.5 pl-4 pr-3 h-10 bg-[#1D242D] rounded-lg font-body font-medium text-sm leading-5 text-white hover:bg-[#2d3640] transition-colors"
          >
            View
            <ArrowRight className="w-4 h-4 text-white" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
