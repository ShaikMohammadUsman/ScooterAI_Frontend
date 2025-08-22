"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Target,
    Users,
    Clock,
    Mic,
    Video,
    CheckCircle,
    ArrowRight,
    Zap,
    Lightbulb,
    Wifi,
    Sun,
    Move,
    Play,
    Eye,
    Shield,
    AlertTriangle,
    XCircle,
    Monitor,
    Smartphone
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
        <div className={`flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-1000 ease-in-out ${isDarkTheme
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            }`}>
            <Card className={`w-full max-w-4xl shadow-2xl border-0 overflow-hidden flex flex-col transition-all duration-1000 ease-in-out ${isDarkTheme
                ? 'bg-gray-800/95 backdrop-blur-sm'
                : 'bg-white/95 backdrop-blur-sm'
                }`}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                            <MessageSquare className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
                            Welcome to Your Async Interview
                        </CardTitle>
                        <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
                            Thank you for taking the time to record this async interview for the{" "}
                            <span className="font-semibold">{jobTitle || "the position"}</span>
                        </p>
                    </motion.div>
                </div>

                <CardContent className="p-4 md:p-8 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* Role Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`col-span-1 rounded-xl p-4 flex flex-col justify-center min-h-[340px] transition-all duration-1000 ease-in-out ${isDarkTheme
                                ? 'bg-gray-700/50 border border-gray-600'
                                : 'bg-blue-50'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-1000 ${isDarkTheme
                                        ? 'bg-blue-600/20'
                                        : 'bg-blue-100'
                                        }`}>
                                        <Target className={`w-5 h-5 transition-colors duration-1000 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                                            }`} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                                    <h3 className={`font-semibold text-base md:text-lg mb-1 md:mb-2 transition-colors duration-1000 ${isDarkTheme ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {jobTitle ? `Your Role: ${jobTitle}` : "Your Role"}
                                    </h3>
                                    <p className={`text-sm md:text-base text-center leading-relaxed transition-colors duration-1000 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                        {jobDescription || "Role description will appear here."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interview Guidelines & What to Expect */}
                        <div className="col-span-2 flex flex-col gap-6">
                            {/* Proctoring Guidelines */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className={`p-4 md:p-6 rounded-xl border transition-all duration-1000 ease-in-out ${isDarkTheme
                                    ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-700/50'
                                    : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                                    }`}
                            >
                                <h3 className={`font-semibold text-base md:text-lg mb-2 md:mb-4 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-red-300' : 'text-red-900'
                                    }`}>
                                    <Eye className="w-5 h-5" />
                                    Proctoring Guidelines
                                </h3>
                                <p className={`mb-2 md:mb-4 text-sm md:text-base leading-relaxed transition-colors duration-1000 ${isDarkTheme ? 'text-red-200' : 'text-red-800'
                                    }`}>
                                    This interview is monitored to ensure fair assessment. Please follow these guidelines:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Do's */}
                                    <div>
                                        <h4 className={`font-medium mb-2 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-green-300' : 'text-green-700'
                                            }`}>
                                            <CheckCircle className="w-4 h-4" />
                                            Do's
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-700'
                                                    }`}>Stay in fullscreen mode</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-700'
                                                    }`}>Keep focus on the interview</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-700'
                                                    }`}>Use only this browser tab</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-700'
                                                    }`}>Maintain stable internet</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Don'ts */}
                                    <div>
                                        <h4 className={`font-medium mb-2 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-red-300' : 'text-red-700'
                                            }`}>
                                            <XCircle className="w-4 h-4" />
                                            Don'ts
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-red-200' : 'text-red-700'
                                                    }`}>Switch browser tabs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-red-200' : 'text-red-700'
                                                    }`}>Open developer tools</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-red-200' : 'text-red-700'
                                                    }`}>Right-click or use shortcuts</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                                <span className={`text-sm transition-colors duration-1000 ${isDarkTheme ? 'text-red-200' : 'text-red-700'
                                                    }`}>Leave the interview window</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className={`p-4 md:p-6 rounded-xl border transition-all duration-1000 ease-in-out ${isDarkTheme
                                    ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-700/50'
                                    : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                                    }`}
                            >
                                <h3 className={`font-semibold text-base md:text-lg mb-2 md:mb-4 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-300' : 'text-indigo-900'
                                    }`}>
                                    <Lightbulb className="w-5 h-5" />
                                    Interview Guidelines
                                </h3>
                                <p className={`mb-2 md:mb-4 text-sm md:text-base leading-relaxed transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                    }`}>
                                    These questions will help us understand how you think and work in real scenarios. Keep your answers clear and practical.
                                </p>
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Clock className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>1-2 minutes per answer</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Mic className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Clear and practical responses</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Video className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Feel free to pause and think</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Wifi className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Ensure stable internet connection</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Sun className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Good lighting and clear background</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Move className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Avoid unnecessary movements</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Play className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Complete in one continuous flow</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Monitor className="w-3 h-3 text-white" />
                                        </div>
                                        <span className={`font-medium text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-indigo-200' : 'text-indigo-800'
                                            }`}>Use Chrome on desktop/laptop for best experience</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className={`p-4 md:p-6 rounded-xl border transition-all duration-1000 ease-in-out ${isDarkTheme
                                    ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/50'
                                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                    }`}
                            >
                                <h3 className={`font-semibold text-base md:text-lg mb-2 md:mb-4 flex items-center gap-2 transition-colors duration-1000 ${isDarkTheme ? 'text-green-300' : 'text-green-900'
                                    }`}>
                                    <CheckCircle className="w-5 h-5" />
                                    What to Expect
                                </h3>
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className={`text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-800'
                                            }`}>Camera and microphone check</span>
                                    </div>
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className={`text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-800'
                                            }`}>3-4 scenario-based questions</span>
                                    </div>
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className={`text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-800'
                                            }`}>Video recording for evaluation</span>
                                    </div>
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className={`text-sm md:text-base transition-colors duration-1000 ${isDarkTheme ? 'text-green-200' : 'text-green-800'
                                            }`}>Approximately 5-10 minutes total</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex justify-center mt-8"
                    >
                        <Button
                            onClick={onStart}
                            disabled={loading}
                            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Preparing...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Start Camera Check</span>
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WelcomeScreen; 