"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { ResumeProfile } from "@/lib/resumeService";

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface UserDetailsFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
}

export default function UserDetailsForm({ profile, onFieldChange }: UserDetailsFormProps) {
    return (
        <div className="mb-8 w-full max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Details</h3>
            <p className="text-sm text-gray-600">Please provide your basic information for resume processing.</p>

            {/* Full Name */}
            <FormControl>
                <FormLabel>Full Name *</FormLabel>
                <Input
                    value={profile?.basic_information?.full_name || ""}
                    onChange={e => onFieldChange("basic_information", "full_name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                />
            </FormControl>

            {/* Email Address */}
            <FormControl>
                <FormLabel>Email Address *</FormLabel>
                <Input
                    type="email"
                    value={profile?.basic_information?.email || ""}
                    onChange={e => onFieldChange("basic_information", "email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                />
            </FormControl>

            {/* Phone Number */}
            <FormControl>
                <FormLabel>Phone Number *</FormLabel>
                <Input
                    type="tel"
                    value={profile?.basic_information?.phone_number || ""}
                    onChange={e => {
                        // Only allow digits, +, -, and spaces
                        const cleaned = e.target.value.replace(/[^\d+\-\s]/g, "");
                        onFieldChange("basic_information", "phone_number", cleaned);
                    }}
                    placeholder="+1 (555) 555-5555"
                    required
                />
            </FormControl>
        </div>
    );
} 