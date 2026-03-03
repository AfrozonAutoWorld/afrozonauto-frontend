import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public errors?: string[],
    public details?: any,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL || "https://api.afrozonauto.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token dynamically before every request
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const token = session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (typeof globalThis !== "undefined" && globalThis.window && status === 401) {
      const currentPath = globalThis.window.location.pathname;
      const url = error.config?.url as string | undefined;
      const isAuthEndpoint = url?.includes("/auth/");

      // Only act when we're not already on the login page
      // and the failing call isn't a NextAuth auth endpoint
      if (!currentPath.startsWith("/login") && !isAuthEndpoint) {
        // Clear the NextAuth session so we stop reusing an invalid token,
        // then send the user to the login page.
        void signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  },
);
