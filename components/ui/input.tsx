import * as React from "react"

import { fieldStyles } from "@/lib/field-styles"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          fieldStyles,
          "h-10 w-full min-w-0 px-3 py-2 text-base md:text-sm",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
