"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ScooterHeader from "@/components/ScooterHeader";
import DateCalendar from "@/components/schedule/DateCalendar";
import SlotsPicker from "@/components/schedule/SlotsPicker";
import { scheduleInterview } from "@/lib/managerService";
import { toast } from "@/hooks/use-toast";

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

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slots = useMemo(() => buildSlots(9, 18), []); // 9:00 to 17:30

    const toggleSlot = (slot: string) => {
        setSelectedSlots((prev) =>
            prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
        );
    };

    const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleSubmit = async () => {
        if (selectedSlots.length === 0) {
            setError("Please select at least one time slot");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const dateStr = formatLocalDate(selectedDate);

            // Convert slots to the required format (e.g., "10:00" -> "10:00-10:30")
            const formattedSlots = selectedSlots.map(slot => {
                const [hours, minutes] = slot.split(':');
                const startTime = `${hours}:${minutes}`;
                const endMinutes = minutes === '00' ? '30' : '00';
                const endHours = minutes === '30' ? String(parseInt(hours) + 1).padStart(2, '0') : hours;
                return `${startTime}-${endHours}:${endMinutes}`;
            });

            const response = await scheduleInterview({
                applicantName: name,
                interviewerName: "Interviewer", // TODO: Get from user context or form
                jobId,
                profileId,
                selectedDate: dateStr,
                selectedSlots: formattedSlots
            });

            if (response.status) {
                toast({
                    title: "Success!",
                    description: response.message || "Interview scheduled successfully",
                });
                setShowConfirm(true);
            } else {
                setError(response.message || "Failed to schedule interview. Please try again.");
            }
        } catch (err: any) {
            console.error("Schedule interview error:", err);
            setError(err.response?.data?.message || "Failed to schedule interview. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Calendar helpers
    const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const addMonths = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth() + n, 1);
    const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const isBeforeToday = (d: Date) => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        const dd = new Date(d);
        dd.setHours(0, 0, 0, 0);
        return dd < t;
    };
    const getCalendarDays = (month: Date) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const startWeekday = (start.getDay() + 6) % 7; // make Monday=0
        const days: Date[] = [];
        // leading blanks (prev month days)
        for (let i = 0; i < startWeekday; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() - (startWeekday - i));
            days.push(d);
        }
        // current month days
        for (let d = 1; d <= end.getDate(); d++) {
            days.push(new Date(month.getFullYear(), month.getMonth(), d));
        }
        // trailing to fill 6 rows * 7 columns = 42
        while (days.length % 7 !== 0 || days.length < 42) {
            const last = days[days.length - 1];
            const next = new Date(last);
            next.setDate(last.getDate() + 1);
            days.push(next);
        }
        return days;
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
                    {/* Custom Calendar */}
                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-text-primary mb-2">Pick Date</div>
                        <DateCalendar
                            currentMonth={currentMonth}
                            onMonthChange={setCurrentMonth}
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            heightPx={420}
                        />
                    </div>

                    {/* Slots */}
                    <div>
                        <div className="text-sm font-medium text-text-primary mb-2">Available Slots (30 min)</div>
                        <SlotsPicker
                            slots={slots}
                            selected={selectedSlots}
                            onToggle={toggleSlot}
                            heightPx={420}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md max-w-6xl mx-auto">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="pb-6 flex justify-center">
                    <Button variant="primary" onClick={handleSubmit} disabled={selectedSlots.length === 0 || submitting}>
                        {submitting ? "Scheduling..." : "Submit Availability"}
                    </Button>
                </div>
            </div>
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-md bg-bg-secondary-4">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-center">The Interview Has Been Scheduled</DialogTitle>
                        <DialogDescription className="text-center">Your availability has been recorded.</DialogDescription>
                    </DialogHeader>
                    {/* <div className="text-center space-y-2 py-2">
                        <div className="text-sm"><span className="font-semibold">Date:</span> {formatLocalDate(selectedDate)}</div>
                        <div className="text-sm">
                            <span className="font-semibold">Selected Slots:</span> {selectedSlots.length > 0 ? selectedSlots.sort().join(', ') : 'None'}
                        </div>
                    </div> */}
                    <DialogFooter className="flex flex-wrap gap-4 justify-around items-center">
                        <Button variant="primary" className="text-sm" onClick={() => router.push(`/candidate-portfolio/${jobId}`)}>
                            View Shortlisted Candidates
                        </Button>
                        <Button variant="secondary" className="text-sm" onClick={() => router.push(`/manager/jobs/${jobId}`)}>
                            Continue To Browse Candidates
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


