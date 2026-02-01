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

// Define which routes require authentication
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
    console.log("Force logout triggered");
    clearAuth();
    queryClient.removeQueries({ queryKey: ["auth", "user-id"] });
    navigate("/login", { replace: true });
  };

  // SIGN IN
  const signInMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.signIn(data),

    onSuccess: (response) => {
      if (response.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        console.log("Sign in successful, setting auth");
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

  // ONBOARDING (Start Registration)
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

  // VERIFY CODE
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

  // COMPLETE PROFILE (Sign Up)
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

  // FORGOT PASSWORD
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

  // RESET PASSWORD
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

  // UPDATE PROFILE
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => authApi.updateProfile(updates),

    onSuccess: (profileData) => {
      const { user, updateUser } = useAuthStore.getState();

      if (user) {
        // Merge old user data with the new profile data
        const updatedUser = { ...user, ...profileData };

        // 1. Update Zustand store (syncs UI immediately)
        updateUser(updatedUser);

        // 2. Update React Query cache (keeps cache in sync)
        queryClient.setQueryData(["auth", "user-id"], updatedUser);

        console.log("Profile updated successfully");
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
      console.log("Token refresh: Not authenticated or missing tokens");
      return;
    }

    const checkAndRefresh = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        console.log("Token refresh: Already refreshing, skipping");
        return;
      }

      // Check if token expires in next 5 minutes (300 seconds)
      if (isTokenExpiringSoon(accessToken, 300)) {
        try {
          isRefreshingRef.current = true;
          console.log("🔄 Background token refresh triggered (expires soon)");

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
          console.log("✅ Background token refresh successful");
        } catch (error) {
          console.error("❌ Background token refresh failed:", error);

          // Only logout if the refresh token itself is invalid (401/403)
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              console.warn("Refresh token invalid, logging out user");
              clearAuth();
            } else {
              console.log(
                "Refresh failed due to network/server error, will retry",
              );
            }
          }
        } finally {
          isRefreshingRef.current = false;
        }
      } else {
        console.log("Token refresh: Token still valid, no refresh needed");
      }
    };

    // Run immediately on mount
    console.log("Token refresh: Starting background refresh service");
    checkAndRefresh();

    // Then check every 2 minutes
    intervalRef.current = setInterval(checkAndRefresh, 2 * 60 * 1000);

    return () => {
      console.log("Token refresh: Stopping background refresh service");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      isRefreshingRef.current = false;
    };
  }, [accessToken, refreshToken, user, setAuth, clearAuth, isAuthenticated]);

  // Return nothing - this is a side-effect only hook
  return null;
}
