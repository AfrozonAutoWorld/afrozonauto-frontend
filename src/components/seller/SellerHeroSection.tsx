"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SellerHeroSection() {
  return (
    <section
      className="relative w-full min-h-[380px] sm:min-h-[480px] lg:min-h-[586px] overflow-hidden"
      aria-label="Sell your car"
    >
      {/* Background image - overflow so it extends beyond section (design: image bleeds -56px left, -160px top) */}
      <div
        className="absolute -left-14 -top-40 w-[calc(100%+7rem)] h-[calc(100%+10rem)] sm:-left-16 sm:-top-44 sm:w-[calc(100%+8rem)] sm:h-[calc(100%+12rem)] lg:-left-[56px] lg:-top-40 lg:w-[calc(100%+112px)] lg:h-[calc(100%+14rem)]"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: "url(/bgSeller.png)" }}
        />
      </div>

      {/* Gradient overlay - cars show through slightly when gradient has some transparency */}
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,#0A3C34_0%,#085030_100%)] opacity-[0.92]"
        aria-hidden
      />

      {/* Content */}
      <div className="flex relative z-10 flex-col gap-8 items-start px-4 pt-12 pb-16 mx-auto max-w-7xl sm:gap-12 sm:pt-16 sm:pb-20 lg:gap-12 lg:pt-20 lg:pb-24">
        <div className="flex flex-col items-start gap-6 sm:gap-[21px] w-full">
          {/* Breadcrumb */}
          <nav
            className="flex flex-row gap-4 items-center sm:gap-6 font-body"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="text-sm font-normal leading-5 text-[#E8E8E8] hover:text-white transition-colors"
            >
              HOME
            </Link>
            <ChevronRight
              className="w-4 h-4 shrink-0 text-[#E8E8E8]"
              aria-hidden
            />
            <span className="text-sm font-semibold leading-5 text-[#E6F6F4]">
              SELL YOUR CAR
            </span>
          </nav>

          {/* Headline + description */}
          <div className="flex flex-col gap-4 justify-center items-start w-full sm:gap-5">
            <h1 className="font-sans font-bold text-3xl leading-tight sm:text-4xl sm:leading-snug md:text-[48px] md:leading-[60px] text-white w-full">
              Sell your car for the{" "}
              <span className="text-[#2CE69B]">best price.</span>
              <br />
              Fast. Stress-free.
            </h1>
            <p className="font-body font-medium text-base leading-relaxed sm:text-lg sm:leading-7 text-white max-w-[578px]">
              Afrozon connects US-based vehicle sellers directly with verified Nigerian buyers. No haggling, no middlemen, only a fair offer, handled start to finish.
            </p>
          </div>
        </div>

        {/* Single CTA - Start Listing my Car */}
        <div className="flex flex-row gap-6 items-center w-full">
          <Link
            href="/seller/register"
            className="inline-flex flex-row justify-end items-center py-[18px] px-8 gap-2.5 min-h-[64px] bg-[#0D7A4A] rounded-lg font-body font-medium text-lg leading-7 text-white hover:bg-[#0a6540] transition-colors"
          >
            Start Listing my Car
          </Link>
        </div>
      </div>
    </section>
  );
}
