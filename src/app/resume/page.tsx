"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { parseResume, addResumeProfile, ParseResumeResponse, ResumeProfile } from "@/lib/resumeService";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineEditNote } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import ResumeSuggestionBox from "@/components/interview/ResumeSuggestionBox";
import ProfileSuccessScreen from "@/components/interview/ProfileSuccessScreen";

// Import modular components
import {
    ContactInformationForm,
    SalaryExpectationsForm,
    WorkHistoryForm,
    SalesContextForm,
    RoleProcessExposureForm,
    ToolsPlatformsForm,
    ResumeUploadSection,
    UserDetailsForm,
    LinkedInUrlInput,
    ConsentCheckbox
} from "@/components/resume";

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

export default function ResumePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [file, setFile] = useState<File | null>(null);
    const [profile, setProfile] = useState<ResumeProfile>(defaultProfile);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [consentToUpdates, setConsentToUpdates] = useState<boolean>(false);
    const [linkedInUrl, setLinkedInUrl] = useState<string>("");
    const [resumeParsed, setResumeParsed] = useState<boolean>(false);
    const [showSuggestion, setShowSuggestion] = useState(false);

    // Handle file upload and parse
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setShowSuggestion(false);
        setFile(e.target.files[0]);
        setProfile(defaultProfile);
        setError(null);
        setSuccess(null);
        setResumeParsed(false);
        setLoading(true);
        try {
            // Get user details from form or use defaults
            const userDetails = {
                file: e.target.files[0],
                name: profile?.basic_information?.full_name || "User",
                email: profile?.basic_information?.email || "",
                phone: profile?.basic_information?.phone_number || ""
            };

            const parsedResponse: ParseResumeResponse = await parseResume(userDetails);

            if (!parsedResponse.status) {
                toast({ title: "Error", description: parsedResponse?.message, variant: "destructive" });
                setShowSuggestion(true);
                return;
            }
            const parsed = parsedResponse.data;
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
                    monthly_deal_volume: 0,
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
                    communication_tools: [],
                },
            };

            setProfile(transformedProfile);
            toast({ title: "Resume parsed!", description: "Edit and submit your profile." });
            setResumeParsed(true);
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
            // Get user_id from localStorage
            const userId = localStorage.getItem('scooterUserId');
            if (!userId) {
                throw new Error("User ID not found. Please try uploading your resume again.");
            }

            // Transform the data to match the backend's expected format
            const transformedProfile = {
                job_id: searchParams.get('job_id') || "",
                user_id: userId,
                basic_information: {
                    full_name: profile.basic_information.full_name,
                    current_location: profile.basic_information.current_location,
                    open_to_relocation: profile.basic_information.open_to_relocation,
                    phone_number: profile.basic_information.phone_number,
                    linkedin_url: profile.basic_information.linkedin_url,
                    email: profile.basic_information.email,
                    specific_phone_number: profile.basic_information.specific_phone_number,
                    notice_period: profile.basic_information.notice_period,
                    current_ctc: {
                        currencyType: profile.basic_information.current_ctc.currencyType,
                        value: profile.basic_information.current_ctc.value
                    },
                    expected_ctc: {
                        currencyType: profile.basic_information.expected_ctc.currencyType,
                        value: profile.basic_information.expected_ctc.value
                    }
                },
                career_overview: {
                    total_years_experience: profile.career_overview.total_years_experience,
                    years_sales_experience: profile.career_overview.years_sales_experience,
                    average_tenure_per_role: profile.career_overview.average_tenure_per_role,
                    employment_gaps: profile.career_overview.employment_gaps,
                    promotion_history: profile.career_overview.promotion_history,
                    company_history: profile.career_overview.company_history
                },
                sales_context: {
                    sales_type: profile.sales_context.sales_type[0] || "",
                    sales_motion: profile.sales_context.sales_motion[0] || "",
                    industries_sold_into: profile.sales_context.industries_sold_into,
                    regions_sold_into: profile.sales_context.regions_sold_into,
                    buyer_personas: profile.sales_context.buyer_personas
                },
                role_process_exposure: {
                    sales_role_type: profile.role_process_exposure.sales_role_type,
                    position_level: profile.role_process_exposure.position_level,
                    sales_stages_owned: profile.role_process_exposure.sales_stages_owned,
                    average_deal_size: profile.role_process_exposure.average_deal_size_range || "",
                    sales_cycle_length: profile.role_process_exposure.sales_cycle_length,
                    own_quota: profile.role_process_exposure.quota_ownership?.has_quota || false,
                    quota_ownership: profile.role_process_exposure.quota_ownership?.has_quota ? [
                        `Has Quota: ${profile.role_process_exposure.quota_ownership.has_quota}`,
                        `Amount: ${profile.role_process_exposure.quota_ownership.amount}`,
                        `Cadence: ${profile.role_process_exposure.quota_ownership.cadence}`,
                        `Attainment: ${profile.role_process_exposure.quota_ownership.attainment_history}`
                    ].filter(str => str.split(': ')[1]) : [],
                    quota_attainment: profile.role_process_exposure.quota_ownership?.attainment_history || ""
                },
                tools_platforms: {
                    crm_tools: profile.tools_platforms.crm_used || [],
                    sales_tools: profile.tools_platforms.sales_tools || []
                }
            };

            const res = await addResumeProfile(transformedProfile);
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
            <div className="container mx-auto py-8 px-2 sm:px-4">
                {/* Success Screen */}
                {showSuccessScreen ? (
                    <ProfileSuccessScreen handleStartInterview={handleStartInterview} />
                ) : (
                    <Card className="w-full lg:w-2/3 mx-auto shadow-lg border-0 rounded-3xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="flex flex-col items-center gap-3  bg-white/80 px-8 py-6 rounded-3xl">
                            <FiUploadCloud className="text-primary w-8 h-8" />
                            <CardTitle className="text-4xl font-bold text-primary mb-2 text-center">
                                Let's get you set up
                            </CardTitle>
                            <CardDescription>This won't take long. Less than 10 mins to capture your sales superpowers.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            {/* User Details Form - Required for Resume Parsing */}
                            <UserDetailsForm
                                profile={profile}
                                onFieldChange={handleFieldChange}
                            />

                            {/* LinkedIn URL Input (optional) */}
                            <LinkedInUrlInput
                                linkedInUrl={linkedInUrl}
                                onLinkedInUrlChange={setLinkedInUrl}
                            />

                            {/* Consent Checkbox */}
                            <ConsentCheckbox
                                consentToUpdates={consentToUpdates}
                                onConsentChange={setConsentToUpdates}
                                profile={profile}
                            />

                            {/* Resume Upload Section */}
                            <ResumeUploadSection
                                file={file}
                                loading={loading}
                                submitting={submitting}
                                consentToUpdates={consentToUpdates}
                                profile={profile}
                                onFileChange={handleFileChange}
                                resumeParsed={resumeParsed}
                            />

                            {/* Error State */}
                            {error && <ErrorBox message={error} />}

                            {showSuggestion && <ResumeSuggestionBox />}

                            {/* Editable Form */}
                            {resumeParsed && !loading && (
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
                                                <ContactInformationForm
                                                    profile={profile}
                                                    onFieldChange={handleFieldChange}
                                                />
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
                                                <SalaryExpectationsForm
                                                    profile={profile}
                                                    onFieldChange={handleFieldChange}
                                                />
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Work History */}
                                        <AccordionItem value="work_history" className="border rounded-lg mb-4">
                                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                                <div className="flex items-center gap-2">
                                                    <MdOutlineEditNote className="text-primary w-6 h-6" />
                                                    <span className="text-xl font-semibold">Does your work history look right?</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 py-4">
                                                <WorkHistoryForm
                                                    profile={profile}
                                                    onCompanyHistoryChange={handleCompanyHistoryChange}
                                                    onAddCompanyHistory={addCompanyHistory}
                                                    onRemoveCompanyHistory={removeCompanyHistory}
                                                />
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
                                                <SalesContextForm
                                                    profile={profile}
                                                    onArrayChange={handleArrayChange}
                                                />
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
                                                <RoleProcessExposureForm
                                                    profile={profile}
                                                    onFieldChange={handleFieldChange}
                                                    onArrayChange={handleArrayChange}
                                                />
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
                                                <ToolsPlatformsForm
                                                    profile={profile}
                                                    onArrayChange={handleArrayChange}
                                                />
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