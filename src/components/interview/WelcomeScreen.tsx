"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Clock,
    Wifi,
    Cloud,
    TrendingUp,
    Pause,
    Chrome
} from "lucide-react";

interface WelcomeScreenProps {
    onStart: () => void;
    loading?: boolean;
    jobTitle?: string | null;
    jobDescription?: string | null;
    isDarkTheme?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onStart,
    loading = false,
    jobTitle,
    jobDescription,
    isDarkTheme = false
}) => {
    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-bg-main">
            <div className="w-full max-w-4xl mx-auto text-center">
                {/* Main Title */}
                <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    className="text-2xl md:text-3xl font-semibold text-gray-700 mb-12"
                >
                    Yay! you've been shortlisted for the video assessment
                </motion.h1>

                {/* Instructions Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                >
                    {/* Row 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <Clock className="w-8 h-8 text-gray-600" />
                                    </div>
                        <p className="text-gray-600 text-sm text-center">
                            Find a quiet spot, this takes 20-30 minutes.
                                    </p>
                                </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <Wifi className="w-8 h-8 text-gray-600" />
                            </div>
                        <p className="text-gray-600 text-sm text-center">
                            Ensure stable internet connection
                        </p>
                                            </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <Cloud className="w-8 h-8 text-gray-600" />
                                            </div>
                        <p className="text-gray-600 text-sm text-center">
                            Give clear and practical responses
                        </p>
                                            </div>

                    {/* Row 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <TrendingUp className="w-8 h-8 text-gray-600" />
                                            </div>
                        <p className="text-gray-600 text-sm text-center">
                            Complete in one continuous flow
                        </p>
                                            </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <Pause className="w-8 h-8 text-gray-600" />
                                            </div>
                        <p className="text-gray-600 text-sm text-center">
                            Feel free to pause and think between responses.
                        </p>
                                            </div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                            <Chrome className="w-8 h-8 text-gray-600" />
                                            </div>
                        <p className="text-gray-600 text-sm text-center">
                            Use Chrome on your device for the best experience
                        </p>
                                </div>
                            </motion.div>

                {/* I'm Ready Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8"
                    >
                        <Button
                            onClick={onStart}
                            disabled={loading}
                        variant="primary"
                        className=" font-medium text-lg transition-all duration-300 transform hover:scale-105"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Preparing...</span>
                                </div>
                            ) : (
                            "I'm ready!"
                            )}
                        </Button>
                    </motion.div>

                {/* Schedule Link */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center"
                >
                    <p className="text-gray-600 mb-2">Unable to start now?</p>
                    <button className="text-gray-600 text-sm underline hover:text-gray-800 transition-colors">
                        Click here to schedule your assessment for later
                    </button>
                </motion.div> */}
            </div>
        </div>
    );
};

export default WelcomeScreen; 