'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    CheckCircle,
    XCircle,
    Star,
    Clock,
    Briefcase,
    Globe,
    UserCheck,
    Award,
    BarChart3,
    User,
    Mic,
    Mail,
    Video,
    PlayCircle,
    Eye,
    Trophy
} from 'lucide-react';
import { getJobCandidates, Candidate } from '@/lib/adminService';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import ErrorBox from '@/components/ui/error';
import InterviewStatusIndicator from '@/components/InterviewStatusIndicator';
import InterviewStatusCompact from '@/components/InterviewStatusCompact';
import VideoPlayer from '@/components/interview/VideoPlayer';

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

export default function CandidatesPage() {
    console.log('CandidatesPage component rendered');
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    console.log('jobId from search params:', jobId);

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
    const [videoPlaying, setVideoPlaying] = useState<string | null>(null);
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
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
                jobId!,
                currentPage,
                10,
                undefined, // application_status
                undefined, // videoAttended
                undefined, // shortlisted
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

    const handleAudioPlay = (profileId: string, audioUrl: string) => {
        if (audioPlaying === profileId) {
            setAudioPlaying(null);
        } else {
            setAudioPlaying(profileId);
        }
    };

    const handleVideoPlay = (profileId: string, videoUrl: string) => {
        if (videoPlaying === profileId) {
            setVideoPlaying(null);
        } else {
            setVideoPlaying(profileId);
        }
    };

    const handleNudgeAudio = (profileId: string) => {
        // TODO: Implement audio nudge functionality
        console.log('Nudging candidate for audio interview:', profileId);
        // This could trigger an email, SMS, or in-app notification
    };

    const handleNudgeVideo = (profileId: string) => {
        // TODO: Implement video nudge functionality
        console.log('Nudging candidate for video interview:', profileId);
        // This could trigger an email, SMS, or in-app notification
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Candidate Insights</h1>
                                <p className="text-sm text-gray-600">Review and evaluate candidates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{candidates.length} Candidates</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Interview Process Summary */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                            {[
                                { label: "Profile Created", count: candidates.length, icon: <User className="h-5 w-5" />, color: "bg-green-100 text-green-800" },
                                { label: "Audio Attempted", count: candidates.filter(c => c.interview_status.audio_interview_attended).length, icon: <Mic className="h-5 w-5" />, color: "bg-blue-100 text-blue-800" },
                                { label: "Marked for Video", count: candidates.filter(c => c.interview_status.audio_interview_passed).length, icon: <Mail className="h-5 w-5" />, color: "bg-yellow-100 text-yellow-800" },
                                { label: "Video Sent", count: candidates.filter(c => c.interview_status.video_interview_url).length, icon: <Video className="h-5 w-5" />, color: "bg-purple-100 text-purple-800" },
                                { label: "Video Attempted", count: candidates.filter(c => c.interview_status.video_interview_attended).length, icon: <PlayCircle className="h-5 w-5" />, color: "bg-indigo-100 text-indigo-800" },
                                { label: "Marked for Review", count: candidates.filter(c => c.final_shortlist).length, icon: <Eye className="h-5 w-5" />, color: "bg-orange-100 text-orange-800" },
                                { label: "Hired", count: candidates.filter(c => c.call_for_interview).length, icon: <Trophy className="h-5 w-5" />, color: "bg-emerald-100 text-emerald-800" }
                            ].map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${step.color} mb-2`}>
                                        {step.icon}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{step.count}</p>
                                    <p className="text-xs text-gray-500">{step.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Candidate List */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Candidates
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {candidates.map((candidate) => (
                                        <div
                                            key={candidate.profile_id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCandidate?.profile_id === candidate.profile_id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedCandidate(candidate)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {candidate.basic_information.full_name}
                                                </h3>
                                                <div className="flex gap-1">
                                                    {candidate.call_for_interview && (
                                                        <Badge variant="default" className="text-xs">
                                                            Interview
                                                        </Badge>
                                                    )}
                                                    {candidate.final_shortlist && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Shortlisted
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {candidate.career_overview.company_history[0]?.position} at {candidate.career_overview.company_history[0]?.company_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {candidate.career_overview.total_years_experience} years exp • {candidate.basic_information.current_location}
                                            </p>

                                            {/* Interview Process Status */}
                                            <div className="mt-2">
                                                <InterviewStatusCompact candidate={candidate} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Candidate Details */}
                    <div className="lg:col-span-2">
                        {selectedCandidate ? (
                            <div className="space-y-6">
                                {/* Header Bar */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {selectedCandidate.basic_information.full_name}
                                                </h2>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {selectedCandidate.basic_information.current_location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building className="h-4 w-4" />
                                                        {selectedCandidate.career_overview.company_history[0]?.company_name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAudioPlay(selectedCandidate.profile_id, selectedCandidate.interview_status.audio_interview_url || '')}
                                                >
                                                    {audioPlaying === selectedCandidate.profile_id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                    Audio
                                                </Button>
                                                {selectedCandidate.interview_status.video_interview_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleVideoPlay(selectedCandidate.profile_id, selectedCandidate.interview_status.video_interview_url || '')}
                                                    >
                                                        {videoPlaying === selectedCandidate.profile_id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                        Video
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Audio/Video Player */}
                                        {audioPlaying === selectedCandidate.profile_id && selectedCandidate.interview_status.audio_interview_url && (
                                            <div className="mb-4">
                                                <audio
                                                    controls
                                                    className="w-full"
                                                    src={selectedCandidate.interview_status.audio_interview_url}
                                                />
                                            </div>
                                        )}

                                        {videoPlaying === selectedCandidate.profile_id && (selectedCandidate.interview_status.processed_video_interview_url || selectedCandidate.interview_status.video_interview_url) && (
                                            <div className="mb-4">
                                                <VideoPlayer
                                                    videoUrl={selectedCandidate.interview_status.processed_video_interview_url || selectedCandidate.interview_status.video_interview_url!}
                                                    fallbackUrl={selectedCandidate.interview_status.processed_video_interview_url ? selectedCandidate.interview_status.video_interview_url : null}
                                                    poster='/assets/images/scooterLogo.png'
                                                    controls={true}
                                                    className="w-full rounded-lg"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <Badge variant="outline">
                                                    {selectedCandidate.career_overview.company_history[0]?.position}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {selectedCandidate.basic_information.notice_period || 'Immediate'}
                                                </Badge>
                                                <Badge variant={selectedCandidate.basic_information.open_to_relocation ? "default" : "secondary"}>
                                                    {selectedCandidate.basic_information.open_to_relocation ? 'Open to Relocation' : 'Not Open to Relocation'}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Interview
                                                </Button>
                                                <Button size="sm" variant="destructive">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Interview Process Status */}
                                <InterviewStatusIndicator
                                    candidate={selectedCandidate}
                                    onNudgeAudio={handleNudgeAudio}
                                    onNudgeVideo={handleNudgeVideo}
                                />

                                {/* Quick Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Quick Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedCandidate.basic_information.full_name.split(' ')[0]} is a{' '}
                                            {selectedCandidate.career_overview.total_years_experience >= 5 ? 'Senior' :
                                                selectedCandidate.career_overview.total_years_experience >= 3 ? 'Mid-level' : 'Junior'} professional with{' '}
                                            {selectedCandidate.career_overview.total_years_experience} years of experience in{' '}
                                            {selectedCandidate.career_overview.company_history[0]?.position.toLowerCase() || 'sales'}.
                                            They have worked with {selectedCandidate.career_overview.company_history.length} companies,
                                            focusing on {selectedCandidate.career_overview.company_history[0]?.position.toLowerCase() || 'sales'}.
                                            In their most recent role as {selectedCandidate.career_overview.company_history[0]?.position} at{' '}
                                            {selectedCandidate.career_overview.company_history[0]?.company_name}, they managed{' '}
                                            {selectedCandidate.career_overview.average_tenure_per_role} years average tenure per role.
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Snapshot Grid */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Snapshot Grid
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Experience</p>
                                                    <p className="font-semibold">{selectedCandidate.career_overview.total_years_experience} years</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Avg Tenure</p>
                                                    <p className="font-semibold">{selectedCandidate.career_overview.average_tenure_per_role} years</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Recent Role</p>
                                                    <p className="font-semibold text-sm">{selectedCandidate.career_overview.company_history[0]?.position}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">CTC</p>
                                                    <p className="font-semibold">
                                                        {formatCTC(selectedCandidate.basic_information.current_ctc)} | {formatCTC(selectedCandidate.basic_information.expected_ctc)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Notice</p>
                                                    <p className="font-semibold">{selectedCandidate.basic_information.notice_period || 'Immediate'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Credibility</p>
                                                    <Badge className="text-xs" variant="outline">High</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Work Experience */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Work Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedCandidate.career_overview.company_history.map((job, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{job.position}</h4>
                                                        <p className="text-sm text-gray-600">{job.company_name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">{job.duration_months} months</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(job.start_date).toLocaleDateString()} - {job.is_current ? 'Present' : new Date(job.end_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Footer Actions */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Previous
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Interview
                                                </Button>
                                                <Button size="lg" variant="destructive">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500">Select a candidate to view details</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 