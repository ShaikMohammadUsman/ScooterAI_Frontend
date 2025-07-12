"use client";
import React from "react";
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
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeProfile } from "@/lib/resumeService";

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

// LinkedIn URL validation function
const isValidLinkedInUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;

    const linkedInPatterns = [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^https?:\/\/(www\.)?linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/company\/[a-zA-Z0-9\-_]+\/?$/,
        /^linkedin\.com\/pub\/[a-zA-Z0-9\-_]+\/?$/
    ];

    return linkedInPatterns.some(pattern => pattern.test(url.trim()));
};

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
}

export default function ContactInformationForm({ profile, onFieldChange }: ContactInformationFormProps) {
    const isContactComplete = !!(profile?.basic_information?.full_name &&
        profile?.basic_information?.email &&
        profile?.basic_information?.phone_number);

    return (
        <div className="flex items-center justify-center py-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-3xl">
                {/* Section Header */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 text-blue-400" />
                            Name
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
                        />
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 text-blue-400" />
                            Email
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
                            onChange={e => onFieldChange("basic_information", "email", e.target.value)}
                            placeholder="Email address"
                            required
                            className="h-9 text-sm"
                        />
                    </div>
                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <Phone className="w-4 h-4 text-blue-400" />
                            Phone
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400 ml-1" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Auto-detect country code, supports SMS follow-up</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <Input
                            type="tel"
                            value={profile?.basic_information.phone_number || ""}
                            onChange={e => {
                                const cleaned = e.target.value.replace(/[^\d+\-\s]/g, "");
                                onFieldChange("basic_information", "phone_number", cleaned);
                            }}
                            placeholder="Phone number"
                            required
                            className="h-9 text-sm"
                        />
                    </div>
                    {/* Location */}
                    <div className="flex flex-col gap-1">
                        <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            Location
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
                        <SingleSelect
                            options={INDIAN_CITIES}
                            selected={profile?.basic_information.current_location || ""}
                            onChange={(value: string) => onFieldChange("basic_information", "current_location", value)}
                            placeholder="City"
                            className="h-9 text-sm"
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
                                disabled={!profile?.basic_information.linkedin_url}
                                onClick={() => window.open(profile?.basic_information.linkedin_url || "", "_blank")}
                            >
                                <Linkedin className="w-4 h-4 mr-1" />
                                View
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