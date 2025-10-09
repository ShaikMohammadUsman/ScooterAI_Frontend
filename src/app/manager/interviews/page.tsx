"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { getInterviews, Interview, InterviewsListResponse } from "@/lib/managerService";
import { toast } from "@/hooks/use-toast";
import ScheduledInterviewCard from "@/components/manager/ScheduledInterviewCard";

export default function InterviewsPage() {
    const router = useRouter();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const response: InterviewsListResponse = await getInterviews();

            if (response.status) {
                setInterviews(response.data);
            } else {
                setError(response.message || "Failed to fetch interviews");
            }
        } catch (err: any) {
            console.error("Error fetching interviews:", err);
            setError(err.response?.data?.message || "Failed to fetch interviews");
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading interviews...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-600">{error}</p>
                            <Button
                                variant="outline"
                                onClick={fetchInterviews}
                                className="mt-4"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage and view all scheduled interviews
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/manager/jobs')}
                        >
                            Back to Jobs
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {interviews.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews scheduled</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by scheduling interviews for your candidates.
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="primary"
                                onClick={() => router.push('/manager/jobs')}
                            >
                                View Jobs
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {interviews.map((interview) => (
                            <ScheduledInterviewCard
                                key={interview.interviewId}
                                interview={interview}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
