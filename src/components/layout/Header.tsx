'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, LayoutDashboard, Store, ChevronDown } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { signOut, useSession } from 'next-auth/react';
import { Logo } from '../../lib/Logo';
import { canUseSellerFeatures } from '@/lib/sellerAccess';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user as any;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isSeller = canUseSellerFeatures(user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex gap-2 items-center">
            <Logo className="w-10 h-10 text-emerald-600" />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-[#1A1A1A]">Afrozon</span>
                <span className="text-xl font-light text-[#0C623C]"> AutoGlobal</span>
              </div>
            </Link>
          </div>

          <div className="hidden gap-5 items-center md:flex">
            <Link href="/marketplace" className="font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600 whitespace-nowrap">
              Browse Vehicles
            </Link>

            <Link href="/marketplace/service-repair" className="font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600 whitespace-nowrap">
              Service & Repair
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600"
                >
                  More
                  <ChevronDown className={`h-4 w-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
                    {!isSeller && (
                      <Link
                        href="/seller/landing"
                        className="block rounded-lg px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9FAFB]"
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        Sell Your Vehicle
                      </Link>
                    )}
                    <Link
                      href="/marketplace/calculator"
                      className="block rounded-lg px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9FAFB]"
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      Price Calculator
                    </Link>
                    <Link
                      href="/marketplace/how-it-works"
                      className="block rounded-lg px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9FAFB]"
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      How It Works
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {!isSeller && (
                  <Link
                    href="/seller/landing"
                    className="font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600 whitespace-nowrap"
                  >
                    Sell Your Vehicle
                  </Link>
                )}
                <Link href="/marketplace/calculator" className="font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600 whitespace-nowrap">
                  Price Calculator
                </Link>
                <Link href="/marketplace/how-it-works" className="font-medium text-[#1A1A1A] text-sm transition-colors hover:text-emerald-600 whitespace-nowrap">
                  How It Works
                </Link>
              </>
            )}

            {user ? (
              <div className="flex gap-3 items-center">
                {isSeller && (
                  <Link
                    href="/seller"
                    className="flex items-center gap-1.5 text-[#1A1A1A] text-sm hover:text-emerald-600 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    <span className="text-sm font-medium">Seller Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/marketplace/buyer"
                  className="flex items-center gap-1.5 text-[#1A1A1A] text-sm hover:text-emerald-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>

                <NotificationBell />

                <div className="flex gap-2 items-center pl-3 border-l border-gray-200">
                  <span className="text-sm text-[#1A1A1A]">{user?.profile?.firstName || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 transition-colors hover:text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center">
                <Link
                  href="/login"
                  className="font-medium text-[#1A1A1A] transition-colors hover:text-emerald-600 text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/onboarding"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0D7A4A] rounded-lg transition-colors hover:bg-[#0C623C]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="py-4 border-t border-gray-100 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/marketplace"
                className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Vehicles
              </Link>
              <Link
                href="/marketplace/calculator"
                className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Price Calculator
              </Link>
              <Link
                href="/marketplace/how-it-works"
                className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/marketplace/service-repair"
                className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Service & Repair
              </Link>
              {!isSeller && (
                <Link
                  href="/seller/landing"
                  className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sell Your Vehicle
                </Link>
              )}

              {user ? (
                <>
                  {isSeller && (
                    <Link
                      href="/seller"
                      className="flex gap-2 items-center text-[#1A1A1A] hover:text-emerald-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="w-5 h-5" />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/marketplace/buyer"
                    className="flex gap-2 items-center text-[#1A1A1A] hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex gap-2 items-center text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="font-medium text-[#1A1A1A] hover:text-emerald-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/onboarding"
                    className="px-4 py-2 font-medium text-center text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
