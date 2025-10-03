"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ScooterHeader from "@/components/ScooterHeader";
import BottomQuote from "@/components/candidate/BottomQuote";
import { Progress } from "@/components/ui/progress";

export default function ParsingResumePage() {
    const [progress, setProgress] = useState(21);
    const router = useRouter();

    useEffect(() => {
        // Simulate progress updates
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Redirect to dashboard after completion
                    setTimeout(() => {
                        router.push("/candidate/dashboard");
                    }, 1000);
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="min-h-screen" >

            {/* Main Content */}
            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-gray-800">Building your profile</h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                                className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <Progress value={progress} className="h-3 mb-2" />

                        <p className="text-lg font-semibold text-gray-800">{Math.round(progress)}%</p>
                    </div>

                    {/* Avatar and Testimonial */}
                    <div className="rounded-2xl shadow-xl p-8 mb-8" >
                        {/* 3D Avatar */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto  rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-20 h-20  rounded-full flex items-center justify-center">
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
