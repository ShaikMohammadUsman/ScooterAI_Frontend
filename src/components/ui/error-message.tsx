"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
    message?: string;
    className?: string;
}

export default function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
    if (!message) return null;

    return (
        <div className={`p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
            <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
} 