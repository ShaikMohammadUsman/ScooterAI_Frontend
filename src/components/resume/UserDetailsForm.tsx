"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ResumeProfile } from "@/lib/resumeService";
import { isValidEmail, isValidPhoneNumber, handlePhoneInputChange, getPhoneDisplayValue } from "@/lib/formValidation";



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
    const [emailError, setEmailError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");

    // Handle email change with validation
    const handleEmailChange = (email: string) => {
        onFieldChange("basic_information", "email", email);

        if (email && !isValidEmail(email)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    // Handle phone change with validation and formatting
    const handlePhoneChange = (phone: string) => {
        const formattedPhone = handlePhoneInputChange(phone);
        onFieldChange("basic_information", "phone_number", formattedPhone);

        if (formattedPhone && !isValidPhoneNumber(formattedPhone)) {
            setPhoneError("Please enter a valid 10-digit phone number");
        } else {
            setPhoneError("");
        }
    };

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
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className={emailError ? 'border-red-500 focus:border-red-500' : ''}
                />
                {emailError && (
                    <p className="text-xs text-red-600 mt-1">
                        {emailError}
                    </p>
                )}
            </FormControl>

            {/* Phone Number */}
            <FormControl>
                <FormLabel>Phone Number *</FormLabel>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm z-10 pointer-events-none">
                        +91
                    </div>
                    <Input
                        type="tel"
                        value={getPhoneDisplayValue(profile?.basic_information?.phone_number || "")}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className={`pl-12 ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                </div>
                {phoneError && (
                    <p className="text-xs text-red-600 mt-1">
                        {phoneError}
                    </p>
                )}
            </FormControl>
        </div>
    );
} 