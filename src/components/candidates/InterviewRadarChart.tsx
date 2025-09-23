"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Candidate } from '@/lib/adminService';

interface InterviewRadarChartProps {
    candidate: Candidate;
}

export default function InterviewRadarChart({ candidate }: InterviewRadarChartProps) {
    // Get video interview scores
    const getVideoScores = () => {
        if (!candidate.interview_details?.communication_evaluation) return null;

        const evaluation = candidate.interview_details.communication_evaluation;
        return {
            contentAndThought: (evaluation?.content_and_thought?.score / 5) * 100,
            verbalDelivery: (evaluation?.verbal_delivery?.score / 5) * 100,
            nonVerbal: (evaluation?.non_verbal?.score / 5) * 100,
            presenceAndAuthenticity: (evaluation?.presence_and_authenticity?.score / 5) * 100,
            overall: (evaluation?.overall_score / 5) * 100
        };
    };

    // Get audio interview scores
    const getAudioScores = () => {
        if (!candidate.audio_interview_details?.audio_interview_summary) return null;

        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        return {
            averageScore: summary?.average_score || 0,  // Already on 0-100 scale
            credibilityScore: summary?.credibility_score || 0,  // Already on 0-100 scale
            communicationScore: summary?.communication_score || 0  // Already on 0-100 scale
        };
    };

    const videoScores = getVideoScores();
    const audioScores = getAudioScores();

    // Don't render if no interview data
    if (!videoScores && !audioScores) {
        return null;
    }

    // Create radar chart data
    const createRadarData = () => {
        const data = [];

        if (videoScores) {
            data.push(
                { name: 'Content & Thought', video: videoScores?.contentAndThought, audio: 0 },
                { name: 'Verbal Delivery', video: videoScores?.verbalDelivery, audio: 0 },
                { name: 'Non-verbal', video: videoScores?.nonVerbal, audio: 0 },
                { name: 'Presence & Auth', video: videoScores?.presenceAndAuthenticity, audio: 0 }
            );
        }

        if (audioScores) {
            data.push(
                { name: 'Credibility', video: 0, audio: audioScores?.credibilityScore },
                { name: 'Communication', video: 0, audio: audioScores?.communicationScore },
                { name: 'Average Score', video: 0, audio: audioScores?.averageScore }
            );
        }

        return data;
    };

    // Create separate data arrays for each polygon
    const createVideoData = () => {
        if (!videoScores) return [];
        return [
            { name: 'Content & Thought', score: videoScores?.contentAndThought },
            { name: 'Verbal Delivery', score: videoScores?.verbalDelivery },
            { name: 'Non-verbal', score: videoScores?.nonVerbal },
            { name: 'Presence & Auth', score: videoScores?.presenceAndAuthenticity }
        ];
    };

    const createAudioData = () => {
        if (!audioScores) return [];
        return [
            { name: 'Credibility', score: audioScores?.credibilityScore },
            { name: 'Communication', score: audioScores?.communicationScore },
            { name: 'Average Score', score: audioScores?.averageScore }
        ];
    };

    const radarData = createRadarData();

    // Create SVG radar chart
    const createRadarChart = () => {
        const size = 400;
        const center = size / 2;
        const radius = 90;
        const dataPoints = radarData.length;

        if (dataPoints === 0) return null;

        const angleStep = (2 * Math.PI) / dataPoints;

        // Create polygon points for video data
        const createVideoPolygonPoints = (scores: number[]) => {
            const videoAngleStep = (2 * Math.PI) / scores.length;
            return scores.map((score, index) => {
                const angle = index * videoAngleStep - Math.PI / 2; // Start from top
                const r = (score / 100) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
            }).join(' ');
        };

        // Create polygon points for audio data
        const createAudioPolygonPoints = (scores: number[]) => {
            const audioAngleStep = (2 * Math.PI) / scores.length;
            return scores.map((score, index) => {
                const angle = index * audioAngleStep - Math.PI / 2; // Start from top
                const r = (score / 100) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
            }).join(' ');
        };

        // Create axis lines
        const createAxisLines = () => {
            return radarData.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                    <line
                        key={index}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                );
            });
        };

        // Create labels
        const createLabels = () => {
            return radarData.map((item, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const labelRadius = radius + 20;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                return (
                    <text
                        key={index}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-600"
                        style={{ fontSize: '12px' }}
                    >
                        {item.name}
                    </text>
                );
            });
        };

        // Create separate polygon data
        const videoData = createVideoData();
        const audioData = createAudioData();
        const videoScoreValues = videoData.map(item => item?.score || 0);
        const audioScoreValues = audioData.map(item => item?.score || 0);

        return (
            <svg width={size} height={size} className="mx-auto">
                {/* Background circles */}
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="1" />
                <circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke="#f3f4f6" strokeWidth="1" />
                <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#f3f4f6" strokeWidth="1" />
                <circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke="#f3f4f6" strokeWidth="1" />

                {/* Axis lines */}
                {createAxisLines()}

                {/* Video scores polygon */}
                {videoScoreValues.some(score => score > 0) && (
                    <polygon
                        points={createVideoPolygonPoints(videoScoreValues)}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                )}

                {/* Audio scores polygon */}
                {audioScoreValues.some(score => (score || 0) > 0) && (
                    <polygon
                        points={createAudioPolygonPoints(audioScoreValues)}
                        fill="rgba(34, 197, 94, 0.2)"
                        stroke="#22c55e"
                        strokeWidth="2"
                    />
                )}

                {/* Labels */}
                {createLabels()}

                {/* Center point */}
                <circle cx={center} cy={center} r="3" fill="#6b7280" />
            </svg>
        );
    };

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 text-center">
                    Performance Radar Chart
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Radar Chart */}
                <div className="flex justify-center">
                    {createRadarChart()}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm">
                    {videoScores && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">Video Interview</span>
                        </div>
                    )}
                    {audioScores && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">Audio Interview</span>
                        </div>
                    )}
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    {videoScores && (
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                                {((videoScores?.overall / 100) * 5).toFixed(1)}/5
                            </div>
                            <div className="text-xs text-gray-600">Video Overall</div>
                        </div>
                    )}
                    {audioScores && (
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {audioScores?.averageScore.toFixed(1)}/100
                            </div>
                            <div className="text-xs text-gray-600">Audio Overall</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
