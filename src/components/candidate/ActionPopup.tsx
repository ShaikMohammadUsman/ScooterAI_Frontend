"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mic,
    Video,
    X,
    PlayCircle,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ApplicationHistory } from "@/lib/candidateService";

interface ActionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    application: ApplicationHistory | null;
}

export default function ActionPopup({ isOpen, onClose, application }: ActionPopupProps) {
    const router = useRouter();

    if (!application) return null;

    const getActionDetails = () => {
        // Check for audio interaction action needed
        if (!application.audio_interview_status && application.application_status !== 'Rejected') {
            return {
                type: 'audio',
                title: 'Complete Audio Interaction',
                description: 'You have an audio interaction pending for this position. Complete it to move forward.',
                icon: <Mic className="h-6 w-6" />,
                buttonText: 'Start Audio Interaction',
                route: `/interview/general?application_id=${application.application_id}`
            };
        }

        // Check for video interaction action needed
        if (application.video_email_sent && !application.video_interview_start && application.application_status !== 'Rejected') {
            return {
                type: 'video',
                title: 'Complete Video Interaction',
                description: 'You have a video interaction scheduled for this position. Join now to proceed.',
                icon: <Video className="h-6 w-6" />,
                buttonText: 'Start Video Interaction',
                route: `/interview/communication?application_id=${application.application_id}`
            };
        }

        return null;
    };

    const actionDetails = getActionDetails();

    if (!actionDetails) {
        return null;
    }

    const handleActionClick = () => {
        router.push(actionDetails.route);
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-element-3 to-grad-1 rounded flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-text-primary">Action Required</span>
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-center">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                            style={{ backgroundColor: 'var(--color-element-1)' }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-element-2)' }}
                            >
                                {actionDetails.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary">
                            {application.job_role_name}
                        </h3>
                        <p className="text-sm text-text-primary mt-1">
                            {actionDetails.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <Badge
                            className="px-3 py-1 text-xs font-medium border-0 bg-element-2 text-white"
                        >
                            {actionDetails.type === 'audio' ? 'Audio Interaction' : 'Video Interaction'}
                        </Badge>
                        <Badge
                            className="px-3 py-1 text-xs font-medium border-0 bg-destructive text-destructive-foreground"
                        >
                            Urgent
                        </Badge>
                    </div>

                    <div className="flex gap-3 justify-center items-center">
                        <Button
                            onClick={handleActionClick}
                            variant="primary"
                            className=""
                        >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            {actionDetails.buttonText}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className=""
                        >
                            Remind Me Later
                        </Button>
                    </div>

                    <div className="text-xs text-text-primary text-center">
                        Complete this interaction to continue with your application
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
