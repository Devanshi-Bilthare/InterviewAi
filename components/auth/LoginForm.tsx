"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/AuthCard";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { authFormOptions, authResolver, showFormValidationErrors } from "@/lib/form-utils";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const authInputClass = "h-11";

interface LoginFormProps {
  googleEnabled?: boolean;
}

export function LoginForm({ googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { control, register, handleSubmit, setValue, watch, setError, clearErrors } =
    useForm<LoginFormValues>({
      ...authFormOptions,
      resolver: authResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
      },
    });

  const { errors } = useFormState({ control });
  const rememberMe = watch("rememberMe");

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      setAuthError(getAuthErrorMessage(errorCode));
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setAuthError(null);
    clearErrors();

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const message = getAuthErrorMessage(result.error);
        setAuthError(message);
        setError("password", { type: "manual", message });
        toast.error(message);
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      const message = "Google sign-in failed";
      setAuthError(message);
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold gradient-text">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in to continue your interview prep
        </p>
      </div>

      {authError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

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
            aria-describedby={errors.email ? "email-error" : undefined}
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
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-describedby={errors.password ? "password-error" : undefined}
            className={authInputClass}
            {...register("password")}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked === true)
              }
            />
            <Label
              htmlFor="rememberMe"
              className="cursor-pointer text-sm text-text-secondary"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-intelligence-primary hover:text-intelligence-violet transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-deep-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-deep-card/65 px-2 text-text-secondary">
                or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className="h-11 w-full border-deep-border bg-deep-card/50 text-text-primary hover:bg-deep-border/50"
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-intelligence-primary hover:text-intelligence-violet transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}
