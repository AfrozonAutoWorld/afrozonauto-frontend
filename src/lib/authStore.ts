import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setHydrated: (val: boolean) => void;
  isTokenExpired: () => boolean;
}

function isJWTExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}

export function isTokenExpiringSoon(
  token: string | null,
  bufferSeconds = 60,
): boolean {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + bufferSeconds;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}

// ✅ Custom storage that uses localStorage (survives tab/browser closes)
const localStorageAdapter = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        console.log("Setting auth:", {
          user: user.email,
          hasAccessToken: !!accessToken,
        });
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isHydrated: true,
        });
      },

      updateUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => {
        console.log("Clearing auth");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrated: true,
        });
      },

      setHydrated: (val) => set({ isHydrated: val }),

      isTokenExpired: () => {
        const { accessToken } = get();
        return isJWTExpired(accessToken);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorageAdapter),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log(
          "Rehydrating state:",
          state ? "Found stored auth" : "No stored auth",
        );
        if (state) {
          state.isHydrated = true;

          // ✅ Improved logic: Don't logout immediately, let refresh mechanism handle it
          if (state.isAuthenticated && state.accessToken) {
            const isExpired = isJWTExpired(state.accessToken);
            const hasRefreshToken = !!state.refreshToken;

            if (isExpired && hasRefreshToken) {
              console.log(
                "Access token expired but refresh token available - will attempt refresh",
              );
              // Don't clear auth - let the API interceptor or background refresh handle it
            } else if (isExpired && !hasRefreshToken) {
              console.warn(
                "Token expired and no refresh token available, clearing auth",
              );
              state.clearAuth();
            } else {
              console.log("Auth rehydrated successfully with valid token");
            }
          }
        }
      },
    },
  ),
);
