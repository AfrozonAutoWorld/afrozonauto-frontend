'use client';

import { Suspense } from 'react';
import { ResetPassword } from '@/views/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
