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

export function SellVehicle() {
  const [step, setStep] = useState<SellStepKey>('vehicle');
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

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

  const handleSubmit = () => {
    setReferenceId(generateReferenceId());
    setSubmitted(true);
    // When backend is ready: POST form data, then use returned referenceId and setSubmitted(true)
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
              <SellVehicleStep1 />
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
              <SellVehicleStep2 />
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
              <SellVehicleStep3 />
            </SellStepCard>
          )}

          {step === 'contact' && (
            <SellStepCard
              title="Your Details"
              description="How should we reach you when we have an offer?"
              stepLabel={`Step ${currentStepIndex + 1} of ${totalSteps}`}
              nextLabel="Submit request"
              onNext={handleSubmit}
              backLabel="Back"
              onBack={goBack}
            >
              <SellVehicleStep4 />
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
