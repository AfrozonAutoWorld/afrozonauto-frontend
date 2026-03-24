'use client';

import { SellerAuthLayout } from '@/components/seller/auth/SellerAuthLayout';
import { ResetPassword } from '@/views/ResetPassword';

export default function SellerResetPasswordPage() {
  return (
    <SellerAuthLayout
      activeStep="signup"
      variant="password_recovery"
      passwordRecoveryStep={2}
    >
      <ResetPassword
        embedded
        links={{ loginHref: '/login?as=seller' }}
      />
    </SellerAuthLayout>
  );
}
