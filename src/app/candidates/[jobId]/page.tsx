'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Calendar,
    Building,
    DollarSign,
    Users,
    Target,
    TrendingUp,
    Play,
    Pause,
    Volume2,
    VolumeX,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    XCircle,
    Star,
    Clock,
    Briefcase,
    Globe,
    UserCheck,
    Award,
    BarChart3,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Phone,
    Mail,
    Linkedin,
    FileText,
    Mic,
    Video,
    Download,
    ExternalLink,
    GraduationCap,
    BriefcaseIcon,
    Target as TargetIcon,
    TrendingUp as TrendingUpIcon,
    Users as UsersIcon,
    Building2,
    CalendarDays,
    MapPinIcon,
    Languages,
    Award as AwardIcon,
    Zap,
    Heart,
    Brain,
    MessageSquare,
    CheckSquare,
    AlertCircle,
    Info
} from 'lucide-react';
import { getJobCandidates, Candidate } from '@/lib/adminService';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import ErrorBox from '@/components/ui/error';
import InterviewEvaluationTabs from '@/components/candidates/InterviewEvaluationTabs';
import AudioInterviewEvaluation from '@/components/candidates/AudioInterviewEvaluation';
import ApplicationStatusSection from '@/components/candidates/ApplicationStatusSection';
import ReactMarkdown from 'react-markdown';

interface CandidatesResponse {
    status: boolean;
    message: string;
    job_details: {
        title: string;
        description: string;
        company_id: string;
    };
    filters: {
        audio_passed: boolean | null;
        video_attended: boolean | null;
        audio_uploaded: boolean | null;
        call_for_interview: boolean | null;
        shortlisted: boolean | null;
    };
    pagination: {
        current_page: number;
        page_size: number;
        total_candidates: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
    candidates: Candidate[];
}

export default function PublicCandidatesPage() {
    console.log('PublicCandidatesPage component rendered');
    const router = useRouter();
    const params = useParams();
    const jobId = params.jobId as string;

    console.log('jobId from params:', jobId);

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(true);
    const [jobDetails, setJobDetails] = useState<any>(null);

    useEffect(() => {
        console.log('useEffect triggered with jobId:', jobId);
        if (jobId) {
            fetchCandidates();
        } else {
            console.log('No jobId found in params');
            setError('No job ID provided');
            setLoading(false);
        }
    }, [jobId, currentPage]);

    const fetchCandidates = async () => {
        console.log('fetchCandidates called with jobId:', jobId);
        setLoading(true);
        setError(null);
        try {
            // Parameters: jobId, page, pageSize, application_status, videoAttended, shortlisted, callForInterview
            const response = await getJobCandidates(
                jobId,
                currentPage,
                10,
                undefined, // application_status
                undefined, // videoAttended
                undefined,// shortlisted
                undefined  // callForInterview
            );
            console.log('API response:', response);
            setCandidates(response.candidates);
            setPagination(response.pagination);
            setJobDetails(response.job_details);
            if (response.candidates.length > 0 && !selectedCandidate) {
                setSelectedCandidate(response.candidates[0]);
            }
        } catch (err: any) {
            console.error('Error fetching candidates:', err);
            setError(err.message || "Failed to fetch candidates");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        setSelectedCandidate(null); // Reset selection when changing pages
    };



    const getCredibilityScore = (score: number): { label: string; color: string } => {
        if (score >= 8) return { label: 'High', color: 'bg-green-100 text-green-800' };
        if (score >= 6) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'Low', color: 'bg-red-100 text-red-800' };
    };

    const getStabilityLabel = (avgTenure: number): string => {
        if (avgTenure >= 2) return 'steady progression';
        if (avgTenure >= 1) return 'some movement, generally stable';
        return 'frequent moves';
    };

    const formatCTC = (ctc: any): string => {
        if (!ctc || !ctc.value) return 'NA';
        return `${ctc.currencyType || '₹'}${(ctc.value / 100000).toFixed(1)}L`;
    };

    const maskSensitiveInfo = (text: string): string => {
        if (!showSensitiveInfo) {
            return text.replace(/./g, '*');
        }
        return text;
    };

    const getInterviewStatusColor = (candidate: Candidate): string => {
        if (candidate.interview_status.video_interview_attended) return 'bg-purple-100 text-purple-800';
        if (candidate.interview_status.audio_interview_passed) return 'bg-green-100 text-green-800';
        if (candidate.interview_status.audio_interview_attended) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getInterviewStatusText = (candidate: Candidate): string => {
        if (candidate.interview_status.video_interview_attended) return 'Video Completed';
        if (candidate.interview_status.audio_interview_passed) return 'Audio Passed';
        if (candidate.interview_status.audio_interview_attended) return 'Audio Attended';
        return 'Not Started';
    };

    if (loading && candidates.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (error && candidates.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 px-4">
                    <ErrorBox message={error} />
                    <Button onClick={fetchCandidates}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="w-full flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div className='w-full justify-between'>
                                <h1 className="text-2xl font-bold text-gray-900 text-center">Public Candidate Insights</h1>
                                <p className="text-sm text-gray-600 text-center">
                                    {jobDetails?.title && `Job: ${jobDetails.title}`}
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex items-center gap-2 justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                                className="flex items-center gap-2"
                            >
                                {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showSensitiveInfo ? 'Hide' : 'Show'} Sensitive Info
                            </Button>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {pagination?.total_candidates || candidates.length} Candidates
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {selectedCandidate ? (
                    <div className="space-y-8">
                        {/* Top Section: Candidate List + Profile/Summary/Snapshot */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            {/* Candidate List - 1/4 width */}
                            <div className="xl:col-span-1">
                                <Card className="shadow-lg h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Candidates ({candidates.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 overflow-y-auto max-h-[650px]">
                                            {candidates.map((candidate) => (
                                                <div
                                                    key={candidate.profile_id}
                                                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedCandidate?.profile_id === candidate.profile_id
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => setSelectedCandidate(candidate)}
                                                >
                                                    <div className="flex flex-col items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {maskSensitiveInfo(candidate.basic_information.full_name)}
                                                        </h3>
                                                        <div className="flex gap-1">
                                                            {candidate.application_status && (
                                                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                                                    Video Round
                                                                </Badge>
                                                            )}
                                                            {candidate.final_shortlist && (
                                                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                                                    Shortlisted
                                                                </Badge>
                                                            )}
                                                            {candidate.call_for_interview && (
                                                                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                                                                    Interview Call
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        {candidate.career_overview.company_history[0]?.position} at {candidate.career_overview.company_history[candidate.career_overview.company_history.length - 1]?.company_name}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{candidate.career_overview.total_years_experience} years exp • {candidate.basic_information.current_location}</span>
                                                        <Badge className={`text-xs ${getInterviewStatusColor(candidate)}`}>
                                                            {getInterviewStatusText(candidate)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {pagination && pagination.total_pages > 1 && (
                                            <div className="mt-6 flex items-center justify-between pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={!pagination.has_previous}
                                                    className="flex items-center gap-1"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Previous
                                                </Button>
                                                <span className="text-sm text-gray-600">
                                                    Page {pagination.current_page} of {pagination.total_pages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={!pagination.has_next}
                                                    className="flex items-center gap-1"
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Profile/Summary/Snapshot - 3/4 width */}
                            <div className="xl:col-span-3">
                                <div className="space-y-6">
                                    {/* Header Bar */}
                                    <Card className="shadow-lg pt-6">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        {maskSensitiveInfo(selectedCandidate.basic_information.full_name)}
                                                    </h2>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {selectedCandidate.basic_information.current_location}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Building className="h-4 w-4" />
                                                            {selectedCandidate.career_overview.company_history[selectedCandidate.career_overview.company_history.length - 1]?.company_name}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(selectedCandidate.profile_created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary">
                                                        {selectedCandidate.career_overview.company_history[selectedCandidate.career_overview.company_history.length - 1]?.position}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {selectedCandidate.basic_information.notice_period || 'Immediate'}
                                                    </Badge>
                                                    <Badge variant={selectedCandidate.basic_information.open_to_relocation ? "default" : "secondary"}>
                                                        {selectedCandidate.basic_information.open_to_relocation ? 'Open to Relocation' : 'Not Open to Relocation'}
                                                    </Badge>
                                                    {/* <Badge className={getInterviewStatusColor(selectedCandidate)}>
                                                        {getInterviewStatusText(selectedCandidate)}
                                                    </Badge> */}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Summary */}
                                    <Card className="shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="h-5 w-5" />
                                                Quick Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {/* <p className="text-gray-700 leading-relaxed">
                                                {maskSensitiveInfo(selectedCandidate.basic_information.full_name.split(' ')[0])} is a{' '}
                                                {selectedCandidate.career_overview.total_years_experience >= 5 ? 'Senior' :
                                                    selectedCandidate.career_overview.total_years_experience >= 3 ? 'Mid-level' : 'Junior'} professional with{' '}
                                                {selectedCandidate.career_overview.total_years_experience} years of experience in{' '}
                                                {selectedCandidate.career_overview.company_history[0]?.position.toLowerCase() || 'sales'}.
                                                They have worked with {selectedCandidate.career_overview.company_history.length} companies,
                                                focusing on {selectedCandidate.career_overview.company_history[0]?.position.toLowerCase() || 'sales'}.
                                                In their most recent role as {selectedCandidate.career_overview.company_history[0]?.position} at{' '}
                                                {selectedCandidate.career_overview.company_history[0]?.company_name}, they managed{' '}
                                                {selectedCandidate.career_overview.average_tenure_per_role} years average tenure per role.
                                            </p> */}
                                            <p className="text-gray-700 leading-relaxed">{selectedCandidate.short_summary}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Job Fit Assessment */}
                                    {selectedCandidate.job_fit_assessment && (
                                        <Card className="shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Brain className="h-5 w-5" />
                                                    Job Fit Assessment
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                                    <ReactMarkdown>
                                                        {selectedCandidate.job_fit_assessment}
                                                    </ReactMarkdown>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Enhanced Snapshot Grid */}
                                    <Card className="shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Candidate Snapshot
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <Clock className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="text-xs text-blue-600 font-medium">Experience</p>
                                                        <p className="font-bold text-blue-900">{selectedCandidate.career_overview.total_years_experience} years</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-xs text-green-600 font-medium">Avg Tenure</p>
                                                        <p className="font-bold text-green-900">{selectedCandidate.career_overview.average_tenure_per_role} years</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                                    <Briefcase className="h-5 w-5 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs text-purple-600 font-medium">Recent Role</p>
                                                        <p className="font-bold text-purple-900 text-sm">{selectedCandidate.career_overview.company_history[selectedCandidate.career_overview.company_history.length - 1]?.position}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                    <Target className="h-5 w-5 text-orange-600" />
                                                    <div>
                                                        <p className="text-xs text-orange-600 font-medium">Current CTC</p>
                                                        <p className="font-bold text-orange-900">
                                                            {showSensitiveInfo ? formatCTC(selectedCandidate.basic_information.current_ctc) : '***'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-xs text-green-600 font-medium">Expected CTC</p>
                                                        <p className="font-bold text-green-900">
                                                            {showSensitiveInfo ? formatCTC(selectedCandidate.basic_information.expected_ctc) : '***'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                                                    <Globe className="h-5 w-5 text-indigo-600" />
                                                    <div>
                                                        <p className="text-xs text-indigo-600 font-medium">Notice</p>
                                                        <p className="font-bold text-indigo-900">{selectedCandidate.basic_information.notice_period || 'Immediate'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                                    <Star className="h-5 w-5 text-yellow-600" />
                                                    <div>
                                                        <p className="text-xs text-yellow-600 font-medium">Credibility</p>
                                                        <Badge className="text-xs bg-yellow-100 text-yellow-800">High</Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-red-600" />
                                                    <div>
                                                        <p className="text-xs text-red-600 font-medium">Sales Exp</p>
                                                        <p className="font-bold text-red-900">{selectedCandidate.career_overview.years_sales_experience} years</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                                                    <Building2 className="h-5 w-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-xs text-teal-600 font-medium">Companies</p>
                                                        <p className="font-bold text-teal-900">{selectedCandidate.career_overview.company_history.length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Interview Evaluation + Audio Evaluation side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <InterviewEvaluationTabs candidate={selectedCandidate} />
                            <AudioInterviewEvaluation candidate={selectedCandidate} />
                        </div>

                        {/* Bottom Section: Work Experience + Contact Info & Interview Progress side by side */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Work Experience */}
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Work Experience
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[...selectedCandidate.career_overview.company_history]?.map((job, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{job.position}</h4>
                                                    <p className="text-sm text-gray-600">{job.company_name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(job.start_date).toLocaleDateString()} - {job.is_current ? 'Present' : new Date(job.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">{job.duration_months} months</p>
                                                    {job.is_current && (
                                                        <Badge variant="default" className="text-xs">Current</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Info & Interview Progress */}
                            <div className="space-y-6">
                                {/* Contact Information (Only when sensitive info is shown) */}
                                {showSensitiveInfo && (
                                    <Card className="shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <p className="text-xs text-blue-600 font-medium">Email</p>
                                                        <p className="font-medium">{selectedCandidate.basic_information.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <Phone className="h-4 w-4 text-green-600" />
                                                    <div>
                                                        <p className="text-xs text-green-600 font-medium">Phone</p>
                                                        <p className="font-medium">{selectedCandidate.basic_information.phone_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                                    <Linkedin className="h-4 w-4 text-purple-600" />
                                                    <div>
                                                        <p className="text-xs text-purple-600 font-medium">LinkedIn</p>
                                                        <a
                                                            href={selectedCandidate.basic_information.linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-purple-600 hover:underline flex items-center gap-1"
                                                        >
                                                            View Profile
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                    <FileText className="h-4 w-4 text-orange-600" />
                                                    <div>
                                                        <p className="text-xs text-orange-600 font-medium">Resume</p>
                                                        {selectedCandidate.interview_status.resume_url && (
                                                            <a
                                                                href={selectedCandidate.interview_status.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium text-orange-600 hover:underline flex items-center gap-1"
                                                            >
                                                                Download Resume
                                                                <Download className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Application Status Section */}
                                {/* <ApplicationStatusSection
                                    candidate={selectedCandidate}
                                    onStatusUpdate={() => {
                                        // Refresh candidate data after status update
                                        if (selectedCandidate?.profile_id) {
                                            // You can add a refetch function here if needed
                                            console.log('Status updated, candidate data should be refreshed');
                                        }
                                    }}
                                /> */}

                                {/* Languages */}
                                {selectedCandidate.basic_information.languages_spoken && selectedCandidate.basic_information.languages_spoken.length > 0 && (
                                    <Card className="shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Languages className="h-5 w-5" />
                                                Languages Spoken
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCandidate.basic_information.languages_spoken.map((language, index) => (
                                                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                                        {language}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="shadow-lg">
                        <CardContent className="p-8 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Select a candidate to view detailed information</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 