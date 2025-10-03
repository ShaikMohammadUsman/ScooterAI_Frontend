import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ScooterHeader from "@/components/ScooterHeader";
import BottomQuote from "@/components/candidate/BottomQuote";

interface ResumeParsingData {
    work_experience?: Array<{
        company: string;
        position: string;
        duration: string;
        description: string;
    }>;
    sales_profile?: {
        achievements: string[];
        target_achievements: string[];
        skills: string[];
    };
    salary_expectations?: {
        min_salary: number;
        max_salary: number;
        currency: string;
    };
    contact_details?: {
        full_name: string;
        email: string;
        phone: string;
        location: string;
        linkedin_profile?: string;
    };
    professional_summary?: string;
}

interface ResumeParsingOverlayProps {
    isVisible: boolean;
    progress: number;
    onComplete: (parsedData: ResumeParsingData) => void;
    onError: (error: string) => void;
}

function ResumeParsingOverlay({ isVisible, progress, onComplete, onError }: ResumeParsingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4">
                {/* Main Content */}
                <div className="w-full text-center">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-gray-800">Building your profile</h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <Progress value={progress} className="h-3 mb-2" />
                        <p className="text-lg font-semibold text-gray-800">{Math.round(progress)}%</p>
                    </div>

                    {/* Avatar and Testimonial */}
                    <div className="rounded-2xl shadow-xl p-8 mb-8">
                        {/* 3D Avatar */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full flex items-center justify-center relative">
                                        {/* Hair */}
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-orange-300 rounded-full"></div>
                                        {/* Face */}
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                                            {/* Eyes */}
                                            <div className="flex gap-2">
                                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                            </div>
                                            {/* Smile */}
                                            <div className="absolute bottom-2 w-4 h-2 border-b-2 border-gray-600 rounded-full"></div>
                                        </div>
                                        {/* Blazer */}
                                        <div className="absolute bottom-0 w-16 h-8 bg-purple-500 rounded-b-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <blockquote className="text-gray-700 text-sm leading-relaxed mb-4">
                            "I signed my offer within two weeks. Scooter made the process fast, transparent and candidate friendly with regular updates, feedback and encouragement."
                        </blockquote>
                        <p className="font-semibold text-gray-800">Suhani</p>
                    </div>

                    {/* Motivational Quote */}
                    <div className="flex items-center justify-center gap-4 mt-12">
                        <BottomQuote quote="We are making your resume work harder to get you that dream job ✨" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResumeParsingOverlay;