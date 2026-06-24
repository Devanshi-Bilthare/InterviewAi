"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { authFormOptions, authResolver, showFormValidationErrors } from "@/lib/form-utils";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const authInputClass = "h-11";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, register, handleSubmit, watch, setValue } =
    useForm<ResetPasswordFormValues>({
      ...authFormOptions,
      resolver: authResolver(resetPasswordSchema),
      defaultValues: {
        token,
        password: "",
        confirmPassword: "",
      },
    });

  const { errors } = useFormState({ control });
  const password = watch("password");

  useEffect(() => {
    setValue("token", token);
  }, [token, setValue]);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setTokenError("Invalid reset link. Please request a new password reset.");
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setTokenError(data.error ?? "This reset link is invalid or has expired.");
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      } catch {
        setTokenError("Unable to verify reset link. Please try again.");
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to reset password");
        return;
      }

      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-8">
          <Loader2 className="size-8 animate-spin text-intelligence-primary" />
          <p className="mt-4 text-sm text-text-secondary">Verifying reset link...</p>
        </div>
      </AuthCard>
    );
  }

  if (tokenError) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-4 text-center">
          <AlertCircle className="size-16 text-danger" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
            Link Expired
          </h1>
          <p className="mt-2 text-sm text-text-secondary">{tokenError}</p>
          <Link
            href="/forgot-password"
            className="mt-6 text-sm font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 className="size-16 text-success" />
          <h1 className="mt-4 font-display text-2xl font-bold gradient-text">
            Password Updated
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Redirecting you to sign in...
          </p>
          <Link
            href="/login"
            className="mt-6 text-sm font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (!tokenValid) {
    return null;
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold gradient-text">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your new password below
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, showFormValidationErrors)}
        className="space-y-5"
        noValidate
      >
        <input type="hidden" {...register("token")} />

        <FormField
          label="New Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            className={authInputClass}
            {...register("password")}
          />
          <div className="mt-2">
            <PasswordStrength password={password} />
          </div>
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={authInputClass}
            {...register("confirmPassword")}
          />
        </FormField>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "h-11 w-full border-0 text-white",
            "bg-gradient-to-r from-intelligence-primary to-intelligence-secondary",
            "hover:opacity-90 hover:shadow-glow"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
        >
          Back to Login
        </Link>
      </p>
    </AuthCard>
  );
}
