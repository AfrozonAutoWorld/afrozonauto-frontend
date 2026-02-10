import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    fullName?: string; // normalize null -> undefined
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    isSuspended: boolean;
    googleId: string;
    appleId: string;
    isDeleted: boolean;
    suspensionReason?: string;
    suspensionUntil?: string;
    walletBalance: number;
    currency: string;
    language: string;
    timezone: string;
    notificationPreferences?: NotificationPreferences;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    online: boolean;

    // Optional fields
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    phoneVerified?: boolean;
    twoFactorEnabled?: boolean;

    profile?: {
      id: string;
      userId: string;
      avatar?: string;
      dateOfBirth?: string;
      identificationNumber?: string;
      identificationType?: string;
      identificationDocument?: string;
      businessName?: string;
      taxId?: string;
      isVerified: boolean;
      verifiedAt?: string;
      firstName?: string;
      lastName?: string;
      createdAt: string;
      updatedAt: string;
    };

    // Include access tokens for session
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    error?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    emailVerified?: boolean;
    fullName?: string;
    phone?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "OPERATION" | "BUYER";
    isActive?: boolean;
    isSuspended?: boolean;
    googleId?: string;
    appleId?: string;
    isDeleted?: boolean;
    suspensionReason?: string;
    suspensionUntil?: string;
    walletBalance?: number;
    currency?: string;
    language?: string;
    timezone?: string;
    notificationPreferences?: string;
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    online?: boolean;
    accessToken?: string;
    refreshToken?: string;
    exp?: number;
    error?: string;
  }
}
