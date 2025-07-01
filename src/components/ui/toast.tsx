"use client"

import * as React from "react"
import { Cross2Icon, CheckIcon, ExclamationTriangleIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-xl border p-4 pr-8 shadow-xl transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full backdrop-blur-sm before:absolute before:bottom-0 before:left-0 before:h-1 before:w-full before:bg-gradient-to-r before:from-transparent before:via-current before:to-transparent before:opacity-20 before:animate-pulse",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white/95 text-gray-900 shadow-lg shadow-gray-200/50 before:via-gray-400",
        success: "border-green-200 bg-green-50/95 text-green-900 shadow-lg shadow-green-200/50 before:via-green-400",
        destructive: "border-red-200 bg-red-50/95 text-red-900 shadow-lg shadow-red-200/50 before:via-red-400",
        warning: "border-amber-200 bg-amber-50/95 text-amber-900 shadow-lg shadow-amber-200/50 before:via-amber-400",
        info: "border-blue-200 bg-blue-50/95 text-blue-900 shadow-lg shadow-blue-200/50 before:via-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300 group-[.destructive]:hover:bg-red-100 group-[.destructive]:hover:text-red-900 group-[.destructive]:focus:ring-red-400",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:bg-red-100 group-[.destructive]:hover:text-red-600 group-[.destructive]:focus:ring-red-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-6 [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-5 opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Icon component for different toast types
const ToastIcon = ({ variant }: { variant?: "default" | "success" | "destructive" | "warning" | "info" }) => {
  const iconClasses = "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"

  switch (variant) {
    case "success":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 shadow-sm border border-green-200">
          <CheckIcon className={cn(iconClasses, "text-green-600")} />
        </div>
      )
    case "destructive":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-sm border border-red-200">
          <ExclamationTriangleIcon className={cn(iconClasses, "text-red-600")} />
        </div>
      )
    case "warning":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-sm border border-amber-200">
          <ExclamationTriangleIcon className={cn(iconClasses, "text-amber-600")} />
        </div>
      )
    case "info":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm border border-blue-200">
          <InfoCircledIcon className={cn(iconClasses, "text-blue-600")} />
        </div>
      )
    default:
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm border border-gray-200">
          <InfoCircledIcon className={cn(iconClasses, "text-gray-600")} />
        </div>
      )
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
