'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  SellerAuthLayout,
  type SellerAuthStep,
} from '@/components/seller/auth/SellerAuthLayout';

export default function SellerRegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  let activeStep: SellerAuthStep = 'signup';
  if (pathname?.includes('/seller/register/verify')) {
    activeStep = 'verify_identity';
  } else if (pathname?.includes('/seller/register/complete')) {
    activeStep = 'list_vehicle';
  }

  return <SellerAuthLayout activeStep={activeStep}>{children}</SellerAuthLayout>;
}
