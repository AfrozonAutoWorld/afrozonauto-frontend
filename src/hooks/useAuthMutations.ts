import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authApi } from "../lib/api/auth";
import { showToast } from "../lib/showNotification";
import { ApiError } from "../lib/api/client";
import type {
  OnboardingInput,
  VerifyInput,
  CompleteProfileInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../lib/validation/auth.schema";
import type { User } from "../types";

export function useAuthMutations() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Onboarding (start registration)
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
      showToast({
        type: "error",
        message:
          error.errors?.[0] ||
          error.message ||
          "Failed to send verification code",
      });
    },
  });

  // Verify email code
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
      showToast({
        type: "error",
        message: error.errors?.[0] || error.message || "Verification failed",
      });
    },
  });

  // Complete profile
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

  // Sign in with NextAuth
  const signInMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      showToast({
        type: "success",
        message: "Login successful!",
      });
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      showToast({
        type: "error",
        message: error.message || "Login failed",
      });
    },
  });

  // Forgot password
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
      showToast({
        type: "error",
        message: error.message || "Failed to send reset code",
      });
    },
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: ({ confirmPassword: _, ...resetData }: ResetPasswordInput) =>
      authApi.resetPassword(resetData),
    onSuccess: () => {
      sessionStorage.removeItem("reset_email");
      showToast({
        type: "success",
        message: "Password changed successfully. Please login again.",
      });
      // Sign out and redirect to login
      nextAuthSignOut({ redirect: false }).then(() => {
        router.push("/login");
      });
    },
    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to reset password",
      });
    },
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => authApi.updateProfile(updates),
    onSuccess: () => {
      // Invalidate session to refetch updated user data
      queryClient.invalidateQueries();
      showToast({
        type: "success",
        message: "Profile updated successfully!",
      });
    },
    onError: (error: ApiError) => {
      showToast({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    },
  });

  // Sign out
  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    queryClient.clear();
    router.push("/");
  };

  return {
    // Mutation functions
    onboarding: onboardingMutation.mutateAsync,
    verify: verifyMutation.mutateAsync,
    completeProfile: completeProfileMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    signOut,

    // Loading states
    isOnboarding: onboardingMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isCompletingProfile: completeProfileMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Error states
    onboardingError: onboardingMutation.error,
    verifyError: verifyMutation.error,
    completeProfileError: completeProfileMutation.error,
    signInError: signInMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
}
