"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Mic } from "lucide-react";
import { useCandidateProfileStore, WorkExperience, SalesProfile, SalaryExpectations, ContactDetails } from "@/store/candidateProfile";
import { useRouter, useSearchParams } from "next/navigation";
import WorkHistoryForm from "@/components/resume/WorkHistoryForm";
import SalaryExpectationsForm from "@/components/resume/SalaryExpectationsForm";
import SalesProfileForm from "@/components/candidate/SalesProfileForm";
import ContactDetailsForm from "@/components/candidate/ContactDetailsForm";
import { ResumeProfile } from "@/lib/resumeService";
import { updateCandidateData, applyJob } from "@/lib/candidateService";
import SuccessOverlay from "@/components/candidate/SuccessOverlay";
import ProfileSuccessPopup from "@/components/candidate/ProfileSuccessPopup";



const sections = [
    {
        id: "work",
        title: "1. WORK EXPERIENCE",
        subtitle: "We picked this from your resume. Feel free to tweak it."
    },
    {
        id: "sales",
        title: "2. SALES PROFILE",
        subtitle: "Tell us your sales story."
    },
    {
        id: "salary",
        title: "3. SALARY EXPECTATIONS",
        subtitle: "What are your salary expectations?"
    },
    {
        id: "contact",
        title: "4. LOCATION PREFERENCES",
        subtitle: "Set your location and work preferences"
    }
];

export default function CandidateProfileFlow() {
    const [currentSection, setCurrentSection] = useState("work");
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams?.get('job_id') || '';
    const { profile, updateProfile, markerProfileComplete } = useCandidateProfileStore();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [sectionStates, setSectionStates] = useState({
        work: 'active', // Orange gradient background 
        sales: 'pending',    // Light purple background
        salary: 'pending', // Light purple background
        contact: 'pending' // Light purple background
    });

    // Convert candidate profile to ResumeProfile format for WorkHistoryForm
    const resumeProfile: ResumeProfile = {
        basic_information: {
            full_name: profile?.contact_details?.full_name || "",
            current_location: profile?.contact_details?.location || "",
            open_to_relocation: false,
            work_preference: (profile?.contact_details as any)?.work_preference || "",
            phone_number: profile?.contact_details?.phone || "",
            linkedin_url: profile?.contact_details?.linkedin_profile || "",
            email: profile?.contact_details?.email || "",
            specific_phone_number: "",
            notice_period: "",
            current_ctc: { currencyType: profile?.salary_expectations?.currency || "INR", value: profile?.salary_expectations?.min_salary || 0 },
            expected_ctc: { currencyType: profile?.salary_expectations?.currency || "INR", value: profile?.salary_expectations?.max_salary || 0 },
        },
        career_overview: {
            total_years_experience: 0,
            years_sales_experience: 0,
            average_tenure_per_role: 0,
            employment_gaps: { has_gaps: false, duration: "" },
            promotion_history: false,
            company_history: profile?.work_experience?.map(exp => ({
                company_name: exp.company,
                position: exp.position,
                start_date: exp.start_date || "",
                end_date: exp.end_date || "",
                duration_months: exp.duration_months || 0,
                is_current: exp.is_current || false,
            })) || [],
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

    const [localProfile, setLocalProfile] = useState<ResumeProfile>(resumeProfile);

    const handleSectionChange = (sectionId: string) => {
        const targetIndex = sections.findIndex(s => s.id === sectionId);

        // Mark all sections before the target section as completed
        const newSectionStates = { ...sectionStates };
        sections.forEach((section, index) => {
            if (index < targetIndex) {
                newSectionStates[section.id as keyof typeof newSectionStates] = 'completed';
            } else if (index === targetIndex) {
                newSectionStates[section.id as keyof typeof newSectionStates] = 'active';
            } else {
                newSectionStates[section.id as keyof typeof newSectionStates] = 'pending';
            }
        });

        setSectionStates(newSectionStates);
        setCurrentSection(sectionId);
    };

    const handleCompanyHistoryChange = (index: number, field: string, value: any) => {
        setLocalProfile(prev => {
            const updated = { ...prev };
            const companyHistory = [...updated.career_overview.company_history];
            companyHistory[index] = { ...companyHistory[index], [field]: value };
            updated.career_overview.company_history = companyHistory;
            return updated;
        });
    };

    const handleAddCompanyHistory = () => {
        setLocalProfile(prev => {
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

    const handleRemoveCompanyHistory = (indexToRemove: number) => {
        setLocalProfile(prev => {
            const updated = { ...prev };
            const newHistory = updated.career_overview.company_history.filter((_, index) => index !== indexToRemove);
            updated.career_overview = {
                ...updated.career_overview,
                company_history: newHistory
            };
            return updated;
        });
    };

    // Handler for field changes (for Sales Profile and Contact Details)
    const handleFieldChange = (section: string, key: string, value: any, subkey?: string) => {
        setLocalProfile(prev => {
            const updated = { ...prev };
            if (subkey) {
                (updated as any)[section][key][subkey] = value;
            } else {
                (updated as any)[section][key] = value;
            }
            return { ...updated };
        });
    };

    // Handler for array changes (for Sales Profile)
    const handleArrayChange = (section: string, key: string, arr: string[]) => {
        setLocalProfile(prev => {
            const updated = { ...prev };
            (updated as any)[section][key] = arr;
            return { ...updated };
        });
    };

    const [showSuccess, setShowSuccess] = useState(false);
    const [showProfileSuccess, setShowProfileSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    const handleNext = async () => {
        const currentIndex = sections.findIndex(s => s.id === currentSection);
        if (currentIndex < sections.length - 1) {
            // Mark current section as completed
            setSectionStates(prev => ({
                ...prev,
                [currentSection]: 'completed'
            }));
            // Set next section as active
            const nextSectionId = sections[currentIndex + 1].id;
            setSectionStates(prev => ({
                ...prev,
                [nextSectionId]: 'active'
            }));
            setCurrentSection(nextSectionId);
        } else {
            // All sections completed → submit to backend
            setSubmitting(true);
            setSubmitError(null); // Clear any previous errors
            try {
                // First, update candidate data without job_id
                const payload = buildUpdatePayload(localProfile);
                const res = await updateCandidateData(payload);

                if (res?.status) {
                    markerProfileComplete();

                    // If job_id is present in URL, apply for the job
                    if (jobId) {
                        try {
                            const applyRes = await applyJob({ job_id: jobId });
                            if (applyRes?.status) {
                                setApplicationId(applyRes.application_id || res.application_id);
                                setShowSuccess(true);
                            } else {
                                setSubmitError(applyRes?.message || 'Failed to apply for job');
                            }
                        } catch (applyError: any) {
                            const applyMsg = applyError?.response?.data?.message || applyError?.message || 'Failed to apply for job';
                            setSubmitError(applyMsg);
                        }
                    } else {
                        // No job_id, show profile success popup
                        setApplicationId(null);
                        setShowProfileSuccess(true);
                    }
                } else {
                    setSubmitError(res?.message || 'Failed to update candidate data');
                }
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'Failed to update candidate data';
                setSubmitError(msg);
            } finally {
                setSubmitting(false);
            }
        }
    };

    function buildUpdatePayload(profileIn: ResumeProfile) {
        return {
            basic_information: {
                full_name: profileIn.basic_information.full_name,
                current_location: profileIn.basic_information.current_location,
                open_to_relocation: profileIn.basic_information.open_to_relocation,
                work_preference: (profileIn.basic_information as any).work_preference,
                phone_number: profileIn.basic_information.phone_number,
                linkedin_url: profileIn.basic_information.linkedin_url,
                email: profileIn.basic_information.email,
                notice_period: profileIn.basic_information.notice_period,
                current_ctc: profileIn.basic_information.current_ctc,
                expected_ctc: profileIn.basic_information.expected_ctc,
            },
            career_overview: {
                total_years_experience: profileIn.career_overview.total_years_experience,
                years_sales_experience: profileIn.career_overview.years_sales_experience,
                average_tenure_per_role: profileIn.career_overview.average_tenure_per_role,
                employment_gaps: profileIn.career_overview.employment_gaps,
                promotion_history: profileIn.career_overview.promotion_history,
                company_history: profileIn.career_overview.company_history.map((c) => ({
                    company_name: c.company_name,
                    position: c.position,
                    start_date: c.start_date,
                    end_date: c.end_date,
                    duration_months: c.duration_months,
                    is_current: c.is_current,
                })),
            },
            sales_context: {
                sales_type: (profileIn.sales_context.sales_type || [])[0] || "",
                sales_motion: (profileIn.sales_context.sales_motion || [])[0] || "",
                industries_sold_into: profileIn.sales_context.industries_sold_into || [],
                regions_sold_into: profileIn.sales_context.regions_sold_into || [],
                buyer_personas: profileIn.sales_context.buyer_personas || [],
            },
            role_process_exposure: {
                sales_role_type: profileIn.role_process_exposure.sales_role_type,
                position_level: profileIn.role_process_exposure.position_level,
                sales_stages_owned: profileIn.role_process_exposure.sales_stages_owned,
                average_deal_size: profileIn.role_process_exposure.average_deal_size_range as any,
                sales_cycle_length: profileIn.role_process_exposure.sales_cycle_length,
                own_quota: profileIn.role_process_exposure.quota_ownership?.has_quota || false,
                quota_ownership: [],
                quota_attainment: profileIn.role_process_exposure.quota_ownership?.attainment_history || "",
            },
            tools_platforms: {
                crm_tools: profileIn.tools_platforms.crm_used || [],
                sales_tools: profileIn.tools_platforms.sales_tools || [],
            },
        } as any;
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--color-bg-main)' }}>
            {/* Mobile Layout */}
            <div className="block lg:hidden">
                {/* Mobile Sections Header */}
                <div className="px-4 py-6">
                    <div className="grid grid-cols-2 gap-2">
                        {sections.map((section) => {
                            const state = sectionStates[section.id as keyof typeof sectionStates];
                            const isCompleted = state === 'completed';
                            const isActive = state === 'active';

                            return (
                                <div
                                    key={section.id}
                                    className={`p-4 rounded-lg transition-all ${(isCompleted || isActive)
                                        ? 'bg-gradient-to-r from-grad-1 to-grad-2 text-gray-800'
                                        : 'bg-purple-100 text-gray-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm">{section.title}</span>
                                        {(isCompleted) && (
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                                <Check className="w-6 h-6 text-[#F9F9F5]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile Content */}
                <div className="px-4 pb-20">
                    {currentSection === "work" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-center">{sections[0].title}</h2>
                            <p className="text-gray-600 mb-6 text-center">{sections[0].subtitle}</p>
                            <WorkHistoryForm
                                profile={localProfile}
                                onCompanyHistoryChange={handleCompanyHistoryChange}
                                onAddCompanyHistory={handleAddCompanyHistory}
                                onRemoveCompanyHistory={handleRemoveCompanyHistory}
                            />
                        </div>
                    )}

                    {currentSection === "sales" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-center">{sections[1].title}</h2>
                            <p className="text-gray-600 mb-6 text-center">{sections[1].subtitle}</p>
                            <SalesProfileForm
                                profile={localProfile}
                                onFieldChange={handleFieldChange}
                                onArrayChange={handleArrayChange}
                            />
                        </div>
                    )}

                    {currentSection === "salary" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-center">{sections[2].title}</h2>
                            <p className="text-gray-600 mb-6 text-center">{sections[2].subtitle}</p>
                            <SalaryExpectationsForm
                                profile={localProfile}
                                onFieldChange={handleFieldChange}
                                parsedUserName={profile?.contact_details?.full_name}
                            />
                        </div>
                    )}

                    {currentSection === "contact" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-center">{sections[3].title}</h2>
                            <p className="text-gray-600 mb-6 text-center">{sections[3].subtitle}</p>
                            <ContactDetailsForm
                                profile={localProfile}
                                onFieldChange={handleFieldChange}
                                parsedUserName={profile?.contact_details?.full_name}
                            />
                        </div>
                    )}

                    {/* Single Proceed Button */}
                    <div className="flex flex-col items-center pt-6 gap-2">
                        {submitError && (
                            <p className="text-red-600 text-sm">{submitError}</p>
                        )}
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={submitting}
                            className="px-8"
                        >
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <span>Submitting…</span>
                                </div>
                            ) : (
                                currentSection === "contact" ? "Complete" : "Proceed"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block h-screen">
                <div className="w-full h-full">
                    <div className="grid grid-cols-4 w-full h-full">
                        {/* Left Panel */}
                        <div className="col-span-1 flex flex-col pt-[50%] bg-white rounded-lg p-4">
                            <div className="space-y-2">
                                {sections.map((section) => {
                                    const state = sectionStates[section.id as keyof typeof sectionStates];
                                    const isCompleted = state === 'completed';
                                    const isActive = state === 'active';

                                    return (
                                        <div
                                            key={section.id}
                                            onClick={() => handleSectionChange(section.id)}
                                            className={`p-4 rounded-lg transition-all cursor-pointer ${(isCompleted || isActive)
                                                ? 'bg-gradient-to-r from-grad-1 to-grad-2 text-gray-800'
                                                : 'bg-element-3 text-gray-700 hover:bg-element-2'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">{section.title}</span>
                                                {(isCompleted || isActive) && (
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                                        <Check className="w-6 h-6 text-[#F9F9F5]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="col-span-3">
                            <div className="h-full p-8 shadow-sm">
                                {currentSection === "work" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 text-center">{sections[0].title}</h2>
                                        <p className="text-gray-600 mb-6 text-center">{sections[0].subtitle}</p>
                                        <WorkHistoryForm
                                            profile={localProfile}
                                            onCompanyHistoryChange={handleCompanyHistoryChange}
                                            onAddCompanyHistory={handleAddCompanyHistory}
                                            onRemoveCompanyHistory={handleRemoveCompanyHistory}
                                        />
                                    </div>
                                )}

                                {currentSection === "sales" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 text-center">{sections[1].title}</h2>
                                        <p className="text-gray-600 mb-6 text-center">{sections[1].subtitle}</p>
                                        <SalesProfileForm
                                            profile={localProfile}
                                            onFieldChange={handleFieldChange}
                                            onArrayChange={handleArrayChange}
                                        />
                                    </div>
                                )}

                                {currentSection === "salary" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 text-center">{sections[2].title}</h2>
                                        <p className="text-gray-600 mb-6 text-center">{sections[2].subtitle}</p>
                                        <SalaryExpectationsForm
                                            profile={localProfile}
                                            onFieldChange={handleFieldChange}
                                            parsedUserName={profile?.contact_details?.full_name}
                                        />
                                    </div>
                                )}

                                {currentSection === "contact" && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 text-center">{sections[3].title}</h2>
                                        <p className="text-gray-600 mb-6 text-center">{sections[3].subtitle}</p>
                                        <ContactDetailsForm
                                            profile={localProfile}
                                            onFieldChange={handleFieldChange}
                                            parsedUserName={profile?.contact_details?.full_name}
                                        />
                                    </div>
                                )}

                                {/* Single Proceed Button */}
                                <div className="flex flex-col items-center pt-6 gap-2">
                                    {submitError && (
                                        <p className="text-red-600 text-sm">{submitError}</p>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={submitting}
                                        className="px-8"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center gap-2">
                                                <span>Submitting…</span>
                                            </div>
                                        ) : (
                                            currentSection === "contact" ? "Complete" : "Proceed"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SuccessOverlay
                visible={showSuccess}
                onProceed={() => {
                    if (applicationId) {
                        router.push(`/interview/general?application_id=${encodeURIComponent(applicationId)}`);
                    } else {
                        router.push("/candidate/dashboard");
                    }
                }}
            />

            <ProfileSuccessPopup
                visible={showProfileSuccess}
                onProceed={() => {
                    router.push("/home/careers");
                }}
            />
        </div>
    );
}