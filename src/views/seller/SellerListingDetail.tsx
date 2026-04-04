'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Calendar, Car, Eye, Heart, SquarePen } from 'lucide-react';
import { SellerListingImageCarousel } from '@/components/seller/listing/SellerListingImageCarousel';
import { useSellerListingDetail } from '@/hooks/useSellerListingDetail';
import { formatListingReferenceId } from '@/lib/seller/listingReference';
import { getSellerListingStatusPresentation } from '@/lib/seller/listingStatusPresentation';
import type { SellerListingVehicle } from '@/lib/marketplace/mapSellerVehicle';

function formatLongDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatPriceUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDealerLine(raw: SellerListingVehicle): string {
  const name = raw.dealerName?.trim();
  const city = raw.dealerCity?.trim() ?? raw.city?.trim();
  const st = raw.dealerState?.trim();
  const loc = [city, st].filter(Boolean).join(', ');
  if (name && loc) return `${name}; ${loc}`;
  if (name) return name;
  if (loc) return loc;
  return '—';
}

function buildDescriptionText(
  manualNotes: string | null | undefined,
  features: string[] | undefined,
): string {
  const notes = manualNotes?.trim();
  if (notes) return notes;
  if (features?.length) return features.join(' · ');
  return 'No description was provided for this listing.';
}

type SpecRowProps = { label: string; value: string };
function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-base font-normal text-[#6B7280]">{label}</p>
      <p className="font-body text-base font-medium leading-snug text-[#111827]">{value}</p>
    </div>
  );
}

type SellerListingDetailProps = {
  listingId: string;
};

export function SellerListingDetail({ listingId }: SellerListingDetailProps) {
  const { data: session, status: sessionStatus } = useSession();
  const { data, isLoading, isError, error, refetch, isFetching } = useSellerListingDetail(listingId);

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-[50vh] bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-7 w-64 rounded bg-gray-200" />
          <div className="h-24 rounded-lg bg-gray-200" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="h-96 flex-1 rounded-2xl bg-gray-200" />
            <div className="h-80 w-full rounded-2xl bg-gray-200 lg:w-[470px]" />
          </div>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 py-16 text-center">
        <p className="font-body text-[#4B5563]">Sign in to view your listing.</p>
        <Link
          href="/login"
          className="rounded-lg bg-[#0D7A4A] px-4 py-2 font-body text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
        <Link href="/seller" className="font-body text-sm text-[#0D7A4A] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (sessionStatus === 'authenticated' && !session?.accessToken) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 py-16 text-center">
        <p className="font-body text-[#4B5563]">
          Your session does not include an API token. Sign out and sign in again.
        </p>
        <Link href="/login" className="font-body text-sm text-[#0D7A4A] hover:underline">
          Sign in
        </Link>
        <Link href="/seller" className="font-body text-sm text-[#0D7A4A] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (isLoading || (isFetching && !data)) {
    return (
      <div className="min-h-[50vh] bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-7 w-64 rounded bg-gray-200" />
          <div className="h-24 rounded-lg bg-gray-200" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="h-96 flex-1 rounded-2xl bg-gray-200" />
            <div className="h-80 w-full rounded-2xl bg-gray-200 lg:w-[470px]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 py-16 text-center">
        <p className="font-body text-[#4B5563]">
          {error instanceof Error ? error.message : 'Could not load this listing.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-[#0D7A4A] px-4 py-2 font-body text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link href="/seller" className="font-body text-sm text-[#0D7A4A] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { marketplace: v, raw } = data;
  const presentation = getSellerListingStatusPresentation(v.status, {
    adminNotes: raw.adminNotes ?? v.rejection_reason,
  });
  const imageUrls = Array.isArray(raw.images) ? raw.images : [];
  const headlineTitle = [raw.year, raw.make, raw.model].filter(Boolean).join(' ');
  const trimPart = raw.trim?.trim();
  const nameLine = trimPart ? `${headlineTitle} · ${trimPart}` : headlineTitle;
  const specTitle = headlineTitle;

  return (
    <div className="bg-white pb-16 pt-6 sm:pt-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 font-body text-sm font-medium text-[#0D7A4A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-4">
          <p className="font-body text-lg font-medium leading-7 text-[#484848]">
            Reservation ID: {formatListingReferenceId(v.id)}
          </p>

          <div
            className={`flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between ${presentation.borderClass}`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="font-sans text-lg font-semibold leading-7 text-[#1A1A1A]">
                {presentation.heading}
              </h2>
              <p className="font-body text-sm leading-5 text-[#4B5563]">{presentation.subtext}</p>
            </div>
            <span
              className={`inline-flex shrink-0 self-start rounded-2xl px-2 py-1.5 font-body text-base leading-6 sm:self-center ${presentation.badgeBg} ${presentation.badgeText}`}
            >
              {presentation.badgeLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <section className="min-w-0 flex-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:p-6">
            <div className="mb-6 flex items-center gap-2">
              <Car className="h-8 w-8 text-[#1A1A1A]" strokeWidth={1.5} aria-hidden />
              <h3 className="font-body text-lg font-medium leading-7 text-[#111827]">
                Vehicle Information
              </h3>
            </div>

            <SellerListingImageCarousel urls={imageUrls} alt={specTitle} />

            <div className="mt-6 space-y-4">
              <h4 className="font-sans text-lg font-semibold leading-7 text-[#484848]">{specTitle}</h4>
              <p className="font-jakarta text-base leading-6 text-[#6B7280]">
                {buildDescriptionText(raw.manualNotes, raw.features ?? undefined)}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-8 md:flex-row md:justify-between md:gap-12">
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <SpecRow label="Name" value={nameLine} />
                <SpecRow label="Fuel Type" value={raw.fuelType?.trim() || '—'} />
                <SpecRow label="Body" value={raw.bodyStyle?.trim() || '—'} />
                <SpecRow label="Dealer" value={formatDealerLine(raw)} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <SpecRow label="Drivetrain" value={raw.drivetrain?.trim() || '—'} />
                <SpecRow label="VIN" value={raw.vin?.trim() || '—'} />
                <SpecRow
                  label="Mileage"
                  value={
                    raw.mileage != null && raw.mileage >= 0
                      ? `${raw.mileage.toLocaleString()} mi`
                      : '—'
                  }
                />
                <SpecRow label="Transmission" value={raw.transmission?.trim() || '—'} />
              </div>
            </div>
          </section>

          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(100%,470px)]">
            <div className="flex flex-col gap-9 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div>
                <p className="font-body text-lg font-normal leading-7 text-[#484848]">Listing Price</p>
                <p className="mt-2 font-sans text-3xl font-bold leading-10 text-[#484848] sm:text-[32px] sm:leading-10">
                  {formatPriceUsd(v.price_usd)}
                </p>
              </div>

              <div className="h-px w-full bg-[#E5E7EB]" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 font-body text-sm">
                  <span className="flex items-center gap-2 text-[#9CA3AF]">
                    <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    Views
                  </span>
                  <span className="font-semibold text-[#0F1F2D]">{data.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4 font-body text-sm">
                  <span className="flex items-center gap-2 text-[#9CA3AF]">
                    <Heart className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    Saved by buyers
                  </span>
                  <span className="font-semibold text-[#0F1F2D]">{data.saveCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4 font-body text-sm">
                  <span className="flex items-center gap-2 text-[#9CA3AF]">
                    <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    Date Listed
                  </span>
                  <span className="font-semibold text-[#0F1F2D]">{formatLongDate(v.created_at)}</span>
                </div>
              </div>

              <Link
                href={`/seller/sell-your-car?vehicleId=${v.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] py-[18px] pl-6 pr-8 font-body text-lg font-medium leading-7 text-white transition hover:opacity-95"
              >
                <SquarePen className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden />
                Edit Listing
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
