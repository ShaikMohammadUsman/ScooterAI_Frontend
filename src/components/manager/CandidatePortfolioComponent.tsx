"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ManagerCandidate, MyJobCandidatesResponse } from '@/lib/managerService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import VideoPlayerWithTimeline from '@/components/interview/VideoPlayerWithTimeline';
import VerticalVideoPlayer from '@/components/interview/VerticalVideoPlayer';
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
import { Edit, Edit2, Edit3 } from 'lucide-react';
import ScooterHeader from '@/components/ScooterHeader';

interface CandidatePortfolioComponentProps {
    candidate: ManagerCandidate;
    jobId: string;
    jobDetails?: MyJobCandidatesResponse['job_details'];
    onClose: () => void;
}

export default function CandidatePortfolioComponent({
    candidate,
    jobId,
    jobDetails,
    onClose
}: CandidatePortfolioComponentProps) {
    const router = useRouter();

    const [selectedCandidate, setSelectedCandidate] = useState<ManagerCandidate>(candidate);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [showVerticalVideoPlayer, setShowVerticalVideoPlayer] = useState(false);

    // Dialog states for notes
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [notes, setNotes] = useState<Array<{ id: string; category: string; text: string; author: string }>>([]);

    const addEmptyNote = () => {
        setNotes(prev => [...prev, { id: crypto.randomUUID(), category: '', text: '', author: '' }]);
    };

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
        ,
        // Newly added candidates
        "68c12e1d55934dd430b52cec": {
            name: "Sai Sowmya",
            role: "Healthcare Education Advisor",
            experience: "~2 years overall; Academic Advisor at Aakash; internship at Entri (cold calling, pre-sales)",
            strengths: [
                "Exceeded 100+ enrollments in 3 months at Aakash",
                "Strong lead conversion with student/parent counseling",
                "Cold calling experience and follow-up discipline",
                "Effective rapport-building and objection handling"
            ],
            potential_red_flags: [
                "Multiple short tenures/internships (< 1 year)",
                "Mixed evaluation on structured communication"
            ],
            short_summary: "Sai Sowmya has relevant experience in student counseling and lead conversion, exceeding enrollment targets at Aakash Educational Services. Prior internship experience includes cold calling and pre-sales at Entri. While she shows strong sales performance, the short tenure pattern suggests assessing long-term stability.",
            // main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/sai_sowmya_aster_20250923T084439_master.m3u8",
            main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Sai Sowmya Edited Video_master.m3u8",
            // main_video_url: "https://drive.google.com/file/d/1uLiLbcyukTGPFeICvlwNsobS_RC5hSgz/view?usp=sharing",
            magic_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Sai Sowmya Magic Clips_master.m3u8",
            why_they_match: [
                "Direct alignment to education sales and enrollment workflows",
                "Demonstrated persistence and parent engagement",
                "Comfort with outbound calling and funnel follow-through"
            ],
            development_required: [
                "Tighter verbal structure and clarity",
                "Deeper discovery and tailored recommendations"
            ],
            overall_assessment: "Job Fit: HIGH — proven enrollment execution; communication structure can improve"
        },
        "68bd69349031ec916f9d3196": {
            name: "GAURISHANKAR MALI",
            role: "",
            experience: "< 2 years relevant; technical training/projects (Python, SQL, Django)",
            strengths: [
                "Hands-on technical projects (ML, web apps)",
                "Organized routines and team collaboration"
            ],
            potential_red_flags: [
                "No direct sales experience",
                "Short-term roles/trainings; unclear sales exposure"
            ],
            short_summary: "Recent Computer Engineering graduate with technical project work (Python, SQL, Django). Strong learning trajectory but lacks direct sales exposure; shortlisted for further review.",
            // main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/GAURISHANKAR MALI_aster_20250924T061829_master.m3u8",
            main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/GAURISHANKAR MALI Edited Video_master.m3u8",
            // main_video_url: "https://drive.google.com/file/d/1klU6Kp4R6F4ZNrSmEMZAw63ZpWjNx5Gw/view?usp=sharing",
            magic_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/GAURISHANKAR MALI Magic Clips_master.m3u8",
            why_they_match: [
                "Analytical mindset and project discipline",
                "Growth orientation and teamwork"
            ],
            development_required: [
                "Foundational sales exposure (discovery, objection handling)",
                "Communication structure and clarity"
            ],
            overall_assessment: "Job Fit: LOW — strong technical profile; sales fundamentals to build"
        },
        "68bd6cf69031ec916f9d3197": {
            name: "SINAGAVARAPU SATISH REDDY",
            role: "Healthcare Education Advisor",
            experience: "~4 years sales across Byju's, Edustoke, Infinity Learn, Aakash",
            strengths: [
                "Highest revenue maker (AP & Telangana) at Byju's; 1.5Cr+ from 200+ sales units",
                "Awards: Extra Miler (Edustoke), monthly target achievements (Infinity Learn)",
                "Objection handling and closing under deadlines"
            ],
            potential_red_flags: [
                "Frequent role changes; short tenures"
            ],
            short_summary: "Progressive edtech sales career with notable revenue achievements and awards. Strong closing mindset; tenure stability should be assessed.",
            // main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/SINAGAVARAPU SATISH REDDY_aster_20250924T061140_master.m3u8",
            main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Sinagavarapu Satish Reddy Edited Video_master.m3u8",
            // main_video_url: "https://drive.google.com/file/d/15VIi9LQyEt2bnkhQWooEbL0VmnWgBFOd/view?usp=sharing",
            magic_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/SINAGAVARAPU SATISH REDDY Magic Clips_master.m3u8",
            why_they_match: [
                "Demonstrated revenue ownership and persistence",
                "Relevant edtech enrollment and parent-facing experience"
            ],
            development_required: [
                "Structured discovery and clearer communication",
                "Consistency and role stability"
            ],
            overall_assessment: "Job Fit: HIGH — strong sales outcomes; benefits from structured communication"
        },

        "68c7b00f02f4518b905d7475": {
            name: "Madhan Sanjay P",
            role: "Healthcare Education Advisor",
            experience: "6 years sales; Upgrad (BDE), Simplilearn (Sr. Inside Sales), SysGlobal IT (Product Associate/Analyst Intern), DT Foods (BDM)",
            strengths: [
                "Generated $200K+ revenue; achieved 130% targets (Simplilearn)",
                "Managed 10+ course portfolio; ~25 lakhs revenue (Upgrad)",
                "B2B and B2C exposure; consistent target attainment"
            ],
            potential_red_flags: [
                "Brief employment gaps (2019–2021)",
                "Communication clarity varies (per eval)"
            ],
            short_summary: "6 years of sales with quantifiable achievements across edtech and IT. Consistently meets/exceeds targets; versatile across B2B/B2C contexts.",
            // main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Madhan sanjay P_asterr_20250924T063334_master.m3u8",
            main_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Madhan Sanjay P Edited Video_master.m3u8",
            // main_video_url: "https://drive.google.com/file/d/1Vp4E8YeIVJFxlclEapOvXsfG6xxHM2mp/view?usp=sharing",
            magic_video_url: "https://scootervideoconsumption.blob.core.windows.net/scooter-processed-videos/Sanjay Madhan Magic Clips_master.m3u8",
            why_they_match: [
                "Quantified revenue delivery and target overachievement",
                "Relevant edtech inside sales and counseling experience"
            ],
            development_required: [
                "Sharper verbal structure and concise delivery",
                "Systematic strategy under repeated objections"
            ],
            overall_assessment: "Job Fit: HIGH — strong quota performance; polish communication structure"
        }
    };

    // Helper function to get candidate highlights
    const getCandidateHighlights = (profileId: string) => {
        return candidateHighlights[profileId as keyof typeof candidateHighlights];
    };

    // Mark new vs reviewed and custom order for new candidates
    const NEW_IDS_ORDERED = [
        "68c7b00f02f4518b905d7475", // Madhan Sanjay P
        "68bd6cf69031ec916f9d3197", // SINAGAVARAPU SATISH REDDY
        "68bd69349031ec916f9d3196", // GAURISHANKAR MALI
        "68c12e1d55934dd430b52cec", // SAI SOWMYA
    ];

    const isNewCandidate = (profileId?: string) => profileId ? NEW_IDS_ORDERED.includes(profileId) : false;

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


    // Create video data array for vertical video player
    const getVideoDataArray = () => {
        const candidateData = getCandidateHighlights(selectedCandidate.application_id);
        const magicVideoUrl = candidateData?.magic_video_url;

        if (magicVideoUrl) {
            return [{
                id: selectedCandidate.application_id,
                url: magicVideoUrl,
                title: `See ${candidateData?.name} Sell`,
                candidateName: candidateData?.name || selectedCandidate.basic_information?.full_name || 'Unknown'
            }];
        }
        return [];
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

    const getExperienceYears = (candidate: ManagerCandidate): string => {
        const totalExp = candidate?.career_overview?.total_years_experience || 0;
        const years = Math.floor(totalExp);
        const months = Math.round((totalExp - years) * 12);
        return `${years} years ${months} months`;
    };

    // Average tenure helper in years and months
    const getAverageTenure = (candidate: ManagerCandidate): string => {
        const avg = candidate?.career_overview?.average_tenure_per_role || 0;
        const years = Math.floor(avg);
        const months = Math.round((avg - years) * 12);
        return `${years} years ${months} months`;
    };

    // Extract numeric CTC value from number | { value: number }
    const getCtcValue = (ctc: number | { value: number } | undefined | null): number | null => {
        if (ctc == null) return null;
        if (typeof ctc === 'number') return ctc;
        if (typeof (ctc as any).value === 'number') return (ctc as any).value;
        return null;
    };

    // Budget status relative to defined budget (7 LPA)
    const getBudgetStatus = (candidate: ManagerCandidate): string => {
        const BASE = 9.5; // LPA
        const expected = getCtcValue(candidate?.basic_information?.expected_ctc);
        if (expected == null) return 'N/A';
        if (expected <= BASE) return 'Under Budget';
        if (expected > BASE * 1.5) return 'Over Budget';
        return 'Negotiable Budget';
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


    return (
        <div className="fixed inset-0 z-50 bg-bg-main overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0  bg-opacity-50" onClick={onClose}></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
                {/* Logo */}
                <div className="flex justify-between bg-bg-main px-8 py-4 border-b-2 border-gray-200">
                    <ScooterHeader containerClassName="border-none px-0 py-0" logoClassName='h-6' />
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex justify-between gap-2 bg-element-3 hover:bg-element-2 hover:text-cta-primary hover:border-cta-outline hover:border-2 text-cta-primary px-6 sm:px-8 py-3 rounded-full">
                            <FaArrowLeft className="text-lg" />
                            <p className='hidden lg:block'>Close</p>
                        </Button>
                    </div>
                </div>

                {/* Main Layout Container */}
                <div className="flex h-[calc(100vh-80px)]">
                    {/* Candidate Details Container */}
                    <div className="w-full overflow-auto scrollbar-thin">
                        {selectedCandidate && (
                            <div className="h-full flex flex-col w-full">
                                {/* Header */}
                                <div className="bg-bg-main border-b-2 border-gray-200 px-4 sm:px-8 py-4 sm:py-6 pb-32 mb-16 relative">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start lg:items-center sm:mb-8">
                                        {/* Left: Identity */}
                                        <div className="text-center sm:text-left">
                                            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
                                                {selectedCandidate.basic_information?.full_name}
                                            </h2>
                                            <div className="flex items-center justify-center sm:justify-start gap-2 text-text-primary mb-2">
                                                <FaMapMarkerAlt className="text-sm sm:text-md font-semibold" />
                                                <span className="text-xs sm:text-sm text-text-primary">
                                                    {selectedCandidate.basic_information?.current_location || 'Location not specified'}
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
                                                        handleShowVerticalVideoPlayer();
                                                    }}
                                                    className="mx-auto bg-cta-primary hover:bg-green-800 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2"
                                                >
                                                    <FaPlay className="text-xl" />
                                                </Button>
                                                <p className="text-sm text-text-primary font-medium">
                                                    See Them Sell
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Contact */}
                                        <div className="flex flex-col">
                                            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">Contact</h3>
                                            <div className="space-y-1 sm:space-y-2 w-full lg:w-auto">
                                                {selectedCandidate.basic_information?.linkedin_url && (
                                                    <div className="flex items-center justify-start gap-2 text-xs sm:text-sm text-text-primary">
                                                        <FaLinkedin className="text-blue-600" />
                                                        <span className="truncate max-w-[150px] sm:max-w-none">{selectedCandidate.basic_information.linkedin_url}</span>
                                                    </div>
                                                )}
                                                {selectedCandidate.basic_information?.phone_number && (
                                                    <div className="flex items-center justify-start  gap-2 text-xs sm:text-sm text-text-primary">
                                                        <FaPhone className="text-green-600" />
                                                        <span>{selectedCandidate.basic_information.phone_number}</span>
                                                    </div>
                                                )}
                                                {selectedCandidate.basic_information?.email && (
                                                    <div className="flex items-center justify-start  gap-2 text-xs sm:text-sm text-text-primary">
                                                        <FaEnvelope className="text-yellow-600" />
                                                        <span className="truncate max-w-[150px] sm:max-w-none">{selectedCandidate.basic_information.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Quick Notes button */}
                                    {/* <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[65%] flex flex-col items-center">
                                    <Button variant="primary" onClick={() => setShowNotesDialog(true)} className="rounded-full w-12 h-12 p-2 sm:p-0 flex flex-col items-center justify-center gap-16">
                                        <Edit3 className='w-5 h-5 text-text-secondary' color='white' fill='white' />
                                    </Button>
                                    <p className="mt-2 text-xs sm:text-sm text-text-primary">Quick Notes</p>
                                </div> */}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1  p-4 sm:p-6 pt-16 sm:pt-auto sm:mt-auto">
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
                                                                const assessment = String(selectedCandidate.audio_interview_details?.audio_interview_summary?.coaching_focus || '');

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
                                                                                    <p className="text-sm text-text-primary whitespace-pre-wrap">{parsedData["experience_level:"] || parsedData["experience_level"]}</p>
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
                                                                                    <p className="text-sm text-text-primary whitespace-pre-wrap">{parsedData["sales_skills:"] || parsedData["sales_skills"]}</p>
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
                                                                                    <p className="text-sm text-text-primary whitespace-pre-wrap">{parsedData["industry_alignment:"] || parsedData["industry_alignment"]}</p>
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
                                                        const candidateData = selectedCandidate?.application_id ? getCandidateHighlights(selectedCandidate.application_id) : null;
                                                        const videoUrl = candidateData?.main_video_url || selectedCandidate.interview_status?.processed_video_url || selectedCandidate.interview_status?.video_interview_url;
                                                        const interviewEvents = selectedCandidate?.video_proctoring_details?.interview_events || [];

                                                        return videoUrl ? (
                                                            <VideoPlayerWithTimeline
                                                                videoUrl={videoUrl}
                                                                fallbackUrl={selectedCandidate.interview_status?.processed_video_url ? selectedCandidate.interview_status?.video_interview_url : null}
                                                                interviewEvents={interviewEvents}
                                                                questionEvaluations={selectedCandidate?.interview_details?.qa_evaluations?.question_evaluations?.map((q: any) => ({
                                                                    question_number: q?.question_number,
                                                                    question: q?.question,
                                                                })) || []}
                                                                className="w-full h-64 sm:h-80 rounded-none"
                                                                controls={true}
                                                                poster='/assets/images/scooterLogo.png'
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
                                                        {selectedCandidate?.application_id && getCandidateHighlights(selectedCandidate.application_id) ? (
                                                            <div className="space-y-6">
                                                                {/* Why They Match Section */}
                                                                <div>
                                                                    <h5 className="font-semibold mb-3 text-green-600">Why They Match</h5>
                                                                    <ul className="space-y-2">
                                                                        {getCandidateHighlights(selectedCandidate.application_id)?.why_they_match?.map((match: string, index: number) => (
                                                                            <li key={index} className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaCheck className="text-green-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>{match}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                {/* Development Required Section */}
                                                                <div>
                                                                    <h5 className="font-semibold mb-3 text-orange-600">Development Required</h5>
                                                                    <ul className="space-y-2">
                                                                        {getCandidateHighlights(selectedCandidate.application_id)?.development_required?.map((development: string, index: number) => (
                                                                            <li key={index} className="text-sm text-text-primary flex items-start gap-2">
                                                                                <FaExclamationCircle className="text-orange-500 mt-1 w-3 h-3 flex-shrink-0" />
                                                                                <span>{development}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className='text-sm'>
                                                                <ReactMarkdown>{selectedCandidate?.professional_summary}</ReactMarkdown>
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
                                                <div className="px-4 pt-3">
                                                    <h4 className="font-bold text-text-primary mb-1">Experience</h4>
                                                </div>
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                    <span className="font-semibold text-text-primary">{getExperienceYears(selectedCandidate)}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="bg-bg-main p-3 rounded-none">
                                                            <h5 className="font-medium text-text-primary mb-2">Career Overview</h5>
                                                            <div className="space-y-2 text-sm text-text-primary">
                                                                <div>Total Experience: {getExperienceYears(selectedCandidate)}</div>
                                                                <div>Sales Experience: {selectedCandidate.career_overview?.years_sales_experience || 0} years</div>
                                                                <div>Average Tenure: {getAverageTenure(selectedCandidate)} per role</div>
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
                                                                            <div className="text-text-primary">{company.company_name}</div>
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
                                                <div className="px-4 pt-3">
                                                    <h4 className="font-bold text-text-primary mb-1">Budget Analysis</h4>
                                                </div>
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                    <span className="font-semibold text-text-primary">{getBudgetStatus(selectedCandidate)}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="bg-bg-main p-3 rounded-none">
                                                            <h5 className="font-medium text-text-primary mb-2">Compensation Details</h5>
                                                            <div className="space-y-2 text-sm text-text-primary">
                                                                <div className="flex justify-between">
                                                                    <span>Current CTC:</span>
                                                                    <span className="font-medium">{formatCTC(selectedCandidate.basic_information?.current_ctc)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Expected CTC:</span>
                                                                    <span className="font-medium">{formatCTC(selectedCandidate.basic_information?.expected_ctc)}</span>
                                                                </div>
                                                                {selectedCandidate.basic_information?.current_ctc && selectedCandidate.basic_information?.expected_ctc && (
                                                                    <div className="flex justify-between pt-2 border-t">
                                                                        <span>Increase:</span>
                                                                        <span className="font-medium text-green-600">
                                                                            {(() => {
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
                                                <div className="px-4 pt-3">
                                                    <h4 className="font-bold text-text-primary mb-1">Availability</h4>
                                                </div>
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                    <span className="font-semibold text-text-primary">{selectedCandidate.basic_information?.notice_period || 'Not specified'}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="bg-bg-main p-3 rounded-none">
                                                            <h5 className="font-medium text-text-primary mb-2">Availability</h5>
                                                            <div className="space-y-2 text-sm text-text-primary">
                                                                <div className="flex justify-between">
                                                                    <span>Notice Period:</span>
                                                                    <span className="font-medium">
                                                                        {selectedCandidate.basic_information?.notice_period || 'Not specified'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Open to Relocation:</span>
                                                                    <span className={`font-medium ${selectedCandidate.basic_information?.open_to_relocation ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {selectedCandidate.basic_information?.open_to_relocation ? 'Yes' : 'No'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Current Location:</span>
                                                                    <span className="font-medium">{selectedCandidate.basic_information?.current_location || 'Not specified'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* Average Tenure (replaces Additional Info) */}
                                            <AccordionItem value="average-tenure" className="bg-bg-main border-purple-200 rounded-none">
                                                <div className="px-4 pt-3">
                                                    <h4 className="font-bold text-text-primary mb-1">Average Tenure</h4>
                                                </div>
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-element-3 hover:bg-element-2 data-[state=open]:bg-element-2 rounded-none transition-colors">
                                                    <span className="font-semibold text-text-primary">{getAverageTenure(selectedCandidate)}</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 pb-4">
                                                    <div className="space-y-3">
                                                        <div className="bg-bg-main p-3 rounded-none">
                                                            <h5 className="font-medium text-text-primary mb-2">Details</h5>
                                                            <div className="space-y-2 text-sm text-text-primary">
                                                                {/* <div>Average tenure per role: {getAverageTenure(selectedCandidate)}</div> */}
                                                                {selectedCandidate.career_overview?.employment_gaps?.has_gaps && (
                                                                    <div className="text-orange-600">Employment Gaps: {selectedCandidate.career_overview.employment_gaps.duration}</div>
                                                                )}
                                                                <div className="space-y-2 text-sm text-text-primary">
                                                                    <div>Total Experience: {getExperienceYears(selectedCandidate)}</div>
                                                                    <div>Sales Experience: {selectedCandidate.career_overview?.years_sales_experience || 0} years</div>
                                                                    <div>Average Tenure: {getAverageTenure(selectedCandidate)} per role</div>
                                                                    {selectedCandidate.career_overview?.employment_gaps?.has_gaps && (
                                                                        <div className="text-orange-600">Employment Gaps: {selectedCandidate.career_overview.employment_gaps.duration}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>


                                        {/* Download & Share Buttons */}
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
                                            <Button
                                                variant="primary"
                                                className='w-48'
                                                onClick={handleShareReport}
                                                disabled={!selectedCandidate}
                                            >
                                                Share Report
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    <VideoPlayerWithTimeline
                                        videoUrl={selectedVideoUrl}
                                        interviewEvents={selectedCandidate?.video_proctoring_details?.interview_events || []}
                                        questionEvaluations={selectedCandidate?.interview_details?.qa_evaluations?.question_evaluations?.map((q: any) => ({
                                            question_number: q?.question_number,
                                            question: q?.question,
                                        })) || []}
                                        className="w-full h-64 sm:h-80 lg:h-96 rounded-lg"
                                        controls={true}
                                        poster='/assets/images/scooterLogo.png'
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


                {/* Quick Notes Dialog */}
                <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                    <DialogContent className="sm:max-w-2xl bg-bg-secondary-4">
                        <DialogHeader className="text-center">
                            <DialogTitle className='text-center'>Quick Notes</DialogTitle>
                            <DialogDescription className='text-center'>Add brief notes for this candidate</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-8 px-2">
                            {notes.map((note) => (
                                <div key={note.id} className="space-y-2">
                                    <div className="text-sm text-text-primary">Author : {note.author || (selectedCandidate?.basic_information?.full_name ? selectedCandidate.basic_information.full_name : 'You')}</div>
                                    <div className="bg-white/80 border rounded-md p-3">
                                        <div className="text-sm text-text-primary italic mb-2">
                                            <span className="font-semibold">Category</span> :
                                        </div>
                                        <Textarea
                                            placeholder="Category : Write your quick note here..."
                                            value={note.text}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setNotes(prev => prev.map(n => n.id === note.id ? { ...n, text: val } : n));
                                            }}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            ))}
                            {notes.length === 0 && (
                                <div className="text-center text-sm text-text-primary">No notes yet</div>
                            )}
                            <div className="flex flex-col items-center gap-2">
                                <Button variant="primary" className="rounded-full w-12 h-12 border-2 border-white px-2 sm:px-2" onClick={addEmptyNote}>
                                    <FaPlus className='w-4 h-4 text-text-secondary' />
                                </Button>
                                <div className="text-sm text-text-primary">Add More</div>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-around items-center">
                            <Button variant="secondary" onClick={() => setShowNotesDialog(false)}>Close</Button>
                            <Button variant="primary" onClick={() => setShowNotesDialog(false)}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}