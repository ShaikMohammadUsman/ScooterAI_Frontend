"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/lib/adminService";
import { getFitLabel } from "./audioScore";
import { useRouter } from "next/navigation";

export default function SeenApplicantCard({ candidate, jobId, roleTitle }: { candidate: Candidate; jobId: string; roleTitle?: string }) {
    const router = useRouter();
    const name = candidate.basic_information?.full_name || "Unknown";
    const location = candidate.basic_information?.current_location || "-";
    const getExp = () => {
        const total = (candidate as any)?.career_overview?.total_years_experience || 0;
        const years = Math.floor(total);
        const months = Math.round((total - years) * 12);
        return `${years} years ${months} months`;
    };
    const getCtcValue = (ctc: any): number | null => {
        if (!ctc && ctc !== 0) return null;
        if (typeof ctc === 'number') return ctc / 100000;
        if (typeof ctc?.value === 'number') return ctc.value / 100000;
        return null;
    };
    return (
        <div className="rounded-2xl bg-gray-100 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
                <div className="font-semibold text-text-primary">{name}</div>
                <div className="text-sm text-text-secondary">{location}</div>
                <div className={`mt-2 inline-block text-xs font-medium rounded px-2 py-1 ${getFitLabel(candidate).className}`}>{getFitLabel(candidate).label}</div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <Button variant="secondary" className="rounded-full" disabled>
                    See Them Sell
                </Button>
                <Button
                    variant="primary"
                    className="rounded-full"
                    onClick={() => {
                        const role = encodeURIComponent(roleTitle || (candidate as any)?.applied_role || "");
                        const nm = encodeURIComponent(name);
                        const loc = encodeURIComponent(location);
                        const exp = encodeURIComponent(getExp());
                        const expected = getCtcValue((candidate as any)?.basic_information?.expected_ctc);
                        const rel = (candidate as any)?.basic_information?.open_to_relocation ? 1 : 0;
                        const url = `/schedule-interview?jobId=${jobId}&profileId=${candidate.profile_id}&role=${role}&name=${nm}&location=${loc}&exp=${exp}&expected=${expected ?? ""}&relocation=${rel}`;
                        router.push(url);
                    }}
                >
                    Schedule Interview
                </Button>
                <Button
                    variant="secondary"
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


