"use client";
import React from "react";

interface ConsentCheckboxProps {
    consentToUpdates: boolean;
    onConsentChange: (consent: boolean) => void;
    profile: any;
}

export default function ConsentCheckbox({ consentToUpdates, onConsentChange, profile }: ConsentCheckboxProps) {
    return (
        <div className="mb-8 w-full max-w-md mx-auto flex items-start gap-2">
            <input
                id="consent-checkbox"
                type="checkbox"
                required={!!profile?.basic_information.phone_number}
                className="mt-1"
                onChange={() => {
                    onConsentChange(!consentToUpdates);
                }}
            />
            <label htmlFor="consent-checkbox" className="text-sm text-gray-700">
                I consent to receive updates about my application via SMS/Whatsapp/email
                <span className="block text-xs text-muted-foreground mt-1">
                    This lets us update you via email or SMS on interview status.
                </span>
            </label>
        </div>
    );
} 