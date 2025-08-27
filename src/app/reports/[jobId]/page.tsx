'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getJobCandidates, Candidate } from '@/lib/adminService';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import ErrorBox from '@/components/ui/error';
import {
    Users,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Search as SearchIcon,
    ExternalLink,
    Video as VideoIcon,
    Mic as MicIcon,
    AlertTriangle,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ReportsPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.jobId as string;

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [jobDetails, setJobDetails] = useState<any>(null);
    const [showMore, setShowMore] = useState<string | null>(null);

    // UI states
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'top' | 'solid' | 'dev' | 'more' | 'training'>('all');

    useEffect(() => {
        if (!jobId) return;
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId, currentPage]);

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getJobCandidates(
                jobId,
                currentPage,
                18,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                true
            );
            setCandidates(response.candidates || []);
            setPagination(response.pagination);
            setJobDetails(response.job_details);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    const categorized = useMemo(() => {
        const byTop = (c: Candidate) => Boolean(c.final_shortlist || c.shortlisted || c.application_status === true || c.application_status === 'send to hiring manager');
        const bySolid = (c: Candidate) => !byTop(c) && Boolean(c.interview_status?.audio_interview_passed || c.interview_status?.video_interview_attended);
        const byDev = (c: Candidate) => !byTop(c) && !bySolid(c) && Boolean(c.interview_status?.audio_interview_attended || c.interview_status?.video_interview_sent);
        const byMore = (c: Candidate) => !byTop(c) && !bySolid(c) && !byDev(c);
        const byTraining = (c: Candidate) => {
            const summary = c.audio_interview_details?.audio_interview_summary;
            const redFlags = summary?.red_flags || c.audio_interview_details?.qa_evaluations?.flatMap(q => q.evaluation?.red_flags || []) || [];
            return redFlags.length > 0;
        };

        const lower = search.trim().toLowerCase();
        const searched = lower
            ? candidates.filter(c =>
                (c.basic_information?.full_name || '').toLowerCase().includes(lower) ||
                (c.career_overview?.company_history?.[0]?.position || '').toLowerCase().includes(lower) ||
                (c.basic_information?.current_location || '').toLowerCase().includes(lower)
            )
            : candidates;

        return {
            all: searched,
            top: searched.filter(byTop),
            solid: searched.filter(bySolid),
            dev: searched.filter(byDev),
            more: searched.filter(byMore),
            training: searched.filter(byTraining),
        };
    }, [candidates, search]);

    const list = categorized[activeFilter];

    const AccordionSection = ({
        title,
        count,
        items,
        color,
        profileId
    }: {
        title: string;
        count: number;
        items: string[];
        color: string;
        profileId: string;
    }) => {
        if (!items || items.length === 0) return null;

        return (
            <Accordion type="single" collapsible className="mt-3">
                <AccordionItem value={`${profileId}-${title.toLowerCase()}`}>
                    <AccordionTrigger className={`text-sm font-semibold ${color} hover:no-underline`}>
                        {title} ({count})
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-1">
                            {items.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-800 flex gap-2">
                                    <span className={`${color.includes('emerald') ? 'text-emerald-500' : 'text-amber-500'}`}>•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    };

    const Strengths = ({ c }: { c: Candidate }) => {
        const strengths = c.audio_interview_details?.audio_interview_summary?.strengths || [];

        return (
            <AccordionSection
                title="Strengths"
                count={strengths.length}
                items={strengths}
                color="text-emerald-700"
                profileId={c.profile_id}
            />
        );
    };

    const WatchPoints = ({ c }: { c: Candidate }) => {
        const areas = c.audio_interview_details?.audio_interview_summary?.areas_for_improvement || [];

        return (
            <AccordionSection
                title="Watch Points"
                count={areas.length}
                items={areas}
                color="text-amber-700"
                profileId={c.profile_id}
            />
        );
    };

    const getCategoryBadge = (c: Candidate) => {
        if (c.final_shortlist || c.shortlisted || c.application_status === true || c.application_status === 'send to hiring manager') {
            return { text: 'Top candidates', variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' };
        }
        if (c.interview_status?.audio_interview_passed || c.interview_status?.video_interview_attended) {
            return { text: 'Solid performers', variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50' };
        }
        if (c.interview_status?.audio_interview_attended || c.interview_status?.video_interview_sent) {
            return { text: 'Development candidates', variant: 'outline', className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50' };
        }
        const hasRedFlags = (c.audio_interview_details?.audio_interview_summary?.red_flags?.length || 0) > 0;
        const hasQARedFlags = c.audio_interview_details?.qa_evaluations?.some(q => {
            const redFlags = q.evaluation?.red_flags;
            return redFlags && redFlags.length > 0;
        });

        if (hasRedFlags || hasQARedFlags) {
            return { text: 'Training investment required', variant: 'outline', className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50' };
        }
        return { text: 'More evaluation needed', variant: 'outline', className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50' };
    };

    if (loading && candidates.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Loading report...</p>
                </div>
            </div>
        );
    }

    if (error && candidates.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 px-4">
                    <ErrorBox message={error} />
                    <Button onClick={fetchCandidates}>Try Again</Button>
                </div>
            </div>
        );
    }

    const count = {
        all: categorized.all.length,
        top: categorized.top.length,
        solid: categorized.solid.length,
        dev: categorized.dev.length,
        more: categorized.more.length,
        training: categorized.training.length,
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {jobDetails?.title || 'Candidate Shortlist'}
                        </h1>
                        {jobDetails?.description && (
                            <p className="text-base text-gray-600 max-w-4xl mb-4">{jobDetails.description.trim().slice(0, 1).toUpperCase() + jobDetails.description.trim().slice(1)}</p>
                        )}

                        {/* Role Context Section */}
                        <div className="bg-blue-100 rounded-lg border border-gray-200 p-4 max-w-4xl">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h3 className="font-semibold text-blue-600 mb-2">Role Context</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Looking for experienced sales professionals to drive SME acquisition in the AMER market.
                                        Candidates should have full-cycle sales experience, preferably in B2B SaaS or fintech environments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters row */}
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search candidates by name, skills, or experience..."
                                    className="w-80 pl-9"
                                />
                                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Users className="h-4 w-4" /> {pagination?.total_candidates || candidates.length} candidates
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('all')}
                            className={
                                (activeFilter === 'all'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            All Candidates
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'all' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.all}
                            </Badge>
                        </Button>
                        <Button
                            variant={activeFilter === 'top' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('top')}
                            className={
                                (activeFilter === 'top'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 p-5 text-[0.8em] font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            Top candidates
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'top' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.top}
                            </Badge>
                        </Button>
                        <Button
                            variant={activeFilter === 'solid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('solid')}
                            className={
                                (activeFilter === 'solid'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 p-5 text-[0.8em] font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            Solid performers
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'solid' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.solid}
                            </Badge>
                        </Button>
                        <Button
                            variant={activeFilter === 'dev' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('dev')}
                            className={
                                (activeFilter === 'dev'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 p-5 text-[0.8em] font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            Development candidates
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'dev' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.dev}
                            </Badge>
                        </Button>
                        <Button
                            variant={activeFilter === 'more' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('more')}
                            className={
                                (activeFilter === 'more'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 p-5 text-[0.8em] font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            More evaluation needed
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'more' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.more}
                            </Badge>
                        </Button>
                        <Button
                            variant={activeFilter === 'training' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveFilter('training')}
                            className={
                                (activeFilter === 'training'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 p-5 text-[0.8em] font-semibold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ) + ' p-5 text-[0.8em] font-semibold'
                            }
                        >
                            Training investment required
                            <Badge variant="secondary" className={`ml-2 ${activeFilter === 'training' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {count.training}
                            </Badge>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((c) => {
                        const strengths = c.audio_interview_details?.audio_interview_summary?.strengths || [];
                        const areas = c.audio_interview_details?.audio_interview_summary?.areas_for_improvement || [];
                        const redFlagsCount = (c.audio_interview_details?.audio_interview_summary?.red_flags?.length || 0) +
                            (c.audio_interview_details?.qa_evaluations?.reduce((acc, q) => acc + (q.evaluation?.red_flags?.length || 0), 0) || 0);
                        const categoryBadge = getCategoryBadge(c);

                        const audioStatus = c.interview_status?.audio_interview_passed
                            ? { text: 'Audio passed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                            : c.interview_status?.audio_interview_attended
                                ? { text: 'Audio attended', className: 'bg-blue-50 text-blue-700 border-blue-200' }
                                : null;
                        const videoStatus = c.interview_status?.video_interview_attended
                            ? { text: 'Video attended', className: 'bg-blue-50 text-blue-700 border-blue-200' }
                            : c.interview_status?.video_interview_sent
                                ? { text: 'Video sent', className: 'bg-gray-50 text-gray-700 border-gray-200' }
                                : null;

                        return (
                            <Card key={c.profile_id} className="shadow-sm border border-gray-200 py-2">
                                <CardContent className="p-5 text-[0.8em] font-semibold">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{c.basic_information?.full_name || 'Unknown Candidate'}</h3>
                                        <Badge
                                            variant={categoryBadge.variant as any}
                                            className={categoryBadge.className}
                                        >
                                            {categoryBadge.text}
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-sm text-gray-600">Expected CTC: </span>
                                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                            {c.basic_information?.expected_ctc
                                                ? (typeof c.basic_information.expected_ctc === 'object'
                                                    ? `${c.basic_information.expected_ctc.value / 100000} LPA`
                                                    : `${c.basic_information.expected_ctc}`)
                                                : 'Not specified'
                                            }
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Professional Persona</p>
                                        <div className='max-h-64 overflow-y-auto scrollbar-thin '>
                                            {
                                                showMore && showMore === c.profile_id ? (
                                                    <div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">{c.short_summary}</p>
                                                        <span className="text-sm text-gray-700 leading-relaxed font-bold cursor-pointer" onClick={() => setShowMore(null)}>see less</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">{c.short_summary.slice(0, 100) + '...'}</p>
                                                        <span className="text-sm text-gray-700 leading-relaxed font-bold cursor-pointer" onClick={() => setShowMore(c.profile_id)}>see more</span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Quick metrics */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="outline" className="inline-flex items-center gap-1 border-emerald-200 text-emerald-700 bg-emerald-50">
                                            <Sparkles className="h-3.5 w-3.5" /> {strengths.length} strengths
                                        </Badge>
                                        <Badge variant="outline" className="inline-flex items-center gap-1 border-amber-200 text-amber-700 bg-amber-50">
                                            <AlertTriangle className="h-3.5 w-3.5" /> {areas.length} watch points
                                        </Badge>
                                        {redFlagsCount > 0 && (
                                            <Badge variant="outline" className="inline-flex items-center gap-1 border-red-200 text-red-700 bg-red-50">
                                                <AlertTriangle className="h-3.5 w-3.5" /> {redFlagsCount} red flags
                                            </Badge>
                                        )}
                                        {audioStatus && (
                                            <Badge variant="outline" className={`inline-flex items-center gap-1 ${audioStatus.className}`}>
                                                <MicIcon className="h-3.5 w-3.5" /> {audioStatus.text}
                                            </Badge>
                                        )}
                                        {videoStatus && (
                                            <Badge variant="outline" className={`inline-flex items-center gap-1 ${videoStatus.className}`}>
                                                <VideoIcon className="h-3.5 w-3.5" /> {videoStatus.text}
                                            </Badge>
                                        )}
                                    </div>

                                    <Strengths c={c} />
                                    <WatchPoints c={c} />

                                    {/* Video Interview Section */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
                                            <VideoIcon className="h-4 w-4 text-gray-600" />
                                            Video Interview
                                        </p>
                                        <div className="mt-2">
                                            {c.interview_status?.video_interview_url ? (
                                                <div className="relative rounded-md overflow-hidden border border-gray-200">
                                                    <video
                                                        className="w-full h-40 object-cover"
                                                        controls
                                                        preload="metadata"
                                                    >
                                                        <source
                                                            src={c.interview_status.video_interview_url}
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not support the video element.
                                                    </video>
                                                    <div className="absolute top-2 right-2">
                                                        <a
                                                            href={c.interview_status.video_interview_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded bg-white/90 hover:bg-white shadow transition-colors"
                                                            title="Open video in new tab"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-gray-700" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-md overflow-hidden border border-gray-200">
                                                    <div className="bg-gray-100 text-gray-500 text-xs p-4 leading-relaxed min-h-[160px] flex items-center justify-center text-center">
                                                        <div className="text-center">
                                                            <VideoIcon className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                                                            <div className="font-medium">No Video Interview</div>
                                                            <div className="text-xs mt-1">Video interview not available</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audio Interview Section */}
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
                                            <MicIcon className="h-4 w-4 text-gray-600" />
                                            Audio Interview
                                        </p>
                                        <div className="mt-2">
                                            {c.interview_status?.audio_interview_url ? (
                                                <div className="relative rounded-md overflow-hidden border border-gray-200">
                                                    <audio
                                                        className="w-full"
                                                        controls
                                                        preload="metadata"
                                                    >
                                                        <source
                                                            src={c.interview_status.audio_interview_url}
                                                            type="audio/mpeg"
                                                        />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                    <div className="absolute top-2 right-2">
                                                        <a
                                                            href={c.interview_status.audio_interview_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-7 h-7 rounded bg-white/90 hover:bg-white shadow transition-colors"
                                                            title="Open audio in new tab"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-gray-700" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-md overflow-hidden border border-gray-200">
                                                    <div className="bg-gray-100 text-gray-500 text-xs p-4 leading-relaxed min-h-[80px] flex items-center justify-center text-center">
                                                        <div className="text-center">
                                                            <MicIcon className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                                                            <div className="font-medium">No Audio Interview</div>
                                                            <div className="text-xs mt-1">Audio interview not available</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                    <div className="mt-8 flex items-center justify-between pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={!pagination.has_previous} className="flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">Page {pagination.current_page} of {pagination.total_pages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={!pagination.has_next} className="flex items-center gap-1">
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            {/* Bottom Half Blurry Overlay */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[50vh] backdrop-blur-md bg-white/40 z-50" />
        </div>
    );
}


