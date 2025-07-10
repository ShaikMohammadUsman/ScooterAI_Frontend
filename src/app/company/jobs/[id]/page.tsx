"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getJobCandidates, Candidate, CandidatesResponse, updateApplicationStatus, markFinalShortlist } from '@/lib/adminService';
import formatText from '@/lib/formatText';
import { toast } from "@/hooks/use-toast";
import { FaCheckCircle, FaTimesCircle, FaMicrophone, FaVideo, FaCheck, FaExternalLinkAlt, FaEdit } from 'react-icons/fa';
import { use } from 'react';
// import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import UpdateStatusModal from "@/components/UpdateStatusModal";
import CandidateFilters from "@/components/CandidateFilters";
import { FilterState } from '@/types/filter';
import ShortlistModal from '@/components/UpdateStatusModal';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function JobCandidatesPage({ params }: PageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [jobDetails, setJobDetails] = useState<CandidatesResponse['job_details'] | null>(null);
    const resolvedParams = use(params);
    const jobId = resolvedParams.id;
    const [filters, setFilters] = useState<FilterState>({
        // Application Status Filters
        applicationStatus: 'all', // 'all', 'approved', 'rejected', 'pending'
        videoAttended: false,
        shortlisted: false,
        callForInterview: false,
        // Experience Filters
        experienceRange: 'all', // 'all', '0-2', '3-5', '5-10', '10+'
        salesExperienceRange: 'all', // 'all', '0-1', '1-3', '3-5', '5+'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedCandidateForStatus, setSelectedCandidateForStatus] = useState<Candidate | null>(null);
    const [updatingShortlist, setUpdatingShortlist] = useState<string | null>(null);
    const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
    const [selectedCandidateForShortlist, setSelectedCandidateForShortlist] = useState<Candidate | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState<CandidatesResponse['pagination'] | null>(null);
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        fetchCandidates();
    }, [jobId, filters, currentPage]);

    const fetchCandidates = async () => {
        try {
            setPageLoading(true);
            const response = await getJobCandidates(
                jobId,
                currentPage, // Use current page
                pageSize,
                filters.applicationStatus === 'approved' ? true :
                    filters.applicationStatus === 'rejected' ? false : undefined, // application_status
                filters.videoAttended || undefined, // videoAttended
                filters.shortlisted || undefined, // shortlisted
                filters.callForInterview || undefined // callForInterview
            );
            setCandidates(response.candidates);
            setJobDetails(response.job_details);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast({
                title: "Error",
                description: "Failed to fetch candidates",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setPageLoading(false);
        }
    };

    const filteredCandidates = candidates?.filter(candidate => {
        // Search filter
        const matchesSearch = candidate?.basic_information?.full_name?.toLowerCase().includes(searchTerm?.toLowerCase());

        // Application status filter
        let matchesApplicationStatus = true;
        if (filters.applicationStatus !== 'all') {
            if (filters.applicationStatus === 'pending') {
                matchesApplicationStatus = candidate?.application_status === undefined || candidate?.application_status === null;
            } else if (filters.applicationStatus === 'approved') {
                matchesApplicationStatus = candidate?.application_status === true; // Moved to video round
            } else if (filters.applicationStatus === 'rejected') {
                matchesApplicationStatus = candidate?.application_status === false; // Rejected from video round
            }
        }

        // Experience range filter
        let matchesExperience = true;
        if (filters.experienceRange !== 'all') {
            const totalExp = candidate?.career_overview?.total_years_experience || 0;
            switch (filters.experienceRange) {
                case '0-2':
                    matchesExperience = totalExp >= 0 && totalExp <= 2;
                    break;
                case '3-5':
                    matchesExperience = totalExp >= 3 && totalExp <= 5;
                    break;
                case '5-10':
                    matchesExperience = totalExp >= 5 && totalExp <= 10;
                    break;
                case '10+':
                    matchesExperience = totalExp >= 10;
                    break;
            }
        }

        // Sales experience range filter
        let matchesSalesExperience = true;
        if (filters.salesExperienceRange !== 'all') {
            const salesExp = candidate?.career_overview?.years_sales_experience || 0;
            switch (filters.salesExperienceRange) {
                case '0-1':
                    matchesSalesExperience = salesExp >= 0 && salesExp <= 1;
                    break;
                case '1-3':
                    matchesSalesExperience = salesExp >= 1 && salesExp <= 3;
                    break;
                case '3-5':
                    matchesSalesExperience = salesExp >= 3 && salesExp <= 5;
                    break;
                case '5+':
                    matchesSalesExperience = salesExp >= 5;
                    break;
            }
        }

        return matchesSearch && matchesApplicationStatus && matchesExperience && matchesSalesExperience;
    });

    const getCommunicationChartData = (scores: any) => {
        return [
            { subject: 'Content & Thought', A: scores.content_and_thought.score },
            { subject: 'Verbal Delivery', A: scores.verbal_delivery.score },
            { subject: 'Non-Verbal', A: scores.non_verbal.score },
            { subject: 'Presence & Authenticity', A: scores.presence_and_authenticity.score }
        ];
    };

    const handleApplicationStatus = async (candidateId: string, status: string, note: string) => {
        setUpdatingStatus(candidateId);
        try {
            const isApproved = status === 'approve';
            const reason = note || (isApproved ? 'Seems a good fit for the role' : 'Candidate did not meet requirements');

            const response = await updateApplicationStatus({
                user_id: candidateId,
                application_status: isApproved,
                reason: reason
            });

            if (response.status || response?.user_id) {
                toast({
                    title: "Success",
                    description: isApproved ? 'Candidate approved successfully' : 'Candidate rejected successfully'
                });
                // Close modal and refresh the candidates list
                setIsStatusModalOpen(false);
                setSelectedCandidateForStatus(null);
                fetchCandidates();
            } else {
                toast({
                    title: "Error",
                    description: response.message || 'Failed to update application status',
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast({
                title: "Error",
                description: "Failed to update application status",
                variant: "destructive"
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleShortlist = async (candidateId: string, status: string, note: string) => {
        setUpdatingShortlist(candidateId);
        try {

            const reason = note || (status === 'approve' ? 'Candidate shortlisted for final round' : 'Candidate removed from shortlist');

            const response = await markFinalShortlist({
                user_id: candidateId,
                final_shortlist: status === 'approve' ? true : false,
                reason: reason
            });

            if (response.message || response?.user_id) {
                toast({
                    title: "Success",
                    description: status === 'approve' ? 'Candidate shortlisted successfully' : 'Candidate removed from shortlist'
                });
                // Close modal and refresh the candidates list
                setIsShortlistModalOpen(false);
                setSelectedCandidateForShortlist(null);
                fetchCandidates();
            } else {
                toast({
                    title: "Error",
                    description: response.message || 'Failed to update shortlist status',
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating shortlist status:', error);
            toast({
                title: "Error",
                description: "Failed to update shortlist status",
                variant: "destructive"
            });
        } finally {
            setUpdatingShortlist(null);
        }
    };

    const openStatusModal = (candidate: Candidate) => {
        setSelectedCandidateForStatus(candidate);
        setIsStatusModalOpen(true);
    };

    const openShortlistModal = (candidate: Candidate) => {
        setSelectedCandidateForShortlist(candidate);
        setIsShortlistModalOpen(true);
    };



    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedCandidate(null); // Close modal when changing pages
        setPageLoading(true); // Show loading for page change
    };

    const renderPaginationNumbers = () => {
        if (!pagination) return null;

        const { current_page, total_pages } = pagination;
        const pages = [];

        // Always show first page
        pages.push(1);

        if (total_pages <= 7) {
            // Show all pages if total is 7 or less
            for (let i = 2; i <= total_pages; i++) {
                pages.push(i);
            }
        } else {
            // Show ellipsis and selected pages
            if (current_page > 3) {
                pages.push('ellipsis1');
            }

            const start = Math.max(2, current_page - 1);
            const end = Math.min(total_pages - 1, current_page + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (current_page < total_pages - 2) {
                pages.push('ellipsis2');
            }

            if (total_pages > 1) {
                pages.push(total_pages);
            }
        }

        return pages;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col items-center justify-between gap-4">
                        <div className="w-full flex justify-between items-center gap-2 ">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {jobDetails?.title || 'Job Candidates'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="default"
                                    onClick={() => router.push(`/company/jobs/${jobId}/candidates?jobId=${jobId}`)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <FaExternalLinkAlt className="mr-2" />
                                    Detailed Insights
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={pageLoading}
                                >
                                    {pageLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        'Back to Jobs'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {jobDetails?.description && (
                            <p className="text-gray-600 mt-1 text-sm md:text-base">{jobDetails.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CandidateFilters
                    filters={filters}
                    setFilters={setFilters}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    pageLoading={pageLoading}
                    candidatesCount={candidates.length}
                    filteredCount={filteredCandidates.length}
                />

                {/* Candidates List */}
                <div className="grid grid-cols-1 gap-6">
                    {pageLoading ? (
                        // Loading skeleton for candidates
                        Array.from({ length: pageSize }).map((_, index) => (
                            <Card key={`loading-${index}`} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        filteredCandidates.map((candidate) => (
                            <Card key={candidate?.profile_id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {candidate?.basic_information?.full_name}
                                        </h3>
                                        {/* <p className="text-gray-600 mt-2">
                                            {candidate?.basic_information?.email}
                                        </p> */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-sm text-gray-500">
                                                {candidate?.career_overview?.total_years_experience} years exp
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm text-gray-500">
                                                {candidate?.career_overview?.years_sales_experience} years sales
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        {candidate?.interview_status?.audio_interview_passed && (
                                            <span className="flex items-center gap-2 p-2 text-green-600 bg-green-50 rounded-full">
                                                <FaMicrophone /> <FaCheck />
                                            </span>
                                        )}
                                        {candidate?.interview_status?.video_interview_attended && (
                                            <span className="flex items-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-full">
                                                <FaVideo /> <FaCheck />
                                            </span>
                                        )}
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                            onClick={() => setSelectedCandidate(candidate)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {candidate?.basic_information?.languages_spoken?.map((lang, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                                            >
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                    {typeof candidate?.call_for_interview === 'boolean' && (
                                        <div className="flex items-center justify-center gap-2">
                                            {candidate.call_for_interview &&
                                                <div className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-full">
                                                    <span className="text-sm font-medium">Called for Final Interview</span>
                                                    <FaCheckCircle className="text-green-600" />
                                                </div>
                                            }
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                            onClick={() => openShortlistModal(candidate)}
                                            disabled={updatingShortlist === candidate?.profile_id}
                                        >
                                            <FaCheck className="text-white animate-pulse" />
                                            {updatingShortlist === candidate?.profile_id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Shortlist'
                                            )}
                                        </Button>
                                        {candidate?.interview_status?.resume_url && (
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                onClick={() => {
                                                    if (candidate?.interview_status?.resume_url) {
                                                        window.open(candidate?.interview_status?.resume_url, '_blank');
                                                    }
                                                }}
                                            >
                                                View Resume
                                            </Button>
                                        )}

                                        {typeof candidate?.application_status === 'boolean' && (
                                            <div className="flex items-center justify-center gap-2">
                                                {candidate.application_status ? (
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-full">
                                                        <span className="text-sm font-medium">Moved to Video Round</span>
                                                        <FaCheckCircle className="text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-800 rounded-full">
                                                        <span className="text-sm font-medium">Rejected</span>
                                                        <FaTimesCircle className="text-red-600" />
                                                    </div>
                                                )}

                                                {/* {candidate?.application_status_reason && (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded-md">
                                                        <span>{candidate.application_status_reason}</span>
                                                    </div>
                                                )} */}
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                            onClick={() => openStatusModal(candidate)}
                                            disabled={updatingStatus === candidate?.profile_id}
                                        >
                                            <FaEdit className="text-white animate-pulse" />
                                            {updatingStatus === candidate?.profile_id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                typeof candidate?.application_status === 'string' ? 'Add Status' : 'Update Status'
                                            )}
                                        </Button>

                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={!pagination.has_previous || pageLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        disabled={pageLoading}
                                    />
                                </PaginationItem>

                                {renderPaginationNumbers()?.map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === 'ellipsis1' || page === 'ellipsis2' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() => handlePageChange(page as number)}
                                                className={pageLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                disabled={pageLoading}
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={!pagination.has_next || pageLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        disabled={pageLoading}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Pagination Info */}
                {pagination && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        {pageLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span>Loading candidates...</span>
                            </div>
                        ) : (
                            `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, pagination.total_candidates)} of ${pagination.total_candidates} candidates`
                        )}
                    </div>
                )}

                {/* Candidate Details Modal */}
                {selectedCandidate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {selectedCandidate?.basic_information?.full_name}
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            {selectedCandidate?.basic_information?.current_location}
                                        </p>
                                        {selectedCandidate?.basic_information?.languages_spoken && selectedCandidate?.basic_information?.languages_spoken?.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {selectedCandidate?.basic_information?.languages_spoken?.map((lang: string, index: number) => (
                                                    <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Current CTC:</span>
                                            <span className="px-2 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                                {selectedCandidate?.basic_information?.current_ctc?.value ?
                                                    `${selectedCandidate?.basic_information.current_ctc.currencyType} ${selectedCandidate?.basic_information.current_ctc.value.toLocaleString()}` :
                                                    'Not specified'}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedCandidate(null)}
                                            className="text-gray-50 hover:text-white hover:bg-red-700 bg-red-500"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>

                                {/* Career Overview */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Career Overview</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Experience</p>
                                            <p className="text-lg font-semibold">{selectedCandidate?.career_overview?.total_years_experience} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Sales Experience</p>
                                            <p className="text-lg font-semibold">{selectedCandidate?.career_overview?.years_sales_experience} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Avg. Tenure</p>
                                            <p className="text-lg font-semibold">{selectedCandidate?.career_overview?.average_tenure_per_role} years</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Notice Period</p>
                                            <p className="text-lg font-semibold">
                                                {selectedCandidate?.basic_information?.notice_period || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Company History */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Company History</h4>
                                    <div className="space-y-3">
                                        {selectedCandidate?.career_overview?.company_history?.map((company, index: number) => (
                                            <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900">{company.position}</h5>
                                                    <p className="text-gray-600">{company.company_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">
                                                        {company.start_date ? new Date(company.start_date).toLocaleDateString() : ''} - {company.is_current ? 'Present' : (company.end_date ? new Date(company.end_date).toLocaleDateString() : 'Not specified')}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{company.duration_months} months</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{selectedCandidate?.basic_information?.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium">{selectedCandidate?.basic_information?.phone_number}</p>
                                        </div>
                                        {selectedCandidate?.basic_information?.linkedin_url && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">LinkedIn</p>
                                                <a
                                                    href={selectedCandidate?.basic_information?.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                                >
                                                    View Profile <FaExternalLinkAlt className="text-sm" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    {selectedCandidate?.interview_status?.video_interview_url && (
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate?.interview_status?.video_interview_url) {
                                                    window.open(selectedCandidate?.interview_status?.video_interview_url, '_blank');
                                                }
                                            }}
                                        >
                                            <FaVideo className="mr-2" />
                                            Watch Video Interview
                                        </Button>
                                    )}
                                    {selectedCandidate?.interview_status?.audio_interview_url && (
                                        <Button
                                            variant="default"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate?.interview_status?.audio_interview_url) {
                                                    window.open(selectedCandidate?.interview_status?.audio_interview_url, '_blank');
                                                }
                                            }}
                                        >
                                            <FaMicrophone className="mr-2" />
                                            Listen to Audio Interview
                                        </Button>
                                    )}
                                    {selectedCandidate?.interview_status?.resume_url && (
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedCandidate?.interview_status?.resume_url) {
                                                    window.open(selectedCandidate?.interview_status?.resume_url, '_blank');
                                                }
                                            }}
                                        >
                                            View Resume
                                        </Button>
                                    )}
                                </div>

                                {/* Audio Interview Q&A */}
                                {selectedCandidate?.audio_interview_details && (
                                    <div className="mt-8">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Audio Interview Evaluation</h4>

                                        {/* Summary */}
                                        <div className="mb-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Average Score</p>
                                                    <p className="text-lg font-semibold">{selectedCandidate?.audio_interview_details?.audio_interview_summary?.average_score?.toFixed(1)}/5</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Credibility</p>
                                                    <p className="text-lg font-semibold">{selectedCandidate?.audio_interview_details?.audio_interview_summary?.dimension_averages?.credibility?.toFixed(1)}/5</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Ownership</p>
                                                    <p className="text-lg font-semibold">{selectedCandidate?.audio_interview_details?.audio_interview_summary?.dimension_averages?.ownership_depth?.toFixed(1)}/5</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Communication</p>
                                                    <p className="text-lg font-semibold">{selectedCandidate?.audio_interview_details?.audio_interview_summary?.dimension_averages?.communication?.toFixed(1)}/5</p>
                                                </div>
                                            </div>

                                            {/* Areas for Improvement */}
                                            {selectedCandidate?.audio_interview_details?.audio_interview_summary?.areas_for_improvement?.length > 0 && (
                                                <div className="bg-red-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-red-900 mb-2">Areas for Improvement</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {selectedCandidate?.audio_interview_details?.audio_interview_summary?.areas_for_improvement?.map((area, index) => (
                                                            <li key={index} className="text-sm text-red-700">{area}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Q&A Evaluations */}
                                        <Accordion type="single" collapsible className="space-y-4">
                                            {selectedCandidate?.audio_interview_details?.qa_evaluations?.map((qa, index) => (
                                                <AccordionItem key={index} value={`audio-qa-${index}`} className="bg-gray-50 rounded-lg px-4">
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-medium text-gray-900">Question {index + 1}</span>
                                                            <span className="text-sm text-gray-500">
                                                                Score: {qa.evaluation?.overall_score}/5
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-4 pt-2">
                                                            <div>
                                                                <h5 className="font-medium text-gray-900 mb-2">Question</h5>
                                                                <p className="text-gray-700">{qa.question}</p>
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-gray-900 mb-2">Answer</h5>
                                                                <p className="text-gray-700">{qa.answer}</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Credibility</p>
                                                                    <p className="font-medium">{qa.evaluation?.credibility?.score}/5</p>
                                                                    <p className="text-sm text-gray-500 mt-1">{qa.evaluation?.credibility?.feedback}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Ownership</p>
                                                                    <p className="font-medium">{qa.evaluation?.ownership_depth?.score}/5</p>
                                                                    <p className="text-sm text-gray-500 mt-1">{qa.evaluation?.ownership_depth?.feedback}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Communication</p>
                                                                    <p className="font-medium">{qa.evaluation?.communication?.score}/5</p>
                                                                    <p className="text-sm text-gray-500 mt-1">{qa.evaluation?.communication?.feedback}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Confidence</p>
                                                                    <p className="font-medium">{qa.evaluation?.confidence?.score}/5</p>
                                                                    <p className="text-sm text-gray-500 mt-1">{qa.evaluation?.confidence?.feedback}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Summary</p>
                                                                <div
                                                                    className="text-sm text-gray-500 mt-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: formatText(qa.evaluation?.summary)
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                )}

                                {/* Video Interview Q&A */}
                                {selectedCandidate?.interview_details && (
                                    <div className="mt-8">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Video Interview Evaluation</h4>

                                        {/* Communication Evaluation */}
                                        {selectedCandidate?.interview_details?.communication_evaluation && Object.keys(selectedCandidate?.interview_details?.communication_evaluation).length > 0 && (
                                            <div className="mb-6">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    {selectedCandidate?.interview_details?.communication_evaluation?.overall_score && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-sm text-gray-600">Overall Score</p>
                                                            <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.communication_evaluation?.overall_score?.toFixed(1)}/5</p>
                                                        </div>
                                                    )}
                                                    {selectedCandidate?.interview_details?.communication_evaluation?.content_and_thought && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-sm text-gray-600">Content & Thought</p>
                                                            <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.communication_evaluation?.content_and_thought?.score}/5</p>
                                                        </div>
                                                    )}
                                                    {selectedCandidate?.interview_details?.communication_evaluation?.verbal_delivery && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-sm text-gray-600">Verbal Delivery</p>
                                                            <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.communication_evaluation?.verbal_delivery?.score}/5</p>
                                                        </div>
                                                    )}
                                                    {selectedCandidate?.interview_details?.communication_evaluation?.non_verbal && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-sm text-gray-600">Non-Verbal</p>
                                                            <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.communication_evaluation?.non_verbal?.score}/5</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedCandidate?.interview_details?.communication_evaluation?.summary && (
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
                                                        <div
                                                            className="text-gray-700"
                                                            dangerouslySetInnerHTML={{
                                                                __html: formatText(selectedCandidate?.interview_details?.communication_evaluation?.summary)
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Q&A Evaluations */}
                                        {selectedCandidate?.interview_details?.qa_evaluations && (
                                            <div className="mb-6">
                                                {/* Overall Scores */}
                                                {selectedCandidate?.interview_details?.qa_evaluations?.overall_scores && (
                                                    <div className="mb-6">
                                                        <h5 className="font-medium text-gray-900 mb-3">Overall Scores</h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-sm text-gray-600">Average Skill Score</p>
                                                                <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.qa_evaluations?.overall_scores?.average_skill_score?.toFixed(1)}/5</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-sm text-gray-600">Average Trait Score</p>
                                                                <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.qa_evaluations?.overall_scores?.average_trait_score?.toFixed(1)}/5</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-sm text-gray-600">Total Questions</p>
                                                                <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.qa_evaluations?.overall_scores?.total_questions}</p>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-sm text-gray-600">Questions with Signal</p>
                                                                <p className="text-lg font-semibold">{selectedCandidate?.interview_details?.qa_evaluations?.overall_scores?.questions_with_signal}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Summary */}
                                                {selectedCandidate?.interview_details?.qa_evaluations?.summary && (
                                                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                                        <h5 className="font-medium text-blue-900 mb-2">Evaluation Summary</h5>
                                                        <div
                                                            className="text-sm text-blue-700"
                                                            dangerouslySetInnerHTML={{
                                                                __html: formatText(selectedCandidate?.interview_details?.qa_evaluations?.summary)
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Question Evaluations */}
                                                <Accordion type="single" collapsible className="space-y-4">
                                                    {selectedCandidate?.interview_details?.qa_evaluations?.question_evaluations?.map((qa, index) => (
                                                        <AccordionItem key={index} value={`video-qa-${index}`} className="bg-gray-50 rounded-lg px-4">
                                                            <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex items-center justify-between w-full pr-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="font-medium text-gray-900">Question {qa?.question_number}</span>
                                                                        <div className="flex gap-2">
                                                                            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                                Skill: {qa?.skill_score}/5
                                                                            </span>
                                                                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                                                                Trait: {qa?.trait_score}/5
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {qa?.has_signal && (
                                                                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                                                            Signal Detected
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="space-y-4 pt-2">
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-900 mb-2">Question</h5>
                                                                        <p className="text-gray-700">{qa?.question}</p>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-900 mb-2">Answer</h5>
                                                                        <p className="text-gray-700">{qa?.answer}</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="bg-blue-50 p-3 rounded-lg">
                                                                            <h6 className="font-medium text-blue-900 mb-2">Skill Reasoning</h6>
                                                                            <div
                                                                                className="text-sm text-blue-700"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: formatText(qa?.skill_reasoning)
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="bg-green-50 p-3 rounded-lg">
                                                                            <h6 className="font-medium text-green-900 mb-2">Trait Reasoning</h6>
                                                                            <div
                                                                                className="text-sm text-green-700"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html: formatText(qa?.trait_reasoning)
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {filteredCandidates.length === 0 && !pageLoading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                )}

                {/* Shortlist Modal */}
                {/* Status Update Modal */}
                <UpdateStatusModal
                    isOpen={isStatusModalOpen}
                    onClose={() => {
                        setIsStatusModalOpen(false);
                        setSelectedCandidateForStatus(null);
                    }}
                    onSubmit={(status, note) => {
                        if (selectedCandidateForStatus) {
                            handleApplicationStatus(selectedCandidateForStatus.profile_id, status, note);
                        }
                    }}
                    candidateName={selectedCandidateForStatus?.basic_information?.full_name || ''}
                    isLoading={updatingStatus === selectedCandidateForStatus?.profile_id}
                    currentStatus={typeof selectedCandidateForStatus?.application_status === 'boolean' ? selectedCandidateForStatus.application_status : (selectedCandidateForStatus?.application_status === 'string' ? null : undefined)}
                    currentNote={selectedCandidateForStatus?.application_status_reason}
                />
                {/* Shortlist Modal */}
                <ShortlistModal
                    isOpen={isShortlistModalOpen}
                    onClose={() => {
                        setIsShortlistModalOpen(false);
                        setSelectedCandidateForShortlist(null);
                    }}
                    onSubmit={(status, note) => {
                        if (selectedCandidateForShortlist) {
                            handleShortlist(selectedCandidateForShortlist.profile_id, status, note);
                        }
                    }}
                    candidateName={selectedCandidateForShortlist?.basic_information?.full_name || ''}
                    isLoading={updatingShortlist === selectedCandidateForShortlist?.profile_id}
                    currentStatus={typeof selectedCandidateForShortlist?.final_shortlist === 'boolean' ? selectedCandidateForShortlist.final_shortlist : (selectedCandidateForShortlist?.final_shortlist === 'string' ? null : undefined)}
                    currentNote={selectedCandidateForShortlist?.shortlist_status_reason}
                />
            </div>
        </div>
    );
} 