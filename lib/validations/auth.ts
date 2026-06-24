import { z } from "zod";

/** Treat empty / missing form values as "" so Zod shows friendly messages (not "Invalid input") */
function optionalText() {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((value) => value ?? "");
}

function requiredText(requiredMessage: string) {
  return optionalText().pipe(z.string().min(1, requiredMessage));
}

export const loginSchema = z.object({
  email: optionalText().pipe(
    z.string().min(1, "Email is required").email("Invalid email address")
  ),
  password: optionalText().pipe(
    z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
  ),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: requiredText("Full name is required").pipe(
      z.string().min(2, "Name must be at least 2 characters")
    ),
    email: optionalText().pipe(
      z.string().min(1, "Email is required").email("Invalid email address")
    ),
    password: optionalText().pipe(
      z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
    ),
    confirmPassword: requiredText("Please confirm your password"),
    experienceLevel: z.enum(["fresher", "junior", "mid", "senior"], {
      message: "Please select your experience level",
    }),
    targetRole: requiredText("Target role is required"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerApiSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  experienceLevel: z
    .enum(["fresher", "junior", "mid", "senior"])
    .optional(),
  targetRole: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: optionalText().pipe(
    z.string().min(1, "Email is required").email("Invalid email address")
  ),
});

export const resetPasswordSchema = z
  .object({
    token: requiredText("Reset token is required"),
    password: optionalText().pipe(
      z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
    ),
    confirmPassword: requiredText("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
