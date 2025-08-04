"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { parseResume, addResumeProfile, ParseResumeResponse, ResumeProfile } from "@/lib/resumeService";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";
import { FiUploadCloud } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import ResumeSuggestionBox from "@/components/interview/ResumeSuggestionBox";
import ProfileSuccessScreen from "@/components/interview/ProfileSuccessScreen";
import UserLoginSection from "@/components/resume/UserLoginSection";
import PreviousApplicationModal from "@/components/resume/PreviousApplicationModal";
import JobChatbot from "@/components/resume/JobChatbot";

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
    ConsentCheckbox,
    StepFormWrapper,
    ModernHeader
} from "@/components/resume";
import { ParsingMessage } from "@/components/ui/parsing-message";
import { UserLoginResponse } from "@/lib/userService";

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
    const [showUserLogin, setShowUserLogin] = useState<boolean>(true);
    const [userLoginData, setUserLoginData] = useState<UserLoginResponse | null>(null);
    const [showPreviousApplication, setShowPreviousApplication] = useState<boolean>(false);

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
            setError(err.message || "Failed to parse resume.\nCheck your internet connection.");
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

    // Handle user login success
    const handleUserLoginSuccess = (userData: any) => {
        setUserLoginData(userData);
        setShowUserLogin(false);
        setShowPreviousApplication(true);
    };

    // Handle continue without login
    const handleContinueWithoutLogin = () => {
        setShowUserLogin(false);
    };

    // Handle continue with previous job
    const handleContinueWithJob = () => {
        setShowPreviousApplication(false);
        // Check if user has already attended the audio interview
        if (userLoginData?.data?.audio_interview_attended) {
            // Show a message that interview is already completed
            toast({
                title: "Interview Already Completed",
                description: "You have already completed the audio interview for this position. Your application is being reviewed.",
                variant: "default",
            });
            return;
        } else {
            localStorage.setItem('scooterUserId', userLoginData?.data?.last_application_id || "");
            // console.log("saved new profile id");
        }

        // Redirect to interview with the job data
        if (userLoginData?.job_data?.job_id) {
            router.push(`/interview/general?role=${userLoginData?.job_data?.job_title}&job_id=${userLoginData?.data?.last_application_id}`);
        } else {
            router.push(`/interview/general?role=${searchParams.get('role')}`);
        }
    };

    // Handle practice interview
    const handlePracticeInterview = () => {
        setShowPreviousApplication(false);
        router.push('/interview/practice');
    };

    // Handle go back from previous application modal
    const handleGoBackFromModal = () => {
        setShowPreviousApplication(false);
        setShowUserLogin(true);
        setUserLoginData(null);
    };

    // Handle close modal and continue with fresh application
    const handleCloseModal = () => {
        setShowPreviousApplication(false);
        setShowUserLogin(false);
        setUserLoginData(null);
    };

    // Handle form submit
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!profile) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            // Get user_id from localStorage
            const userId = localStorage.getItem('scooterUserId');
            // console.log(userId);
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
            // console.log(res);
            localStorage.setItem('scooterUserId', res.profile_id);
            setSuccess("Profile saved successfully!");
            toast({ title: "Profile saved!", description: "Your can move to next step now." });
            setShowSuccessScreen(true);
        } catch (err: any) {
            setError(err.message || "Failed to save profile.\nCheck your internet connection.");
            toast({ title: "Error", description: err.message || "Failed to save profile", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
            </div>

            {/* Job Chatbot */}
            <JobChatbot
                jobId={searchParams.get('job_id') || ""}
                jobTitle={searchParams.get('role') || ""}
            />

            <div className="mx-auto py-8 px-2 sm:px-4 relative z-10">
                {/* Previous Application Modal */}
                {showPreviousApplication && userLoginData && (
                    <PreviousApplicationModal
                        userData={userLoginData}
                        onContinueWithJob={handleContinueWithJob}
                        onPracticeInterview={handlePracticeInterview}
                        onGoBack={handleGoBackFromModal}
                        onClose={handleCloseModal}
                    />
                )}

                {/* Success Screen */}
                {showSuccessScreen ? (
                    <ProfileSuccessScreen handleStartInterview={handleStartInterview} />
                ) : (
                    <>
                        {/* User Login Section */}
                        {showUserLogin && !resumeParsed && !loading && (
                            <div className="flex items-center justify-center min-h-screen">
                                <UserLoginSection
                                    onLoginSuccess={handleUserLoginSuccess}
                                    onContinueWithoutLogin={handleContinueWithoutLogin}
                                />
                            </div>
                        )}

                        {/* Initial Form Sections - Hidden after resume parsing */}
                        {!showUserLogin && !resumeParsed && !loading && (
                            <div className="transition-all duration-500 ease-in-out">
                                {/* Side-by-side layout for larger screens */}
                                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                                    {/* Left Column - Header */}
                                    <div className="lg:h-screen flex items-center justify-center">
                                        {
                                            !showSuggestion && !error && (
                                                <ModernHeader
                                                    title="Let's get you set up"
                                                    description="This won't take long. Less than 10 mins to capture your sales superpowers."
                                                />
                                            )
                                        }

                                        {/* Error State */}
                                        {error && <ErrorBox message={error} />}

                                        {showSuggestion && <ResumeSuggestionBox />}
                                    </div>

                                    {/* Right Column - Form Sections */}
                                    <div className="space-y-6 bg-white shadow-2xl py-12 px-8 rounded-3xl border border-gray-100">
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
                                    </div>
                                </div>
                            </div>
                        )}


                        {
                            (loading || !resumeParsed) && (
                                <div className="flex flex-col justify-center items-center">
                                    {loading && (<ParsingMessage />)}

                                    {/* Loading State - Show when resume parsing is in progress */}
                                    {!resumeParsed && (
                                        <div className="w-full lg:w-2/3 mx-auto">
                                            <div className="text-center">
                                                {/* <LoadingSpinner /> */}
                                                {/* Message when resume hasn't been parsed yet */}
                                                {loading && file && (
                                                    <div className="mb-8 text-center mt-8">
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                <span className="text-blue-800 font-medium">Processing your resume...</span>
                                                            </div>
                                                            <p className="text-sm text-blue-700">
                                                                We're extracting your information. This may take a few moments.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            )
                        }

                        {/* Step-by-Step Form */}
                        {resumeParsed && !loading && (
                            <div className="w-full xl:w-3/4 max-w-6xl mx-auto mt-8 relative">
                                <div className="relative bg-white shadow-2xl rounded-3xl border border-gray-100 p-8">
                                    <StepFormWrapper
                                        profile={profile}
                                        onFieldChange={handleFieldChange}
                                        onArrayChange={handleArrayChange}
                                        onCompanyHistoryChange={handleCompanyHistoryChange}
                                        onAddCompanyHistory={addCompanyHistory}
                                        onRemoveCompanyHistory={removeCompanyHistory}
                                        onSave={handleSubmit}
                                        isSubmitting={submitting}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="text-green-600 font-semibold mt-4 text-center text-lg">
                                {success}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 