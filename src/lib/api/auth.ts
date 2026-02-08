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

export const authApi = {
  startRegistration: async (data: OnboardingInput) => {
    apiClient.post<OnboardingResponse>("/auth/register-start", data);
  },

  verifyCode: async (data: VerifyCodeInput) => {
    apiClient.post<VerifyCodeResponse>("/auth/verify", data);
  },

  signUp: async (data: CompleteReg) => {
    apiClient.post<CompleteRegRes>("/auth/register", data);
  },

  signIn: async (data: SignInData) => {
    apiClient.post<SignInResponse>("/auth/login", data);
  },

  getUserById: async (id: string) => {
    apiClient.get<User>(`/auth/users/user-id/${id}`);
  },

  getUserByEmail: async (email: string) => {
    apiClient.get<User>(`/auth/users/user-email/${email}`);
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    apiClient.patch<User>("/auth/profile", updates);
  },

  // Refresh token
  refreshToken: async () => {
    apiClient.post("/auth/refresh-token");
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    apiClient.post("/auth/forgot-password", data);
  },

  resetPassword: async (data: Omit<ResetPasswordInput, "confirmPassword">) => {
    apiClient.post("/auth/reset-password", data);
  },
};
