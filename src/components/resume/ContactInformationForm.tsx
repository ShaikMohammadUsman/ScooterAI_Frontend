"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SingleSelect } from "@/components/ui/single-select";
import { InfoIcon, Linkedin } from "lucide-react";
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

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

interface ContactInformationFormProps {
    profile: ResumeProfile;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
}

export default function ContactInformationForm({ profile, onFieldChange }: ContactInformationFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Full Name</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>First + last name as it should appear to hiring teams</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Input
                    value={profile?.basic_information.full_name || ""}
                    onChange={e => onFieldChange("basic_information", "full_name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                />
                <p className="text-sm text-muted-foreground mt-1">
                    We'll display this on your candidate profile for hiring managers.
                </p>
            </FormControl>

            {/* Current Location */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Current Location</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Include detect button using browser geolocation</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-2">
                    <SingleSelect
                        options={INDIAN_CITIES}
                        selected={profile?.basic_information.current_location || ""}
                        onChange={(value: string) => onFieldChange("basic_information", "current_location", value)}
                        placeholder="Search for your city..."
                        className="flex-1 bg-white"
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Your current city helps us show location-relevant roles.
                </p>
            </FormControl>

            {/* Relocation Preference */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Open to Relocation</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Optional, adds flexibility to matching</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={profile.basic_information.open_to_relocation}
                        onCheckedChange={(checked) => onFieldChange("basic_information", "open_to_relocation", checked)}
                    />
                    <Label>I am open to relocating</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Helps us match you with companies open to remote or relocation.
                </p>
            </FormControl>

            {/* Phone Number */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Phone Number</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Auto-detect country code, supports SMS follow-up</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-2">
                    <Input
                        type="tel"
                        value={profile?.basic_information.phone_number || ""}
                        onChange={e => {
                            const cleaned = e.target.value.replace(/[^\d+\-\s]/g, "");
                            onFieldChange("basic_information", "phone_number", cleaned);
                        }}
                        placeholder="+1 (555) 555-5555"
                        required
                        className="flex-1"
                    />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    For time-sensitive follow-ups, including interview scheduling.
                </p>
            </FormControl>

            {/* LinkedIn URL */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Avoids duplication if already captured</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-2 flex-col lg:flex-row">
                    <Input
                        value={profile?.basic_information.linkedin_url || ""}
                        onChange={e => onFieldChange("basic_information", "linkedin_url", e.target.value)}
                        placeholder="https://linkedin.com/in/your-profile"
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!profile?.basic_information.linkedin_url || profile.basic_information.linkedin_url.length === 0 || !isValidLinkedInUrl(profile.basic_information.linkedin_url)}
                                    onClick={() => window.open(profile?.basic_information.linkedin_url || "", "_blank")}
                                >
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    See Profile
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {!profile?.basic_information.linkedin_url || profile.basic_information.linkedin_url.length === 0
                                        ? "Enter a LinkedIn profile URL"
                                        : !isValidLinkedInUrl(profile.basic_information.linkedin_url)
                                            ? "Enter a valid LinkedIn profile URL"
                                            : "Open LinkedIn profile"
                                    }
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Used to match and enrich your resume data — optional.
                </p>
            </FormControl>

            {/* Email Address */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Email Address</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Used for login + interview coordination</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Input
                    type="email"
                    value={profile?.basic_information.email || ""}
                    onChange={e => onFieldChange("basic_information", "email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                />
                <p className="text-sm text-muted-foreground mt-1">
                    We'll use this to send interview updates and feedback.
                </p>
            </FormControl>

            {/* Notice Period */}
            <FormControl>
                <div className="flex items-center gap-2">
                    <FormLabel>Notice Period</FormLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Used for hiring availability and scheduling fit</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Select
                    value={profile?.basic_information.notice_period || ""}
                    onValueChange={(value) => onFieldChange("basic_information", "notice_period", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                    </SelectTrigger>
                    <SelectContent>
                        {NOTICE_PERIOD_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                    How much notice do you need to give your current employer?
                </p>
            </FormControl>
        </div>
    );
} 