import { apiClient } from "./client";
import { UserRole } from "@/types";

const SELLERS_BASE = "/sellers";

/** Role stored when applying as seller (guest multipart register). */
export const SELLER_REGISTER_AS = UserRole.SELLER;

type SellerApiResponse = {
  success?: boolean;
  message?: string;
  errors?: string[];
  data?: { data?: unknown };
};

export interface SellerCheckEmailInput {
  email: string;
}

export interface SellerCheckEmailResult {
  email: string;
  skipOtp: boolean;
  emailAlreadyVerified?: boolean;
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
  /** Defaults to SELLER for this flow */
  registerAs?: UserRole;
  documents?: { file: File; documentName: string }[];
}

function unwrapData<T>(res: { data?: SellerApiResponse }): T | undefined {
  const root = res.data;
  const inner = root?.data?.data ?? root?.data;
  return inner as T | undefined;
}

export const sellersApi = {
  checkEmail: async (data: SellerCheckEmailInput): Promise<SellerCheckEmailResult> => {
    const res = await apiClient.post<SellerApiResponse>(`${SELLERS_BASE}/check-email`, data);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Failed to check email");
    }
    const payload = unwrapData<SellerCheckEmailResult>(res);
    if (!payload?.email) {
      throw new Error("Invalid response from server");
    }
    return {
      email: payload.email,
      skipOtp: Boolean(payload.skipOtp),
      emailAlreadyVerified: payload.emailAlreadyVerified,
    };
  },

  verifyToken: async (data: SellerVerifyTokenInput) => {
    const payload = {
      email: data.email,
      token: typeof data.token === "string" ? Number.parseInt(data.token, 10) : data.token,
    };
    const res = await apiClient.post<SellerApiResponse>(`${SELLERS_BASE}/verify-token`, payload);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || "Invalid or expired verification code");
    }
  },

  registerWithDocs: async (data: SellerRegisterInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("registerAs", data.registerAs ?? SELLER_REGISTER_AS);
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
