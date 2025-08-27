"use client";
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Sparkles } from "lucide-react";

interface FormStep {
    id: string;
    title: string;
    subtitle: string;
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
        <div className="w-full mb-12">
            {/* Enhanced Progress Bar */}
            <div className="mb-8">
                <div className="relative">
                    <Progress
                        value={progressPercentage}
                        className="h-3 bg-gradient-to-r from-blue-100 to-purple-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
                <div className="flex justify-between px-4 text-sm text-muted-foreground mt-3">
                    <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
                    <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
                </div>
            </div>

            {/* Enhanced Step Indicators */}
            {/* <div className="grid grid-cols-6 gap-4"> */}
            <div className="flex flex-wrap justify-center gap-4">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 lg:w-[160px] lg:min-h-[128px] lg:h-32 mx-0 group
            `}
                        onClick={() => onStepClick(index)}
                    // style={{ width: 160 }}
                    >
                        <div className={`w-fit md:w-full md:h-32  flex flex-col items-center justify-center shadow-md border-2 transition-all duration-300 bg-white
            lg:h-24 lg:min-h-[96px] rounded-full lg:rounded-xl sm:p-0` +
                            (index < currentStep
                                ? ' border-green-300 shadow-lg'
                                : index === currentStep
                                    ? ' border-blue-400 shadow-xl scale-105 z-10'
                                    : ' border-gray-200 group-hover:border-gray-300 shadow-sm')
                        }>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                sm:w-8 sm:h-8 sm:mb-1` +
                                (index < currentStep
                                    ? ' bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                    : index === currentStep
                                        ? ' bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl'
                                        : ' bg-gray-100 text-gray-500 group-hover:bg-gray-200')
                            }>
                                {index < currentStep ? (
                                    <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                                ) : (
                                    step.icon
                                )}
                            </div>
                            {/* Hide name and description on small and medium screens */}
                            <div className={`text-xs font-bold mb-1 text-center hidden md:block
                ${index < currentStep ? 'text-green-700' : index === currentStep ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-800'}`}
                                style={{ width: '100%' }}
                            >
                                {step.title}
                            </div>
                            <div className={`text-[11px] text-center hidden lg:block ${index < currentStep
                                ? 'text-green-600'
                                : index === currentStep
                                    ? 'text-blue-600'
                                    : 'text-gray-400 group-hover:text-gray-600'
                                }`} style={{ width: '100%' }}>
                                {step.subtitle}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 