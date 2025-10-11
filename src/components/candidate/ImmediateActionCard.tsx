"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mic,
    Video,
    Clock,
    AlertCircle,
    PlayCircle,
    CheckCircle,
    Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ApplicationHistory } from "@/lib/candidateService";

interface ImmediateActionCardProps {
    applications: ApplicationHistory[];
}

interface ActionableJob {
    application_id: string;
    job_role_name: string;
    job_id: string;
    actionType: 'audio' | 'video';
    actionText: string;
    actionIcon: React.ReactNode;
    actionButtonText: string;
    actionRoute: string;
    isUrgent: boolean;
}

export default function ImmediateActionCard({ applications }: ImmediateActionCardProps) {
    const router = useRouter();

    // Filter applications that require immediate action
    const getActionableJobs = (): ActionableJob[] => {
        const actionableJobs: ActionableJob[] = [];

        applications.forEach((application) => {
            // Check for audio interview action needed
            if (!application.audio_interview_status && application.application_status !== 'Rejected') {
                actionableJobs.push({
                    application_id: application.application_id,
                    job_role_name: application.job_role_name,
                    job_id: application.job_id,
                    actionType: 'audio',
                    actionText: 'Complete Audio Interview',
                    actionIcon: <Mic className="h-4 w-4" />,
                    actionButtonText: 'Start Audio Interview',
                    actionRoute: `/interview/general?application_id=${application.application_id}`,
                    isUrgent: true
                });
            }

            // Check for video interview action needed
            if (application.video_email_sent && !application.video_interview_start && application.application_status !== 'Rejected') {
                actionableJobs.push({
                    application_id: application.application_id,
                    job_role_name: application.job_role_name,
                    job_id: application.job_id,
                    actionType: 'video',
                    actionText: 'Complete Video Interview',
                    actionIcon: <Video className="h-4 w-4" />,
                    actionButtonText: 'Start Video Interview',
                    actionRoute: `/interview/communication?application_id=${application.application_id}`,
                    isUrgent: true
                });
            }
        });

        return actionableJobs;
    };

    const actionableJobs = getActionableJobs();

    if (actionableJobs.length === 0) {
        return null;
    }

    const handleActionClick = (route: string) => {
        router.push(route);
    };

    return (
        <Card className="shadow-none border-0 mb-8 bg-bg-main">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-text-primary">
                        Immediate Action Required
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {actionableJobs.map((job, index) => (
                        <div
                            key={`${job.application_id}-${job.actionType}`}
                            className="p-4 rounded-lg border-0"
                            style={{ backgroundColor: 'var(--color-element-1)' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--color-element-2)' }}>
                                            {job.actionIcon}
                                        </div>
                                        <span className="font-medium text-text-primary">
                                            {job.job_role_name}
                                        </span>
                                    </div>
                                    <Badge
                                        className="px-3 py-1 text-xs font-medium border-0"
                                        style={job.actionType === 'audio'
                                            ? { backgroundColor: 'var(--color-element-2)', color: 'white' }
                                            : { backgroundColor: 'var(--color-element-4)', color: 'white' }
                                        }
                                    >
                                        {job.actionText}
                                    </Badge>
                                    {job.isUrgent && (
                                        <Badge
                                            className="px-3 py-1 text-xs font-medium border-0"
                                            style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            Urgent
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleActionClick(job.actionRoute)}
                                    className="ml-3 border-0"
                                    style={{
                                        backgroundColor: 'var(--color-cta-primary)',
                                        color: 'var(--color-cta-primary-text)'
                                    }}
                                >
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    {job.actionButtonText}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-sm text-text-primary">
                    <p className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" style={{ color: 'var(--color-grad-1)' }} />
                        Complete these interviews to move forward in the application process
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
