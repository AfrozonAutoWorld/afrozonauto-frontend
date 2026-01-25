import { apiClient } from "./client";
import type { VehicleRequest, Vehicle } from "../../types";

export interface RequestWithVehicle extends VehicleRequest {
  vehicle: Vehicle;
}

export interface CreateRequestData {
  vehicleId: string;
  shippingMethod: string;
  destinationState: string;
  destinationCountry: string;
  destinationAddress: string;
  notes?: string;
}

export const requestsApi = {
  getAll: () => apiClient.get<RequestWithVehicle[]>("/requests"),

  getById: (id: string) => apiClient.get<RequestWithVehicle>(`/requests/${id}`),

  create: (data: CreateRequestData) =>
    apiClient.post<RequestWithVehicle>("/requests", data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<RequestWithVehicle>(`/requests/${id}`, { status }),

  delete: (id: string) => apiClient.delete<void>(`/requests/${id}`),
};
