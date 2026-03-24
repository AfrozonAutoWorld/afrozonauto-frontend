"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from "lucide-react";

import { useForm } from "../hooks/useForm";
import { resetPasswordSchema, validateResetTokenSchema } from "../lib/validation/auth.schema";
import { useAuthMutations } from "@/hooks/useAuthMutations";
import { authApi } from "@/lib/api/auth";
import { showToast } from "@/lib/showNotification";

type ResetPasswordProps = {
  links?: { loginHref?: string };
  embedded?: boolean;
};

export function ResetPassword({
  links,
  embedded = false,
}: ResetPasswordProps) {
  const loginHref = links?.loginHref ?? "/login";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resetPassword, isResettingPassword } = useAuthMutations();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/seller/")) {
      sessionStorage.setItem("post_reset_login_href", "/login?as=seller");
    } else {
      sessionStorage.removeItem("post_reset_login_href");
    }
  }, [pathname]);

  const form = useForm({
    schema: resetPasswordSchema,
    initialValues: {
      email: "",
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      if (values.newPassword !== values.confirmPassword) {
        form.setFieldError("confirmPassword", "Passwords don't match");
        return;
      }
      try {
        await resetPassword(values);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not reset password";
        showToast({ type: "error", message });
      }
    },
  });

  const emailFromUrl = searchParams.get("email")?.trim() ?? "";
  useEffect(() => {
    if (emailFromUrl) {
      form.setFieldValue("email", emailFromUrl);
      return;
    }
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem("reset_email")
        : null;
    if (stored) {
      form.setFieldValue("email", stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setFieldValue is not stable from useForm
  }, [emailFromUrl]);

  const handleCheckCode = async () => {
    const parsed = validateResetTokenSchema.safeParse({
      email: form.values.email,
      token: form.values.token,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      showToast({
        type: "error",
        message: first?.message || "Enter email and 6-digit code first",
      });
      return;
    }
    setValidatingCode(true);
    try {
      const { tokenValid } = await authApi.validateResetToken(parsed.data);
      if (tokenValid) {
        showToast({
          type: "success",
          message: "Code verified. Enter and confirm your new password.",
        });
      } else {
        showToast({
          type: "error",
          message: "That code is not valid. Request a new code from forgot password.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not verify code";
      showToast({ type: "error", message });
    } finally {
      setValidatingCode(false);
    }
  };

  const formInner = (
    <>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-bold text-[#111827]">
          Set a new password
        </h1>
        <p className="mt-2 text-sm leading-5 text-[#6B7280]">
          Use the 6-digit code from your email together with your account email.
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#414651]">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="email"
              name="email"
              value={form.values.email}
              onChange={form.handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full rounded-lg border py-3 pl-12 pr-4 focus:border-transparent focus:ring-2 focus:ring-[#0D7A4A] ${
                form.errors.email ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {form.errors.email && (
            <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-[#414651]">
              6-digit code
            </label>
            <button
              type="button"
              onClick={handleCheckCode}
              disabled={validatingCode}
              className="text-xs font-medium text-[#0D7A4A] hover:text-[#0b6840] disabled:opacity-50"
            >
              {validatingCode ? "Checking…" : "Verify code"}
            </button>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={form.values.token}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                form.setFieldValue("token", digits);
              }}
              placeholder="••••••"
              className={`w-full rounded-lg border py-3 pl-12 pr-4 tracking-[0.2em] focus:border-transparent focus:ring-2 focus:ring-[#0D7A4A] ${
                form.errors.token ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {form.errors.token && (
            <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.errors.token}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#414651]">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={form.values.newPassword}
              onChange={form.handleChange}
              autoComplete="new-password"
              className={`w-full rounded-lg border py-3 pl-12 pr-12 focus:border-transparent focus:ring-2 focus:ring-[#0D7A4A] ${
                form.errors.newPassword ? "border-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {form.errors.newPassword && (
            <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.errors.newPassword}
            </p>
          )}
          <p className="mt-1.5 text-xs text-[#6B7280]">
            At least 8 characters with upper, lower, and a number.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#414651]">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.values.confirmPassword}
              onChange={form.handleChange}
              autoComplete="new-password"
              className={`w-full rounded-lg border py-3 pl-12 pr-12 focus:border-transparent focus:ring-2 focus:ring-[#0D7A4A] ${
                form.errors.confirmPassword ? "border-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {form.errors.confirmPassword && (
            <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {form.errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={form.isSubmitting || isResettingPassword}
          className="w-full rounded-lg bg-[#0D7A4A] py-3 font-semibold text-white transition-colors hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {form.isSubmitting || isResettingPassword
            ? "Updating password…"
            : "Update password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#6B7280]">
        Remember it now?{" "}
        <Link
          href={loginHref}
          className="font-medium text-[#0D7A4A] hover:text-[#0b6840]"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-[#6B7280]">
        No code?{" "}
        <Link
          href={
            pathname?.startsWith("/seller/")
              ? "/seller/forgot-password"
              : "/forgot-password"
          }
          className="font-medium text-[#0D7A4A] hover:text-[#0b6840]"
        >
          Request again
        </Link>
      </p>
    </>
  );

  const formCard = (
    <div
      className={
        embedded
          ? "w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm"
          : "rounded-2xl bg-white p-8 shadow-xl"
      }
    >
      {formInner}
    </div>
  );

  if (embedded) {
    return <div className="flex w-full justify-center">{formCard}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <Car className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Afrozon</span>
              <span className="text-2xl font-light text-emerald-400">
                {" "}
                AutoGlobal
              </span>
            </div>
          </Link>
          <p className="text-gray-400">Password recovery</p>
        </div>
        {formCard}
      </div>
    </div>
  );
}
