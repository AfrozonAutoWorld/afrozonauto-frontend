'use client';

import { useState } from 'react';
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
};

type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityState: string;
  bestTime: string;
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
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityState: '',
    bestTime: '',
    contactMethods: new Set<string>(),
  });

  const [submitting, setSubmitting] = useState(false);

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length;

  const goNext = () => {
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
        formData.append('titleStatus', conditionDetails.titleStatus);
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
      conditionDetails.knownIssues.forEach((issue) => {
        formData.append('knownIssues', issue);
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

      if (!photosPrice.askingPrice) {
        throw new Error('Please enter your asking price.');
      }
      formData.append('askingPrice', photosPrice.askingPrice);
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
      formData.append('zipCode', '');

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

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error('API base URL is not configured.');
      }

      const res = await fetch(`${baseUrl}/seller-vehicle/submit`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        console.error('Sell vehicle submit failed', error);
        throw new Error(error?.error || 'Failed to submit vehicle');
      }

      const data = await res.json();
      const created = data?.data;

      setReferenceId(created?.id ?? generateReferenceId());
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // TODO: surface user-friendly error toast/snackbar
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
              onNext={goNext}
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
              onNext={goNext}
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
              onNext={goNext}
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
              <SellVehicleStep4 value={contactDetails} onChange={setContactDetails} />
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
