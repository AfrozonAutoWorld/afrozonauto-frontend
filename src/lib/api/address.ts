import { apiClient } from "./client";
import { AddressInput } from "../validation/auth.schema";

export const addressApi = {
  getAllAddresses: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(`/addresses`);

      return response;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw new Error("Failed to fetch vehicles");
    }
  },
  getDefualtAllAddress: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        `/addresses/default?type=NORMAL`,
      );

      return response;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw new Error("Failed to fetch vehicles");
    }
  },
  addUserAddress: async (data: AddressInput): Promise<any> => {
    return apiClient.post("/addresses", data);
  },
  updateAddress: async (id: string, data: AddressInput): Promise<any> => {
    try {
      const response = await apiClient.patch(`/addresses/${id}`, data);
      return response;
    } catch (error) {
      console.error("Error updating address:", error);
      throw new Error("Failed to update address");
    }
  },
  deleteAddress: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.delete<any>(`/addresses/${id}`);

      return response;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw new Error("Failed to delete address");
    }
  },
};
