"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/AuthCard";
import { authFormOptions, authResolver, showFormValidationErrors } from "@/lib/form-utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const authInputClass = "h-11";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, register, handleSubmit, getValues } =
    useForm<ForgotPasswordFormValues>({
      ...authFormOptions,
      resolver: authResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
    });

  const { errors } = useFormState({ control });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Failed to send reset link");
        return;
      }

      setSent(true);
      toast.success("Reset link sent!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-4 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="size-16 text-success" />
          </motion.div>
          <h1 className="mt-4 font-display text-2xl font-bold gradient-text">
            Check Your Email
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            We sent a password reset link to{" "}
            <span className="font-medium text-text-primary">
              {getValues("email")}
            </span>
          </p>
          <Link
            href="/login"
            className="mt-6 text-sm font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold gradient-text">
          Forgot Password?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, showFormValidationErrors)}
        className="space-y-5"
        noValidate
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@example.com"
            className={authInputClass}
            {...register("email")}
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
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
        >
          Login
        </Link>
      </p>
    </AuthCard>
  );
}
