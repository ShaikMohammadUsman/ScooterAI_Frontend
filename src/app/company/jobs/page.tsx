"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { fetchJobRoles } from '@/features/jobRoles/jobRolesSlice';
import {
    selectJobRoles,
    selectJobRolesLoading,
    selectJobRolesHasLoaded,
    selectTotalCandidates,
    selectTotalAudioAttended,
    selectTotalVideoAttended,
    selectTotalMovedToVideo,
    selectAudioConversionRate,
    selectVideoConversionRate,
    selectOverallConversionRate
} from '@/features/jobRoles/selectors';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlus } from 'react-icons/fa';
import AddJobModal from '@/components/AddJobModal';
import { Badge } from "@/components/ui/badge";


export default function JobsPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const jobRoles = useSelector(selectJobRoles);
    const loading = useSelector(selectJobRolesLoading);
    const hasLoaded = useSelector(selectJobRolesHasLoaded);
    const totalCandidates = useSelector(selectTotalCandidates);
    const totalAudioAttended = useSelector(selectTotalAudioAttended);
    const totalVideoAttended = useSelector(selectTotalVideoAttended);
    const totalMovedToVideo = useSelector(selectTotalMovedToVideo);
    const audioConversionRate = useSelector(selectAudioConversionRate);
    const videoConversionRate = useSelector(selectVideoConversionRate);
    const overallConversionRate = useSelector(selectOverallConversionRate);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddJob, setShowAddJob] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        if (!companyId) {
            router.push('/company');
            return;
        }
        // Only fetch if not loading and not already loaded
        if (!loading && !hasLoaded) {
            dispatch(fetchJobRoles(companyId));
        }
    }, [dispatch, loading, hasLoaded, router]);

    const filteredJobs = jobRoles.filter(job =>
        job.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm?.toLowerCase())
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
                            Job Roles
                        </h1>
                        <Button
                            onClick={() => setShowAddJob(true)}
                            className="flex items-center gap-2"
                        >
                            <FaPlus />
                            Add New Job
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-blue-100">Total Jobs</span>
                            <span className="text-2xl font-bold">{jobRoles.length}</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-green-100">Active Jobs</span>
                            <span className="text-2xl font-bold">{jobRoles.filter(j => j.is_active).length}</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-blue-100">Total Candidates</span>
                            <span className="text-2xl font-bold">{totalCandidates}</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-green-400 to-green-500 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-green-100">Audio Attended</span>
                            <span className="text-2xl font-bold">{totalAudioAttended}</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-purple-100">Video Attended</span>
                            <span className="text-2xl font-bold">{totalVideoAttended}</span>
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-orange-100">Final Round</span>
                            <span className="text-2xl font-bold">{totalMovedToVideo}</span>
                        </div>
                    </Card>
                </div>
                {/* Conversion Rates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-4 flex flex-col items-center">
                        <span className="text-xs text-gray-500">Audio Conversion Rate</span>
                        <Badge variant={parseFloat(audioConversionRate) > 50 ? "default" : "secondary"} className="mt-1 text-lg">{audioConversionRate}%</Badge>
                    </Card>
                    <Card className="p-4 flex flex-col items-center">
                        <span className="text-xs text-gray-500">Video Conversion Rate</span>
                        <Badge variant={parseFloat(videoConversionRate) > 30 ? "default" : "secondary"} className="mt-1 text-lg">{videoConversionRate}%</Badge>
                    </Card>
                    <Card className="p-4 flex flex-col items-center">
                        <span className="text-xs text-gray-500">Overall Conversion Rate</span>
                        <Badge variant={parseFloat(overallConversionRate) > 10 ? "default" : "secondary"} className="mt-1 text-lg">{overallConversionRate}%</Badge>
                    </Card>
                </div>

                {/* Job List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => {
                        const audioRate = job.total_candidates > 0 ? ((job.audio_attended_count / job.total_candidates) * 100).toFixed(1) : '0';
                        const videoRate = job.audio_attended_count > 0 ? ((job.video_attended_count / job.audio_attended_count) * 100).toFixed(1) : '0';
                        const overallRate = job.total_candidates > 0 ? ((job.moved_to_video_round_count / job.total_candidates) * 100).toFixed(1) : '0';
                        return (
                            <Card key={job._id} className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {job.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {job.badges?.map((badge: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4 mb-4 border-2 border-gray-200 rounded-lg p-2">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500">Candidates</span>
                                        <span className="font-bold text-blue-700">{job.total_candidates}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500">Audio Attended</span>
                                        <span className="font-bold text-green-700">{job.audio_attended_count}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500">Video Attended</span>
                                        <span className="font-bold text-purple-700">{job.video_attended_count}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500">Final Round</span>
                                        <span className="font-bold text-orange-700">{job.moved_to_video_round_count}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <Badge variant={parseFloat(audioRate) > 50 ? "default" : "secondary"}>
                                        Audio: {audioRate}%
                                    </Badge>
                                    <Badge variant={parseFloat(videoRate) > 30 ? "default" : "secondary"}>
                                        Video: {videoRate}%
                                    </Badge>
                                    <Badge variant={parseFloat(overallRate) > 10 ? "default" : "secondary"}>
                                        Overall: {overallRate}%
                                    </Badge>
                                </div>
                                <div className="flex flex-1 grow-1 items-center justify-between mt-2 p-2 mt-auto">
                                    <span className="text-sm text-gray-500">
                                        Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/company/jobs/${job._id}`)}
                                    >
                                        View Candidates
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No jobs found</p>
                    </div>
                )}
            </div>

            {/* Add Job Modal */}
            <AddJobModal
                isOpen={showAddJob}
                onClose={() => setShowAddJob(false)}
                onSuccess={() => {
                    const companyId = localStorage.getItem('company_id');
                    if (companyId) {
                        dispatch(fetchJobRoles(companyId));
                    }
                }}
            />
        </div>
    );
} 