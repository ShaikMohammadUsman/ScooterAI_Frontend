import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Mic, MessageSquare, Brain, Target, Zap, Pause, Play, Video } from 'lucide-react';
import { Candidate } from '@/lib/adminService';
import { Button } from '../ui/button';

interface InterviewEvaluationTabsProps {
    candidate: Candidate;
}

export default function InterviewEvaluationTabs({ candidate }: InterviewEvaluationTabsProps) {
    const [activeTab, setActiveTab] = useState('communication');
    const [activeQuestionTab, setActiveQuestionTab] = useState('0');
    const [videoPlaying, setVideoPlaying] = useState<string | null>(null);

    const handleVideoPlay = (profileId: string, videoUrl: string) => {
        if (videoPlaying === profileId) {
            setVideoPlaying(null);
        } else {
            setVideoPlaying(profileId);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 4) return 'bg-green-100 text-green-800';
        if (score >= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getSignalColor = (hasSignal: boolean): string => {
        return hasSignal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
    };

    // Check if interview details exist
    if (!candidate?.interview_details) {
        return null;
    }

    const interviewDetails = candidate.interview_details;
    const questions = interviewDetails?.qa_evaluations?.question_evaluations || [];

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Interview Evaluation
                    </div>
                    <div>
                        {candidate.interview_status.video_interview_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVideoPlay(candidate.profile_id, candidate.interview_status.video_interview_url || '')}
                                className="flex items-center gap-1"
                            >
                                {videoPlaying === candidate.profile_id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                Video
                            </Button>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {videoPlaying === candidate.profile_id && candidate.interview_status.video_interview_url && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Interview
                        </h4>
                        <video
                            controls
                            className="w-full rounded-lg"
                            src={candidate.interview_status.video_interview_url}
                        />
                    </div>
                )}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="communication" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Communication
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Q&A ({questions.length})
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Summary
                        </TabsTrigger>
                    </TabsList>

                    {/* Communication Skills Tab */}
                    <TabsContent value="communication" className="space-y-4">
                        {interviewDetails?.communication_evaluation && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Content & Thought</span>
                                            <Badge className={getScoreColor(interviewDetails.communication_evaluation.content_and_thought?.score || 0)}>
                                                {interviewDetails.communication_evaluation.content_and_thought?.score || 0}/5
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Verbal Delivery</span>
                                            <Badge className={getScoreColor(interviewDetails.communication_evaluation.verbal_delivery?.score || 0)}>
                                                {interviewDetails.communication_evaluation.verbal_delivery?.score || 0}/5
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Non-Verbal</span>
                                            <Badge className={getScoreColor(interviewDetails.communication_evaluation.non_verbal?.score || 0)}>
                                                {interviewDetails.communication_evaluation.non_verbal?.score || 0}/5
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">Presence & Authenticity</span>
                                            <Badge className={getScoreColor(interviewDetails.communication_evaluation.presence_and_authenticity?.score || 0)}>
                                                {interviewDetails.communication_evaluation.presence_and_authenticity?.score || 0}/5
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h5 className="font-medium text-blue-900 mb-2">
                                        Overall Score: {interviewDetails.communication_evaluation.overall_score || 0}/5
                                    </h5>
                                    <p className="text-sm text-blue-800">{interviewDetails.communication_evaluation.summary || 'No summary available'}</p>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Questions Tab with Individual Question Tabs */}
                    <TabsContent value="questions" className="space-y-4">
                        {questions.length > 0 ? (
                            <Tabs value={activeQuestionTab} onValueChange={setActiveQuestionTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-5 gap-2 h-fit">
                                    {questions.map((_, index) => (
                                        <TabsTrigger key={index} value={index.toString()} className="text-xs border-1">
                                            Q{index + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {questions.map((qa, index) => (
                                    <TabsContent key={index} value={index.toString()} className="space-y-4">
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-medium">Question {qa.question_number || index + 1} ({qa.step || 'main'})</h5>
                                                <Badge className={getSignalColor(qa.has_signal || false)}>
                                                    {qa.has_signal ? 'Has Signal' : 'No Signal'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3">{qa.question || 'No question available'}</p>
                                            <div className="mb-3 p-3 bg-gray-50 rounded">
                                                <p className="text-sm text-gray-600 mb-1">Answer:</p>
                                                <p className="text-sm">{qa.answer || 'No answer available'}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                                        <span className="text-xs text-blue-600">Skill Score</span>
                                                        <Badge className={getScoreColor(qa.skill_score || 0)}>
                                                            {qa.skill_score || 0}/5
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-600">{qa.skill_reasoning || 'No reasoning available'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                                        <span className="text-xs text-green-600">Trait Score</span>
                                                        <Badge className={getScoreColor(qa.trait_score || 0)}>
                                                            {qa.trait_score || 0}/5
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-600">{qa.trait_reasoning || 'No reasoning available'}</p>
                                                </div>
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

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-4">
                        {interviewDetails?.qa_evaluations?.overall_scores && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Average Skill Score</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {interviewDetails.qa_evaluations.overall_scores.average_skill_score?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Average Trait Score</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {interviewDetails.qa_evaluations.overall_scores.average_trait_score?.toFixed(1) || '0.0'}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Questions with Signal</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {interviewDetails.qa_evaluations.overall_scores.questions_with_signal || 0}/{interviewDetails.qa_evaluations.overall_scores.total_questions || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h5 className="font-medium text-green-900 mb-2">Overall Summary</h5>
                                    <p className="text-sm text-green-800">{interviewDetails.qa_evaluations.summary || 'No summary available'}</p>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 