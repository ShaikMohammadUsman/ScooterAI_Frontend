"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { JobAggregate } from "@/lib/managerService";

interface ActiveRolesCardProps {
    job: JobAggregate;
    counts?: {
        candidates: number;
        shortlisted: number;
        interviewed: number;
    };
    copiedJobId: string | null;
    onShareJob: (jobId: string) => void;
    showCounts?: boolean;
}

export default function ActiveRolesCard({
    job,
    counts,
    copiedJobId,
    onShareJob,
    showCounts = true
}: ActiveRolesCardProps) {
    const router = useRouter();
    const { basicInfo, job_id } = job;
    const location = job.experienceSkills?.workLocation && job.experienceSkills?.location?.length
        ? `${job.experienceSkills.workLocation}, ${job.experienceSkills.location[0]}`
        : '—';

    return (
        <Card className="p-6 bg-bg-secondary-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{basicInfo.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{location}</p>
                </div>
                {showCounts && counts && (
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
                )}
            </div>
            <div className="mt-4 flex items-center justify-around sm:justify-end flex-wrap gap-3">
                <Button
                    variant="secondary"
                    onClick={() => onShareJob(job_id)}
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
                <Button variant="secondary" onClick={() => router.push(`/manager/insights?job_id=${job_id}`)}>
                    Hiring Insights
                </Button>
                <Button variant="primary" onClick={() => router.push(`/manager/jobs/${job_id}`)}>
                    View Candidates
                </Button>
            </div>
        </Card>
    );
}
