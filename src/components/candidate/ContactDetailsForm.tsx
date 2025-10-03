"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ResumeProfile } from "@/lib/resumeService";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidEmail, isValidPhoneNumber } from "@/lib/formValidation";

const contactSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").refine(isValidEmail, "Please enter a valid email"),
    phone_number: z.string().min(1, "Phone number is required").refine(isValidPhoneNumber, "Please enter a valid phone number"),
    current_location: z.string().min(1, "Location is required"),
    linkedin_url: z.string().optional(),
    open_to_relocation: z.boolean()
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDetailsFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    parsedUserName?: string;
}

export default function ContactDetailsForm({ profile, onFieldChange, parsedUserName }: ContactDetailsFormProps) {
    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            full_name: profile?.basic_information?.full_name || "",
            email: profile?.basic_information?.email || "",
            phone_number: profile?.basic_information?.phone_number || "",
            current_location: profile?.basic_information?.current_location || "",
            linkedin_url: profile?.basic_information?.linkedin_url || "",
            open_to_relocation: profile?.basic_information?.open_to_relocation || false
        }
    });

    const handleInputChange = (field: string, value: any) => {
        form.setValue(field as keyof ContactFormData, value);
        onFieldChange("basic_information", field, value);
    };

    return (
        <div className="space-y-6 rounded-lg p-6 max-w-3xl mx-auto">
            <div className="space-y-4">
                {/* Full Name */}
                <Controller
                    control={form.control}
                    name="full_name"
                    render={({ field, fieldState }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Full Name*
                            </Label>
                            <Input
                                {...field}
                                placeholder="John Doe"
                                className="mt-2"
                                onChange={(e) => handleInputChange("full_name", e.target.value)}
                            />
                            {fieldState.error && (
                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                {/* Email Address */}
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Email Address*
                            </Label>
                            <Input
                                {...field}
                                type="email"
                                placeholder="johndoe@xyzcompany.com"
                                className="mt-2"
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                            {fieldState.error && (
                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                {/* Phone Number */}
                <Controller
                    control={form.control}
                    name="phone_number"
                    render={({ field, fieldState }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Phone Number*
                            </Label>
                            <Input
                                {...field}
                                type="tel"
                                placeholder="99XXX XXX47"
                                className="mt-2"
                                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                            />
                            {fieldState.error && (
                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                {/* Location */}
                <Controller
                    control={form.control}
                    name="current_location"
                    render={({ field, fieldState }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Location?*
                            </Label>
                            <Input
                                {...field}
                                placeholder="Pune, Maharashtra"
                                className="mt-2"
                                onChange={(e) => handleInputChange("current_location", e.target.value)}
                            />
                            {fieldState.error && (
                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />

                {/* LinkedIn Profile */}
                <Controller
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Linkedin Profile
                            </Label>
                            <Input
                                {...field}
                                type="url"
                                placeholder="johndoe_123"
                                className="mt-2"
                                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                            />
                        </div>
                    )}
                />

                {/* Relocation Switch */}
                <Controller
                    control={form.control}
                    name="open_to_relocation"
                    render={({ field }) => (
                        <div className="flex items-center justify-between py-4">
                            <Label className="text-sm font-medium">
                                Are you open to relocating?
                            </Label>
                            <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleInputChange("open_to_relocation", checked);
                                }}
                            />
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
