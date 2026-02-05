import { z } from "zod";

export const onboardingSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const verifySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  token: z.string().min(6, "Verification code must be 6 digits").max(6),
});

export const completeProfileSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
    role: z.enum(["BUYER", "SELLER"]).optional().default("BUYER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
  token: z.string().min(6, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

export const addressSchema = z.object({
  type: z.enum(["NORMAL", "BILLING", "SHIPPING"]),
  street: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
  additionalInfo: z.string().optional(),
  phoneNumber: z.string(),
  additionalPhoneNumber: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
