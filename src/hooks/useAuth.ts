import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { ApiError } from "../lib/api/client";
import type { User } from "../types";
import { showToast } from "../lib/showNotification";
import type {
  OnboardingInput,
  VerifyInput,
  CompleteProfileInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../lib/validation/auth.schema";
import { useAuthStore, isTokenExpiringSoon } from "../lib/authStore";
import { useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;

const PROTECTED_ROUTES = ["/dashboard", "/request-details"];

export function useAuthQuery() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setAuth,
    clearAuth,
    isAuthenticated,
    user: storedUser,
  } = useAuthStore();

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    location.pathname.startsWith(route),
  );

  const { isHydrated } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["auth", "user-id"],
    queryFn: async () => {
      try {
        if (!storedUser?.id) {
          //console.log("No user ID found in store, using stored user data");
          return storedUser;
        }

        // console.log("Fetching fresh user data from API");
        const user = await authApi.getUserById(storedUser.id);

        if (user) {
          useAuthStore.setState({
            user,
            isAuthenticated: true,
            isHydrated: true,
          });
        }
        return user;
      } catch (err) {
        console.error("Failed to fetch user:", err);

        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          console.warn("Authentication failed, clearing auth");
          clearAuth();
          return null; // Add explicit return
        }

        return storedUser;
      }
    },
    enabled: isHydrated && isAuthenticated && isProtectedRoute,

    retry: 1, // Changed from false to 1
    staleTime: 5 * 60 * 1000,
    // Add these options:
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const forceLogout = () => {
    clearAuth();
    queryClient.removeQueries({ queryKey: ["auth", "user-id"] });
    navigate("/login", { replace: true });
  };

  const signInMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.signIn(data),

    onSuccess: (response) => {
      if (response.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        setAuth(user, accessToken, refreshToken);
        queryClient.setQueryData(["auth", "user-id"], user);

        showToast({
          type: "success",
          message: `Welcome back, ${user.fullName || user.email}!`,
        });
      }
    },

    onError: (error: ApiError) => {
      console.error("Sign in error:", error);
      showToast({
        type: "error",
        message:
          error.message || "Login failed. Please check your credentials.",
      });
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: (data: OnboardingInput) => authApi.startRegistration(data),

    onSuccess: (_, variables) => {
      // Store email temporarily in sessionStorage (non-sensitive)
      sessionStorage.setItem("onboarding_email", variables.email);
      showToast({
        type: "success",
        message: "Verification code sent to your email!",
      });
    },

    onError: (error: ApiError) => {
      const errorMessage =
        error.errors?.[0] ||
        error.message ||
        "Failed to send verification code";

      showToast({
        type: "error",
        message: errorMessage,
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyInput) => authApi.verifyCode(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("verified_email", variables.email);
      sessionStorage.removeItem("onboarding_email");
      showToast({
        type: "success",
        message: "Email verified successfully!",
      });
    },

    onError: (error: ApiError) => {
      const errorMessage =
        error.errors?.[0] || error.message || "Verification failed";

      showToast({
        type: "error",
        message: errorMessage,
      });
    },
  });

  const completeProfileMutation = useMutation({
    mutationFn: (data: CompleteProfileInput) => {
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      return authApi.signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName,
        phone: data.phone,
        role: data.role ?? "BUYER",
        isActive: true,
      });
    },

    onSuccess: () => {
      sessionStorage.removeItem("verified_email");
      showToast({
        type: "success",
        message: "Account created successfully! Please login.",
      });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to complete profile",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("reset_email", variables.email);
      showToast({
        type: "success",
        message: "Password reset code sent to your email!",
      });
    },

    onError: (error: ApiError) => {
      console.error("Forgot password error:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to send reset code",
        duration: 4000,
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),

    onSuccess: () => {
      sessionStorage.removeItem("reset_email");

      showToast({
        type: "success",
        message: "Password changed successfully. Please login again.",
      });

      // Force logout and redirect to login
      forceLogout();
    },

    onError: (error: ApiError) => {
      console.error("Reset password error:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to reset password",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => authApi.updateProfile(updates),

    onSuccess: (profileData) => {
      const { user, updateUser } = useAuthStore.getState();

      if (user) {
        const updatedUser = { ...user, ...profileData };

        updateUser(updatedUser);

        queryClient.setQueryData(["auth", "user-id"], updatedUser);
      }

      showToast({
        type: "success",
        message: "Profile updated successfully!",
      });
    },

    onError: (error: ApiError) => {
      console.error("Update profile error:", error);
      showToast({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    },
  });

  const signOut = () => {
    clearAuth();
    queryClient.removeQueries({ queryKey: ["auth", "user"] });
    navigate("/", { replace: true });
  };
  return {
    // User data
    user: data ?? null,
    loading: isLoading,
    error,
    isAuthenticated: isAuthenticated,
    refetchUser: refetch,

    // Auth actions
    onboarding: onboardingMutation.mutateAsync,
    verify: verifyMutation.mutateAsync,
    completeProfile: completeProfileMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    signOut,

    // Profile actions
    updateProfile: updateProfileMutation.mutateAsync,

    // Loading states
    isOnboarding: onboardingMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isCompletingProfile: completeProfileMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Error states
    signInError: signInMutation.error,
    onboardingError: onboardingMutation.error,
    verifyError: verifyMutation.error,
    completeProfileError: completeProfileMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
}

export function useTokenRefresh() {
  const {
    accessToken,
    refreshToken,
    setAuth,
    user,
    clearAuth,
    isAuthenticated,
  } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !refreshToken) {
      return;
    }

    const checkAndRefresh = async () => {
      if (isRefreshingRef.current) {
        return;
      }

      if (isTokenExpiringSoon(accessToken, 300)) {
        try {
          isRefreshingRef.current = true;

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000, // 10 second timeout
            },
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          if (!user) {
            console.error("User object missing during refresh");
            return;
          }

          setAuth(user, newAccessToken, newRefreshToken);
        } catch (error) {
          console.error("❌ Background token refresh failed:", error);

          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              console.warn("Refresh token invalid, logging out user");
              clearAuth();
            } else {
            }
          }
        } finally {
          isRefreshingRef.current = false;
        }
      }
    };

    checkAndRefresh();

    intervalRef.current = setInterval(checkAndRefresh, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      isRefreshingRef.current = false;
    };
  }, [accessToken, refreshToken, user, setAuth, clearAuth, isAuthenticated]);

  return null;
}
