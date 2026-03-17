'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroSellBreadcrumb } from '@/components/seller/sell-vehicle/HeroSellBreadcrumb';
import { HeroSellSection } from '@/components/seller/sell-vehicle/HeroSellSection';
import { SellStepper, type SellStepKey } from '@/components/seller/sell-vehicle/SellStepper';
import { SellStepCard } from '@/components/seller/sell-vehicle/SellStepCard';
import { SellVehicleStep1 } from '@/components/seller/sell-vehicle/SellVehicleStep1';
import { SellVehicleStep2 } from '@/components/seller/sell-vehicle/SellVehicleStep2';
import { SellVehicleStep3 } from '@/components/seller/sell-vehicle/SellVehicleStep3';
import { SellVehicleStep4 } from '@/components/seller/sell-vehicle/SellVehicleStep4';
import { SellVehicleSuccess } from '@/components/seller/sell-vehicle/SellVehicleSuccess';
import { useSubmitSellerVehicle } from '@/hooks/useSellerVehicle';
import { showToast } from '@/lib/showNotification';

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
  photos: (File | null)[];
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
  const submitSellerVehicle = useSubmitSellerVehicle();

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
    const photoCount = photosPrice.photos.filter(Boolean).length;
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

      const formData = new FormData();

      // Step 1: Vehicle details
      formData.append('year', vehicleDetails.year);
      formData.append('make', vehicleDetails.make);
      formData.append('model', vehicleDetails.model);
      if (vehicleDetails.trim) formData.append('trim', vehicleDetails.trim);
      if (vehicleDetails.bodyStyle) formData.append('bodyStyle', vehicleDetails.bodyStyle);
      formData.append('mileage', vehicleDetails.mileage);
      if (vehicleDetails.drivetrain) formData.append('drivetrain', vehicleDetails.drivetrain);
      if (vehicleDetails.transmission) formData.append('transmission', vehicleDetails.transmission);
      if (vehicleDetails.fuelType) formData.append('fuelType', vehicleDetails.fuelType);
      if (vehicleDetails.exteriorColor) formData.append('exteriorColor', vehicleDetails.exteriorColor);
      if (vehicleDetails.keysCount) {
        const parsedKeys =
          vehicleDetails.keysCount === '1 key'
            ? 1
            : vehicleDetails.keysCount === '2 keys'
              ? 2
              : vehicleDetails.keysCount === '3+ keys'
                ? 3
                : undefined;
        if (parsedKeys != null) {
          formData.append('keys', String(parsedKeys));
        }
      }

      // Step 2: Condition details
      if (conditionDetails.condition) {
        formData.append('condition', conditionDetails.condition.toUpperCase());
      }
      if (conditionDetails.titleStatus) {
        // Backend expects an array; use bracket notation so body parser creates an array.
        formData.append('titleStatus[0]', conditionDetails.titleStatus);
      }
      if (conditionDetails.accidentHistory) {
        const mappedAccident =
          conditionDetails.accidentHistory === 'Minor accident'
            ? 'Minor'
            : conditionDetails.accidentHistory === 'Major accident'
              ? 'Major'
              : conditionDetails.accidentHistory;
        formData.append('accidentHistory', mappedAccident);
      }
      Array.from(conditionDetails.knownIssues).forEach((issue, index) => {
        formData.append(`knownIssues[${index}]`, issue);
      });
      if (conditionDetails.modifications) {
        formData.append('modifications', conditionDetails.modifications);
      }

      // Step 3: Photos & price
      const imageFiles = photosPrice.photos.filter(
        (file): file is File => file != null,
      );
      imageFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (photosPrice.hasAskingPrice !== false) {
        if (!photosPrice.askingPrice) {
          throw new Error('Please enter your asking price.');
        }
        formData.append('askingPrice', photosPrice.askingPrice);
      } else {
        // Backend currently requires askingPrice; send 0 as placeholder when user requests valuation
        formData.append('askingPrice', '0');
      }
      formData.append('showAskingPrice', 'true');
      formData.append('allowOffers', 'true');
      if (photosPrice.additionalNotes) {
        formData.append('additionalNotes', photosPrice.additionalNotes);
      }

      // Step 4: Contact details
      formData.append('contactFirstName', contactDetails.firstName);
      formData.append('contactLastName', contactDetails.lastName);
      formData.append('contactEmail', contactDetails.email);
      formData.append('contactPhone', contactDetails.phone);
      formData.append('city', contactDetails.cityState);
      formData.append('zipCode', contactDetails.zipCode);

      // Map preferred contact to backend enum
      let preferred: string | null = null;
      if (contactDetails.contactMethods.has('Email')) {
        preferred = 'Email';
      } else if (contactDetails.contactMethods.has('Text Message')) {
        preferred = 'SMS';
      } else if (contactDetails.contactMethods.has('WhatsApp')) {
        preferred = 'SMS';
      }
      if (preferred) {
        formData.append('preferredContact', preferred);
      }
      if (contactDetails.bestTime) {
        formData.append('bestTimeToReach', contactDetails.bestTime);
      }

      const data = await submitSellerVehicle.mutateAsync(formData);
      const created = data?.data;

      setReferenceId(created?.id ?? generateReferenceId());
      setSubmitted(true);
      } catch (err) {
        console.error(err);
      showToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to submit vehicle.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && referenceId) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <HeroSellSection
          breadcrumbs={<HeroSellBreadcrumb text="SELL YOUR CAR" />}
          headerText="List your vehicle. Get the best offer."
          descriptionText="Four quick steps. We'll review your listing and come back with a verified offer within 48 hours."
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
        descriptionText="Four quick steps. We'll review your listing and come back with a verified offer within 48 hours."
      />

      <div className="px-4 pb-16 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
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
              nextLabel={submitting ? 'Submitting...' : 'Submit request'}
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
                  photosCount: photosPrice.photos.filter(Boolean).length,
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
