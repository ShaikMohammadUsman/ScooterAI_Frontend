"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


import { getJobCandidates, Candidate, CandidatesResponse, updateApplicationStatus, markFinalShortlist, resetVideoInterview, downloadContactsCsv } from '@/lib/adminService';
import ReactMarkdown from 'react-markdown';
import { toast } from "@/hooks/use-toast";
import { FaCheckCircle, FaTimesCircle, FaMicrophone, FaVideo, FaCheck, FaExternalLinkAlt, FaEdit, FaClock, FaPlay, FaPause, FaStop, FaEye, FaEyeSlash, FaMousePointer, FaKeyboard, FaMobile, FaDesktop, FaEnvelope } from 'react-icons/fa';
import { use } from 'react';
// import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import UpdateStatusModal from "@/components/UpdateStatusModal";
import CandidateFilters from "@/components/CandidateFilters";
import { FilterState } from '@/types/filter';
import ShortlistModal from '@/components/ShortlistModal';
import InterviewStatusTimeline from '@/components/InterviewStatusTimeline';
import ResetVideoInterviewModal from '@/components/ResetVideoInterviewModal';
import ProctoringDetailsDialog from '@/components/ProctoringDetailsDialog';
import InterviewScoreCompact from '@/components/candidates/InterviewScoreCompact';
import InterviewScoreCard from '@/components/candidates/InterviewScoreCard';
import VideoPlayer from '@/components/interview/VideoPlayer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewApplicantCard from "@/components/company/cards/NewApplicantCard";
import SeenApplicantCard from "@/components/company/cards/SeenApplicantCard";
import ShortlistedApplicantCard from "@/components/company/cards/ShortlistedApplicantCard";
import RejectedApplicantCard from "@/components/company/cards/RejectedApplicantCard";

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
        // Location filter
        location: 'all',

        // Application Status filters
        audioAttended: false,
        videoInterviewSent: false,
        videoAttended: false,
        sendToHiringManager: false,
        profileOnly: false, // New filter for candidates who only created profile

        // Experience Filters
        experienceRange: 'all', // 'all', '0-2', '3-5', '5-10', '10+'
        salesExperienceRange: 'all', // 'all', '0-1', '1-3', '3-5', '5+'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [updatingShortlist, setUpdatingShortlist] = useState<string | null>(null);
    const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);

    // Reset video interview states
    const [isResetVideoModalOpen, setIsResetVideoModalOpen] = useState(false);
    const [isProctorDialogOpen, setIsProctorDialogOpen] = useState(false);

    // Media player toggle states
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20); // Default page size
    const [pagination, setPagination] = useState<CandidatesResponse['pagination'] | null>(null);
    const [pageLoading, setPageLoading] = useState(false);

    // Active tab for primary status buckets
    const [activeTab, setActiveTab] = useState<'new' | 'seen' | 'shortlisted' | 'rejected'>('shortlisted');

    // Smart filtering state
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [filteredCount, setFilteredCount] = useState(0);
    const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);
    const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Debounce search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Smart page size calculation
    const getSmartPageSize = () => {
        const hasBasicFilters = filters.location !== 'all' ||
            filters.experienceRange !== 'all' ||
            filters.salesExperienceRange !== 'all' ||
            debouncedSearchTerm.trim() !== '';

        const hasAdvancedFilters = filters.audioAttended ||
            filters.videoInterviewSent ||
            filters.videoAttended ||
            filters.sendToHiringManager ||
            filters.profileOnly;

        // Use larger page size for basic filters, smaller for advanced filters
        if (hasBasicFilters && !hasAdvancedFilters) {
            return Math.max(pageSize, 50); // At least 50 for basic filters
        } else if (hasAdvancedFilters) {
            return Math.min(pageSize, 20); // Max 20 for advanced filters
        } else {
            return pageSize; // Use user-selected page size
        }
    };

    useEffect(() => {
        // Set debounced search term after a short delay
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        fetchCandidates();
    }, [jobId, activeTab, currentPage, pageSize]);

    // Refetch on inline Seen filters change (only for Seen tab)
    useEffect(() => {
        if (activeTab !== 'seen') return;
        // Reset to first page when filters change
        setCurrentPage(1);
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.audioAttended, filters.videoAttended, filters.videoInterviewSent, activeTab]);

    // Listen to card-level view actions
    useEffect(() => {
        const handler = (e: any) => {
            const pid = e?.detail?.profileId as string | undefined;
            if (!pid) return;
            const cand = candidates.find(c => c.profile_id === pid);
            if (cand) setSelectedCandidate(cand);
        };
        window.addEventListener('openCandidateDetails', handler as any);
        return () => window.removeEventListener('openCandidateDetails', handler as any);
    }, [candidates]);

    // Reset page when switching tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const fetchCandidates = async () => {
        try {
            setPageLoading(true);

            // Map active tab to backend params only (minimalistic)
            let applicationStatus: boolean | string | undefined;
            let audioAttendedParam: boolean | undefined;
            let videoAttendedParam: boolean | undefined;
            let videoInterviewSentParam: boolean | undefined;
            let shortlistedParam: boolean | undefined;

            switch (activeTab) {
                case 'new':
                    audioAttendedParam = false; // profile created only
                    break;
                case 'seen':
                    {
                        const audioSelected = filters.audioAttended === true;
                        const videoSelected = filters.videoAttended === true;
                        const sentSelected = filters.videoInterviewSent === true;

                        // If no explicit filter selected, default Seen to audio completed
                        if (!audioSelected && !videoSelected && !sentSelected) {
                            audioAttendedParam = true;
                        } else {
                            if (audioSelected) audioAttendedParam = true;
                            if (videoSelected) videoAttendedParam = true;
                            if (sentSelected) videoInterviewSentParam = true;
                        }
                    }
                    break;
                case 'shortlisted':
                    shortlistedParam = true; // sent to hiring manager
                    break;
                case 'rejected':
                    applicationStatus = 'rejected';
                    break;
            }

            const smartPageSize = getSmartPageSize();

            const response = await getJobCandidates(
                jobId,
                currentPage,
                smartPageSize,
                applicationStatus,
                videoAttendedParam, // video_attended
                shortlistedParam, // shortlisted
                undefined, // call_for_interview
                audioAttendedParam, // audio_attended
                videoInterviewSentParam, // video_interview_sent
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

    const loadMoreCandidates = async () => {
        if (isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            // Mirror the same mapping as the main fetch based on activeTab
            let nextApplicationStatus: boolean | string | undefined;
            let nextAudioAttended: boolean | undefined;
            let nextVideoAttended: boolean | undefined;
            let nextVideoInterviewSent: boolean | undefined;
            let nextShortlisted: boolean | undefined;

            switch (activeTab) {
                case 'new':
                    nextAudioAttended = false;
                    break;
                case 'seen':
                    {
                        const audioSelected = filters.audioAttended === true;
                        const videoSelected = filters.videoAttended === true;
                        const sentSelected = filters.videoInterviewSent === true;

                        if (!audioSelected && !videoSelected && !sentSelected) {
                            nextAudioAttended = true;
                        } else {
                            if (audioSelected) nextAudioAttended = true;
                            if (videoSelected) nextVideoAttended = true;
                            if (sentSelected) nextVideoInterviewSent = true;
                        }
                    }
                    break;
                case 'shortlisted':
                    nextShortlisted = true;
                    break;
                case 'rejected':
                    nextApplicationStatus = 'rejected';
                    break;
            }

            const response = await getJobCandidates(
                jobId,
                nextPage,
                pageSize,
                nextApplicationStatus,
                nextVideoAttended,
                nextShortlisted,
                undefined,
                nextAudioAttended,
                nextVideoInterviewSent,
            );

            // Append new candidates to existing ones
            setCandidates(prev => [...prev, ...response.candidates]);
            setCurrentPage(nextPage);

            toast({
                title: "Success",
                description: `Loaded ${response.candidates.length} more candidates`,
            });
        } catch (error) {
            console.error('Error loading more candidates:', error);
            toast({
                title: "Error",
                description: "Failed to load more candidates",
                variant: "destructive"
            });
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Memoized filtered candidates to prevent unnecessary recalculations
    const filteredCandidates = useMemo(() => {
        if (!candidates) return [];

        // Apply inline filters ONLY for the Seen tab; otherwise, do not filter
        if (activeTab !== 'seen') {
            return candidates;
        }

        const filtered = candidates.filter(candidate => {
            // Only apply three Seen inline filters

            // Audio completed
            let matchesAudioAttended = true;
            if (filters.audioAttended) {
                matchesAudioAttended = candidate?.interview_status?.audio_interview_attended === true;
            }

            // Video interview sent
            let matchesVideoInterviewSent = true;
            if (filters.videoInterviewSent) {
                matchesVideoInterviewSent = candidate?.application_status === 'SendVideoLink' ||
                    candidate?.interview_status?.video_interview_url != null;
            }

            // Video completed
            let matchesVideoAttended = true;
            if (filters.videoAttended) {
                matchesVideoAttended = candidate?.interview_status?.video_interview_attended === true;
            }

            return matchesAudioAttended && matchesVideoInterviewSent && matchesVideoAttended;
        });

        // Update smart filtering state
        const hasFilters = filters.location !== 'all' ||
            filters.audioAttended ||
            filters.videoInterviewSent ||
            filters.videoAttended ||
            filters.sendToHiringManager ||
            filters.profileOnly ||
            filters.experienceRange !== 'all' ||
            filters.salesExperienceRange !== 'all' ||
            debouncedSearchTerm.trim() !== '';

        setHasActiveFilters(hasFilters);
        setFilteredCount(filtered.length);
        setShowNoResultsMessage(hasFilters && filtered.length === 0 && candidates.length > 0);

        return filtered;
    }, [candidates, debouncedSearchTerm, filters]);

    const getCommunicationChartData = (scores: any) => {
        return [
            { subject: 'Content & Thought', A: scores.content_and_thought.score },
            { subject: 'Verbal Delivery', A: scores.verbal_delivery.score },
            { subject: 'Non-Verbal', A: scores.non_verbal.score },
            { subject: 'Presence & Authenticity', A: scores.presence_and_authenticity.score }
        ];
    };

    // Helper functions to handle both old and new audio interview formats
    const getAudioSummaryScore = (candidate: any) => {
        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        if (!summary) return null;

        // Check if this is new format (scores out of 100)
        if (summary.average_score !== undefined) {
            // If average_score is > 20, it's likely new format (0-100 scale)
            if (summary.average_score > 20) {
                return summary.average_score;
            }
            // If average_score is <= 20, it's likely old format (0-5 scale), convert it
            else {
                return summary.average_score * 20;
            }
        }

        // Fallback: calculate from dimension_averages if available
        if (summary.dimension_averages) {
            const scores = Object.values(summary.dimension_averages).filter(score => typeof score === 'number');
            if (scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                return avgScore * 20; // Convert from 0-5 scale to 0-100 scale
            }
        }

        return null;
    };

    const getAudioCredibilityScore = (candidate: any) => {
        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        if (!summary) return null;

        // New format - scores are out of 100
        if (summary.credibility_score !== undefined) {
            return summary.credibility_score;
        }

        // Old format - scores are out of 5, convert to out of 100
        const oldScore = summary.dimension_averages?.credibility;
        return oldScore ? oldScore * 20 : null;
    };

    const getAudioCommunicationScore = (candidate: any) => {
        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        if (!summary) return null;

        // New format - scores are out of 100
        if (summary.communication_score !== undefined) {
            return summary.communication_score;
        }

        // Old format - scores are out of 5, convert to out of 100
        const oldScore = summary.dimension_averages?.communication;
        return oldScore ? oldScore * 20 : null;
    };

    const getAudioOwnershipScore = (candidate: any) => {
        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        if (!summary) return null;

        // Old format only - scores are out of 5, convert to out of 100
        const oldScore = summary.dimension_averages?.ownership_depth;
        return oldScore ? oldScore * 20 : null;
    };

    const getAudioAreasForImprovement = (candidate: any) => {
        const summary = candidate?.audio_interview_details?.audio_interview_summary;
        if (!summary?.areas_for_improvement) return [];

        return summary.areas_for_improvement;
    };

    const getAudioQAEvaluations = (candidate: any) => {
        return candidate?.audio_interview_details?.qa_evaluations || [];
    };

    const getQAEvaluationScore = (qa: any) => {
        // New format - scores are out of 100
        if (qa.evaluation?.credibility_score !== undefined) {
            return (qa.evaluation.credibility_score + qa.evaluation.communication_score) / 2;
        }

        // Old format - scores are out of 5, convert to out of 100
        if (qa.evaluation?.overall_score !== undefined) {
            return qa.evaluation.overall_score * 20;
        }

        return null;
    };

    const getQAEvaluationDimensions = (qa: any) => {
        // New format - scores are out of 100
        if (qa.evaluation?.credibility_score !== undefined) {
            return {
                credibility: { score: qa.evaluation.credibility_score, feedback: qa.evaluation.fit_summary },
                communication: { score: qa.evaluation.communication_score, feedback: qa.evaluation.fit_summary },
                ownership: null, // Not available in new format
                confidence: null // Not available in new format
            };
        }

        // Old format - scores are out of 5, convert to out of 100
        return {
            credibility: qa.evaluation?.credibility ? {
                score: qa.evaluation.credibility.score * 20,
                feedback: qa.evaluation.credibility.feedback
            } : null,
            communication: qa.evaluation?.communication ? {
                score: qa.evaluation.communication.score * 20,
                feedback: qa.evaluation.communication.feedback
            } : null,
            ownership: qa.evaluation?.ownership_depth ? {
                score: qa.evaluation.ownership_depth.score * 20,
                feedback: qa.evaluation.ownership_depth.feedback
            } : null,
            confidence: qa.evaluation?.confidence ? {
                score: qa.evaluation.confidence.score * 20,
                feedback: qa.evaluation.confidence.feedback
            } : null
        };
    };

    const handleApplicationStatus = async (candidateId: string, status: string, note: string) => {
        setUpdatingStatus(candidateId);
        try {
            // Map the new status values to the API format
            let applicationStatus: string;
            let reason: string;

            switch (status) {
                case 'SendVideoLink':
                    applicationStatus = 'SendVideoLink';
                    reason = note || 'Video interview link sent to candidate';
                    break;
                case 'NudgeForAudio':
                    applicationStatus = 'NudgeForAudio';
                    reason = note || 'Nudge sent for audio interview completion';
                    break;
                case 'NudgeForVideo':
                    applicationStatus = 'NudgeForVideo';
                    reason = note || 'Nudge sent for video interview completion';
                    break;
                case 'Rejected':
                    applicationStatus = 'Rejected';
                    reason = note || 'Candidate rejected';
                    break;
                default:
                    applicationStatus = 'Rejected';
                    reason = note || 'Status updated';
            }

            const response = await updateApplicationStatus({
                user_id: candidateId,
                application_status: applicationStatus,
                reason: reason
            });

            if (response.status || response?.user_id) {
                toast({
                    title: "Success",
                    description: `Status updated to: ${status}`
                });
                // Close modal and refresh the candidates list
                setIsStatusModalOpen(false);
                setSelectedCandidate(null);
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
                setSelectedCandidate(null);
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

    const handleDownloadCSV = async () => {
        try {
            const csvBlob = await downloadContactsCsv(jobId, {
                audio_attended: filters.audioAttended || undefined,
                video_attended: filters.videoAttended || undefined,
                shortlisted: filters.sendToHiringManager || undefined,
                video_interview_sent: filters.videoInterviewSent || undefined,
            })
            const url = URL.createObjectURL(csvBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `contacts_${jobId}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast({ title: 'Download started', description: 'Your CSV is being downloaded.' })
        } catch (err: any) {
            toast({ title: 'Download failed', description: err.message || 'Unable to download CSV', variant: 'destructive' })
        }
    }

    const openStatusModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsStatusModalOpen(true);
    };

    const openShortlistModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsShortlistModalOpen(true);
    };

    const openResetVideoModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsResetVideoModalOpen(true);
    };

    // Reset media player states when candidate changes
    useEffect(() => {
        if (selectedCandidate) {
            setShowVideoPlayer(false);
            setShowAudioPlayer(false);
        }
    }, [selectedCandidate]);



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
        <div className="min-h-screen max-w-6xl mx-auto bg-background p-2 sm:p-4">
            {/* Header */}
            <div className="bg-transparent rounded-lg mb-4 sm:mb-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="flex flex-col items-center justify-between gap-3 sm:gap-4">
                        <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                            <h1 className="t-lg font-semibold text-gray-900 text-center sm:text-left">
                                {jobDetails?.title || 'Job Candidates'}
                            </h1>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                {/* <Button
                                    variant="default"
                                    onClick={() => router.push(`/company/jobs/${jobId}/candidates?jobId=${jobId}`)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-sm sm:text-base"
                                >
                                    <FaExternalLinkAlt className="mr-2" />
                                    Detailed Insights
                                </Button> */}
                                <Button
                                    variant="link"
                                    onClick={() => router.back()}
                                    disabled={pageLoading}
                                    className="w-full sm:w-auto text-sm sm:text-base"
                                >
                                    {pageLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        'View Open Roles'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* {jobDetails?.description && (
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base text-center sm:text-left">{jobDetails.description}</p>
                        )} */}
                    </div>
                </div>
            </div>

            {/* Primary Status Tabs */}
            <div className="max-w-7xl mx-auto">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="w-full justify-between bg-transparent p-0 h-auto border-b border-muted rounded-none">
                        {[
                            { value: 'new', label: 'New Applicants' },
                            { value: 'seen', label: 'Seen' },
                            { value: 'shortlisted', label: 'Shortlisted' },
                            { value: 'rejected', label: 'Rejected' },
                        ].map(({ value, label }) => (
                            <TabsTrigger
                                key={value}
                                value={value as any}
                                className="relative rounded-none bg-transparent text-text-primary data-[state=active]:shadow-none data-[state=active]:text-foreground px-4 py-2"
                            >
                                <span className="text-sm sm:text-base font-medium">{label}</span>
                                {activeTab === (value as any) && (
                                    <span
                                        className="absolute left-1/2 -translate-x-1/2 bottom-[-1px] h-1 w-full rounded-full bg-element-3"

                                    />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {/* Tab content lists */}
                    <TabsContent value={activeTab}>
                        {activeTab === 'new' ? (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {candidates.map((c) => (
                                    <NewApplicantCard key={c.profile_id} candidate={c} jobId={jobId} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3 mt-4">
                                {/* {activeTab === 'seen' && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-600 mr-1">Filter:</span>
                                        <Button
                                            size="sm"
                                            variant={filters.audioAttended ? 'default' : 'outline'}
                                            onClick={() => setFilters({ ...filters, audioAttended: !filters.audioAttended })}
                                            disabled={pageLoading}
                                        >
                                            <FaMicrophone className="h-3 w-3 mr-2" />
                                            Audio Completed
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filters.videoAttended ? 'default' : 'outline'}
                                            onClick={() => setFilters({ ...filters, videoAttended: !filters.videoAttended })}
                                            disabled={pageLoading}
                                        >
                                            <FaVideo className="h-3 w-3 mr-2" />
                                            Video Completed
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={filters.videoInterviewSent ? 'default' : 'outline'}
                                            onClick={() => setFilters({ ...filters, videoInterviewSent: !filters.videoInterviewSent })}
                                            disabled={pageLoading}
                                        >
                                            <FaEnvelope className="h-3 w-3 mr-2" />
                                            Video Interview Sent
                                        </Button>
                                        {(filters.audioAttended || filters.videoAttended || filters.videoInterviewSent) && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setFilters({ ...filters, audioAttended: false, videoAttended: false, videoInterviewSent: false })}
                                                disabled={pageLoading}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                )} */}
                                {(activeTab === 'seen' ? candidates : candidates).map((c) => (
                                    activeTab === 'seen' ? (
                                        <SeenApplicantCard key={c.profile_id} candidate={c} jobId={jobId} roleTitle={jobDetails?.title || ''} />
                                    ) : activeTab === 'shortlisted' ? (
                                        <ShortlistedApplicantCard key={c.profile_id} candidate={c} jobId={jobId} roleTitle={jobDetails?.title || ''} />
                                    ) : (
                                        <RejectedApplicantCard key={c.profile_id} candidate={c} jobId={jobId} />
                                    )
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Enhanced Filters and Search */}
            {/* <CandidateFilters
                filters={filters}
                setFilters={setFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                pageLoading={pageLoading}
                candidatesCount={candidates.length}
                filteredCount={filteredCandidates.length}
                pageSize={pageSize}
                setPageSize={setPageSize}
            /> */}

            {/* Mobile Interview Overview - Hidden on xl+ screens */}
            {/* <div className="xl:hidden mt-4 sm:mt-6">
                <Card>
                    <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Interview Process Overview</h3>
                            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                                Current Page
                            </span>
                        </div>

                        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                {
                                    label: "Profile Created",
                                    count: filteredCandidates.length,
                                    icon: "👤",
                                    color: "bg-green-100 text-green-800"
                                },
                                {
                                    label: "Audio Attempted",
                                    count: filteredCandidates.filter(c => c.interview_status?.audio_interview_attended).length,
                                    icon: "🎤",
                                    color: "bg-blue-100 text-blue-800"
                                },
                                {
                                    label: "Marked for Video",
                                    count: filteredCandidates.filter(c => c.application_status === 'SendVideoLink').length,
                                    icon: "📧",
                                    color: "bg-yellow-100 text-yellow-800"
                                },
                                {
                                    label: "Video Sent",
                                    count: filteredCandidates.filter(c => c.interview_status?.video_interview_url).length,
                                    icon: "📹",
                                    color: "bg-purple-100 text-purple-800"
                                },
                                {
                                    label: "Video Attempted",
                                    count: filteredCandidates.filter(c => c.interview_status?.video_interview_attended).length,
                                    icon: "▶️",
                                    color: "bg-indigo-100 text-indigo-800"
                                },
                                {
                                    label: "Marked for Review",
                                    count: filteredCandidates.filter(c => c.final_shortlist).length,
                                    icon: "👁️",
                                    color: "bg-orange-100 text-orange-800"
                                },
                                {
                                    label: "Company Selected",
                                    count: filteredCandidates.filter(c => c.call_for_interview).length,
                                    icon: "🏆",
                                    color: "bg-emerald-100 text-emerald-800"
                                }
                            ].map((step, index) => (
                                <div key={index} className="text-center flex-shrink-0 min-w-[70px] sm:min-w-[80px]">
                                    <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step.color} mb-2 text-base sm:text-lg`}>
                                        {step.icon}
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">{step.count}</p>
                                    <p className="text-xs text-gray-500 leading-tight">{step.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div> */}

            {/* Main Content Area - 2 Grid Layout */}
            <div className="w-full mx-auto mt-4 sm:mt-6">
                {/* Interview Process Overview - Hidden on smaller screens, shown on xl+ */}
                {/* <div className="hidden xl:block max-w-xl mx-auto">
                    <div className="sticky top-6">
                         <Card>
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Interview Process Overview</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Current Page
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {[
                                        {
                                            label: "Profile Created",
                                            count: filteredCandidates.length,
                                            icon: "👤",
                                            color: "bg-green-100 text-green-800",
                                            description: "Total candidates on this page"
                                        },
                                        {
                                            label: "Audio Attempted",
                                            count: filteredCandidates.filter(c => c.interview_status?.audio_interview_attended).length,
                                            icon: "🎤",
                                            color: "bg-blue-100 text-blue-800",
                                            description: "Completed audio interviews"
                                        },
                                        {
                                            label: "Marked for Video",
                                            count: filteredCandidates.filter(c => c.application_status === 'SendVideoLink').length,
                                            icon: "📧",
                                            color: "bg-yellow-100 text-yellow-800",
                                            description: "Ready for video round"
                                        },
                                        {
                                            label: "Video Sent",
                                            count: filteredCandidates.filter(c => c.interview_status?.video_interview_url).length,
                                            icon: "📹",
                                            color: "bg-purple-100 text-purple-800",
                                            description: "Video interview URLs available"
                                        },
                                        {
                                            label: "Video Attempted",
                                            count: filteredCandidates.filter(c => c.interview_status?.video_interview_attended).length,
                                            icon: "▶️",
                                            color: "bg-indigo-100 text-indigo-800",
                                            description: "Completed video interviews"
                                        },
                                        {
                                            label: "Marked for Review",
                                            count: filteredCandidates.filter(c => c.final_shortlist).length,
                                            icon: "👁️",
                                            color: "bg-orange-100 text-orange-800",
                                            description: "Shortlisted for review"
                                        },
                                        {
                                            label: "Company Selected",
                                            count: filteredCandidates.filter(c => c.call_for_interview).length,
                                            icon: "🏆",
                                            color: "bg-emerald-100 text-emerald-800",
                                            description: "Selected by company"
                                        }
                                    ].map((step, index) => (
                                        <div key={index} className="text-center group relative">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${step.color} mb-2 text-xl transition-transform group-hover:scale-110`}>
                                                {step.icon}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-1">{step.count}</p>
                                            <p className="text-xs text-gray-500 leading-tight">{step.label}</p>

                                           
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                {step.description}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                
                                <div className="mt-4 flex items-center justify-end">
                                    <Button
                                        variant="premium"
                                        onClick={handleDownloadCSV}
                                    >
                                        Download Contacts
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div> 
                </div> */}

                {/* Candidates List - Main Content Area */}
                <div className="">
                    {/* <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                        {pageLoading ? (
                            
                            Array.from({ length: pageSize }).map((_, index) => (
                                <Card key={`loading-${index}`} className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                                            <div className="flex gap-2 mb-4">
                                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 w-full lg:w-auto">
                                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse w-full sm:w-auto"></div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
                                <Card key={candidate?.profile_id} className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {candidate?.basic_information?.full_name}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {candidate?.career_overview?.total_years_experience} years exp
                                                </span>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {candidate?.career_overview?.years_sales_experience} years sales
                                                </span>
                                            </div>
                                            <div className='flex flex-row items-center justify-between gap-2 mt-4'>
                                               
                                                <div className="">
                                                    <InterviewStatusTimeline candidate={candidate} />
                                                </div>

                                                
                                                <div className="">
                                                    <InterviewScoreCompact candidate={candidate} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto flex flex-row items-center gap-2 flex-shrink-0">
                                           

                                            {candidate?.interview_status?.resume_url && (
                                                <Button
                                                    variant="outline"
                                                    className="flex w-full items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                    onClick={() => {
                                                        if (candidate?.interview_status?.resume_url) {
                                                            window.open(candidate?.interview_status?.resume_url, '_blank');
                                                        }
                                                    }}
                                                >
                                                    View Resume
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                        <div className="flex flex-wrap gap-2">
                                            {candidate?.basic_information?.languages_spoken?.map((lang, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                                                >
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                                            {typeof candidate?.call_for_interview === 'boolean' && candidate.call_for_interview && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                                                    <span className="font-medium">Called for Final Interview</span>
                                                    <FaCheckCircle className="text-green-600" />
                                                </div>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full flex flex-1 items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-3 py-2 rounded-lg text-sm sm:w-auto "
                                                onClick={() => setSelectedCandidate(candidate)}
                                            >
                                                View Details
                                            </Button>

                                            {typeof candidate?.application_status === 'boolean' && (
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-full text-sm">
                                                    {candidate.application_status ? (
                                                        <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-green-100 text-green-800">
                                                            <span className="font-medium">Moved to Video Round</span>
                                                            <FaCheckCircle className="text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-red-100 text-red-800">
                                                            <span className="font-medium">Rejected</span>
                                                            <FaTimesCircle className="text-red-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div> */}

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="mt-6 sm:mt-8 flex justify-center px-4">
                            <Pagination>
                                <PaginationContent className="flex flex-wrap justify-center gap-2">
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
                        <div className="mt-4 text-center text-sm text-gray-600 px-4">
                            {pageLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span>Loading candidates...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                                    <span>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total_candidates)}</span>
                                    <span className="hidden sm:inline">of</span>
                                    <span className="block sm:inline">{pagination.total_candidates} candidates</span>
                                </div>
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
                                                    {(() => {
                                                        const ctc: any = selectedCandidate?.basic_information?.current_ctc as any;
                                                        if (!ctc) return 'Not specified';
                                                        if (typeof ctc === 'number') return `INR ${ctc.toLocaleString()}`;
                                                        const currency = ctc.currencyType || 'INR';
                                                        const value = ctc?.value;
                                                        return value != null ? `${currency} ${Number(value).toLocaleString()}` : 'Not specified';
                                                    })()}
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

                                    {/* Job Fit Assessment */}
                                    {selectedCandidate?.job_fit_assessment && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Job Fit Assessment</h4>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="prose prose-sm max-w-none">
                                                    <ReactMarkdown>
                                                        {selectedCandidate.job_fit_assessment}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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

                                        {/* Final Shortlist Button */}
                                        <Button
                                            variant="outline"
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                            onClick={() => openShortlistModal(selectedCandidate)}
                                            disabled={updatingShortlist === selectedCandidate?.profile_id}
                                        >
                                            <FaCheck className="text-white animate-pulse" />
                                            {updatingShortlist === selectedCandidate?.profile_id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Final Shortlist'
                                            )}
                                        </Button>

                                        {/* Update Status Button */}
                                        <Button
                                            variant="outline"
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                            onClick={() => openStatusModal(selectedCandidate)}
                                            disabled={updatingStatus === selectedCandidate?.profile_id}
                                        >
                                            <FaEdit className="text-white animate-pulse" />
                                            {updatingStatus === selectedCandidate?.profile_id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                typeof selectedCandidate?.application_status === 'string' ? 'Add Status' : 'Update Status'
                                            )}
                                        </Button>

                                        {/* Reset Video Interview Button - Only show when video link was sent */}
                                        {(selectedCandidate?.application_status === 'SendVideoLink' || selectedCandidate?.interview_status?.video_interview_url) && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                onClick={() => openResetVideoModal(selectedCandidate)}
                                            >
                                                <FaVideo className="text-white mr-2" />
                                                Reset Video Interview
                                            </Button>
                                        )}

                                        {/* View Proctoring Details Button */}
                                        {(selectedCandidate?.video_proctoring_details || selectedCandidate?.audio_proctoring_details) && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 text-slate-700 hover:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                onClick={() => setIsProctorDialogOpen(true)}
                                            >
                                                View Proctoring Details
                                            </Button>
                                        )}
                                    </div>

                                    {/* Interview Performance Scores */}
                                    <div className="mt-8">
                                        <InterviewScoreCard candidate={selectedCandidate} />
                                    </div>

                                    {/* Audio Interview Q&A */}
                                    {selectedCandidate?.audio_interview_details && (
                                        <div className="mt-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Audio Interview Evaluation</h4>
                                                {selectedCandidate?.interview_status?.audio_interview_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                                                        className={`flex items-center gap-2 transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg ${showAudioPlayer
                                                            ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-0 shadow-xl hover:shadow-2xl'
                                                            : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 text-slate-700 hover:text-slate-900 shadow-lg hover:shadow-xl border-0'
                                                            }`}
                                                    >
                                                        <FaMicrophone className={`text-sm ${showAudioPlayer ? 'animate-pulse' : ''}`} />
                                                        {showAudioPlayer ? 'Hide Audio' : 'Listen to Audio Interview'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Audio Player */}
                                            {showAudioPlayer && selectedCandidate?.interview_status?.audio_interview_url && (
                                                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                                    <div className="bg-white p-4 rounded-lg shadow-lg">
                                                        <audio
                                                            className="w-full"
                                                            controls
                                                            preload="metadata"
                                                            autoPlay
                                                        >
                                                            <source src={selectedCandidate.interview_status.audio_interview_url} type="audio/mpeg" />
                                                            <source src={selectedCandidate.interview_status.audio_interview_url} type="audio/ogg" />
                                                            <source src={selectedCandidate.interview_status.audio_interview_url} type="audio/wav" />
                                                            Your browser does not support the audio tag.
                                                        </audio>
                                                    </div>

                                                    {/* Download Button */}
                                                    <div className="mt-4 flex justify-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const candidateName = selectedCandidate?.basic_information?.full_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
                                                                const jobRole = jobDetails?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown_Role';
                                                                const audioDate = new Date().toISOString().split('T')[0];

                                                                const fileName = `${candidateName}_${jobRole}_${audioDate}.mp3`;

                                                                if (selectedCandidate?.interview_status?.audio_interview_url) {
                                                                    const link = document.createElement('a');
                                                                    link.href = selectedCandidate.interview_status.audio_interview_url;
                                                                    link.download = fileName;
                                                                    link.target = '_blank';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Download Audio
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary */}
                                            <div className="mb-6">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm text-gray-600">Average Score</p>
                                                        <p className="text-lg font-semibold">
                                                            {getAudioSummaryScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm text-gray-600">Credibility</p>
                                                        <p className="text-lg font-semibold">
                                                            {getAudioCredibilityScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                        </p>
                                                    </div>
                                                    {getAudioOwnershipScore(selectedCandidate) && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-sm text-gray-600">Ownership</p>
                                                            <p className="text-lg font-semibold">
                                                                {getAudioOwnershipScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-sm text-gray-600">Communication</p>
                                                        <p className="text-lg font-semibold">
                                                            {getAudioCommunicationScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Areas for Improvement */}
                                                {getAudioAreasForImprovement(selectedCandidate).length > 0 && (
                                                    <div className="bg-red-50 p-4 rounded-lg">
                                                        <h5 className="font-medium text-red-900 mb-2">Areas for Improvement</h5>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {getAudioAreasForImprovement(selectedCandidate).map((area: string, index: number) => (
                                                                <li key={index} className="text-sm text-red-700">{area}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* New Format Summary Fields */}
                                                {(() => {
                                                    const summary = selectedCandidate?.audio_interview_details?.audio_interview_summary;
                                                    const hasNewFormatData = summary?.icp_summary || summary?.sales_motion_summary || summary?.sales_cycle_summary;

                                                    if (hasNewFormatData) {
                                                        return (
                                                            <div className="space-y-4">
                                                                {/* Sales & ICP Information */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    {summary?.icp_summary && summary.icp_summary.length > 0 && (
                                                                        <div className="p-4 bg-blue-50 rounded-lg">
                                                                            <h5 className="font-medium text-blue-900 mb-2">Ideal Customer Profile</h5>
                                                                            <ul className="space-y-1">
                                                                                {summary.icp_summary.map((icp: string, index: number) => (
                                                                                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                                                                                        <span className="text-blue-600 mt-1">•</span>
                                                                                        {icp}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {summary?.sales_motion_summary && summary.sales_motion_summary.length > 0 && (
                                                                        <div className="p-4 bg-purple-50 rounded-lg">
                                                                            <h5 className="font-medium text-purple-900 mb-2">Sales Motion</h5>
                                                                            <ul className="space-y-1">
                                                                                {summary.sales_motion_summary.map((motion: string, index: number) => (
                                                                                    <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                                                                                        <span className="text-purple-600 mt-1">•</span>
                                                                                        {motion}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {summary?.sales_cycle_summary && summary.sales_cycle_summary.length > 0 && (
                                                                        <div className="p-4 bg-indigo-50 rounded-lg">
                                                                            <h5 className="font-medium text-indigo-900 mb-2">Sales Cycle</h5>
                                                                            <ul className="space-y-1">
                                                                                {summary.sales_cycle_summary.map((cycle: string, index: number) => (
                                                                                    <li key={index} className="text-sm text-indigo-800 flex items-start gap-2">
                                                                                        <span className="text-blue-600 mt-1">•</span>
                                                                                        {cycle}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Coaching Focus */}
                                                                {summary?.coaching_focus && (
                                                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                                                        <h5 className="font-medium text-yellow-900 mb-2">Coaching Focus</h5>
                                                                        <p className="text-sm text-yellow-800">{summary.coaching_focus}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            {/* Q&A Evaluations */}
                                            <Accordion type="single" collapsible className="space-y-4">
                                                {getAudioQAEvaluations(selectedCandidate).map((qa: any, index: number) => {
                                                    const dimensions = getQAEvaluationDimensions(qa);
                                                    const score = getQAEvaluationScore(qa);

                                                    return (
                                                        <AccordionItem key={index} value={`audio-qa-${index}`} className="bg-gray-50 rounded-lg px-4">
                                                            <AccordionTrigger className="hover:no-underline">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="font-medium text-gray-900">Question {index + 1}</span>
                                                                    <span className="text-sm text-gray-500">
                                                                        Score: {score?.toFixed(1) || 'N/A'}/100
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
                                                                        {dimensions.credibility && (
                                                                            <div>
                                                                                <p className="text-sm text-gray-600">Credibility</p>
                                                                                <p className="font-medium">{dimensions.credibility.score}/100</p>
                                                                                <p className="text-sm text-gray-500 mt-1">{dimensions.credibility.feedback}</p>
                                                                            </div>
                                                                        )}
                                                                        {dimensions.ownership && (
                                                                            <div>
                                                                                <p className="text-sm text-gray-600">Ownership</p>
                                                                                <p className="font-medium">{dimensions.ownership.score}/100</p>
                                                                                <p className="text-sm text-gray-500 mt-1">{dimensions.ownership.feedback}</p>
                                                                            </div>
                                                                        )}
                                                                        {dimensions.communication && (
                                                                            <div>
                                                                                <p className="text-sm text-gray-600">Communication</p>
                                                                                <p className="font-medium">{dimensions.communication.score}/100</p>
                                                                                <p className="text-sm text-gray-500 mt-1">{dimensions.communication.feedback}</p>
                                                                            </div>
                                                                        )}
                                                                        {dimensions.confidence && (
                                                                            <div>
                                                                                <p className="text-sm text-gray-600">Confidence</p>
                                                                                <p className="font-medium">{dimensions.confidence.score}/100</p>
                                                                                <p className="text-sm text-gray-500 mt-1">{dimensions.confidence.feedback}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* New Format Fields for Individual Questions */}
                                                                    {(() => {
                                                                        const evaluation = qa.evaluation;
                                                                        const hasNewFormatData = evaluation?.highlights || evaluation?.red_flags || evaluation?.sales_motion || evaluation?.sales_cycle || evaluation?.icp;

                                                                        if (hasNewFormatData) {
                                                                            return (
                                                                                <div className="space-y-3">
                                                                                    {/* Highlights */}
                                                                                    {evaluation?.highlights && evaluation.highlights.length > 0 && (
                                                                                        <div className="p-3 bg-green-50 rounded-lg">
                                                                                            <h6 className="font-medium text-green-900 mb-2 text-sm">Highlights</h6>
                                                                                            <ul className="space-y-1">
                                                                                                {evaluation.highlights.map((highlight: string, idx: number) => (
                                                                                                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                                                                                        <span className="text-green-600 mt-1">•</span>
                                                                                                        {highlight}
                                                                                                    </li>
                                                                                                ))}
                                                                                            </ul>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Red Flags */}
                                                                                    {evaluation?.red_flags && evaluation.red_flags.length > 0 && (
                                                                                        <div className="p-3 bg-red-50 rounded-lg">
                                                                                            <h6 className="font-medium text-red-900 mb-2 text-sm">Red Flags</h6>
                                                                                            <ul className="space-y-1">
                                                                                                {evaluation.red_flags.map((flag: string, idx: number) => (
                                                                                                    <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                                                                                        <span className="text-red-600 mt-1">•</span>
                                                                                                        {flag}
                                                                                                    </li>
                                                                                                ))}
                                                                                            </ul>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Sales Information */}
                                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                                        {evaluation?.sales_motion && (
                                                                                            <div className="p-3 bg-purple-50 rounded-lg">
                                                                                                <h6 className="font-medium text-purple-900 mb-2 text-sm">Sales Motion</h6>
                                                                                                <p className="text-sm text-purple-800">{evaluation.sales_motion}</p>
                                                                                            </div>
                                                                                        )}
                                                                                        {evaluation?.sales_cycle && (
                                                                                            <div className="p-3 bg-indigo-50 rounded-lg">
                                                                                                <h6 className="font-medium text-indigo-900 mb-2 text-sm">Sales Cycle</h6>
                                                                                                <p className="text-sm text-indigo-800">{evaluation.sales_cycle}</p>
                                                                                            </div>
                                                                                        )}
                                                                                        {evaluation?.icp && (
                                                                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                                                                <h6 className="font-medium text-blue-900 mb-2 text-sm">Ideal Customer Profile</h6>
                                                                                                <p className="text-sm text-blue-800">{evaluation.icp}</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Coaching Focus */}
                                                                                    {evaluation?.coaching_focus && (
                                                                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                                                                            <h6 className="font-medium text-yellow-900 mb-2 text-sm">Coaching Focus</h6>
                                                                                            <p className="text-sm text-yellow-800">{evaluation.coaching_focus}</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}

                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Summary</p>
                                                                        <div className="text-sm text-gray-500 mt-1">
                                                                            <ReactMarkdown>{qa.evaluation?.summary || qa.evaluation?.fit_summary || ''}</ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    );
                                                })}
                                            </Accordion>
                                        </div>
                                    )}

                                    {/* Video Interview Q&A */}
                                    {selectedCandidate?.interview_details && (
                                        <div className="mt-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Video Interview Evaluation</h4>
                                                {selectedCandidate?.interview_status?.video_interview_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                                                        className={`flex items-center gap-2 transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg ${showVideoPlayer
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl'
                                                            : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 text-slate-700 hover:text-slate-900 shadow-lg hover:shadow-xl border-0'
                                                            }`}
                                                    >
                                                        <FaVideo className={`text-sm ${showVideoPlayer ? 'animate-pulse' : ''}`} />
                                                        {showVideoPlayer ? 'Hide Video' : 'Watch Video Interview'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Video Player */}
                                            {showVideoPlayer && selectedCandidate?.interview_status?.video_interview_url && (
                                                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                                    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                                                        <VideoPlayer
                                                            videoUrl={selectedCandidate.interview_status.video_interview_url}
                                                            poster="/public/assets/images/scooterLogo.png"
                                                            autoPlay={true}
                                                            controls={true}
                                                            preload="metadata"
                                                            className="w-full h-full rounded-lg shadow-lg"
                                                        />
                                                    </div>

                                                    {/* Download Button */}
                                                    <div className="mt-4 flex justify-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const candidateName = selectedCandidate?.basic_information?.full_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown';
                                                                const jobRole = jobDetails?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown_Role';
                                                                const videoDate = new Date().toISOString().split('T')[0];

                                                                const fileName = `${candidateName}_${jobRole}_${videoDate}.mp4`;

                                                                if (selectedCandidate?.interview_status?.video_interview_url) {
                                                                    const link = document.createElement('a');
                                                                    link.href = selectedCandidate.interview_status.video_interview_url;
                                                                    link.download = fileName;
                                                                    link.target = '_blank';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Download Video
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

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
                                                            <div className="text-gray-700">
                                                                <ReactMarkdown>{selectedCandidate?.interview_details?.communication_evaluation?.summary || ''}</ReactMarkdown>
                                                            </div>
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
                                                    {/* {selectedCandidate?.interview_details?.qa_evaluations?.summary && (
                                                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                                            <h5 className="font-medium text-blue-900 mb-2">Evaluation Summary</h5>
                                                            <div className="text-sm text-blue-700">
                                                                <ReactMarkdown>{selectedCandidate?.interview_details?.qa_evaluations?.summary || ''}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    )} */}

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
                                                                                <div className="text-sm text-blue-700">
                                                                                    <ReactMarkdown>{qa?.skill_reasoning || ''}</ReactMarkdown>
                                                                                </div>
                                                                            </div>
                                                                            <div className="bg-green-50 p-3 rounded-lg">
                                                                                <h6 className="font-medium text-green-900 mb-2">Trait Reasoning</h6>
                                                                                <div className="text-sm text-green-700">
                                                                                    <ReactMarkdown>{qa?.trait_reasoning || ''}</ReactMarkdown>
                                                                                </div>
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

                                    {/* Proctoring Details Dialog */}
                                    <ProctoringDetailsDialog
                                        isOpen={isProctorDialogOpen}
                                        onOpenChange={setIsProctorDialogOpen}
                                        candidate={selectedCandidate}
                                    />

                                </div>
                            </Card>
                        </div>
                    )}

                    {showNoResultsMessage && (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <div className="max-w-md mx-auto">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates match your filters</h3>
                                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                                    We found {candidates.length} candidates but none match your current filters.
                                    Try adjusting your search criteria.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setFilters({
                                                location: 'all',
                                                audioAttended: false,
                                                videoInterviewSent: false,
                                                videoAttended: false,
                                                sendToHiringManager: false,
                                                profileOnly: false,
                                                experienceRange: 'all',
                                                salesExperienceRange: 'all',
                                            });
                                            setSearchTerm('');
                                        }}
                                        className="w-full"
                                    >
                                        Clear All Filters
                                    </Button>
                                    <p className="text-xs text-gray-400">
                                        Showing {filteredCount} of {candidates.length} candidates on this page
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredCandidates.length === 0 && !pageLoading && !showNoResultsMessage && (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <p className="text-gray-500 text-sm sm:text-base">No candidates found</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasActiveFilters && filteredCount < 5 && candidates.length > 0 && !pageLoading && (
                        <div className="text-center py-6 px-4">
                            <div className="max-w-md mx-auto">
                                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                                    Only {filteredCount} candidates match your filters on this page.
                                </p>
                                <Button
                                    onClick={loadMoreCandidates}
                                    disabled={isLoadingMore}
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More Candidates'
                                    )}
                                </Button>
                                <p className="text-xs text-gray-400 mt-2">
                                    This will fetch more candidates to find better matches
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Shortlist Modal */}
                    {/* Status Update Modal */}
                    <UpdateStatusModal
                        isOpen={isStatusModalOpen}
                        onClose={() => {
                            setIsStatusModalOpen(false);
                        }}
                        onSubmit={(status, note) => {
                            if (selectedCandidate) {
                                handleApplicationStatus(selectedCandidate.profile_id, status, note);
                            }
                        }}
                        candidateName={selectedCandidate?.basic_information?.full_name || ''}
                        isLoading={updatingStatus === selectedCandidate?.profile_id}
                        currentStatus={typeof selectedCandidate?.application_status === 'string' ? selectedCandidate.application_status : typeof selectedCandidate?.application_status === 'boolean' ? selectedCandidate.application_status.toString() : null}
                        currentNote={selectedCandidate?.application_status_reason}
                    />
                    {/* Shortlist Modal */}
                    <ShortlistModal
                        isOpen={isShortlistModalOpen}
                        onClose={() => {
                            setIsShortlistModalOpen(false);
                        }}
                        onSubmit={(status, note) => {
                            if (selectedCandidate) {
                                handleShortlist(selectedCandidate.profile_id, status, note);
                            }
                        }}
                        candidateName={selectedCandidate?.basic_information?.full_name || ''}
                        isLoading={updatingShortlist === selectedCandidate?.profile_id}
                        currentStatus={typeof selectedCandidate?.final_shortlist === 'boolean' ? selectedCandidate.final_shortlist : null}
                        currentNote={selectedCandidate?.shortlist_status_reason}
                    />

                    {/* Reset Video Interview Modal */}
                    <ResetVideoInterviewModal
                        isOpen={isResetVideoModalOpen}
                        onClose={() => setIsResetVideoModalOpen(false)}
                        candidate={selectedCandidate}
                        onSuccess={fetchCandidates}
                    />
                </div>
            </div>
        </div>
    );
} 