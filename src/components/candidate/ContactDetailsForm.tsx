"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResumeProfile } from "@/lib/resumeService";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidEmail, isValidPhoneNumber } from "@/lib/formValidation";

const contactSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().optional(),
    phone_number: z.string().optional(),
    current_location: z.string().min(1, "Location is required"),
    linkedin_url: z.string().optional(),
    open_to_relocation: z.boolean(),
    work_preference: z.string().optional()
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactDetailsFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    parsedUserName?: string;
}

export default function ContactDetailsForm({ profile, onFieldChange, parsedUserName }: ContactDetailsFormProps) {
    // Check if fields are valid/missing to determine if they should be shown
    const shouldShowFullName = !profile?.basic_information?.full_name || profile.basic_information.full_name.trim() === "";
    const shouldShowEmail = !profile?.basic_information?.email || !isValidEmail(profile.basic_information.email);
    const shouldShowPhone = !profile?.basic_information?.phone_number || !isValidPhoneNumber(profile.basic_information.phone_number);

    // Create dynamic schema based on which fields should be shown
    const dynamicSchema = z.object({
        full_name: shouldShowFullName ? z.string().min(1, "Full name is required") : z.string().optional(),
        email: shouldShowEmail ? z.string().min(1, "Email is required").refine(isValidEmail, "Please enter a valid email") : z.string().optional(),
        phone_number: shouldShowPhone ? z.string().min(1, "Phone number is required").refine(isValidPhoneNumber, "Please enter a valid phone number") : z.string().optional(),
        current_location: z.string().min(1, "Location is required"),
        linkedin_url: z.string().optional(),
        open_to_relocation: z.boolean(),
        work_preference: z.string().optional()
    });

    const form = useForm<ContactFormData>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            full_name: profile?.basic_information?.full_name || "",
            email: profile?.basic_information?.email || "",
            phone_number: profile?.basic_information?.phone_number || "",
            current_location: profile?.basic_information?.current_location || "",
            linkedin_url: profile?.basic_information?.linkedin_url || "",
            open_to_relocation: profile?.basic_information?.open_to_relocation || false,
            work_preference: "" // Will be added to profile data structure later
        }
    });

    const handleInputChange = (field: string, value: any) => {
        form.setValue(field as keyof ContactFormData, value);
        onFieldChange("basic_information", field, value);
    };

    return (
        <div className="space-y-6 rounded-lg p-6 max-w-3xl mx-auto">
            <div className="space-y-4">
                {/* Full Name - Only show if missing or invalid */}
                {shouldShowFullName && (
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
                )}

                {/* Email Address - Only show if missing or invalid */}
                {shouldShowEmail && (
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
                )}

                {/* Phone Number - Only show if missing or invalid */}
                {shouldShowPhone && (
                    <Controller
                        control={form.control}
                        name="phone_number"
                        render={({ field, fieldState }) => (
                            <div>
                                <Label className="text-sm font-medium">
                                    Whatsapp Number*
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
                )}

                {/* Current Location */}
                <Controller
                    control={form.control}
                    name="current_location"
                    render={({ field, fieldState }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Current Location*
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

                {/* Work Preference */}
                <Controller
                    control={form.control}
                    name="work_preference"
                    render={({ field }) => (
                        <div>
                            <Label className="text-sm font-medium">
                                Work Preference
                            </Label>
                            <Select value={field.value} onValueChange={(value) => {
                                field.onChange(value);
                                handleInputChange("work_preference", value);
                            }}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select work preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="inPerson">In-person</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />

                {/* Open to Relocation */}
                <Controller
                    control={form.control}
                    name="open_to_relocation"
                    render={({ field }) => (
                        <div className="flex items-center justify-between py-4">
                            <Label className="text-sm font-medium">
                                Open to Relocation
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
