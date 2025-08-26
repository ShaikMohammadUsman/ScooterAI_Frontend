'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Eye, ArrowRight } from 'lucide-react';

export default function PublicCandidatesLandingPage() {
    const router = useRouter();
    const [jobId, setJobId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleViewCandidates = (e: React.FormEvent) => {
        e.preventDefault();
        if (jobId.trim()) {
            setIsLoading(true);
            router.push(`/candidates/${jobId.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Candidate Insights
                        </CardTitle>
                        <p className="text-gray-600 mt-2">
                            View and evaluate candidate profiles for any job position
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleViewCandidates} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobId" className="text-sm font-medium text-gray-700">
                                    Job ID
                                </Label>
                                <Input
                                    id="jobId"
                                    type="text"
                                    placeholder="Enter job ID (e.g., 123456789)"
                                    value={jobId}
                                    onChange={(e) => setJobId(e.target.value)}
                                    className="w-full"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the job ID to view all candidates for that position
                                </p>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isLoading || !jobId.trim()}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Loading...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        View Candidates
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• View candidate profiles and experience</li>
                                <li>• Listen to audio interviews</li>
                                <li>• Watch video interviews</li>
                                <li>• Review work history and skills</li>
                                <li>• Toggle sensitive information display</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 