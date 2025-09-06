"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getJobCandidates, Candidate, CandidatesResponse } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import VideoPlayer from '@/components/interview/VideoPlayer';
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
    FaPause
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface PageProps {
    params: Promise<{ jobId: string }>;
}

export default function CandidatePortfolioPage({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const jobId = resolvedParams.jobId;

    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [jobDetails, setJobDetails] = useState<CandidatesResponse['job_details'] | null>(null);
    const [showCandidateList, setShowCandidateList] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<CandidatesResponse['pagination'] | null>(null);

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

            // Select first candidate if none selected
            if (response.candidates.length > 0 && !selectedCandidate) {
                setSelectedCandidate(response.candidates[0]);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const formatCTC = (ctc: any): string => {
        if (!ctc) return 'Not specified';
        if (typeof ctc === 'number') {
            return `${(ctc / 100000).toFixed(1)} Lac/per annum`;
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

    const parseJobFitAssessment = (assessment: string) => {
        if (!assessment) return { experienceLevel: false, industryAlignment: false, salesSkills: false };

        const experienceLevelMatch = assessment.match(/- \*\*Experience Level\*\*: ([^-\n]+)/);
        const industryAlignmentMatch = assessment.match(/- \*\*Industry Alignment\*\*: ([^-\n]+)/);
        const salesSkillsMatch = assessment.match(/- \*\*Sales Skills\*\*: ([^-\n]+)/);

        // Check for positive indicators in each section
        const experienceLevel = experienceLevelMatch ?
            /over \d+ years|extensive|strong|progressive|leadership|capabilities/i.test(experienceLevelMatch[1]) : false;

        const industryAlignment = industryAlignmentMatch ?
            /aligns well|extensive experience|relevant|matches|suitable/i.test(industryAlignmentMatch[1]) : false;

        const salesSkills = salesSkillsMatch ?
            /strong|demonstrated|robust|proven|achieving|managing/i.test(salesSkillsMatch[1]) : false;

        return { experienceLevel, industryAlignment, salesSkills };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (!selectedCandidate) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Candidates Found</h2>
                    <p className="text-gray-600">No candidates with video interviews found for this job.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white relative">
            {/* Logo */}
            <div className="bg-white px-8 py-4 border-b-2 border-gray-200 sm:mx-4">
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/images/scooterLogo.png"
                        alt="Scooter Logo"
                        // className="h-8 w-auto"
                        width={32}
                        height={32}
                    />
                    <h1 className="text-3xl font-thin text-gray-900">scooter</h1>
                </div>
            </div>

            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 px-8 py-6 mx-2">
                <div className="flex items-center justify-between">
                    {/* Left Section - Candidate Information */}
                    <div className="flex-1">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedCandidate.basic_information?.full_name}</h2>
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <FaMapMarkerAlt className="text-md font-semibold" />
                                <span className="text-sm">{selectedCandidate.basic_information?.current_location || 'Location not specified'}</span>
                            </div>
                            {selectedCandidate.basic_information?.open_to_relocation && (
                                <Badge className="bg-lime-500 text-black px-3 py-1 text-xs font-medium rounded-none mt-4">
                                    Open To Relocation
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Center Section - Show Candidates Button */}
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-center">
                            <Button
                                onClick={() => setShowCandidateList(!showCandidateList)}
                                className="mx-auto bg-green-800 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2"
                            >
                                {
                                    showCandidateList ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />
                                }
                            </Button>
                            <p className="text-sm text-green-800 font-medium">
                                {showCandidateList ? 'Hide' : 'See Them All'} ({candidates.length})
                            </p>
                        </div>
                    </div>

                    {/* Right Section - Contact Information */}
                    <div className="flex-1 flex justify-end">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Contact</h3>
                            <div className="space-y-2">
                                {selectedCandidate.basic_information?.linkedin_url && (
                                    <div className="flex items-center justify-start gap-2 text-sm text-gray-600">
                                        <FaLinkedin className="text-blue-600" />
                                        <span>{selectedCandidate.basic_information.linkedin_url}</span>
                                    </div>
                                )}
                                {selectedCandidate.basic_information?.phone_number && (
                                    <div className="flex items-center justify-start gap-2 text-sm text-gray-600">
                                        <FaPhone className="text-green-600" />
                                        <span>{selectedCandidate.basic_information.phone_number}</span>
                                    </div>
                                )}
                                {selectedCandidate.basic_information?.email && (
                                    <div className="flex items-center justify-start gap-2 text-sm text-gray-600">
                                        <FaEnvelope className="text-yellow-600" />
                                        <span>{selectedCandidate.basic_information.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="max-w-8xl mx-auto">
                        {/* Top Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* On Paper Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 text-center">On Paper</h3>

                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                    {/* <p className="text-gray-600 mb-6">
                                        {selectedCandidate?.short_summary || ''}
                                    </p> */}

                                    {/* Match Table (Horizontal Tabular) */}
                                    {(() => {
                                        const jobFitData = parseJobFitAssessment(selectedCandidate.job_fit_assessment || '');
                                        return (
                                            <table className="min-w-full border-2 rounded-lg bg-white text-center">
                                                <thead>
                                                    <tr>
                                                        <th className="px-6 py-2 text-sm font-semibold text-gray-800 border-r border-b">Industry Match</th>
                                                        <th className="px-6 py-2 text-sm font-semibold text-gray-800 border-r border-b">Experience Level Match</th>
                                                        <th className="px-6 py-2 text-sm font-semibold text-gray-800 border-b">Sales Match</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="px-6 py-4 border-r">{getMatchIcon(jobFitData.industryAlignment)}</td>
                                                        <td className="px-6 py-4 border-r">{getMatchIcon(jobFitData.experienceLevel)}</td>
                                                        <td className="px-6 py-4">{getMatchIcon(jobFitData.salesSkills)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>

                                {/* Expandable Sections */}
                                <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <AccordionItem value="icp" className="bg-white border-purple-200 rounded-lg">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                            <h4 className="font-bold text-gray-800">ICP</h4>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">
                                                    Ideal customer profile analysis and targeting strategies based on candidate's experience.
                                                </p>
                                                {/* {(() => {
                                                    const jobFitData = parseJobFitAssessment(selectedCandidate.job_fit_assessment || '');
                                                    const assessment = selectedCandidate.job_fit_assessment || '';

                                                    const industryAlignmentMatch = assessment.match(/- \*\*Industry Alignment\*\*: ([^-\n]+)/);
                                                    const experienceLevelMatch = assessment.match(/- \*\*Experience Level\*\*: ([^-\n]+)/);
                                                    const salesSkillsMatch = assessment.match(/- \*\*Sales Skills\*\*: ([^-\n]+)/);

                                                    return (
                                                        <div className="bg-white p-3 rounded-lg border">
                                                            <h5 className="font-medium text-gray-800 mb-3">Job Fit Analysis:</h5>
                                                            <div className="space-y-3 text-sm text-gray-600">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium">Industry Alignment:</span>
                                                                        {getMatchIcon(jobFitData.industryAlignment)}
                                                                    </div>
                                                                    {industryAlignmentMatch && (
                                                                        <p className="text-xs text-gray-500 ml-4">{industryAlignmentMatch[1].trim()}</p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium">Experience Level:</span>
                                                                        {getMatchIcon(jobFitData.experienceLevel)}
                                                                    </div>
                                                                    {experienceLevelMatch && (
                                                                        <p className="text-xs text-gray-500 ml-4">{experienceLevelMatch[1].trim()}</p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium">Sales Skills:</span>
                                                                        {getMatchIcon(jobFitData.salesSkills)}
                                                                    </div>
                                                                    {salesSkillsMatch && (
                                                                        <p className="text-xs text-gray-500 ml-4">{salesSkillsMatch[1].trim()}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()} */}
                                                {selectedCandidate.audio_interview_details?.audio_interview_summary?.icp_summary && (
                                                    <div className="bg-white p-3 rounded-lg border">
                                                        <h5 className="font-medium text-gray-800 mb-2">Identified ICPs:</h5>
                                                        <ul className="space-y-1 text-sm text-gray-600">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.icp_summary.map((icp, index) => (
                                                                <li key={index}>• {icp}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="sales-motion" className="bg-white border-purple-200 rounded-lg">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                            <h4 className="font-bold text-gray-800">Sales Motion</h4>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">
                                                    Sales methodology and approach used by the candidate in previous roles.
                                                </p>
                                                {selectedCandidate.audio_interview_details?.audio_interview_summary?.sales_motion_summary && (
                                                    <div className="bg-white p-3 rounded-lg border">
                                                        <h5 className="font-medium text-gray-800 mb-2">Sales Motion Types:</h5>
                                                        <ul className="space-y-1 text-sm text-gray-600">
                                                            {selectedCandidate.audio_interview_details.audio_interview_summary.sales_motion_summary.map((motion, index) => (
                                                                <li key={index}>• {motion}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="sales-cycle" className="bg-white border-purple-200 rounded-lg">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                            <h4 className="font-bold text-gray-800">Sales Cycle</h4>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600">
                                                    Typical sales cycle length and process management capabilities.
                                                </p>
                                                {selectedCandidate.audio_interview_details?.audio_interview_summary?.sales_cycle_summary && (
                                                    <div className="bg-white p-3 rounded-lg border">
                                                        <h5 className="font-medium text-gray-800 mb-2">Sales Cycle Types:</h5>
                                                        <ul className="space-y-1 text-sm text-gray-600">
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
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 text-center">In Person</h3>

                                {/* Video Player */}
                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                    {selectedCandidate.interview_status?.video_interview_url ? (
                                        <VideoPlayer
                                            videoUrl={selectedCandidate.interview_status.video_interview_url}
                                            className="w-full h-64 rounded-lg"
                                            controls={true}
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <FaPlay className="text-4xl text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">No video available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Highlights */}
                                <Card className=" py-4 rounded-none shadow-none">
                                    <CardContent className="p-4">
                                        <div className="w-fit flex items-center justify-center bg-purple-100 p-2 mx-auto mb-3">
                                            <h4 className="font-bold text-gray-800 text-center">Highlights</h4>
                                        </div>
                                        {/* <ul className="space-y-2 text-sm text-gray-600">
                                            <li>• Strong communication skills demonstrated in video interview</li>
                                            <li>• Relevant industry experience and knowledge</li>
                                            <li>• Proven track record of meeting sales targets</li>
                                        </ul> */}
                                        <ReactMarkdown>{selectedCandidate?.job_fit_assessment}</ReactMarkdown>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <Accordion autoFocus={true} type="multiple" defaultValue={["experience", "budget", "notice-period", "additional-info"]} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Experience Summary */}
                            <AccordionItem value="experience" className="bg-white border-purple-200 rounded-lg">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                    <h4 className="font-bold text-gray-800">{getExperienceYears(selectedCandidate)}</h4>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <h5 className="font-medium text-gray-800 mb-2">Career Overview</h5>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div>Total Experience: {selectedCandidate.career_overview?.total_years_experience || 0} years</div>
                                                <div>Sales Experience: {selectedCandidate.career_overview?.years_sales_experience || 0} years</div>
                                                <div>Average Tenure: {selectedCandidate.career_overview?.average_tenure_per_role || 0} years per role</div>
                                                {selectedCandidate.career_overview?.employment_gaps?.has_gaps && (
                                                    <div className="text-orange-600">Employment Gaps: {selectedCandidate.career_overview.employment_gaps.duration}</div>
                                                )}
                                            </div>
                                        </div>
                                        {selectedCandidate.career_overview?.company_history && (
                                            <div className="bg-white p-3 rounded-lg border">
                                                <h5 className="font-medium text-gray-800 mb-2">Company History</h5>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    {selectedCandidate.career_overview.company_history.map((company, index) => (
                                                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                                                            <div className="font-medium">{company.position}</div>
                                                            <div className="text-gray-500">{company.company_name}</div>
                                                            <div className="text-gray-500">
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
                            <AccordionItem value="budget" className="bg-white border-purple-200 rounded-lg">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                    <h4 className="font-bold text-gray-800">Budget Analysis</h4>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <h5 className="font-medium text-gray-800 mb-2">Compensation Details</h5>
                                            <div className="space-y-2 text-sm text-gray-600">
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
                            <AccordionItem value="notice-period" className="bg-white border-purple-200 rounded-lg">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                    <h4 className="font-bold text-gray-800">Notice Period</h4>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <h5 className="font-medium text-gray-800 mb-2">Availability</h5>
                                            <div className="space-y-2 text-sm text-gray-600">
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

                            {/* Additional Info */}
                            <AccordionItem value="additional-info" className="bg-white border-purple-200 rounded-lg">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-purple-100 rounded-none">
                                    <h4 className="font-bold text-gray-800">Additional Info</h4>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded-lg border">
                                            <h5 className="font-medium text-gray-800 mb-2">Contact Information</h5>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-gray-400" />
                                                    <span>{selectedCandidate.basic_information?.phone_number || 'Not provided'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaEnvelope className="text-gray-400" />
                                                    <span>{selectedCandidate.basic_information?.email || 'Not provided'}</span>
                                                </div>
                                                {selectedCandidate.basic_information?.linkedin_url && (
                                                    <div className="flex items-center gap-2">
                                                        <FaLinkedin className="text-gray-400" />
                                                        <a href={selectedCandidate.basic_information.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                            LinkedIn Profile
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border">
                                            <h5 className="font-medium text-gray-800 mb-2">Application Status</h5>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>Status:</span>
                                                    <span className="font-medium">{selectedCandidate.application_status || 'Unknown'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Source:</span>
                                                    <span className="font-medium">{(selectedCandidate as any).candidate_source || 'Unknown'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Shortlisted:</span>
                                                    <span className={`font-medium ${selectedCandidate.final_shortlist ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedCandidate.final_shortlist ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4">
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                                Shortlist
                            </Button>
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Candidate List Sidebar */}
            {showCandidateList && (
                <div className="fixed right-0 top-0 z-[101] w-1/3 h-full overflow-y-auto scrollbar-thin bg-white border-l border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Candidates</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCandidateList(false)}
                        >
                            ×
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {candidates.map((candidate) => (
                            <Card
                                key={candidate.profile_id || candidate.user_id}
                                className={`cursor-pointer transition-all ${selectedCandidate?.profile_id === candidate.profile_id ||
                                    selectedCandidate?.user_id === candidate.user_id
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedCandidate(candidate)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex self-center items-center justify-center gap-3 py-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <FaUser className="text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800">
                                                {candidate.basic_information?.full_name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {candidate.basic_information?.current_location}
                                            </p>
                                        </div>
                                        <InterviewScoreCompact candidate={candidate} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-3 text-sm text-gray-600">
                                Page {currentPage} of {pagination.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === pagination.total_pages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
