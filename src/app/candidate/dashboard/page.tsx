"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function CandidateDashboardPage() {
    const router = useRouter();

    // Mock data - replace with real data from API
    const applications = [
        {
            id: "1",
            jobTitle: "Senior Sales Representative",
            company: "TechCorp Inc.",
            status: "Shortlisted",
            appliedDate: "2024-01-15",
            nextStep: "Video Interview"
        },
        {
            id: "2",
            jobTitle: "Business Development Manager",
            company: "SalesPro Ltd.",
            status: "Under Review",
            appliedDate: "2024-01-10",
            nextStep: "Awaiting Response"
        },
        {
            id: "3",
            jobTitle: "Account Executive",
            company: "GrowthTech",
            status: "Interview Scheduled",
            appliedDate: "2024-01-08",
            nextStep: "Interview on Jan 25"
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Shortlisted":
                return "bg-green-100 text-green-800";
            case "Under Review":
                return "bg-yellow-100 text-yellow-800";
            case "Interview Scheduled":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
                <p className="text-gray-600">Track your applications and manage your job search</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{applications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Interviews Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {applications.filter(app => app.status === "Interview Scheduled").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Shortlisted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {applications.filter(app => app.status === "Shortlisted").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{application.jobTitle}</h3>
                                    <p className="text-gray-600">{application.company}</p>
                                    <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className={getStatusColor(application.status)}>
                                        {application.status}
                                    </Badge>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Next: {application.nextStep}</p>
                                        {application.status === "Interview Scheduled" && (
                                            <Button size="sm" className="mt-1">
                                                Join Interview
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
                <Button onClick={() => router.push("/candidate/applications")}>
                    View All Applications
                </Button>
                <Button variant="outline" onClick={() => router.push("/candidate/profile")}>
                    Update Profile
                </Button>
            </div>
        </div>
    );
}
