"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserLoginResponse } from "@/lib/userService";
import { CheckCircle, Play, ArrowRight, User, Phone, Mail } from "lucide-react";

interface PreviousApplicationModalProps {
    userData: UserLoginResponse;
    onContinueWithJob: () => void;
    onPracticeInterview: () => void;
    onGoBack: () => void;
}

export default function PreviousApplicationModal({
    userData,
    onContinueWithJob,
    onPracticeInterview,
    onGoBack
}: PreviousApplicationModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Welcome Back, {userData.data.name}!
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        We found your previous application. Here are the details:
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Your Information
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-gray-700">{userData.data.email}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-gray-700">{userData.data.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Information */}
                    {userData.job_data && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Previous Application</h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-900">{userData.job_data.job_title}</h4>
                                    {/* <Badge variant="secondary" className="mt-1">
                                        Job ID: {userData.job_data.job_id}
                                    </Badge> */}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                    {userData.job_data.job_description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {userData.data.audio_interview_attended ? (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-800">Audio Interview Completed</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        You have already completed the audio interview for this position.
                                        Your application is being reviewed by our team.
                                    </p>
                                </div>

                                <Button
                                    onClick={onPracticeInterview}
                                    variant="outline"
                                    className="w-full h-12"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Practice Interview (Mock)
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={onContinueWithJob}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Continue with This Application
                                </Button>

                                <Button
                                    onClick={onPracticeInterview}
                                    variant="outline"
                                    className="w-full h-12"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Practice Interview (Mock)
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={onGoBack}
                            variant="ghost"
                            className="w-full h-10 text-gray-600"
                        >
                            Go Back
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        <p>Choose to continue with your previous application or practice with a mock interview</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 