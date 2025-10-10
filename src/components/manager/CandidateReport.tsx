"use client";

import React, { useState, useEffect } from 'react';
import { ManagerCandidate, MyJobCandidatesResponse } from '@/lib/managerService';
import { callForInterview, markFinalShortlist } from '@/lib/adminService';
import { updateApplicationStatus, updateFinalShortlist } from '@/lib/superAdminService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import VideoPlayer from '@/components/interview/VideoPlayer';
import VideoPlayerWithTimeline from '@/components/interview/VideoPlayerWithTimeline';
import VerticalVideoPlayer from '@/components/interview/VerticalVideoPlayer';
import InterviewScoreCompact from '@/components/candidates/InterviewScoreCompact';
import InterviewScoreCard from '@/components/candidates/InterviewScoreCard';
import ProctoringDetailsDialog from '@/components/ProctoringDetailsDialog';
import {
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaPlay,
    FaCheck,
    FaTimes,
    FaChevronUp,
    FaMapMarkerAlt,
    FaUser,
    FaBriefcase,
    FaCalendarAlt,
    FaDollarSign,
    FaPause,
    FaArrowLeft,
    FaList,
    FaExclamationCircle,
    FaCross,
    FaPlus,
    FaEdit,
    FaRegEdit,
    FaUserEdit,
    FaMicrophone,
    FaVideo,
    FaExternalLinkAlt,
    FaClock,
    FaStop,
    FaEye,
    FaEyeSlash,
    FaMousePointer,
    FaKeyboard,
    FaMobile,
    FaDesktop,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaLightbulb,
    FaClipboardList,
    FaUsers
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Edit, Edit2, Edit3, X } from 'lucide-react';

interface CandidatePortfolioOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: ManagerCandidate;
    jobId: string;
    jobDetails?: MyJobCandidatesResponse['job_details'];
    allCandidates?: ManagerCandidate[];
}

export default function CandidatePortfolioOverlay({
    isOpen,
    onClose,
    candidate,
    jobId,
    jobDetails,
    allCandidates = []
}: CandidatePortfolioOverlayProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<ManagerCandidate | null>(candidate);
    const [showCandidateList, setShowCandidateList] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showListContainer, setShowListContainer] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [showVerticalVideoPlayer, setShowVerticalVideoPlayer] = useState(false);

    // Dialog states for shortlist/remove actions
    const [showShortlistDialog, setShowShortlistDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [shortlistReason, setShortlistReason] = useState('');
    const [removeReason, setRemoveReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [notes, setNotes] = useState<Array<{ id: string; category: string; text: string; author: string }>>([]);
    const [showPostShortlistDialog, setShowPostShortlistDialog] = useState(false);

    // Media player states
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [isProctorDialogOpen, setIsProctorDialogOpen] = useState(false);

    // Application Status Dialog
    const [isApplicationStatusDialogOpen, setIsApplicationStatusDialogOpen] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [applicationStatusReason, setApplicationStatusReason] = useState('');
    const [isUpdatingApplicationStatus, setIsUpdatingApplicationStatus] = useState(false);

    // Final Shortlist Dialog
    const [isFinalShortlistDialogOpen, setIsFinalShortlistDialogOpen] = useState(false);
    const [finalShortlistValue, setFinalShortlistValue] = useState('');
    const [finalShortlistReason, setFinalShortlistReason] = useState('');
    const [isUpdatingFinalShortlist, setIsUpdatingFinalShortlist] = useState(false);

    const { toast } = useToast();

    const addEmptyNote = () => {
        setNotes(prev => [...prev, { id: crypto.randomUUID(), category: '', text: '', author: '' }]);
    };

    // Candidate highlights data (same as in the original page)
    const candidateHighlights = {
        "68a6a58cc152271fb45b2111": {
            name: "Amal Nambiar",
            role: "Publishing Consultant",
            experience: "Transitioning into sales with a recent role at Notion Press (Jul 2024 - Dec 2024)",
            strengths: [
                "Matched client needs with appropriate resources",
                "Upsold various packages and met monthly sales targets",
                "Supported first-time authors in bringing books to market",
                "Proactive in extracurricular activities demonstrating communication & negotiation skills"
            ],
            potential_red_flags: [
                "Relatively short work stint (6 months)",
                "Limited prior sales experience"
            ],
            short_summary: "Emerging sales professional with strengths in upselling and client support.",
            main_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Amal Nambiar Edited Video.m3u8",
            magic_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Amal Nambiar Magic Clip.m3u8",
            why_they_match: [
                "Strong communication skills demonstrated through client interactions",
                "Proven ability to upsell and meet sales targets",
                "Experience in supporting clients through complex processes"
            ],
            development_required: [
                "Build deeper sales methodology knowledge",
                "Develop more structured approach to client relationship management"
            ]
        },
        // Add more candidate highlights as needed
    };

    // Update selected candidate when prop changes
    useEffect(() => {
        setSelectedCandidate(candidate);
    }, [candidate]);

    const getCandidateHighlights = (profileId: string) => {
        return candidateHighlights[profileId as keyof typeof candidateHighlights];
    };

    const handleCandidateSelect = (candidate: ManagerCandidate) => {
        setIsAnimating(true);
        setSelectedCandidate(candidate);
        setShowCandidateList(false);

        // Reset animation state after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    const handleShowListContainer = () => {
        setIsAnimating(true);
        setShowListContainer(!showListContainer);

        // Reset animation state after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    const handleBackToList = () => {
        setIsAnimating(true);
        setSelectedCandidate(null);
        setShowCandidateList(true);

        // Reset animation state after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    const handleShowVideo = (videoUrl: string) => {
        setSelectedVideoUrl(videoUrl);
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedVideoUrl('');
    };

    const handleShowVerticalVideoPlayer = () => {
        setShowVerticalVideoPlayer(true);
    };

    const handleCloseVerticalVideoPlayer = () => {
        setShowVerticalVideoPlayer(false);
    };

    // Share report handler
    const handleShareReport = async () => {
        if (!selectedCandidate) return;
        const shareUrl = `${window.location.origin}/candidate-portfolio/${jobId}?applicationId=${selectedCandidate.application_id}`;
        try {
            const nav: any = navigator as any;
            if (nav && typeof nav.share === 'function') {
                await nav.share({ title: 'Candidate Report', url: shareUrl });
                return;
            }
        } catch (_) { }
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard');
        } catch (_) {
            // Fallback: open in new tab where user can copy
            window.open(shareUrl, '_blank');
        }
    };

    const handleShortlist = () => {
        setShowShortlistDialog(true);
        setShortlistReason('');
    };

    const handleShortlistSubmit = async () => {
        if (!selectedCandidate?.application_id) return;

        setIsSubmitting(true);
        try {
            await callForInterview({
                user_id: selectedCandidate.application_id,
                call_for_interview: true,
                notes: shortlistReason || 'Candidate shortlisted for interview'
            });

            // Close dialog and show success
            setShowShortlistDialog(false);
            setShortlistReason('');
            setShowPostShortlistDialog(true);
        } catch (error) {
            console.error('Error shortlisting candidate:', error);
            alert('Failed to shortlist candidate. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = () => {
        setShowRemoveDialog(true);
        setRemoveReason('');
    };

    // API Functions
    const handleUpdateApplicationStatus = async () => {
        if (!applicationStatus || !applicationStatusReason) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsUpdatingApplicationStatus(true);
        try {
            const response = await updateApplicationStatus({
                user_id: selectedCandidate?.application_id || '',
                application_status: applicationStatus,
                reason: applicationStatusReason
            });

            if (response.status) {
                toast({
                    title: "Success",
                    description: "Application status updated successfully",
                    variant: "default",
                });
                setIsApplicationStatusDialogOpen(false);
                setApplicationStatus('');
                setApplicationStatusReason('');
                // Optionally refresh the candidate data or close the dialog
                onClose();
            } else {
                toast({
                    title: "Error",
                    description: `Failed to update application status: ${response.message || 'Unknown error'}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast({
                title: "Error",
                description: "Failed to update application status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingApplicationStatus(false);
        }
    };

    const handleUpdateFinalShortlist = async () => {
        if (!finalShortlistValue || !finalShortlistReason) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsUpdatingFinalShortlist(true);
        try {
            const response = await updateFinalShortlist({
                user_id: selectedCandidate?.application_id || '',
                final_shortlist: finalShortlistValue === 'true',
                reason: finalShortlistReason
            });

            if (response.status) {
                toast({
                    title: "Success",
                    description: "Final shortlist status updated successfully",
                    variant: "default",
                });
                setIsFinalShortlistDialogOpen(false);
                setFinalShortlistValue('');
                setFinalShortlistReason('');
                // Optionally refresh the candidate data or close the dialog
                onClose();
            } else {
                toast({
                    title: "Error",
                    description: `Failed to update final shortlist: ${response.message || 'Unknown error'}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating final shortlist:', error);
            toast({
                title: "Error",
                description: "Failed to update final shortlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingFinalShortlist(false);
        }
    };

    const handleRemoveSubmit = async () => {
        if (!selectedCandidate?.application_id || !removeReason.trim()) return;

        setIsSubmitting(true);
        try {
            await markFinalShortlist({
                user_id: selectedCandidate.application_id,
                final_shortlist: false,
                reason: removeReason
            });

            // Close dialog
            setShowRemoveDialog(false);
            setRemoveReason('');
            onClose(); // Close the overlay
        } catch (error) {
            console.error('Error removing candidate:', error);
            alert('Failed to remove candidate. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getExperienceYears = (candidate: ManagerCandidate): string => {
        const totalExp = candidate?.career_overview?.total_years_experience || 0;
        const years = Math.floor(totalExp);
        const months = Math.round((totalExp - years) * 12);
        return `${years} years ${months} months`;
    };

    const getAverageTenure = (candidate: ManagerCandidate): string => {
        const avg = candidate?.career_overview?.average_tenure_per_role || 0;
        const years = Math.floor(avg);
        const months = Math.round((avg - years) * 12);
        return `${years} years ${months} months`;
    };

    const getBudgetStatus = (candidate: ManagerCandidate): string => {
        const BASE = 9.5; // LPA
        const expected = getCtcValue(candidate?.basic_information?.expected_ctc);
        if (expected == null) return 'N/A';
        if (expected <= BASE) return 'Under Budget';
        if (expected > BASE * 1.5) return 'Over Budget';
        return 'Within Budget';
    };

    const getCtcValue = (ctc: number | { value: number } | undefined | null): number | null => {
        if (ctc == null) return null;
        if (typeof ctc === 'number') return ctc / 100000;
        if (typeof (ctc as any).value === 'number') return (ctc as any).value / 100000;
        return null;
    };

    // Audio Interview Analytics Functions
    const getAudioSummaryScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.audio_interview_details;
        if (!details || !Array.isArray(details.qa_evaluations)) return null;

        const scores = details.qa_evaluations.map((q: any) => q.evaluation?.credibility_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getAudioCredibilityScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.audio_interview_details;
        if (!details || !Array.isArray(details.qa_evaluations) || details.qa_evaluations.length === 0) return null;

        const scores = details.qa_evaluations.map((q: any) => q.evaluation?.credibility_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getAudioOwnershipScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.audio_interview_details;
        if (!details || !Array.isArray(details.qa_evaluations) || details.qa_evaluations.length === 0) return null;

        const scores = details.qa_evaluations.map((q: any) => q.evaluation?.ownership_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getAudioCommunicationScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.audio_interview_details;
        if (!details || !Array.isArray(details.qa_evaluations) || details.qa_evaluations.length === 0) return null;

        const scores = details.qa_evaluations.map((q: any) => q.evaluation?.communication_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getAudioAreasForImprovement = (candidate: ManagerCandidate): string[] => {
        const details = candidate?.audio_interview_details;
        if (!details?.audio_interview_summary?.areas_for_improvement || !Array.isArray(details.audio_interview_summary.areas_for_improvement)) return [];
        return details.audio_interview_summary.areas_for_improvement;
    };

    // Video Interview Analytics Functions
    const getVideoSummaryScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.interview_details;
        if (!details?.qa_evaluations?.question_evaluations || !Array.isArray(details.qa_evaluations.question_evaluations)) return null;

        const scores = details.qa_evaluations.question_evaluations.map((q: any) => q.skill_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getVideoCredibilityScore = (candidate: ManagerCandidate): number | null => {
        const details = candidate?.interview_details;
        if (!details?.qa_evaluations?.question_evaluations || !Array.isArray(details.qa_evaluations.question_evaluations) || details.qa_evaluations.question_evaluations.length === 0) return null;

        const scores = details.qa_evaluations.question_evaluations.map((q: any) => q.skill_score || 0).filter((s: number) => s > 0);
        if (scores.length === 0) return null;

        return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    };

    const getVideoAreasForImprovement = (candidate: ManagerCandidate): string[] => {
        const details = candidate?.interview_details;
        if (!details?.communication_evaluation?.overall_score) return [];
        // For now, return empty array as the structure might be different
        return [];
    };

    const getMatchIcon = (match: boolean) => {
        return match ? (
            <FaCheck className="text-green-600 text-lg" />
        ) : (
            <FaTimes className="text-red-600 text-lg" />
        );
    };

    if (!isOpen || !selectedCandidate) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Candidate Report</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    {selectedCandidate && (
                        <div className="p-6 space-y-6">
                            {/* Candidate Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <FaUser className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold">
                                                {selectedCandidate.basic_information?.full_name || 'Unknown'}
                                            </h1>
                                            <p className="text-white/80">
                                                {selectedCandidate.basic_information?.current_location || 'Location not specified'}
                                            </p>
                                            {/* Languages spoken - if available in the data structure */}
                                            {selectedCandidate.basic_information && 'languages_spoken' in selectedCandidate.basic_information && Array.isArray(selectedCandidate.basic_information.languages_spoken) && selectedCandidate.basic_information.languages_spoken.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {selectedCandidate.basic_information.languages_spoken.map((lang: string, index: number) => (
                                                        <span key={index} className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">Current CTC:</span>
                                            <span className="px-2 py-1 text-sm font-medium bg-white/20 text-white rounded-full">
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
                                        <div className="flex gap-3">
                                            <Button
                                                variant="secondary"
                                                onClick={handleShareReport}
                                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                            >
                                                Share Report
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsApplicationStatusDialogOpen(true)}
                                                className="bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/30"
                                            >
                                                Update Status
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsFinalShortlistDialogOpen(true)}
                                                className="bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/30"
                                            >
                                                Final Shortlist
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Career Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Career Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>

                            {/* Company History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company History</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>

                            {/* Sales Context */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales Context</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Sales Type</p>
                                            <p className="font-medium">{selectedCandidate?.sales_context?.sales_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sales Motion</p>
                                            <p className="font-medium">{selectedCandidate?.sales_context?.sales_motion || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Industries Sold Into</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCandidate?.sales_context?.industries_sold_into?.map((industry, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                        {industry}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Buyer Personas</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCandidate?.sales_context?.buyer_personas?.map((persona, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                        {persona}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Role Process Exposure */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Role Process Exposure</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Sales Role Type</p>
                                            <p className="font-medium">{selectedCandidate?.role_process_exposure?.sales_role_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Position Level</p>
                                            <p className="font-medium">{selectedCandidate?.role_process_exposure?.position_level || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sales Stages Owned</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCandidate?.role_process_exposure?.sales_stages_owned?.map((stage, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                                        {stage}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Owns Quota</p>
                                            <p className="font-medium">
                                                <span className={`font-medium ${selectedCandidate?.role_process_exposure?.own_quota ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedCandidate?.role_process_exposure?.own_quota ? 'Yes' : 'No'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tools & Platforms */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tools & Platforms</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">CRM Tools</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCandidate?.tools_platforms?.crm_tools?.map((tool, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                                                        {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Sales Tools</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCandidate?.tools_platforms?.sales_tools?.map((tool, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                                                        {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Professional Summary */}
                            {selectedCandidate?.professional_summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Professional Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ReactMarkdown>{selectedCandidate?.professional_summary}</ReactMarkdown>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Interview Performance Scores */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Interview Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <InterviewScoreCompact candidate={selectedCandidate as any} />
                                </CardContent>
                            </Card>

                            {/* Audio Interview Q&A */}
                            {selectedCandidate?.audio_interview_details && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Audio Interview Evaluation</CardTitle>
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
                                    </CardHeader>
                                    <CardContent>
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
                                                            const audioDate = new Date().toISOString().split('T')[0];
                                                            const fileName = `${candidateName}_audio_${audioDate}.mp3`;

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

                                        {/* Audio Interview Summary */}
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
                                        </div>

                                        {/* Detailed Q&A Section */}
                                        {selectedCandidate?.audio_interview_details?.qa_evaluations && Array.isArray(selectedCandidate.audio_interview_details.qa_evaluations) && selectedCandidate.audio_interview_details.qa_evaluations.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Questions & Answers</h4>
                                                <Accordion type="single" collapsible className="w-full">
                                                    {selectedCandidate.audio_interview_details.qa_evaluations.map((qa: any, index: number) => (
                                                        <AccordionItem key={index} value={`question-${index}`} className="border border-gray-200 rounded-lg mb-3">
                                                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                                <div className="flex items-center justify-between w-full pr-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                            Question {index + 1}
                                                                        </span>
                                                                        {qa.evaluation?.score && (
                                                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${qa.evaluation.score >= 8 ? 'bg-green-100 text-green-800' :
                                                                                qa.evaluation.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-red-100 text-red-800'
                                                                                }`}>
                                                                                Score: {qa.evaluation.score}/10
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-left flex-1 ml-4">
                                                                        <p className="text-gray-900 font-medium text-sm line-clamp-2">
                                                                            {qa.question}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="px-4 pb-4">
                                                                <div className="space-y-4">
                                                                    {/* Question and Answer */}
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <h6 className="font-medium text-gray-900 mb-2">Question:</h6>
                                                                        <p className="text-gray-800 mb-3">{qa.question}</p>
                                                                        <h6 className="font-medium text-gray-900 mb-2">Answer:</h6>
                                                                        <p className="text-gray-700 text-sm leading-relaxed">{qa.answer}</p>
                                                                    </div>

                                                                    {/* Evaluation Details */}
                                                                    {qa.evaluation && (
                                                                        <div className="space-y-3">
                                                                            {/* Highlights */}
                                                                            {qa.evaluation.highlights && qa.evaluation.highlights.length > 0 && (
                                                                                <div className="bg-green-50 p-3 rounded-lg">
                                                                                    <h6 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                                                                        <FaCheckCircle className="text-green-600" />
                                                                                        Highlights
                                                                                    </h6>
                                                                                    <ul className="list-disc list-inside space-y-1">
                                                                                        {qa.evaluation.highlights.map((highlight: string, idx: number) => (
                                                                                            <li key={idx} className="text-sm text-green-700">{highlight}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}

                                                                            {/* Red Flags */}
                                                                            {qa.evaluation.red_flags && qa.evaluation.red_flags.length > 0 && (
                                                                                <div className="bg-red-50 p-3 rounded-lg">
                                                                                    <h6 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                                                                                        <FaExclamationTriangle className="text-red-600" />
                                                                                        Red Flags
                                                                                    </h6>
                                                                                    <ul className="list-disc list-inside space-y-1">
                                                                                        {qa.evaluation.red_flags.map((flag: string, idx: number) => (
                                                                                            <li key={idx} className="text-sm text-red-700">{flag}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}

                                                                            {/* Coaching Focus */}
                                                                            {qa.evaluation.coaching_focus && (
                                                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                                                    <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                                                                        <FaLightbulb className="text-blue-600" />
                                                                                        Coaching Focus
                                                                                    </h6>
                                                                                    <p className="text-sm text-blue-700">{qa.evaluation.coaching_focus}</p>
                                                                                </div>
                                                                            )}

                                                                            {/* Fit Summary */}
                                                                            {qa.evaluation.fit_summary && (
                                                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                                                    <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                                                        <FaClipboardList className="text-gray-600" />
                                                                                        Fit Summary
                                                                                    </h6>
                                                                                    <p className="text-sm text-gray-700">{qa.evaluation.fit_summary}</p>
                                                                                </div>
                                                                            )}

                                                                            {/* Additional Evaluation Metrics */}
                                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                                                                {qa.evaluation.sales_motion && qa.evaluation.sales_motion !== 'not mentioned' && (
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <p className="text-xs text-gray-600">Sales Motion</p>
                                                                                        <p className="text-sm font-medium">{qa.evaluation.sales_motion}</p>
                                                                                    </div>
                                                                                )}
                                                                                {qa.evaluation.sales_cycle && qa.evaluation.sales_cycle !== 'not mentioned' && (
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <p className="text-xs text-gray-600">Sales Cycle</p>
                                                                                        <p className="text-sm font-medium">{qa.evaluation.sales_cycle}</p>
                                                                                    </div>
                                                                                )}
                                                                                {qa.evaluation.icp && qa.evaluation.icp !== 'not mentioned' && (
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <p className="text-xs text-gray-600">ICP</p>
                                                                                        <p className="text-sm font-medium">{qa.evaluation.icp}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </div>
                                        )}

                                        {/* Audio Interview Summary Details */}
                                        {selectedCandidate?.audio_interview_details?.audio_interview_summary && (
                                            <div className="mt-6 space-y-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Interview Summary</h4>

                                                {/* Summary Stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-sm text-blue-600">Average Score</p>
                                                        <p className="text-lg font-semibold text-blue-900">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.average_score?.toFixed(1) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-sm text-blue-600">Normalized Score</p>
                                                        <p className="text-lg font-semibold text-blue-900">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.average_normalized_score?.toFixed(1) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-sm text-blue-600">Total Questions</p>
                                                        <p className="text-lg font-semibold text-blue-900">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.total_questions || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-sm text-blue-600">Status</p>
                                                        <p className="text-lg font-semibold text-blue-900">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.audio_interview_status ? 'Completed' : 'Incomplete'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Strengths */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.strengths &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.strengths) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.strengths.length > 0 && (
                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                                                <FaCheckCircle className="text-green-600" />
                                                                Strengths
                                                            </h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.strengths.map((strength: string, index: number) => (
                                                                    <li key={index} className="text-sm text-green-700">{strength}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                {/* Areas for Improvement */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.areas_for_improvement &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.areas_for_improvement) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.areas_for_improvement.length > 0 && (
                                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                                                                <FaExclamationTriangle className="text-yellow-600" />
                                                                Areas for Improvement
                                                            </h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.areas_for_improvement.map((area: string, index: number) => (
                                                                    <li key={index} className="text-sm text-yellow-700">{area}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                {/* Red Flags */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.red_flags &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.red_flags) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.red_flags.length > 0 && (
                                                        <div className="bg-red-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                                                                <FaExclamationTriangle className="text-red-600" />
                                                                Red Flags
                                                            </h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.red_flags.map((flag: string, index: number) => (
                                                                    <li key={index} className="text-sm text-red-700">{flag}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                {/* Coaching Focus */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.coaching_focus &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.coaching_focus) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.coaching_focus.length > 0 && (
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                                                <FaLightbulb className="text-blue-600" />
                                                                Coaching Focus
                                                            </h5>
                                                            <ul className="list-disc list-inside space-y-1">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.coaching_focus.map((focus: string, index: number) => (
                                                                    <li key={index} className="text-sm text-blue-700">{focus}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                {/* ICP Summary */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary.length > 0 && (
                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                                                <FaUsers className="text-purple-600" />
                                                                Ideal Customer Profile
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary.map((icp: string, index: number) => (
                                                                    <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                                                        {icp}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Sales Cycle Summary */}
                                                {selectedCandidate.audio_interview_details.audio_interview_summary.sales_cycle_summary &&
                                                    Array.isArray(selectedCandidate.audio_interview_details.audio_interview_summary.sales_cycle_summary) &&
                                                    selectedCandidate.audio_interview_details.audio_interview_summary.sales_cycle_summary.length > 0 && (
                                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                                            <h5 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                                                                <FaClock className="text-indigo-600" />
                                                                Sales Cycle Summary
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedCandidate.audio_interview_details.audio_interview_summary.sales_cycle_summary.map((cycle: string, index: number) => (
                                                                    <span key={index} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                                                        {cycle}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Video Interview Details */}
                            {selectedCandidate?.interview_details && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Video Interview Evaluation</CardTitle>
                                            {selectedCandidate?.interview_status?.video_interview_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                                                    className={`flex items-center gap-2 transition-all duration-300 transform hover:scale-105 font-medium px-4 py-2 rounded-lg ${showVideoPlayer
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl'
                                                        : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 text-slate-700 hover:text-slate-900 shadow-lg hover:shadow-xl border-0'
                                                        }`}
                                                >
                                                    <FaVideo className={`text-sm ${showVideoPlayer ? 'animate-pulse' : ''}`} />
                                                    {showVideoPlayer ? 'Hide Video' : 'Watch Video Interview'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Video Player */}
                                        {showVideoPlayer && selectedCandidate?.interview_status?.video_interview_url && (
                                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                                <VideoPlayerWithTimeline
                                                    videoUrl={selectedCandidate.interview_status.video_interview_url}
                                                />
                                            </div>
                                        )}

                                        {/* Video Interview Summary */}
                                        <div className="mb-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Average Score</p>
                                                    <p className="text-lg font-semibold">
                                                        {getVideoSummaryScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600">Credibility</p>
                                                    <p className="text-lg font-semibold">
                                                        {getVideoCredibilityScore(selectedCandidate)?.toFixed(1) || 'N/A'}/100
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Areas for Improvement */}
                                            {getVideoAreasForImprovement(selectedCandidate).length > 0 && (
                                                <div className="bg-red-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-red-900 mb-2">Areas for Improvement</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {getVideoAreasForImprovement(selectedCandidate).map((area: string, index: number) => (
                                                            <li key={index} className="text-sm text-red-700">{area}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {selectedCandidate?.interview_status?.resume_url_from_user_account && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            if (selectedCandidate?.interview_status?.resume_url_from_user_account) {
                                                window.open(selectedCandidate?.interview_status?.resume_url_from_user_account, '_blank');
                                            }
                                        }}
                                    >
                                        View Resume
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
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Dialogs */}
            <Dialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Shortlist Candidate</DialogTitle>
                        <DialogDescription>
                            Add a reason for shortlisting this candidate.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter reason for shortlisting..."
                        value={shortlistReason}
                        onChange={(e) => setShortlistReason(e.target.value)}
                        rows={3}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowShortlistDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleShortlistSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Shortlisting...' : 'Shortlist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Candidate</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for removing this candidate.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter reason for removal..."
                        value={removeReason}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        rows={3}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRemoveSubmit}
                            disabled={isSubmitting || !removeReason.trim()}
                            variant="destructive"
                        >
                            {isSubmitting ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showPostShortlistDialog} onOpenChange={setShowPostShortlistDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Candidate Shortlisted</DialogTitle>
                        <DialogDescription>
                            The candidate has been successfully shortlisted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowPostShortlistDialog(false)}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Proctoring Details Dialog */}
            {selectedCandidate && (
                <ProctoringDetailsDialog
                    isOpen={isProctorDialogOpen}
                    onOpenChange={setIsProctorDialogOpen}
                    candidate={selectedCandidate as any}
                />
            )}

            {/* Application Status Dialog */}
            <Dialog open={isApplicationStatusDialogOpen} onOpenChange={setIsApplicationStatusDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Application Status</DialogTitle>
                        <DialogDescription>
                            Update the application status for {selectedCandidate?.basic_information?.full_name || 'this candidate'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="application-status">Application Status</Label>
                            <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select application status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SendVideoLink">Send Video Link</SelectItem>
                                    <SelectItem value="NudgeForAudio">Nudge for Audio</SelectItem>
                                    <SelectItem value="NudgeForVideo">Nudge for Video</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reason for status update..."
                                value={applicationStatusReason}
                                onChange={(e) => setApplicationStatusReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplicationStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateApplicationStatus}
                            disabled={isUpdatingApplicationStatus}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isUpdatingApplicationStatus ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Final Shortlist Dialog */}
            <Dialog open={isFinalShortlistDialogOpen} onOpenChange={setIsFinalShortlistDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Final Shortlist</DialogTitle>
                        <DialogDescription>
                            Mark {selectedCandidate?.basic_information?.full_name || 'this candidate'} for final shortlist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="final-shortlist">Final Shortlist Status</Label>
                            <Select value={finalShortlistValue} onValueChange={setFinalShortlistValue}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select final shortlist status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Yes - Add to Final Shortlist</SelectItem>
                                    <SelectItem value="false">No - Remove from Final Shortlist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="final-shortlist-reason">Reason</Label>
                            <Textarea
                                id="final-shortlist-reason"
                                placeholder="Enter reason for final shortlist decision..."
                                value={finalShortlistReason}
                                onChange={(e) => setFinalShortlistReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFinalShortlistDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateFinalShortlist}
                            disabled={isUpdatingFinalShortlist}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isUpdatingFinalShortlist ? 'Updating...' : 'Update Final Shortlist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
