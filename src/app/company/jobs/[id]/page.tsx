"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJobCandidates, Candidate, CandidatesResponse, updateApplicationStatus } from '@/lib/adminService';
import { toast } from 'sonner';
import { FaArrowLeft, FaFilter, FaCheckCircle, FaTimesCircle, FaMicrophone, FaVideo, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { use } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function JobCandidatesPage({ params }: PageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [jobDetails, setJobDetails] = useState<CandidatesResponse['job_details'] | null>(null);
    const resolvedParams = use(params);
    const jobId = resolvedParams.id;
    const [filters, setFilters] = useState({
        audioPassed: false,
        videoAttended: false,
        audioUploaded: false,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchCandidates();
    }, [jobId, filters]);

    const fetchCandidates = async () => {
        try {
            const response = await getJobCandidates(
                jobId,
                1, // page
                20, // pageSize
                filters.audioPassed || undefined,
                filters.videoAttended || undefined,
                filters.audioUploaded || undefined
            );
            setCandidates(response.candidates);
            setJobDetails(response.job_details);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.basic_information.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        // ||
        // (candidate.basic_information?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getCommunicationChartData = (scores: any) => {
        return [
            { subject: 'Content & Thought', A: scores.content_and_thought.score },
            { subject: 'Verbal Delivery', A: scores.verbal_delivery.score },
            { subject: 'Non-Verbal', A: scores.non_verbal.score },
            { subject: 'Presence & Authenticity', A: scores.presence_and_authenticity.score }
        ];
    };

    const handleApplicationStatus = async (candidateId: string, status: boolean, reason: string) => {
        setUpdatingStatus(candidateId);
        try {
            const response = await updateApplicationStatus({
                user_id: candidateId,
                application_status: status,
                reason: reason
            });

            if (response.status || response?.user_id) {
                toast.success(status ? 'Candidate approved successfully' : 'Candidate rejected successfully');
                // Refresh the candidates list
                fetchCandidates();
            } else {
                toast.error(response.message || 'Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error('Failed to update application status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {jobDetails?.title || 'Job Candidates'}
                            </h1>
                            {jobDetails?.description && (
                                <p className="text-gray-600 mt-1">{jobDetails.description}</p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Back to Jobs
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant={filters.audioPassed ? "default" : "outline"}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    audioPassed: !prev.audioPassed
                                }))}
                            >
                                Audio Passed
                            </Button>
                            {/* <Button
                                variant={filters.videoAttended ? "default" : "outline"}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    videoAttended: !prev.videoAttended
                                }))}
                            >
                                Video Attended
                            </Button>
                            <Button
                                variant={filters.audioUploaded ? "default" : "outline"}
                                onClick={() => setFilters(prev => ({
                                    ...prev,
                                    audioUploaded: !prev.audioUploaded
                                }))}
                            >
                                Audio Uploaded
                            </Button> */}
                        </div>
                    </div>
                </Card>

                {/* Candidates List */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.profile_id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {candidate.basic_information.full_name}
                                    </h3>
                                    {/* <p className="text-gray-600 mt-2">
                                        {candidate.basic_information.email}
                                    </p> */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            {candidate.career_overview.total_years_experience} years exp
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">
                                            {candidate.career_overview.years_sales_experience} years sales
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {candidate.interview_status.audio_interview_passed && (
                                        <span className="flex items-center gap-2 p-2 text-green-600 bg-green-50 rounded-full">
                                            <FaMicrophone /> <FaCheck />
                                        </span>
                                    )}
                                    {candidate.interview_status.video_interview_attended && (
                                        <span className="flex items-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-full">
                                            <FaVideo /> <FaCheck />
                                        </span>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedCandidate(candidate)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {candidate.basic_information.languages_spoken?.map((lang, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                                        >
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {candidate.interview_status.resume_url && (
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2"
                                            onClick={() => {
                                                if (candidate.interview_status.resume_url) {
                                                    window.open(candidate.interview_status.resume_url, '_blank');
                                                }
                                            }}
                                        >
                                            View Resume
                                        </Button>
                                    )}
                                    {typeof candidate.application_status === 'string' ? (
                                        <>
                                            <Button
                                                className="flex items-center gap-2"
                                                onClick={() => handleApplicationStatus(
                                                    candidate.profile_id,
                                                    true,
                                                    'Candidate passed all interview rounds'
                                                )}
                                                disabled={updatingStatus === candidate.profile_id}
                                            >
                                                <FaCheckCircle />
                                                {updatingStatus === candidate.profile_id ? 'Updating...' : 'Approve'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex items-center gap-2"
                                                onClick={() => handleApplicationStatus(
                                                    candidate.profile_id,
                                                    false,
                                                    'Candidate did not meet requirements'
                                                )}
                                                disabled={updatingStatus === candidate.profile_id}
                                            >
                                                <FaTimesCircle />
                                                {updatingStatus === candidate.profile_id ? 'Updating...' : 'Reject'}
                                            </Button>
                                        </>
                                    ) : candidate.application_status ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                                                <FaCheckCircle />
                                                <span>Accepted</span>
                                            </div>

                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                                                <FaCheckCircle />
                                                <span>{candidate.application_status_reason}</span>
                                            </div>
                                        </div>

                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-md">
                                                <FaTimesCircle />
                                                <span>Rejected</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-md">
                                                <FaTimesCircle />
                                                <span>{candidate.application_status_reason}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Candidate Details Modal */}
                {selectedCandidate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {selectedCandidate.basic_information.full_name}
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            {selectedCandidate.basic_information.current_location}
                                        </p>
                                        {selectedCandidate.basic_information.languages_spoken && selectedCandidate.basic_information.languages_spoken.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {selectedCandidate.basic_information.languages_spoken.map((lang: string, index: number) => (
                                                    <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Current CTC:</span>
                                            <span className="px-2 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                                {selectedCandidate.basic_information.current_ctc?.value ?
                                                    `${selectedCandidate.basic_information.current_ctc.currencyType} ${selectedCandidate.basic_information.current_ctc.value.toLocaleString()}` :
                                                    'Not specified'}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedCandidate(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>

                                {/* Career Overview */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Overview</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Experience</p>
                                            <p className="text-lg font-semibold">{selectedCandidate.career_overview.total_years_experience} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Sales Experience</p>
                                            <p className="text-lg font-semibold">{selectedCandidate.career_overview.years_sales_experience} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Avg. Tenure</p>
                                            <p className="text-lg font-semibold">{selectedCandidate.career_overview.average_tenure_per_role} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Notice Period</p>
                                            <p className="text-lg font-semibold">
                                                {selectedCandidate.basic_information.notice_period || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Company History */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Company History</h4>
                                    <div className="space-y-3">
                                        {selectedCandidate.career_overview.company_history.map((company, index: number) => (
                                            <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{company.position}</h5>
                                                    <p className="text-gray-600">{company.company_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(company.start_date).toLocaleDateString()} - {company.is_current ? 'Present' : (company.end_date ? new Date(company.end_date).toLocaleDateString() : 'Not specified')}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{company.duration_months} months</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{selectedCandidate.basic_information.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium">{selectedCandidate.basic_information.phone_number}</p>
                                        </div>
                                        {selectedCandidate.basic_information.linkedin_url && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">LinkedIn</p>
                                                <a
                                                    href={selectedCandidate.basic_information.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                                >
                                                    View Profile <FaExternalLinkAlt className="text-sm" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    {selectedCandidate.interview_status.video_interview_url && (
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate.interview_status.video_interview_url) {
                                                    window.open(selectedCandidate.interview_status.video_interview_url, '_blank');
                                                }
                                            }}
                                        >
                                            <FaVideo className="mr-2" />
                                            Watch Video Interview
                                        </Button>
                                    )}
                                    {selectedCandidate.interview_status.audio_interview_url && (
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate.interview_status.audio_interview_url) {
                                                    window.open(selectedCandidate.interview_status.audio_interview_url, '_blank');
                                                }
                                            }}
                                        >
                                            <FaMicrophone className="mr-2" />
                                            Listen to Audio Interview
                                        </Button>
                                    )}
                                    {selectedCandidate.interview_status.resume_url && (
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate.interview_status.resume_url) {
                                                    window.open(selectedCandidate.interview_status.resume_url, '_blank');
                                                }
                                            }}
                                        >
                                            View Resume
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                )}
            </div>
        </div>
    );
} 