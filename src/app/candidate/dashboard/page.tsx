"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRouter, useSearchParams } from "next/navigation";
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
    Building,
    ChevronUp,
    Linkedin,
    Phone,
    Mail as MailIcon,
    BriefcaseBusiness
} from "lucide-react";
import JobCard from "@/components/JobCard";
import { FaWhatsapp } from "react-icons/fa";
import ImmediateActionCard from "@/components/candidate/ImmediateActionCard";
import ActionPopup from "@/components/candidate/ActionPopup";

export default function CandidateDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [candidateData, setCandidateData] = useState<CandidateProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);
    const [currentStageAccordionOpen, setCurrentStageAccordionOpen] = useState<string | undefined>(undefined);
    const [rolesAppliedAccordionOpen, setRolesAppliedAccordionOpen] = useState<string | undefined>(undefined);
    const [showActionPopup, setShowActionPopup] = useState(false);
    const [latestJobForAction, setLatestJobForAction] = useState<ApplicationHistory | null>(null);

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

    // Check for latest job that needs action and show popup
    useEffect(() => {
        if (candidateData?.application_history && candidateData.application_history.length > 0) {
            const applications = candidateData.application_history;

            // Find the latest application that needs action
            const latestActionableJob = applications.find((application) => {
                // Check for audio interview action needed
                if (!application.audio_interview_status && application.application_status !== 'Rejected') {
                    return true;
                }
                // Check for video interview action needed
                if (application.video_email_sent && !application.video_interview_start && application.application_status !== 'Rejected') {
                    return true;
                }
                return false;
            });

            if (latestActionableJob) {
                setLatestJobForAction(latestActionableJob);
                setShowActionPopup(true);
            }
        }
    }, [candidateData]);

    // Handle job_id query parameter to auto-open accordions and select application
    useEffect(() => {
        const jobId = searchParams?.get('job_id');
        if (jobId && candidateData?.application_history) {
            // console.log('Job ID from query:', jobId);
            // console.log('Available applications:', candidateData.application_history);

            // Find the application with matching job_id
            const matchingApplication = candidateData.application_history.find((app: any) =>
                app.job_id === jobId
            );

            if (matchingApplication) {
                // console.log('Found matching application:', matchingApplication);
                // Open the roles applied accordion
                setRolesAppliedAccordionOpen('roles-applied');
                // Select the matching application
                setSelectedApplication(matchingApplication);
                // Open the current stage accordion
                setCurrentStageAccordionOpen('current-stage');
            } else {
                console.log('No matching application found for job_id:', jobId);
            }
        }
    }, [searchParams, candidateData]);

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
            return "Video Interaction Completed";
        } else if (application.video_email_sent && !application.video_interview_start) {
            return "Interaction Link Sent";
        } else if (application.audio_interview_status) {
            return "Audio Interaction Completed";
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
            return "Proceed to Video Interaction";
        } else if (application.audio_interview_status && application.video_email_sent) {
            return "Proceed to Video Interaction";
        } else if (application.audio_interview_status) {
            return "Awaiting Video Interaction Link";
        } else {
            return "Complete Audio Interaction";
        }
    };

    const handleApplicationSelect = (application: any) => {
        setSelectedApplication(application);
        setCurrentStageAccordionOpen("current-stage");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold mb-2 text-text-primary">
                            Welcome back{candidateData?.name ? `, ${candidateData.name}` : ''}!
                        </h1>
                        <p className="opacity-70 text-text-primary">Track your applications and manage your job search</p>
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
            </div> */}

            {/* Quick Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                <Briefcase className="h-5 w-5 text-text-primary" />
                            </div>
                            <CardTitle className="text-sm font-medium text-text-primary">Total Applications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-2)' }}>
                                <PlayCircle className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-sm font-medium text-text-primary">Video Interviews</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
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
                            <CardTitle className="text-sm font-medium text-text-primary">Audio Interviews</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">
                            {applications.filter(app => app.audio_interview_status).length}
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Applications */}
            {
                false && (
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" style={{ color: 'var(--color-grad-1)' }} />
                                <span className="text-text-primary">Recent Applications</span>
                            </CardTitle>
                            <CardDescription className="text-text-primary">Track the status of your job applications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-grad-1)' }}></div>
                                    <p className="text-text-primary">Loading applications...</p>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                        <Briefcase className="h-8 w-8 text-text-primary" />
                                    </div>
                                    <p className="text-text-primary">No applications found. Start applying to jobs!</p>
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
                                                                <Briefcase className="h-4 w-4 text-text-primary" />
                                                            </div>
                                                            <h3 className="font-semibold text-lg text-text-primary">
                                                                {application.job_role_name}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm opacity-70 text-text-primary">
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
                                                        <span className="text-sm font-medium text-text-primary">Progress</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {/* Application Submitted */}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${application.application_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                            <span className="text-sm text-text-primary">Application Submitted</span>
                                                        </div>

                                                        {/* Audio Interaction */}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${application.audio_interview_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                            <span className="text-sm text-text-primary">Audio Interaction</span>
                                                        </div>

                                                        {/* Video Interaction */}
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${application.video_interview_start ? 'bg-green-500' : application.video_email_sent ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                                                            <span className="text-sm text-text-primary">Video Interaction</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Next Step */}
                                                <div className="mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-grad-2)' }} />
                                                        <span className="text-sm font-medium text-text-primary">Next Step</span>
                                                    </div>
                                                    <p className="text-sm text-text-primary">{getNextStep(application)}</p>
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
                                                            Video Interaction
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
                                                            Audio Interaction
                                                        </Button>
                                                    )}

                                                    {/* Show awaiting message if video interview is completed */}
                                                    {application.video_interview_start && (
                                                        <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                            <p className="text-sm font-medium text-text-primary">
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
                )
            }


            {/* NEW SECTIONS - Profile, Work Experience, Roles Applied, Other Suitable Roles */}

            {/* Profile Section */}

            <Card className="border-0 mb-8 bg-bg-main shadow-none">
                <CardContent className="p-8 py-10">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6 text-text-primary">
                            Welcome Back {candidateData?.basic_information?.full_name || candidateData?.name || 'User'}!
                        </h2>

                        {/* Profile Picture */}
                        <div className="w-24 h-24 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="h-12 w-12 text-purple-600" />
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-semibold mb-6 text-text-primary">
                            {candidateData?.basic_information?.full_name || candidateData?.name || 'User Name'}
                        </h3>

                        {/* Contact Information */}
                        <div className="space-y-3">
                            {candidateData?.basic_information?.linkedin_url && (
                                <div className="flex items-center justify-center gap-3">
                                    <Linkedin className="h-5 w-5 text-text-secondary bg-blue-500 rounded-sm p-1" fill="white" />
                                    <span className="text-sm text-text-primary">
                                        {candidateData.basic_information.linkedin_url}
                                    </span>
                                </div>
                            )}

                            {candidateData?.basic_information?.phone_number && (
                                <div className="flex items-center justify-center gap-3">
                                    <FaWhatsapp className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-text-primary">
                                        {candidateData.basic_information.phone_number.replace(/(\d{2})\d{4}(\d{4})/, '$1XXXX$2')}
                                    </span>
                                </div>
                            )}

                            {candidateData?.basic_information?.email && (
                                <div className="flex items-center justify-center gap-3">
                                    <MailIcon className="h-5 w-5 text-[#FFCC00]" />
                                    <span className="text-sm text-text-primary">
                                        {candidateData.basic_information.email}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Immediate Action Required Card */}
            {applications.length > 0 && (
                <ImmediateActionCard applications={applications} />
            )}

            {/* Work Experience Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="work-experience" >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <BriefcaseBusiness className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Work Experience
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6">
                            <div className="space-y-4">
                                {candidateData?.career_overview?.company_history?.map((company: any, index: number) => (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-bg-secondary-5">
                                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                                            <BriefcaseBusiness className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-text-primary">
                                                {company.company_name}
                                            </h4>
                                            <p className="text-sm text-text-primary">
                                                {company.position} | {company.start_date} - {company.end_date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!candidateData?.career_overview?.company_history || candidateData.career_overview.company_history.length === 0) && (
                                    <div className="text-center py-8">
                                        <p className="text-text-primary">No work experience recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>

            {/* Roles Applied For and Current Stage - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Left Column - Roles Applied For */}
                <Card className="shadow-none border-0 bg-bg-main">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        value={rolesAppliedAccordionOpen}
                        onValueChange={setRolesAppliedAccordionOpen}
                    >
                        <AccordionItem value="roles-applied">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                        <BriefcaseBusiness className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold">
                                        Roles Applied For
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 py-6 transparent">
                                {applications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-text-primary">No applications found. Start applying to jobs!</p>
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
                                    <div className="space-y-4">
                                        {applications.map((application: any) => {
                                            const isSelected = selectedApplication?.application_id === application.application_id;
                                            const jobId = searchParams?.get('job_id');
                                            const isHighlighted = jobId && application.job_id === jobId;

                                            return (
                                                <div
                                                    key={application.application_id}
                                                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${isHighlighted
                                                        ? 'bg-gradient-to-r from-grad-1 to-grad-2 text-white'
                                                        : 'bg-bg-secondary-5'
                                                        }`}
                                                    onClick={() => handleApplicationSelect(application)}
                                                >
                                                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                                                        <BriefcaseBusiness className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg text-text-primary">
                                                            {application.job_role_name}
                                                        </h4>
                                                        <p className="text-sm mb-2 text-text-primary">
                                                            Application ID: {application.application_id}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-text-primary">Current Status:</span>
                                                            <Badge
                                                                className="px-3 py-1 text-xs font-medium border-0"
                                                                style={getStatusColor(application)}
                                                            >
                                                                {getStatusText(application)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>

                {/* Right Column - Current Stage */}
                <Card className="shadow-none border-0 bg-bg-main">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        value={currentStageAccordionOpen}
                        onValueChange={setCurrentStageAccordionOpen}
                    >
                        <AccordionItem value="current-stage">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold">
                                        Current Stage
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 py-6 transparent">
                                {selectedApplication ? (
                                    <div className="bg-bg-secondary-5 rounded-lg p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                                        <BriefcaseBusiness className="h-4 w-4 text-text-primary" />
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-text-primary">
                                                        {selectedApplication.job_role_name}
                                                    </h3>
                                                </div>
                                                <p className="text-sm opacity-70 text-text-primary">
                                                    ID: {selectedApplication.application_id}
                                                </p>
                                            </div>
                                            <Badge
                                                className="px-3 py-1 text-xs font-medium border-0"
                                                style={getStatusColor(selectedApplication)}
                                            >
                                                {getStatusText(selectedApplication)}
                                            </Badge>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="h-4 w-4" style={{ color: 'var(--color-grad-1)' }} />
                                                <span className="text-sm font-medium text-text-primary">Progress</span>
                                            </div>
                                            <div className="space-y-2">
                                                {/* Application Submitted */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${selectedApplication.application_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm text-text-primary">Application Submitted</span>
                                                </div>

                                                {/* Audio Interaction */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${selectedApplication.audio_interview_status ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm text-text-primary">Audio Interaction</span>
                                                </div>

                                                {/* Video Interaction */}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${selectedApplication.video_interview_start ? 'bg-green-500' : selectedApplication.video_email_sent ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                                                    <span className="text-sm text-text-primary">Video Interaction</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Step */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-grad-2)' }} />
                                                <span className="text-sm font-medium text-text-primary">Next Step</span>
                                            </div>
                                            <p className="text-sm text-text-primary">{getNextStep(selectedApplication)}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {/* Show video interview button if audio is completed and video email is sent */}
                                            {selectedApplication.audio_interview_status && selectedApplication.video_email_sent && !selectedApplication.video_interview_start && (
                                                <Button
                                                    className="flex-1 text-white border-0"
                                                    style={{ backgroundColor: 'var(--color-cta-primary)' }}
                                                    onClick={() => router.push(`/interview/communication?application_id=${selectedApplication.application_id}`)}
                                                >
                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                    Video Interaction
                                                </Button>
                                            )}

                                            {/* Show audio interview button if audio is not completed */}
                                            {!selectedApplication.audio_interview_status && (
                                                <Button
                                                    className="flex-1 text-white border-0"
                                                    style={{ backgroundColor: 'var(--color-cta-primary)' }}
                                                    onClick={() => router.push(`/interview/general?application_id=${selectedApplication.application_id}`)}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Audio Interaction
                                                </Button>
                                            )}

                                            {/* Show awaiting message if video interview is completed */}
                                            {selectedApplication.video_interview_start && (
                                                <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        Awaiting Results
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-bg-secondary-5 rounded-lg p-6 text-center">
                                        <BriefcaseBusiness className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-text-primary">Select a job to know their stage</p>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Card>
            </div>

            {/* Other Details Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="other-details">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Other Details
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6 transparent">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Work Experience Card */}
                                <div className="rounded-lg p-4 bg-bg-secondary-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                                            <BriefcaseBusiness className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-semibold text-lg text-text-primary">
                                                Work Experience
                                            </h4>
                                            <p className="text-sm text-text-primary">
                                                {candidateData?.career_overview?.total_years_experience || 0} years {candidateData?.career_overview?.average_tenure_per_role || 0} months
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* Current CTC Card */}
                                <div className="rounded-lg p-4 bg-bg-secondary-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                                            <Building className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-semibold text-lg text-text-primary">
                                                Current CTC
                                            </h4>
                                            <p className="text-sm text-text-primary">
                                                {candidateData?.basic_information?.current_ctc ?
                                                    `${candidateData.basic_information.current_ctc.currencyType} ${candidateData.basic_information.current_ctc.value.toLocaleString()}` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* Expected CTC Card */}
                                <div className="rounded-lg p-4 bg-bg-secondary-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                                            <Building className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-semibold text-lg text-text-primary">
                                                Expected CTC
                                            </h4>
                                            <p className="text-sm text-text-primary">
                                                {candidateData?.basic_information?.expected_ctc ?
                                                    `${candidateData.basic_information.expected_ctc.currencyType} ${candidateData.basic_information.expected_ctc.value.toLocaleString()}` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>

            {/* Other Suitable Roles Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="suitable-roles">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Other Suitable Roles
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6 transparent">
                            <div className="space-y-6">
                                {/* Mock job data for demonstration - replace with actual API call */}
                                <div className="text-center py-8">
                                    {/* <p className="text-text-primary">Loading suitable roles...</p> */}
                                    <p className="text-sm mt-2 text-text-primary">
                                        This section will show job recommendations based on your profile and experience.
                                    </p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>

            {/* Action Popup for Latest Job */}
            <ActionPopup
                isOpen={showActionPopup}
                onClose={() => setShowActionPopup(false)}
                application={latestJobForAction}
            />
        </div>
    );
}
