"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';

export default function CandidatePortfolioIndex() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Candidate Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Enter a job ID to view candidate portfolios and interview details.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push('/company/jobs')}
                                className="w-full flex items-center gap-2"
                            >
                                <FaSearch className="text-sm" />
                                Browse Jobs
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="w-full flex items-center gap-2"
                            >
                                <FaArrowLeft className="text-sm" />
                                Back to Home
                            </Button>
                        </div>

                        <div className="text-sm text-gray-500 mt-4">
                            <p>To view candidate portfolios, navigate to:</p>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                /candidate-portfolio/[jobId]
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
