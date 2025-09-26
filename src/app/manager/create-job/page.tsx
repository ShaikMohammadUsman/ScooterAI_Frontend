"use client"

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import BasicInfo from "@/components/manager/createJob/BasicInfo";
import ExperienceSkills from "@/components/manager/createJob/ExperienceSkills";
import CompensationBenefits from "@/components/manager/createJob/CompensationBenefits";

const schema = z.object({
    // Step 1
    companyName: z.string().min(1, "Company name is required"),
    jobTitle: z.string().min(1, "Job title is required"),
    roleType: z.string().min(1, "Role type is required"),
    primaryFocus: z.string().min(1, "Primary focus is required"),
    salesProcessStages: z.array(z.string()).optional().default([]),

    // Step 2
    yearsOfExperience: z.string().min(1, "Years of experience is required"),
    mustHaveSkills: z.array(z.string()).optional().default([]),
    workLocationTypes: z.array(z.enum(["in_person", "hybrid", "remote"]))
        .min(1, "Select at least one work location type"),
    location: z.string().min(1, "Location is required"),
    timezone: z.string().optional().default(""),

    // Step 3
    currency: z.string().min(1, "Currency is required"),
    salaryFrom: z.string().min(1, "From is required"),
    salaryTo: z.string().min(1, "To is required"),
    oteStructure: z.string().optional().default(""),
    opportunityHighlights: z.array(z.string()).optional().default([]),
    opportunityNote: z.string().optional().default(""),
    challenges: z.array(z.string()).max(3).optional().default([]),
    languages: z.array(z.string()).optional().default([]),
});

type FormData = z.infer<typeof schema>;

export default function CreateJobPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"basic" | "experience" | "compensation">("basic");

    const defaultValues = useMemo<Partial<FormData>>(
        () => ({
            workLocationTypes: ["hybrid"],
            currency: "₹",
        }),
        []
    );

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as any,
        mode: "onChange",
    });

    const goNext = () => {
        if (activeTab === "basic") setActiveTab("experience");
        else if (activeTab === "experience") setActiveTab("compensation");
    };

    const goBack = () => {
        if (activeTab === "compensation") setActiveTab("experience");
        else if (activeTab === "experience") setActiveTab("basic");
    };

    const onSubmit = async (values: FormData) => {
        // TODO: integrate API once available
        // For now, redirect to manager jobs list
        console.log("Create Job payload", values);
        router.push("/manager/jobs");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-center text-xl sm:text-2xl font-semibold">The right candidates start with the right JD</h1>
            <p className="text-center text-sm text-muted-foreground mt-1">Here’s Yours!</p>

            <div className="mt-8">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="w-full justify-between bg-transparent p-0 h-auto border-b border-muted rounded-none">
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
                                    <BasicInfo form={form} onNext={goNext} />
                                )}
                                {activeTab === "experience" && (
                                    <ExperienceSkills form={form} onBack={goBack} onNext={goNext} />
                                )}
                                {activeTab === "compensation" && (
                                    <CompensationBenefits form={form} onBack={goBack} />
                                )}
                            </TabsContent>

                            {activeTab === "compensation" && (
                                <div className="flex items-center justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={goBack}>Back</Button>
                                    <Button type="submit">Confirm</Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </Tabs>
            </div>
        </div>
    );
}


