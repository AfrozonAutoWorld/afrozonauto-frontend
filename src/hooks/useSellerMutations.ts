"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { sellersApi, type SellerRegisterInput } from "@/lib/api/seller";
import { showToast } from "@/lib/showNotification";
import type { SellerCheckEmailInput, SellerVerifyTokenInput } from "@/lib/validation/seller.schema";

const SELLER_EMAIL_KEY = "seller_register_email";
const SELLER_VERIFIED_KEY = "seller_verified_email";

export function useSellerMutations() {
  const router = useRouter();

  const checkEmail = useMutation({
    mutationFn: (data: SellerCheckEmailInput) => sellersApi.checkEmail(data),
    onSuccess: (_, variables) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SELLER_EMAIL_KEY, variables.email);
      }
      showToast({ type: "success", message: "Verification code sent to your email!" });
    },
    onError: (err: Error) => {
      showToast({ type: "error", message: err.message || "Failed to send verification code" });
    },
  });

  const verifyToken = useMutation({
    mutationFn: (data: SellerVerifyTokenInput) =>
      sellersApi.verifyToken({ email: data.email, token: data.token }),
    onSuccess: (_, variables) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SELLER_VERIFIED_KEY, variables.email);
        sessionStorage.removeItem(SELLER_EMAIL_KEY);
      }
      showToast({ type: "success", message: "Email verified successfully!" });
    },
    onError: (err: Error) => {
      showToast({ type: "error", message: err.message || "Verification failed" });
    },
  });

  const register = useMutation({
    mutationFn: (data: SellerRegisterInput) => sellersApi.registerWithDocs(data),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SELLER_VERIFIED_KEY);
      }
      showToast({
        type: "success",
        message: "Seller account created! Your account is pending verification. You can log in now.",
      });
      router.push("/login?as=seller");
    },
    onError: (err: Error) => {
      showToast({ type: "error", message: err.message || "Registration failed" });
    },
  });

  return {
    checkEmail,
    verifyToken,
    register,
    SELLER_EMAIL_KEY,
    SELLER_VERIFIED_KEY,
  };
}
