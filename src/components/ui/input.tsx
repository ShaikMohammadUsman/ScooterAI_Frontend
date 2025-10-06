import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outline";
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, variant = "default", inputSize = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 py-2.5 text-sm",
      lg: "h-12 px-4 py-3 text-base"
    };

    const variantClasses = {
      default: "border-2 border-[var(--color-element-3)] bg-white hover:border-[var(--color-element-2)] focus-visible:border-[var(--color-element-3)] focus-visible:ring-2 focus-visible:ring-[var(--color-element-3)]/20",
      filled: "border-2 border-transparent bg-gradient-to-r from-[var(--color-element-3)]/10 to-[var(--color-element-3)]/20 hover:from-[var(--color-element-3)]/20 hover:to-[var(--color-element-3)]/30 focus-visible:border-[var(--color-element-3)] focus-visible:ring-2 focus-visible:ring-[var(--color-element-3)]/20 focus-visible:bg-white",
      outline: "border-2 border-[var(--color-element-3)] bg-transparent hover:border-[var(--color-element-2)] focus-visible:border-[var(--color-element-3)] focus-visible:ring-2 focus-visible:ring-[var(--color-element-3)]/20"
    };

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: 'var(--color-element-3)' }}>
            {leftIcon}
          </div>
        )}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: 'var(--color-element-3)' }}>
            {rightIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-lg text-gray-900 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            sizeClasses[inputSize],
            variantClasses[variant],
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          style={{
            '--placeholder-color': 'var(--color-element-3)',
            ...props.style
          } as React.CSSProperties}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
