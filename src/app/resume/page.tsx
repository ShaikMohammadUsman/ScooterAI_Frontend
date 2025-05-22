"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { parseResume, addResumeProfile, ResumeProfile, ParseResumeResponse, CompanyHistory } from "@/lib/resumeService";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineEditNote } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

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
        setProfile((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            (updated as any)[section][key] = arr;
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-8 px-2">
            <Card className="w-full max-w-3xl mx-auto shadow-lg p-0">
                <CardHeader className="flex flex-row items-center gap-3 border-b bg-white/80">
                    <FiUploadCloud className="text-primary w-7 h-7" />
                    <CardTitle className="text-2xl font-bold">Upload & Edit Resume Profile</CardTitle>
                </CardHeader>
                <CardContent className="py-8">
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
                                >
                                    <FiUploadCloud className="mr-2" /> Upload Resume (PDF)
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
                            {file && <span className="text-muted-foreground text-xs">{file.name}</span>}
                        </div>
                        {loading && <LoadingSpinner />}
                    </div>

                    {/* Error State */}
                    {error && <ErrorBox message={error} />}

                    {/* Editable Form */}
                    {profile && !loading && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Accordion type="multiple" className="mb-4">
                                {/* Basic Information */}
                                <AccordionItem value="basic_information">
                                    <AccordionTrigger>
                                        <MdOutlineEditNote className="mr-2 text-primary" /> Basic Information
                                    </AccordionTrigger>
                                    <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Switch
                                                checked={profile.basic_information.open_to_relocation}
                                                onCheckedChange={v => handleFieldChange("basic_information", "open_to_relocation", v)}
                                            />
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
                                    </AccordionContent>
                                </AccordionItem>
                                {/* Career Overview */}
                                <AccordionItem value="career_overview">
                                    <AccordionTrigger>
                                        <MdOutlineEditNote className="mr-2 text-primary" /> Career Overview
                                    </AccordionTrigger>
                                    <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Switch
                                                checked={profile.career_overview.employment_gaps.has_gaps}
                                                onCheckedChange={v => handleFieldChange("career_overview", "employment_gaps", v, "has_gaps")}
                                            />
                                            {profile.career_overview.employment_gaps.has_gaps && (
                                                <Input
                                                    placeholder="Duration"
                                                    value={profile.career_overview.employment_gaps.duration}
                                                    onChange={e => handleFieldChange("career_overview", "employment_gaps", e.target.value, "duration")}
                                                />
                                            )}
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Promotion History</FormLabel>
                                            <Switch
                                                checked={profile.career_overview.promotion_history}
                                                onCheckedChange={v => handleFieldChange("career_overview", "promotion_history", v)}
                                            />
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
                                    </AccordionContent>
                                </AccordionItem>
                                {/* Sales Context */}
                                <AccordionItem value="sales_context">
                                    <AccordionTrigger>
                                        <MdOutlineEditNote className="mr-2 text-primary" /> Sales Context
                                    </AccordionTrigger>
                                    <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormControl>
                                            <FormLabel>Sales Type (comma separated)</FormLabel>
                                            <Input
                                                value={profile.sales_context.sales_type.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "sales_context",
                                                    "sales_type",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Sales Motion (comma separated)</FormLabel>
                                            <Input
                                                value={profile.sales_context.sales_motion.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "sales_context",
                                                    "sales_motion",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Industries Sold Into (comma separated)</FormLabel>
                                            <Input
                                                value={profile.sales_context.industries_sold_into.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "sales_context",
                                                    "industries_sold_into",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Regions Sold Into (comma separated)</FormLabel>
                                            <Input
                                                value={profile.sales_context.regions_sold_into.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "sales_context",
                                                    "regions_sold_into",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Buyer Personas (comma separated)</FormLabel>
                                            <Input
                                                value={profile.sales_context.buyer_personas.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "sales_context",
                                                    "buyer_personas",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                    </AccordionContent>
                                </AccordionItem>
                                {/* Role Process Exposure */}
                                <AccordionItem value="role_process_exposure">
                                    <AccordionTrigger>
                                        <MdOutlineEditNote className="mr-2 text-primary" /> Role Process Exposure
                                    </AccordionTrigger>
                                    <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormControl>
                                            <FormLabel>Sales Role Type</FormLabel>
                                            <Input
                                                value={profile.role_process_exposure.sales_role_type}
                                                onChange={e => handleFieldChange("role_process_exposure", "sales_role_type", e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Position Level</FormLabel>
                                            <Input
                                                value={profile.role_process_exposure.position_level}
                                                onChange={e => handleFieldChange("role_process_exposure", "position_level", e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Sales Stages Owned (comma separated)</FormLabel>
                                            <Input
                                                value={profile.role_process_exposure.sales_stages_owned.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "role_process_exposure",
                                                    "sales_stages_owned",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Average Deal Size Range</FormLabel>
                                            <Input
                                                value={profile.role_process_exposure.average_deal_size_range}
                                                onChange={e => handleFieldChange("role_process_exposure", "average_deal_size_range", e.target.value)}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Sales Cycle Length</FormLabel>
                                            <Input
                                                value={profile.role_process_exposure.sales_cycle_length}
                                                onChange={e => handleFieldChange("role_process_exposure", "sales_cycle_length", e.target.value)}
                                            />
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
                                            <Switch
                                                checked={profile.role_process_exposure.quota_ownership.has_quota}
                                                onCheckedChange={v => handleFieldChange("role_process_exposure", "quota_ownership", v, "has_quota")}
                                            />
                                            {profile.role_process_exposure.quota_ownership.has_quota && (
                                                <div className="grid grid-cols-1 gap-2 mt-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Amount"
                                                        value={profile.role_process_exposure.quota_ownership.amount}
                                                        onChange={e => handleFieldChange("role_process_exposure", "quota_ownership", Number(e.target.value), "amount")}
                                                    />
                                                    <Input
                                                        placeholder="Cadence"
                                                        value={profile.role_process_exposure.quota_ownership.cadence}
                                                        onChange={e => handleFieldChange("role_process_exposure", "quota_ownership", e.target.value, "cadence")}
                                                    />
                                                    <Input
                                                        placeholder="Attainment History"
                                                        value={profile.role_process_exposure.quota_ownership.attainment_history}
                                                        onChange={e => handleFieldChange("role_process_exposure", "quota_ownership", e.target.value, "attainment_history")}
                                                    />
                                                </div>
                                            )}
                                        </FormControl>
                                    </AccordionContent>
                                </AccordionItem>
                                {/* Tools & Platforms */}
                                <AccordionItem value="tools_platforms">
                                    <AccordionTrigger>
                                        <MdOutlineEditNote className="mr-2 text-primary" /> Tools & Platforms
                                    </AccordionTrigger>
                                    <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormControl>
                                            <FormLabel>CRM Used (comma separated)</FormLabel>
                                            <Input
                                                value={profile.tools_platforms.crm_used.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "tools_platforms",
                                                    "crm_used",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Sales Tools (comma separated)</FormLabel>
                                            <Input
                                                value={profile.tools_platforms.sales_tools.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "tools_platforms",
                                                    "sales_tools",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Communication Tools (comma separated)</FormLabel>
                                            <Input
                                                value={profile.tools_platforms.communication_tools.join(", ")}
                                                onChange={e => handleFieldChange(
                                                    "tools_platforms",
                                                    "communication_tools",
                                                    e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                )}
                                            />
                                        </FormControl>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                                    <FaRegSave className="mr-2" /> {submitting ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                            {success && <div className="text-green-600 font-semibold mt-2">{success}</div>}
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 