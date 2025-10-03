"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-4 w-8",
        md: "h-5 w-9",
        lg: "h-6 w-12"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, VariantProps<typeof switchVariants> { }

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      switchVariants({ size }),
      // Track styling
      "transition-colors border-transparent",
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-white data-[state=checked]:to-tint-5 data-[state=checked]:border-tint-5",
      "data-[state=unchecked]:bg-slate-200 data-[state=unchecked]:border-slate-300",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb base
        "block rounded-full shadow-lg ring-0 transition-transform duration-200 border-2",
        // Thumb size and position
        size === "sm"
          ? "h-3.5 w-3.5 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
          : size === "lg"
            ? "h-5 w-5 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
            : "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        // Thumb color
        "data-[state=checked]:bg-tint-2 data-[state=checked]:border-tint-2",
        "data-[state=unchecked]:bg-slate-100 data-[state=unchecked]:border-slate-300"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, switchVariants }
