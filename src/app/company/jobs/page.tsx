"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getCompanyJobRoles, addJobRole, JobRole } from '@/lib/adminService';
import { toast } from 'sonner';
import { FaPlus, FaBriefcase, FaUsers, FaCheckCircle, FaSearch } from 'react-icons/fa';
import AddJobModal from '@/components/AddJobModal';

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
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };


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
                {/* Search and Stats */}
                <div className="mb-8">
                    {/* <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-indigo-100">
                                    <FaBriefcase className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Total Jobs</h2>
                                    <p className="text-3xl font-bold text-indigo-600">{jobRoles?.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100">
                                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
                                    <p className="text-3xl font-bold text-green-600">
                                        {jobRoles?.filter(job => job.is_active)?.length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100">
                                    <FaUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Total Applications</h2>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {jobRoles?.reduce((acc, job) => acc + (job.total_applications || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Job List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <Card key={job._id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                    <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {job.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
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
                            <div className="mt-4 flex items-center justify-between">
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
                    ))}
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