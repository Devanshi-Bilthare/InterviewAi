import { cn } from "@/lib/utils";

/** Shared base styles for inputs, textareas, and select triggers */
export const fieldStyles = cn(
  "rounded-lg border border-deep-border bg-deep-bg/80 text-text-primary",
  "transition-all duration-200 outline-none",
  "placeholder:text-text-secondary",
  "focus:border-intelligence-primary focus:ring-2 focus:ring-intelligence-primary/20",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20"
);
