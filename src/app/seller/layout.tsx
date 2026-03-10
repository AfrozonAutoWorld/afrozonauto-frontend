'use client';

import { useSession } from 'next-auth/react';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function SellerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session } = useSession();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const profile = session?.user?.profile;
  const sellerStatus = profile?.sellerStatus;
  const isPending = sellerStatus === 'PENDING';
  const isRejected = sellerStatus === 'REJECTED';
  const showBanner = (isPending || isRejected) && !bannerDismissed;

  return (
    <div className="min-h-[60vh]">
      {showBanner && (
        <div
          className={
            isRejected
              ? 'bg-amber-50 border-b border-amber-200'
              : 'bg-emerald-50 border-b border-emerald-200'
          }
        >
          <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex gap-3 items-start">
              <AlertCircle
                className={
                  isRejected
                    ? 'flex-shrink-0 w-5 h-5 text-amber-600'
                    : 'flex-shrink-0 w-5 h-5 text-emerald-600'
                }
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                {isPending && (
                  <p className="text-sm text-emerald-800">
                    Your seller account is under review. You can explore your
                    dashboard and prepare listings; submitting new vehicles will
                    be available once your account is verified.
                  </p>
                )}
                {isRejected && (
                  <p className="text-sm text-amber-800">
                    Your seller application was not approved. Contact support if
                    you have questions.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="flex-shrink-0 p-1 rounded transition-colors hover:bg-white/50"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
