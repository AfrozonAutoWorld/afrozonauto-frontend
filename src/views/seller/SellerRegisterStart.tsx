"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, X } from "lucide-react";
import { sellerCheckEmailSchema } from "@/lib/validation/seller.schema";
import { useSellerMutations } from "@/hooks/useSellerMutations";
import {
  isValidInternationalPhone,
  normalizePhoneNumber,
} from "@/lib/validation/phone";

export function SellerRegisterStart() {
  const router = useRouter();
  const { checkEmail, verifyToken, SELLER_SIGNUP_DRAFT_KEY } = useSellerMutations();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLen = password.length >= 8;

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    if (firstName.trim().length < 2) nextErrors.firstName = "First name is required";
    if (lastName.trim().length < 2) nextErrors.lastName = "Last name is required";
    try {
      sellerCheckEmailSchema.parse({ email });
    } catch {
      nextErrors.email = "Please enter a valid email";
    }
    if (!isValidInternationalPhone(normalizePhoneNumber(phone))) {
      nextErrors.phone = "Enter a valid phone number with country code (e.g. +234 90883293)";
    }
    if (!hasLen || !hasUpper || !hasNumber || !hasSpecial) {
      nextErrors.password =
        "Password must be at least 8 chars and include uppercase, number, and special character";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSendingOtp(true);
    setOtpError("");

    try {
      await checkEmail.mutateAsync({ email: email.trim() });
      setOtpCode("");
      setOtpOpen(true);
    } catch {
      // toast handled in mutation hook
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setOtpError("Enter the 6-digit code sent to your email.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      await verifyToken.mutateAsync({ email: email.trim(), token: otpCode });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          SELLER_SIGNUP_DRAFT_KEY,
          JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: normalizePhoneNumber(phone),
            password,
          }),
        );
      }

      setOtpOpen(false);
      router.push("/seller/register/verify");
    } catch {
      setOtpError("Invalid or expired code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setOtpError("");
    try {
      await checkEmail.mutateAsync({ email: email.trim() });
    } catch {
      // toast handled in mutation hook
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <h1 className="font-sans text-[48px] font-bold leading-[60px] text-[#111827]">
        Get Started!
      </h1>
      <p className="mt-1 font-body text-xl text-[#B8B8B8]">
        Create your account to list your car and get paid securely.
      </p>

      <div className="my-6 h-px w-full bg-[#E5E7EB]" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Biobele"
              className={`h-11 w-full rounded-lg border px-3.5 font-body text-base ${
                errors.firstName ? "border-red-300" : "border-[#E5E7EB]"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Owen"
              className={`h-11 w-full rounded-lg border px-3.5 font-body text-base ${
                errors.lastName ? "border-red-300" : "border-[#E5E7EB]"
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. owenbiobele@gmail.com"
            className={`h-11 w-full rounded-lg border px-3.5 font-body text-base ${
              errors.email ? "border-red-300" : "border-[#E5E7EB]"
            }`}
          />
          {errors.email && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
            Phone Number (include country code)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(normalizePhoneNumber(e.target.value))}
            placeholder="+234 90883293"
            className={`h-11 w-full rounded-lg border px-3.5 font-body text-base ${
              errors.phone ? "border-red-300" : "border-[#E5E7EB]"
            }`}
          />
          <p className="mt-1 font-body text-xs text-[#6B7280]">
            Example format: +234 90883293
          </p>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className={`h-11 w-full rounded-lg border px-3.5 font-body text-base ${
              errors.password ? "border-red-300" : "border-[#E5E7EB]"
            }`}
          />
          <div className="mt-2 space-y-1">
            <p className="font-body text-xs text-[#6B7280]">
              Your password must contain at least:
            </p>
            {[
              { ok: hasLen, label: "8 characters" },
              { ok: hasUpper, label: "1 uppercase letter" },
              { ok: hasNumber, label: "1 number" },
              { ok: hasSpecial, label: "1 special character (e.g. @, #, $, !)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                {item.ok ? (
                  <Check className="h-3.5 w-3.5 text-[#0D7A4A]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-[#6B7280]" />
                )}
                <span className={item.ok ? "text-[#0D7A4A]" : "text-[#6B7280]"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSendingOtp}
          className="mt-2 h-12 w-full rounded-lg bg-[#0D7A4A] font-body text-lg font-medium text-white transition-colors hover:bg-[#0a633e]"
        >
          {isSendingOtp ? "Sending OTP..." : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center font-body text-sm text-[#9CA3AF]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#0D7A4A] hover:text-[#0a633e]">
          Sign In
        </Link>
      </p>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-sans text-3xl font-bold text-[#111827]">
              Verify your email
            </h2>
            <p className="mt-2 font-body text-sm text-[#6B7280]">
              Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>.
            </p>

            <div className="mt-5">
              <label className="mb-2 block font-body text-sm font-medium text-[#111827]">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (otpError) setOtpError("");
                }}
                placeholder="000000"
                className="h-12 w-full rounded-lg border border-[#E5E7EB] px-3.5 text-center font-body text-2xl tracking-[0.2em] text-[#111827]"
              />
              {otpError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="h-11 flex-1 rounded-lg bg-[#0D7A4A] font-body text-base font-medium text-white hover:bg-[#0a633e] disabled:opacity-60"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp}
                className="h-11 rounded-lg border border-[#E5E7EB] px-4 font-body text-sm font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-60"
              >
                {isResendingOtp ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOtpOpen(false)}
              className="mt-3 h-10 w-full rounded-lg font-body text-sm text-[#6B7280] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
