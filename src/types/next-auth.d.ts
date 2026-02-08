import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    fullName: string | null;
    firstName?: string;
    lastName?: string;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
    isSuspended: boolean;
    googleId: string;
    appleId: string;
    isDeleted: boolean;
    suspensionReason: string | null;
    suspensionUntil: string | null;
    walletBalance: number;
    currency: string;
    language: string;
    timezone: string;
    notificationPreferences: NotificationPreferences | null;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    online: boolean;

    // Optional fields that might be added later
    address: string | null;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    phoneVerified?: boolean;
    twoFactorEnabled?: boolean;
    profile: {
      id: string;
      userId: string;
      avatar: string | null;
      dateOfBirth: string | null;
      identificationNumber: string | null;
      identificationType: string | null;
      identificationDocument: string | null;
      businessName: string | null;
      taxId: string | null;
      isVerified: boolean;
      verifiedAt: string | null;
      firstName: string | null;
      lastName: string | null;
      createdAt: string;
      updatedAt: string;
    };
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
    fullName?: string | null;
    phone?: string | null;
    role?: "SUPER_ADMIN" | "ADMIN" | "OPERATION" | "BUYER";
    isActive?: boolean;
    isSuspended?: boolean;
    googleId?: string;
    appleId?: string;
    isDeleted?: boolean;
    suspensionReason?: string | null;
    suspensionUntil?: string | null;
    walletBalance?: number;
    currency?: string;
    language?: string;
    timezone?: string;
    notificationPreferences?: string | null;
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
