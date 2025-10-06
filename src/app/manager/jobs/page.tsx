"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyJobRoles, getMyJobCandidates, JobAggregate, getStoredManagerAuth } from "@/lib/managerService";
import { PlusIcon, Share2, Check } from 'lucide-react';

export default function JobsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<JobAggregate[]>([]);
    const [searchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
    const [countsByJob, setCountsByJob] = useState<Record<string, { candidates: number; shortlisted: number; interviewed: number }>>({});
    const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
    const manager = getStoredManagerAuth();

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getMyJobRoles();
                setJobs(res?.data || []);
            } catch (e: any) {
                setError(e?.message || 'Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const loadCounts = async () => {
            const map: Record<string, { candidates: number; shortlisted: number; interviewed: number }> = {};
            for (const j of jobs) {
                try {
                    const r = await getMyJobCandidates(j.job_id, 1, 1);
                    map[j.job_id] = {
                        candidates: r?.job_details?.candidate_count || 0,
                        shortlisted: r?.job_details?.moved_to_video_round_count || 0,
                        interviewed: r?.job_details?.video_attended_count || 0,
                    };
                } catch {
                    map[j.job_id] = { candidates: 0, shortlisted: 0, interviewed: 0 };
                }
            }
            setCountsByJob(map);
        };
        if (jobs.length) loadCounts();
    }, [jobs]);

    const openJobs = useMemo(() => jobs.filter(j => j.is_active === true), [jobs]);
    const closedJobs = useMemo(() => jobs.filter(j => j.is_active === false), [jobs]);

    const handleShareJob = async (jobId: string) => {
        try {
            const jobUrl = `${window.location.origin}/home/careers/${jobId}`;
            await navigator.clipboard.writeText(jobUrl);
            setCopiedJobId(jobId);
            setTimeout(() => setCopiedJobId(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy job link:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-xl sm:text-2xl text-center font-bold italic text-accent-foreground">
                        Welcome Back!<br />
                        <span className="text-gray-600 font-normal">{manager?.data?.first_name || 'there'}</span>
                    </h1>
                    <div className="mt-4">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'open' | 'closed')}>
                            <TabsList className="w-full justify-start bg-transparent p-0 h-auto border-b border-muted rounded-none">
                                <TabsTrigger value="open" className="rounded-none w-full data-[state=active]:border-b-2 data-[state=active]:border-purple-400 data-[state=active]:text-gray-900 text-gray-500 px-3 py-2 cursor-pointer">Open Roles</TabsTrigger>
                                <TabsTrigger value="closed" className="rounded-none w-full data-[state=active]:border-b-2 data-[state=active]:border-purple-400 data-[state=active]:text-gray-900 text-gray-500 px-3 py-2 cursor-pointer">Closed Roles</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {activeTab === 'open' ? (
                    openJobs.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-lg font-semibold mb-2">Tired of sifting through bad resumes?</p>
                            <p className="text-gray-600 mb-8">Let's find you salespeople who can really sell</p>
                            <div className="flex flex-col items-center gap-4">
                                <Button variant="primary" className="h-12 w-12 rounded-full font-bold  px-0 py-0 p-5 sm:px-0" onClick={() => router.push('/manager/create-job')}><PlusIcon className="w-8 h-8 font-bold" color='white' /></Button>
                                <p className="text-green-900 font-medium">Find My First Candidate</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {openJobs.map((job) => {
                                const { basicInfo, job_id } = job;
                                const counts = countsByJob[job_id] || { candidates: 0, shortlisted: 0, interviewed: 0 };
                                const location = job.experienceSkills?.workLocation && job.experienceSkills?.location?.length ? `${job.experienceSkills.workLocation}, ${job.experienceSkills.location[0]}` : '—';
                                return (
                                    <Card key={job_id} className="p-6 bg-bg-secondary-4">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{basicInfo.jobTitle}</h3>
                                                <p className="text-sm text-gray-600">{location}</p>
                                            </div>
                                            <div className="flex gap-8">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Candidates</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.candidates}</div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Shortlisted</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.shortlisted}</div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Interviewed</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.interviewed}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-around sm:justify-end flex-wrap gap-3">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleShareJob(job_id)}
                                                className="flex items-center gap-2"
                                            >
                                                {copiedJobId === job_id ? (
                                                    <>
                                                        <Check className="h-4 w-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 className="h-4 w-4" />
                                                        Share
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="secondary" onClick={() => router.push(`/manager/insights?job_id=${job_id}`)}>Hiring Insights</Button>
                                            <Button variant="primary" onClick={() => router.push(`/manager/jobs/${job_id}`)}>View Candidates</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )
                ) : (
                    closedJobs.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-600">No closed roles to display yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {closedJobs.map((job) => {
                                const { basicInfo, job_id } = job;
                                const counts = countsByJob[job_id] || { candidates: 0, shortlisted: 0, interviewed: 0 };
                                const location = job.experienceSkills?.workLocation && job.experienceSkills?.location?.length ? `${job.experienceSkills.workLocation}, ${job.experienceSkills.location[0]}` : '—';
                                return (
                                    <Card key={job_id} className="p-6 bg-bg-secondary-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{basicInfo.jobTitle}</h3>
                                                <p className="text-sm text-gray-600">{location}</p>
                                            </div>
                                            <div className="flex gap-8">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Candidates</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.candidates}</div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Shortlisted</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.shortlisted}</div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">Interviewed</p>
                                                    <div className="mt-2 text-xs bg-element-3 text-indigo-700 px-2 py-0.5 rounded">{counts.interviewed}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <Button variant="outline" onClick={() => router.push(`/manager/insights?job_id=${job_id}`)}>Hiring Insights</Button>
                                            <Button className="bg-green-800 hover:bg-green-900" onClick={() => router.push(`/manager/jobs/${job_id}/candidates?jobId=${job_id}`)}>View Candidates</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}