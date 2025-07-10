import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserCheck, Award, Phone, CheckCircle, AlertCircle, Play, Video, Users, Calendar, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Candidate, callForInterview } from '@/lib/adminService';
import { useToast } from '@/hooks/use-toast';

interface ApplicationStatusSectionProps {
    candidate: Candidate;
    onStatusUpdate?: () => void;
}

interface InterviewStage {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'completed' | 'current' | 'pending' | 'failed';
    isActive: boolean;
}

export default function ApplicationStatusSection({ candidate, onStatusUpdate }: ApplicationStatusSectionProps) {
    const { toast } = useToast();
    const [isCallForInterview, setIsCallForInterview] = useState(candidate.call_for_interview);
    const [notes, setNotes] = useState(candidate.call_for_interview_notes || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [accepted, setAccepted] = useState(false);

    // Define interview stages with visual status
    const interviewStages: InterviewStage[] = [
        {
            id: 'application',
            title: 'Application Submitted',
            description: 'Initial application received',
            icon: <UserCheck className="h-5 w-5" />,
            status: 'completed',
            isActive: true,
        },
        {
            id: 'video_round',
            title: 'Video Round',
            description: candidate.application_status ? 'Moved to video round' : 'Application rejected',
            icon: <Video className="h-5 w-5" />,
            status: candidate.application_status ? 'completed' : 'failed',
            isActive: candidate.application_status,
        },
        {
            id: 'video_attended',
            title: 'Video Interview',
            description: candidate.interview_status?.video_interview_attended ? 'Interview completed' : 'Interview pending',
            icon: <Play className="h-5 w-5" />,
            status: candidate.interview_status?.video_interview_attended ? 'completed' : 'pending',
            isActive: candidate.application_status && candidate.interview_status?.video_interview_attended,
        },
        {
            id: 'shortlisted',
            title: 'Shortlisted',
            description: candidate.final_shortlist ? 'Passed video round' : 'Not shortlisted',
            icon: <Award className="h-5 w-5" />,
            status: candidate.final_shortlist ? 'completed' : 'pending',
            isActive: candidate.application_status && candidate.interview_status?.video_interview_attended,
        },
        {
            id: 'final_call',
            title: 'Final Interview Call',
            description: candidate.call_for_interview ? 'Called for final interview' : 'Awaiting call',
            icon: <Phone className="h-5 w-5" />,
            status: candidate.call_for_interview ? 'completed' : 'current',
            isActive: candidate.final_shortlist,
        },
    ];

    useEffect(() => {
        if (candidate.call_for_interview) {
            setAccepted(true);
        } else {
            setAccepted(false);
        }
    }, [])

    const getStageIcon = (stage: InterviewStage) => {
        switch (stage.status) {
            case 'completed':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'current':
                return <Clock className="h-6 w-6 text-blue-600" />;
            case 'pending':
                return <AlertCircle className="h-6 w-6 text-gray-400" />;
            case 'failed':
                return <XCircle className="h-6 w-6 text-red-600" />;
            default:
                return <AlertCircle className="h-6 w-6 text-gray-400" />;
        }
    };

    const getStageColor = (stage: InterviewStage) => {
        switch (stage.status) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'current':
                return 'bg-blue-50 border-blue-200';
            case 'pending':
                return 'bg-gray-50 border-gray-200';
            case 'failed':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const handleCallForInterviewSubmit = async () => {
        if (!candidate.profile_id) {
            toast({
                title: "Error",
                description: "Candidate ID not found",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await callForInterview({
                user_id: candidate.profile_id,
                call_for_interview: isCallForInterview,
                notes: notes,
            });

            // Check if the response indicates success
            if (response && response.user_id) {
                if (isCallForInterview) {
                    setAccepted(true);
                }
                toast({
                    title: isCallForInterview ? "Success" : "Updated",
                    variant: isCallForInterview ? 'success' : 'info',
                    description: isCallForInterview
                        ? "Candidate called for final interview"
                        : "Call for interview status updated",
                });

                if (onStatusUpdate) {
                    onStatusUpdate();
                }
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error updating call for interview status:', error);
            toast({
                title: "error",
                description: error instanceof Error ? error.message : "Failed to update call for interview status",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Interview Progress
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProgress(!showProgress)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        {showProgress ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Hide Progress
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Show Progress
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Visual Interview Progress - Hidden by default */}
                {showProgress && (
                    <div className="space-y-4 mb-6">
                        {interviewStages.map((stage, index) => (
                            <div key={stage.id} className="relative">
                                {/* Progress Line */}
                                {index < interviewStages.length - 1 && (
                                    <div className={`absolute left-6 top-8 w-0.5 h-8 ${stage.status === 'completed' ? 'bg-green-400' : 'bg-gray-300'
                                        }`} />
                                )}

                                <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${getStageColor(stage)}`}>
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                        {getStageIcon(stage)}
                                    </div>

                                    {/* Stage Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{stage.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                                            </div>
                                            <Badge className={
                                                stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    stage.status === 'current' ? 'bg-blue-100 text-blue-800' :
                                                        stage.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-600'
                                            }>
                                                {stage.status === 'completed' ? 'Completed' :
                                                    stage.status === 'current' ? 'In Progress' :
                                                        stage.status === 'failed' ? 'Failed' :
                                                            'Pending'}
                                            </Badge>
                                        </div>

                                        {/* Additional Info for specific stages */}
                                        {stage.id === 'video_round' && candidate.application_status_reason && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                                <p className="text-xs text-blue-800">
                                                    <strong>Note:</strong> {candidate.application_status_reason}
                                                </p>
                                            </div>
                                        )}

                                        {stage.id === 'shortlisted' && candidate.shortlist_status_reason && (
                                            <div className="mt-2 p-2 bg-purple-50 rounded">
                                                <p className="text-xs text-purple-800">
                                                    <strong>Note:</strong> {candidate.shortlist_status_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call for Interview Action Section */}
                {accepted ? (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Candidate Shortlisted</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                                Called for Final Interview
                            </Badge>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-green-700 mb-3">
                                This candidate has been shortlisted for the next round and called for final interview.
                            </p>
                            {candidate.call_for_interview_notes && (
                                <div className="p-3 bg-green-100 rounded">
                                    <p className="text-xs text-green-800">
                                        <strong>Notes:</strong> {candidate.call_for_interview_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setAccepted(false)}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                            Update Status
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Call for Final Interview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={isCallForInterview}
                                    onCheckedChange={setIsCallForInterview}
                                    className="data-[state=checked]:bg-orange-600"
                                />
                                <Badge className={isCallForInterview ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}>
                                    {isCallForInterview ? 'Called for Interview' : 'Not Called'}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="interview-notes" className="text-sm font-medium text-orange-800">
                                    Interview Notes
                                </Label>
                                <Textarea
                                    id="interview-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about the final interview call..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleCallForInterviewSubmit}
                                    disabled={isSubmitting}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {isCallForInterview ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            {isCallForInterview ? 'Call for Interview' : 'Update Status'}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 