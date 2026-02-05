import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../authStore";
import { isTokenExpiringSoon } from "../authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

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

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const { accessToken, isAuthenticated, refreshToken } =
          useAuthStore.getState();

        // Skip token logic for refresh endpoint
        if (config.url?.includes("/auth/refresh-token")) {
          return config;
        }

        if (isAuthenticated && accessToken) {
          if (
            isTokenExpiringSoon(accessToken, 60) &&
            refreshToken &&
            !this.isRefreshing
          ) {
            try {
              this.isRefreshing = true;
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh-token`,
                { token: refreshToken },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                  timeout: 10000,
                },
              );

              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = response.data.data;

              useAuthStore
                .getState()
                .setAuth(
                  useAuthStore.getState().user!,
                  newAccessToken,
                  newRefreshToken,
                );

              config.headers.Authorization = `Bearer ${newAccessToken}`;
            } catch (error) {
              console.error(
                "❌ API Interceptor: Proactive token refresh failed:",
                error,
              );
              // Continue with old token, 401 interceptor will handle if expired
              config.headers.Authorization = `Bearer ${accessToken}`;
            } finally {
              this.isRefreshing = false;
            }
          } else {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                // After refresh completes, retry with new token
                const { accessToken } = useAuthStore.getState();
                if (originalRequest.headers && accessToken) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { refreshToken } = useAuthStore.getState();

            if (!refreshToken) {
              console.warn(
                "⚠️ API Interceptor: No refresh token available for 401 retry",
              );
              throw new Error("No refresh token available");
            }
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              { token: refreshToken },
              {
                headers: {
                  "Content-Type": "application/json",
                },
                timeout: 10000,
              },
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;

            useAuthStore
              .getState()
              .setAuth(
                useAuthStore.getState().user!,
                accessToken,
                newRefreshToken,
              );

            this.processQueue(null);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error(
              "❌ API Interceptor: Token refresh failed after 401:",
              refreshError,
            );
            this.processQueue(refreshError);
            this.handleLogout();
            return Promise.reject(
              this.transformError(refreshError as AxiosError),
            );
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform all errors to ApiError
        return Promise.reject(this.transformError(error));
      },
    );
  }

  // Transform Axios errors to ApiError
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      const { data, status } = error.response;
      const errorData = data as any;

      return new ApiError(
        errorData?.message || `Request failed with status ${status}`,
        status,
        errorData?.code,
        errorData?.errors,
        errorData?.details,
        errorData,
      );
    }

    // Network or timeout errors
    if (error.code === "ECONNABORTED") {
      return new ApiError("Request timeout", 0);
    }

    return new ApiError(error.message || "Network error", 0);
  }

  private processQueue(error: any) {
    this.failedQueue.forEach((promise) => {
      error ? promise.reject(error) : promise.resolve();
    });
    this.failedQueue = [];
  }

  private handleLogout() {
    const { clearAuth } = useAuthStore.getState();
    clearAuth();

    if (typeof window !== 'undefined') {
      const protectedRoutes = ["/dashboard", "/request-details"];
      const currentPath = window.location.pathname;

      if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
        window.location.href = "/login";
      }
    }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
