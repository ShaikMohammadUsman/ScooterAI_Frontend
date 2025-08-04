"use client";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    FileText,
    Edit3,
    Save,
    Sparkles,
    User,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Lightbulb,
    AlertCircle
} from "lucide-react";
import { generateCandidateSummary, saveCandidateSummary } from "@/lib/resumeService";
import { toast } from "@/hooks/use-toast";

interface CandidateSummaryFormProps {
    profile: any;
    parsedUserName?: string;
    onSummaryGenerated?: (summary: string) => void;
    onSaveProgress?: (isSaving: boolean) => void;
}

export default function CandidateSummaryForm({
    profile,
    parsedUserName,
    onSummaryGenerated,
    onSaveProgress
}: CandidateSummaryFormProps) {
    const [summary, setSummary] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Get user's name for personalization
    const userName = parsedUserName || profile?.basic_information?.full_name || "there";
    const firstName = userName.split(' ')[0];

    // Generate summary when component mounts
    useEffect(() => {
        if (!hasGenerated && profile?.basic_information?.full_name) {
            generateSummary();
        }
    }, [profile?.basic_information?.full_name]);

    // Track unsaved changes
    useEffect(() => {
        if (hasGenerated && summary !== "") {
            setHasUnsavedChanges(!hasSaved);
        }
    }, [summary, hasSaved, hasGenerated]);

    // Notify parent component about save progress
    useEffect(() => {
        onSaveProgress?.(isSaving);
    }, [isSaving, onSaveProgress]);

    const generateSummary = async () => {
        const userId = localStorage.getItem('scooterUserId');
        if (!userId) {
            toast({
                title: "Error",
                description: "User ID not found. Please try again.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        try {
            const response = await generateCandidateSummary({ user_id: userId });
            if (response.status && response.candidate_summary) {
                setSummary(response.candidate_summary);
                setHasGenerated(true);
                setHasSaved(false); // Reset save status for new summary
                setHasUnsavedChanges(true);
                onSummaryGenerated?.(response.candidate_summary);
                toast({
                    title: "Summary Generated!",
                    description: "We've created a professional summary based on your profile. Don't forget to save!",
                });
            } else {
                throw new Error("Failed to generate summary");
            }
        } catch (error: any) {
            console.error("Error generating summary:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to generate summary. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const saveSummary = async () => {
        const userId = localStorage.getItem('scooterUserId');
        if (!userId || !summary.trim()) {
            toast({
                title: "Error",
                description: "Please ensure you have a summary to save.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await saveCandidateSummary({
                user_id: userId,
                summary_content: summary.trim()
            });

            if (response.status) {
                setHasSaved(true);
                setHasUnsavedChanges(false);
                setIsEditing(false);
                toast({
                    title: "Summary Saved!",
                    description: "Your professional summary has been saved successfully.",
                });
            } else {
                throw new Error("Failed to save summary");
            }
        } catch (error: any) {
            console.error("Error saving summary:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save summary. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setHasSaved(false);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        saveSummary();
    };

    const handleRegenerate = () => {
        setHasGenerated(false);
        setHasSaved(false);
        setHasUnsavedChanges(false);
        setIsEditing(false);
        generateSummary();
    };

    return (
        <div className="flex items-center justify-center py-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <FileText className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Your Professional Summary, {firstName}! 📝
                        </h2>
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-gray-600 text-sm">
                        We've created a professional summary based on your experience. Feel free to edit it to make it perfect!
                    </p>
                </div>

                {/* Save Status Banner */}
                {hasGenerated && (
                    <div className={`mb-4 p-3 rounded-lg border ${hasSaved
                        ? 'bg-green-50 border-green-200'
                        : hasUnsavedChanges
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {hasSaved ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-700">Summary saved successfully!</span>
                                    </>
                                ) : hasUnsavedChanges ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm font-medium text-yellow-700">You have unsaved changes</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                        <span className="text-sm font-medium text-blue-700">Generating summary...</span>
                                    </>
                                )}
                            </div>
                            {hasGenerated && !hasSaved && (
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !summary.trim()}
                                    size="sm"
                                    className="text-xs"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3 h-3 mr-1" />
                                            Save Summary
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Summary Card */}
                <Card className="w-full">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" />
                                <CardTitle className="text-lg">Professional Summary</CardTitle>
                                {hasGenerated && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Generated
                                    </Badge>
                                )}
                                {hasSaved && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                        <Save className="w-3 h-3 mr-1" />
                                        Saved
                                    </Badge>
                                )}
                                {hasUnsavedChanges && (
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Unsaved
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {hasGenerated && !isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit}
                                        className="text-xs"
                                    >
                                        <Edit3 className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                )}
                                {hasGenerated && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRegenerate}
                                                    disabled={isGenerating}
                                                    className="text-xs"
                                                >
                                                    {isGenerating ? (
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                    )}
                                                    Regenerate
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Generate a new summary based on your profile</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isGenerating ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Generating your professional summary...</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        We're analyzing your experience to create the perfect summary
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Textarea
                                    value={summary}
                                    onChange={(e) => {
                                        setSummary(e.target.value);
                                        if (hasSaved) {
                                            setHasSaved(false);
                                            setHasUnsavedChanges(true);
                                        }
                                    }}
                                    placeholder="Your professional summary will appear here..."
                                    className="min-h-[200px] text-sm leading-relaxed resize-none"
                                    readOnly={!isEditing}
                                />

                                {summary && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                                        <span>
                                            {summary.split(' ').length} words •
                                            {Math.ceil(summary.length / 50)} reading time
                                        </span>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    {hasGenerated && !isEditing && (
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !summary.trim()}
                                            className="flex-1"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Summary
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {isEditing && (
                                        <>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving || !summary.trim()}
                                                className="flex-1"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setHasSaved(false);
                                                    setHasUnsavedChanges(true);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Warning for unsaved changes */}
                                {hasGenerated && !hasSaved && hasUnsavedChanges && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                Don't forget to save your summary before proceeding!
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tips */}
                {hasGenerated && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800 mb-2">Tips for a great summary:</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Highlight your key achievements and skills</li>
                                    <li>• Keep it concise but impactful</li>
                                    <li>• Focus on results and quantifiable outcomes</li>
                                    <li>• Make it relevant to your target roles</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 