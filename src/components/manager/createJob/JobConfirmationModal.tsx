"use client"

import React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface JobConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onContinueEdit: () => void;
}

export default function JobConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    onContinueEdit,
}: JobConfirmationModalProps) {
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
                    <AlertDialogTitle className="text-lg font-semibold text-gray-800">
                        Do You Want to Post this Role?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex items-center justify-center gap-4 sm:justify-center">
                    <Button
                        onClick={onConfirm}
                        variant="primary"
                        className=""
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={onContinueEdit}
                        variant="secondary"
                        className=""
                    >
                        Continue To Edit
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
