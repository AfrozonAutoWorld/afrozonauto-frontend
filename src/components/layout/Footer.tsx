"use client";

import Link from "next/link";
import {
  Car,
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Logo } from "@/lib/Logo";

function FooterBrandColumn() {
  return (
    <div className="space-y-6 text-center md:text-left">
      <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo
            className="h-10 w-10 text-emerald-600"
            src="/logo_on_dark.svg"
          />
          <div className="hidden sm:block">
            <span className="text-xl font-bold text-white">Afrozon</span>
            <span className="text-xl font-light text-[#0C623C]"> AutoGlobal</span>
          </div>
        </Link>
      </div>

      <p className="mx-auto max-w-xs font-body text-sm leading-5 text-[#E8E8E8] md:mx-0">
        Your trusted partner for importing verified vehicles from the United
        States to Africa. We handle everything from sourcing to delivery.
      </p>

      <div className="flex flex-col items-center space-y-3 text-sm leading-5 md:items-start">
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A67E]">
            <Mail className="h-3 w-3 text-white" aria-hidden />
          </span>
          <span>support@afrozonauto.com</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A67E]">
            <Phone className="h-3 w-3 text-white" aria-hidden />
          </span>
          <span>+234 800 000 0000</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A67E]">
            <MapPin className="h-3 w-3 text-white" aria-hidden />
          </span>
          <span>Lagos, Nigeria</span>
        </div>
      </div>
    </div>
  );
}

function FooterLinksColumn() {
  return (
    <div className="space-y-4 text-center md:text-left">
      <h3 className="font-body text-[18px] leading-7 font-bold text-white">
        Quick Links
      </h3>
      <ul className="space-y-3 font-body text-sm leading-5 text-[#E8E8E8]">
        <li>
          <Link
            href="/marketplace"
            className="transition-colors hover:text-[#00A67E]"
          >
            Browse Vehicles
          </Link>
        </li>
        <li>
          <Link
            href="/calculator"
            className="transition-colors hover:text-[#00A67E]"
          >
            Price Calculator
          </Link>
        </li>
        <li>
          <Link
            href="/marketplace/how-it-works"
            className="transition-colors hover:text-[#00A67E]"
          >
            How It Works
          </Link>
        </li>
        <li>
          <Link
            href="/broker-service"
            className="transition-colors hover:text-[#00A67E]"
          >
            Broker Service
          </Link>
        </li>
        <li>
          <Link href="/faq" className="transition-colors hover:text-[#00A67E]">
            FAQs
          </Link>
        </li>
      </ul>
    </div>
  );
}

function FooterLegalColumn() {
  return (
    <div className="space-y-4 text-center md:text-left">
      <h3 className="font-body text-[18px] leading-7 font-bold text-white">
        Legal
      </h3>
      <ul className="space-y-3 font-body text-sm leading-5 text-[#E8E8E8]">
        <li>
          <Link
            href="/terms"
            className="transition-colors hover:text-[#00A67E]"
          >
            Terms of Service
          </Link>
        </li>
        <li>
          <Link
            href="/privacy"
            className="transition-colors hover:text-[#00A67E]"
          >
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link
            href="/refund-policy"
            className="transition-colors hover:text-[#00A67E]"
          >
            Refund Policy
          </Link>
        </li>
        <li>
          <Link
            href="/cookie-policy"
            className="transition-colors hover:text-[#00A67E]"
          >
            Cookie Policy
          </Link>
        </li>
      </ul>
    </div>
  );
}

function FooterNewsletterColumn() {
  return (
    <div className="space-y-4 text-center md:text-left">
      <h3 className="font-body text-[18px] leading-7 font-bold text-white">
        Newsletter
      </h3>
      <p className="mx-auto max-w-xs font-body text-sm leading-5 text-[#E8E8E8] md:mx-0">
        Subscribe to get the latest vehicle deals and export news.
      </p>
      <form
        onSubmit={e => e.preventDefault()}
        className="flex w-full max-w-xs overflow-hidden rounded-lg border border-white/10 bg-white/5 mx-auto md:mx-0"
      >
        <input
          type="email"
          placeholder="Email address"
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-[#A3ADBB] focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center bg-[#00A67E] px-3 transition-colors hover:bg-[#059669]"
          aria-label="Subscribe to newsletter"
        >
          <Send className="h-4 w-4 text-white" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function FooterBottomBar() {
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-center md:flex-row md:text-left">
      <p className="font-body text-[12px] leading-4 text-[#A3ADBB]">
        © {year} Afrozon AutoGlobal. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="https://facebook.com"
          aria-label="Facebook"
          className="text-[#A3ADBB] transition-colors hover:text-white"
        >
          <Facebook className="w-5 h-5" aria-hidden />
        </Link>
        <Link
          href="https://instagram.com"
          aria-label="Instagram"
          className="text-[#A3ADBB] transition-colors hover:text-white"
        >
          <Instagram className="w-5 h-5" aria-hidden />
        </Link>
        <Link
          href="https://twitter.com"
          aria-label="Twitter"
          className="text-[#A3ADBB] transition-colors hover:text-white"
        >
          <Twitter className="w-5 h-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0B1222] text-[#E8E8E8]">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <FooterBrandColumn />
            <FooterLinksColumn />
            <FooterLegalColumn />
            <FooterNewsletterColumn />
          </div>

          <FooterBottomBar />
        </div>
      </div>
    </footer>
  );
}
