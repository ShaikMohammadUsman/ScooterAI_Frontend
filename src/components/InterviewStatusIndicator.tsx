import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mic,
    Mail,
    Video,
    PlayCircle,
    Eye,
    Trophy,
    Bell,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

interface InterviewStatusIndicatorProps {
    candidate: {
        profile_id: string;
        profile_created_at: string;
        interview_status: {
            audio_interview_passed: boolean;
            video_interview_attended: boolean;
            audio_interview_attended: boolean;
            video_interview_url: string | null;
            audio_interview_url: string | null;
        };
        application_status: boolean | string;
        final_shortlist: boolean;
        call_for_interview: boolean;
    };
    onNudgeAudio?: (profileId: string) => void;
    onNudgeVideo?: (profileId: string) => void;
}

interface StepStatus {
    step: number;
    label: string;
    icon: React.ReactNode;
    isCompleted: boolean;
    isActive: boolean;
    isNudgeAvailable: boolean;
    nudgeAction?: () => void;
}

export default function InterviewStatusIndicator({
    candidate,
    onNudgeAudio,
    onNudgeVideo
}: InterviewStatusIndicatorProps) {

    const getStepStatus = (): StepStatus[] => {
        const now = new Date();
        const profileCreated = new Date(candidate.profile_created_at);

        return [
            {
                step: 1,
                label: "Profile Created",
                icon: <User className="h-5 w-5" />,
                isCompleted: true, // Always completed if we have the candidate
                isActive: false,
                isNudgeAvailable: false
            },
            {
                step: 2,
                label: "Audio Interview Attempted",
                icon: <Mic className="h-5 w-5" />,
                isCompleted: candidate.interview_status.audio_interview_attended,
                isActive: candidate.interview_status.audio_interview_attended && !candidate.interview_status.audio_interview_passed,
                isNudgeAvailable: !candidate.interview_status.audio_interview_attended,
                nudgeAction: () => onNudgeAudio?.(candidate.profile_id)
            },
            {
                step: 3,
                label: "Marked for Video Link",
                icon: <Mail className="h-5 w-5" />,
                isCompleted: candidate.interview_status.audio_interview_passed,
                isActive: candidate.interview_status.audio_interview_passed && !candidate.interview_status.video_interview_attended,
                isNudgeAvailable: false
            },
            {
                step: 4,
                label: "Video Link Sent",
                icon: <Video className="h-5 w-5" />,
                isCompleted: candidate.interview_status.video_interview_url !== null,
                isActive: candidate.interview_status.video_interview_url !== null && !candidate.interview_status.video_interview_attended,
                isNudgeAvailable: candidate.interview_status.video_interview_url !== null && !candidate.interview_status.video_interview_attended,
                nudgeAction: () => onNudgeVideo?.(candidate.profile_id)
            },
            {
                step: 5,
                label: "Video Attempted",
                icon: <PlayCircle className="h-5 w-5" />,
                isCompleted: candidate.interview_status.video_interview_attended,
                isActive: candidate.interview_status.video_interview_attended && !candidate.final_shortlist,
                isNudgeAvailable: false
            },
            {
                step: 6,
                label: "Marked for Review",
                icon: <Eye className="h-5 w-5" />,
                isCompleted: candidate.final_shortlist,
                isActive: candidate.final_shortlist && !candidate.call_for_interview,
                isNudgeAvailable: false
            },
            {
                step: 7,
                label: "Hired",
                icon: <Trophy className="h-5 w-5" />,
                isCompleted: candidate.call_for_interview,
                isActive: false,
                isNudgeAvailable: false
            }
        ];
    };

    const steps = getStepStatus();
    const currentStep = steps.findIndex(step => step.isActive) + 1;
    const completedSteps = steps.filter(step => step.isCompleted).length;

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-lg">Interview Process Status</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            Step {currentStep || completedSteps} of 7
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                            {completedSteps}/7 Completed
                        </Badge>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedSteps / 7) * 100}%` }}
                    />
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.step} className="relative">
                            {/* Step Row */}
                            <div className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${step.isCompleted
                                    ? 'bg-green-50 border border-green-200'
                                    : step.isActive
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-50 border border-gray-200'
                                }`}>
                                {/* Step Icon */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${step.isCompleted
                                        ? 'bg-green-500 text-white'
                                        : step.isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                    }`}>
                                    {step.isCompleted ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : step.isActive ? (
                                        <Clock className="h-5 w-5" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className={`font-medium ${step.isCompleted
                                                    ? 'text-green-800'
                                                    : step.isActive
                                                        ? 'text-blue-800'
                                                        : 'text-gray-600'
                                                }`}>
                                                Step {step.step}: {step.label}
                                            </h4>
                                            <p className={`text-sm ${step.isCompleted
                                                    ? 'text-green-600'
                                                    : step.isActive
                                                        ? 'text-blue-600'
                                                        : 'text-gray-500'
                                                }`}>
                                                {step.isCompleted
                                                    ? 'Completed'
                                                    : step.isActive
                                                        ? 'In Progress'
                                                        : 'Pending'
                                                }
                                            </p>
                                        </div>

                                        {/* Nudge Button */}
                                        {step.isNudgeAvailable && step.nudgeAction && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={step.nudgeAction}
                                                className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                                            >
                                                <Bell className="h-4 w-4" />
                                                Nudge
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Connection Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-5 top-12 w-0.5 h-4 bg-gray-300" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Nudge Actions Summary */}
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Available Actions
                    </h4>
                    <div className="flex gap-2">
                        {steps.find(s => s.step === 2)?.isNudgeAvailable && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onNudgeAudio?.(candidate.profile_id)}
                                className="text-orange-600 border-orange-300 hover:bg-orange-100"
                            >
                                <Mic className="h-4 w-4 mr-2" />
                                Nudge for Audio Interview
                            </Button>
                        )}
                        {steps.find(s => s.step === 4)?.isNudgeAvailable && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onNudgeVideo?.(candidate.profile_id)}
                                className="text-orange-600 border-orange-300 hover:bg-orange-100"
                            >
                                <Video className="h-4 w-4 mr-2" />
                                Nudge for Video Interview
                            </Button>
                        )}
                        {!steps.find(s => s.step === 2)?.isNudgeAvailable &&
                            !steps.find(s => s.step === 4)?.isNudgeAvailable && (
                                <p className="text-sm text-orange-600">
                                    No nudge actions available at this time
                                </p>
                            )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
