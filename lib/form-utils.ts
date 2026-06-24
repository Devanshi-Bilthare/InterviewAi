import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

/** First validation message from react-hook-form errors */
export function getFirstFieldError(
  errors: FieldErrors<FieldValues>
): string | undefined {
  for (const value of Object.values(errors)) {
    if (value && typeof value === "object" && "message" in value && value.message) {
      return String(value.message);
    }
  }
  return undefined;
}

/** Toast + ensure users see why submit was blocked */
export function showFormValidationErrors(errors: FieldErrors<FieldValues>) {
  const message = getFirstFieldError(errors);
  if (message) {
    toast.error(message);
  }
}

export const authFormOptions = {
  mode: "onSubmit" as const,
  reValidateMode: "onChange" as const,
  shouldFocusError: true,
  shouldUseNativeValidation: false,
};

/** Zod 4 + RHF resolver with correct output types */
export function authResolver<T extends FieldValues>(
  schema: z.ZodTypeAny
): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodResolver(schema as any) as unknown as Resolver<T>;
}
