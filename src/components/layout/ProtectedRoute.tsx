'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: Props) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();

  const [isHydrated, setIsHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !accessToken)) {
      router.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, accessToken, router, redirectTo]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
