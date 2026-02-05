import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from 'next/navigation';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const PROTECTED_ROUTES = ["/dashboard", "/request-details"];

export function useAuthQuery() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const {
    setAuth,
    clearAuth,
    isAuthenticated,
    user: storedUser,
    isHydrated,
    isInitialized,
    setInitialized,
  } = useAuthStore();

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const { data, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["auth", "user-id"],
    queryFn: async () => {
      try {
        if (storedUser?.id) {
          // Just fetch the user, don't update state here
          const user = await authApi.getUserById(storedUser.id);
          return user;
        }
        return null;
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          console.warn("Authentication failed, clearing auth");
          clearAuth();
          return null;
        }
        return storedUser;
      }
    },
    enabled:
      isHydrated && isAuthenticated && isProtectedRoute && !!storedUser?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Update store when query data changes (separate from query function)
  useEffect(() => {
    if (data && data !== storedUser) {
      useAuthStore.setState({
        user: data,
        isAuthenticated: true,
        isHydrated: true,
        isInitialized: true,
      });
    }
  }, [data, storedUser]);

  // Initialize authentication state on mount
  useEffect(() => {
    if (isHydrated && !isInitialized) {
      setInitialized(true);
    }
  }, [isHydrated, isInitialized, setInitialized]);

  const forceLogout = () => {
    clearAuth();
    queryClient.removeQueries({ queryKey: ["auth", "user-id"] });
    router.replace("/login");
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
    mutationFn: ({ confirmPassword: _, ...resetData }: ResetPasswordInput) =>
      authApi.resetPassword(resetData),

    onSuccess: () => {
      sessionStorage.removeItem("reset_email");

      showToast({
        type: "success",
        message: "Password changed successfully. Please login again.",
      });

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
    router.replace("/");
  };

  // Return the actual user - prefer query data, fallback to stored user
  const currentUser = data !== undefined ? data : storedUser;

  return {
    // User data - guaranteed to be in sync
    user: currentUser,
    loading: isLoading || !isInitialized, // Include initialization check
    error,
    isAuthenticated: isAuthenticated && !!currentUser,
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
  const lastRefreshAttempt = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !refreshToken) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const checkAndRefresh = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        return;
      }

      // Prevent refresh attempts within 30 seconds of last attempt
      const now = Date.now();
      if (now - lastRefreshAttempt.current < 30000) {
        return;
      }

      if (isTokenExpiringSoon(accessToken, 300)) {
        try {
          isRefreshingRef.current = true;
          lastRefreshAttempt.current = now;

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000,
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
            }
          }
        } finally {
          isRefreshingRef.current = false;
        }
      }
    };

    // Check immediately on mount
    checkAndRefresh();

    // Then check every 2 minutes
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
