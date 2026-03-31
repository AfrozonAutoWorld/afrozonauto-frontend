"use client";

import type { LucideIcon } from "lucide-react";
import { Wrench, Stethoscope, Paintbrush, Cog } from "lucide-react";

const OFFERINGS: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  {
    title: "Routine Maintenance",
    description:
      "Keep your vehicle running smoothly with scheduled servicing, oil changes, and comprehensive multi-point inspections.",
    Icon: Wrench,
  },
  {
    title: "Advanced Diagnostics",
    description:
      "State-of-the-art computer diagnostics to quickly and accurately identify electrical, engine, or transmission issues.",
    Icon: Stethoscope,
  },
  {
    title: "Paint & Body Parts",
    description:
      "From minor scratch removal and dent repair to full body restoration and professional detailing services.",
    Icon: Paintbrush,
  },
  {
    title: "Genuine OEM Parts",
    description:
      "We use only manufacturer-approved genuine parts to ensure the longevity, safety, and performance of your car.",
    Icon: Cog,
  },
];

function OfferingCard({
  title,
  description,
  Icon,
}: Readonly<{ title: string; description: string; Icon: LucideIcon }>) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#003B33]">
        <Icon className="h-5 w-5 text-[#E6F6F4]" />
      </div>
      <h3 className="text-xl font-semibold text-[#484848]">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-[#546881]">{description}</p>
    </article>
  );
}

export function ServiceOfferings() {
  return (
    <section className="bg-[#F9FAFB] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-sans text-4xl font-bold text-[#1D242D]">Our Future Service Offerings</h2>
        <p className="mt-1 text-base text-[#64748B]">Everything your car needs under one roof</p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            {OFFERINGS.slice(0, 2).map((item) => (
              <OfferingCard key={item.title} {...item} />
            ))}
          </div>

          <div className="overflow-hidden rounded-3xl shadow-[0px_25px_50px_-12px_rgba(0,166,126,0.2)]">
            <img
              src="/serviceOffering.png"
              alt="Service technician working under hood"
              className="h-full min-h-[340px] w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            {OFFERINGS.slice(2, 4).map((item) => (
              <OfferingCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
