import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isInitialized: boolean; // NEW: Track if initial auth check is complete
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setHydrated: (val: boolean) => void;
  setInitialized: (val: boolean) => void; // NEW
  isTokenExpired: () => boolean;
}

export function isJWTExpired(token: string | null): boolean {
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

const localStorageAdapter = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
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
      isInitialized: false, // NEW

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isHydrated: true,
          isInitialized: true, // NEW
        });
      },

      updateUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrated: true,
          isInitialized: true, // Keep initialized true
        });
      },

      setHydrated: (val) => set({ isHydrated: val }),
      setInitialized: (val) => set({ isInitialized: val }), // NEW

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
        if (state) {
          state.isHydrated = true;

          if (state.isAuthenticated && state.accessToken) {
            const isExpired = isJWTExpired(state.accessToken);
            const hasRefreshToken = !!state.refreshToken;

            if (isExpired && !hasRefreshToken) {
              console.warn(
                "Token expired and no refresh token available, clearing auth",
              );
              state.user = null;
              state.accessToken = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
            }
          }
        }
      },
    },
  ),
);
