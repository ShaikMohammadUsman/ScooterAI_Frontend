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
    Play
} from "lucide-react";

interface WelcomeScreenProps {
    onStart: () => void;
    loading?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, loading = false }) => {
    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-4">
                            Welcome to Your Async Interview
                        </CardTitle>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            Thank you for taking the time to record this async interview for the{" "}
                            <span className="font-semibold">Sales Manager, Sai Marketing (Chennai)</span>
                        </p>
                    </motion.div>
                </div>

                <CardContent className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8 py-4">
                        {/* Role Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        Your Role as Sales Manager
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        You'll be responsible for building Sai Marketing's presence in Chennai through
                                        field-heavy, client-facing activities and driving sales growth.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        Target Market
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Building Sai Marketing's presence in Chennai through direct client engagement,
                                        relationship building, and expanding market reach in the region.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        Field-Heavy & Client-Facing
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        This role requires extensive field work, direct client interactions,
                                        and building strong relationships with customers in the Chennai market.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interview Guidelines */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                                <h3 className="font-semibold text-indigo-900 text-lg mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Interview Guidelines
                                </h3>
                                <p className="text-indigo-800 mb-4 leading-relaxed">
                                    These questions will help us understand how you think and work in real scenarios.
                                    Keep your answers clear and practical.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Clock className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">1-2 minutes per answer</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Mic className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Clear and practical responses</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Video className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Feel free to pause and think</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Wifi className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Ensure stable internet connection</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Sun className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Good lighting and clear background</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Move className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Avoid unnecessary movements</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Play className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-indigo-800 font-medium">Complete in one continuous flow</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                <h3 className="font-semibold text-green-900 text-lg mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    What to Expect
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-green-800">Camera and microphone check</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-green-800">2-3 scenario-based questions</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-green-800">Video recording for evaluation</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <span className="text-green-800">Approximately 5-10 minutes total</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Start Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex justify-center mt-8 pt-8 border-t border-gray-200"
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