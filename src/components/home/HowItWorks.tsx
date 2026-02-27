'use client';

import { processSteps } from '@/lib/data/constants';
import { ArrowRight } from 'lucide-react';
import { StepCard } from './StepCard';

export function HowItWorks() {
  return (
    <section className="overflow-hidden relative px-4 py-16 md:py-24 md:px-8 lg:px-16 bg-slate-900">
      {/* Decorative blur background element */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl bg-teal-500/10 -z-10" />

      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-16 lg:flex-row lg:items-start lg:justify-between lg:mb-20">
          {/* Title and Description */}
          <div className="flex-1">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              How Afrozon Works
            </h2>
            <p className="max-w-lg text-base text-gray-400 md:text-lg">
              From search to your driveway in Nigeria — a simple 5-step process
              with full transparency at every stage.
            </p>
          </div>

          {/* CTA Button */}
          <button className="flex gap-3 justify-between items-center px-6 py-4 text-white whitespace-nowrap rounded-lg border border-gray-600 backdrop-blur-md transition-colors duration-300 md:px-8 md:py-5 h-fit bg-slate-900/50 hover:bg-slate-800">
            <span className="text-base font-medium md:text-lg">
              Full Process Details
            </span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Horizontal line connecting steps (visible on md and up) */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0" />

          {/* Steps Grid */}
          <div className="grid relative z-10 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
            {processSteps.map((step) => (
              <div key={step.id} className="flex justify-center">
                <StepCard
                  stepNumber={step.stepNumber}
                  title={step.title}
                  description={step.description}
                  iconName={step.iconName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
