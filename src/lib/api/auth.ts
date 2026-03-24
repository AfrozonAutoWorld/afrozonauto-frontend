import { apiClient } from "./client";
import type { User } from "../../types";
import {
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validation/auth.schema";

export interface OnboardingInput {
  email: string;
}

export interface OnboardingResponse {
  message: string;
  email: string;
}

export interface VerifyCodeInput {
  email: string;
  token: string;
}

export interface VerifyCodeResponse {
  message: string;
  verified: boolean;
}

export interface CompleteReg {
  email: string;
  password: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  role?: string;
}

export interface CompleteRegRes {
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

// Fixed: Match your actual API response structure
export interface SignInResponse {
  success: boolean;
  message: string;
  data: {
    data: {
      user: User;
      accessToken: string;
      refreshToken: string;
    };
  };
  timestamp: string;
}

type ApiEnvelope<T = unknown> = {
  success?: boolean;
  message?: string;
  errors?: string[];
  data?: T;
};

export const authApi = {
  startRegistration: async (data: OnboardingInput) => {
    const res = await apiClient.post<ApiEnvelope<OnboardingResponse>>(
      "/auth/register-start",
      data,
    );
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Failed to send verification code");
    }
    return res.data;
  },

  verifyCode: async (data: VerifyCodeInput) => {
    const res = await apiClient.post<ApiEnvelope<VerifyCodeResponse>>(
      "/auth/verify",
      data,
    );
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Invalid or expired verification code");
    }
    return res.data;
  },

  signUp: async (data: CompleteReg) => {
    const res = await apiClient.post<ApiEnvelope<CompleteRegRes>>("/auth/register", data);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Registration failed");
    }
    return res.data;
  },

  signIn: async (data: SignInData) => {
    const res = await apiClient.post<SignInResponse>("/auth/login", data);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || "Invalid email or password");
    }
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get<User>(`/auth/users/user-id/${id}`);
    return res.data;
  },

  getUserByEmail: async (email: string) => {
    const res = await apiClient.get<User>(`/auth/users/user-email/${email}`);
    return res.data;
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    const res = await apiClient.patch<User>("/auth/profile", updates);
    return res.data;
  },

  // Refresh token
  refreshToken: async () => {
    const res = await apiClient.post("/auth/refresh-token");
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const res = await apiClient.post<ApiEnvelope>("/auth/forgot-password", data);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Failed to send reset code");
    }
    return res.data;
  },

  resetPassword: async (data: Omit<ResetPasswordInput, "confirmPassword">) => {
    const res = await apiClient.post<ApiEnvelope>("/auth/reset-password", data);
    if (res.data?.success === false) {
      throw new Error(res.data?.message || res.data?.errors?.[0] || "Failed to reset password");
    }
    return res.data;
  },
};
