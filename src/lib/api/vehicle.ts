import { apiClient } from "./client";
import {
  Vehicle,
  VehicleFilters,
  VehicleMeta,
  VehiclesApiResponse,
  VehicleListResponse,
} from "../../types";

export interface SaveVehiclePayload {
  vin: string;
  listing: {
    vin: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    bodyStyle: string;
    transmission: string;
    fuelType: string;
    exteriorColor: string;
    interiorColor: string;
    dealerName: string;
    dealerState: string;
    dealerCity: string;
    dealerZipCode: string;
    features: string[];
  };
  photos: string[];
  specs: {
    engine: string;
    horsepower: number;
    torque: number;
  };
}

export interface SingleVehicleRes<T> {
  success: boolean;
  message: string;
  data: {
    data: T;
  };
  timestamp: string;
}

export interface SaveVehicleResponse {
  success: boolean;
  data: Vehicle;
  message?: string;
}

const buildQueryString = (filters?: VehicleFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const transformVehiclesResponse = (
  apiResponse: VehiclesApiResponse,
): VehicleListResponse => {
  return {
    vehicles: apiResponse.data.data,
    meta: apiResponse.data.meta,
  };
};

export const vehiclesApi = {
  /**
   * Get all vehicles with optional filters
   * @param filters - Optional filters for vehicle search
   * @returns Promise with vehicles and metadata
   */
  getAll: async (filters?: VehicleFilters): Promise<VehicleListResponse> => {
    try {
      const queryString = buildQueryString(filters);
      const response = await apiClient.get<VehiclesApiResponse>(
        `/vehicles${queryString}`,
      );

      return transformVehiclesResponse(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw new Error("Failed to fetch vehicles");
    }
  },

  /**
   * Get a single vehicle by ID or VIN
   * @param id - Vehicle ID or VIN
   * @returns Promise with vehicle data
   */
  getById: async (id: string) => {
    try {
      const response = await apiClient.get<SingleVehicleRes<Vehicle>>(
        `/vehicles/${id}`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching vehicle ${id}:`, error);
      throw new Error(`Failed to fetch vehicle with ID: ${id}`);
    }
  },

  /**
   * Save a new vehicle
   * @param payload - Vehicle data payload
   * @returns Promise with saved vehicle data
   */

  saveVehicle: async (payload: SaveVehiclePayload): Promise<Vehicle> => {
    try {
      const response = await apiClient.post<SaveVehicleResponse>(
        "/vehicles/save-from-api",
        payload,
      );

      return response.data.data;
    } catch (error) {
      console.error("Error saving vehicle:", error);
      throw new Error("Failed to save vehicle");
    }
  },

  /**
   * Search vehicles by query string
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Promise with search results
   */
  search: async (
    query: string,
    filters?: Omit<VehicleFilters, "search">,
  ): Promise<VehicleListResponse> => {
    return vehiclesApi.getAll({
      ...filters,
      search: query,
    });
  },
};

// Export types
export type {
  Vehicle,
  VehicleFilters,
  VehicleMeta,
  VehiclesApiResponse,
  VehicleListResponse,
};
