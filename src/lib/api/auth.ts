import { apiClient } from "./client";
import type { Profile } from "../../types";
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
    user: any;
    accessToken: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  status: boolean;
  message: string;
  data: {
    user: any;
    accessToken: string;
  };
}

export const authApi = {
  // Start registration - send verification code
  startRegistration: async (
    data: OnboardingInput
  ): Promise<OnboardingResponse> => {
    return apiClient.post<OnboardingResponse>("/auth/register-start", data);
  },

  // Verify email code
  verifyCode: async (data: VerifyCodeInput): Promise<VerifyCodeResponse> => {
    return apiClient.post<VerifyCodeResponse>("/auth/verify-code", data);
  },

  // Complete registration
  signUp: async (data: CompleteReg): Promise<CompleteRegRes> => {
    return apiClient.post<CompleteRegRes>("/auth/register-complete", data);
  },

  // Sign in
  signIn: async (data: SignInData): Promise<SignInResponse> => {
    return apiClient.post<SignInResponse>("/auth/login", data);
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    return apiClient.get("/auth/me");
  },

  // Update profile
  updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
    return apiClient.patch<Profile>("/auth/profile", updates);
  },

  // Refresh token
  refreshToken: async (): Promise<{ accessToken: string }> => {
    return apiClient.post("/auth/refresh");
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<any> => {
    return apiClient.post<SignInResponse>("/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordInput): Promise<any> => {
    return apiClient.post<SignInResponse>("/auth/reset-password", data);
  },
};
