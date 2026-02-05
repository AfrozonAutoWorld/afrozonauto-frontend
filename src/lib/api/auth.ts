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
  // Start registration - send verification code
  startRegistration: async (
    data: OnboardingInput,
  ): Promise<OnboardingResponse> => {
    return apiClient.post<OnboardingResponse>("/auth/register-start", data);
  },

  // Verify email code
  verifyCode: async (data: VerifyCodeInput): Promise<VerifyCodeResponse> => {
    return apiClient.post<VerifyCodeResponse>("/auth/verify", data);
  },

  // Complete registration
  signUp: async (data: CompleteReg): Promise<CompleteRegRes> => {
    return apiClient.post<CompleteRegRes>("/auth/register", data);
  },

  // Sign in
  signIn: async (data: SignInData): Promise<SignInResponse> => {
    return apiClient.post<SignInResponse>("/auth/login", data);
  },

  // Get current user
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/auth/users/user-id/${id}`);
  },

  getUserByEmail: async (email: string): Promise<User> => {
    return apiClient.get<User>(`/auth/users/user-email/${email}`);
  },

  // Update profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    return apiClient.patch<User>("/auth/profile", updates);
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post("/auth/refresh-token");
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<any> => {
    return apiClient.post("/auth/forgot-password", data);
  },

  resetPassword: async (data: Omit<ResetPasswordInput, 'confirmPassword'>): Promise<any> => {
    return apiClient.post("/auth/reset-password", data);
  },
};
