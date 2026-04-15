import { apiClient } from "./client";
import {
  normalizeVehicleForUi,
  normalizeVehiclesForUi,
} from "../vehicleNormalize";
import {
  Vehicle,
  VehicleCategory,
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

export type MakeModelsReference = Record<string, string[]>;

export interface SaveVehicleResponse {
  success: boolean;
  data: Vehicle;
  message?: string;
}

const buildQueryString = (filters?: VehicleFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();
  const append = (key: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "browse") {
      return;
    }
    if (key === "fuelType") {
      if (value !== undefined && value !== null && value !== "") params.append("fuel", String(value));
      return;
    }
    append(key, value);
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const defaultMeta: VehicleMeta = {
  page: 1,
  limit: 24,
  total: 0,
  pages: 0,
  fromApi: 0,
  filteredCount: 0,
  hasMore: false,
};

const transformVehiclesResponse = (
  apiResponse?: VehiclesApiResponse | null,
): VehicleListResponse => {
  const raw = apiResponse?.data?.data ?? [];
  return {
    vehicles: normalizeVehiclesForUi(raw),
    meta: apiResponse?.data?.meta ?? defaultMeta,
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

      return transformVehiclesResponse(response?.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw new Error("Failed to fetch vehicles");
    }
  },

  getMakeModelsReference: async (): Promise<MakeModelsReference> => {
    try {
      const response = await apiClient.get<SingleVehicleRes<MakeModelsReference>>(
        `/vehicles/reference/models`,
      );
      return response?.data?.data?.data ?? {};
    } catch (error) {
      console.error("Error fetching make/models reference:", error);
      throw new Error("Failed to fetch make/models reference");
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
      const raw =
        response?.data?.data?.data ?? response?.data?.data;
      return normalizeVehicleForUi(raw);
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

      const raw = response?.data?.data ?? response?.data;
      return normalizeVehicleForUi(raw);
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

  getTrending: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get<{ success: boolean; data: { data: Vehicle[] }; message: string }>(
      "/vehicles/trending",
    );
    const payload = response?.data?.data;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return normalizeVehiclesForUi(raw);
  },

  /** Paginated trending (same ordering as home rail). */
  getTrendingPaginated: async (page: number, limit: number = 24): Promise<VehicleListResponse> => {
    const response = await apiClient.get(`/vehicles/trending`, { params: { page, limit } });
    const envelope = (response as any)?.data?.data;
    const raw = Array.isArray(envelope) ? envelope : (envelope?.data ?? []);
    const m = Array.isArray(envelope) ? undefined : envelope?.meta;
    return {
      vehicles: normalizeVehiclesForUi(raw),
      meta: {
        page: m?.page ?? page,
        limit: m?.limit ?? limit,
        total: m?.total ?? raw.length,
        pages: m?.pages ?? 1,
        fromApi: 0,
        filteredCount: 0,
        hasMore: m?.hasMore ?? false,
        apiUsed: false,
      },
    };
  },

  /** Recommended for you: admin-curated; when logged in, includes saved vehicles with reason "You saved this". */
  getRecommended: async (limit?: number): Promise<Array<{ vehicle: Vehicle; reason?: string }>> => {
    const params = limit != null ? { limit } : undefined;
    const response = await apiClient.get<{
      success: boolean;
      data: { data: Array<{ vehicle: Vehicle; reason?: string }> };
      message: string;
    }>("/vehicles/recommended", { params });
    const payload = response?.data?.data;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return raw.map((row) => ({
      ...row,
      vehicle: normalizeVehicleForUi(row.vehicle),
    }));
  },

  /** Specialty vehicles rail: rule-driven + DB specialty flag. */
  getSpecialty: async (limit?: number): Promise<Array<{ vehicle: Vehicle; reason?: string }>> => {
    const params = limit != null ? { limit } : undefined;
    const response = await apiClient.get<{
      success: boolean;
      data: { data: Array<{ vehicle: Vehicle; reason?: string }> };
      message: string;
    }>("/vehicles/specialty", { params });
    const payload = response?.data?.data;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return raw.map((row) => ({
      ...row,
      vehicle: normalizeVehicleForUi(row.vehicle),
    }));
  },

  /** Paginated recommended browse (same blend as home rail). */
  getRecommendedPaginated: async (page: number, limit: number = 24): Promise<VehicleListResponse> => {
    const response = await apiClient.get("/vehicles/recommended", { params: { page, limit } });
    const envelope = (response as any)?.data?.data;
    const rows = Array.isArray(envelope) ? envelope : (envelope?.data ?? []);
    const m = Array.isArray(envelope) ? undefined : envelope?.meta;
    const vehicles = rows.map((row: { vehicle: Vehicle }) => normalizeVehicleForUi(row.vehicle));
    return {
      vehicles,
      meta: {
        page: m?.page ?? page,
        limit: m?.limit ?? limit,
        total: m?.total ?? vehicles.length,
        pages: m?.pages ?? 1,
        fromApi: 0,
        filteredCount: 0,
        hasMore: m?.hasMore ?? false,
        apiUsed: false,
      },
    };
  },

  /** Paginated specialty browse (same blend as home rail). */
  getSpecialtyPaginated: async (page: number, limit: number = 24): Promise<VehicleListResponse> => {
    const response = await apiClient.get("/vehicles/specialty", { params: { page, limit } });
    const envelope = (response as any)?.data?.data;
    const rows = Array.isArray(envelope) ? envelope : (envelope?.data ?? []);
    const m = Array.isArray(envelope) ? undefined : envelope?.meta;
    const vehicles = rows.map((row: { vehicle: Vehicle }) => normalizeVehicleForUi(row.vehicle));
    return {
      vehicles,
      meta: {
        page: m?.page ?? page,
        limit: m?.limit ?? limit,
        total: m?.total ?? vehicles.length,
        pages: m?.pages ?? 1,
        fromApi: 0,
        filteredCount: 0,
        hasMore: m?.hasMore ?? false,
        apiUsed: false,
      },
    };
  },

  getRailPage: async (
    mode: "trending" | "recommended" | "specialty",
    page: number,
    limit: number = 24,
  ): Promise<VehicleListResponse> => {
    switch (mode) {
      case "trending":
        return vehiclesApi.getTrendingPaginated(page, limit);
      case "recommended":
        return vehiclesApi.getRecommendedPaginated(page, limit);
      case "specialty":
        return vehiclesApi.getSpecialtyPaginated(page, limit);
      default:
        return { vehicles: [], meta: { ...defaultMeta, page, limit } };
    }
  },

  getCategories: async (): Promise<VehicleCategory[]> => {
    const response = await apiClient.get<{ success: boolean; data: { data: VehicleCategory[] }; message: string }>(
      "/vehicles/categories",
    );
    const payload = response?.data?.data;
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  /** Get current user's saved vehicles (auth required). */
  getSavedVehicles: async (): Promise<Array<{ vehicle: Vehicle; savedAt: string }>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { data: Array<{ vehicle: Vehicle; savedAt: string }> };
      message: string;
    }>("/vehicles/saved");
    const payload = response?.data?.data;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return raw.map((row) => ({
      ...row,
      vehicle: normalizeVehicleForUi(row.vehicle),
    }));
  },

  /** Add vehicle to saved list (auth required). Vehicle must exist in DB; use saveVehicle first for API-only listings. */
  addSavedVehicle: async (vehicleId: string): Promise<{ savedAt: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { savedAt: string };
      message: string;
    }>("/vehicles/saved", { vehicleId });
    const data = response?.data?.data;
    return data ?? (response?.data as any)?.data;
  },

  /** Remove vehicle from saved list (auth required). */
  removeSavedVehicle: async (vehicleId: string): Promise<void> => {
    await apiClient.delete(`/vehicles/saved/${vehicleId}`);
  },
};

// Export types
export type {
  Vehicle,
  VehicleCategory,
  VehicleFilters,
  VehicleMeta,
  VehiclesApiResponse,
  VehicleListResponse,
};
