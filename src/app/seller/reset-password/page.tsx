'use client';

import { Suspense } from 'react';
import { SellerAuthLayout } from '@/components/seller/auth/SellerAuthLayout';
import { ResetPassword } from '@/views/ResetPassword';

export default function SellerResetPasswordPage() {
  return (
    <SellerAuthLayout
      activeStep="signup"
      variant="password_recovery"
      passwordRecoveryStep={2}
    >
      <Suspense
        fallback={
          <div className="flex w-full items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          </div>
        }
      >
        <ResetPassword embedded links={{ loginHref: '/login?as=seller' }} />
      </Suspense>
    </SellerAuthLayout>
  );
}
