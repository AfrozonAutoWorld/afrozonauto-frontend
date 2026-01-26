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
import { useAuthStore } from "../lib/authStore";

// Define which routes require authentication
const PROTECTED_ROUTES = ["/dashboard"];

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
          //  console.warn("No user ID found in store");
          return storedUser;
        }

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
        clearAuth();
        return null;
      }
    },
    // Only enable this query if:
    // - Store is hydrated (loaded from localStorage)
    // - User is authenticated (has tokens)
    // - User is on a protected route
    enabled: isHydrated && isAuthenticated && isProtectedRoute,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const forceLogout = () => {
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
        setAuth(user, accessToken, refreshToken);
        queryClient.setQueryData(["auth", "user-id"], user);
        showToast({ type: "success", message: "Login successful!" });
      }
    },
    onError: (error: ApiError) => {
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
      showToast({ type: "success", message: "Verification code sent!" });
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

  // Verify code mutation
  const verifyMutation = useMutation({
    mutationFn: (data: VerifyInput) => authApi.verifyCode(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("verified_email", variables.email);
      sessionStorage.removeItem("onboarding_email");
      showToast({ type: "success", message: "Email verified successfully!" });
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

  // Complete profile mutation
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
        message: "Profile completed successfully! Please login.",
      });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to complete profile",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("reset_email", variables.email);
      showToast({
        type: "success",
        message: "Reset code sent to your email!",
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

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),

    onSuccess: () => {
      sessionStorage.removeItem("reset_email");

      showToast({
        type: "success",
        message: "Password changed successfully. Please login again.",
      });

      forceLogout(); // 🔥 invalidate session + redirect
    },

    onError: (error: ApiError) => {
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
        // Logic: Merge old user data with the new profile data
        const updatedUser = { ...user, ...profileData };

        // 1. Update Zustand (Syncs the UI immediately)
        updateUser(updatedUser);

        // 2. Update React Query Cache (Keeps cache in sync)
        queryClient.setQueryData(["auth", "user-id"], updatedUser);
      }

      showToast({ type: "success", message: "Profile updated successfully!" });
    },

    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    },
  });

  return {
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
