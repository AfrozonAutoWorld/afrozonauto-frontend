"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { sellerCheckEmailSchema, type SellerCheckEmailInput } from "@/lib/validation/seller.schema";
import { useSellerMutations } from "@/hooks/useSellerMutations";

export function SellerRegisterStart() {
  const router = useRouter();
  const { checkEmail, SELLER_EMAIL_KEY } = useSellerMutations();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof SellerCheckEmailInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    try {
      sellerCheckEmailSchema.parse({ email });
      setErrors({});
      return true;
    } catch (err: unknown) {
      const e = err as { errors?: { path: (string | number)[]; message: string }[] };
      const fieldErrors: Partial<Record<keyof SellerCheckEmailInput, string>> = {};
      e.errors?.forEach((item) => {
        const key = item.path[0] as keyof SellerCheckEmailInput;
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
      await checkEmail.mutateAsync({ email });
      if (typeof window !== "undefined") sessionStorage.setItem(SELLER_EMAIL_KEY, email);
      setSuccess(true);
      setTimeout(() => router.push("/seller/register/verify"), 1500);
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Code sent</h2>
          <p className="text-gray-600 mb-4">We&apos;ve sent a verification code to {email}</p>
          <p className="text-sm text-gray-500">Redirecting to verification...</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Become a seller</h1>
          <p className="text-gray-400">Enter your email to receive a verification code</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending code...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
