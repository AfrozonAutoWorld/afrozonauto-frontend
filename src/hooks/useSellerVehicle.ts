'use client';

import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getPublicApiBaseUrl } from '@/lib/api/publicApiUrl';

interface SubmitResponse {
  data?: { id?: string; data?: { id?: string } } | null;
  [key: string]: unknown;
}

export function useSubmitSellerVehicle() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<SubmitResponse> => {
      const baseUrl = getPublicApiBaseUrl();

      const token = session?.accessToken;
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${baseUrl}/seller-vehicles/submit`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        // eslint-disable-next-line no-console
        console.error('Sell vehicle submit failed', error);
        throw new Error(error?.error || 'Failed to submit vehicle');
      }

      return res.json();
    },
  });
}

