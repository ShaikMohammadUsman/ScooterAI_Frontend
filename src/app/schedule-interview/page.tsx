"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ScooterHeader from "@/components/ScooterHeader";

const buildSlots = (startHour: number, endHour: number) => {
    const slots: string[] = [];
    for (let h = startHour; h < endHour; h++) {
        slots.push(`${h.toString().padStart(2, "0")}:00`);
        slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
};

export default function ScheduleInterviewPage() {
    const router = useRouter();
    const params = useSearchParams();
    const jobId = params.get("jobId") || "";
    const profileId = params.get("profileId") || "";
    const role = params.get("role") || "";
    const name = params.get("name") || "";
    const location = params.get("location") || "";
    const exp = params.get("exp") || "";
    const expected = params.get("expected") || "";
    const relocation = params.get("relocation") === "1";

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().substring(0, 10);
    });
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

    const slots = useMemo(() => buildSlots(9, 18), []); // 9:00 to 17:30

    const toggleSlot = (slot: string) => {
        setSelectedSlots((prev) =>
            prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
        );
    };

    const handleSubmit = () => {
        // TODO: integrate with backend
        console.log({ jobId, profileId, selectedDate, selectedSlots });
        alert("Availability submitted. Thank you!");
        router.back();
    };

    return (
        <div className="min-h-screen bg-bg-main ">
            <ScooterHeader />
            {/* Header */}
            <div className="max-w-6xl mx-auto p-6">
                <div className="border-b border-gray-300 px-4 sm:px-8  flex items-center justify-between py-8">
                    <div className="text-sm">
                        <div className="font-bold text-text-primary">Vacancy</div>
                        <div className="text-text-primary">{role || "-"}</div>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => router.push(`/candidate-portfolio/${jobId}`)}
                    >
                        View Open Roles
                    </Button>
                </div>

                {/* Candidate summary header like portfolio */}
                <div className="px-4 sm:px-8 py-4 border-b border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold">Applicant Name:</span> {name || "-"}</div>
                            <div><span className="font-semibold">Location:</span> {location || "-"}</div>
                            <div><span className="font-semibold">Work Experience:</span> {exp || "-"}</div>
                            <div><span className="font-semibold">Expected CTC:</span> {expected ? `${expected} Lacs` : "-"}</div>
                            {relocation && (
                                <div>
                                    <span className="inline-block bg-element-4 text-green-800 text-xs font-medium rounded px-2 py-1">Open To Relocation</span>
                                </div>
                            )}
                            <div>
                                <Button
                                    variant="secondary"
                                    onClick={() => router.push(`/candidate-portfolio/${jobId}?profileId=${profileId}`)}
                                    className="mt-4 border-1"
                                >
                                    View Report
                                </Button>
                            </div>
                        </div>
                        {/* <div className="flex items-center justify-end">
                            <Button variant="secondary" onClick={() => router.back()}>Back</Button>
                        </div> */}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calendar (simple date input placeholder for now) */}
                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-text-primary mb-2">Pick Date</div>
                        <input
                            type="date"
                            className="border rounded-md px-3 py-2"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    {/* Slots */}
                    <div>
                        <div className="text-sm font-medium text-text-primary mb-2">Available Slots (30 min)</div>
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-auto border rounded-md p-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => toggleSlot(slot)}
                                    className={`px-3 py-2 rounded-full border text-sm ${selectedSlots.includes(slot) ? "bg-cta-primary text-white border-cta-outline" : "bg-white text-text-primary"}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pb-6 flex justify-center">
                    <Button variant="primary" onClick={handleSubmit} disabled={selectedSlots.length === 0}>
                        Submit Availability
                    </Button>
                </div>
            </div>
        </div>
    );
}


