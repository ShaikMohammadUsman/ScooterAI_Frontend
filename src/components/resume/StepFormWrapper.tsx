"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Contact,
    DollarSign,
    Briefcase,
    TrendingUp,
    Target,
    Settings
} from "lucide-react";
import FormProgressBar from "./FormProgressBar";
import StepNavigation from "./StepNavigation";
import AnimatedFormContainer from "./AnimatedFormContainer";

// Define CompanyHistory interface
interface CompanyHistory {
    company_name: string;
    position: string;
    start_date: string;
    end_date: string;
    duration_months: number;
    is_current: boolean;
}

// Import all form components
import {
    ContactInformationForm,
    SalaryExpectationsForm,
    WorkHistoryForm,
    SalesContextForm,
    RoleProcessExposureForm,
    ToolsPlatformsForm
} from "@/components/resume";

interface FormStep {
    id: string;
    title: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    completed: boolean;
}

interface StepFormWrapperProps {
    profile: any;
    onFieldChange: (section: string, key: string, value: any, subkey?: string) => void;
    onArrayChange: (section: string, key: string, arr: string[]) => void;
    onCompanyHistoryChange: (index: number, field: keyof CompanyHistory, value: any) => void;
    onAddCompanyHistory: () => void;
    onRemoveCompanyHistory: (index: number) => void;
    onSave: (e?: React.FormEvent) => void;
    isSubmitting: boolean;
}

export default function StepFormWrapper({
    profile,
    onFieldChange,
    onArrayChange,
    onCompanyHistoryChange,
    onAddCompanyHistory,
    onRemoveCompanyHistory,
    onSave,
    isSubmitting
}: StepFormWrapperProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState<"left" | "right">("right");
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Define form steps with icons and components - memoized to prevent infinite re-renders
    const steps: FormStep[] = useMemo(() => [
        {
            id: "contact-info",
            title: "Contact",
            icon: <Contact className="w-5 h-5" />,
            component: <ContactInformationForm profile={profile} onFieldChange={onFieldChange} />,
            completed: false
        },
        {
            id: "salary",
            title: "Salary",
            icon: <DollarSign className="w-5 h-5" />,
            component: <SalaryExpectationsForm profile={profile} onFieldChange={onFieldChange} />,
            completed: false
        },
        {
            id: "work-history",
            title: "Experience",
            icon: <Briefcase className="w-5 h-5" />,
            component: (
                <WorkHistoryForm
                    profile={profile}
                    onCompanyHistoryChange={onCompanyHistoryChange}
                    onAddCompanyHistory={onAddCompanyHistory}
                    onRemoveCompanyHistory={onRemoveCompanyHistory}
                />
            ),
            completed: false
        },
        {
            id: "sales-context",
            title: "Sales Type",
            icon: <TrendingUp className="w-5 h-5" />,
            component: <SalesContextForm profile={profile} onArrayChange={onArrayChange} />,
            completed: false
        },
        {
            id: "role-process",
            title: "Process",
            icon: <Target className="w-5 h-5" />,
            component: (
                <RoleProcessExposureForm
                    profile={profile}
                    onFieldChange={onFieldChange}
                    onArrayChange={onArrayChange}
                />
            ),
            completed: false
        },
        {
            id: "tools",
            title: "Tools",
            icon: <Settings className="w-5 h-5" />,
            component: <ToolsPlatformsForm profile={profile} onArrayChange={onArrayChange} />,
            completed: false
        }
    ], [profile, onFieldChange, onArrayChange, onCompanyHistoryChange, onAddCompanyHistory, onRemoveCompanyHistory]);

    // Update completed steps based on form data
    // Note: steps is not included in dependencies to prevent infinite re-renders
    // since steps is memoized and only changes when its dependencies change
    useEffect(() => {
        const newCompletedSteps = new Set<number>();

        // Check each step for completion
        steps.forEach((step, index) => {
            let isCompleted = false;

            switch (step.id) {
                case "contact-info":
                    isCompleted = !!(profile?.basic_information?.full_name &&
                        profile?.basic_information?.email &&
                        profile?.basic_information?.phone_number);
                    break;
                case "salary":
                    isCompleted = true; // Optional step
                    break;
                case "work-history":
                    isCompleted = profile?.career_overview?.company_history?.length > 0;
                    break;
                case "sales-context":
                    isCompleted = !!(profile?.sales_context?.sales_type?.length > 0 ||
                        profile?.sales_context?.sales_motion?.length > 0);
                    break;
                case "role-process":
                    isCompleted = !!(profile?.role_process_exposure?.sales_role_type ||
                        profile?.role_process_exposure?.position_level);
                    break;
                case "tools":
                    isCompleted = true; // Optional step
                    break;
            }

            if (isCompleted) {
                newCompletedSteps.add(index);
            }
        });

        setCompletedSteps(newCompletedSteps);
    }, [profile]);

    // Update steps with completion status
    const stepsWithCompletion = steps.map((step, index) => ({
        ...step,
        completed: completedSteps.has(index)
    }));

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection("left");
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setDirection("right");
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
            setDirection(stepIndex > currentStep ? "left" : "right");
            setCurrentStep(stepIndex);
        }
    };

    // Check if current step can proceed
    const canProceed = () => {
        const currentStepData = steps[currentStep];

        switch (currentStepData.id) {
            case "contact-info":
                return !!(profile?.basic_information?.full_name &&
                    profile?.basic_information?.email &&
                    profile?.basic_information?.phone_number);
            default:
                return true; // Other steps are optional or have different validation
        }
    };

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <FormProgressBar
                currentStep={currentStep}
                steps={stepsWithCompletion}
                onStepClick={handleStepClick}
            />

            {/* Form Content */}
            <Card className="w-full overflow-hidden">
                <CardContent className="p-6">
                    <AnimatedFormContainer
                        direction={direction}
                        stepKey={currentStep}
                    >
                        <div className="min-h-[400px]">
                            {steps[currentStep].component}
                        </div>
                    </AnimatedFormContainer>
                </CardContent>
            </Card>

            {/* Navigation */}
            <StepNavigation
                currentStep={currentStep}
                totalSteps={steps.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSave={onSave}
                isSubmitting={isSubmitting}
                canProceed={canProceed()}
            />
        </div>
    );
} 