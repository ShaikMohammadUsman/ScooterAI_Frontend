"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/lib/adminService";
import { getFitLabel } from "./audioScore";

export default function RejectedApplicantCard({ candidate, jobId }: { candidate: Candidate; jobId: string }) {
    const name = candidate.basic_information?.full_name || "Unknown";
    const location = candidate.basic_information?.current_location || "-";
    return (
        <div className="rounded-2xl bg-gray-100 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
                <div className="font-semibold text-text-primary">{name}</div>
                <div className="text-sm text-text-secondary">{location}</div>
                <div className={`mt-2 inline-block text-xs font-medium rounded px-2 py-1 ${getFitLabel(candidate).className}`}>{getFitLabel(candidate).label}</div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-green-900 text-white text-xs">Application Status: Rejected</div>
                <Button
                    variant="primary"
                    className="rounded-full"
                    onClick={() => {
                        const customEvent = new CustomEvent('openCandidateDetails', { detail: { profileId: candidate.profile_id } });
                        window.dispatchEvent(customEvent);
                    }}
                >
                    View Report
                </Button>
            </div>
        </div>
    );
}


