"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isAccessTokenValid, getStoredManagerAuth, JobAggregate, getMyManagerProfile, ManagerProfileResponse, ManagerProfileJob, getInterviews, Interview } from "@/lib/managerService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import ActiveRolesCard from "@/components/manager/ActiveRolesCard";
import ClosedRolesCard from "@/components/manager/ClosedRolesCard";
import ScheduledInterviewCard from "@/components/manager/ScheduledInterviewCard";
import {
    Briefcase,
    Calendar,
    Building,
    PlusIcon,
    User,
    Mail,
    BriefcaseBusiness,
} from "lucide-react";

export default function ManagerDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [managerProfile, setManagerProfile] = useState<ManagerProfileResponse | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
    const manager = getStoredManagerAuth();

    useEffect(() => {
        // Check authentication status on mount
        if (!isAccessTokenValid()) {
            router.replace("/manager/login");
            return;
        }
        fetchData();
    }, [router]);

    // Convert ManagerProfileJob to JobAggregate format
    const convertToJobAggregate = (profileJob: ManagerProfileJob): JobAggregate => {
        return {
            basicInfo: profileJob.basicInfo,
            experienceSkills: profileJob.experienceSkills ? {
                minExp: profileJob.experienceSkills.minExp,
                maxExp: profileJob.experienceSkills.maxExp,
                skillsRequired: profileJob.experienceSkills.skillsRequired || null,
                workLocation: profileJob.experienceSkills.workLocation || null,
                location: profileJob.experienceSkills.location || null,
                timeZone: profileJob.experienceSkills.timeZone || null
            } : null,
            compensations: profileJob.compensations ? {
                baseSalary: {
                    currency: profileJob.compensations.baseSalary.currency,
                    minSalary: profileJob.compensations.baseSalary.minSalary,
                    maxSalary: profileJob.compensations.baseSalary.maxSalary,
                    cadence: profileJob.compensations.baseSalary.cadence || null
                },
                ote: profileJob.compensations.ote || null,
                equityOffered: profileJob.compensations.equityOffered || null,
                opportunities: profileJob.compensations.opportunities || null,
                keyChallenged: profileJob.compensations.keyChallenged || null,
                laguages: profileJob.compensations.laguages || null
            } : null,
            isCompleted: profileJob.isCompleted,
            created_at: profileJob.created_at,
            is_active: profileJob.is_active,
            created_by: profileJob.created_by,
            job_id: profileJob.job_id,
            total_candidates: profileJob.total_candidates,
            audio_attended_count: profileJob.audio_attended_count,
            video_attended_count: profileJob.video_attended_count,
            moved_to_video_round_count: profileJob.moved_to_video_round_count
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch manager profile and interviews
            const [profileRes, interviewsRes] = await Promise.all([
                getMyManagerProfile(),
                getInterviews()
            ]);

            if (profileRes.status) {
                setManagerProfile(profileRes);
            } else {
                console.error("Failed to fetch manager profile:", profileRes.message);
                setError("Failed to fetch manager profile");
            }

            if (interviewsRes.status) {
                setInterviews(interviewsRes.data);
            } else {
                console.error("Failed to fetch interviews:", interviewsRes.message);
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleShareJob = async (jobId: string) => {
        try {
            const jobUrl = `${window.location.origin}/home/careers/${jobId}`;
            await navigator.clipboard.writeText(jobUrl);
            setCopiedJobId(jobId);
            setTimeout(() => setCopiedJobId(null), 2000);
        } catch (err) {
            console.error('Failed to copy job link:', err);
        }
    };

    // Don't render anything if not authenticated (will redirect)
    if (!isAccessTokenValid()) {
        return null;
    }

    const openJobs = useMemo(() => {
        if (managerProfile?.data?.jobs) {
            return managerProfile.data.jobs
                .filter(j => j.is_active === true)
                .map(convertToJobAggregate);
        }
        return [];
    }, [managerProfile]);

    const closedJobs = useMemo(() => {
        if (managerProfile?.data?.jobs) {
            return managerProfile.data.jobs
                .filter(j => j.is_active === false)
                .map(convertToJobAggregate);
        }
        return [];
    }, [managerProfile]);

    // Use real interviews data from API
    const scheduledInterviews = interviews;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Section */}
            <Card className="border-0 mb-8 bg-bg-main shadow-none">
                <CardContent className="p-8 py-10">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6 text-text-primary">
                            Welcome Back {managerProfile?.data?.first_name || manager?.data?.first_name || 'Manager'}!
                        </h2>

                        {/* Profile Picture */}
                        <div className="w-24 h-24 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="h-12 w-12 text-purple-600" />
                        </div>

                        {/* Name */}
                        <h3 className="text-xl font-semibold mb-6 text-text-primary">
                            {managerProfile?.data?.first_name} {managerProfile?.data?.last_name}
                        </h3>

                        {/* Contact Information */}
                        <div className="space-y-3">

                            <div className="flex items-center justify-center gap-3">
                                <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-text-primary">
                                    Hiring Manager
                                </span>
                            </div>

                            {managerProfile?.data?.email && (
                                <div className="flex items-center justify-center gap-3">
                                    <Mail className="h-5 w-5 text-[#FFCC00]" />
                                    <span className="text-sm text-text-primary">
                                        {managerProfile.data.email}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3">
                                <Calendar className="h-5 w-5 text-muted" />
                                <span className="text-sm text-text-primary">
                                    Member since {new Date(managerProfile?.data?.profile_created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Active Roles Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="active-roles">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <BriefcaseBusiness className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Active Roles ({openJobs.length})
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-grad-1)' }}></div>
                                    <p className="text-text-primary">Loading active roles...</p>
                                </div>
                            ) : openJobs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                        <Briefcase className="h-8 w-8 text-text-primary" />
                                    </div>
                                    <p className="text-text-primary mb-4">No active roles found. Create your first job posting!</p>
                                    <Button
                                        className="mt-4"
                                        style={{
                                            backgroundColor: 'var(--color-cta-primary)',
                                            color: 'var(--color-cta-primary-text)'
                                        }}
                                        onClick={() => router.push('/manager/create-job')}
                                    >
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Create New Job
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {openJobs.map((job) => (
                                        <ActiveRolesCard
                                            key={job.job_id}
                                            job={job}
                                            copiedJobId={copiedJobId}
                                            onShareJob={handleShareJob}
                                            showCounts={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>

            {/* Closed Roles Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="closed-roles">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <Building className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Closed Roles ({closedJobs.length})
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-grad-1)' }}></div>
                                    <p className="text-text-primary">Loading closed roles...</p>
                                </div>
                            ) : closedJobs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                        <Building className="h-8 w-8 text-text-primary" />
                                    </div>
                                    <p className="text-text-primary">No closed roles found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {closedJobs.map((job) => (
                                        <ClosedRolesCard
                                            key={job.job_id}
                                            job={job}
                                            showCounts={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>

            {/* Scheduled Interviews Accordion */}
            <Card className="shadow-none border-0 mb-8 bg-bg-main">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="scheduled-interviews">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline data-[state=closed]:bg-element-3 data-[state=open]:bg-gradient-to-r data-[state=open]:from-grad-1 data-[state=open]:to-grad-2 data-[state=open]:text-white data-[state=closed]:text-text-primary">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold">
                                    Scheduled Interviews ({scheduledInterviews.length})
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 py-6">
                            {scheduledInterviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: 'var(--color-element-1)' }}>
                                        <Calendar className="h-8 w-8 text-text-primary" />
                                    </div>
                                    <p className="text-text-primary">No scheduled interviews found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {scheduledInterviews.map((interview) => (
                                        <ScheduledInterviewCard
                                            key={interview.interviewId}
                                            interview={interview}
                                        />
                                    ))}
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
        </div>
    );
}


