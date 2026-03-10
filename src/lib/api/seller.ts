import { apiClient } from "./client";

const SELLERS_BASE = "/sellers";

export interface SellerCheckEmailInput {
  email: string;
}

export interface SellerVerifyTokenInput {
  email: string;
  token: string | number;
}

export interface SellerRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  businessName?: string;
  taxId?: string;
  identificationNumber?: string;
  identificationType?: string;
  /** For multipart: array of { file: File, documentName: string } */
  documents?: { file: File; documentName: string }[];
}

export const sellersApi = {
  /** Step 1: Check email and send verification code (guest) */
  checkEmail: async (data: SellerCheckEmailInput) => {
    await apiClient.post(`${SELLERS_BASE}/check-email`, data);
  },

  /** Step 2: Verify email with code (guest) */
  verifyToken: async (data: SellerVerifyTokenInput) => {
    const payload = {
      email: data.email,
      token: typeof data.token === "string" ? Number.parseInt(data.token, 10) : data.token,
    };
    await apiClient.post(`${SELLERS_BASE}/verify-token`, payload);
  },

  /** Step 3: Register with profile + document upload (guest) */
  registerWithDocs: async (data: SellerRegisterInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    if (data.phone) formData.append("phone", data.phone);
    if (data.businessName) formData.append("businessName", data.businessName);
    if (data.taxId) formData.append("taxId", data.taxId);
    if (data.identificationNumber) formData.append("identificationNumber", data.identificationNumber);
    if (data.identificationType) formData.append("identificationType", data.identificationType);

    if (data.documents?.length) {
      data.documents.forEach((doc) => {
        formData.append("documentName", doc.documentName);
        formData.append("files", doc.file);
      });
    }

    const baseURL = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    const res = await fetch(`${baseURL}${SELLERS_BASE}/register`, {
      method: "POST",
      body: formData,
      headers: {},
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || err.errors?.[0] || "Registration failed");
    }
    return res.json();
  },
};
