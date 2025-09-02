"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FaMicrophone, FaVideo, FaChartLine, FaStar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Candidate } from '@/lib/adminService';
import InterviewRadarChart from './InterviewRadarChart';

interface InterviewScoreCardProps {
    candidate: Candidate;
}

export default function InterviewScoreCard({ candidate }: InterviewScoreCardProps) {
    // Helper function to get score color
    const getScoreColor = (score: number, maxScore: number = 100) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    // Helper function to get score background color
    const getScoreBgColor = (score: number, maxScore: number = 100) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Get video interview scores
    const getVideoScores = () => {
        if (!candidate.interview_details?.communication_evaluation) return null;

        const evaluation = candidate.interview_details.communication_evaluation;
        return {
            contentAndThought: evaluation?.content_and_thought.score,
            verbalDelivery: evaluation?.verbal_delivery.score,
            nonVerbal: evaluation?.non_verbal.score,
            presenceAndAuthenticity: evaluation?.presence_and_authenticity.score,
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
            totalScore += videoScores.overall * 0.6; // Video has 60% weight
            totalWeight += 0.6;
        }

        if (audioScores) {
            totalScore += audioScores.averageScore * 0.4; // Audio has 40% weight
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
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <FaChartLine className="text-blue-600" />
                    Interview Performance Scores
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                {overallScore && (
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FaStar className="text-yellow-500 text-xl" />
                            <h3 className="text-xl font-bold text-gray-800">Overall Performance</h3>
                        </div>
                        <div className="relative inline-flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                                <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                                    {overallScore.toFixed(1)}
                                </span>
                            </div>
                            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
                                style={{
                                    transform: `rotate(${(overallScore / 100) * 360}deg)`,
                                    transition: 'transform 1s ease-in-out'
                                }}>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Combined Score</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Video Interview Scores */}
                    {videoScores && (
                        <Card className="border border-blue-200 bg-blue-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-blue-800">
                                    <FaVideo className="text-blue-600" />
                                    Video Interview
                                    {candidate.interview_status?.video_interview_attended && (
                                        <FaCheckCircle className="text-green-600 text-sm" />
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[
                                        { label: 'Content & Thought', score: videoScores?.contentAndThought, max: 5 },
                                        { label: 'Verbal Delivery', score: videoScores?.verbalDelivery, max: 5 },
                                        { label: 'Non-verbal', score: videoScores?.nonVerbal, max: 5 },
                                        { label: 'Presence & Authenticity', score: videoScores?.presenceAndAuthenticity, max: 5 }
                                    ].map((item, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <Badge className={`text-xs ${getScoreColor(item.score, item.max)}`}>
                                                    {item.score}/{item.max}
                                                </Badge>
                                            </div>
                                            <Progress
                                                value={(item.score / item.max) * 100}
                                                className="h-2"
                                                style={{
                                                    '--progress-background': getScoreBgColor(item.score, item.max)
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Overall Video Score */}
                                <div className="pt-3 border-t border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-blue-800">Overall Score</span>
                                        <Badge className={`text-sm font-bold ${getScoreColor(videoScores.overall, 5)}`}>
                                            {videoScores.overall}/5
                                        </Badge>
                                    </div>
                                    <Progress
                                        value={(videoScores.overall / 5) * 100}
                                        className="h-3 mt-2"
                                        style={{
                                            '--progress-background': getScoreBgColor(videoScores.overall, 5)
                                        } as React.CSSProperties}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Audio Interview Scores */}
                    {audioScores && (
                        <Card className="border border-green-200 bg-green-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-green-800">
                                    <FaMicrophone className="text-green-600" />
                                    Audio Interview
                                    {candidate.interview_status?.audio_interview_attended && (
                                        <FaCheckCircle className="text-green-600 text-sm" />
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[
                                        { label: 'Average Score', score: audioScores.averageScore, max: 100 },
                                        { label: 'Credibility', score: audioScores.credibilityScore, max: 100 },
                                        { label: 'Communication', score: audioScores.communicationScore, max: 100 }
                                    ].map((item, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <Badge className={`text-xs ${getScoreColor(item?.score || 0, item.max)}`}>
                                                    {item?.score?.toFixed(1)}/{item.max}
                                                </Badge>
                                            </div>
                                            <Progress
                                                value={item.score}
                                                className="h-2"
                                                style={{
                                                    '--progress-background': getScoreBgColor(item?.score || 0, item.max)
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Additional Audio Metrics */}
                                <div className="pt-3 border-t border-green-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                                            <div className="text-lg font-bold text-green-600">
                                                {audioScores.totalQuestions}
                                            </div>
                                            <div className="text-xs text-gray-600">Questions</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                                            <div className="text-lg font-bold text-blue-600">
                                                {candidate.audio_interview_details?.qa_evaluations?.length || 0}
                                            </div>
                                            <div className="text-xs text-gray-600">Evaluated</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Performance Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaChartLine className="text-gray-600" />
                        Performance Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {videoScores && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-blue-600">
                                    {videoScores.overall}/5
                                </div>
                                <div className="text-sm text-gray-600">Video Score</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {videoScores.overall >= 4 ? 'Excellent' :
                                        videoScores.overall >= 3 ? 'Good' : 'Needs Improvement'}
                                </div>
                            </div>
                        )}
                        {audioScores && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-green-600">
                                    {audioScores.averageScore.toFixed(1)}/100
                                </div>
                                <div className="text-sm text-gray-600">Audio Score</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {audioScores.averageScore >= 80 ? 'Excellent' :
                                        audioScores.averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                                </div>
                            </div>
                        )}
                        {overallScore && (
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <div className="text-2xl font-bold text-purple-600">
                                    {overallScore.toFixed(1)}/100
                                </div>
                                <div className="text-sm text-gray-600">Combined</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {overallScore >= 80 ? 'Excellent' :
                                        overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="mt-6">
                    <InterviewRadarChart candidate={candidate} />
                </div>

                {/* Areas for Improvement */}
                {candidate?.audio_interview_details?.audio_interview_summary?.areas_for_improvement &&
                    candidate.audio_interview_details.audio_interview_summary.areas_for_improvement.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-600" />
                                Areas for Improvement
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {candidate.audio_interview_details.audio_interview_summary.areas_for_improvement.map((area, index) => (
                                    <li key={index} className="text-sm text-red-700">{area}</li>
                                ))}
                            </ul>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
