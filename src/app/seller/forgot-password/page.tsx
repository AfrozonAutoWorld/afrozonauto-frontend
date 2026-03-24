'use client';

import { SellerAuthLayout } from '@/components/seller/auth/SellerAuthLayout';
import { ForgotPassword } from '@/views/ForgotPassword';

export default function SellerForgotPasswordPage() {
  return (
    <SellerAuthLayout
      activeStep="signup"
      variant="password_recovery"
      passwordRecoveryStep={1}
    >
      <ForgotPassword
        embedded
        links={{
          loginHref: '/login?as=seller',
          resetPasswordHref: '/seller/reset-password',
        }}
      />
    </SellerAuthLayout>
  );
}
