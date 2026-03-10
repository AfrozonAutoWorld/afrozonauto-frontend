"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, AlertCircle, CheckCircle } from "lucide-react";
import { sellerVerifyTokenSchema, type SellerVerifyTokenInput } from "@/lib/validation/seller.schema";
import { useSellerMutations } from "@/hooks/useSellerMutations";

export function SellerRegisterVerify() {
  const router = useRouter();
  const { verifyToken, checkEmail, SELLER_EMAIL_KEY } = useSellerMutations();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof SellerVerifyTokenInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(SELLER_EMAIL_KEY) : null;
    if (!stored) {
      router.push("/seller/register");
      return;
    }
    setEmail(stored);
  }, [router, SELLER_EMAIL_KEY]);

  const validateForm = () => {
    try {
      sellerVerifyTokenSchema.parse({ email, token });
      setErrors({});
      return true;
    } catch (err: unknown) {
      const e = err as { errors?: { path: (string | number)[]; message: string }[] };
      const fieldErrors: Partial<Record<keyof SellerVerifyTokenInput, string>> = {};
      e.errors?.forEach((item) => {
        const key = item.path[0] as keyof SellerVerifyTokenInput;
        if (key) fieldErrors[key] = item.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await verifyToken.mutateAsync({ email, token });
      setSuccess(true);
      setTimeout(() => router.push("/seller/register/complete"), 1500);
    } catch {
      // Error in hook
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await checkEmail.mutateAsync({ email });
    } catch {
      // Error in hook
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified</h2>
          <p className="text-gray-600 mb-4">Redirecting to complete your seller profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/seller/landing" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Afrozon</span>
              <span className="text-2xl font-light text-emerald-400"> Seller</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
          <p className="text-gray-400">Enter the 6-digit code sent to {email || "your email"}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setToken(value);
                  if (errors.token) setErrors((p) => ({ ...p, token: undefined }));
                }}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.token ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.token && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.token}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <p className="text-center text-gray-600 mt-6">
            <Link href="/seller/register" className="text-emerald-600 font-medium hover:text-emerald-700">
              Use a different email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
