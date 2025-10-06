"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getCandidateData, getCandidateDashboardData, CandidateProfileData, ApplicationHistory } from "@/lib/candidateService";
import { MdRefresh } from "react-icons/md";
import {
    Briefcase,
    Clock,
    CheckCircle,
    PlayCircle,
    Mail,
    Calendar,
    TrendingUp,
    User,
    MapPin,
    Building
} from "lucide-react";

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
            return { backgroundColor: 'var(--color-element-3)', color: 'var(--color-text-primary)' };
        } else if (application.video_email_sent && !application.video_interview_start) {
            return { backgroundColor: 'var(--color-element-2)', color: 'white' };
        } else if (application.audio_interview_status) {
            return { backgroundColor: 'var(--color-element-4)', color: 'white' };
        } else if (application.application_status) {
            return { backgroundColor: 'var(--color-element-1)', color: 'var(--color-text-primary)' };
        } else {
            return { backgroundColor: 'var(--color-element-1)', color: 'var(--color-text-primary)' };
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
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            Welcome back{candidateData?.name ? `, ${candidateData.name}` : ''}!
                        </h1>
                        <p className="opacity-70" style={{ color: 'var(--color-text-primary)' }}>Track your applications and manage your job search</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="border-0"
                        style={{
                            backgroundColor: 'var(--color-element-1)',
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        <MdRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
                {error && (
                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}>
                        <p className="text-sm text-center">{error}</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                <Briefcase className="h-5 w-5" style={{ color: 'var(--color-text-primary)' }} />
                            </div>
                            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Total Applications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{applications.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-2)' }}>
                                <PlayCircle className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Video Interviews</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {applications.filter(app => app.video_interview_start).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-4)' }}>
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Audio Interviews</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {applications.filter(app => app.audio_interview_status).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications */}
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" style={{ color: 'var(--color-grad-1)' }} />
                        <span style={{ color: 'var(--color-text-primary)' }}>Recent Applications</span>
                    </CardTitle>
                    <CardDescription style={{ color: 'var(--color-text-primary)' }}>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-grad-1)' }}></div>
                            <p style={{ color: 'var(--color-text-primary)' }}>Loading applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                <Briefcase className="h-8 w-8" style={{ color: 'var(--color-text-primary)' }} />
                            </div>
                            <p style={{ color: 'var(--color-text-primary)' }}>No applications found. Start applying to jobs!</p>
                            <Button
                                className="mt-4"
                                style={{
                                    backgroundColor: 'var(--color-cta-primary)',
                                    color: 'var(--color-cta-primary-text)'
                                }}
                                onClick={() => router.push('/home/careers')}
                            >
                                Browse Jobs
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {applications.map((application) => (
                                <Card key={application.application_id} className="shadow-md border-0 hover:shadow-lg transition-shadow duration-200">
                                    <CardContent className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                                        <Briefcase className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                                        {application.job_role_name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm opacity-70" style={{ color: 'var(--color-text-primary)' }}>
                                                    ID: {application.application_id}
                                                </p>
                                            </div>
                                            <Badge
                                                className="px-3 py-1 text-xs font-medium border-0"
                                                style={getStatusColor(application)}
                                            >
                                                {getStatusText(application)}
                                            </Badge>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="h-4 w-4" style={{ color: 'var(--color-grad-1)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Progress</span>
                                            </div>
                                            <div className="space-y-2">
                                                {/* Application Submitted */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${application.application_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Application Submitted</span>
                                                </div>

                                                {/* Audio Interview */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${application.audio_interview_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Audio Interview</span>
                                                </div>

                                                {/* Video Interview */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${application.video_interview_start ? 'bg-green-500' : application.video_email_sent ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Video Interview</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Step */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-grad-2)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Next Step</span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{getNextStep(application)}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {/* Show video interview button if audio is completed and video email is sent */}
                                            {application.audio_interview_status && application.video_email_sent && !application.video_interview_start && (
                                                <Button
                                                    // size="sm"
                                                    className="flex-1 text-white border-0"
                                                    style={{ backgroundColor: 'var(--color-cta-primary)' }}
                                                    onClick={() => router.push(`/interview/communication?application_id=${application.application_id}`)}
                                                >
                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                    Video Interview
                                                </Button>
                                            )}

                                            {/* Show audio interview button if audio is not completed */}
                                            {!application.audio_interview_status && (
                                                <Button
                                                    // size="sm"
                                                    className="flex-1 text-white border-0"
                                                    style={{ backgroundColor: 'var(--color-cta-primary)' }}
                                                    onClick={() => router.push(`/interview/general?application_id=${application.application_id}`)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Audio Interview
                                                </Button>
                                            )}

                                            {/* Show awaiting message if video interview is completed */}
                                            {application.video_interview_start && (
                                                <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                                        Awaiting Results
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
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
