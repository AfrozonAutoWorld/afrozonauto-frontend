'use client';

import { useMutation } from '@tanstack/react-query';

interface SubmitResponse {
  data?: { id?: string } | null;
  [key: string]: any;
}

export function useSubmitSellerVehicle() {
  return useMutation({
    mutationFn: async (formData: FormData): Promise<SubmitResponse> => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        throw new Error('API base URL is not configured.');
      }

      const res = await fetch(`${baseUrl}/seller-vehicles/submit`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
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

