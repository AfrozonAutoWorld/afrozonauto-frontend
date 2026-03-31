"use client";

import { WaitlistForm } from "./WaitlistForm";

export function ServiceHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(90deg,#003B33_0%,#0D7A4A_100%)] py-16 sm:py-20">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff22_1px,transparent_1px)] [background-size:32px_100%]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-sans text-4xl font-bold leading-tight text-white sm:text-5xl">
            Expert Care for Your New Ride - <span className="text-[#8DE8C8]">Coming Soon!</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
            A state-of-the-art service center is under construction to provide premium
            maintenance and repair, keeping your imported car in perfect condition.
            Drop your email below to join the waitlist and get early access.
          </p>

          <div className="mt-7">
            <WaitlistForm inputId="service-hero-waitlist-email" />
          </div>
        </div>
      </div>
    </section>
  );
}
