"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { getFitLabel } from "./audioScore";
import { ManagerCandidate } from "@/lib/managerService";

export interface CandidateCardProps {
    candidate: ManagerCandidate;
    jobId: string;
}

// Fit label via shared util

export default function NewApplicantCard({ candidate, jobId }: CandidateCardProps) {
    const fit = getFitLabel(candidate);
    const name = candidate.basic_information?.full_name || "Unknown";
    const location = candidate.basic_information?.current_location || "-";
    return (
        <div className="w-full rounded-2xl bg-gray-100 p-5 text-center h-full flex flex-col items-center">
            <div className="text-lg font-bold text-text-primary">{name}</div>
            <div className="text-text-primary">{location}</div>
            {/* <div className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded ${fit.className}`}>{fit.label}</div> */}

            <div className="mt-6 w-full flex justify-center">
                <Button variant="secondary" className="rounded-full" disabled>
                    See Them Sell
                </Button>
            </div>

            <div className="mt-6 w-full flex justify-center">
                <Button
                    variant="primary"
                    onClick={() => {
                        // Open details modal on the jobs page instead of navigating
                        const customEvent = new CustomEvent('openCandidateDetails', { detail: { applicationId: candidate.application_id } });
                        window.dispatchEvent(customEvent);
                    }}
                >
                    View Report
                </Button>
            </div>
        </div>
    );
}


