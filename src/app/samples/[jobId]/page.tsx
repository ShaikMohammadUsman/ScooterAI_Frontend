"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getJobCandidates, Candidate, CandidatesResponse, callForInterview, markFinalShortlist } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import VideoPlayer from '@/components/interview/VideoPlayer';
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
    FaCross
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface PageProps {
    params: Promise<{ jobId: string }>;
}

export default function CandidatePortfolioPage({ params }: PageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resolvedParams = use(params);
    const jobId = resolvedParams.jobId;

    // Check if blur mode is enabled via query parameter
    // const isBlurMode = searchParams.get('q') === 'br';
    const isBlurMode = true;
    const companyTitle = searchParams.get('ttl');

    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [jobDetails, setJobDetails] = useState<CandidatesResponse['job_details'] | null>(null);
    const [showCandidateList, setShowCandidateList] = useState(true); // Start with list visible
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<CandidatesResponse['pagination'] | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showListContainer, setShowListContainer] = useState(true);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [showVerticalVideoPlayer, setShowVerticalVideoPlayer] = useState(false);

    // Dialog states for shortlist/remove actions
    const [showShortlistDialog, setShowShortlistDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [shortlistReason, setShortlistReason] = useState('');
    const [removeReason, setRemoveReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Candidate highlights data
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
                "Shows resilience for 100-150 daily call volume requirement",
                "Value-based selling approach fits education sales perfectly",
                "Growth mindset adapts well to 8-touchpoint follow-up process",
                "Natural counseling style matches healthcare professional guidance"
            ],
            development_required: [
                "Communication confidence for high-volume calling",
                "Deeper consultative questioning techniques"
            ],
            overall_assessment: "Strong resilience and customer focus, but needs work on communication confidence. Good fit for high-volume calling role with some training."
        },
        "68b2b00cf6363c9cad069e7c": {
            name: "Khushboo Changulani",
            role: "Business Development Head",
            experience: "Over 10 years of sales experience, primarily in the education sector",
            strengths: [
                "Achieved highest enrollment numbers nationally for an edtech platform",
                "Facilitated ~900 admissions for CAT program at T.I.M.E",
                "Managed sales pipelines and negotiated contracts",
                "Mentored teams and demonstrated strong lead conversion"
            ],
            potential_red_flags: [
                "Employment gap: Nov 2016 - Jan 2019",
                "Short tenures at various institutions – may raise questions about long-term commitment"
            ],
            short_summary: "Proven edtech sales leader with strong business development and admissions success.",
            main_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Khusbhoo Edited Video.m3u8",
            magic_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Khushboo Magic Clipp.m3u8",
            why_they_match: [
                "Strong consultative approach perfect for healthcare education counseling",
                "Value-focused selling using success stories and program benefits",
                "Sales experience with genuine excitement for guiding medical professionals",
                "Natural relationship builder who connects well and builds trust"
            ],
            development_required: [
                "Structured discovery questioning during calls",
                "Organized presentation delivery"
            ],
            overall_assessment: "Excellent consultative skills and healthcare passion. Strong fit with minor presentation refinement needed."
        },
        "68ba71a5c5e3293919bed866": {
            name: "Sarik Khan",
            role: "Customer Relationship and Retention Assistant Manager",
            experience: "Over 4 years of sales experience at Think and Learn Private Limited (Byjus)",
            strengths: [
                "Developed retention strategies reducing churn and improving client satisfaction",
                "Trained and mentored junior team members",
                "Focused on upselling and cross-selling",
                "Proven ability to resolve complex customer issues"
            ],
            potential_red_flags: [
                "Singular focus on one company for 4 years",
                "May indicate limited adaptability to new industries"
            ],
            short_summary: "Experienced in customer retention and sales growth with strong mentoring skills.",
            main_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Sarik Khan Edited Video.m3u8",
            magic_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Sarik Khan Magic clip.m3u8",
            why_they_match: [
                "Maintains positive attitude through rejection cycles",
                "Customer-focused approach emphasizing product benefits",
                "Understands enrollment urgency tactics and discount strategies",
                "Respectful communication showing consideration for prospects"
            ],
            development_required: [
                "Structured discovery and objection handling frameworks",
                "Communication clarity and specificity"
            ],
            overall_assessment: "Positive attitude and customer focus, but lacks structured sales approach. Suitable for role with comprehensive training."
        },
        "68a6980adba7e6e92fd34f50": {
            name: "Baini Bala Vardhan",
            role: "School Relationship Officer",
            experience: "1 year of business development and sales experience",
            strengths: [
                "Identified and signed school partners",
                "Maintained strong after-sale relations",
                "Completed Business Development Internship focused on social media sales",
                "Contributed to revenue growth in educational and digital marketing sectors"
            ],
            potential_red_flags: [
                "Lacks specific numerical achievements",
                "Very recent transition from internship to full-time"
            ],
            short_summary: "Young professional focused on school partnerships and digital sales growth.",
            main_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Baini Bala Vardhan Edited video.m3u8",
            magic_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Baini Bala Vardhan Magic Clipp.m3u8",
            why_they_match: [
                "Adapts approach based on customer feedback and specific needs",
                "Structured resilience methods with manager support systems",
                "Basic needs analysis covering interest, skills, and career goals",
                "Team-oriented mindset values collaborative sales environment"
            ],
            development_required: [
                "Call opening structure and discovery depth",
                "Communication clarity and confidence"
            ],
            overall_assessment: "Good systematic thinking and adaptability, but communication needs improvement. Decent fit with focused training."
        },
        "68a54eb867ab9d61d5328564": {
            name: "Shaik Mujahid",
            role: "Assistant Manager",
            experience: "13 years of sales experience, mostly in IT training sector",
            strengths: [
                "Managed inbound & outbound sales calls",
                "Counseled students on software courses",
                "Coordinated with marketing teams to meet sales targets",
                "Strong cold calling and customer engagement skills"
            ],
            potential_red_flags: [
                "8-year tenure in current role without advancement",
                "May indicate limited upward mobility or motivation for change"
            ],
            short_summary: "Veteran sales professional with extensive experience in IT training and customer engagement.",
            main_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Shaik Mujahid Edited Video.m3u8",
            magic_video_url: "https://scooter.blob.core.windows.net/scooter-processed-videos/Shaik Mujahid Magic Clip.m3u8",
            why_they_match: [
                "Solution-focused mindset maintaining positive attitude",
                "Understands career investment value proposition for education",
                "Learning-oriented approach willing to improve after feedback",
                "Appreciates team collaboration for professional growth"
            ],
            development_required: [
                "Communication structure and message clarity",
                "Systematic sales approach and frameworks"
            ],
            overall_assessment: "Right mindset and attitude, but lacks communication clarity and sales structure."
        }
    };

    // Helper function to get candidate highlights
    const getCandidateHighlights = (profileId: string) => {
        return candidateHighlights[profileId as keyof typeof candidateHighlights];
    };

    // Helper function to get candidate order for sorting
    const getCandidateOrder = (profileId: string): number => {
        const order = Object.keys(candidateHighlights).indexOf(profileId);
        return order === -1 ? 999 : order; // Put unknown candidates at the end
    };

    // Sort candidates according to predefined order
    const sortedCandidates = candidates ? [...candidates].sort((a, b) => {
        const orderA = getCandidateOrder(a.profile_id);
        const orderB = getCandidateOrder(b.profile_id);
        return orderA - orderB;
    }) : [];

    useEffect(() => {
        if (jobId) {
            fetchCandidates();
        }
    }, [jobId, currentPage]);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            // Fetch candidates with videoAttended filter set to true
            const response = await getJobCandidates(
                jobId,
                currentPage,
                20,
                undefined, // application_status
                undefined, // videoAttended - only show candidates who attended video interviews
                true, // shortlisted
                undefined, // callForInterview
                undefined, // audioAttended
                undefined, // videoInterviewSent
                undefined // all_candidates
            );

            setCandidates(response.candidates);
            setPagination(response.pagination);
            setJobDetails(response.job_details);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleCandidateSelect = (candidate: Candidate) => {
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

    // Shortlist dialog handlers
    const handleShortlistClick = () => {
        // Don't open dialog if already shortlisted
        if (selectedCandidate?.call_for_interview === true) return;

        setShowShortlistDialog(true);
        setShortlistReason('');
    };

    const handleShortlistSubmit = async () => {
        if (!selectedCandidate?.profile_id) return;

        setIsSubmitting(true);
        try {
            await callForInterview({
                user_id: selectedCandidate.profile_id,
                call_for_interview: true,
                notes: shortlistReason || 'Candidate shortlisted for interview'
            });

            // Refresh candidates data
            await fetchCandidates();
            setShowShortlistDialog(false);
            setShortlistReason('');
        } catch (error) {
            console.error('Error shortlisting candidate:', error);
            // You might want to show a toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    // Remove dialog handlers
    const handleRemoveClick = () => {
        setShowRemoveDialog(true);
        setRemoveReason('');
    };

    const handleRemoveSubmit = async () => {
        if (!selectedCandidate?.profile_id || !removeReason.trim()) return;

        setIsSubmitting(true);
        try {
            await markFinalShortlist({
                user_id: selectedCandidate.profile_id,
                final_shortlist: false,
                reason: removeReason
            });

            // Refresh candidates data
            await fetchCandidates();
            setShowRemoveDialog(false);
            setRemoveReason('');
        } catch (error) {
            console.error('Error removing candidate:', error);
            // You might want to show a toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    // Create video data array for vertical video player
    const getVideoDataArray = () => {
        return sortedCandidates
            .map(candidate => {
                const candidateData = getCandidateHighlights(candidate.profile_id);
                const magicVideoUrl = candidateData?.magic_video_url;

                if (magicVideoUrl) {
                    return {
                        id: candidate.profile_id,
                        url: magicVideoUrl,
                        title: `See ${candidateData?.name} Sell`,
                        candidateName: candidateData?.name || candidate.basic_information?.full_name || 'Unknown'
                    };
                }
                return null;
            })
            .filter((video): video is NonNullable<typeof video> => video !== null);
    };

    const formatCTC = (ctc: any): string => {
        if (!ctc) return 'Not specified';
        if (typeof ctc === 'number') {
            return `${(ctc / 100000).toFixed(1)} Lac/per annum`;
        } else {
            return `${ctc.currencyType || '₹'}${(ctc.value / 100000).toFixed(1)}L`;
        }
        return ctc.toString();
    };

    const getMatchIcon = (match: boolean) => {
        return match ? (
            <FaCheck className="text-green-600 text-lg" />
        ) : (
            <FaTimes className="text-red-600 text-lg" />
        );
    };

    const getExperienceYears = (candidate: Candidate): string => {
        const totalExp = candidate?.career_overview?.total_years_experience || 0;
        const years = Math.floor(totalExp);
        const months = Math.round((totalExp - years) * 12);
        return `${years} years ${months} months`;
    };

    const parseJobFitAssessment = (text: string) => {
        const result: any = {};

        // Extract overall Job Fit Assessment value
        const jobFitMatch = text.match(/\*\*Job Fit Assessment:\s*(.*?)\*\*/i);
        result.job_fit = jobFitMatch ? jobFitMatch[1].trim() : null;

        // Extract Rationale Section
        const rationaleMatch = text.match(/\*\*Rationale:\*\*([\s\S]*?)(?=\nOverall|$)/i);
        const rationaleText = rationaleMatch ? rationaleMatch[1].trim() : "";

        // Extract bullet points
        //@ts-ignore
        const bullets = [...rationaleText.matchAll(/- \*\*(.*?)\*\*:?[\s]*(.*?)(?=\n-|\n*$)/gs)];
        bullets.forEach(([_, key, value]) => {
            result[key.toLowerCase().replace(/\s+/g, "_")] = value.trim();
        });

        // Extract overall summary or fallback
        // The 's' (dotAll) flag is not supported in ES2017 and below, so we remove it.
        // The 'i' flag (case-insensitive) is sufficient for this use case.
        const overallMatch = text.match(/Overall[,:]?\s*(.*)$/i);
        if (overallMatch) {
            result.overall_summary = overallMatch[1].trim();
        } else if (bullets.length > 0) {
            result.overall_summary = bullets[bullets.length - 1][2].trim();
        } else {
            result.overall_summary = null;
        }

        // Debug logging
        // console.log('parseJobFitAssessment - Full Result:', result);

        // Check for positive indicators in each section
        const experienceLevel = result.experience_level ?
            /over \d+ years|extensive|strong|progressive|leadership|capabilities|total of \d+ years|demonstrated|proven|senior roles|aligns well|career trajectory/i.test(result.experience_level) : false;

        const industryAlignment = result.industry_alignment ?
            /aligns well|extensive experience|relevant|matches|suitable|deep understanding|sector|industry|education sector|edtech|coaching institutes|IT training sector/i.test(result.industry_alignment) : false;

        const salesSkills = result.sales_skills ?
            /strong|demonstrated|robust|proven|achieving|managing|proficiency|experience shows|crucial for|track record|sales skills|B2C|B2B|sales pipeline|cold calls|inbound|outbound/i.test(result.sales_skills) : false;

        // console.log('parseJobFitAssessment - Boolean Results:', { experienceLevel, industryAlignment, salesSkills });

        return {
            experienceLevel,
            industryAlignment,
            salesSkills,
            parsedData: result // Include the full parsed data for display
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-text-primary">Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (!loading && sortedCandidates.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">No Candidates Found</h2>
                    <p className="text-text-primary">No candidates with video interviews found for this job.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main relative overflow-hidden">
            {/* Logo */}
            <div className="flex justify-between bg-bg-main px-8 py-4 border-b-2 border-gray-200 sm:mx-4">
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter Logo"
                        width={32}
                        height={32}
                    />
                    <h1 className="text-3xl font-thin text-text-primary">scooter</h1>
                </div>
                {
                    companyTitle ? (
                        <div className="hidden md:block text-center">
                            <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                                {companyTitle}
                            </h1>
                        </div>
                    ) : (jobDetails?.title && (
                        <div className="hidden md:block text-center">
                            <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                                {jobDetails.title}
                            </h1>
                        </div>
                    )
                    )
                }

                {
                    !showCandidateList && (
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleShowListContainer}
                                variant="outline"
                                className="flex justify-between gap-2 bg-element-3 hover:bg-element-2 hover:text-cta-primary hover:border-cta-outline hover:border-2 text-cta-primary px-6 sm:px-8 py-3 rounded-full">
                                <FaList className="text-lg" />
                                <p className='hidden lg:block'>{showListContainer ? 'Hide Candidates List' : 'Show Candidates List'}  ({sortedCandidates.length})</p>
                            </Button>
                        </div>
                    )
                }
            </div>

            {/* Mobile backdrop for floating candidate list */}
            {!showCandidateList && showListContainer && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={handleShowListContainer}
                />
            )}

            {/* Main Layout Container */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Candidate Details Container */}
                <div
                    className={`transition-all duration-500 ease-in-out ${showCandidateList
                        ? 'w-0 opacity-0'
                        : showListContainer
                            ? 'w-2/3 lg:w-3/4 xl:w-4/5 opacity-100'
                            : 'w-full opacity-100'
                        } ${!showCandidateList && isAnimating
                            ? 'transform translate-x-0'
                            : ''
                        } overflow-auto scrollbar-thin`}
                >
                    {selectedCandidate && (
                        <div className="h-full flex flex-col w-full">
                            {/* Header */}
                            <div className="bg-bg-main border-b-2 border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
                                {jobDetails?.title && (
                                    <div className="md:hidden text-center border-b-2 pb-4 mb-4 border-gray-400">
                                        <h1 className="text-xl sm:text-xl font-bold text-text-primary">
                                            {jobDetails.title}
                                        </h1>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start lg:items-center">
                                    {/* Left: Identity */}
                                    <div className="text-left">
                                        <h2 className={`text-xl sm:text-2xl font-bold text-text-primary mb-1 ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                            {isBlurMode ? 'John Doe' : selectedCandidate.basic_information?.full_name}
                                        </h2>
                                        <div className="flex items-center justify-start gap-2 text-text-primary mb-2">
                                            <FaMapMarkerAlt className="text-sm sm:text-md font-semibold" />
                                            <span className={`text-xs sm:text-sm text-text-primary ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                {isBlurMode ? 'New York, NY' : (selectedCandidate.basic_information?.current_location || 'Location not specified')}
                                            </span>
                                        </div>
                                        {selectedCandidate.basic_information?.open_to_relocation ? (
                                            <Badge className="bg-bg-secondary-3 text-black px-2 sm:px-3 py-1 text-xs font-medium rounded-none">
                                                Open To Relocation
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-bg-secondary-2 text-black px-2 sm:px-3 py-1 text-xs font-medium rounded-none">
                                                Not Open To Relocation
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Center: Action */}
                                    <div className="flex justify-center lg:justify-center items-center">
                                        <div className="text-center">
                                            <Button
                                                onClick={() => {
                                                    if (!showCandidateList) {
                                                        handleShowVerticalVideoPlayer();
                                                    }
                                                }}
                                                className="mx-auto bg-cta-primary hover:bg-green-800 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2"
                                            >
                                                {showCandidateList ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                                            </Button>
                                            <p className="text-sm text-text-primary font-medium">
                                                {showCandidateList ? 'Hide' : 'See Them Sell'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Contact */}
                                    <div className="flex flex-col ">
                                        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Contact</h3>
                                        <div className="space-y-1 sm:space-y-2 w-full lg:w-auto">
                                            {selectedCandidate.basic_information?.linkedin_url && (
                                                <div className="flex items-center justify-start gap-2 text-xs sm:text-sm text-text-primary">
                                                    <FaLinkedin className="text-blue-600" />
                                                    <span className={`truncate max-w-[150px] sm:max-w-none ${isBlurMode ? 'blur-sm select-none' : ''}`}>{isBlurMode ? 'linkedin.com/in/johndoe' : selectedCandidate.basic_information.linkedin_url}</span>
                                                </div>
                                            )}
                                            {selectedCandidate.basic_information?.phone_number && (
                                                <div className="flex items-center justify-start  gap-2 text-xs sm:text-sm text-text-primary">
                                                    <FaPhone className="text-green-600" />
                                                    <span className={isBlurMode ? 'blur-sm select-none' : ''}>{isBlurMode ? '+1 (555) 123-4567' : selectedCandidate.basic_information.phone_number}</span>
                                                </div>
                                            )}
                                            {selectedCandidate.basic_information?.email && (
                                                <div className="flex items-center justify-start  gap-2 text-xs sm:text-sm text-text-primary">
                                                    <FaEnvelope className="text-yellow-600" />
                                                    <span className={`truncate max-w-[150px] sm:max-w-none ${isBlurMode ? 'blur-sm select-none' : ''}`}>{isBlurMode ? 'john.doe@example.com' : selectedCandidate.basic_information.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1  p-4 sm:p-6">
                                <div className="max-w-8xl mx-auto">
                                    {/* Top Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                                        {/* On Paper Section */}
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-text-primary text-center">On Paper</h3>

                                            {/* Job Fit Analysis Accordion */}
                                            <Accordion type="single" defaultValue='job-fit-analysis' collapsible className="mb-6">
                                                <AccordionItem value="job-fit-analysis" className="bg-bg-main border-purple-200 rounded-none">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                        <h4 className="font-bold text-text-primary">Job Fit Analysis</h4>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        {(() => {
                                                            const assessment = selectedCandidate.job_fit_assessment || '';

                                                            // Extract the overall rating (HIGH/MEDIUM/LOW)
                                                            const ratingMatch = assessment.match(/\*\*Job Fit Assessment:\s*(\w+)\*\*/);
                                                            const rating = ratingMatch ? ratingMatch[1].toUpperCase() : 'MEDIUM';

                                                            // Determine color based on rating
                                                            const getRatingColor = (rating: string) => {
                                                                switch (rating) {
                                                                    case 'HIGH': return 'bg-element-1';
                                                                    case 'MEDIUM': return 'bg-element-2';
                                                                    case 'LOW': return 'bg-element-4';
                                                                    default: return 'bg-element-2';
                                                                }
                                                            };

                                                            // Use the new parseJobFitAssessment function
                                                            const parsedAssessment = parseJobFitAssessment(assessment);
                                                            const { parsedData } = parsedAssessment;

                                                            // Debug logging
                                                            // console.log('Assessment:', assessment);
                                                            // console.log('Parsed Assessment Data:', parsedData);
                                                            // console.log('experience_Level:', parsedData["experience_level:"]);
                                                            // console.log('industry_Alignment:', parsedData["industry_alignment:"]);
                                                            // console.log('sales_Skills:', parsedData["sales_skills:"]);

                                                            return (
                                                                <div className="space-y-4 text-sm text-text-primary">
                                                                    {/* Experience Level */}
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="font-medium text-text-primary">Experience Level:</span>
                                                                        </div>
                                                                        {parsedData["experience_level:"] || parsedData["experience_level"] ? (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-element-1">
                                                                                <p className="text-sm text-text-primary whitespace-pre-wrap">{isBlurMode ? 'Candidate demonstrates strong experience in sales roles with proven track record of meeting targets and building client relationships. Shows expertise in consultative selling and customer engagement strategies.' : (parsedData["experience_level:"] || parsedData["experience_level"])}</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-gray-300">
                                                                                <p className="text-sm text-text-primary">Experience level details not available</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Sales Skills */}
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="font-medium text-text-primary">Sales Skills:</span>
                                                                        </div>
                                                                        {parsedData["sales_skills:"] || parsedData["sales_skills"] ? (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-element-1">
                                                                                <p className="text-sm text-text-primary whitespace-pre-wrap">{isBlurMode ? 'Strong communication skills with ability to build rapport and close deals. Demonstrates proficiency in lead generation, pipeline management, and customer relationship building. Shows expertise in objection handling and value proposition presentation.' : (parsedData["sales_skills:"] || parsedData["sales_skills"])}</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-gray-300">
                                                                                <p className="text-sm text-text-primary">Sales skills details not available</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Industry Alignment */}
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="font-medium text-text-primary">Industry Alignment:</span>
                                                                        </div>
                                                                        {parsedData["industry_alignment:"] || parsedData["industry_alignment"] ? (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-element-1">
                                                                                <p className="text-sm text-text-primary whitespace-pre-wrap">{isBlurMode ? 'Candidate has relevant experience in target industry with understanding of market dynamics and customer needs. Shows alignment with company values and business objectives. Demonstrates knowledge of industry trends and competitive landscape.' : (parsedData["industry_alignment:"] || parsedData["industry_alignment"])}</p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-bg-main p-3 rounded-none border-l-4 border-gray-300">
                                                                                <p className="text-sm text-text-primary">Industry alignment details not available</p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Location Fit */}
                                                                    {/* <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-medium text-text-primary">Location Fit:</span>
                                                            </div>
                                                            {parsedData.location_fit ? (
                                                                <div className="bg-bg-main p-3 rounded-none border-l-4 border-element-1">
                                                                    <p className="text-sm text-text-primary whitespace-pre-wrap">{parsedData.location_fit}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-bg-main p-3 rounded-none border-l-4 border-gray-300">
                                                                    <p className="text-sm text-text-primary">Location fit details not available</p>
                                                                </div>
                                                            )}
                                                                    </div> */}
                                                                </div>
                                                            );
                                                        })()}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>

                                            {/* Expandable Sections */}
                                            <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <AccordionItem value="icp" className="bg-bg-main border-purple-200 rounded-none">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                        <h4 className="font-bold text-text-primary">ICP</h4>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        <div className="space-y-3">
                                                            <p className="text-sm text-text-primary">
                                                                Ideal customer profile analysis and targeting strategies based on candidate's experience.
                                                            </p>

                                                            {selectedCandidate.audio_interview_details?.audio_interview_summary?.icp_summary && (
                                                                <div className="bg-bg-main p-3 rounded-none ">
                                                                    <h5 className="font-medium text-text-primary mb-2">Identified ICPs:</h5>
                                                                    <ul className="space-y-1 text-sm text-text-primary">
                                                                        {selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary
                                                                            .filter(icp => typeof icp === 'string' && icp.toLowerCase().indexOf('not mentioned') === -1)
                                                                            .map((icp, index) => (
                                                                                <li key={index}>• {icp}</li>
                                                                            ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>

                                                <AccordionItem value="sales-motion" className="bg-bg-main border-purple-200 rounded-none">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                        <h4 className="font-bold text-text-primary">Sales Motion</h4>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        <div className="space-y-3">
                                                            <p className="text-sm text-text-primary">
                                                                Sales methodology and approach used by the candidate in previous roles.
                                                            </p>
                                                            {selectedCandidate.audio_interview_details?.audio_interview_summary?.sales_motion_summary && (
                                                                <div className="bg-bg-main p-3 rounded-none">
                                                                    <h5 className="font-medium text-text-primary mb-2">Sales Motion Types:</h5>
                                                                    <ul className="space-y-1 text-sm text-text-primary">
                                                                        {selectedCandidate.audio_interview_details.audio_interview_summary.sales_motion_summary.map((motion, index) => (
                                                                            <li key={index}>• {motion}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>

                                                <AccordionItem value="sales-cycle" className="bg-bg-main border-purple-200 rounded-none">
                                                    <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                        <h4 className="font-bold text-text-primary">Sales Cycle</h4>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4">
                                                        <div className="space-y-3">
                                                            <p className="text-sm text-text-primary">
                                                                Typical sales cycle length and process management capabilities.
                                                            </p>
                                                            {selectedCandidate.audio_interview_details?.audio_interview_summary?.sales_cycle_summary && (
                                                                <div className="bg-bg-main p-3 rounded-none">
                                                                    <h5 className="font-medium text-text-primary mb-2">Sales Cycle Types:</h5>
                                                                    <ul className="space-y-1 text-sm text-text-primary">
                                                                        {selectedCandidate.audio_interview_details.audio_interview_summary.sales_cycle_summary.map((cycle, index) => (
                                                                            <li key={index}>• {cycle}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>

                                        {/* In Person Section */}
                                        <div className="space-y-4 sm:space-y-6 border-l-0 lg:border-l-2 pl-0 lg:pl-8 border-gray-200">
                                            <h3 className="text-xl font-bold text-text-primary text-center">In Person</h3>

                                            {/* Video Player */}
                                            <div className="bg-bg-main rounded-none p-4 sm:p-6 shadow-sm">
                                                {(() => {
                                                    const candidateData = selectedCandidate?.profile_id ? getCandidateHighlights(selectedCandidate.profile_id) : null;
                                                    const videoUrl = candidateData?.main_video_url || selectedCandidate.interview_status?.video_interview_url;

                                                    return videoUrl ? (
                                                        <VideoPlayer
                                                            videoUrl={videoUrl}
                                                            className="w-full h-64 sm:h-80 rounded-none"
                                                            controls={true}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-none flex items-center justify-center">
                                                            <div className="text-center">
                                                                <FaPlay className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm sm:text-base text-text-primary">No video available</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Highlights */}
                                            <Card className=" py-4 rounded-none shadow-none bg-bg-main">
                                                <CardContent className="p-4">
                                                    <div className="w-fit flex items-center justify-center bg-element-3 p-2 mx-auto mb-3">
                                                        <h4 className="font-bold text-text-primary text-center">Highlights</h4>
                                                    </div>
                                                    {selectedCandidate?.profile_id && getCandidateHighlights(selectedCandidate.profile_id) ? (
                                                        <div className="space-y-6">
                                                            {/* Why They Match Section */}
                                                            <div>
                                                                <h5 className="font-semibold text-text-primary mb-3 text-green-600">Why They Match</h5>
                                                                <ul className="space-y-2">
                                                                    {isBlurMode ? (
                                                                        <>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Strong communication skills and professional demeanor</span>
                                                                            </li>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Relevant industry experience and knowledge</span>
                                                                            </li>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Proven track record of meeting sales targets</span>
                                                                            </li>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Customer-focused approach and relationship building</span>
                                                                            </li>
                                                                        </>
                                                                    ) : (
                                                                        getCandidateHighlights(selectedCandidate.profile_id)?.why_they_match?.map((match: string, index: number) => (
                                                                            <li key={index} className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>{match}</span>
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            {/* Development Required Section */}
                                                            <div>
                                                                <h5 className="font-semibold text-text-primary mb-3 text-orange-600">Development Required</h5>
                                                                <ul className="space-y-2">
                                                                    {isBlurMode ? (
                                                                        <>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaExclamationCircle className="text-orange-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Enhanced product knowledge and technical expertise</span>
                                                                            </li>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaExclamationCircle className="text-orange-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>Advanced sales techniques and objection handling</span>
                                                                            </li>
                                                                            <li className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaExclamationCircle className="text-orange-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>CRM system proficiency and sales process optimization</span>
                                                                            </li>
                                                                        </>
                                                                    ) : (
                                                                        getCandidateHighlights(selectedCandidate.profile_id)?.development_required?.map((development: string, index: number) => (
                                                                            <li key={index} className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaExclamationCircle className="text-orange-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>{development}</span>
                                                                            </li>
                                                                        ))
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className='text-sm'>
                                                            <ReactMarkdown>{selectedCandidate?.short_summary}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <Accordion type="multiple" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        {/* Experience Summary */}
                                        <AccordionItem value="experience" className="bg-bg-main border-purple-200 rounded-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                <h4 className="font-bold text-text-primary">Experience</h4>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="bg-bg-main p-3 rounded-none">
                                                        <h5 className="font-medium text-text-primary mb-2">Career Overview</h5>
                                                        <div className="space-y-2 text-sm text-text-primary">
                                                            <div>Total Experience: {getExperienceYears(selectedCandidate)}</div>
                                                            <div>Sales Experience: {selectedCandidate.career_overview?.years_sales_experience || 0} years</div>
                                                            <div>Average Tenure: {selectedCandidate.career_overview?.average_tenure_per_role || 0} years per role</div>
                                                            {selectedCandidate.career_overview?.employment_gaps?.has_gaps && (
                                                                <div className="text-orange-600">Employment Gaps: {selectedCandidate.career_overview.employment_gaps.duration}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedCandidate.career_overview?.company_history && (
                                                        <div className="bg-bg-main p-3 rounded-none">
                                                            <h5 className="font-medium text-text-primary mb-2">Company History</h5>
                                                            <div className="space-y-2 text-sm text-text-primary">
                                                                {selectedCandidate.career_overview.company_history.map((company, index) => (
                                                                    <div key={index} className="border-l-2 border-gray-200 pl-3">
                                                                        <div className="font-medium">{company.position}</div>
                                                                        <div className={`text-text-primary ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                                            {isBlurMode ? 'Tech Solutions Inc.' : company.company_name}
                                                                        </div>
                                                                        <div className="text-text-primary">
                                                                            {company.start_date} - {company.is_current ? 'Present' : company.end_date}
                                                                            {company.duration_months > 0 && (
                                                                                <span className="ml-2">({company.duration_months} months)</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Budget Information */}
                                        <AccordionItem value="budget" className="bg-bg-main border-purple-200 rounded-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                <h4 className="font-bold text-text-primary">Budget Analysis</h4>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="bg-bg-main p-3 rounded-none">
                                                        <h5 className="font-medium text-text-primary mb-2">Compensation Details</h5>
                                                        <div className="space-y-2 text-sm text-text-primary">
                                                            <div className="flex justify-between">
                                                                <span>Current CTC:</span>
                                                                <span className={`font-medium ${isBlurMode ? 'blur-sm select-none' : ''}`}>{isBlurMode ? '₹8.5 Lac/per annum' : formatCTC(selectedCandidate.basic_information?.current_ctc)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Expected CTC:</span>
                                                                <span className={`font-medium ${isBlurMode ? 'blur-sm select-none' : ''}`}>{isBlurMode ? '₹12.0 Lac/per annum' : formatCTC(selectedCandidate.basic_information?.expected_ctc)}</span>
                                                            </div>
                                                            {selectedCandidate.basic_information?.current_ctc && selectedCandidate.basic_information?.expected_ctc && (
                                                                <div className="flex justify-between pt-2 border-t">
                                                                    <span>Increase:</span>
                                                                    <span className={`font-medium text-green-600 ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                                        {isBlurMode ? '41.2%' : (() => {
                                                                            const currentValue = typeof selectedCandidate.basic_information.current_ctc === 'number'
                                                                                ? selectedCandidate.basic_information.current_ctc
                                                                                : selectedCandidate.basic_information.current_ctc.value;
                                                                            const expectedValue = typeof selectedCandidate.basic_information.expected_ctc === 'number'
                                                                                ? selectedCandidate.basic_information.expected_ctc
                                                                                : selectedCandidate.basic_information.expected_ctc.value;
                                                                            return (((expectedValue - currentValue) / currentValue) * 100).toFixed(1);
                                                                        })()}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Notice Period */}
                                        <AccordionItem value="notice-period" className="bg-bg-main border-purple-200 rounded-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                <h4 className="font-bold text-text-primary">Notice Period</h4>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="bg-bg-main p-3 rounded-none">
                                                        <h5 className="font-medium text-text-primary mb-2">Availability</h5>
                                                        <div className="space-y-2 text-sm text-text-primary">
                                                            <div className="flex justify-between">
                                                                <span>Notice Period:</span>
                                                                <span className={`font-medium ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                                    {isBlurMode ? '30 days' : (selectedCandidate.basic_information?.notice_period || 'Not specified')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Open to Relocation:</span>
                                                                <span className={`font-medium ${selectedCandidate.basic_information?.open_to_relocation ? 'text-green-600' : 'text-red-600'} ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                                    {isBlurMode ? 'Yes' : (selectedCandidate.basic_information?.open_to_relocation ? 'Yes' : 'No')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Current Location:</span>
                                                                <span className={`font-medium ${isBlurMode ? 'blur-sm select-none' : ''}`}>{isBlurMode ? 'New York, NY' : (selectedCandidate.basic_information?.current_location || 'Not specified')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {/* Additional Info */}
                                        <AccordionItem value="additional-info" className="bg-bg-main border-purple-200 rounded-none">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                <h4 className="font-bold text-text-primary">Additional Info</h4>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="bg-bg-main p-3 rounded-none">
                                                        <h5 className="font-medium text-text-primary mb-2">Resume</h5>
                                                        <div className="space-y-2 text-sm text-text-primary">
                                                            <div className="flex items-center justify-center">
                                                                <Button
                                                                    variant="outline"
                                                                    className={`px-6 py-2 rounded-full flex items-center gap-2 ${isBlurMode
                                                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                                                                        : 'bg-cta-primary hover:bg-cta-primary-text hover:text-cta-primary hover:border-cta-outline hover:border-2 text-white'
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (selectedCandidate.interview_status?.resume_url && !isBlurMode) {
                                                                            window.open(selectedCandidate.interview_status.resume_url, '_blank');
                                                                        }
                                                                    }}
                                                                    disabled={!selectedCandidate.interview_status?.resume_url || isBlurMode}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    {isBlurMode ? 'Resume Hidden' : 'Download Resume'}
                                                                </Button>
                                                            </div>
                                                            {!selectedCandidate.interview_status?.resume_url && (
                                                                <p className="text-xs text-text-secondary text-center mt-2">
                                                                    Resume not available
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                        <Button
                                            onClick={isBlurMode ? undefined : handleShortlistClick}
                                            variant="outline"
                                            disabled={selectedCandidate?.call_for_interview === true}
                                            className={`px-6 sm:px-8 py-3 rounded-full ${selectedCandidate?.call_for_interview === true
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-cta-primary hover:bg-cta-primary-text hover:text-cta-primary hover:border-cta-outline hover:border-2 text-white'
                                                }`}
                                        >
                                            {selectedCandidate?.call_for_interview === true ? 'Shortlisted' : 'Shortlist'}
                                        </Button>

                                        <Button
                                            onClick={isBlurMode ? undefined : handleRemoveClick}
                                            variant="outline"
                                            className="bg-cta-primary hover:bg-cta-primary-text hover:text-cta-primary hover:border-cta-outline hover:border-2 text-white px-6 sm:px-8 py-3 rounded-full"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* Candidate List Container */}
                <div
                    className={`transition-all duration-500 ease-in-out ${showCandidateList
                        ? 'w-full'
                        : showListContainer
                            ? 'w-full md:w-1/3 lg:w-1/4 xl:w-1/5'
                            : 'w-0 opacity-0'
                        } ${!showCandidateList && isAnimating
                            ? 'transform -translate-x-0'
                            : ''
                        } ${!showListContainer && !showCandidateList
                            ? 'transform translate-x-full'
                            : ''
                        } ${!showCandidateList && showListContainer
                            ? 'fixed top-0 right-0 h-full z-50 bg-bg-main shadow-2xl md:static md:shadow-none md:z-auto'
                            : 'md:static'
                        } overflow-y-auto`}
                >
                    <div className="h-full flex flex-col">
                        {/* Mobile floating header with close button */}
                        {!showCandidateList && showListContainer && (
                            <div className="md:hidden sticky top-0 z-[60] bg-bg-main border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-text-primary">Candidates ({sortedCandidates.length})</h2>
                                <button
                                    onClick={handleShowListContainer}
                                    className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                                >
                                    <FaArrowLeft className="text-gray-600" />
                                </button>
                            </div>
                        )}
                        {/* Header for candidate list */}
                        {
                            showCandidateList && (
                                <div className="bg-bg-main border-b-2 border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
                                    <div className="text-center relative">
                                        {/* Close button for mobile floating list */}
                                        {!showCandidateList && showListContainer && (
                                            <button
                                                onClick={handleShowListContainer}
                                                className="absolute z-[100] top-0 right-0 md:hidden bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
                                            >
                                                <FaArrowLeft className="text-gray-600" />
                                            </button>
                                        )}
                                        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                                            Select a Candidate
                                        </h2>
                                        <p className="text-sm sm:text-base text-text-primary">
                                            Choose a candidate to view their detailed portfolio
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                        {/* <div className="bg-bg-main border-b-2 border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
                            <div className="text-center">
                                <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                                    {showCandidateList ? 'Select a Candidate' : 'Candidates'}
                                </h2>
                                <p className="text-sm sm:text-base text-text-primary">
                                    {showCandidateList
                                        ? 'Choose a candidate to view their detailed portfolio'
                                        : `${sortedCandidates.length} candidates available`
                                    }
                                </p>
                            </div>
                        </div> */}

                        {/* Candidate List */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
                            <div className="max-w-4xl mx-auto">
                                <div className={`grid gap-3 sm:gap-4 ${showCandidateList
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                                    }`}>
                                    {sortedCandidates.map((candidate) => (
                                        <Card
                                            key={candidate.profile_id || candidate.user_id}
                                            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${selectedCandidate?.profile_id === candidate.profile_id ||
                                                selectedCandidate?.user_id === candidate.user_id
                                                ? 'ring-2 ring-element-2 bg-bg-main'
                                                : ''
                                                }`}
                                            onClick={() => handleCandidateSelect(candidate)}
                                        >
                                            <CardContent className={`${showCandidateList ? 'p-4 sm:p-6' : 'p-3'} space-y-0 pt-4 flex flex-col justify-center items-center gap-4`}>
                                                <div className={`flex mt-4 ${showCandidateList ? 'flex-col items-center justify-center text-center' : 'items-center gap-3'}`}>
                                                    <div className={`${showCandidateList ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-10 h-10'} bg-gray-200 rounded-full flex items-center justify-center ${showCandidateList ? 'mb-3 sm:mb-4' : 'flex-shrink-0'}`}>
                                                        <FaUser className={`${showCandidateList ? 'text-lg sm:text-2xl' : 'text-sm'} text-text-primary text-center`} />
                                                    </div>
                                                    <div className='flex flex-col justify-center'>
                                                        <h4 className={`font-bold ${showCandidateList ? 'text-base sm:text-lg' : 'text-sm'} text-text-primary ${showCandidateList ? 'mb-2' : 'mb-1'} ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                            {isBlurMode ? 'John Doe' : candidate.basic_information?.full_name}
                                                        </h4>
                                                        <p className={`${showCandidateList ? 'text-xs sm:text-sm' : 'text-xs'} text-text-primary ${showCandidateList ? 'mb-3' : 'mb-2'} ${isBlurMode ? 'blur-sm select-none' : ''}`}>
                                                            {isBlurMode ? 'New York, NY' : candidate.basic_information?.current_location}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* 
                                                <div className={`justify-center items-center ${showCandidateList ? 'flex-1' : 'flex-1 min-w-0'}`}>
                                                    <InterviewScoreCompact candidate={candidate} showPopOver={false} containerStyle='bg-bg-secondary border-0' />
                                                </div> */}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.total_pages > 1 && (
                                    <div className={`${showCandidateList ? 'mt-8' : 'mt-4'} flex justify-center gap-2`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={!showCandidateList ? "text-xs px-2 py-1" : ""}
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            {showCandidateList ? 'Previous' : 'Prev'}
                                        </Button>
                                        <span className={`flex items-center px-2 ${showCandidateList ? 'px-3' : 'px-2'} text-xs ${showCandidateList ? 'text-sm' : 'text-xs'} text-text-primary`}>
                                            {showCandidateList ? `Page ${currentPage} of ${pagination.total_pages}` : `${currentPage}/${pagination.total_pages}`}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={!showCandidateList ? "text-xs px-2 py-1" : ""}
                                            disabled={currentPage === pagination.total_pages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            {showCandidateList ? 'Next' : 'Next'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



            </div>

            {/* Video Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-text-primary">See Them Sell</h3>
                            <button
                                onClick={handleCloseVideoModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            {selectedVideoUrl ? (
                                <VideoPlayer
                                    videoUrl={selectedVideoUrl}
                                    className="w-full h-64 sm:h-80 lg:h-96 rounded-lg"
                                    controls={true}
                                />
                            ) : (
                                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <FaPlay className="text-4xl text-gray-400 mx-auto mb-2" />
                                        <p className="text-text-primary">No magic video available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Vertical Video Player Modal */}
            {showVerticalVideoPlayer && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-md mx-auto">
                        {/* Close Button */}
                        <Button
                            onClick={handleCloseVerticalVideoPlayer}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-element-3 hover:bg-element-2 rounded-full p-2 transition-all"
                        >
                            <FaTimes className='w-4 h-4 text-text-primary' />
                        </Button>

                        {/* Vertical Video Player */}
                        <VerticalVideoPlayer
                            videos={getVideoDataArray()}
                            className="w-full h-full"
                            onVideoChange={(video, index) => {
                                console.log(`Playing video ${index + 1}: ${video.title}`);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Shortlist Dialog */}
            <Dialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Shortlist Candidate</DialogTitle>
                        <DialogDescription>
                            Add a reason for shortlisting this candidate (optional)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="shortlist-reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Shortlisting
                            </label>
                            <Textarea
                                id="shortlist-reason"
                                placeholder="Enter reason for shortlisting (optional)..."
                                value={shortlistReason}
                                onChange={(e) => setShortlistReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowShortlistDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShortlistSubmit}
                            disabled={isSubmitting}
                            className="bg-cta-primary hover:bg-cta-primary-text text-white"
                        >
                            {isSubmitting ? 'Shortlisting...' : 'Shortlist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Dialog */}
            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Candidate</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for removing this candidate from consideration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="remove-reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Removal <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="remove-reason"
                                placeholder="Enter reason for removal..."
                                value={removeReason}
                                onChange={(e) => setRemoveReason(e.target.value)}
                                rows={3}
                                className={!removeReason.trim() ? 'border-red-300 focus:border-red-500' : ''}
                            />
                            {!removeReason.trim() && (
                                <p className="text-red-500 text-xs mt-1">Reason is required</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRemoveDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRemoveSubmit}
                            disabled={isSubmitting || !removeReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSubmitting ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}