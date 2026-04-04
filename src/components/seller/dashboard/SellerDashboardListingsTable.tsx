'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Car,
  Eye,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import type { MarketplaceVehicle, VehicleStatus } from '@/lib/marketplace/types';
import { VehicleStatusBadge } from '@/components/marketplace/StatusBadge';

export type SellerStatusFilter =
  | 'all'
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD';

type SellerDashboardListingsTableProps = {
  vehicles: MarketplaceVehicle[];
  statusFilter: SellerStatusFilter;
  onStatusFilterChange: (value: SellerStatusFilter) => void;
  deletingId: string | null;
  submittingId: string | null;
  onSubmit: (id: string) => void;
  onDelete: (id: string) => void;
};

const STATUS_OPTIONS: { value: SellerStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Listings' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SOLD', label: 'Sold' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
  });
}

function getVehicleImage(vehicle: MarketplaceVehicle): string | null {
  if (vehicle.images && vehicle.images.length > 0) {
    const primary = vehicle.images.find((img) => img.is_primary);
    return primary ? primary.url : vehicle.images[0].url;
  }
  return null;
}

function canEdit(status: VehicleStatus): boolean {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function SellerDashboardListingsTable({
  vehicles,
  statusFilter,
  onStatusFilterChange,
  deletingId,
  submittingId,
  onSubmit,
  onDelete,
}: SellerDashboardListingsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F4F6] px-3 py-4 sm:px-4">
        <h2 className="font-body text-base font-semibold text-[#111827]">My Listings</h2>

        <div className="relative w-full sm:w-36">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as SellerStatusFilter)}
            className="h-10 w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 font-jakarta text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Filter listing status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#374151]"
            aria-hidden
          />
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[2.2fr_1.1fr_1fr_1fr_0.9fr] gap-8 border-b border-[#E5E7EB] bg-[#FAFAFA] px-3 py-4 sm:px-4">
            <span className="font-jakarta text-sm font-medium text-[#111827]">
              Vehicle Details
            </span>
            <span className="font-jakarta text-sm font-medium text-[#111827]">Status</span>
            <span className="font-jakarta text-sm font-medium text-[#111827]">
              Date Listed
            </span>
            <span className="font-jakarta text-sm font-medium text-[#111827]">
              Listing Price
            </span>
            <span className="font-jakarta text-sm font-medium text-[#111827]">Action</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <Car className="mb-3 h-10 w-10 text-gray-300" />
              <p className="font-body text-base font-medium text-[#111827]">
                No listings found
              </p>
              <p className="mt-1 font-jakarta text-sm text-[#6B7280]">
                Try another filter or create a new listing.
              </p>
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const imageUrl = getVehicleImage(vehicle);
              const isDeleting = deletingId === vehicle.id;
              const isSubmitting = submittingId === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  className={`grid grid-cols-[2.2fr_1.1fr_1fr_1fr_0.9fr] gap-8 border-b border-[#E3EBF0] bg-white px-3 py-4 sm:px-4 ${
                    isDeleting ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={vehicle.title}
                        className="h-[60px] w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-[60px] w-20 items-center justify-center rounded-lg bg-gray-100">
                        <Car className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-body text-xs font-semibold leading-4 text-[#343A40]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-0.5 truncate font-body text-xs text-[#6B7280]">
                        {vehicle.mileage > 0
                          ? `${vehicle.mileage.toLocaleString()} mi · ${vehicle.drivetrain || 'N/A'}`
                          : vehicle.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <VehicleStatusBadge status={vehicle.status} />
                  </div>

                  <div className="flex items-center font-jakarta text-sm text-[#6B7280]">
                    {formatDate(vehicle.created_at)}
                  </div>

                  <div className="flex items-center font-jakarta text-sm text-[#6B7280]">
                    {formatPrice(vehicle.price_usd)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/seller/listings/${vehicle.id}`}
                      className="inline-flex items-center rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827]"
                      aria-label={`View ${vehicle.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {canEdit(vehicle.status) && (
                      <Link
                        href={`/seller/sell-your-car?vehicleId=${vehicle.id}`}
                        className="inline-flex items-center rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827]"
                        aria-label={`Edit ${vehicle.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}

                    {(vehicle.status === 'DRAFT' || vehicle.status === 'REJECTED') && (
                      <button
                        type="button"
                        onClick={() => onSubmit(vehicle.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827] disabled:opacity-50"
                        aria-label={`Submit ${vehicle.title}`}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}

                    {canEdit(vehicle.status) && (
                      <button
                        type="button"
                        onClick={() => onDelete(vehicle.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Delete ${vehicle.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
