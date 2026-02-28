import { apiClient } from './client';

/**
 * Payload for Find a Car form (steps 1 + 2 + 3).
 * Must match backend CreateSourcingRequestDto.
 */
export interface CreateSourcingRequestPayload {
  make: string;
  model: string;
  yearFrom?: string;
  yearTo?: string;
  trim?: string;
  condition: 'used' | 'new' | 'either';

  budgetUsd: string;
  exteriorColor: string;
  anyColor: boolean;
  shipping: 'roro' | 'container';
  timeline: string;

  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  deliveryCity?: string;
  additionalNotes?: string;
  consentContact: boolean;
}

export interface SourcingRequestCreated {
  id: string;
  requestNumber: string;
  status: string;
  make: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  condition: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  deliveryCity: string | null;
  shippingMethod: string;
  timeline: string;
  createdAt: string;
  trim: string | null;
  budgetUsd: string | null;
  exteriorColor: string | null;
  anyColor: boolean;
  additionalNotes: string | null;
  consentContact: boolean;
  phoneCode: string;
  updatedAt: string;
}

export const sourcingRequestsApi = {
  create: (payload: CreateSourcingRequestPayload) =>
    apiClient.post<{ data: SourcingRequestCreated; message: string }>('/sourcing-requests', payload),
};
