"use client";

import React, { useState, useEffect } from 'react';
import { ManagerCandidate, MyJobCandidatesResponse } from '@/lib/managerService';
import { callForInterview, markFinalShortlist } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import VideoPlayer from '@/components/interview/VideoPlayer';
import VideoPlayerWithTimeline from '@/components/interview/VideoPlayerWithTimeline';
import VerticalVideoPlayer from '@/components/interview/VerticalVideoPlayer';
import InterviewScoreCompact from '@/components/candidates/InterviewScoreCompact';
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
    FaUserEdit
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
                <div className="flex-1 overflow-auto">
                    {/* Main Layout Container */}
                    <div className="flex h-full">
                        {/* Candidate Details Container */}
                        <div className="w-full overflow-auto scrollbar-thin">
                            {selectedCandidate && (
                                <div className="h-full flex flex-col w-full">
                                    {/* Candidate Header */}
                                    <div className="bg-gradient-to-r from-grad-1 to-grad-2 text-white p-6">
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
                                                </div>
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
                                                    onClick={handleShortlist}
                                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                                >
                                                    {selectedCandidate?.call_for_interview === true ? 'Shortlisted' : 'Shortlist'}
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={handleRemove}
                                                    className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Candidate Content */}
                                    <div className="p-6 space-y-6">
                                        {/* Basic Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Basic Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                                                        <p className="text-lg">{selectedCandidate.basic_information?.full_name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Location</label>
                                                        <p className="text-lg">{selectedCandidate.basic_information?.current_location || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                                        <p className="text-lg">{selectedCandidate.basic_information?.phone_number || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                                        <p className="text-lg">{selectedCandidate.basic_information?.email || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                                                        <p className="text-lg">
                                                            {selectedCandidate.basic_information?.linkedin_url ? (
                                                                <a
                                                                    href={selectedCandidate.basic_information.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    {selectedCandidate.basic_information.linkedin_url}
                                                                </a>
                                                            ) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Open to Relocation</label>
                                                        <p className="text-lg">
                                                            <span className={`font-medium ${selectedCandidate.basic_information?.open_to_relocation ? 'text-green-600' : 'text-red-600'}`}>
                                                                {selectedCandidate.basic_information?.open_to_relocation ? 'Yes' : 'No'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Professional Summary */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Professional Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ReactMarkdown>{selectedCandidate?.professional_summary}</ReactMarkdown>
                                            </CardContent>
                                        </Card>

                                        {/* Career Overview */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Career Overview</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Total Experience</label>
                                                        <p className="text-lg">{getExperienceYears(selectedCandidate)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Sales Experience</label>
                                                        <p className="text-lg">{selectedCandidate.career_overview?.years_sales_experience || 0} years</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Average Tenure</label>
                                                        <p className="text-lg">{getAverageTenure(selectedCandidate)}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Resume Download */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Resume</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                                                    <Button
                                                        variant="secondary"
                                                        className='w-48'
                                                        onClick={() => {
                                                            if (selectedCandidate?.resume_url) {
                                                                window.open(selectedCandidate.resume_url, '_blank');
                                                            }
                                                        }}
                                                        disabled={!selectedCandidate?.resume_url}
                                                    >
                                                        Download Resume
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
        </div>
    );
}
