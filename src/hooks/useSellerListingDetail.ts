'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getPublicApiBaseUrl } from '@/lib/api/publicApiUrl';
import {
  mapSellerApiVehicleToMarketplace,
  type SellerListingVehicle,
} from '@/lib/marketplace/mapSellerVehicle';
import type { MarketplaceVehicle } from '@/lib/marketplace/types';

export type SellerListingDetail = {
  marketplace: MarketplaceVehicle;
  raw: SellerListingVehicle;
  viewCount: number;
  saveCount: number;
};

function parseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return 'Request failed';
}

export function useSellerListingDetail(listingId: string) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  return useQuery<SellerListingDetail>({
    queryKey: ['seller-listing-detail', listingId],
    enabled: !!listingId && status === 'authenticated' && !!token,
    queryFn: async () => {
      const base = getPublicApiBaseUrl();
      const res = await fetch(`${base}/seller-vehicles/${listingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(parseErrorMessage(json));
      }
      const raw = json?.data?.data as SellerListingVehicle | undefined;
      if (!raw?.id) {
        throw new Error('Invalid listing response');
      }
      return {
        marketplace: mapSellerApiVehicleToMarketplace(raw),
        raw,
        viewCount: raw.viewCount ?? 0,
        saveCount: raw.saveCount ?? 0,
      };
    },
  });
}
