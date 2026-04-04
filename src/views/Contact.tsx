'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

const SUPPORT_EMAIL = 'support@afrozonauto.com';
const SUPPORT_PHONE = '+234 800 000 0000';

export function Contact() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-body text-sm font-medium text-[#0D7A4A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <h1 className="font-sans text-3xl font-bold text-[#1A1A1A] sm:text-4xl">Contact us</h1>
        <p className="mt-3 font-body text-base leading-relaxed text-[#4B5563]">
          Reach our team for questions about orders, payments, or listings. We typically reply within one business day.
        </p>

        <ul className="mt-10 space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <li className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0D7A4A]">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-body text-sm font-medium text-[#6B7280]">Email</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-1 font-body text-lg font-semibold text-[#111827] underline decoration-[#0D7A4A]/30 underline-offset-2 hover:text-[#0D7A4A]"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0D7A4A]">
              <Phone className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-body text-sm font-medium text-[#6B7280]">Phone</p>
              <a
                href="tel:+2348000000000"
                className="mt-1 font-body text-lg font-semibold text-[#111827] hover:text-[#0D7A4A]"
              >
                {SUPPORT_PHONE}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#0D7A4A]">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-body text-sm font-medium text-[#6B7280]">Office</p>
              <p className="mt-1 font-body text-lg font-semibold text-[#111827]">Lagos, Nigeria</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
