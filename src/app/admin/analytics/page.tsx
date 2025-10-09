"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSuperAdminAccessTokenValid } from "@/lib/superAdminService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Clock, Construction } from "lucide-react";

export default function AdminAnalyticsPage() {
    const router = useRouter();

    useEffect(() => {
        // Check authentication status on mount
        if (!isSuperAdminAccessTokenValid()) {
            router.replace("/admin/login");
        }
    }, [router]);

    // Don't render anything if not authenticated (will redirect)
    if (!isSuperAdminAccessTokenValid()) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin/dashboard")}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
                            <p className="text-lg text-gray-600">
                                Comprehensive analytics and reporting dashboard
                            </p>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Content */}
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="h-12 w-12 text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-md">
                            Advanced analytics and reporting features are currently under development.
                            You'll have access to comprehensive insights and data visualization here.
                        </p>

                        <div className="bg-white rounded-lg shadow p-6 max-w-md">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                                Planned Features
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    Job performance metrics
                                </li>
                                <li className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    User engagement analytics
                                </li>
                                <li className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    Interview success rates
                                </li>
                                <li className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    Custom report generation
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
