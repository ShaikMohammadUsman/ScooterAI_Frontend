"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Building, MapPin } from "lucide-react";
import { getInterviews, Interview, InterviewsListResponse } from "@/lib/managerService";
import { toast } from "@/hooks/use-toast";

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeSlot: string) => {
        return timeSlot.replace('-', ' - ');
    };

    const formatCreatedAt = (createdAt: string) => {
        const date = new Date(createdAt);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            <Card key={interview.interviewId} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {interview.applicantName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Interview with {interview.interviewerName}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="ml-4">
                                            {interview.selectedSlots.length} slot{interview.selectedSlots.length !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">Date:</span>
                                                <span className="ml-2">{formatDate(interview.selectedDate)}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">Time Slots:</span>
                                            </div>
                                            <div className="ml-6 space-y-1">
                                                {interview.selectedSlots.map((slot, index) => (
                                                    <div key={index} className="text-sm text-gray-600">
                                                        {formatTime(slot)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">Job ID:</span>
                                                <span className="ml-2 font-mono text-xs">{interview.jobId}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Building className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">Profile ID:</span>
                                                <span className="ml-2 font-mono text-xs">{interview.profileId}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="font-medium">Scheduled:</span>
                                                <span className="ml-2">{formatCreatedAt(interview.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            variant="secondary"
                                            className="rounded-full"
                                            size="sm"
                                            onClick={() => router.push(`/manager/jobs/${interview.jobId}`)}
                                        >
                                            View Job
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="rounded-full"
                                            size="sm"
                                            onClick={() => router.push(`/candidate-portfolio/${interview.jobId}?profileId=${interview.profileId}`)}
                                        >
                                            View Candidate
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
