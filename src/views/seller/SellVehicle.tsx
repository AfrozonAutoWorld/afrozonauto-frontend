'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { HeroSellBreadcrumb } from '@/components/seller/sell-vehicle/HeroSellBreadcrumb';
import { HeroSellSection } from '@/components/seller/sell-vehicle/HeroSellSection';
import { SellStepper, type SellStepKey } from '@/components/seller/sell-vehicle/SellStepper';
import { SellStepCard } from '@/components/seller/sell-vehicle/SellStepCard';
import { SellVehicleStep1 } from '@/components/seller/sell-vehicle/SellVehicleStep1';
import { SellVehicleStep2 } from '@/components/seller/sell-vehicle/SellVehicleStep2';
import { SellVehicleStep3 } from '@/components/seller/sell-vehicle/SellVehicleStep3';
import { SellVehicleStep4 } from '@/components/seller/sell-vehicle/SellVehicleStep4';
import { SellVehicleSuccess } from '@/components/seller/sell-vehicle/SellVehicleSuccess';
import type { PhotoSlotValue } from '@/components/seller/sell-vehicle/SellVehicleStep3';
import { useSubmitSellerVehicle, useUpdateSellerVehicle } from '@/hooks/useSellerVehicle';
import { useSellerListingDetail } from '@/hooks/useSellerListingDetail';
import { showToast } from '@/lib/showNotification';
import { buildSellVehicleFormData } from '@/lib/seller/buildSellVehicleFormData';
import { prefillSellFormFromListing } from '@/lib/seller/prefillSellFormFromListing';
import { canListSellerVehicles } from '@/lib/sellerAccess';

const STEP_ORDER: SellStepKey[] = ['vehicle', 'condition', 'photos-price', 'contact'];

function generateReferenceId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AFZ-2026-${num}`;
}

type VehicleDetails = {
  year: string;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  mileage: string;
  drivetrain?: string;
  transmission?: string;
  fuelType?: string;
  exteriorColor?: string;
  interiorColor?: string;
  keysCount?: string | null;
};

type ConditionDetails = {
  condition: string | null;
  titleStatus: string | null;
  accidentHistory: string | null;
  knownIssues: Set<string>;
  modifications?: string;
};

type PhotosPriceDetails = {
  photos: PhotoSlotValue[];
  askingPrice: string;
  additionalNotes: string;
  hasAskingPrice?: boolean;
};

type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityState: string;
  bestTime: string;
  zipCode: string;
  contactMethods: Set<string>;
};

export function SellVehicle() {
  const [step, setStep] = useState<SellStepKey>('vehicle');
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails>({
    year: '',
    make: '',
    model: '',
    trim: '',
    bodyStyle: '',
    mileage: '',
    drivetrain: '',
    transmission: '',
    fuelType: '',
    exteriorColor: '',
    interiorColor: '',
    keysCount: null,
  });

  const [conditionDetails, setConditionDetails] = useState<ConditionDetails>({
    condition: null,
    titleStatus: null,
    accidentHistory: null,
    knownIssues: new Set<string>(),
    modifications: '',
  });

  const [photosPrice, setPhotosPrice] = useState<PhotosPriceDetails>({
    photos: new Array(9).fill(null),
    askingPrice: '',
    additionalNotes: '',
    hasAskingPrice: true,
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityState: '',
    bestTime: '',
    zipCode: '',
    contactMethods: new Set<string>(),
  });

  const [submitting, setSubmitting] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const submitSellerVehicle = useSubmitSellerVehicle();
  const updateSellerVehicle = useUpdateSellerVehicle();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const {
    data: listingDetail,
    isLoading: listingLoading,
    isError: listingError,
  } = useSellerListingDetail(vehicleId ?? '');
  const editModeLoading =
    !!vehicleId && (sessionStatus === 'loading' || (sessionStatus === 'authenticated' && listingLoading));
  const prefillApplied = useRef(false);

  useEffect(() => {
    prefillApplied.current = false;
  }, [vehicleId]);

  useEffect(() => {
    if (!vehicleId || !listingDetail?.raw || prefillApplied.current) return;
    prefillApplied.current = true;
    const p = prefillSellFormFromListing(listingDetail.raw);
    setVehicleDetails(p.vehicle);
    setConditionDetails(p.condition);
    setPhotosPrice(p.photosPrice);
    setContactDetails(p.contact);
  }, [vehicleId, listingDetail]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step, submitted]);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length;

  const goNextFromVehicle = () => {
    if (!vehicleDetails.year || !vehicleDetails.make || !vehicleDetails.model || !vehicleDetails.bodyStyle) {
      showToast({ type: 'error', message: 'Please fill in year, make, model, and body style.' });
      return;
    }
    if (!vehicleDetails.mileage || Number.isNaN(Number(vehicleDetails.mileage))) {
      showToast({ type: 'error', message: 'Please enter a valid mileage.' });
      return;
    }
    if (!vehicleDetails.keysCount) {
      showToast({ type: 'error', message: 'Please select the number of keys.' });
      return;
    }
    const next = STEP_ORDER[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const goNextFromCondition = () => {
    if (!conditionDetails.condition || !conditionDetails.titleStatus || !conditionDetails.accidentHistory) {
      showToast({ type: 'error', message: 'Please select condition, title status, and accident history.' });
      return;
    }
    const next = STEP_ORDER[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const goNextFromPhotos = () => {
    const photoCount = photosPrice.photos.filter((p) => p != null).length;
    if (photoCount < 4) {
      showToast({ type: 'error', message: 'Please add at least 4 photos of your vehicle.' });
      return;
    }
    if (photosPrice.hasAskingPrice !== false && !photosPrice.askingPrice) {
      showToast({ type: 'error', message: 'Please enter your asking price or select the valuation option.' });
      return;
    }
    const next = STEP_ORDER[currentStepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = STEP_ORDER[currentStepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const formData = buildSellVehicleFormData(
        vehicleDetails,
        conditionDetails,
        photosPrice,
        contactDetails,
      );

      if (vehicleId) {
        await updateSellerVehicle.mutateAsync({ id: vehicleId, formData });
        await queryClient.invalidateQueries({ queryKey: ['marketplace-vehicles'] });
        await queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', vehicleId] });
        setReferenceId(vehicleId);
        setSubmitted(true);
        showToast({ type: 'success', message: 'Listing updated successfully.' });
      } else {
        const data = await submitSellerVehicle.mutateAsync(formData);
        const inner = data?.data as { id?: string; data?: { id?: string } } | undefined;
        const created = inner?.data ?? inner;
        const listingId =
          created && typeof created === 'object' && 'id' in created && created.id
            ? String(created.id)
            : undefined;

        setReferenceId(listingId ?? generateReferenceId());
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save vehicle.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (vehicleId && sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="Sign in to edit your listing."
        />
        <div className="px-4 pb-16 mx-auto max-w-lg text-center sm:px-6 lg:px-8">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-[#0D7A4A] px-4 py-2 font-body text-sm font-medium text-white hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicleId && sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <p className="font-body text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (
    sessionStatus === 'authenticated' &&
    !vehicleId &&
    !canListSellerVehicles(session?.user)
  ) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="New listings are available once your seller account is verified."
        />
        <div className="px-4 pb-16 mx-auto max-w-lg text-center sm:px-6 lg:px-8 space-y-4">
          <p className="font-body text-[#4B5563] text-sm">
            You can still manage existing listings from your dashboard after verification. If you
            just applied, we will notify you when your account is ready.
          </p>
          <Link
            href="/seller"
            className="inline-block rounded-lg bg-[#0D7A4A] px-4 py-2 font-body text-sm font-medium text-white hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (vehicleId && editModeLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="Loading your listing…"
        />
        <div className="px-4 pb-16 mx-auto max-w-5xl sm:px-6 lg:px-8">
          <div className="p-8 space-y-4 bg-white rounded-xl ring-1 ring-gray-100 shadow-sm animate-pulse">
            <div className="w-48 h-8 bg-gray-200 rounded" />
            <div className="w-full max-w-md h-4 bg-gray-100 rounded" />
            <div className="h-32 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (vehicleId && listingError) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="We could not load this listing."
        />
        <div className="px-4 pb-16 mx-auto max-w-lg text-center sm:px-6 lg:px-8">
          <p className="font-body text-[#4B5563]">
            Check that you are signed in and the link is correct, then try again.
          </p>
          <Link
            href="/seller"
            className="mt-6 inline-block font-body text-sm font-medium text-[#0D7A4A] hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitted && referenceId) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="Four quick steps. Your listing goes live on the marketplace as soon as you submit."
        />
        <div className="flex flex-col gap-8 px-4 pb-16 mx-auto w-full max-w-5xl sm:px-6 lg:px-8">
          <SellVehicleSuccess referenceId={referenceId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <HeroSellSection
        breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
        headerText="List your vehicle. Get the best offer."
        descriptionText="Four quick steps. Your listing goes live on the marketplace as soon as you submit — only verified sellers can list."
      />

      <div className="px-4 pb-16 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {vehicleId && (
            <p className="px-4 py-3 text-sm text-emerald-900 bg-emerald-50 rounded-lg border border-emerald-200 font-body">
              You are editing an existing listing. Changes are saved when you submit the final step.
            </p>
          )}
          <SellStepper currentStep={step} />

          {step === 'vehicle' && (
            <SellStepCard
              title="What are details about your vehicle?"
              description="Tell us the basics about your car"
              stepLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}
              nextLabel="Next: Condition"
              onNext={goNextFromVehicle}
            >
              <SellVehicleStep1 value={vehicleDetails} onChange={setVehicleDetails} />
            </SellStepCard>
          )}

          {step === 'condition' && (
            <SellStepCard
              title="What is the condition of your vehicle?"
              description="Be honest — buyers appreciate transparency, and it speeds up the deal."
              stepLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}
              nextLabel="Next: Photos & Price"
              onNext={goNextFromCondition}
              backLabel="Back"
              onBack={goBack}
            >
              <SellVehicleStep2 value={conditionDetails} onChange={setConditionDetails} />
            </SellStepCard>
          )}

          {step === 'photos-price' && (
            <SellStepCard
              title="Photos and Asking Price of Your Vehicle"
              description="Clear photos get faster, higher offers. Minimum 4 required."
              stepLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}
              nextLabel="Your Details"
              onNext={goNextFromPhotos}
              backLabel="Back"
              onBack={goBack}
            >
              <SellVehicleStep3 value={photosPrice} onChange={setPhotosPrice} />
            </SellStepCard>
          )}

          {step === 'contact' && (
            <SellStepCard
              title="Your Details"
              description="How should we reach you when we have an offer?"
              stepLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}
              nextLabel={
                submitting
                  ? vehicleId
                    ? 'Saving...'
                    : 'Submitting...'
                  : vehicleId
                    ? 'Save changes'
                    : 'Submit request'
              }
              onNext={handleSubmit}
              backLabel="Back"
              onBack={goBack}
            >
              <SellVehicleStep4
                value={contactDetails}
                onChange={setContactDetails}
                summary={{
                  vehicle: [vehicleDetails.year, vehicleDetails.make, vehicleDetails.model]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || 'Vehicle details pending',
                  mileage: vehicleDetails.mileage
                    ? `${Number(vehicleDetails.mileage).toLocaleString()} mi`
                    : 'Not specified',
                  condition: conditionDetails.condition || 'Not specified',
                  title: conditionDetails.titleStatus || 'Not specified',
                  photosCount: photosPrice.photos.filter((p) => p != null).length,
                  priceDisplay:
                    photosPrice.hasAskingPrice === false
                      ? 'Requesting Afrozon valuation'
                      : photosPrice.askingPrice
                      ? `$${photosPrice.askingPrice}`
                      : 'Not specified',
                }}
              />
            </SellStepCard>
          )}

          <p className="text-right font-body text-sm text-[#666666] mt-2">
            Have a question?{' '}
            <Link
              href="/contact"
              className="text-[#0D7A4A] font-medium hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
