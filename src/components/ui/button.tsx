import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer transform active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 hover:shadow-2xl hover:brightness-105 focus-visible:ring-blue-400/40 focus-visible:border-blue-500 active:scale-98",
        destructive:
          "bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white shadow-lg hover:from-red-600 hover:via-pink-700 hover:to-pink-700 hover:shadow-2xl hover:brightness-105 focus-visible:ring-red-400/40 focus-visible:border-red-500 active:scale-98",
        outline:
          "border-2 border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-blue-400 hover:shadow-md hover:shadow-blue-100 hover:-translate-y-0.5 focus-visible:ring-blue-200/40",
        secondary:
          "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-800 shadow-sm hover:from-gray-200 hover:via-gray-300 hover:to-gray-400 hover:shadow-md hover:brightness-105 hover:-translate-y-0.5",
        ghost:
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm hover:shadow-blue-50",
        link:
          "text-text-primary font-bold hover:bg-muted hover:decoration-2 transition-colors duration-200",
        success:
          "bg-gradient-to-r from-green-500 via-green-600 to-emerald-500 text-white shadow-lg hover:from-green-600 hover:via-emerald-600 hover:to-emerald-700 hover:shadow-2xl hover:brightness-105 focus-visible:ring-green-400/40 focus-visible:border-green-500 active:scale-98",
        warning:
          "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white shadow-lg hover:from-yellow-500 hover:via-amber-500 hover:to-amber-600 hover:shadow-2xl hover:brightness-105 focus-visible:ring-yellow-300/40 focus-visible:border-yellow-500 active:scale-98",
        premium:
          "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 text-white shadow-lg hover:from-purple-700 hover:via-pink-600 hover:to-purple-800 hover:shadow-2xl hover:brightness-105 focus-visible:ring-purple-400/40 focus-visible:border-purple-500 active:scale-98"
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
