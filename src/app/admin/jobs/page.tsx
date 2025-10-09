"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSuperAdminAccessTokenValid, getSuperAdminData, getAllJobs, Job } from "@/lib/superAdminService";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import JobCard from "@/components/JobCard";

export default function AdminJobsPage() {
    const router = useRouter();
    const adminData = getSuperAdminData();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        // Check authentication status on mount
        if (!isSuperAdminAccessTokenValid()) {
            router.replace("/admin/login");
        } else {
            // Load jobs when authenticated
            loadJobs();
        }
    }, [router]);

    const loadJobs = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await getAllJobs(page, 10);
            setJobs(response.jobs);
            setPagination(response.pagination);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        loadJobs(page);
    };

    const handleJobClick = (jobId: string) => {
        router.push(`/admin/jobs/${jobId}`);
    };

    // Don't render anything if not authenticated (will redirect)
    if (!isSuperAdminAccessTokenValid()) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin/dashboard")}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
                            <p className="text-lg text-gray-600">
                                Manage and view all job postings on the platform
                            </p>
                        </div>
                        <Button
                            onClick={() => loadJobs(currentPage)}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Jobs */}
                    {/* <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Total Jobs</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">All Jobs</span>
                                <span className="font-semibold text-2xl text-blue-600">
                                    {pagination?.total_jobs || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Page</span>
                                <span className="font-semibold">
                                    {jobs.length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Pages</span>
                                <span className="font-semibold">
                                    {pagination?.total_pages || 0}
                                </span>
                            </div>
                        </div>
                    </div> */}

                    {/* Job Types */}
                    {/* <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Job Types</h3>
                        <div className="space-y-3">
                            {(() => {
                                const roleTypes = jobs.reduce((acc: Record<string, number>, job) => {
                                    acc[job.role_type] = (acc[job.role_type] || 0) + 1;
                                    return acc;
                                }, {});

                                return Object.entries(roleTypes).slice(0, 3).map(([type, count]) => (
                                    <div key={type} className="flex justify-between">
                                        <span className="text-gray-600">{type}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div> */}

                    {/* Work Locations */}
                    {/* <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Work Locations</h3>
                        <div className="space-y-3">
                            {(() => {
                                const locations = jobs.reduce((acc: Record<string, number>, job) => {
                                    const location = job.work_location || 'Not specified';
                                    acc[location] = (acc[location] || 0) + 1;
                                    return acc;
                                }, {});

                                return Object.entries(locations).slice(0, 3).map(([location, count]) => (
                                    <div key={location} className="flex justify-between">
                                        <span className="text-gray-600 capitalize">{location}</span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div> */}

                    {/* Recent Jobs */}
                    {/* <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
                        <div className="space-y-3">
                            {jobs.slice(0, 3).map((job, index) => (
                                <div key={job.job_id} className="text-sm">
                                    <div className="font-medium text-gray-900 truncate">
                                        {job.job_title}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {job.company_name} • {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </div>

                {/* Jobs Grid */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Job Listings</h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-col gap-6">
                                {jobs.map((job) => (
                                    <JobCard
                                        key={job.job_id}
                                        job={job}
                                        showApplyButton={false}
                                        onClick={handleJobClick}
                                        className="hover:shadow-lg transition-shadow"
                                    />
                                ))}
                            </div>
                        )}

                        {pagination && (
                            <div className="mt-6">
                                {/* Pagination Info */}
                                <div className="text-sm text-gray-600 text-center mb-4">
                                    Showing {jobs.length} of {pagination.total_jobs} jobs (Page {pagination.current_page} of {pagination.total_pages})
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.has_previous || loading}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(pagination.total_pages - 4, currentPage - 2)) + i;
                                            if (pageNum > pagination.total_pages) return null;

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === currentPage ? "default" : "outline"}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={loading}
                                                    className="w-10 h-10"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.has_next || loading}
                                        className="flex items-center gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
