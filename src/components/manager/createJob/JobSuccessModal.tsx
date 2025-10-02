"use client"

import React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface JobSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onContinueToDashboard: () => void;
    onCreateAnotherRole: () => void;
}

export default function JobSuccessModal({
    open,
    onOpenChange,
    onContinueToDashboard,
    onCreateAnotherRole,
}: JobSuccessModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <div className="absolute right-4 top-4">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-4 w-4 text-cta-primary" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <AlertDialogHeader className="text-center">
                    <AlertDialogTitle className="text-lg font-semibold text-gray-800 text-center">
                        New Role Created!
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex items-center justify-around sm:justify-around gap-2">
                    <Button
                        onClick={onContinueToDashboard}
                        variant="primary"
                        className="px-2 sm:px-4"
                    >
                        Continue to Dashboard
                    </Button>
                    <Button
                        onClick={onCreateAnotherRole}
                        variant="secondary"
                        className="px-2 sm:px-4"
                    >
                        Create Another Role
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
