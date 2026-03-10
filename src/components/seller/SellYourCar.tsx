"use client";

import Link from "next/link";
import { Search, Car } from "lucide-react";

export function SellYourCar() {
  return (
    <section className="py-16 bg-[#F9FAFB]">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 rounded-3xl bg-[linear-gradient(90deg,#00A67E_0%,#059669_100%)] shadow-[0px_25px_50px_-12px_rgba(0,166,126,0.2)]">
          {/* Large car illustration background */}
          <div className="pointer-events-none absolute -right-40 -bottom-40 w-[420px] h-[420px] rotate-[-6.87deg] opacity-30">
            <div className="flex items-center justify-center w-full h-full rounded-[48px] bg-white/10">
              <Car className="w-80 h-80 text-white/50" aria-hidden />
            </div>
          </div>

          {/* Content */}
          <div className="flex relative flex-col gap-6 max-w-2xl md:max-w-3xl">
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-[40px] lg:leading-[52px] font-bold text-white">
              Ready to sell your car for what it&apos;s worth?
            </h2>
            <p className="text-base leading-relaxed font-body sm:text-lg text-white/90">
              Join 200+ sellers who've found the right buyers through Afrozon.
              Free valuation. No commitment. No fees to list.e dealerships
              specifically for you. Tell us what you need, and we&apos;ll find
              it.
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/seller/register"
                className="inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-medium text-white bg-[#003B33] rounded-lg shadow-sm hover:bg-[#012821] transition-colors w-fit"
              >
                <span>Become a seller</span>
              </Link>
              {/* <Link
                href="/find-a-car"
                className="inline-flex gap-2 items-center px-8 py-4 text-base font-medium rounded-lg border-2 transition-colors sm:text-lg text-white/90 border-white/80 hover:bg-white/10 w-fit"
              >
                <span>Get Free Evaluation</span>
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
