import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../lib/api/auth";
import { apiClient, ApiError } from "../lib/api/client";
import type { Profile, User } from "../types";
import { showToast } from "../lib/showNotification";

import type {
  OnboardingInput,
  VerifyInput,
  CompleteProfileInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../lib/validation/auth.schema";

export function useAuthQuery() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      try {
        return await authApi.getCurrentUser();
      } catch {
        localStorage.removeItem("auth_token");
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const onboardingMutation = useMutation({
    mutationFn: (data: OnboardingInput) => authApi.startRegistration(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("onboarding_email", variables.email);
      showToast({ type: "success", message: "Verification code sent!" });
    },

    onError: (error: ApiError) => {
      showToast({ type: "error", message: error.message });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyInput) => authApi.verifyCode(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("verified_email", variables.email);
      sessionStorage.removeItem("onboarding_email");
      showToast({ type: "success", message: "Email verified!" });
    },

    onError: (error: ApiError) => {
      showToast({ type: "error", message: error.message });
    },
  });

  const completeProfileMutation = useMutation({
    mutationFn: (data: CompleteProfileInput) => {
      const fullName = `${data.firstName} ${data.lastName}`;

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
        message: "Profile completed. Please login.",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.signIn(data),

    onSuccess: (response) => {
      if (response.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        apiClient.setAuthToken(accessToken);
        localStorage.setItem("auth_token", accessToken);

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Update query cache with user data
        queryClient.setQueryData(["auth", "me"], user);

        showToast({ type: "success", message: "Login successful!" });
      }
    },

    onError: (error: ApiError) => {
      showToast({ type: "error", message: error.message || "Login failed" });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),

    onSuccess: (_, variables) => {
      sessionStorage.setItem("reset_email", variables.email);
      showToast({ type: "success", message: "Reset code sent!" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),

    onSuccess: () => {
      sessionStorage.removeItem("reset_email");
      showToast({ type: "success", message: "Password reset successful!" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<Profile>) => authApi.updateProfile(updates),

    onSuccess: (profile) => {
      queryClient.setQueryData(["auth", "me"], (old: User | null) =>
        old ? { ...old, ...profile } : old,
      );
      showToast({ type: "success", message: "Profile updated!" });
    },
  });

  const signOut = () => {
    apiClient.setAuthToken(null);
    localStorage.removeItem("refresh_token");
    queryClient.clear();
    sessionStorage.clear();
    showToast({ type: "success", message: "Logged out" });
  };

  return {
    user: data ?? null,
    loading: isLoading,
    error,
    isAuthenticated: !!data,

    onboarding: onboardingMutation.mutateAsync,
    verify: verifyMutation.mutateAsync,
    completeProfile: completeProfileMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    signOut,

    isOnboarding: onboardingMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isCompletingProfile: completeProfileMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}
