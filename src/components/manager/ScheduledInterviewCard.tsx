"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Building, MapPin } from "lucide-react";
import { Interview } from "@/lib/managerService";

interface ScheduledInterviewCardProps {
    interview: Interview;
}

export default function ScheduledInterviewCard({ interview }: ScheduledInterviewCardProps) {
    const router = useRouter();

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
        const [hours, minutes] = timeSlot.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatCreatedAt = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow bg-bg-secondary-4">
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
    );
}
