"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getJobCandidates } from '@/lib/adminService';
import { toast } from 'sonner';
import { FaArrowLeft, FaFilter, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function JobCandidatesPage({ params }: PageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);
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
    }, [jobId]);

    const fetchCandidates = async () => {
        try {
            const response = await getJobCandidates(jobId);
            setCandidates(response.candidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-900">
                            Job Candidates
                        </h1>
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
                        <Card key={candidate._id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                                    <p className="text-gray-600 mt-2">{candidate.email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${candidate.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : candidate.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {candidate.skills.map((skill: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Applied {new Date(candidate.applied_at).toLocaleDateString()}
                                </span>
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