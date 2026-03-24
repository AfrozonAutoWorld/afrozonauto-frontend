"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Lock, Mail, EyeOff, Eye, KeyRound } from "lucide-react";
import { resetPasswordSchema } from "../lib/validation/auth.schema";
import { useForm } from "../hooks/useForm";
import { useAuthMutations } from "@/hooks/useAuthMutations";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  /** When opened from the dashboard, the account email is known */
  defaultEmail?: string;
}

export function ResetPasswordModal({ onClose, onSuccess, defaultEmail }: Props) {
  const { resetPassword, isResettingPassword } = useAuthMutations();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    schema: resetPasswordSchema,
    initialValues: {
      email: defaultEmail ?? "",
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
        onSuccess();
        onClose();
      } catch {
        /* useAuthMutations shows toast */
      }
    },
  });

  useEffect(() => {
    if (defaultEmail) {
      form.setFieldValue("email", defaultEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultEmail]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <form
        onSubmit={form.handleSubmit}
        className="w-full max-w-md space-y-5"
      >
        <div className="space-y-5 rounded-xl bg-white p-6">
          <div className="flex items-center justify-between">
            <h2
              id="reset-password-title"
              className="text-lg font-semibold text-[#111827]"
            >
              Reset password
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm leading-5 text-[#6B7280]">
            Enter the 6-digit code from your email and choose a new password.
          </p>

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
                readOnly={Boolean(defaultEmail)}
                className={`w-full rounded-lg border py-3 pl-12 pr-4 focus:border-transparent focus:ring-2 focus:ring-[#0D7A4A] ${
                  form.errors.email ? "border-red-300" : "border-gray-300"
                } ${defaultEmail ? "cursor-not-allowed bg-gray-50" : ""}`}
              />
            </div>
            {form.errors.email && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{form.errors.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#414651]">
              6-digit code
            </label>
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
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{form.errors.token}</span>
              </div>
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
                onClick={() => setShowPassword(!showPassword)}
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
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{form.errors.newPassword}</span>
              </div>
            )}
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
                  form.errors.confirmPassword
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
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
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{form.errors.confirmPassword}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={form.isSubmitting || isResettingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] py-3 font-semibold text-white transition-colors hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.isSubmitting || isResettingPassword ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
