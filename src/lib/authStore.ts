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

// ✅ Custom storage that uses sessionStorage
const sessionStorageAdapter = {
  getItem: (name: string) => {
    const value = sessionStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
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
        //console.log("Setting auth:", { user, hasAccessToken: !!accessToken });
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
        //console.log("Clearing auth");
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
      storage: createJSONStorage(() => sessionStorageAdapter),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        //console.log("Rehydrating state:", state);
        if (state) {
          state.isHydrated = true;

          // Only clear auth if token is ACTUALLY expired
          if (state.isAuthenticated && state.isTokenExpired()) {
            console.warn("Token expired on page load, clearing auth");
            state.clearAuth();
          } else if (state.isAuthenticated) {
            // console.log("Auth rehydrated successfully");
          }
        }
      },
    },
  ),
);
