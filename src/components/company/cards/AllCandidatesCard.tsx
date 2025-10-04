"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaMicrophone, FaVideo, FaEnvelope, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { ManagerCandidate } from '@/lib/managerService';

interface AllCandidatesCardProps {
    candidate: ManagerCandidate;
    jobId: string;
    onSendAudioLink: (candidateId: string, candidateName: string, candidateEmail: string) => void;
    onSendVideoLink: (candidateId: string, candidateName: string, candidateEmail: string) => void;
}

export default function AllCandidatesCard({
    candidate,
    jobId,
    onSendAudioLink,
    onSendVideoLink
}: AllCandidatesCardProps) {
    const hasAudioAttended = candidate?.interview_status?.audio_interview_attended === true;
    const hasVideoAttended = candidate?.interview_status?.video_interview_attended === true;
    const hasAudioUrl = candidate?.interview_status?.audio_interview_url;
    const hasVideoUrl = candidate?.interview_status?.video_interview_url;

    const getStatusBadge = () => {
        if (hasVideoAttended) {
            return <Badge className="bg-green-100 text-green-800">Video Completed</Badge>;
        } else if (hasAudioAttended) {
            return <Badge className="bg-blue-100 text-blue-800">Audio Completed</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800">Profile Only</Badge>;
        }
    };

    return (
        <Card key={candidate.application_id} className="w-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {candidate.basic_information?.full_name || candidate.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <FaEnvelope className="h-3 w-3" />
                            <span>{candidate.basic_information?.email || candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📱</span>
                            <span>{candidate.basic_information?.phone_number || candidate.phone}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {getStatusBadge()}
                        {/* <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                                const event = new CustomEvent('openCandidateDetails', {
                                    detail: { profileId: candidate.application_id }
                                });
                                window.dispatchEvent(event);
                            }}
                        >
                            <FaEye className="h-3 w-3 mr-1" />
                            View Details
                        </Button> */}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-3">

                    {/* Interview Actions */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Interview Status:</span>
                            <div className="flex gap-2">
                                {hasAudioAttended ? (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                        <FaMicrophone className="h-3 w-3 mr-1" />
                                        Audio Done
                                    </Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                        onClick={() => onSendAudioLink(
                                            candidate.application_id,
                                            candidate.basic_information?.full_name || candidate.name || 'Candidate',
                                            candidate.basic_information?.email || candidate.email || 'No email'
                                        )}
                                    >
                                        <FaMicrophone className="h-3 w-3 mr-1" />
                                        Send Audio Link
                                    </Button>
                                )}

                                {hasVideoAttended ? (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                        <FaVideo className="h-3 w-3 mr-1" />
                                        Video Done
                                    </Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300"
                                        onClick={() => onSendVideoLink(
                                            candidate.application_id,
                                            candidate.basic_information?.full_name || 'Candidate',
                                            candidate.basic_information?.email || 'No email'
                                        )}
                                    >
                                        <FaVideo className="h-3 w-3 mr-1" />
                                        Send Video Link
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Resume Link */}
                        {(candidate as any).resume_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-gray-600 hover:text-gray-700"
                                onClick={() => window.open((candidate as any).resume_url, '_blank')}
                            >
                                <FaExternalLinkAlt className="h-3 w-3 mr-2" />
                                View Resume
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
