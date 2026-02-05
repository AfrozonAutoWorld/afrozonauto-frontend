'use client';

import { useCallback, useEffect } from 'react';
import { useAuthStore, isJWTExpired } from '@/lib/authStore';
import { useTokenRefresh } from '@/hooks/useAuth';

export function AuthHydration() {
  const { isAuthenticated, accessToken, refreshToken, clearAuth, isHydrated } =
    useAuthStore();

  const clearAuthCallback = useCallback(clearAuth, [clearAuth]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const isExpired = isJWTExpired(accessToken);
      const hasRefresh = !!refreshToken;

      if (isExpired && !hasRefresh) {
        clearAuthCallback();
      }
    }
  }, [isHydrated, isAuthenticated, accessToken, refreshToken, clearAuthCallback]);

  useTokenRefresh();

  return null;
}
