'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  MapPin,
  CarFront,
  Gauge,
  Fuel,
  Calendar,
  GitMerge,
  ShipWheel,
  DoorOpen,
  Palette,
  Zap,
  KeyRound,
  ScanBarcode,
  AlertCircle,
  Check,
  Info,
  Heart,
} from 'lucide-react';
import { PriceCalculator } from '../components/vehicles/PriceCalculator';
import { formatCurrency } from '../lib/pricingCalculator';
import { useVehicle } from '../hooks/useVehicles';
import { useSession } from 'next-auth/react';
import { useCostBreakdown } from '@/hooks/useOrderQueries';
import { useSavedVehiclesApi, useToggleSaved } from '@/hooks/useSavedVehiclesApi';
import { useCreateOrder } from '@/hooks/useOrderMutation';
import type { Vehicle } from '../types';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { VehicleImageGallery } from '@/components/vehicles/VehicleImageGallery';

type ShippingMethod = 'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS';

const VEHICLE_CONDITION_DEFAULTS = [
  'Excellent overall condition',
  'Clean title',
  'No accident history',
  'No known issues',
] as const;

function formatMileage(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
}

function buildVehicleDescription(vehicle: Vehicle): string {
  const trim = vehicle.apiData?.listing?.vehicle?.trim;
  const trimPart = trim ? ` ${trim}` : '';
  return (
    `The ${vehicle.year} ${vehicle.make} ${vehicle.model}${trimPart} combines verified US-market specification with Afrozon’s end-to-end import support. ` +
    `Use the details below to confirm fit, then estimate your full landed cost with the calculator — including sourcing, inspection, shipping, and handling.`
  );
}

function VehicleDetailHeader({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-start w-full">
      <div>
        <div className="flex gap-2 items-center mb-2 text-gray-500">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-sm leading-5 font-body">
            {vehicle.dealerName} - {vehicle.dealerCity}, {vehicle.dealerState}
          </span>
        </div>
        <h2 className="font-sans text-2xl font-bold text-gray-900 sm:text-3xl">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500 font-body">US Price</p>
        <p className="font-sans text-2xl font-bold text-gray-900 sm:text-3xl">
          {formatCurrency(vehicle.priceUsd)}
        </p>
      </div>
    </div>
  );
}

function VehicleDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-row gap-4 justify-between items-center">
      <div className="flex flex-row gap-4 items-center min-w-0">
        <Icon
          className="h-7 w-7 shrink-0 text-[#6B7280]"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="font-body text-lg font-medium leading-7 text-[#484848]">
          {label}
        </span>
      </div>
      <span className="max-w-[55%] shrink-0 text-right font-sans text-lg font-semibold leading-7 text-[#484848]">
        {value}
      </span>
    </div>
  );
}

function VehicleConditionRow({ text }: { text: string }) {
  return (
    <div className="flex flex-row items-center gap-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#008000]">
        <Check className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="font-body text-lg font-medium leading-7 text-[#484848]">
        {text}
      </span>
    </div>
  );
}

function CalculatorFooterNote() {
  return (
    <div className="flex flex-row gap-4 items-start p-5 rounded-2xl sm:p-6">
      <Info
        className="mt-0.5 h-6 w-6 shrink-0 text-[#666666]"
        strokeWidth={2}
        aria-hidden
      />
      <p className="font-body text-xs leading-4 text-[#666666]">
        Afrozon purchases vehicles on your behalf from verified US sources and
        handles export and delivery. All prices are estimates and subject to
        market conditions. A professional inspection will be conducted before
        final purchase approval. For more inquiries,{' '}
        <Link
          href="mailto:support@afrozonauto.com"
          className="font-medium text-[#0D7A4A] underline underline-offset-2 hover:text-[#0a633e]"
        >
          Contact Us
        </Link>
        .
      </p>
    </div>
  );
}

function useVehicleDetailRows(vehicle: Vehicle | null | undefined) {
  return useMemo(() => {
    if (!vehicle) {
      return [] as { icon: LucideIcon; label: string; value: string }[];
    }
    const v = vehicle.apiData?.listing?.vehicle;
    const retail = vehicle.apiData?.listing?.retailListing;
    const mileage = vehicle.mileage ?? retail?.miles;
    const body =
      v?.bodyStyle?.replace(/_/g, ' ') ??
      vehicle.vehicleType.replace(/_/g, ' ');
    const doors = v?.doors != null ? String(v.doors) : '—';
    const keys = '—';

    const rows: { icon: LucideIcon; label: string; value: string }[] = [
      { icon: CarFront, label: 'Body', value: body },
      {
        icon: Gauge,
        label: 'Mileage',
        value: formatMileage(mileage),
      },
      { icon: Fuel, label: 'Fuel Type', value: String(vehicle.fuelType) },
      { icon: Calendar, label: 'Year', value: String(vehicle.year) },
      {
        icon: GitMerge,
        label: 'Transmission',
        value: String(vehicle.transmission),
      },
      {
        icon: ShipWheel,
        label: 'Drivetrain',
        value: String(vehicle.drivetrain),
      },
      { icon: DoorOpen, label: 'Door', value: doors },
      {
        icon: Palette,
        label: 'Exterior color',
        value: vehicle.exteriorColor ?? '—',
      },
      {
        icon: Zap,
        label: 'Engine',
        value: vehicle.engineSize || v?.engine || '—',
      },
      { icon: KeyRound, label: 'Number of keys', value: keys },
      {
        icon: ScanBarcode,
        label: 'Vehicle Identification Number (VIN)',
        value: vehicle.vin,
      },
    ];
    return rows;
  }, [vehicle]);
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('RORO');

  const { vehicle, isLoading, isError, error } = useVehicle(id || '');
  const {
    costBreakdown,
    isLoading: isCostBreakdownLoading,
    isFetching: isCostBreakdownFetching,
  } = useCostBreakdown(id, shippingMethod);
  const { status } = useSession();
  const { isSaved } = useSavedVehiclesApi();
  const { toggle, isPending: isSavePending } = useToggleSaved();

  const createOrderMutation = useCreateOrder();

  const detailRows = useVehicleDetailRows(vehicle);

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
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Error Loading Vehicle
          </h2>
          <p className="mb-6 text-gray-600">
            {error?.message || 'Failed to load vehicle details'}
          </p>
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
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Vehicle Not Found
          </h2>
          <p className="mb-6 text-gray-600">
            The vehicle you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
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

    createOrderMutation.mutate({
      identifier: vehicle.id,
      type: vehicle.vin || vehicle.id,
      shippingMethod: shippingMethod,
    });
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setShippingMethod(method);
  };

  const images = vehicle.images ?? [];
  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const description = buildVehicleDescription(vehicle as Vehicle);

  const conditionItems = [...VEHICLE_CONDITION_DEFAULTS];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        className="px-4 pt-8 mx-auto max-w-7xl font-body sm:px-6 lg:px-8"
        items={[
          {
            label: 'HOME',
            href: '/',
            className: 'font-normal text-gray-600 hover:text-gray-900',
          },
          {
            label: 'BROWSE CARS',
            href: '/marketplace',
            className: 'font-normal text-gray-600 hover:text-gray-900',
          },
          {
            label: vehicleTitle,
            className: 'font-semibold text-gray-900',
          },
        ]}
        separatorClassName="h-4 w-4 shrink-0 text-gray-400"
      />

      <div className="px-4 py-8 mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8">
        <div className="flex gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <h1 className="font-sans text-2xl font-bold text-gray-900">
              {vehicleTitle}
            </h1>
            <span className="rounded-md bg-[#006557] px-3 py-1 text-sm font-medium text-white">
              {vehicle.status}
            </span>
          </div>
          {status === 'authenticated' && (
            <button
              type="button"
              onClick={() => toggle(vehicle as Vehicle)}
              disabled={isSavePending}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                isSaved(vehicle.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart
                className={`h-5 w-5 ${isSaved(vehicle.id) ? 'fill-current' : ''}`}
              />
              {isSaved(vehicle.id) ? 'Saved' : 'Save vehicle'}
            </button>
          )}
        </div>

        <VehicleImageGallery
          images={images}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        />

        <VehicleDetailHeader vehicle={vehicle as Vehicle} />

        <hr className="my-8 border-[#B8B8B8]" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex-1 space-y-10 min-w-0 xl:space-y-12">
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-bold leading-8 text-[#546881] sm:text-2xl sm:leading-[30px]">
                Vehicle Description
              </h2>
              <p className="font-jakarta max-w-none text-base font-normal leading-6 text-[#6B7280]">
                {description}
              </p>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-bold leading-8 text-[#546881] sm:text-2xl sm:leading-[30px]">
                Vehicle Details
              </h2>
              <div className="flex flex-col gap-4">
                {detailRows.map((row) => (
                  <VehicleDetailRow
                    key={row.label}
                    icon={row.icon}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
              <p className="font-body text-sm italic leading-5 text-[#003B33]">
                * Full VIN history report will be provided after inspection
              </p>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-bold leading-8 text-[#546881] sm:text-2xl sm:leading-[30px]">
                Vehicle Condition
              </h2>
              <div className="flex flex-col gap-4">
                {conditionItems.map((line) => (
                  <VehicleConditionRow key={line} text={line} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 w-full shrink-0">
            <PriceCalculator
              vehiclePrice={vehicle.priceUsd}
              vehicleType={vehicle.vehicleType}
              costBreakdown={costBreakdown}
              isLoading={isCostBreakdownLoading}
              isFetching={isCostBreakdownFetching}
              onShippingMethodChange={handleShippingMethodChange}
              onRequestVehicle={handleRequestVehicle}
              requestLoading={createOrderMutation.isPending}
            />
            <CalculatorFooterNote />
          </aside>
        </div>
      </div>
    </div>
  );
}
