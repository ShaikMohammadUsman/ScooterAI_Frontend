"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FaMicrophone, FaVideo, FaStar, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { Candidate } from '@/lib/adminService';

interface InterviewScoreDetailsPopoverProps {
    candidate: Candidate;
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number } | null;
}

export default function InterviewScoreDetailsPopover({
    candidate,
    isOpen,
    onClose,
    position
}: InterviewScoreDetailsPopoverProps) {
    if (!isOpen || !position) return null;

    // Helper function to get score color
    const getScoreColor = (score: number, maxScore: number = 5) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    // Helper function to get score background color
    const getScoreBgColor = (score: number, maxScore: number = 5) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Get video interview scores
    const getVideoScores = () => {
        if (!candidate.interview_details?.communication_evaluation) return null;

        const evaluation = candidate?.interview_details?.communication_evaluation;
        return {
            contentAndThought: evaluation?.content_and_thought?.score,
            verbalDelivery: evaluation?.verbal_delivery?.score,
            nonVerbal: evaluation?.non_verbal?.score,
            presenceAndAuthenticity: evaluation?.presence_and_authenticity?.score,
            overall: evaluation?.overall_score
        };
    };

    // Get audio interview scores
    const getAudioScores = () => {
        if (!candidate.audio_interview_details?.audio_interview_summary) return null;

        const summary = candidate.audio_interview_details.audio_interview_summary;
        return {
            averageScore: summary.average_score,
            credibilityScore: summary.credibility_score,
            communicationScore: summary.communication_score,
            totalQuestions: summary.total_questions
        };
    };

    // Calculate overall combined score
    const getOverallScore = () => {
        const videoScores = getVideoScores();
        const audioScores = getAudioScores();

        if (!videoScores && !audioScores) return null;

        let totalScore = 0;
        let totalWeight = 0;

        if (videoScores) {
            totalScore += videoScores?.overall * 0.6; // Video has 60% weight
            totalWeight += 0.6;
        }

        if (audioScores) {
            totalScore += (audioScores?.averageScore / 20) * 0.4; // Audio has 40% weight, normalized to 5-point scale
            totalWeight += 0.4;
        }

        return totalWeight > 0 ? totalScore / totalWeight : null;
    };

    const videoScores = getVideoScores();
    const audioScores = getAudioScores();
    const overallScore = getOverallScore();

    // Don't render if no interview data
    if (!videoScores && !audioScores) {
        return null;
    }

    return (
        <div
            className="fixed z-[100]"
            data-score-popover="true"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-100%, -50%)',
                marginLeft: '-10px'
            }}
        >
            <Card className="w-80 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="pb-3 relative">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <FaStar className="text-yellow-500" />
                        Interview Scores
                    </CardTitle>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes className="text-gray-400 text-xs" />
                    </button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Overall Score */}
                    {overallScore && (
                        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <FaStar className="text-yellow-500 text-sm" />
                                <h3 className="text-sm font-bold text-gray-800">Overall Performance</h3>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {overallScore.toFixed(1)}/5
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* Video Interview Scores */}
                        {videoScores && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-blue-800">
                                    <FaVideo className="text-blue-600" />
                                    Video Interview
                                    {candidate.interview_status?.video_interview_attended && (
                                        <FaCheckCircle className="text-green-600 text-xs" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Content & Thought', score: videoScores?.contentAndThought, max: 5 },
                                        { label: 'Verbal Delivery', score: videoScores?.verbalDelivery, max: 5 },
                                        { label: 'Non-verbal', score: videoScores?.nonVerbal, max: 5 },
                                        { label: 'Presence & Auth', score: videoScores?.presenceAndAuthenticity, max: 5 }
                                    ].map((item, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-700">{item?.label}</span>
                                                <Badge className={`text-xs ${getScoreColor(item?.score, item?.max)}`}>
                                                    {item?.score}/{item?.max}
                                                </Badge>
                                            </div>
                                            <Progress
                                                value={(item?.score / item?.max) * 100}
                                                className="h-1.5"
                                                style={{
                                                    '--progress-background': getScoreBgColor(item?.score, item?.max)
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-blue-800">Overall</span>
                                        <Badge className={`text-xs font-bold ${getScoreColor(videoScores?.overall, 5)}`}>
                                            {videoScores?.overall}/5
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Audio Interview Scores */}
                        {audioScores && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-green-800">
                                    <FaMicrophone className="text-green-600" />
                                    Audio Interview
                                    {candidate.interview_status?.audio_interview_attended && (
                                        <FaCheckCircle className="text-green-600 text-xs" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Average Score', score: ((audioScores?.averageScore || 0) / 20), max: 5 },
                                        { label: 'Credibility', score: ((audioScores?.credibilityScore || 0) / 20), max: 5 },
                                        { label: 'Communication', score: ((audioScores?.communicationScore || 0) / 20), max: 5 }
                                    ].map((item, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-700">{item?.label}</span>
                                                <Badge className={`text-xs ${getScoreColor(item?.score || 0, item?.max)}`}>
                                                    {item?.score?.toFixed(1)}/{item?.max}
                                                </Badge>
                                            </div>
                                            <Progress
                                                value={(item?.score / item?.max) * 100}
                                                className="h-1.5"
                                                style={{
                                                    '--progress-background': getScoreBgColor(item?.score || 0, item?.max)
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-green-200">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="text-center">
                                            <div className="font-bold text-green-600">{audioScores?.totalQuestions}</div>
                                            <div className="text-gray-600">Questions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-blue-600">
                                                {candidate.audio_interview_details?.qa_evaluations?.length || 0}
                                            </div>
                                            <div className="text-gray-600">Evaluated</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
