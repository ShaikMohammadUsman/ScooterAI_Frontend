"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { parseResume, addResumeProfile, ParseResumeResponse, ResumeProfile } from "@/lib/resumeService";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineEditNote } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    SALES_TYPES,
    SALES_MOTIONS,
    INDUSTRIES,
    REGIONS,
    BUYER_PERSONAS,
    CRM_OPTIONS,
    SALES_TOOLS,
    COMMUNICATION_TOOLS,
    SALES_ROLE_TYPES,
    POSITION_LEVELS,
    SALES_STAGES,
    DEAL_SIZE_RANGES,
    SALES_CYCLE_LENGTHS,
    QUOTA_CADENCE,
    YES_NO_OPTIONS
} from "@/lib/formConstants";
import { ParsingMessage } from "@/components/ui/parsing-message";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, MapPin, Linkedin, X, CheckCircle, Clock, Headphones, RotateCcw, Mic } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface CompanyHistory {
    company_name: string;
    position: string;
    start_date: string;
    end_date: string;
    duration_months: number;
    is_current: boolean;
}

const defaultProfile: ResumeProfile = {
    basic_information: {
        full_name: "",
        current_location: "",
        open_to_relocation: false,
        phone_number: "",
        linkedin_url: "",
        email: "",
        specific_phone_number: "",
        notice_period: "",
        current_ctc: { currencyType: "", value: 0 },
        expected_ctc: { currencyType: "", value: 0 },
    },
    career_overview: {
        total_years_experience: 0,
        years_sales_experience: 0,
        average_tenure_per_role: 0,
        employment_gaps: { has_gaps: false, duration: "" },
        promotion_history: false,
        company_history: [],
    },
    sales_context: {
        sales_type: [],
        sales_motion: [],
        industries_sold_into: [],
        regions_sold_into: [],
        buyer_personas: [],
    },
    role_process_exposure: {
        sales_role_type: "",
        position_level: "",
        sales_stages_owned: [],
        average_deal_size_range: "",
        sales_cycle_length: "",
        monthly_deal_volume: 0,
        quota_ownership: {
            has_quota: false,
            amount: 0,
            cadence: "",
            attainment_history: "",
        },
    },
    tools_platforms: {
        crm_used: [],
        sales_tools: [],
        communication_tools: [],
    },
};

// Simple form components
const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`block text-sm font-medium mb-1 ${className}`}>{children}</label>
);

const FormControl = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-1">{children}</div>
);

const FormMessage = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-destructive ${className}`}>{children}</p>
);

// Add this near other constants
const NOTICE_PERIOD_OPTIONS = [
    "Immediate",
    "15 days",
    "30 days",
    "60 days",
    "90 days"
];

export default function ResumePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [file, setFile] = useState<File | null>(null);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [consentToUpdates, setConsentToUpdates] = useState<boolean>(false);

    // Handle file upload and parse
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setFile(e.target.files[0]);
        setProfile(null);
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const parsed: ParseResumeResponse = await parseResume(e.target.files[0]);
            console.log('Raw parsed data:', parsed);

            // Transform the data to match our expected structure
            const transformedProfile: ResumeProfile = {
                basic_information: {
                    full_name: parsed.basic_information.full_name || "",
                    current_location: parsed.basic_information.current_location || "",
                    open_to_relocation: parsed.basic_information.open_to_relocation || false,
                    phone_number: parsed.basic_information.phone_number || "",
                    linkedin_url: parsed.basic_information.linkedin_url || "",
                    email: parsed.basic_information.email || "",
                    specific_phone_number: parsed.basic_information.specific_phone_number || "",
                    notice_period: parsed.basic_information.notice_period || "",
                    current_ctc: parsed.basic_information.current_ctc || { currencyType: "", value: 0 },
                    expected_ctc: parsed.basic_information.expected_ctc || { currencyType: "", value: 0 },
                },
                career_overview: {
                    total_years_experience: parsed.career_overview.total_years_experience || 0,
                    years_sales_experience: parsed.career_overview.years_sales_experience || 0,
                    average_tenure_per_role: parsed.career_overview.average_tenure_per_role || 0,
                    employment_gaps: {
                        has_gaps: parsed.career_overview.employment_gaps?.has_gaps || false,
                        duration: parsed.career_overview.employment_gaps?.duration || "",
                    },
                    promotion_history: parsed.career_overview.promotion_history || false,
                    company_history: parsed.career_overview.company_history || [],
                },
                sales_context: {
                    sales_type: parsed.sales_context.sales_type ? [parsed.sales_context.sales_type] : [],
                    sales_motion: parsed.sales_context.sales_motion ? [parsed.sales_context.sales_motion] : [],
                    industries_sold_into: parsed.sales_context.industries_sold_into || [],
                    regions_sold_into: parsed.sales_context.regions_sold_into || [],
                    buyer_personas: parsed.sales_context.buyer_personas || [],
                },
                role_process_exposure: {
                    sales_role_type: parsed.role_process_exposure.sales_role_type || "",
                    position_level: parsed.role_process_exposure.position_level || "",
                    sales_stages_owned: parsed.role_process_exposure.sales_stages_owned || [],
                    average_deal_size_range: parsed.role_process_exposure.average_deal_size || "",
                    sales_cycle_length: parsed.role_process_exposure.sales_cycle_length || "",
                    monthly_deal_volume: 0, // Initialize as 0 since it's missing
                    quota_ownership: {
                        has_quota: parsed.role_process_exposure.own_quota || false,
                        amount: 0,
                        cadence: "",
                        attainment_history: parsed.role_process_exposure.quota_attainment || "",
                    },
                },
                tools_platforms: {
                    crm_used: parsed.tools_platforms.crm_tools || [],
                    sales_tools: parsed.tools_platforms.sales_tools || [],
                    communication_tools: [], // Initialize as empty array since it's missing
                },
            };

            console.log('Transformed profile:', transformedProfile);
            setProfile(transformedProfile);
            toast({ title: "Resume parsed!", description: "Edit and submit your profile." });
        } catch (err: any) {
            setError(err.message || "Failed to parse resume");
            toast({ title: "Error", description: err.message || "Failed to parse resume", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Handle form field change
    const handleFieldChange = (section: string, key: string, value: any, subkey?: string) => {
        if (!profile) return;
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            if (subkey) {
                // e.g. employment_gaps.has_gaps
                (updated as any)[section][key][subkey] = value;
            } else {
                (updated as any)[section][key] = value;
            }
            return { ...updated };
        });
    };

    // Handle array field change
    const handleArrayChange = (section: string, key: string, arr: string[]) => {
        if (!profile) return;
        // console.log('handleArrayChange called with:', { section, key, arr });
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            (updated as any)[section][key] = arr;
            // console.log('Updated profile:', updated);
            return { ...updated };
        });
    };

    // Handle company history change
    const handleCompanyHistoryChange = (index: number, field: keyof CompanyHistory, value: any) => {
        if (!profile) return;
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            const companyHistory = [...updated.career_overview.company_history];
            companyHistory[index] = { ...companyHistory[index], [field]: value };
            updated.career_overview.company_history = companyHistory;
            return updated;
        });
    };

    // Add a new company history entry
    const addCompanyHistory = () => {
        if (!profile) return;
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            const newHistory = [...(updated.career_overview.company_history || [])];
            newHistory.push({
                company_name: "",
                position: "",
                start_date: "",
                end_date: "",
                duration_months: 0,
                is_current: false,
            });
            updated.career_overview = {
                ...updated.career_overview,
                company_history: newHistory
            };
            return updated;
        });
    };

    // Remove a company history entry
    const removeCompanyHistory = (indexToRemove: number) => {
        if (!profile) return;
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            const newHistory = updated.career_overview.company_history.filter((_, index) => index !== indexToRemove);
            updated.career_overview = {
                ...updated.career_overview,
                company_history: newHistory
            };
            return updated;
        });
    };

    // Handle start interview button click
    const handleStartInterview = () => {
        router.push(`/interview/general?role=${searchParams.get('role')}`);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            // Transform the data to match the backend's expected format
            const transformedProfile = {
                ...profile,
                sales_context: {
                    ...profile.sales_context,
                    // Convert arrays to single strings for sales_type and sales_motion
                    sales_type: profile.sales_context.sales_type[0] || "",
                    sales_motion: profile.sales_context.sales_motion[0] || "",
                },
                role_process_exposure: {
                    ...profile.role_process_exposure,
                    // Add required fields for backend
                    average_deal_size: profile.role_process_exposure.average_deal_size_range || "",
                    own_quota: profile.role_process_exposure.quota_ownership?.has_quota || false,
                    quota_attainment: profile.role_process_exposure.quota_ownership?.attainment_history || "",
                    // Convert quota_ownership to array of strings
                    quota_ownership: profile.role_process_exposure.quota_ownership?.has_quota ? [
                        `Has Quota: ${profile.role_process_exposure.quota_ownership.has_quota}`,
                        `Amount: ${profile.role_process_exposure.quota_ownership.amount}`,
                        `Cadence: ${profile.role_process_exposure.quota_ownership.cadence}`,
                        `Attainment: ${profile.role_process_exposure.quota_ownership.attainment_history}`
                    ].filter(str => str.split(': ')[1]) : [], // Only include non-empty values
                },
                tools_platforms: {
                    ...profile.tools_platforms,
                    crm_tools: profile.tools_platforms.crm_used || [],
                }
            };

            // Remove undefined fields and fields not expected by backend
            const cleanedProfile = JSON.parse(JSON.stringify(transformedProfile));
            delete cleanedProfile.role_process_exposure.monthly_deal_volume;
            delete cleanedProfile.role_process_exposure.average_deal_size_range;
            delete cleanedProfile.tools_platforms.communication_tools;
            delete cleanedProfile.tools_platforms.crm_used;

            const res = await addResumeProfile(cleanedProfile, searchParams.get('job_id') || "");
            console.log(res);
            localStorage.setItem('profile_id', res.profile_id);
            setSuccess("Profile saved! ID: " + res.profile_id);
            toast({ title: "Profile saved!", description: `ID: ${res.profile_id}` });
            setShowSuccessScreen(true);
        } catch (err: any) {
            setError(err.message || "Failed to save profile");
            toast({ title: "Error", description: err.message || "Failed to save profile", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="container mx-auto py-8 px-4">
                {/* Success Screen */}
                {showSuccessScreen ? (
                    <div className="text-center py-12">
                        <div className="max-w-2xl mx-auto">
                            {/* Success Icon */}
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    Congrats! You've made it to the next step
                                </h1>
                            </div>

                            {/* Main Content */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                    Your profile looks strong!
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    Now you have to answer 2–3 short questions in your own voice so hiring teams can hear how you think, speak, and sell.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    This helps you stand out early and get a response quicker.
                                </p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-50">
                                        <Clock className="w-6 h-6 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium text-blue-700">Takes 3-5 minutes</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50">
                                        <Headphones className="w-6 h-6 text-purple-600 mb-2" />
                                        <span className="text-sm font-medium text-purple-700">Headphones recommended</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-orange-50">
                                        <RotateCcw className="w-6 h-6 text-orange-600 mb-2" />
                                        <span className="text-sm font-medium text-orange-700">You can re-record</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-50">
                                        <Mic className="w-6 h-6 text-green-600 mb-2" />
                                        <span className="text-sm font-medium text-green-700">No video required, only voice</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Button
                                onClick={handleStartInterview}
                                className="h-14 px-12 text-xl font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                Start Now
                            </Button>
                        </div>
                    </div>
                ) : (


                    <Card className="w-full lg:w-2/3 mx-auto shadow-lg border-0 rounded-3xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="flex flex-col items-center gap-3  bg-white/80 px-8 py-6 rounded-3xl">
                            <FiUploadCloud className="text-primary w-8 h-8" />
                            <CardTitle className="text-4xl font-bold text-primary mb-2 text-center">
                                {/* Onboarding Header and Subcopy */}
                                Let's get you set up
                            </CardTitle>
                            <CardDescription>This won't take long. Less than 10 mins to capture your sales superpowers.</CardDescription>

                        </CardHeader>
                        <CardContent className="p-8">

                            {/* LinkedIn URL Input (optional) */}
                            <div className="mb-6 w-full max-w-md mx-auto">
                                <FormControl>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>LinkedIn profile (optional)</FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Used to match and enrich your resume data — optional.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Input
                                        value={profile?.basic_information.linkedin_url || ""}
                                        onChange={e => handleFieldChange("basic_information", "linkedin_url", e.target.value)}
                                        placeholder="https://linkedin.com/in/your-profile"
                                        className="flex-1"
                                    />
                                </FormControl>
                            </div>

                            {/* Consent Checkbox */}
                            <div className="mb-8 w-full max-w-md mx-auto flex items-start gap-2">
                                <input
                                    id="consent-checkbox"
                                    type="checkbox"
                                    required={!!profile?.basic_information.phone_number}
                                    className="mt-1"
                                    onChange={() => {
                                        setConsentToUpdates(!consentToUpdates);
                                    }}
                                // value={consentToUpdates.toString()}
                                />
                                <label htmlFor="consent-checkbox" className="text-sm text-gray-700">
                                    I consent to receive updates about my application via SMS/Whatsapp/email
                                    <span className="block text-xs text-muted-foreground mt-1">This lets us update you via email or SMS on interview status.</span>
                                </label>
                            </div>

                            {/* Resume Upload Section */}
                            <div className="mb-8 flex flex-col items-center gap-4">
                                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                    <div className="flex items-center gap-2 w-full">
                                        <label
                                            htmlFor="upload-resume"
                                            className={`cursor-pointer w-full ${!consentToUpdates ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <Button
                                                variant="outline"
                                                type="button"
                                                disabled={loading || submitting || !consentToUpdates}
                                                onClick={() => {
                                                    if (consentToUpdates && !loading && !submitting) {
                                                        document.getElementById('upload-resume')?.click();
                                                    }
                                                }}
                                                className="h-12 px-6 text-lg w-full hover:bg-primary hover:text-white transition-colors"
                                            >
                                                <FiUploadCloud className="mr-2 w-5 h-5" />
                                                Upload your resume
                                            </Button>
                                        </label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="ml-2">
                                                        <InfoIcon className="h-5 w-5 text-muted-foreground" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>We'll extract your experience and roles to save you typing.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <input
                                        id="upload-resume"
                                        name="upload-resume"
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={loading || submitting || !consentToUpdates}
                                        aria-label="Select resume PDF file"
                                    />
                                    {file && <span className="text-muted-foreground text-sm">{file.name}</span>}
                                </div>
                                {loading && (
                                    <>
                                        <ParsingMessage />
                                        <LoadingSpinner />
                                    </>
                                )}
                            </div>

                            {/* Error State */}
                            {error && <ErrorBox message={error} />}

                            {/* Editable Form */}
                            {profile && !loading && (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <Accordion type="multiple" className="mb-4">
                                        {/* Contact Information */}
                                        <AccordionItem value="contact_info" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">Confirm your contact information</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
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
                                                            value={profile.basic_information.full_name}
                                                            onChange={e => handleFieldChange("basic_information", "full_name", e.target.value)}
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
                                                            <Combobox
                                                                value={profile.basic_information.current_location}
                                                                onChange={(value: string) => handleFieldChange("basic_information", "current_location", value)}
                                                                placeholder="Search for your city..."
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    if (navigator.geolocation) {
                                                                        navigator.geolocation.getCurrentPosition(
                                                                            async (position) => {
                                                                                try {
                                                                                    const response = await fetch(
                                                                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                                                                                    );
                                                                                    const data = await response.json();
                                                                                    const city = data.address.city || data.address.town || data.address.village;
                                                                                    if (city) {
                                                                                        handleFieldChange("basic_information", "current_location", city);
                                                                                    }
                                                                                } catch (error) {
                                                                                    console.error("Error getting location:", error);
                                                                                    toast({
                                                                                        title: "Error",
                                                                                        description: "Could not detect location. Please enter manually.",
                                                                                        variant: "destructive"
                                                                                    });
                                                                                }
                                                                            },
                                                                            (error) => {
                                                                                console.error("Error getting location:", error);
                                                                                toast({
                                                                                    title: "Error",
                                                                                    description: "Could not detect location. Please enter manually.",
                                                                                    variant: "destructive"
                                                                                });
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <MapPin className="h-4 w-4" />
                                                            </Button>
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
                                                                onCheckedChange={(checked) => handleFieldChange("basic_information", "open_to_relocation", checked)}
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
                                                                value={profile.basic_information.phone_number}
                                                                onChange={e => handleFieldChange("basic_information", "phone_number", e.target.value)}
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
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={profile.basic_information.linkedin_url}
                                                                onChange={e => handleFieldChange("basic_information", "linkedin_url", e.target.value)}
                                                                placeholder="https://linkedin.com/in/your-profile"
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => window.open("https://linkedin.com/in/", "_blank")}
                                                            >
                                                                <Linkedin className="h-4 w-4 mr-2" />
                                                                Find URL
                                                            </Button>
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
                                                            value={profile.basic_information.email}
                                                            onChange={e => handleFieldChange("basic_information", "email", e.target.value)}
                                                            placeholder="your.email@example.com"
                                                            required
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            We'll use this to send interview updates and feedback.
                                                        </p>
                                                    </FormControl>

                                                    {/* Specific Phone Number */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Specific Phone Number</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>With country code auto-detect; used for time-sensitive outreach</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <Input
                                                            type="tel"
                                                            value={profile.basic_information.specific_phone_number}
                                                            onChange={e => handleFieldChange("basic_information", "specific_phone_number", e.target.value)}
                                                            placeholder="+1 (555) 555-5555"
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            For urgent updates — we won't spam.
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
                                                            value={profile.basic_information.notice_period}
                                                            onValueChange={(value) => handleFieldChange("basic_information", "notice_period", value)}
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
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Salary Expectations */}
                                        <AccordionItem value="salary_expectations" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">What are your salary expectations?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Current CTC */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Current CTC (Base Salary)</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Your fixed monthly or annual base. We only show jobs that offer more.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Select
                                                                value={profile.basic_information.current_ctc.currencyType}
                                                                onValueChange={(value) => handleFieldChange("basic_information", "current_ctc", { ...profile.basic_information.current_ctc, currencyType: value })}
                                                            >
                                                                <SelectTrigger className="w-[100px]">
                                                                    <SelectValue placeholder="₹" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="INR">₹ (INR)</SelectItem>
                                                                    <SelectItem value="USD">$ (USD)</SelectItem>
                                                                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                                                                    <SelectItem value="GBP">£ (GBP)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="number"
                                                                value={profile.basic_information.current_ctc.value || ""}
                                                                onChange={e => handleFieldChange("basic_information", "current_ctc", { ...profile.basic_information.current_ctc, value: Number(e.target.value) })}
                                                                placeholder="Enter amount"
                                                                className="flex-1"
                                                            />
                                                            <Select
                                                                value={profile.basic_information.current_ctc.cadence || "annual"}
                                                                onValueChange={(value) => handleFieldChange("basic_information", "current_ctc", { ...profile.basic_information.current_ctc, cadence: value })}
                                                            >
                                                                <SelectTrigger className="w-[120px]">
                                                                    <SelectValue placeholder="Annual" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="annual">Annual</SelectItem>
                                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Optional - Helps us match you with better-paying opportunities.
                                                        </p>
                                                    </FormControl>

                                                    {/* Expected CTC (OTE) */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Expected CTC (OTE)</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Add your expected total compensation including incentives.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Select
                                                                value={profile.basic_information.expected_ctc.currencyType}
                                                                onValueChange={(value) => handleFieldChange("basic_information", "expected_ctc", { ...profile.basic_information.expected_ctc, currencyType: value })}
                                                            >
                                                                <SelectTrigger className="w-[100px]">
                                                                    <SelectValue placeholder="₹" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="INR">₹ (INR)</SelectItem>
                                                                    <SelectItem value="USD">$ (USD)</SelectItem>
                                                                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                                                                    <SelectItem value="GBP">£ (GBP)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                type="number"
                                                                value={profile.basic_information.expected_ctc.value || ""}
                                                                onChange={e => handleFieldChange("basic_information", "expected_ctc", { ...profile.basic_information.expected_ctc, value: Number(e.target.value) })}
                                                                placeholder="Enter amount"
                                                                className="flex-1"
                                                            />
                                                            <Select
                                                                value={profile.basic_information.expected_ctc.cadence || "annual"}
                                                                onValueChange={(value) => handleFieldChange("basic_information", "expected_ctc", { ...profile.basic_information.expected_ctc, cadence: value })}
                                                            >
                                                                <SelectTrigger className="w-[120px]">
                                                                    <SelectValue placeholder="Annual" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="annual">Annual</SelectItem>
                                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Optional - Your expected total compensation including incentives.
                                                        </p>
                                                    </FormControl>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        {/* Career Overview */}
                                        {/* <AccordionItem value="career_overview" className="border rounded-lg mb-4">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                <span className="text-xl font-semibold">Career Overview</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormControl>
                                                    <FormLabel>Total Years Experience</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.career_overview.total_years_experience}
                                                        onChange={e => handleFieldChange("career_overview", "total_years_experience", Number(e.target.value))}
                                                        min={0}
                                                        step={0.1}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Years Sales Experience</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.career_overview.years_sales_experience}
                                                        onChange={e => handleFieldChange("career_overview", "years_sales_experience", Number(e.target.value))}
                                                        min={0}
                                                        step={0.1}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Average Tenure Per Role</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.career_overview.average_tenure_per_role}
                                                        onChange={e => handleFieldChange("career_overview", "average_tenure_per_role", Number(e.target.value))}
                                                        min={0}
                                                        step={0.1}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Employment Gaps</FormLabel>
                                                    <RadioGroup
                                                        value={profile.career_overview.employment_gaps.has_gaps ? "Yes" : "No"}
                                                        onValueChange={(value) => handleFieldChange("career_overview", "employment_gaps", value === "Yes", "has_gaps")}
                                                        className="flex gap-4"
                                                    >
                                                        {YES_NO_OPTIONS.map((option) => (
                                                            <div key={option} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`gaps-${option}`} />
                                                                <label htmlFor={`gaps-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                    {profile.career_overview.employment_gaps.has_gaps && (
                                                        <Input
                                                            placeholder="Duration"
                                                            value={profile.career_overview.employment_gaps.duration}
                                                            onChange={e => handleFieldChange("career_overview", "employment_gaps", e.target.value, "duration")}
                                                            className="mt-2"
                                                        />
                                                    )}
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Promotion History</FormLabel>
                                                    <RadioGroup
                                                        value={profile.career_overview.promotion_history ? "Yes" : "No"}
                                                        onValueChange={(value) => handleFieldChange("career_overview", "promotion_history", value === "Yes")}
                                                        className="flex gap-4"
                                                    >
                                                        {YES_NO_OPTIONS.map((option) => (
                                                            <div key={option} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`promotion-${option}`} />
                                                                <label htmlFor={`promotion-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormControl >
                                                    <FormLabel>Company History</FormLabel>
                                                    <div className="space-y-4">
                                                        {profile?.career_overview?.company_history?.map((company, index) => (
                                                            <Card key={index} className="p-4">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="font-medium">Company {index + 1}</h4>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeCompanyHistory(index)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormControl>
                                                                        <FormLabel>Company Name</FormLabel>
                                                                        <Input
                                                                            value={company.company_name}
                                                                            onChange={e => handleCompanyHistoryChange(index, "company_name", e.target.value)}
                                                                            required
                                                                        />
                                                                    </FormControl>
                                                                    <FormControl>
                                                                        <FormLabel>Position</FormLabel>
                                                                        <Input
                                                                            value={company.position}
                                                                            onChange={e => handleCompanyHistoryChange(index, "position", e.target.value)}
                                                                            required
                                                                        />
                                                                    </FormControl>
                                                                    <FormControl>
                                                                        <FormLabel>Start Date</FormLabel>
                                                                        <Input
                                                                            type="date"
                                                                            value={company.start_date}
                                                                            onChange={e => handleCompanyHistoryChange(index, "start_date", e.target.value)}
                                                                            required
                                                                        />
                                                                    </FormControl>
                                                                    <FormControl>
                                                                        <FormLabel>End Date</FormLabel>
                                                                        <Input
                                                                            type="date"
                                                                            value={company.end_date}
                                                                            onChange={e => handleCompanyHistoryChange(index, "end_date", e.target.value)}
                                                                            disabled={company.is_current}
                                                                            required={!company.is_current}
                                                                        />
                                                                    </FormControl>
                                                                    <FormControl>
                                                                        <FormLabel>Duration (months)</FormLabel>
                                                                        <Input
                                                                            type="number"
                                                                            value={company.duration_months}
                                                                            onChange={e => handleCompanyHistoryChange(index, "duration_months", Number(e.target.value))}
                                                                            min={0}
                                                                            required
                                                                        />
                                                                    </FormControl>
                                                                    <FormControl>
                                                                        <FormLabel>Current Position</FormLabel>
                                                                        <Switch
                                                                            checked={company.is_current}
                                                                            onCheckedChange={v => handleCompanyHistoryChange(index, "is_current", v)}
                                                                        />
                                                                    </FormControl>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={addCompanyHistory}
                                                            className="w-full"
                                                        >
                                                            Add Company
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem> */}

                                        {/* Work History */}
                                        <AccordionItem value="work_history" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">Does your work history look right?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <div className="space-y-6">
                                                    <p className="text-muted-foreground">
                                                        We parsed this from your resume — feel free to tweak or add details.
                                                    </p>

                                                    {profile?.career_overview?.company_history?.length > 0 ? (
                                                        <>
                                                            <div className="grid gap-4">
                                                                {profile.career_overview.company_history.map((company, index) => (
                                                                    <Card key={`company-${index}`} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                                                                        <div className="absolute top-0 right-0 p-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeCompanyHistory(index)}
                                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <CardContent className="p-6">
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                {/* Company Name */}
                                                                                <FormControl>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <FormLabel>Company</FormLabel>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <p>Your employer's name as it should appear</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <Input
                                                                                        value={company.company_name}
                                                                                        onChange={e => handleCompanyHistoryChange(index, "company_name", e.target.value)}
                                                                                        placeholder="Enter company name"
                                                                                        required
                                                                                        className="font-medium"
                                                                                    />
                                                                                </FormControl>

                                                                                {/* Position */}
                                                                                <FormControl>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <FormLabel>Position</FormLabel>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <p>Your job title or role</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>
                                                                                    </div>
                                                                                    <Input
                                                                                        value={company.position}
                                                                                        onChange={e => handleCompanyHistoryChange(index, "position", e.target.value)}
                                                                                        placeholder="Enter your position"
                                                                                        required
                                                                                        className="font-medium"
                                                                                    />
                                                                                </FormControl>

                                                                                {/* Duration */}
                                                                                <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                                    <FormControl>
                                                                                        <FormLabel>Start Date</FormLabel>
                                                                                        <Input
                                                                                            type="date"
                                                                                            value={company.start_date}
                                                                                            onChange={e => handleCompanyHistoryChange(index, "start_date", e.target.value)}
                                                                                            required
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormControl>
                                                                                        <FormLabel>End Date</FormLabel>
                                                                                        <Input
                                                                                            type="date"
                                                                                            value={company.end_date}
                                                                                            onChange={e => handleCompanyHistoryChange(index, "end_date", e.target.value)}
                                                                                            disabled={company.is_current}
                                                                                            required={!company.is_current}
                                                                                        />
                                                                                    </FormControl>
                                                                                    <FormControl>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <FormLabel>Duration</FormLabel>
                                                                                            <TooltipProvider>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger>
                                                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        <p>Total months in this role</p>
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
                                                                                        </div>
                                                                                        <Input
                                                                                            type="number"
                                                                                            value={company.duration_months}
                                                                                            onChange={e => handleCompanyHistoryChange(index, "duration_months", Number(e.target.value))}
                                                                                            min={0}
                                                                                            required
                                                                                            placeholder="Months"
                                                                                        />
                                                                                    </FormControl>
                                                                                </div>

                                                                                {/* Current Position */}
                                                                                <div className="col-span-2">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <Switch
                                                                                            checked={company.is_current}
                                                                                            onCheckedChange={v => handleCompanyHistoryChange(index, "is_current", v)}
                                                                                            id={`current-${index}`}
                                                                                        />
                                                                                        <Label htmlFor={`current-${index}`} className="text-sm font-medium">
                                                                                            This is my current position
                                                                                        </Label>
                                                                                    </div>
                                                                                    {company.is_current && (
                                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                                            End date will be automatically set to "Present"
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>

                                                            <div className="flex justify-end">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={addCompanyHistory}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <MdOutlineEditNote className="w-4 h-4" />
                                                                    Add Experience
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                            <p className="text-muted-foreground mb-4">No work history found in your resume</p>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={addCompanyHistory}
                                                                className="flex items-center gap-2 mx-auto"
                                                            >
                                                                <MdOutlineEditNote className="w-4 h-4" />
                                                                Add Your First Experience
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Sales Context */}
                                        <AccordionItem value="sales_context" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">What kind of sales do you do?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Sales Type */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Sales Type</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Do you primarily sell to businesses (B2B), consumers (B2C), or both?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <RadioGroup
                                                            value={profile.sales_context.sales_type[0] || ""}
                                                            onValueChange={(value) => handleArrayChange("sales_context", "sales_type", [value])}
                                                            className="flex flex-col gap-3"
                                                        >
                                                            {["B2B", "B2C", "Both"].map((type) => (
                                                                <div key={type} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={type} id={`sales-type-${type}`} />
                                                                    <Label htmlFor={`sales-type-${type}`} className="text-sm font-medium">
                                                                        {type}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {/* Sales Motion */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Sales Motion</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Inbound means leads come to you; outbound means you reach out first.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <RadioGroup
                                                            value={profile.sales_context.sales_motion[0] || ""}
                                                            onValueChange={(value) => handleArrayChange("sales_context", "sales_motion", [value])}
                                                            className="flex flex-col gap-3"
                                                        >
                                                            {["Inbound", "Outbound", "Mixed"].map((motion) => (
                                                                <div key={motion} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={motion} id={`sales-motion-${motion}`} />
                                                                    <Label htmlFor={`sales-motion-${motion}`} className="text-sm font-medium">
                                                                        {motion}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {/* Industries Sold Into */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Industries You've Sold Into</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>E.g. SaaS, EdTech, BFSI — helps understand your domain experience.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={INDUSTRIES}
                                                            selected={profile.sales_context.industries_sold_into}
                                                            onChange={(values) => handleArrayChange("sales_context", "industries_sold_into", values)}
                                                            placeholder="Select industries..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Select from common industries
                                                        </p>
                                                    </FormControl>

                                                    {/* Regions Sold Into */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Regions You've Sold Into</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>What countries or geographies have your customers typically been in?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={REGIONS}
                                                            selected={profile.sales_context.regions_sold_into}
                                                            onChange={(values) => handleArrayChange("sales_context", "regions_sold_into", values)}
                                                            placeholder="Select regions..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Select all regions where you have sales experience
                                                        </p>
                                                    </FormControl>

                                                    {/* Buyer Personas */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Who Were Your Buyers?</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Who did you typically sell to? Job titles or decision-maker roles.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={BUYER_PERSONAS}
                                                            selected={profile.sales_context.buyer_personas}
                                                            onChange={(values) => handleArrayChange("sales_context", "buyer_personas", values)}
                                                            placeholder="Select buyer personas..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            E.g. HR Heads, CXOs, Procurement — select from common roles
                                                        </p>
                                                    </FormControl>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Role Process Exposure */}
                                        <AccordionItem value="role_process_exposure" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">What have you owned in the sales process?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Sales Process Owned */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Sales Process Owned</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Select all you've owned directly.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={[
                                                                "Prospecting",
                                                                "Lead Research",
                                                                "Outreach",
                                                                "Emailing",
                                                                "Qualification",
                                                                "Demoing",
                                                                "Proposal Creation",
                                                                "Objection Handling",
                                                                "Closing",
                                                                "Negotiation",
                                                                "Post-Sale",
                                                                "Renewals",
                                                                "Expansion"
                                                            ]}
                                                            selected={profile.role_process_exposure.sales_stages_owned}
                                                            onChange={(values) => handleArrayChange("role_process_exposure", "sales_stages_owned", values)}
                                                            placeholder="Select all stages you've owned..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Check all the stages you personally handled — from prospecting to post-sale.
                                                        </p>
                                                    </FormControl>

                                                    {/* Sales Role */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Most Recent Sales Role</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>E.g. SDR, Account Executive, Enterprise Sales — pick what best matches your role title.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <Select
                                                            value={profile.role_process_exposure.sales_role_type}
                                                            onValueChange={(value) => handleFieldChange("role_process_exposure", "sales_role_type", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select your role..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[
                                                                    "SDR",
                                                                    "BDR",
                                                                    "Inside Sales",
                                                                    "AE",
                                                                    "Key Account Manager",
                                                                    "Enterprise Sales",
                                                                    "Channel Manager",
                                                                    "Sales Manager",
                                                                    "CSM",
                                                                    "Pre-sales",
                                                                    "Growth Manager",
                                                                    "Head of Sales",
                                                                    "VP",
                                                                    "Other"
                                                                ].map((role) => (
                                                                    <SelectItem key={role} value={role}>
                                                                        {role}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>

                                                    {/* Position Level */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Position Level</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Were you primarily an IC or did you manage others?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <RadioGroup
                                                            value={profile.role_process_exposure.position_level}
                                                            onValueChange={(value) => handleFieldChange("role_process_exposure", "position_level", value)}
                                                            className="flex flex-col gap-3"
                                                        >
                                                            {[
                                                                "Individual Contributor",
                                                                "Team Lead",
                                                                "Manager",
                                                                "Director / VP+"
                                                            ].map((level) => (
                                                                <div key={level} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={level} id={`position-level-${level}`} />
                                                                    <Label htmlFor={`position-level-${level}`} className="text-sm font-medium">
                                                                        {level}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {/* Average Deal Size */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Average Deal Size</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>What was your average closed deal value in your most recent or current role?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <Select
                                                            value={profile.role_process_exposure.average_deal_size_range}
                                                            onValueChange={(value) => handleFieldChange("role_process_exposure", "average_deal_size_range", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select deal size range..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[
                                                                    "<$1K",
                                                                    "$1K–$5K",
                                                                    "$5K–$25K",
                                                                    "$25K–$100K",
                                                                    "$100K–$500K",
                                                                    "$500K–$1M",
                                                                    "$1M+",
                                                                    "Varies"
                                                                ].map((size) => (
                                                                    <SelectItem key={size} value={size}>
                                                                        {size}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Support ranges or best estimate
                                                        </p>
                                                    </FormControl>

                                                    {/* Sales Cycle Length */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Typical Sales Cycle Length</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>How long does it usually take to close a deal?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <Select
                                                            value={profile.role_process_exposure.sales_cycle_length}
                                                            onValueChange={(value) => handleFieldChange("role_process_exposure", "sales_cycle_length", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select cycle length..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[
                                                                    "<1 week",
                                                                    "1–4 weeks",
                                                                    "1–3 months",
                                                                    "3–6 months",
                                                                    "6–12 months",
                                                                    "12+ months",
                                                                    "Varies"
                                                                ].map((length) => (
                                                                    <SelectItem key={length} value={length}>
                                                                        {length}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>

                                                    {/* Quota Ownership */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Did You Own a Quota?</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Were you responsible for hitting a sales number?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <RadioGroup
                                                            value={profile.role_process_exposure.quota_ownership.has_quota ? "Yes" : "No"}
                                                            onValueChange={(value) => handleFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, has_quota: value === "Yes" })}
                                                            className="flex gap-4"
                                                        >
                                                            {["Yes", "No"].map((option) => (
                                                                <div key={option} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={option} id={`quota-${option}`} />
                                                                    <Label htmlFor={`quota-${option}`}>{option}</Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {/* Quota Measurement (Conditional) */}
                                                    {profile.role_process_exposure.quota_ownership.has_quota && (
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <FormLabel>Quota Measurement</FormLabel>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>What metrics were you measured on?</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <MultiSelect
                                                                options={[
                                                                    "Revenue Closed",
                                                                    "Deals Closed",
                                                                    "Meetings Booked",
                                                                    "Pipeline Generated",
                                                                    "Renewals",
                                                                    "Upsell",
                                                                    "Demos",
                                                                    "Conversions",
                                                                    "Onboarding",
                                                                    "Team Targets",
                                                                    "Other"
                                                                ]}
                                                                selected={profile.role_process_exposure.quota_ownership.cadence ? [profile.role_process_exposure.quota_ownership.cadence] : []}
                                                                onChange={(values) => handleFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, cadence: values[0] || "" })}
                                                                placeholder="Select quota metrics..."
                                                            />
                                                        </FormControl>
                                                    )}

                                                    {/* Quota Attainment (Conditional) */}
                                                    {profile.role_process_exposure.quota_ownership.has_quota && (
                                                        <FormControl>
                                                            <div className="flex items-center gap-2">
                                                                <FormLabel>Quota Attainment (% Achieved)</FormLabel>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger>
                                                                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Roughly what % of your quota did you hit on average?</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <Select
                                                                value={profile.role_process_exposure.quota_ownership.attainment_history}
                                                                onValueChange={(value) => handleFieldChange("role_process_exposure", "quota_ownership", { ...profile.role_process_exposure.quota_ownership, attainment_history: value })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select attainment range..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[
                                                                        "<50%",
                                                                        "50–74%",
                                                                        "75–99%",
                                                                        "100–124%",
                                                                        "125–149%",
                                                                        "150%+",
                                                                        "Varies"
                                                                    ].map((attainment) => (
                                                                        <SelectItem key={attainment} value={attainment}>
                                                                            {attainment}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                It doesn't have to be exact
                                                            </p>
                                                        </FormControl>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Tools & Platforms */}
                                        <AccordionItem value="tools_platforms" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">What tools have you used?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* CRM Tools */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>CRM Tools You've Used</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>What CRMs have you used regularly for tracking deals and pipeline?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={[
                                                                "Salesforce",
                                                                "HubSpot",
                                                                "Zoho",
                                                                "Pipedrive",
                                                                "Outreach",
                                                                "Apollo",
                                                                "Salesloft",
                                                                "Sales Nav",
                                                                "Gong",
                                                                "Chorus",
                                                                "ZoomInfo",
                                                                "Slack",
                                                                "Notion",
                                                                "Excel",
                                                                "Google Sheets",
                                                                "Other"
                                                            ]}
                                                            selected={profile.tools_platforms.crm_used}
                                                            onChange={(values) => handleArrayChange("tools_platforms", "crm_used", values)}
                                                            placeholder="Select CRM tools..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            E.g. Salesforce, Zoho, HubSpot — searchable dropdown
                                                        </p>
                                                    </FormControl>

                                                    {/* Sales Tools */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Other Sales Tools</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Tools that helped with prospecting, outreach, or closing</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={[
                                                                "LinkedIn Sales Navigator",
                                                                "WhatsApp Business",
                                                                "Gong",
                                                                "Outreach",
                                                                "Apollo",
                                                                "ZoomInfo",
                                                                "SalesLoft",
                                                                "HubSpot Sales",
                                                                "Pipedrive",
                                                                "Salesforce",
                                                                "Chorus",
                                                                "Calendly",
                                                                "Loom",
                                                                "Zoom",
                                                                "Microsoft Teams",
                                                                "Slack",
                                                                "Notion",
                                                                "Excel",
                                                                "Google Sheets",
                                                                "Other"
                                                            ]}
                                                            selected={profile.tools_platforms.sales_tools}
                                                            onChange={(values) => handleArrayChange("tools_platforms", "sales_tools", values)}
                                                            placeholder="Select sales tools..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            E.g. LinkedIn Sales Nav, Gong, WhatsApp Business
                                                        </p>
                                                    </FormControl>

                                                    {/* Communication Tools */}
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel>Communication Tools</FormLabel>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>What tools did you use to communicate with prospects and customers?</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <MultiSelect
                                                            options={[
                                                                "Slack",
                                                                "Microsoft Teams",
                                                                "Zoom",
                                                                "Google Meet",
                                                                "WhatsApp Business",
                                                                "LinkedIn",
                                                                "Email",
                                                                "Phone",
                                                                "SMS",
                                                                "Other"
                                                            ]}
                                                            selected={profile.tools_platforms.communication_tools}
                                                            onChange={(values) => handleArrayChange("tools_platforms", "communication_tools", values)}
                                                            placeholder="Select communication tools..."
                                                        />
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Tools used for customer and team communication
                                                        </p>
                                                    </FormControl>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full sm:w-auto h-12 px-8 text-lg bg-primary hover:bg-primary/90"
                                        >
                                            <FaRegSave className="mr-2 w-5 h-5" />
                                            {submitting ? "Saving..." : "Save Profile"}
                                        </Button>
                                    </div>
                                    {success && (
                                        <div className="text-green-600 font-semibold mt-4 text-center text-lg">
                                            {success}
                                        </div>
                                    )}
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 