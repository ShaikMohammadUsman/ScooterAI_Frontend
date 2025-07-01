"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function ToastDemo() {
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "Default Toast",
                        description: "This is a default toast notification.",
                    })
                }}
            >
                Default
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "Success!",
                        description: "Your action was completed successfully.",
                        variant: "success",
                    })
                }}
            >
                Success
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "Error!",
                        description: "Something went wrong. Please try again.",
                        variant: "destructive",
                    })
                }}
            >
                Error
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "Warning!",
                        description: "Please review your input before proceeding.",
                        variant: "warning",
                    })
                }}
            >
                Warning
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast({
                        title: "Info",
                        description: "Here's some helpful information for you.",
                        variant: "info",
                    })
                }}
            >
                Info
            </Button>
        </div>
    )
} 