import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  error?: string;
  spacing?: "sm" | "md";
}

function FormField({
  label,
  children,
  className,
  htmlFor,
  error,
  spacing = "md",
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn(className)}>
      {typeof label === "string" ? (
        <Label htmlFor={htmlFor}>{label}</Label>
      ) : (
        label
      )}
      <div
        className={cn(
          spacing === "sm" ? "mt-1.5" : "mt-2",
          error &&
            "[&_input]:border-danger [&_input]:ring-2 [&_input]:ring-danger/20 [&_textarea]:border-danger [&_textarea]:ring-2 [&_textarea]:ring-danger/20 [&_[data-slot=select-trigger]]:border-danger [&_[data-slot=select-trigger]]:ring-2 [&_[data-slot=select-trigger]]:ring-danger/20"
        )}
      >
        {children}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };
