import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MessageSquare, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Candidate } from '@/lib/adminService';

interface AudioInterviewEvaluationProps {
    candidate: Candidate;
}

export default function AudioInterviewEvaluation({ candidate }: AudioInterviewEvaluationProps) {
    const [activeTab, setActiveTab] = useState('summary');
    const [activeQuestionTab, setActiveQuestionTab] = useState('0');

    const getScoreColor = (score: number): string => {
        if (score >= 4) return 'bg-green-100 text-green-800';
        if (score >= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    // Check if audio interview details exist
    if (!candidate?.audio_interview_details) {
        return null;
    }

    const audioInterviewDetails = candidate.audio_interview_details;
    const questions = audioInterviewDetails?.qa_evaluations || [];

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Audio Interview Evaluation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Q&A ({questions.length})
                        </TabsTrigger>
                        <TabsTrigger value="improvements" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Improvements
                        </TabsTrigger>
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-4">
                        {audioInterviewDetails?.audio_interview_summary && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Average Score</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {audioInterviewDetails.audio_interview_summary.average_score?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Credibility</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {audioInterviewDetails.audio_interview_summary.dimension_averages?.credibility?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Ownership</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {audioInterviewDetails.audio_interview_summary.dimension_averages?.ownership_depth?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Communication</p>
                                        <p className="text-lg font-bold text-orange-600">
                                            {audioInterviewDetails.audio_interview_summary.dimension_averages?.communication?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                </div>

                                {audioInterviewDetails.audio_interview_summary.strengths &&
                                    audioInterviewDetails.audio_interview_summary.strengths.length > 0 && (
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h5 className="font-medium text-green-900 mb-2">Strengths</h5>
                                            <ul className="space-y-2">
                                                {audioInterviewDetails.audio_interview_summary.strengths.map((strength, index) => (
                                                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                                                        <span className="text-green-600 mt-1">•</span>
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                            </>
                        )}
                    </TabsContent>

                    {/* Questions Tab with Individual Question Tabs */}
                    <TabsContent value="questions" className="space-y-4">
                        {questions.length > 0 ? (
                            <Tabs value={activeQuestionTab} onValueChange={setActiveQuestionTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    {questions.map((_, index) => (
                                        <TabsTrigger key={index} value={index.toString()} className="text-xs">
                                            Q{index + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {questions.map((qa, index) => (
                                    <TabsContent key={index} value={index.toString()} className="space-y-4">
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-medium mb-2">Question {index + 1}</h5>
                                            <p className="text-sm text-gray-700 mb-3">{qa.question || 'No question available'}</p>
                                            <div className="mb-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm text-gray-600 mb-1">Answer:</p>
                                                <p className="text-sm">{qa.answer || 'No answer available'}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <div className="text-center p-2 bg-blue-50 rounded">
                                                    <p className="text-xs text-blue-600">Credibility</p>
                                                    <Badge className={getScoreColor(qa.evaluation?.credibility?.score || 0)}>
                                                        {qa.evaluation?.credibility?.score || 0}/5
                                                    </Badge>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 rounded">
                                                    <p className="text-xs text-green-600">Ownership</p>
                                                    <Badge className={getScoreColor(qa.evaluation?.ownership_depth?.score || 0)}>
                                                        {qa.evaluation?.ownership_depth?.score || 0}/5
                                                    </Badge>
                                                </div>
                                                <div className="text-center p-2 bg-purple-50 rounded">
                                                    <p className="text-xs text-purple-600">Communication</p>
                                                    <Badge className={getScoreColor(qa.evaluation?.communication?.score || 0)}>
                                                        {qa.evaluation?.communication?.score || 0}/5
                                                    </Badge>
                                                </div>
                                                <div className="text-center p-2 bg-orange-50 rounded">
                                                    <p className="text-xs text-orange-600">Confidence</p>
                                                    <Badge className={getScoreColor(qa.evaluation?.confidence?.score || 0)}>
                                                        {qa.evaluation?.confidence?.score || 0}/5
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <p className="text-xs text-gray-600">{qa.evaluation?.summary || 'No summary available'}</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No questions available
                            </div>
                        )}
                    </TabsContent>

                    {/* Improvements Tab */}
                    <TabsContent value="improvements" className="space-y-4">
                        {audioInterviewDetails?.audio_interview_summary?.areas_for_improvement &&
                            audioInterviewDetails.audio_interview_summary.areas_for_improvement.length > 0 ? (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h5 className="font-medium text-yellow-900 mb-2">Areas for Improvement</h5>
                                <ul className="space-y-2">
                                    {audioInterviewDetails.audio_interview_summary.areas_for_improvement.map((area, index) => (
                                        <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                                            <span className="text-yellow-600 mt-1">•</span>
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">No specific areas for improvement identified.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 