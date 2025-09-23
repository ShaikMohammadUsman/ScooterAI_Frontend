"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    candidateSource: string;
    onCandidateSourceChange: (value: string) => void;
    candidateSourceOther: string;
    onCandidateSourceOtherChange: (value: string) => void;
}

export default function UserDetailsForm({ profile, onFieldChange, candidateSource, onCandidateSourceChange, candidateSourceOther, onCandidateSourceOtherChange }: UserDetailsFormProps) {
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
                <FormLabel>
                    Please enter your WhatsApp mobile number *
                    <span className="ml-2 align-middle inline-flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 012.1 12.045C2.111 6.495 6.584 2.012 12.13 2c2.671.005 5.181 1.047 7.072 2.941a9.935 9.935 0 012.929 7.086c-.013 5.548-4.486 10.032-10.05 10.032zm8.413-17.444A11.815 11.815 0 0012.12 0C5.405.013.013 5.417 0 12.127a11.97 11.97 0 001.637 6.021L.057 23.943a1.004 1.004 0 00.255 1.016c.196.195.451.303.707.303.09 0 .179-.012.267-.037l5.634-1.479a11.93 11.93 0 005.19 1.211h.005c6.713 0 12.104-5.404 12.12-12.112a11.86 11.86 0 00-3.49-8.46z" />
                        </svg>
                    </span>
                </FormLabel>
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

            {/* Candidate Source */}
            <FormControl>
                <FormLabel>How did you reach us? *</FormLabel>
                <Select value={candidateSource} onValueChange={onCandidateSourceChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="indeed">Indeed</SelectItem>
                        <SelectItem value="linkedIn">LinkedIn</SelectItem>
                        <SelectItem value="naukri">Naukri</SelectItem>
                        <SelectItem value="revGenius">Rev Genius</SelectItem>
                        <SelectItem value="whatsappGroups">Whatsapp Groups</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                {candidateSource === 'other' && (
                    <Input
                        placeholder="Please specify the source"
                        value={candidateSourceOther}
                        onChange={(e) => onCandidateSourceOtherChange(e.target.value)}
                        className="mt-2"
                    />
                )}
            </FormControl>
        </div>
    );
} 