"use client";

import { Car } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export function ReadyToExperience() {
  return (
    <section className="bg-[#F9FAFB] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(90deg,#00A67E_0%,#10B981_100%)] px-6 py-10 shadow-[0px_25px_50px_-12px_rgba(0,166,126,0.2)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute -right-32 -bottom-28 opacity-20">
            <Car className="h-[260px] w-[260px] text-white" aria-hidden />
          </div>

          <div className="relative max-w-2xl">
            <h2 className="font-sans text-4xl font-bold leading-tight text-white sm:text-5xl">
              Ready to Experience
              <br />
              Unmatched Auto Care?
            </h2>
            <p className="mt-4 text-sm text-white/90 sm:text-base">
              We are building a world-class workshop to support your imported vehicle.
              Be the first to know when we launch and get exclusive updates.
            </p>

            <div className="mt-7">
              <WaitlistForm inputId="service-ready-waitlist-email" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
