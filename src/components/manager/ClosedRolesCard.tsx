"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobAggregate } from "@/lib/managerService";

interface ClosedRolesCardProps {
    job: JobAggregate;
    counts?: {
        candidates: number;
        shortlisted: number;
        interviewed: number;
    };
    showCounts?: boolean;
}

export default function ClosedRolesCard({ job, counts, showCounts = true }: ClosedRolesCardProps) {
    const router = useRouter();
    const { basicInfo, job_id } = job;
    const location = job.experienceSkills?.workLocation && job.experienceSkills?.location?.length
        ? `${job.experienceSkills.workLocation}, ${job.experienceSkills.location[0]}`
        : '—';

    return (
        <Card className="p-6 bg-bg-secondary-4">
            <div className="flex items-start justify-between">
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
            <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" onClick={() => router.push(`/manager/insights?job_id=${job_id}`)}>
                    Hiring Insights
                </Button>
                <Button className="bg-green-800 hover:bg-green-900" onClick={() => router.push(`/manager/jobs/${job_id}/candidates?jobId=${job_id}`)}>
                    View Candidates
                </Button>
            </div>
        </Card>
    );
}
