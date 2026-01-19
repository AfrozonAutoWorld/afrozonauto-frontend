import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds
      withCredentials: false, // Set to true if you need cookies
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const message =
            (error.response.data as any)?.message ||
            error.message ||
            `HTTP ${error.response.status}`;

          throw new ApiError(
            message,
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          // Request made but no response received (network error, CORS, etc.)
          throw new ApiError(
            "Network error. Please check your connection.",
            0,
            null
          );
        } else {
          // Something else happened
          throw new ApiError(
            error.message || "An unexpected error occurred",
            0,
            null
          );
        }
      }
    );

    // Log API base URL in development
    if (import.meta.env.DEV) {
      console.log("API Base URL:", baseUrl);
    }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // Helper to set auth token
  setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  // Helper to get current instance (for custom requests)
  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
