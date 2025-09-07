"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { FaMicrophone, FaVideo, FaStar } from 'react-icons/fa';
import { Candidate } from '@/lib/adminService';
import InterviewScoreDetailsPopover from './InterviewScoreDetailsPopover';

interface InterviewScoreCompactProps {
    candidate: Candidate;
    showPopOver?: boolean;
    containerStyle?: string;
}

export default function InterviewScoreCompact({ candidate, showPopOver = true, containerStyle }: InterviewScoreCompactProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside and escape key to close popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedInsideTrigger = containerRef.current && containerRef.current.contains(target);
            const clickedInsidePopover = target instanceof Element && !!target.closest('[data-score-popover="true"]');
            if (!clickedInsideTrigger && !clickedInsidePopover) {
                setIsPopoverOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsPopoverOpen(false);
            }
        };

        if (isPopoverOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isPopoverOpen]);

    // Helper function to get score color
    const getScoreColor = (score: number, maxScore: number = 5) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    // Get video interview scores
    const getVideoScores = () => {
        if (!candidate.interview_details?.communication_evaluation) return null;

        const evaluation = candidate.interview_details.communication_evaluation;
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
            totalScore += videoScores.overall * 0.6; // Video has 60% weight
            totalWeight += 0.6;
        }

        if (audioScores) {
            totalScore += (audioScores.averageScore / 20) * 0.4; // Audio has 40% weight, normalized to 5-point scale
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

    // Handle click event to toggle popover
    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        if (!isPopoverOpen) {
            const rect = event.currentTarget.getBoundingClientRect();
            setPopoverPosition({
                x: rect.left - 320, // Fixed offset for popover width
                y: rect.top + rect.height / 2
            });
        }
        setIsPopoverOpen(!isPopoverOpen);
    };

    return (
        <div className="relative" >
            <div
                ref={containerRef}
                className={`space-y-3 flex flex-col items-center justify-center gap-2 shadow-lg w-fit p-2 rounded-md cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group z-0 ${containerStyle}`}
                onClick={handleClick}
            >
                {/* Overall Score */}
                {overallScore && (
                    <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500 text-sm" />
                        <Badge className={`font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore.toFixed(1)}/5
                        </Badge>
                        <span className="text-xs text-gray-500">Overall</span>
                        <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">ⓘ</span>
                    </div>
                )}

                {/* Individual Scores */}
                <div className="grid grid-cols-2 gap-1">
                    {videoScores && (
                        <div className="flex items-center gap-1">
                            <FaVideo className="text-blue-600 text-xs" />
                            <Badge className={`text-xs ${getScoreColor(videoScores.overall, 5)}`}>
                                {videoScores.overall}/5
                            </Badge>
                        </div>
                    )}

                    {audioScores && (
                        <div className="flex items-center gap-1">
                            <FaMicrophone className="text-green-600 text-xs" />
                            <Badge className={`text-xs ${getScoreColor(audioScores.averageScore / 20)}`}>
                                {(audioScores.averageScore / 20).toFixed(1)}/5
                            </Badge>
                        </div>
                    )}
                </div>

            </div>

            {/* Popover */}
            {
                showPopOver && (
                    <InterviewScoreDetailsPopover
                        key={`popover-${candidate.user_id || candidate.profile_id}`}
                        candidate={candidate}
                        isOpen={isPopoverOpen}
                        onClose={() => setIsPopoverOpen(false)}
                        position={popoverPosition}
                    />
                )
            }


        </div>
    );
}
