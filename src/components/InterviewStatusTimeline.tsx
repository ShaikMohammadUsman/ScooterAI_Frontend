import React from 'react';
import {
    User,
    Mic,
    Mail,
    Video,
    PlayCircle,
    Eye,
    Trophy,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';

interface InterviewStatusTimelineProps {
    candidate: {
        interview_status: {
            video_interview_attended: boolean;
            audio_interview_attended: boolean;
            video_interview_url: string | null;
            video_email_sent?: boolean; // Make optional
        };
        application_status: boolean | string;
        final_shortlist: boolean;
        call_for_interview: boolean;
    };
}

export default function InterviewStatusTimeline({ candidate }: InterviewStatusTimelineProps) {

    // Individual step completion tracking
    const getStepCompletionStatus = (step: number) => {
        switch (step) {
            case 1: // Profile created
                return 'completed'; // Always completed if we have the candidate
            case 2: // Audio interview attempted
                return candidate.interview_status.audio_interview_attended ? 'completed' : 'pending';
            case 3: // Marked for sending video link
                return candidate.application_status === 'SendVideoLink' ? 'completed' : 'pending';
            case 4: // Video link sent
                return candidate.interview_status.video_email_sent || candidate.interview_status.video_interview_url ? 'completed' : 'pending';
            case 5: // Video attempted
                return candidate.interview_status.video_interview_attended ? 'completed' : 'pending';
            case 6: // Marked for company review
                return candidate.final_shortlist ? 'completed' : 'pending';
            case 7: // Company selected
                return candidate.call_for_interview ? 'completed' : 'pending';
            default:
                return 'pending';
        }
    };

    // Get current active step (next step to be completed)
    const getCurrentStep = () => {
        if (candidate.call_for_interview) return 7;
        if (candidate.final_shortlist) return 6;
        if (candidate.interview_status.video_interview_attended) return 5;
        if (candidate.interview_status.video_email_sent || candidate.interview_status.video_interview_url) return 4;
        if (candidate.application_status === 'SendVideoLink') return 3;
        if (candidate.interview_status.audio_interview_attended) return 2;
        return 1;
    };

    // Check if candidate is rejected
    const isRejected = candidate.application_status === 'Rejected';

    // Get the last completed step for rejected candidates
    const getLastCompletedStep = () => {
        if (candidate.call_for_interview) return 7;
        if (candidate.final_shortlist) return 6;
        if (candidate.interview_status.video_interview_attended) return 5;
        if (candidate.interview_status.video_email_sent || candidate.interview_status.video_interview_url) return 4;
        if (candidate.application_status === 'SendVideoLink') return 3;
        if (candidate.interview_status.audio_interview_attended) return 2;
        return 1;
    };

    const getStepIcon = (step: number) => {
        switch (step) {
            case 1: return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 2: return <Mic className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 3: return <Mail className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 4: return <Video className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 5: return <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 6: return <Eye className="h-4 w-4 sm:h-5 sm:w-5" />;
            case 7: return <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />;
            default: return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
        }
    };

    const getStepLabel = (step: number) => {
        switch (step) {
            case 1: return "Profile";
            case 2: return "Audio";
            case 3: return "Marked";
            case 4: return "Video Sent";
            case 5: return "Video Done";
            case 6: return "Review";
            case 7: return "Selected";
            default: return "Profile";
        }
    };

    const getStepColors = (step: number) => {
        const completionStatus = getStepCompletionStatus(step);
        const currentStep = getCurrentStep();
        const lastCompletedStep = getLastCompletedStep();
        const isCurrent = step === currentStep;
        const isRejectedAtThisStep = isRejected && step === lastCompletedStep;

        switch (completionStatus) {
            case 'completed':
                if (isRejectedAtThisStep) {
                    return {
                        circle: 'bg-red-600 text-white',
                        icon: 'text-white',
                        label: 'text-red-800 font-medium',
                        border: 'border-red-200'
                    };
                }
                return {
                    circle: 'bg-green-600 text-white',
                    icon: 'text-white',
                    label: 'text-green-800 font-medium',
                    border: 'border-green-200'
                };
            case 'pending':
                if (isCurrent) {
                    return {
                        circle: 'bg-yellow-500 text-white',
                        icon: 'text-white',
                        label: 'text-yellow-800 font-medium',
                        border: 'border-yellow-200'
                    };
                } else {
                    return {
                        circle: 'bg-gray-200 text-gray-600',
                        icon: 'text-gray-600',
                        label: 'text-gray-500',
                        border: 'border-gray-200'
                    };
                }
            default:
                return {
                    circle: 'bg-gray-200 text-gray-600',
                    icon: 'text-gray-600',
                    label: 'text-gray-500',
                    border: 'border-gray-200'
                };
        }
    };

    const currentStep = getCurrentStep();
    const lastCompletedStep = getLastCompletedStep();

    return (
        <div className="w-full">
            {/* Timeline Container */}
            <div className="relative">
                {/* Horizontal Line */}
                <div className="absolute top-6 sm:top-8 left-0 right-0 h-1 bg-gray-300 z-0"></div>

                {/* Steps */}
                <div className="relative z-10 flex justify-between items-start gap-2 sm:gap-4 lg:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                        const colors = getStepColors(step);
                        const completionStatus = getStepCompletionStatus(step);
                        const isCurrent = step === currentStep;
                        const isCompleted = completionStatus === 'completed';
                        const isRejectedAtThisStep = isRejected && step === lastCompletedStep;
                        const showNudgeForAudio = candidate.application_status === 'NudgeForAudio' && step === 2;
                        const showNudgeForVideo = candidate.application_status === 'NudgeForVideo' && step === 4;
                        const showNudge = showNudgeForAudio || showNudgeForVideo;

                        return (
                            <div key={step} className="flex flex-col items-center relative flex-1 min-w-0">
                                {/* Nudge Indicators */}
                                {showNudge && (
                                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 z-20">
                                        <div className="text-xs sm:text-sm text-orange-600 font-medium bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 whitespace-nowrap shadow-sm">
                                            {showNudgeForAudio ? 'Nudge for audio' : 'Nudge for video'}
                                        </div>
                                        <div className="w-0.5 h-3 sm:h-4 bg-orange-300 mx-auto"></div>
                                    </div>
                                )}

                                {/* Rejection Indicator */}
                                {isRejectedAtThisStep && (
                                    <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 z-20">
                                        <div className="text-xs sm:text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200 whitespace-nowrap shadow-sm">
                                            Rejected
                                        </div>
                                        <div className="w-0.5 h-3 sm:h-4 bg-red-300 mx-auto"></div>
                                    </div>
                                )}

                                {/* Step Circle */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-3 border-white shadow-lg ${colors.circle} mb-2 sm:mb-3 ${showNudge ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white' : ''} ${isRejectedAtThisStep ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-white' : ''}`}>
                                    {isRejectedAtThisStep ? (
                                        <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    ) : isCompleted ? (
                                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    ) : isCurrent ? (
                                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    ) : (
                                        getStepIcon(step)
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="text-center w-full px-1 sm:px-2">
                                    <p className={`text-xs sm:text-sm leading-tight ${colors.label} break-words font-medium`}>
                                        {getStepLabel(step)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
