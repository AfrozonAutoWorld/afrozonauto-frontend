'use client';

import Link from 'next/link';
import { HeroSection } from '@/components/home';
import { ChevronRight } from 'lucide-react';

const inputBase = 'font-body text-[15px] leading-6 text-[#1A1A1A]';

export function PrivacyPolicyView() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <HeroSection
        breadcrumbs={
          <nav className="flex flex-row gap-6 items-center font-body" aria-label="Breadcrumb">
            <Link
              href="/"
              className="shrink-0 text-[14px] leading-5 font-normal text-[#E8E8E8] hover:text-white transition-colors"
            >
              HOME
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0 text-[#E8E8E8]" aria-hidden />
            <span className="shrink-0 text-[14px] leading-5 font-semibold text-[#E6F6F4]">
              PRIVACY POLICY
            </span>
          </nav>
        }
        headerText="Privacy Policy"
        descriptionText="How we collect, use, and protect your information when you use Afrozon AutoGlobal to source and import vehicles from the US to Nigeria."
        shouldShowSearch={false}
        shouldShowFilters={false}
        minHeightClass="min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]"
      />

      <article className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-3xl mx-auto">
        <p className={`${inputBase} text-[#666666] mb-10`}>
          Last updated: February 2026. Afrozon AutoGlobal (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains how we handle your data in connection with our vehicle sourcing, escrow, inspection, and shipping services from the United States to Nigeria.
        </p>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            1. Information we collect
          </h2>
          <p className={`${inputBase} text-[#414651] mb-4`}>
            We collect information you provide when you use our platform, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-[15px] leading-6 text-[#414651] mb-4">
            <li><strong>Account and profile:</strong> name, email, phone number, and delivery address when you register or complete a request.</li>
            <li><strong>Vehicle requests:</strong> make, model, year, budget, preferences (e.g. colour, shipping method), and any notes you submit for sourcing.</li>
            <li><strong>Orders and payments:</strong> payment details (processed by our secure payment partners), transaction references, and escrow-related information.</li>
            <li><strong>Communications:</strong> messages and contact history with our team regarding quotes, inspections, and delivery.</li>
          </ul>
          <p className={`${inputBase} text-[#414651]`}>
            We may also collect technical data (e.g. IP address, device type, browser) and usage data to improve our services and security.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            2. How we use your information
          </h2>
          <p className={`${inputBase} text-[#414651] mb-4`}>
            We use your information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-[15px] leading-6 text-[#414651]">
            <li>Source vehicles from US dealers and auctions according to your specifications.</li>
            <li>Send you quotes, sourcing updates, and landed-cost estimates.</li>
            <li>Manage escrow, inspections, payments, and shipping for your order.</li>
            <li>Contact you about your request or order (e.g. approvals, delivery).</li>
            <li>Comply with legal and regulatory requirements (e.g. customs, anti‑fraud).</li>
            <li>Improve our platform, customer support, and marketing (where you have agreed).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            3. Legal basis and consent
          </h2>
          <p className={`${inputBase} text-[#414651]`}>
            We process your data where necessary to perform our contract with you (sourcing, escrow, shipping), to comply with law, or with your consent (e.g. marketing). By submitting a vehicle request or creating an account, you agree to be contacted regarding that request. You can withdraw consent for marketing at any time by contacting us or using the link in our emails.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            4. Sharing and disclosure
          </h2>
          <p className={`${inputBase} text-[#414651] mb-4`}>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-[15px] leading-6 text-[#414651]">
            <li><strong>Service providers:</strong> payment and escrow partners, inspection and shipping companies, and IT and support tools, under strict confidentiality.</li>
            <li><strong>US and Nigerian partners:</strong> dealers, auctions, and logistics providers only as needed to fulfil your order.</li>
            <li><strong>Authorities:</strong> when required by law (e.g. customs, tax, or legal process).</li>
          </ul>
          <p className={`${inputBase} text-[#414651] mt-4`}>
            We do not sell your personal data. We require partners to use your data only for the purposes we specify and to protect it appropriately.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            5. Data retention and security
          </h2>
          <p className={`${inputBase} text-[#414651] mb-4`}>
            We keep your data for as long as needed to provide our services, resolve disputes, and meet legal obligations (e.g. tax and customs records). We use industry-standard measures to protect your data (encryption, access controls, secure payments). No method of transmission or storage is 100% secure; we will notify you and regulators where we are required to do so in the event of a breach.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            6. Your rights
          </h2>
          <p className={`${inputBase} text-[#414651] mb-4`}>
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-body text-[15px] leading-6 text-[#414651]">
            <li>Access, correct, or delete your personal data.</li>
            <li>Restrict or object to certain processing.</li>
            <li>Data portability (e.g. a copy of your data in a usable format).</li>
            <li>Lodge a complaint with a supervisory authority.</li>
          </ul>
          <p className={`${inputBase} text-[#414651] mt-4`}>
            To exercise these rights or ask questions about this policy, contact us at the details below.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            7. Cookies and similar technologies
          </h2>
          <p className={`${inputBase} text-[#414651]`}>
            We use cookies and similar technologies to run our site, remember your preferences, and analyse usage. You can manage cookies through your browser settings. Disabling some cookies may affect how the site works.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            8. International transfers
          </h2>
          <p className={`${inputBase} text-[#414651]`}>
            Your data may be processed in the US, Nigeria, and other countries where our partners operate. We ensure appropriate safeguards (e.g. contracts, adequacy decisions) where required by law.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            9. Changes to this policy
          </h2>
          <p className={`${inputBase} text-[#414651]`}>
            We may update this policy from time to time. We will post the revised policy on this page and update the &quot;Last updated&quot; date. For material changes, we may notify you by email or a notice on our platform. Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#1A1A1A] mb-4">
            10. Contact us
          </h2>
          <p className={`${inputBase} text-[#414651]`}>
            For privacy requests, questions, or complaints, contact Afrozon AutoGlobal at:{' '}
            <a
              href="mailto:privacy@afrozonautoglobal.com"
              className="text-[#0D7A4A] underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#0D7A4A]/20 rounded"
            >
              privacy@afrozonautoglobal.com
            </a>
            . We will respond within a reasonable time and in line with applicable law.
          </p>
        </section>

        <p className={`${inputBase} text-[#969696] mt-12`}>
          © {new Date().getFullYear()} Afrozon AutoGlobal. All rights reserved.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body font-medium text-[#0D7A4A] hover:text-[#0C623C] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </article>
    </div>
  );
}
