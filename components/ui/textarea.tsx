import * as React from "react"

import { fieldStyles } from "@/lib/field-styles"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        fieldStyles,
        "min-h-[88px] w-full resize-y px-3 py-2.5 text-sm",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
