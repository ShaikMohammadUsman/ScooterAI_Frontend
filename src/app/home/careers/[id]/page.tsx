"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getJobById, Job } from "@/lib/userService";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import ErrorBox from "@/components/ui/error";
import {
    Building2,
    MapPin,
    Calendar,
    Mail,
    Phone,
    ArrowLeft,
    Briefcase,
    Clock,
    Users,
    TrendingUp
} from "lucide-react";

export default function JobDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const jobId = params.id as string;

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!jobId) {
                setError("Job ID is required");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const jobData = await getJobById(jobId);
                setJob(jobData);
            } catch (err: any) {
                console.error("Error fetching job details:", err);
                setError(err.message || "Failed to fetch job details");
                toast({
                    title: "Error",
                    description: err.message || "Failed to fetch job details",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    const handleApply = () => {
        if (!job) return;

        // Navigate to resume upload with job context
        router.push(`/resume?job_id=${job.job_id}&role=${encodeURIComponent(job.title)}`);
    };

    const handleBack = () => {
        router.push('/home/careers');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-muted-foreground">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
                <div className="max-w-md mx-auto">
                    <ErrorBox message={error || "Job not found"} />
                    <Button onClick={handleBack} className="mt-4 w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80 mt-20">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="mb-4 hover:bg-background/80"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        See all Jobs
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    <span>{job.company.company_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Posted {formatDate(job.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleApply}
                            size="lg"
                            className="h-12 px-8 text-lg font-semibold bg-primary hover:bg-primary/90"
                        >
                            <Briefcase className="mr-2 h-5 w-5" />
                            Apply Now
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Description */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Job Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {job.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Requirements */}
                        {job.badges && job.badges.length > 0 && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Skills & Requirements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {job.badges.map((badge, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                            >
                                                {badge}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Company Information */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Company Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {job.company.company_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {job.company.description}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-gray-700">{job.company.address}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`mailto:${job.company.email}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {job.company.email}
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`tel:${job.company.contact_number}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {job.company.contact_number}
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Apply */}
                        <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <CardContent className="p-6">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                        <Briefcase className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                            Ready to Apply?
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upload your resume and start your application process
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleApply}
                                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                                    >
                                        Start Application
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 