"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJobCandidates, Candidate, CandidatesResponse } from '@/lib/adminService';
import { toast } from 'sonner';
import { FaArrowLeft, FaFilter, FaCheckCircle, FaTimesCircle, FaMicrophone, FaVideo, FaCheck } from 'react-icons/fa';
import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function JobCandidatesPage({ params }: PageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobDetails, setJobDetails] = useState<CandidatesResponse['job_details'] | null>(null);
    const resolvedParams = use(params);
    const jobId = resolvedParams.id;
    const [filters, setFilters] = useState({
        audioPassed: false,
        videoAttended: false,
        audioUploaded: false,
    });
    const [searchTerm, setSearchTerm] = useState('');

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
                            <Button
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
                            </Button>
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
                                    {candidate.interview_status.video_attended && (
                                        <span className="flex items-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-full">
                                            <FaVideo /> <FaCheck />
                                        </span>
                                    )}
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
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => {/* Handle view resume */ }}
                                    >
                                        View Resume
                                    </Button>
                                    <Button
                                        className="flex items-center gap-2"
                                        onClick={() => {/* Handle approve */ }}
                                    >
                                        <FaCheckCircle />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                        onClick={() => {/* Handle reject */ }}
                                    >
                                        <FaTimesCircle />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                )}
            </div>
        </div>
    );
} 