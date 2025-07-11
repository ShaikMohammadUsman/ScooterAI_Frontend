"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface StepNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onSave: () => void;
    isSubmitting: boolean;
    canProceed: boolean;
}

export default function StepNavigation({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onSave,
    isSubmitting,
    canProceed
}: StepNavigationProps) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {/* Previous Button */}
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstStep || isSubmitting}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Previous
            </Button>

            {/* Step Indicator */}
            <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
            </div>

            {/* Next/Save Button */}
            <Button
                onClick={isLastStep ? onSave : onNext}
                disabled={!canProceed || isSubmitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isLastStep ? "Saving..." : "Loading..."}
                    </>
                ) : (
                    <>
                        {isLastStep ? (
                            <>
                                <Save className="w-4 h-4" />
                                Save Profile
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </>
                )}
            </Button>
        </div>
    );
} 