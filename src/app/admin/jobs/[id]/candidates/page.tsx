"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getJobCandidates, isSuperAdminAccessTokenValid } from "@/lib/superAdminService";
import { JobCandidatesResponse, Candidate } from "@/lib/superAdminService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    DollarSign,
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobCandidatesPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [data, setData] = useState<JobCandidatesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    useEffect(() => {
        if (!isSuperAdminAccessTokenValid()) {
            router.replace("/admin/login");
            return;
        }

        fetchCandidates();
    }, [jobId, currentPage]);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getJobCandidates(jobId, currentPage, pageSize);
            setData(response);
        } catch (err: any) {
            setError(err.message || "Failed to fetch candidates");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency === 'INR' ? 'INR' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getInterviewStatusBadge = (candidate: Candidate) => {
        const interview_status = candidate.interview_status;

        if (!interview_status) {
            return <Badge variant="outline">Not Started</Badge>;
        }

        if (interview_status.video_interview_attended) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Video Completed</Badge>;
        } else if (interview_status.audio_interview_passed) {
            return <Badge variant="default" className="bg-blue-100 text-blue-800">Audio Passed</Badge>;
        } else if (interview_status.audio_interview_attended) {
            return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Audio Completed</Badge>;
        } else {
            return <Badge variant="outline">Not Started</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading candidates...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={fetchCandidates} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">No Data</h2>
                    <p className="text-gray-600">Unable to load candidate data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-semibold mb-2">{data.job_details?.title || 'Job Candidates'}</h1>
                <p className="text-gray-600">Candidates for this job position</p>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.job_details?.candidate_count || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Audio Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.job_details?.audio_attended_count || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Video Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.job_details?.video_attended_count || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Moved to Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.job_details?.moved_to_video_round_count || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidates ({data.pagination?.total_candidates || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-100 border-b-2 border-gray-200">
                                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Experience</TableHead>
                                    <TableHead className="font-semibold text-gray-700">CTC</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.candidates && data.candidates.length > 0 ? (
                                    data.candidates.map((candidate, index) => (
                                        <TableRow
                                            key={candidate.application_id}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                                        >
                                            <TableCell className="py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{candidate.name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {candidate.basic_information?.full_name || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Mail className="h-3 w-3 mr-1 text-blue-500" />
                                                        {candidate.email || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <Phone className="h-3 w-3 mr-1 text-green-500" />
                                                        {candidate.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <MapPin className="h-3 w-3 mr-1 text-orange-500" />
                                                    {candidate.basic_information?.current_location || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-sm text-gray-700">
                                                    <div className="font-medium">{candidate.career_overview?.total_years_experience || 0} years</div>
                                                    <div className="text-xs text-gray-500">
                                                        {candidate.career_overview?.years_sales_experience || 0} sales
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="text-sm text-gray-700">
                                                    <div className="flex items-center font-medium">
                                                        <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                                                        {candidate.basic_information?.current_ctc?.value !== undefined
                                                            ? formatCurrency(
                                                                candidate.basic_information.current_ctc.value,
                                                                candidate.basic_information.current_ctc.currencyType || 'INR'
                                                            )
                                                            : 'Not specified'
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Expected: {candidate.basic_information?.expected_ctc?.value !== undefined
                                                            ? formatCurrency(
                                                                candidate.basic_information.expected_ctc.value,
                                                                candidate.basic_information.expected_ctc.currencyType || 'INR'
                                                            )
                                                            : 'Not specified'
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getInterviewStatusBadge(candidate)}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                    {candidate.resume_url && (
                                                        <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-300" asChild>
                                                            <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-3 w-3 mr-1" />
                                                                Resume
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500 bg-gray-50">
                                            <div className="flex flex-col items-center">
                                                <Users className="h-12 w-12 text-gray-300 mb-4" />
                                                <p className="text-lg font-medium">No candidates found</p>
                                                <p className="text-sm">No candidates have applied for this job yet.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data.pagination && data.pagination.total_pages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-600">
                                Showing {((data.pagination.current_page - 1) * data.pagination.page_size) + 1} to{' '}
                                {Math.min(data.pagination.current_page * data.pagination.page_size, data.pagination.total_candidates)} of{' '}
                                {data.pagination.total_candidates} candidates
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!data.pagination.has_previous}
                                    className="hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!data.pagination.has_next}
                                    className="hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
