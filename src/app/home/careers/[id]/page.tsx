"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getJobById, Job, JobDetailsResponse } from "@/lib/userService";
import { applyJob } from "@/lib/candidateService";
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
    TrendingUp,
    User
} from "lucide-react";

export default function JobDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);

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
                const response = await getJobById(jobId);
                if (response.status && response.job) {
                    setJob(response.job);
                } else {
                    setError(response.message || "Failed to fetch job details");
                }
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

    const handleApply = async () => {
        if (!job) return;

        setApplying(true);
        setApplyError(null);
        try {
            const response = await applyJob({ job_id: job.job_id });
            if (response?.status) {
                toast({
                    title: "Application Submitted",
                    description: "Your application has been submitted successfully!",
                    variant: "default"
                });
                // Redirect to profile page to complete the application
                router.push(`/candidate/dashboard`);
            } else {
                setApplyError(response?.message || 'Failed to apply for job');
            }
        } catch (err: any) {
            setApplyError(err?.response?.data?.message || err?.message || 'Failed to apply for job');
        } finally {
            setApplying(false);
        }
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
                                {job.job_title}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    <span>{job.company_name}</span>
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
                            className="h-12 px-8 text-lg font-semibold"
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
                                    <Briefcase className="h-5 w-5" style={{ color: 'var(--color-grad-1)' }} />
                                    <span style={{ color: 'var(--color-text-primary)' }}>Job Description</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        {/* Role Type */}
                                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <Briefcase className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                </div>
                                                <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Role Type</h4>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.role_type}</p>
                                        </div>

                                        {/* Experience Required */}
                                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <Clock className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                </div>
                                                <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Experience Required</h4>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.min_experience} - {job.max_experience} years</p>
                                        </div>

                                        {/* Base Salary */}
                                        {job.base_salary && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Base Salary</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                    {job.base_salary.currency}{job.base_salary.minSalary.toLocaleString()} - {job.base_salary.currency}{job.base_salary.maxSalary.toLocaleString()} {job.base_salary.cadence}
                                                </p>
                                            </div>
                                        )}

                                        {/* Work Location */}
                                        {job.work_location && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Work Location</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.work_location}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {/* Primary Focus */}
                                        {job.primary_focus && job.primary_focus.length > 0 && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <Users className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Primary Focus</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.primary_focus.join(', ')}</p>
                                            </div>
                                        )}

                                        {/* Sales Process Stages */}
                                        {job.sales_process_stages && job.sales_process_stages.length > 0 && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Sales Process</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.sales_process_stages.join(', ')}</p>
                                            </div>
                                        )}

                                        {/* Locations */}
                                        {job.locations && job.locations.length > 0 && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Locations</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.locations.join(', ')}</p>
                                            </div>
                                        )}

                                        {/* Time Zones */}
                                        {job.time_zones && job.time_zones.length > 0 && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                        <Clock className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                    </div>
                                                    <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Time Zones</h4>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{job.time_zones.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information Row */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Languages */}
                                    {job.languages && job.languages.length > 0 && (
                                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <Users className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                </div>
                                                <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Languages</h4>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{job.languages.join(', ')}</p>
                                        </div>
                                    )}

                                    {/* Opportunities */}
                                    {job.opportunities && job.opportunities.length > 0 && (
                                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                </div>
                                                <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Opportunities</h4>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{job.opportunities.join(', ')}</p>
                                        </div>
                                    )}

                                    {/* OTE */}
                                    {job.ote && job.ote.length > 0 && (
                                        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-3)' }}>
                                                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-text-primary)' }} />
                                                </div>
                                                <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>OTE</h4>
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{job.ote.join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & Requirements */}
                        {(job.primary_focus?.length > 0 || job.sales_process_stages?.length > 0 || job.skills_required?.length > 0) && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-grad-2)' }} />
                                        <span style={{ color: 'var(--color-text-primary)' }}>Skills & Requirements</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Primary Focus Skills */}
                                        {job.primary_focus && job.primary_focus.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Primary Focus</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.primary_focus.map((focus, index) => (
                                                        <Badge
                                                            key={`focus-${index}`}
                                                            className="px-3 py-1 text-sm font-medium border"
                                                            style={{
                                                                backgroundColor: 'var(--color-bg-main)',
                                                                color: 'var(--color-text-primary)',
                                                                borderColor: 'var(--color-element-3)'
                                                            }}
                                                        >
                                                            {focus}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sales Process Skills */}
                                        {job.sales_process_stages && job.sales_process_stages.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Sales Process</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.sales_process_stages.map((stage, index) => (
                                                        <Badge
                                                            key={`stage-${index}`}
                                                            className="px-3 py-1 text-sm font-medium border"
                                                            style={{
                                                                backgroundColor: 'var(--color-bg-main)',
                                                                color: 'var(--color-text-primary)',
                                                                borderColor: 'var(--color-element-3)'
                                                            }}
                                                        >
                                                            {stage}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Required Skills */}
                                        {job.skills_required && job.skills_required.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Required Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.skills_required.map((skill, index) => (
                                                        <Badge
                                                            key={`skill-${index}`}
                                                            className="px-3 py-1 text-sm font-medium border"
                                                            style={{
                                                                backgroundColor: 'var(--color-bg-main)',
                                                                color: 'var(--color-text-primary)',
                                                                borderColor: 'var(--color-element-3)'
                                                            }}
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Role Type */}
                                        {job.role_type && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Role Type</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge
                                                        className="px-3 py-1 text-sm font-medium border"
                                                        style={{
                                                            backgroundColor: 'var(--color-bg-main)',
                                                            color: 'var(--color-text-primary)',
                                                            borderColor: 'var(--color-element-3)'
                                                        }}
                                                    >
                                                        {job.role_type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Apply Now Button */}
                        <Card className="shadow-lg border-0" style={{ backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-element-3)' }}>
                            <CardContent className="p-6">
                                <div className="text-center space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                            Ready to Apply?
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
                                            Click below to apply for this position
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="w-full h-12 text-base font-semibold text-white border-0"
                                        style={{
                                            backgroundColor: 'var(--color-cta-primary)',
                                            color: 'var(--color-cta-primary-text)'
                                        }}
                                    >
                                        {applying ? "Applying..." : "Apply Now"}
                                    </Button>
                                    {applyError && (
                                        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}>
                                            <p className="text-sm text-center">{applyError}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
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
                                        {job.company_name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {job.role_type} • {job.work_location || 'Location not specified'}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    {job.work_location && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-gray-700">{job.work_location}</span>
                                        </div>
                                    )}

                                    {job.hiring_manager && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-gray-700">
                                                Hiring Manager: {job.hiring_manager.first_name} {job.hiring_manager.last_name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-gray-700">Posted {formatDate(job.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
} 