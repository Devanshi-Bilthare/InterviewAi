"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm, Controller, useFormState } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { authFormOptions, authResolver, showFormValidationErrors } from "@/lib/form-utils";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const authInputClass = "h-11";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit, setValue, watch } =
    useForm<RegisterFormValues>({
      ...authFormOptions,
      resolver: authResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      experienceLevel: undefined,
      targetRole: "",
      acceptTerms: false,
    },
    });

  const { errors } = useFormState({ control });
  const password = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          experienceLevel: data.experienceLevel,
          targetRole: data.targetRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(result.error ?? "Registration failed");
        }
        return;
      }

      toast.success("Account created! Signing you in...");

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!signInResult?.error) {
        window.location.href = "/onboarding";
        return;
      }

      toast.success("Account created! Please sign in.");
      window.location.href = "/login";
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard className="max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold gradient-text">
          Start Your Journey
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Create your account and ace your next interview
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, showFormValidationErrors)}
        className="space-y-5"
        noValidate
      >
        <FormField label="Full Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="John Doe"
            className={authInputClass}
            {...register("name")}
          />
        </FormField>

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

        <FormField
          label="Password"
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

        <FormField
          label="Experience Level"
          error={errors.experienceLevel?.message}
        >
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Target Role"
          htmlFor="targetRole"
          error={errors.targetRole?.message}
        >
          <Input
            id="targetRole"
            placeholder="e.g. Frontend Developer"
            className={authInputClass}
            {...register("targetRole")}
          />
        </FormField>

        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="acceptTerms"
            checked={watch("acceptTerms")}
            onCheckedChange={(checked) =>
              setValue("acceptTerms", checked === true, {
                shouldValidate: true,
              })
            }
            className="mt-0.5"
          />
          <Label
            htmlFor="acceptTerms"
            className="cursor-pointer text-sm leading-relaxed text-text-secondary"
          >
            I agree to the{" "}
            <span className="text-intelligence-primary">Terms of Service</span>{" "}
            and{" "}
            <span className="text-intelligence-primary">Privacy Policy</span>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p role="alert" className="-mt-2 text-sm text-danger">
            {errors.acceptTerms.message}
          </p>
        )}

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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
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
