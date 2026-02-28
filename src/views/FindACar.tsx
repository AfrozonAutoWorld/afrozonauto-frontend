'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FindACarBreadcrumb,
  FindACarTitle,
  FindACarStepper,
  FindACarStep1Form,
  FindACarStep2Form,
  FindACarStep3Form,
  FindACarSuccessCard,
  WhatHappensCard,
  GuaranteesCard,
  type FindACarStepKey,
  type FindACarStep1Data,
  type FindACarStep2Data,
  type FindACarStep3Data,
} from '@/components/find-a-car';
import { useCreateSourcingRequest } from '@/hooks/useSourcingRequest';
import type { CreateSourcingRequestPayload } from '@/lib/api/sourcingRequests';
import type { SourcingRequestCreated } from '@/lib/api/sourcingRequests';

export function FindACar() {
  const router = useRouter();
  const [step, setStep] = useState<FindACarStepKey>('car');
  const [step1Data, setStep1Data] = useState<FindACarStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<FindACarStep2Data | null>(null);
  const [step3Data, setStep3Data] = useState<FindACarStep3Data | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<SourcingRequestCreated | null>(null);

  const createRequest = useCreateSourcingRequest();

  const handleStep1Next = (data: FindACarStep1Data) => {
    setStep1Data(data);
    setStep('preferences');
  };

  const handleStep2Back = () => setStep('car');
  const handleStep2Next = (data: FindACarStep2Data) => {
    setStep2Data(data);
    setStep('contact');
  };

  const handleStep3Back = () => setStep('preferences');
  const handleStep3Submit = (data: FindACarStep3Data) => {
    if (!step1Data || !step2Data) return;
    const payload: CreateSourcingRequestPayload = {
      make: step1Data.make,
      model: step1Data.model,
      yearFrom: step1Data.yearFrom || undefined,
      yearTo: step1Data.yearTo || undefined,
      trim: step1Data.trim || undefined,
      condition: step1Data.condition,
      budgetUsd: step2Data.budgetUsd,
      exteriorColor: step2Data.exteriorColor,
      anyColor: step2Data.anyColor,
      shipping: step2Data.shipping,
      timeline: step2Data.timeline,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneCountryCode: data.phoneCountryCode || undefined,
      phoneNumber: data.phoneNumber,
      deliveryCity: data.deliveryCity || undefined,
      additionalNotes: data.additionalNotes || undefined,
      consentContact: data.consentContact,
    };
    createRequest.mutate(payload, {
      onSuccess: (data) => {
        setSubmittedRequest(data);
      },
    });
  };

  const handleGoHomeFromSuccess = () => {
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setSubmittedRequest(null);
    setStep('car');
    router.push('/marketplace');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="px-4 sm:px-5 lg:px-20 py-8 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <FindACarBreadcrumb />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_438px] gap-8 lg:gap-12 items-start">
          <div className="min-w-0">
            {submittedRequest ? (
              <FindACarSuccessCard data={submittedRequest} onGoHome={handleGoHomeFromSuccess} />
            ) : (
              <>
                <div className="flex flex-col gap-8 mb-8">
                  <FindACarTitle />
                  <FindACarStepper currentStep={step} />
                </div>
                {step === 'car' && (
                  <FindACarStep1Form
                    initialData={step1Data ?? undefined}
                    onNext={handleStep1Next}
                  />
                )}
                {step === 'preferences' && (
                  <FindACarStep2Form
                    initialData={step2Data ?? undefined}
                    onBack={handleStep2Back}
                    onNext={handleStep2Next}
                  />
                )}
                {step === 'contact' && (
                  <FindACarStep3Form
                    initialData={step3Data ?? undefined}
                    onBack={handleStep3Back}
                    onSubmit={handleStep3Submit}
                    isSubmitting={createRequest.isPending}
                  />
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-12 lg:sticky lg:top-8">
            <WhatHappensCard />
            <GuaranteesCard />
          </div>
        </div>
      </div>
    </div>
  );
}
