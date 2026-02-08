import { apiClient } from "./client";
import {
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validation/auth.schema";
import { jwtDecode } from "jwt-decode";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import { JWT } from "next-auth/jwt";

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

  resetPassword: async (
    data: Omit<ResetPasswordInput, "confirmPassword">,
  ): Promise<any> => {
    return apiClient.post("/auth/reset-password", data);
  },
};

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const payload = {
            email: credentials?.email,
            password: credentials?.password,
          };

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            },
          );

          const responseText = await response.text();

          if (!response.ok) {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { message: responseText };
            }
            console.error("Auth failed with error:", errorData);
            return null;
          }

          const resData = JSON.parse(responseText);

          const userData = resData?.data?.data?.user;
          const accessToken = resData?.data?.data?.accessToken;
          const refreshToken = resData?.data?.data?.refreshToken;

          if (!accessToken || !userData) {
            console.error("Missing token or user data");
            console.error("userData:", userData);
            console.error("accessToken:", accessToken ? "present" : "missing");
            return null;
          }

          // Map the complete user object from API response
          const user: User = {
            id: userData.id,
            email: userData.email,
            emailVerified: userData.emailVerified,
            fullName: userData.fullName,
            phone: userData.phone,
            role: userData.role,
            isActive: userData.isActive,
            isSuspended: userData.isSuspended,
            googleId: userData.googleId,
            appleId: userData.appleId,
            isDeleted: userData.isDeleted,
            suspensionReason: userData.suspensionReason,
            suspensionUntil: userData.suspensionUntil,
            walletBalance: userData.walletBalance,
            currency: userData.currency,
            language: userData.language,
            timezone: userData.timezone,
            notificationPreferences: userData.notificationPreferences,
            lastLoginAt: userData.lastLoginAt,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            online: userData.online,
            accessToken,
            refreshToken,
          };

          return user;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store all user data in token on initial login
        token = {
          ...token,
          id: user.id,
          email: user.email,
          emailVerified: (user.emailVerified as boolean) ?? false,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isSuspended: user.isSuspended,
          googleId: user.googleId,
          appleId: user.appleId,
          isDeleted: user.isDeleted,
          suspensionReason: user.suspensionReason,
          suspensionUntil: user.suspensionUntil,
          walletBalance: user.walletBalance,
          currency: user.currency,
          language: user.language,
          timezone: user.timezone,
          notificationPreferences: user.notificationPreferences,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          online: user.online,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };

        // Decode JWT to get expiration
        try {
          const decoded = jwtDecode<{ exp: number }>(token.accessToken ?? "");
          token.exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 60 * 60; // Default 1 hour
        } catch (err) {
          console.warn("JWT decode failed, using default expiry", err);
          token.exp = Math.floor(Date.now() / 1000) + 60 * 60;
        }

        return token;
      }

      // Token refresh logic
      const now = Math.floor(Date.now() / 1000);
      if (token.exp && token.exp < now && token.refreshToken) {
        try {
          return await refreshAccessToken(token);
        } catch (err) {
          console.error("Token refresh failed", err);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Map all token data to session
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          emailVerified: (token.emailVerified as boolean) ?? false,
          fullName: (token.fullName as string) ?? null,
          phone: (token.phone as string) ?? null,
          role: (token.role as User["role"]) ?? "OPERATION",
          isActive: (token.isActive as boolean) ?? true,
          isSuspended: (token.isSuspended as boolean) ?? false,
          googleId: (token.googleId as string) ?? "",
          appleId: (token.appleId as string) ?? "",
          isDeleted: (token.isDeleted as boolean) ?? false,
          suspensionReason: (token.suspensionReason as string) ?? null,
          suspensionUntil: (token.suspensionUntil as string) ?? null,
          walletBalance: (token.walletBalance as number) ?? 0,
          currency: (token.currency as string) ?? "USD",
          language: (token.language as string) ?? "en",
          timezone: (token.timezone as string) ?? "UTC",
          notificationPreferences:
            (token.notificationPreferences as string) ?? null,
          lastLoginAt: (token.lastLoginAt as string) ?? "",
          createdAt: (token.createdAt as string) ?? "",
          updatedAt: (token.updatedAt as string) ?? "",
          online: (token.online as boolean) ?? false,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
        },
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        error: token.error as string | null,
      };
    },
  },
};

async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token.refreshToken }),
      },
    );

    if (!response.ok) throw new Error("Failed to refresh token");

    const refreshed = await response.json();
    const newAccessToken = refreshed?.data?.accessToken;
    const newRefreshToken = refreshed?.data?.refreshToken ?? token.refreshToken;

    const decoded = jwtDecode<{ exp: number }>(newAccessToken);

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      exp: decoded.exp,
    };
  } catch (err) {
    console.error("Error refreshing access token:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
