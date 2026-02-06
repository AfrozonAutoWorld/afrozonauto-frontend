'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Car, LogOut, LayoutDashboard, Store, ShieldCheck } from 'lucide-react';
import { useAuthQuery } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthQuery();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">Afrozon</span>
                <span className="text-xl font-light text-emerald-600"> AutoGlobal</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/vehicles" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              Browse Vehicles
            </Link>
            <Link href="/calculator" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              Price Calculator
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              How It Works
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {isSeller && (
                  <Link
                    href="/seller"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    <span className="text-sm font-medium">Sell</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>

                <NotificationBell />

                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  <span className="text-sm text-gray-600">{user?.profile?.firstName || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/onboarding"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link
                href="/vehicles"
                className="text-gray-600 hover:text-emerald-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Vehicles
              </Link>
              <Link
                href="/calculator"
                className="text-gray-600 hover:text-emerald-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Price Calculator
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-emerald-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>

              {user ? (
                <>
                  {isSeller && (
                    <Link
                      href="/seller"
                      className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="w-5 h-5" />
                      <span>Seller Dashboard</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
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
                    className="flex items-center gap-2 text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-emerald-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/onboarding"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-emerald-700"
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
