"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getCandidateData, getCandidateDashboardData, CandidateProfileData, ApplicationHistory } from "@/lib/candidateService";
import { MdRefresh } from "react-icons/md";

export default function CandidateDashboardPage() {
    const router = useRouter();
    const [candidateData, setCandidateData] = useState<CandidateProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCandidateDashboardData();
            if (response.status && response.data) {
                setCandidateData(response.data);
            } else {
                setError(response.message || "Failed to fetch dashboard data");
            }
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to fetch dashboard data");
            // Fallback to stored data if API fails
            const fallbackData = getCandidateData();
            if (fallbackData) {
                setCandidateData(fallbackData);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Get applications from candidate data
    const applications = candidateData?.application_history || [];

    const getStatusColor = (application: ApplicationHistory) => {
        if (application.video_interview_start) {
            return "bg-blue-100 text-blue-800";
        } else if (application.video_email_sent && !application.video_interview_start) {
            return "bg-purple-100 text-purple-800";
        } else if (application.audio_interview_status) {
            return "bg-green-100 text-green-800";
        } else if (application.application_status) {
            return "bg-orange-100 text-orange-800";
        } else {
            return "bg-yellow-100 text-yellow-800";
        }
    };

    const getStatusText = (application: ApplicationHistory) => {
        if (application.video_interview_start) {
            return "Video Interview Completed";
        } else if (application.video_email_sent && !application.video_interview_start) {
            return "Interview Link Sent";
        } else if (application.audio_interview_status) {
            return "Audio Interview Completed";
        } else if (application.application_status) {
            return application.application_status;
        } else {
            return "Under Review";
        }
    };

    const getNextStep = (application: ApplicationHistory) => {
        if (application.video_interview_start) {
            return "Awaiting Results";
        } else if (application.video_email_sent && !application.video_interview_start) {
            return "Proceed to Video Interview";
        } else if (application.audio_interview_status && application.video_email_sent) {
            return "Proceed to Video Interview";
        } else if (application.audio_interview_status) {
            return "Awaiting Video Interview Link";
        } else {
            return "Complete Audio Interview";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                            Welcome back{candidateData?.name ? `, ${candidateData.name}` : ''}!
                        </h1>
                        <p className="text-gray-600 text-center">Track your applications and manage your job search</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="ml-4"
                    >
                        <MdRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Video Interviews Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {applications.filter(app => app.video_interview_start).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Audio Interviews Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {applications.filter(app => app.audio_interview_status).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No applications found. Start applying to jobs!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((application) => (
                                <div key={application.application_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{application.job_role_name}</h3>
                                        <p className="text-sm text-gray-500">Application ID: {application.application_id}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={getStatusColor(application)}>
                                            {getStatusText(application)}
                                        </Badge>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Next: {getNextStep(application)}</p>
                                            {/* Show video interview button if audio is completed and video email is sent */}
                                            {application.audio_interview_status && application.video_email_sent && !application.video_interview_start && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="mt-1"
                                                    onClick={() => router.push(`/interview/communication?application_id=${application.application_id}`)}
                                                >
                                                    Proceed to Video Interview
                                                </Button>
                                            )}
                                            {/* Show audio interview button if audio is not completed */}
                                            {!application.audio_interview_status && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="mt-1"
                                                    onClick={() => router.push(`/interview/general?application_id=${application.application_id}`)}
                                                >
                                                    Start Audio Interview
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            {/* <div className="mt-8 flex justify-around gap-4">
                <Button variant="primary" onClick={() => router.push("/candidate/applications")}>
                    View All Applications
                </Button>
                <Button variant="secondary" onClick={() => router.push("/candidate/profile")}>
                    Update Profile
                </Button>
            </div> */}
        </div>
    );
}
