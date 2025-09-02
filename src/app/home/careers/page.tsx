'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getAllJobs, Job, JobsResponse } from "@/lib/userService"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import ErrorBox from "@/components/ui/error"
import { ChevronLeft, ChevronRight, Mic, ArrowRight, X } from "lucide-react"

function CareersPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<JobsResponse['pagination'] | null>(null);
    const [showFloatingComponent, setShowFloatingComponent] = useState(false);
    const pageSize = 6; // Number of jobs per page

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage]);

    // Check for scooterUserId in localStorage
    useEffect(() => {
        const scooterUserId = localStorage.getItem('scooterUserId');
        if (scooterUserId) {
            setShowFloatingComponent(true);
        }
    }, []);

    const fetchJobs = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllJobs(page, pageSize);
            setJobs(response.jobs);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || "Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    // Function to get badge color based on badge text
    const getBadgeColor = (badge: string): string => {
        const badgeColors: { [key: string]: string } = {
            'Direct Sales': 'bg-b2b text-primary-foreground',
            'Technology': 'bg-blue-100 text-blue-800',
            'Manager': 'bg-purple-200 text-purple-800',
            'Mid': 'bg-yellow-100 text-yellow-800',
            'Remote Work': 'bg-green-100 text-green-800',
            'Open to Relocation': 'bg-location text-foreground',
            'Entry Level': 'bg-orange-100 text-orange-800',
            'Senior': 'bg-red-100 text-red-800',
            'Full Time': 'bg-indigo-100 text-indigo-800',
            'Part Time': 'bg-pink-100 text-pink-800',
            'Contract': 'bg-cyan-100 text-cyan-800',
            'Internship': 'bg-amber-100 text-amber-800',
        };

        // Default color if no specific match
        return badgeColors[badge] || 'bg-gray-100 text-gray-800';
    };

    if (loading && !jobs.length) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Loading available positions...</p>
                </div>
            </div>
        );
    }

    if (error && !jobs.length) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 px-4">
                    <ErrorBox message={error} />
                    <Button
                        onClick={() => fetchJobs(currentPage)}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background mt-20">
            <main className="container mx-auto px-4 py-12">
                {loading && jobs.length > 0 && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <p className="text-muted-foreground">Loading more positions...</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => (
                        <Card key={job.job_id} className="bg-card shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {job.title}
                                    {job?.is_active === false && (
                                        <Badge variant="destructive">Inactive</Badge>
                                    )}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {job.company.company_name} • {job.company.address}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-foreground line-clamp-3">{job.description}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {job.badges.map((badge, i) => (
                                        <Badge key={i} className={getBadgeColor(badge)}>
                                            {badge}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex flex-col-reverse md:flex-row justify-between items-center">
                                    <Button
                                        className="my-2 px-8 py-2 text-base font-semibold"
                                        onClick={() => router.push(`/resume?role=${encodeURIComponent(job.title)}&job_id=${job.job_id}`)}
                                        disabled={job.is_active === false}
                                        variant={job.is_active === false ? 'secondary' : 'default'}
                                    >
                                        {job.is_active === false ? 'Inactive' : 'Apply Now'}
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {pagination && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={!pagination.has_previous}
                            className="h-10 w-10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous page</span>
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Page {pagination.current_page} of {pagination.total_pages}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                ({pagination.total_jobs} jobs)
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                            disabled={!pagination.has_next}
                            className="h-10 w-10"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next page</span>
                        </Button>
                    </div>
                )}
            </main>

            {/* Floating Component for Users with Audio Session */}
            {showFloatingComponent && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 max-w-sm animate-pulse relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowFloatingComponent(false)}
                            className="absolute -top-2 -right-2 bg-white text-gray-600 hover:text-gray-800 rounded-full p-1 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <Mic className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Have an audio session to continue?</h3>
                                <p className="text-sm text-blue-100">Come on, let's finish what you started!</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push('/resume')}
                            className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                            Continue Application
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CareersPage;