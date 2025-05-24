"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { parseResume, addResumeProfile, ParseResumeResponse } from "@/lib/resumeService";
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

interface ResumeProfile {
    basic_information: {
        full_name: string;
        current_location: string;
        open_to_relocation: boolean;
        languages_spoken: string[];
        notice_period_days: number;
        current_ctc: number;
        expected_ctc: number;
    };
    career_overview: {
        total_years_experience: number;
        years_sales_experience: number;
        average_tenure_per_role: number;
        employment_gaps: {
            has_gaps: boolean;
            duration: string;
        };
        promotion_history: boolean;
        company_history: CompanyHistory[];
    };
    sales_context: {
        sales_type: string[];
        sales_motion: string[];
        industries_sold_into: string[];
        regions_sold_into: string[];
        buyer_personas: string[];
    };
    role_process_exposure: {
        sales_role_type: string;
        position_level: string;
        sales_stages_owned: string[];
        average_deal_size_range: string;
        sales_cycle_length: string;
        monthly_deal_volume: number;
        quota_ownership: {
            has_quota: boolean;
            amount: number;
            cadence: string;
            attainment_history: string;
        };
    };
    tools_platforms: {
        crm_used: string[];
        sales_tools: string[];
        communication_tools: string[];
    };
}

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
        languages_spoken: [],
        notice_period_days: 0,
        current_ctc: 0,
        expected_ctc: 0,
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

export default function ResumePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [file, setFile] = useState<File | null>(null);
    const [profile, setProfile] = useState<ResumeProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
            console.log(parsed);
            setProfile(parsed);
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
            updated?.career_overview?.company_history?.push({
                company_name: "",
                position: "",
                start_date: "",
                end_date: "",
                duration_months: 0,
                is_current: false,
            });
            return updated;
        });
    };

    // Remove a company history entry
    const removeCompanyHistory = (index: number) => {
        if (!profile) return;
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated.career_overview.company_history = updated.career_overview.company_history.filter((_, i) => i !== index);
            return updated;
        });
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await addResumeProfile(profile);
            console.log(res);
            localStorage.setItem('profile_id', res.profile_id);
            setSuccess("Profile saved! ID: " + res.profile_id);
            toast({ title: "Profile saved!", description: `ID: ${res.profile_id}` });
            setTimeout(() => {
                router.push(`/interview/general?role=${searchParams.get('role')}`);
            }, 1000);
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
                <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center gap-3 border-b bg-white/80 px-8 py-6">
                        <FiUploadCloud className="text-primary w-8 h-8" />
                        <CardTitle className="text-3xl font-bold">Upload & Edit Resume Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {/* Upload Section */}
                        <div className="mb-8 flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <label
                                    htmlFor="upload-resume"
                                    className="cursor-pointer"
                                    aria-label="Upload resume PDF file"
                                >
                                    <Button
                                        variant="outline"
                                        type="button"
                                        disabled={loading || submitting}
                                        onClick={() => document.getElementById('upload-resume')?.click()}
                                        className="h-12 px-6 text-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <FiUploadCloud className="mr-2 w-5 h-5" /> Upload Resume (PDF)
                                    </Button>
                                </label>
                                <input
                                    id="upload-resume"
                                    name="upload-resume"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={loading || submitting}
                                    aria-label="Select resume PDF file"
                                />
                                {file && <span className="text-muted-foreground text-sm">{file.name}</span>}
                            </div>
                            {loading && <LoadingSpinner />}
                        </div>

                        {/* Error State */}
                        {error && <ErrorBox message={error} />}

                        {/* Editable Form */}
                        {profile && !loading && (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <Accordion type="multiple" className="mb-4">
                                    {/* Basic Information */}
                                    <AccordionItem value="basic_information" className="border rounded-lg mb-4">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                <span className="text-xl font-semibold">Basic Information</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormControl>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <Input
                                                        value={profile.basic_information.full_name}
                                                        onChange={e => handleFieldChange("basic_information", "full_name", e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Current Location</FormLabel>
                                                    <Input
                                                        value={profile.basic_information.current_location}
                                                        onChange={e => handleFieldChange("basic_information", "current_location", e.target.value)}
                                                        required
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Open to Relocation</FormLabel>
                                                    <RadioGroup
                                                        value={profile.basic_information.open_to_relocation ? "Yes" : "No"}
                                                        onValueChange={(value) => handleFieldChange("basic_information", "open_to_relocation", value === "Yes")}
                                                        className="flex gap-4"
                                                    >
                                                        {YES_NO_OPTIONS.map((option) => (
                                                            <div key={option} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`relocation-${option}`} />
                                                                <label htmlFor={`relocation-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Languages Spoken (comma separated)</FormLabel>
                                                    <Input
                                                        value={profile.basic_information.languages_spoken.join(", ")}
                                                        onChange={e => handleFieldChange(
                                                            "basic_information",
                                                            "languages_spoken",
                                                            e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Notice Period (days)</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.basic_information.notice_period_days}
                                                        onChange={e => handleFieldChange("basic_information", "notice_period_days", Number(e.target.value))}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Current CTC</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.basic_information.current_ctc}
                                                        onChange={e => handleFieldChange("basic_information", "current_ctc", Number(e.target.value))}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Expected CTC</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.basic_information.expected_ctc}
                                                        onChange={e => handleFieldChange("basic_information", "expected_ctc", Number(e.target.value))}
                                                        min={0}
                                                    />
                                                </FormControl>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Career Overview */}
                                    <AccordionItem value="career_overview" className="border rounded-lg mb-4">
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
                                    </AccordionItem>

                                    {/* Sales Context */}
                                    <AccordionItem value="sales_context" className="border rounded-lg mb-4">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                <span className="text-xl font-semibold">Sales Context</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormControl>
                                                    <FormLabel>Sales Type</FormLabel>
                                                    <MultiSelect
                                                        options={SALES_TYPES}
                                                        selected={profile.sales_context.sales_type || []}
                                                        onChange={(values) => {
                                                            console.log('Sales Type onChange:', values);
                                                            handleArrayChange("sales_context", "sales_type", values);
                                                        }}
                                                        placeholder="Select sales types..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Sales Motion</FormLabel>
                                                    <MultiSelect
                                                        options={SALES_MOTIONS}
                                                        selected={profile.sales_context.sales_motion || []}
                                                        onChange={(values) => {
                                                            console.log('Sales Motion onChange:', values);
                                                            handleArrayChange("sales_context", "sales_motion", values);
                                                        }}
                                                        placeholder="Select sales motions..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Industries Sold Into</FormLabel>
                                                    <MultiSelect
                                                        options={INDUSTRIES}
                                                        selected={profile.sales_context.industries_sold_into || []}
                                                        onChange={(values) => {
                                                            console.log('Industries onChange:', values);
                                                            handleArrayChange("sales_context", "industries_sold_into", values);
                                                        }}
                                                        placeholder="Select industries..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Regions Sold Into</FormLabel>
                                                    <MultiSelect
                                                        options={REGIONS}
                                                        selected={profile.sales_context.regions_sold_into || []}
                                                        onChange={(values) => {
                                                            console.log('Regions onChange:', values);
                                                            handleArrayChange("sales_context", "regions_sold_into", values);
                                                        }}
                                                        placeholder="Select regions..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Buyer Personas</FormLabel>
                                                    <MultiSelect
                                                        options={BUYER_PERSONAS}
                                                        selected={profile.sales_context.buyer_personas || []}
                                                        onChange={(values) => {
                                                            console.log('Buyer Personas onChange:', values);
                                                            handleArrayChange("sales_context", "buyer_personas", values);
                                                        }}
                                                        placeholder="Select buyer personas..."
                                                    />
                                                </FormControl>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Role Process Exposure */}
                                    <AccordionItem value="role_process_exposure" className="border rounded-lg mb-4">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                <span className="text-xl font-semibold">Role Process Exposure</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormControl>
                                                    <FormLabel>Sales Role Type</FormLabel>
                                                    <Select
                                                        value={profile.role_process_exposure.sales_role_type}
                                                        onValueChange={(value: string) => handleFieldChange("role_process_exposure", "sales_role_type", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role type..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SALES_ROLE_TYPES.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Position Level</FormLabel>
                                                    <Select
                                                        value={profile.role_process_exposure.position_level}
                                                        onValueChange={(value: string) => handleFieldChange("role_process_exposure", "position_level", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {POSITION_LEVELS.map((level) => (
                                                                <SelectItem key={level} value={level}>
                                                                    {level}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Sales Stages Owned</FormLabel>
                                                    <MultiSelect
                                                        options={SALES_STAGES}
                                                        selected={profile.role_process_exposure.sales_stages_owned}
                                                        onChange={(values) => handleArrayChange("role_process_exposure", "sales_stages_owned", values)}
                                                        placeholder="Select sales stages..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Average Deal Size Range</FormLabel>
                                                    <Select
                                                        value={profile.role_process_exposure.average_deal_size_range}
                                                        onValueChange={(value: string) => handleFieldChange("role_process_exposure", "average_deal_size_range", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select deal size range..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DEAL_SIZE_RANGES.map((range) => (
                                                                <SelectItem key={range} value={range}>
                                                                    {range}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Sales Cycle Length</FormLabel>
                                                    <Select
                                                        value={profile.role_process_exposure.sales_cycle_length}
                                                        onValueChange={(value: string) => handleFieldChange("role_process_exposure", "sales_cycle_length", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select cycle length..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SALES_CYCLE_LENGTHS.map((length) => (
                                                                <SelectItem key={length} value={length}>
                                                                    {length}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Monthly Deal Volume</FormLabel>
                                                    <Input
                                                        type="number"
                                                        value={profile.role_process_exposure.monthly_deal_volume}
                                                        onChange={e => handleFieldChange("role_process_exposure", "monthly_deal_volume", Number(e.target.value))}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Quota Ownership</FormLabel>
                                                    <RadioGroup
                                                        value={profile.role_process_exposure.quota_ownership.has_quota ? "Yes" : "No"}
                                                        onValueChange={(value) => handleFieldChange("role_process_exposure", "quota_ownership", value === "Yes", "has_quota")}
                                                        className="flex gap-4"
                                                    >
                                                        {YES_NO_OPTIONS.map((option) => (
                                                            <div key={option} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`quota-${option}`} />
                                                                <label htmlFor={`quota-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                    {profile.role_process_exposure.quota_ownership.has_quota && (
                                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Amount"
                                                                value={profile.role_process_exposure.quota_ownership.amount}
                                                                onChange={e => handleFieldChange("role_process_exposure", "quota_ownership", Number(e.target.value), "amount")}
                                                            />
                                                            <FormControl>
                                                                <FormLabel>Quota Cadence</FormLabel>
                                                                <Select
                                                                    value={profile.role_process_exposure.quota_ownership.cadence}
                                                                    onValueChange={(value: string) => handleFieldChange("role_process_exposure", "quota_ownership", value, "cadence")}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select cadence..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {QUOTA_CADENCE.map((cadence) => (
                                                                            <SelectItem key={cadence} value={cadence}>
                                                                                {cadence}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <Input
                                                                placeholder="Attainment History"
                                                                value={profile.role_process_exposure.quota_ownership.attainment_history}
                                                                onChange={e => handleFieldChange("role_process_exposure", "quota_ownership", e.target.value, "attainment_history")}
                                                            />
                                                        </div>
                                                    )}
                                                </FormControl>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Tools & Platforms */}
                                    <AccordionItem value="tools_platforms" className="border rounded-lg mb-4">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                <span className="text-xl font-semibold">Tools & Platforms</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormControl>
                                                    <FormLabel>CRM Used</FormLabel>
                                                    <MultiSelect
                                                        options={CRM_OPTIONS}
                                                        selected={profile.tools_platforms.crm_used}
                                                        onChange={(values) => handleArrayChange("tools_platforms", "crm_used", values)}
                                                        placeholder="Select CRM tools..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Sales Tools</FormLabel>
                                                    <MultiSelect
                                                        options={SALES_TOOLS}
                                                        selected={profile.tools_platforms.sales_tools}
                                                        onChange={(values) => handleArrayChange("tools_platforms", "sales_tools", values)}
                                                        placeholder="Select sales tools..."
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Communication Tools</FormLabel>
                                                    <MultiSelect
                                                        options={COMMUNICATION_TOOLS}
                                                        selected={profile.tools_platforms.communication_tools}
                                                        onChange={(values) => handleArrayChange("tools_platforms", "communication_tools", values)}
                                                        placeholder="Select communication tools..."
                                                    />
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
            </div>
        </div>
    );
} 