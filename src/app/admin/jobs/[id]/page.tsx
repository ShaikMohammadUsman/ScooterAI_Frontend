"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllJobs, Job, isSuperAdminAccessTokenValid } from "@/lib/superAdminService";
import { ArrowLeft, Building2, MapPin, Calendar, Users, Briefcase, Clock, TrendingUp } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";

export default function AdminJobDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication
        if (!isSuperAdminAccessTokenValid()) {
            router.replace("/admin/login");
            return;
        }

        const fetchJobDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAllJobs(1, 100); // Get all jobs to find the specific one
                const foundJob = response.jobs.find(j => j.job_id === jobId);

                if (foundJob) {
                    setJob(foundJob);
                } else {
                    setError("Job not found");
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId, router]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatSalary = (baseSalary: any) => {
        if (!baseSalary || Object.keys(baseSalary).length === 0) return 'Not specified';

        const { currency, minSalary, maxSalary, cadence } = baseSalary;
        if (!minSalary || !maxSalary) return 'Not specified';

        return `${currency}${minSalary.toLocaleString()} - ${currency}${maxSalary.toLocaleString()} ${cadence}`;
    };

    const getExperienceText = () => {
        if (job?.min_experience === '' && job?.max_experience === '') return 'Not specified';
        if (job?.min_experience === job?.max_experience) return `${job?.min_experience} years`;
        return `${job?.min_experience} - ${job?.max_experience} years`;
    };

    const handleViewCandidates = () => {
        router.push(`/admin/jobs/${jobId}/candidates`);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorBox message={error} />;
    }

    if (!job) {
        return <ErrorBox message="Job not found" />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {job.job_title}
                            </h1>
                            <p className="text-lg text-gray-600">
                                {job.company_name} • {job.role_type}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleViewCandidates}
                                className="bg-cta-primary hover:bg-cta-primary/90 text-cta-primary-text"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                See All Candidates
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Overview */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Job Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Primary Focus</h4>
                                        <p className="text-gray-600">
                                            {job.primary_focus.length > 0 ? job.primary_focus.join(', ') : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Sales Process</h4>
                                        <p className="text-gray-600">
                                            {job.sales_process_stages.length > 0 ? job.sales_process_stages.join(', ') : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Experience Required</h4>
                                        <p className="text-gray-600">{getExperienceText()}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Salary Range</h4>
                                        <p className="text-gray-600">{formatSalary(job.base_salary)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Required */}
                        {job.skills_required.length > 0 && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Skills Required
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills_required.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="bg-element-3 text-indigo-700">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Work Details */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Work Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Work Location</h4>
                                        <p className="text-gray-600 capitalize">
                                            {job.work_location || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Locations</h4>
                                        <p className="text-gray-600">
                                            {job.locations.length > 0 ? job.locations.join(', ') : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Time Zones</h4>
                                        <p className="text-gray-600">
                                            {job.time_zones.length > 0 ? job.time_zones.join(', ') : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                                        <p className="text-gray-600">
                                            {job.languages.length > 0 ? job.languages.join(', ') : 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Opportunities */}
                        {job.opportunities.length > 0 && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Opportunities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {job.opportunities.map((opportunity, index) => (
                                            <Badge key={index} variant="outline" className="bg-green-100 text-green-800">
                                                {opportunity}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* OTE Information */}
                        {job.ote.length > 0 && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        OTE (On-Target Earnings)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {job.ote.map((ote, index) => (
                                            <p key={index} className="text-gray-600">{ote}</p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Job Information */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Job Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {job.company_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {job.role_type} • {job.work_location || 'Location not specified'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Posted: {formatDate(job.created_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                            Job ID: {job.job_id}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hiring Manager */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Hiring Manager
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <Users className="h-8 w-8 text-gray-500" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        {job.hiring_manager.first_name} {job.hiring_manager.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">Hiring Manager</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handleViewCandidates}
                                    className="w-full bg-cta-primary hover:bg-cta-primary/90 text-cta-primary-text"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    View All Candidates
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
