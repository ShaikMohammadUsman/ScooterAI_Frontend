"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getCompanyJobRoles, addJobRole, JobRole } from '@/lib/adminService';
import { toast } from "@/hooks/use-toast";
import { FaPlus, FaBriefcase, FaUsers, FaCheckCircle, FaSearch } from 'react-icons/fa';
import AddJobModal from '@/components/AddJobModal';
import { Badge } from "@/components/ui/badge";
import { FaMicrophone, FaVideo, FaArrowUp } from 'react-icons/fa';

const salesTypes = [
    "Consultative Sales",
    "Channel Sales",
    "Direct Sales",
    "Inside Sales",
    "Outside Sales",
    "Technical Sales"
];

const industries = [
    "Healthcare",
    "Textiles",
    "Technology",
    "Manufacturing",
    "Finance",
    "Retail"
];

const regions = [
    "New Jersey",
    "New York",
    "California",
    "Texas",
    "Florida",
    "Illinois"
];

const salesRoleTypes = [
    "Executive",
    "Manager",
    "Representative",
    "Specialist",
    "Consultant"
];

const positionLevels = [
    "Entry",
    "Mid",
    "Senior",
    "Lead",
    "Manager"
];

const crmTools = [
    "Salesforce.com",
    "HubSpot",
    "Microsoft Dynamics",
    "Zoho CRM",
    "Pipedrive"
];

export default function JobsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddJob, setShowAddJob] = useState(false);

    useEffect(() => {
        const companyId = localStorage.getItem('company_id');
        if (!companyId) {
            router.push('/company');
            return;
        }
        fetchJobs(companyId);
    }, []);

    const fetchJobs = async (companyId: string) => {
        try {
            const response = await getCompanyJobRoles(companyId);
            setJobRoles(response.roles);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast({
                title: "Error",
                description: "Failed to fetch jobs",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    const filteredJobs = jobRoles.filter(job =>
        job.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm?.toLowerCase())
    );

    // Analytics calculations
    const totalCandidates = jobRoles.reduce((acc, job) => acc + (job.total_candidates || 0), 0);
    const totalAudioAttended = jobRoles.reduce((acc, job) => acc + (job.audio_attended_count || 0), 0);
    const totalVideoAttended = jobRoles.reduce((acc, job) => acc + (job.video_attended_count || 0), 0);
    const totalMovedToVideo = jobRoles.reduce((acc, job) => acc + (job.moved_to_video_round_count || 0), 0);
    const audioConversionRate = totalCandidates > 0 ? ((totalAudioAttended / totalCandidates) * 100).toFixed(1) : '0';
    const videoConversionRate = totalAudioAttended > 0 ? ((totalVideoAttended / totalAudioAttended) * 100).toFixed(1) : '0';
    const overallConversionRate = totalCandidates > 0 ? ((totalMovedToVideo / totalCandidates) * 100).toFixed(1) : '0';

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
                        fetchJobs(companyId);
                    }
                }}
            />
        </div>
    );
} 