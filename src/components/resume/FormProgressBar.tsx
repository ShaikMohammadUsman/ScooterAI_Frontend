"use client";
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface FormStep {
    id: string;
    title: string;
    icon: React.ReactNode;
    completed: boolean;
}

interface FormProgressBarProps {
    currentStep: number;
    steps: FormStep[];
    onStepClick: (stepIndex: number) => void;
}

export default function FormProgressBar({ currentStep, steps, onStepClick }: FormProgressBarProps) {
    const progressPercentage = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="w-full mb-8">
            {/* Progress Bar */}
            <div className="mb-4">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${index <= currentStep ? 'opacity-100' : 'opacity-50'
                            }`}
                        onClick={() => onStepClick(index)}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${index < currentStep
                                ? 'bg-green-500 text-white'
                                : index === currentStep
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-500'
                            }`}>
                            {index < currentStep ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                step.icon
                            )}
                        </div>
                        <span className={`text-xs font-medium text-center max-w-20 ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
} 