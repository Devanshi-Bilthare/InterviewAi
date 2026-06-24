"use client";

import { forwardRef, useState } from "react";

import { fieldStyles } from "@/lib/field-styles";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, id, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && value !== "";
    const floated = focused || hasValue || defaultValue !== undefined;

    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholder=" "
          className={cn(
            fieldStyles,
            "peer h-12 w-full bg-deep-card/50 px-4 pt-4 pb-1 text-sm",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-4 text-text-secondary transition-all duration-200",
            floated
              ? "top-1.5 text-[11px] text-intelligence-primary"
              : "top-1/2 -translate-y-1/2 text-sm"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1.5 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
