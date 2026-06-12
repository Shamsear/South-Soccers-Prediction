import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-md border-2 border-white/10 bg-black/40 px-4 py-2 text-sm',
          'text-white placeholder:text-gray-500',
          'transition-colors',
          'focus-visible:outline-none focus-visible:border-[#F3A81D] focus-visible:ring-2 focus-visible:ring-[#F3A81D]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
