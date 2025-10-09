"use client"

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createOrUpdateJob } from "@/lib/managerService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import BasicInfo from "@/components/manager/createJob/BasicInfo";
import ExperienceSkills from "@/components/manager/createJob/ExperienceSkills";
import CompensationBenefits from "@/components/manager/createJob/CompensationBenefits";
import JobConfirmationModal from "@/components/manager/createJob/JobConfirmationModal";
import JobSuccessModal from "@/components/manager/createJob/JobSuccessModal";
import JDOnboardingModal from "@/components/manager/createJob/JDOnboardingModal";

const schema = z.object({
    // Step 1 - All required except salesProcessStages
    companyName: z.string().min(1, "Company name is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    roleType: z.string().min(1, "Role type is required"),
    primaryFocus: z.array(z.string()).min(1, "Primary focus is required"),
    salesProcessStages: z.array(z.string()).optional().default(["Full cycle (prospecting → closing)"]),

    // Step 2 - All required except mustHaveSkills and timezone
    yearsOfExperience: z.string().min(1, "Years of experience is required"),
    mustHaveSkills: z.array(z.string()).optional().default([]),
    workLocationType: z.enum(["inPerson", "hybrid", "remote"], { required_error: "Select a work location type" }),
    location: z.string().min(1, "Location is required"),
    timezone: z.string().optional().default("IST"),

    // Step 3 - Only base salary range required, others optional
    currency: z.string().min(1, "Currency is required").default("₹"),
    salaryFrom: z.string().min(1, "From is required"),
    salaryTo: z.string().min(1, "To is required"),
    oteStructure: z.string().optional().default(""),
    opportunityHighlights: z.array(z.string()).optional().default([]),
    opportunityNote: z.string().optional().default(""),
    challenges: z.array(z.string()).optional().default([]),
    languages: z.array(z.string()).optional().default(["English"]),
});

type FormData = z.infer<typeof schema>;

export default function CreateJobPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"basic" | "experience" | "compensation">("basic");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stageSubmitting, setStageSubmitting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(true);

    const defaultValues = useMemo<Partial<FormData>>(
        () => ({
            workLocationType: "hybrid",
            currency: "₹",
            salesProcessStages: ["Full cycle (prospecting → closing)"],
            timezone: "IST",
            primaryFocus: ["Inbound Conversion"],
            languages: ["English"],
        }),
        []
    );

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as any,
        mode: "onChange",
    });

    const goNext = async () => {
        if (activeTab === "basic") {
            // Validate basic info fields
            const isValid = await form.trigger(["companyName", "jobTitle", "roleType", "primaryFocus"]);
            if (!isValid) return;

            // Submit stage 1
            try {
                setStageSubmitting(true);
                const values = form.getValues();
                const response = await createOrUpdateJob(1, {
                    basicInfo: {
                        companyName: values.companyName,
                        jobTitle: values.jobTitle,
                        roleType: values.roleType,
                        primaryFocus: values.primaryFocus, // Already an array
                        salesProcessStages: values.salesProcessStages || [],
                    },
                    isCompleted: false,
                });

                if (response.status && response.data.job_id) {
                    setJobId(response.data.job_id);
                    setActiveTab("experience");
                }
            } catch (error) {
                console.error("Error creating job stage 1:", error);
            } finally {
                setStageSubmitting(false);
            }
        } else if (activeTab === "experience") {
            // Validate experience fields
            const isValid = await form.trigger(["yearsOfExperience", "workLocationType", "location"]);
            if (!isValid || !jobId) return;

            // Submit stage 2
            try {
                setStageSubmitting(true);
                const values = form.getValues();
                const [minExp, maxExp] = values.yearsOfExperience.split("-").map(Number);

                const response = await createOrUpdateJob(2, {
                    job_id: jobId,
                    experienceSkills: {
                        minExp: minExp || 0,
                        maxExp: maxExp || 0,
                        skillsRequired: values.mustHaveSkills || [],
                        workLocation: values.workLocationType,
                        location: [values.location], // API expects array
                        timeZone: values.timezone ? [values.timezone] : [],
                    },
                    isCompleted: false,
                });

                if (response.status) {
                    setActiveTab("compensation");
                }
            } catch (error) {
                console.error("Error updating job stage 2:", error);
            } finally {
                setStageSubmitting(false);
            }
        }
    };

    const goBack = () => {
        if (activeTab === "compensation") setActiveTab("experience");
        else if (activeTab === "experience") setActiveTab("basic");
    };

    const onSubmit = async (values: FormData) => {
        // Show confirmation modal instead of direct submission
        console.log("Create Job payload", values);
        setShowConfirmationModal(true);
    };

    const handleConfirmSubmission = async () => {
        if (!jobId) return;

        setIsSubmitting(true);
        setShowConfirmationModal(false);

        try {
            const values = form.getValues();
            const oteList = values.oteStructure ? [values.oteStructure] : [];
            const opportunitiesList = (values.opportunityHighlights && values.opportunityHighlights.length > 0) ? values.opportunityHighlights : [];
            const challengesList = (values.challenges && values.challenges.length > 0) ? values.challenges.filter(Boolean) : [];
            const languagesList = (values.languages && values.languages.length > 0) ? values.languages : ["English"];

            const response = await createOrUpdateJob(3, {
                job_id: jobId,
                compensations: {
                    baseSalary: {
                        currency: values.currency,
                        minSalary: parseFloat(values.salaryFrom.replace(/[^\d.]/g, '')) || 0,
                        maxSalary: parseFloat(values.salaryTo.replace(/[^\d.]/g, '')) || 0,
                        cadence: "yearly", // Default cadence
                    },
                    ote: oteList,
                    equityOffered: false,
                    opportunities: opportunitiesList,
                    keyChallenged: challengesList,
                    laguages: languagesList,
                },
                isCompleted: true,
            });

            if (response.status) {
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error("Error creating job:", error);
            // Handle error - could show error toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinueToDashboard = () => {
        setShowSuccessModal(false);
        router.push("/manager/jobs");
    };

    const handleCreateAnotherRole = () => {
        setShowSuccessModal(false);
        // Reset form and go back to first step
        form.reset(defaultValues);
        setActiveTab("basic");
        setJobId(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-center text-xl sm:text-2xl font-semibold">The right candidates start with the right JD</h1>
            <p className="text-center text-sm text-muted-foreground mt-1">Here’s Yours!</p>

            <div className="mt-8">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="w-full flex flex-col sm:inline-flex  sm:flex-row justify-between bg-transparent p-0 h-auto border-b border-muted rounded-none overflow-x-auto scrollbar-hide">
                        {[
                            { value: "basic", label: "1. Basic Information" },
                            { value: "experience", label: "2. Experience & Skills" },
                            { value: "compensation", label: "3. Compensation & Benefits" },
                        ].map(({ value, label }) => (
                            <TabsTrigger
                                key={value}
                                value={value as any}
                                className="relative rounded-none bg-transparent text-text-primary data-[state=active]:shadow-none data-[state=active]:text-foreground px-2 sm:px-4 py-2"
                            >
                                <span className="text-sm sm:text-base font-medium">{label}</span>
                                {activeTab === (value as any) && (
                                    <span className="absolute left-1/2 -translate-x-1/2 bottom-[-1px] h-1 w-full rounded-full bg-element-3" />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                            <TabsContent value={activeTab}>
                                {activeTab === "basic" && (
                                    <BasicInfo form={form} onNext={goNext} submitting={stageSubmitting} />
                                )}
                                {activeTab === "experience" && (
                                    <ExperienceSkills form={form} onBack={goBack} onNext={goNext} submitting={stageSubmitting} />
                                )}
                                {activeTab === "compensation" && (
                                    <CompensationBenefits form={form} onBack={goBack} submitting={isSubmitting} />
                                )}
                            </TabsContent>
                        </form>
                    </Form>
                </Tabs>
            </div>

            {/* Modals */}
            <JDOnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} form={form} onChooseManual={() => setShowOnboarding(false)} />
            <JobConfirmationModal
                open={showConfirmationModal}
                onOpenChange={setShowConfirmationModal}
                onConfirm={handleConfirmSubmission}
                onContinueEdit={() => setShowConfirmationModal(false)}
            />

            <JobSuccessModal
                open={showSuccessModal}
                onOpenChange={setShowSuccessModal}
                onContinueToDashboard={handleContinueToDashboard}
                onCreateAnotherRole={handleCreateAnotherRole}
            />
        </div>
    );
}


