'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
        const msg =
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : 'Failed to submit vehicle';
        throw new Error(msg);
      }

      return res.json();
    },
  });
}

export function useUpdateSellerVehicle() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const baseUrl = getPublicApiBaseUrl();
      const token = session?.accessToken;
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${baseUrl}/seller-vehicles/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
        headers,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        const msg =
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : 'Failed to update listing';
        throw new Error(msg);
      }

      return res.json();
    },
  });
}

export function useMarkSellerListingSold() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const baseUrl = getPublicApiBaseUrl();
      const token = session?.accessToken;
      const res = await fetch(`${baseUrl}/seller-vehicles/${id}/mark-sold`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        const msg =
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : 'Failed to mark as sold';
        throw new Error(msg);
      }

      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketplace-vehicles'] });
      qc.invalidateQueries({ queryKey: ['seller-listing-detail'] });
    },
  });
}

