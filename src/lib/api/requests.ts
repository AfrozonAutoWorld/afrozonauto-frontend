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
  getAll: () => apiClient.get<RequestWithVehicle[]>("/requests", true),

  getById: (id: string) =>
    apiClient.get<RequestWithVehicle>(`/requests/${id}`, true),

  create: (data: CreateRequestData) =>
    apiClient.post<RequestWithVehicle>("/requests", data, true),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<RequestWithVehicle>(`/requests/${id}`, { status }, true),

  delete: (id: string) => apiClient.delete<void>(`/requests/${id}`, true),
};
