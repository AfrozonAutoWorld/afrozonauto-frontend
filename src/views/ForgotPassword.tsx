"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Car, Mail, AlertCircle, ArrowRight, Inbox } from "lucide-react";
import { useForm } from "../hooks/useForm";
import { forgotPasswordSchema } from "../lib/validation/auth.schema";
import { useAuthMutations } from "@/hooks/useAuthMutations";
import { showToast } from "@/lib/showNotification";

export type PasswordRecoveryLinks = {
  loginHref?: string;
  /** Path to open reset form (buyer: `/reset-password`, seller: `/seller/reset-password`) */
  resetPasswordHref?: string;
};

type ForgotPasswordProps = {
  links?: PasswordRecoveryLinks;
  /** When true, omit outer gradient shell (e.g. wrapped in SellerAuthLayout) */
  embedded?: boolean;
};

export function ForgotPassword({
  links,
  embedded = false,
}: ForgotPasswordProps) {
  const router = useRouter();
  const { forgotPassword, isForgettingPassword } = useAuthMutations();
  const loginHref = links?.loginHref ?? "/login";
  const resetPasswordHref = links?.resetPasswordHref ?? "/reset-password";

  const [sentForEmail, setSentForEmail] = useState<string | null>(null);

  const form = useForm({
    schema: forgotPasswordSchema,
    initialValues: { email: "" },
    onSubmit: async (values) => {
      try {
        await forgotPassword(values);
        sessionStorage.setItem("reset_email", values.email);
        setSentForEmail(values.email);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        showToast({ type: "error", message });
      }
    },
  });

  const continueToReset = () => {
    if (!sentForEmail) return;
    router.push(
      `${resetPasswordHref}?email=${encodeURIComponent(sentForEmail)}`,
    );
  };

  const formCard = (
    <div
      className={
        embedded
          ? "w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm"
          : "rounded-2xl bg-white p-8 shadow-xl"
      }
    >
      {!sentForEmail ? (
        <>
          <div className="mb-6">
            <h1
              className={`font-sans text-2xl font-bold text-[#111827] ${embedded ? "" : ""}`}
            >
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm leading-5 text-[#6B7280]">
              Enter your email and we&apos;ll send a 6-digit code you can use on
              the next step.
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
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{form.errors.email}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={form.isSubmitting || isForgettingPassword}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] py-3 font-semibold text-white transition-colors hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.isSubmitting || isForgettingPassword ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending code…
                </>
              ) : (
                <>
                  Send reset code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6F4]">
            <Inbox className="h-7 w-7 text-[#0D7A4A]" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-[#111827]">
            Check your email
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#111827]">{sentForEmail}</span>.
            Use it on the next screen with a new password.
          </p>
          <button
            type="button"
            onClick={continueToReset}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D7A4A] py-3 font-semibold text-white transition-colors hover:bg-[#0b6840]"
          >
            Continue to reset password
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSentForEmail(null)}
            className="mt-4 text-sm font-medium text-[#0D7A4A] hover:text-[#0b6840]"
          >
            Use a different email
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-[#6B7280]">
        Know your password?{" "}
        <Link
          href={loginHref}
          className="font-medium text-[#0D7A4A] hover:text-[#0b6840]"
        >
          Sign in
        </Link>
      </p>
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
          {!sentForEmail && (
            <>
              <p className="text-gray-400">Password recovery</p>
            </>
          )}
        </div>
        {formCard}
      </div>
    </div>
  );
}
