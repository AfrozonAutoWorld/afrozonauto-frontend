import { z } from "zod";

export const sellerCheckEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const sellerVerifyTokenSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, "Verification code must be 6 digits").max(6),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const sellerRegisterSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().optional(),
    businessName: z.string().optional(),
    taxId: z.string().optional(),
    identificationNumber: z.string().optional(),
    identificationType: z.string().optional(),
    documents: z
      .array(
        z.object({
          file: z.instanceof(File),
          documentName: z.string().min(1, "Document type is required"),
        })
      )
      .min(1, "Upload at least one verification document"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SellerCheckEmailInput = z.infer<typeof sellerCheckEmailSchema>;
export type SellerVerifyTokenInput = z.infer<typeof sellerVerifyTokenSchema>;
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
