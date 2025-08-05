"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SingleSelect } from "@/components/ui/single-select";
import {
    InfoIcon,
    Linkedin,
    User,
    MapPin,
    Phone,
    Mail,
    Globe,
    CheckCircle2,
    Sparkles,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeProfile } from "@/lib/resumeService";
import { isValidEmail, isValidPhoneNumber, handlePhoneInputChange, getPhoneDisplayValue, isValidLinkedInUrl } from "@/lib/formValidation";

// Constants
const NOTICE_PERIOD_OPTIONS = [
    "Immediate",
    "15 days",
    "30 days",
    "60 days",
    "90 days"
];

const INDIAN_CITIES = [
    "Mumbai, Maharashtra",
    "Delhi, Delhi",
    "Bengaluru, Karnataka",
    "Hyderabad, Telangana",
    "Ahmedabad, Gujarat",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Pune, Maharashtra",
    "Jaipur, Rajasthan",
    "Lucknow, Uttar Pradesh",
    "Kanpur, Uttar Pradesh",
    "Nagpur, Maharashtra",
    "Indore, Madhya Pradesh",
    "Thane, Maharashtra",
    "Bhopal, Madhya Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Pimpri-Chinchwad, Maharashtra",
    "Patna, Bihar",
    "Vadodara, Gujarat",
    "Ghaziabad, Uttar Pradesh",
    "Ludhiana, Punjab",
    "Agra, Uttar Pradesh",
    "Nashik, Maharashtra",
    "Faridabad, Haryana",
    "Meerut, Uttar Pradesh",
    "Rajkot, Gujarat",
    "Kalyan-Dombivli, Maharashtra",
    "Vasai-Virar, Maharashtra",
    "Varanasi, Uttar Pradesh",
    "Srinagar, Jammu and Kashmir",
    "Aurangabad, Maharashtra",
    "Dhanbad, Jharkhand",
    "Amritsar, Punjab",
    "Navi Mumbai, Maharashtra",
    "Allahabad, Uttar Pradesh",
    "Ranchi, Jharkhand",
    "Howrah, West Bengal",
    "Coimbatore, Tamil Nadu",
    "Jabalpur, Madhya Pradesh",
    "Gwalior, Madhya Pradesh",
    "Vijayawada, Andhra Pradesh"
];



// Enhanced form components
const FormLabel = ({ children, className, icon }: { children: React.ReactNode; className?: string; icon?: React.ReactNode }) => (
    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 ${className}`}>
        {icon && <span className="text-blue-500">{icon}</span>}
        {children}
    </label>
);

const FormControl = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`space-y-2 ${className}`}>{children}</div>
);

const FormCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        {children}
    </div>
);

interface ContactInformationFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    parsedUserName?: string; // Add prop for parsed user name
}

export default function ContactInformationForm({ profile, onFieldChange, parsedUserName }: ContactInformationFormProps) {
    const [emailError, setEmailError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");

    const isContactComplete = !!(profile?.basic_information?.full_name &&
        profile?.basic_information?.email &&
        profile?.basic_information?.phone_number);

    // Get the user's name for personalization
    const userName = parsedUserName || profile?.basic_information?.full_name || "there";
    const firstName = userName.split(' ')[0];

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
        <div className="flex items-center justify-center py-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl">
                {/* Personalized Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Heart className="w-6 h-6 text-red-400" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Nice to meet you, {firstName}! 👋
                        </h2>
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-gray-600 text-sm">
                        Let's get your contact details sorted so we can connect you with amazing opportunities
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name - Show as read-only if already parsed */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 text-blue-400" />
                            Name
                            <span className="text-red-500">*</span>
                            {parsedUserName && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    ✓ Parsed
                                </span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>First + last name as it should appear to hiring teams</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <Input
                            value={profile?.basic_information.full_name || ""}
                            onChange={e => onFieldChange("basic_information", "full_name", e.target.value)}
                            placeholder="Full name"
                            required
                            className="h-9 text-sm"
                            readOnly={!!parsedUserName} // Make read-only if parsed
                        />
                        {parsedUserName && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ We've got this from your resume!
                            </p>
                        )}
                    </div>
                    {/* Email - Show as read-only if already parsed */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 text-blue-400" />
                            Email
                            <span className="text-red-500">*</span>
                            {profile?.basic_information?.email && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    ✓ Parsed
                                </span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Primary contact for job opportunities</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <Input
                            type="email"
                            value={profile?.basic_information.email || ""}
                            onChange={e => handleEmailChange(e.target.value)}
                            placeholder="Email address"
                            required
                            className={`h-9 text-sm ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                            readOnly={!!profile?.basic_information?.email} // Make read-only if parsed
                        />
                        {emailError && (
                            <p className="text-xs text-red-600 mt-1">
                                {emailError}
                            </p>
                        )}
                        {profile?.basic_information?.email && !emailError && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ We've got this from your resume!
                            </p>
                        )}
                    </div>
                    {/* Phone - Show as read-only if already parsed */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Phone className="w-4 h-4 text-blue-400" />
                            Phone
                            <span className="text-red-500">*</span>
                            {profile?.basic_information?.phone_number && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    ✓ Parsed
                                </span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Enter 10-digit number, +91 country code will be added automatically</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm z-10 pointer-events-none">
                                +91
                            </div>
                            <Input
                                type="tel"
                                value={getPhoneDisplayValue(profile?.basic_information.phone_number || "")}
                                onChange={e => handlePhoneChange(e.target.value)}
                                placeholder="98765 43210"
                                required
                                className={`h-9 text-sm pl-12 ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`}
                                readOnly={!!profile?.basic_information?.phone_number} // Make read-only if parsed
                            />
                        </div>
                        {phoneError && (
                            <p className="text-xs text-red-600 mt-1">
                                {phoneError}
                            </p>
                        )}
                        {profile?.basic_information?.phone_number && !phoneError && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ We've got this from your resume!
                            </p>
                        )}
                    </div>
                    {/* Location */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            Location
                            <span className="text-red-500">*</span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Your current city helps us show location-relevant roles.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <Input
                            value={profile?.basic_information.current_location || ""}
                            onChange={e => onFieldChange("basic_information", "current_location", e.target.value)}
                            placeholder="City"
                            className="h-9 text-sm"
                            autoComplete="address-level2"
                        />
                    </div>
                    {/* LinkedIn */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Linkedin className="w-4 h-4 text-blue-400" />
                            LinkedIn
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Paste your LinkedIn profile URL</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={profile?.basic_information.linkedin_url || ""}
                                onChange={e => onFieldChange("basic_information", "linkedin_url", e.target.value)}
                                placeholder="LinkedIn profile URL"
                                className="h-9 text-sm flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open("https://www.linkedin.com/in/", "_blank")}
                            >
                                <Linkedin className="w-4 h-4 mr-1" />
                                Check Profile
                            </Button>
                        </div>
                    </div>
                    {/* Relocation */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Globe className="w-4 h-4 text-blue-400" />
                            Open to Relocation
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Optional, adds flexibility to matching</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={profile.basic_information.open_to_relocation}
                                onCheckedChange={(checked) => onFieldChange("basic_information", "open_to_relocation", checked)}
                            />
                            <span className="text-sm text-gray-600">I am open to relocating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 