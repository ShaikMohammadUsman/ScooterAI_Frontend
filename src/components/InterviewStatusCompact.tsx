import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
    User,
    Mic,
    Mail,
    Video,
    PlayCircle,
    Eye,
    Trophy,
    CheckCircle,
    Clock
} from 'lucide-react';

interface InterviewStatusCompactProps {
    candidate: {
        interview_status: {
            audio_interview_passed: boolean;
            video_interview_attended: boolean;
            audio_interview_attended: boolean;
            video_interview_url: string | null;
        };
        final_shortlist: boolean;
        call_for_interview: boolean;
    };
    showLabels?: boolean;
}

export default function InterviewStatusCompact({
    candidate,
    showLabels = false
}: InterviewStatusCompactProps) {

    const getCurrentStep = () => {
        if (candidate.call_for_interview) return 7;
        if (candidate.final_shortlist) return 6;
        if (candidate.interview_status.video_interview_attended) return 5;
        if (candidate.interview_status.video_interview_url) return 4;
        if (candidate.interview_status.audio_interview_passed) return 3;
        if (candidate.interview_status.audio_interview_attended) return 2;
        return 1;
    };

    const getStepIcon = (step: number) => {
        switch (step) {
            case 1: return <User className="h-3 w-3" />;
            case 2: return <Mic className="h-3 w-3" />;
            case 3: return <Mail className="h-3 w-3" />;
            case 4: return <Video className="h-3 w-3" />;
            case 5: return <PlayCircle className="h-3 w-3" />;
            case 6: return <Eye className="h-3 w-3" />;
            case 7: return <Trophy className="h-3 w-3" />;
            default: return <User className="h-3 w-3" />;
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
            case 7: return "Hired";
            default: return "Profile";
        }
    };

    const getStepColor = (step: number) => {
        const currentStep = getCurrentStep();
        if (step < currentStep) return "bg-green-100 text-green-800 border-green-200";
        if (step === currentStep) return "bg-blue-100 text-blue-800 border-blue-200";
        return "bg-gray-100 text-gray-500 border-gray-200";
    };

    const currentStep = getCurrentStep();

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div key={step} className="relative">
                    <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 ${getStepColor(step)}`}
                        title={showLabels ? `Step ${step}: ${getStepLabel(step)}` : `Step ${step}`}
                    >
                        {step === currentStep ? (
                            <Clock className="h-3 w-3 mr-1" />
                        ) : step < currentStep ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                            getStepIcon(step)
                        )}
                        {showLabels && getStepLabel(step)}
                    </Badge>

                    {/* Connection line */}
                    {step < 7 && (
                        <div className="absolute top-1/2 -right-1 w-1 h-0.5 bg-gray-300 transform -translate-y-1/2" />
                    )}
                </div>
            ))}
        </div>
    );
}
