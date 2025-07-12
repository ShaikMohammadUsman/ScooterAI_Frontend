"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Contact,
    DollarSign,
    Briefcase,
    TrendingUp,
    Target,
    Settings,
    Sparkles,
    CheckCircle2
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
    subtitle: string;
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

    // Define form steps with enhanced icons and descriptions - memoized to prevent infinite re-renders
    const steps: FormStep[] = useMemo(() => [
        {
            id: "contact-info",
            title: "Contact Information",
            subtitle: "Let's get to know you",
            icon: <Contact className="w-5 h-5" />,
            component: <ContactInformationForm profile={profile} onFieldChange={onFieldChange} />,
            completed: false
        },
        {
            id: "salary",
            title: "Salary Expectations",
            subtitle: "Your compensation preferences",
            icon: <DollarSign className="w-5 h-5" />,
            component: <SalaryExpectationsForm profile={profile} onFieldChange={onFieldChange} />,
            completed: false
        },
        {
            id: "work-history",
            title: "Work Experience",
            subtitle: "Your professional journey",
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
            title: "Sales Context",
            subtitle: "Your sales expertise",
            icon: <TrendingUp className="w-5 h-5" />,
            component: <SalesContextForm profile={profile} onArrayChange={onArrayChange} />,
            completed: false
        },
        {
            id: "role-process",
            title: "Role & Process",
            subtitle: "Your sales methodology",
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
            title: "Tools & Platforms",
            subtitle: "Your tech stack",
            icon: <Settings className="w-5 h-5" />,
            component: <ToolsPlatformsForm profile={profile} onArrayChange={onArrayChange} />,
            completed: false
        }
    ], [profile, onFieldChange, onArrayChange, onCompanyHistoryChange, onAddCompanyHistory, onRemoveCompanyHistory]);

    // Move salaryError and salaryStepIndex below steps definition
    const [salaryError, setSalaryError] = useState("");
    const salaryStepIndex = steps.findIndex(s => s.id === "salary");

    // Helper to validate contact info fields
    const isContactValid = () => {
        const name = profile?.basic_information?.full_name?.trim();
        const email = profile?.basic_information?.email?.trim();
        const phone = profile?.basic_information?.phone_number?.trim();
        const location = profile?.basic_information?.current_location?.trim();
        if (!name || !email || !phone || !location) {
            setContactError("Please fill in your name, email, phone number, and location.");
            return false;
        }
        setContactError("");
        return true;
    };
    const [contactError, setContactError] = useState("");
    const contactStepIndex = steps.findIndex(s => s.id === "contact-info");

    // Helper to validate work history fields
    const [workError, setWorkError] = useState("");
    const workStepIndex = steps.findIndex(s => s.id === "work-history");
    const [workInvalidIndex, setWorkInvalidIndex] = useState<number | null>(null);
    const isWorkValid = () => {
        const companies = profile?.career_overview?.company_history || [];
        for (let i = 0; i < companies.length; i++) {
            const c = companies[i];
            if (!c.company_name?.trim() || !c.position?.trim() || !c.start_date?.trim() || (!c.is_current && !c.end_date?.trim())) {
                setWorkError("Please fill all required fields for each work experience.");
                setWorkInvalidIndex(i);
                return false;
            }
        }
        setWorkError("");
        setWorkInvalidIndex(null);
        return true;
    };

    // Update completed steps based on form data
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
                    isCompleted = isSalaryValid(); // Optional step
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

    // Helper to validate salary fields
    const isSalaryValid = () => {
        const currentStr = profile?.basic_information?.current_ctc?.value;
        const expectedStr = profile?.basic_information?.expected_ctc?.value;
        const current = currentStr === "" ? NaN : Number(currentStr);
        const expected = expectedStr === "" ? NaN : Number(expectedStr);
        const validCurrent = !isNaN(current) && current >= 0;
        const validExpected = !isNaN(expected) && expected >= current;
        if (!validCurrent) {
            setSalaryError("Please enter a valid Current CTC (0 or more).");
            return false;
        }
        if (!validExpected) {
            setSalaryError("Expected CTC must be greater than or equal to Current CTC.");
            return false;
        }
        setSalaryError("");
        return true;
    };

    const handleNext = () => {
        // If on contact step, validate before moving forward
        if (steps[currentStep].id === "contact-info" && !isContactValid()) {
            return;
        }
        // If on salary step, validate before moving forward
        if (steps[currentStep].id === "salary" && !isSalaryValid()) {
            return;
        }
        // If on work-history step, validate before moving forward
        if (steps[currentStep].id === "work-history" && !isWorkValid()) {
            return;
        }
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
        // If leaving contact step or skipping over it, validate contact first
        const goingFromContact = steps[currentStep].id === "contact-info";
        const skippingContact = steps[stepIndex].id !== "contact-info" && currentStep < contactStepIndex && stepIndex > contactStepIndex;
        if ((goingFromContact || skippingContact) && !isContactValid()) {
            setCurrentStep(contactStepIndex);
            setDirection("right");
            return;
        }
        // If leaving salary step or skipping over it, validate salary first
        const goingFromSalary = steps[currentStep].id === "salary";
        const skippingSalary = steps[stepIndex].id !== "salary" && currentStep < salaryStepIndex && stepIndex > salaryStepIndex;
        if ((goingFromSalary || skippingSalary) && !isSalaryValid()) {
            setCurrentStep(salaryStepIndex);
            setDirection("right");
            return;
        }
        // If leaving work-history step or skipping over it, validate work first
        const goingFromWork = steps[currentStep].id === "work-history";
        const skippingWork = steps[stepIndex].id !== "work-history" && currentStep < workStepIndex && stepIndex > workStepIndex;
        if ((goingFromWork || skippingWork) && !isWorkValid()) {
            setCurrentStep(workStepIndex);
            setDirection("right");
            return;
        }
        setDirection(stepIndex > currentStep ? "left" : "right");
        setCurrentStep(stepIndex);
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

    const handleSave = (e?: React.FormEvent) => {
        // Validate contact fields before submit
        if (!isContactValid()) {
            setCurrentStep(contactStepIndex);
            setDirection("right");
            return;
        }
        // Validate salary fields before submit
        if (!isSalaryValid()) {
            setCurrentStep(salaryStepIndex);
            setDirection("right");
            return;
        }
        // Validate work fields before submit
        if (!isWorkValid()) {
            setCurrentStep(workStepIndex);
            setDirection("right");
            return;
        }
        // If you add more step validations, check them here in order
        setSalaryError("");
        setContactError("");
        setWorkError("");
        onSave && onSave(e);
    };

    return (
        <div className="w-full">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Complete Your Profile
                    </h1>
                    <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Let's capture your sales superpowers and match you with the perfect opportunities
                </p>
            </div>

            {/* Progress Bar */}
            <FormProgressBar
                currentStep={currentStep}
                steps={stepsWithCompletion}
                onStepClick={handleStepClick}
            />

            {/* Enhanced Form Content */}
            <Card className="w-full overflow-hidden border-2 shadow-xl py-2 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                <CardHeader className="block md:hidden text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-blue-500" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {steps[currentStep].title}
                        </h1>
                    </div>
                </CardHeader>
                <CardContent className=" items-center justify-center p-0">
                    <AnimatedFormContainer
                        direction={direction}
                        stepKey={currentStep}
                    >
                        <div className="">
                            {contactError && currentStep === contactStepIndex && (
                                <div className="text-red-500 text-center mb-4 font-medium">{contactError}</div>
                            )}
                            {salaryError && currentStep === salaryStepIndex && (
                                <div className="text-red-500 text-center mb-4 font-medium">{salaryError}</div>
                            )}
                            {workError && currentStep === workStepIndex && (
                                <div className="text-red-500 text-center mb-4 font-medium">{workError}</div>
                            )}
                            {steps[currentStep].component && currentStep === workStepIndex && workInvalidIndex !== null ?
                                React.cloneElement(steps[currentStep].component as React.ReactElement<any>, { forceExpandIndex: workInvalidIndex }) :
                                steps[currentStep].component
                            }
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
                onSave={handleSave}
                isSubmitting={isSubmitting}
                canProceed={canProceed()}
            />
        </div>
    );
} 