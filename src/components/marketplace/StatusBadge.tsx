'use client';

import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from '@/lib/marketplace/constants';

export function VehicleStatusBadge({ status }: { status: string }) {
  const label = VEHICLE_STATUS_LABELS[status] || status;
  const color = VEHICLE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: string }) {
  const label = REQUEST_STATUS_LABELS[status] || status;
  const color = REQUEST_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
