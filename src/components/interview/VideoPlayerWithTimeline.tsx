import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

interface InterviewEvent {
    event: string;
    timestamp: string;
    details?: {
        questionIndex?: number;
        question?: string;
        responseLength?: number;
        timestamp?: string;
    };
}

interface VideoPlayerWithTimelineProps {
    videoUrl: string;
    fallbackUrl?: string | null;
    interviewEvents?: InterviewEvent[];
    questionEvaluations?: Array<{ question_number?: number; question?: string }>;
    poster?: string;
    autoPlay?: boolean;
    controls?: boolean;
    preload?: "auto" | "metadata" | "none";
    className?: string;
}

const VideoPlayerWithTimeline: React.FC<VideoPlayerWithTimelineProps> = ({
    videoUrl,
    fallbackUrl,
    interviewEvents = [],
    questionEvaluations = [],
    poster = "",
    autoPlay = false,
    controls = true,
    preload = "metadata",
    className = "w-full h-full rounded-lg shadow-lg",
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastTriedUrlRef = useRef<string | null>(null);
    const isDriveUrl = (u: string) => {
        try { return new URL(u).hostname.includes('drive.google.com'); } catch { return false; }
    };

    const normalizeVideoUrl = useMemo(() => {
        try {
            const url = new URL(videoUrl);
            if (url.hostname.includes('drive.google.com')) {
                const m = url.pathname.match(/\/file\/d\/([^/]+)\//);
                if (m && m[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
                const idParam = url.searchParams.get('id');
                if (idParam) return `https://drive.google.com/file/d/${idParam}/preview`;
                if (url.pathname.includes('/file/d/') && url.pathname.endsWith('/preview')) return url.toString();
            }
        } catch { /* ignore */ }
        return videoUrl;
    }, [videoUrl]);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showTimeline, setShowTimeline] = useState(false);
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

    const isDrive = isDriveUrl(normalizeVideoUrl);

    // Derive a duration for Drive previews (no media API): estimate from events
    const computedDuration = React.useMemo(() => {
        if (!interviewEvents.length) return duration;
        if (!isDrive) return duration;
        const start = new Date(interviewEvents[0]?.timestamp || 0).getTime();
        const end = new Date(interviewEvents[interviewEvents.length - 1]?.timestamp || 0).getTime();
        if (!start || !end || end <= start) return duration || 0;
        const seconds = (end - start) / 1000;
        return Math.max(seconds, duration || 0);
    }, [isDrive, interviewEvents, duration]);

    // Detect retake starts using explicit events
    const retakeStartMs = React.useMemo(() => {
        const set = new Set<number>();
        if (!interviewEvents.length) return set;
        for (const ev of interviewEvents) {
            if (ev.event === 'answer_retake_started') {
                set.add(new Date(ev.timestamp).getTime());
            }
        }
        return set;
    }, [interviewEvents]);

    // Calculate timeline markers from interview events
    const timelineMarkers = React.useMemo(() => {
        if (!interviewEvents.length || !computedDuration) return [];

        const startTime = new Date(interviewEvents[0]?.timestamp).getTime();

        return interviewEvents
            .filter(event =>
                event.event === 'question_narration_started' ||
                event.event === 'user_response_started' ||
                event.event === 'user_response_ended' ||
                event.event === 'answer_retake_started'
            )
            .map((event, index) => {
                const eventTime = new Date(event.timestamp).getTime();
                const relativeTime = (eventTime - startTime) / 1000; // Convert to seconds
                const percentage = (relativeTime / computedDuration) * 100;
                const isRetake = event.event === 'answer_retake_started' || retakeStartMs.has(eventTime);

                return {
                    id: index,
                    time: relativeTime,
                    percentage: Math.max(0, Math.min(100, percentage)),
                    event: isRetake ? 'user_response_retake_started' : event.event,
                    questionIndex: event.details?.questionIndex,
                    question: event.details?.question,
                    responseLength: event.details?.responseLength,
                };
            })
            .filter(marker => marker.percentage >= 0 && marker.percentage <= 100);
    }, [interviewEvents, computedDuration, retakeStartMs]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        if (isDriveUrl(normalizeVideoUrl)) {
            // Timeline features won't control iframe; skip media wiring
            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);

        // Handle HLS (.m3u8)
        if (videoUrl.endsWith(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                return () => {
                    hls.destroy();
                    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                    video.removeEventListener('timeupdate', handleTimeUpdate);
                };
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Safari native support
                video.src = videoUrl;
            }
        } else {
            // Other formats (mp4, webm, ogg)
            video.src = videoUrl;
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [videoUrl, normalizeVideoUrl]);

    // Runtime error fallback: if processed video fails, try original video URL if provided
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleError = () => {
            if (!fallbackUrl) return;
            if (lastTriedUrlRef.current === fallbackUrl) return;
            lastTriedUrlRef.current = fallbackUrl;
            try {
                video.src = fallbackUrl;
                video.load();
                video.play().catch(() => {/* ignore autoplay block */ });
            } catch { /* ignore */ }
        };

        video.addEventListener('error', handleError);
        return () => {
            video.removeEventListener('error', handleError);
        };
    }, [fallbackUrl, videoUrl]);

    const handleTimelineClick = (time: number) => {
        if (isDrive) {
            // Seeking not supported for Drive preview; ignore clicks
            return;
        }
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMarkerColor = (event: string) => {
        switch (event) {
            case 'question_narration_started':
                return 'bg-blue-500';
            case 'user_response_started':
                return 'bg-green-500';
            case 'user_response_retake_started':
                return 'bg-orange-500';
            case 'user_response_ended':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getMarkerTooltip = (marker: any) => {
        switch (marker.event) {
            case 'question_narration_started':
                return `Question ${marker.questionIndex + 1} Started\n${marker.question?.substring(0, 50)}...`;
            case 'user_response_started':
                return `Answer Started\nTime: ${formatTime(marker.time)}`;
            case 'user_response_retake_started':
                return `Answer Retake Started\nTime: ${formatTime(marker.time)}`;
            case 'user_response_ended':
                return `Answer Ended\nLength: ${marker.responseLength} chars\nTime: ${formatTime(marker.time)}`;
            default:
                return `Event at ${formatTime(marker.time)}`;
        }
    };

    // Inline component to render question overlay
    const QuestionOverlay: React.FC<{ segment: { start: number; end: number; question?: string; questionIndex?: number; hasRetake?: boolean }; isDrive?: boolean }> = ({ segment }) => {
        const visible = !isNaN(currentTime) && currentTime >= segment.start && currentTime <= segment.end;
        if (!visible) return null;
        const base = segment.question || (typeof segment.questionIndex === 'number' ? `Question ${segment.questionIndex + 1}` : 'Question');
        const text = segment.hasRetake ? `[Retake] ${base}` : base;
        return (
            <div className="absolute inset-x-0 top-2 mx-auto max-w-3xl z-20">
                <div className="px-3 py-2 bg-black/60 text-white text-xs sm:text-sm md:text-base rounded shadow">
                    {text}
                </div>
            </div>
        );
    };

    // Build question narration segments from explicit narration start/end events
    const questionSegments = React.useMemo(() => {
        type Segment = { id: number; start: number; end: number; percentageStart: number; percentageWidth: number; questionIndex?: number; question?: string; hasRetake?: boolean };
        const result: Segment[] = [];
        if (!interviewEvents.length) return result;
        const total = computedDuration || duration || 1;
        const videoStartTs = new Date(interviewEvents[0]?.timestamp).getTime();

        // Group narration events by questionIndex
        const byQuestion = new Map<number, { startTs?: number; endTs?: number; question?: string }>();
        for (const ev of interviewEvents) {
            if (ev.event === 'question_narration_started' || ev.event === 'question_narration_ended') {
                const qi = ev.details?.questionIndex ?? undefined;
                if (typeof qi !== 'number') continue;
                const entry = byQuestion.get(qi) || {};
                if (ev.event === 'question_narration_started') {
                    entry.startTs = new Date(ev.timestamp).getTime();
                    entry.question = ev.details?.question;
                } else if (ev.event === 'question_narration_ended') {
                    entry.endTs = new Date(ev.timestamp).getTime();
                }
                byQuestion.set(qi, entry);
            }
        }

        // Determine which questions had retakes
        const retakeQuestions = new Set<number>();
        for (const ev of interviewEvents) {
            if (ev.event === 'answer_retake_started' && typeof ev.details?.questionIndex === 'number') {
                retakeQuestions.add(ev.details.questionIndex);
            }
        }

        // Build segments in order of questionIndex
        const sortedIndices = Array.from(byQuestion.keys()).sort((a, b) => a - b);
        sortedIndices.forEach((qi, idx) => {
            const entry = byQuestion.get(qi)!;
            if (typeof entry.startTs !== 'number') return;
            const startSec = Math.max(0, (entry.startTs - videoStartTs) / 1000);
            const endTs = typeof entry.endTs === 'number' ? entry.endTs : entry.startTs + 4000; // fallback 4s if missing end
            const endSec = Math.max(startSec + 0.5, (endTs - videoStartTs) / 1000);
            const pStart = Math.max(0, Math.min(100, (startSec / total) * 100));
            const pWidth = Math.max(0.5, Math.min(100 - pStart, ((endSec - startSec) / total) * 100));
            // Prefer explicit question text from event; otherwise from evaluations
            const qe = questionEvaluations.find(q => (q.question_number ?? (qi + 1)) === (qi + 1));
            result.push({
                id: idx,
                start: startSec,
                end: endSec,
                percentageStart: pStart,
                percentageWidth: pWidth,
                questionIndex: qi,
                question: entry.question || qe?.question,
                hasRetake: retakeQuestions.has(qi),
            });
        });

        return result;
    }, [interviewEvents, computedDuration, duration, questionEvaluations]);

    return (
        <div className="relative">
            {isDriveUrl(normalizeVideoUrl) ? (
                <div className={className} style={{ position: 'relative' }}>
                    {/* Question overlay for Drive during narration segments */}
                    {/* {questionSegments.map(seg => (
                        <QuestionOverlay key={`qo-${seg.id}`} segment={seg} isDrive={true} />
                    ))} */}
                    <iframe
                        title="Video"
                        src={normalizeVideoUrl}
                        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        loading="eager"
                    />
                </div>
            ) : (
                <div className="relative">
                    {/* Question overlay for native video */}
                    {/* {questionSegments.map(seg => (
                        <QuestionOverlay key={`qo-native-${seg.id}`} segment={seg} />
                    ))} */}
                    <video
                        ref={videoRef}
                        className={className}
                        controls={controls}
                        autoPlay={autoPlay}
                        preload={preload}
                        poster={poster}
                    >
                        {/* Provide fallback sources for broader compatibility */}
                        {videoUrl.endsWith(".mp4") && (
                            <source src={videoUrl} type="video/mp4" />
                        )}
                        {videoUrl.endsWith(".webm") && (
                            <source src={videoUrl} type="video/webm" />
                        )}
                        {videoUrl.endsWith(".ogg") && (
                            <source src={videoUrl} type="video/ogg" />
                        )}
                        {videoUrl.endsWith(".m3u8") && (
                            <source src={videoUrl} type="application/vnd.apple.mpegurl" />
                        )}
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {/* Timeline Controls */}
            {interviewEvents.length > 0 && (
                <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => setShowTimeline(!showTimeline)}
                            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                            {showTimeline ? 'Hide' : 'Show'} Timeline
                        </button>
                        <span className="text-xs text-gray-600">
                            {timelineMarkers.length} events
                        </span>
                    </div>

                    {showTimeline && (
                        <div className="relative">
                            {/* Timeline Bar */}
                            <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                                {/* Current Time Indicator (hidden for Drive preview) */}
                                {!isDrive && (
                                    <div
                                        className="absolute top-0 h-full bg-blue-400 opacity-30"
                                        style={{ width: `${(currentTime / (computedDuration || 1)) * 100}%` }}
                                    />
                                )}

                                {/* Question narration segments */}
                                {questionSegments.map(seg => (
                                    <div
                                        key={`qseg-${seg.id}`}
                                        className={`absolute top-0 h-full ${seg.hasRetake ? 'bg-orange-200/70 border-orange-500' : 'bg-yellow-200/60 border-yellow-400'} border-t border-b`}
                                        style={{ left: `${seg.percentageStart}%`, width: `${seg.percentageWidth}%` }}
                                        title={(seg.hasRetake ? '[Retake] ' : '') + (seg.question ? seg.question : `Question ${((seg.questionIndex ?? 0) + 1)}`)}
                                    />
                                ))}

                                {/* Event Markers */}
                                {timelineMarkers.map((marker) => (
                                    <div
                                        key={marker.id}
                                        className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-125 ${getMarkerColor(marker.event)}`}
                                        style={{ left: `${marker.percentage}%` }}
                                        onClick={() => handleTimelineClick(marker.time)}
                                        onMouseEnter={() => setHoveredMarker(marker.id)}
                                        onMouseLeave={() => setHoveredMarker(null)}
                                    >
                                        {/* Tooltip */}
                                        {hoveredMarker === marker.id && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-pre-line z-10">
                                                {getMarkerTooltip(marker)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline Legend */}
                            <div className="flex items-center gap-4 mt-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Question Start</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Answer Start</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>Answer End</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-2 bg-yellow-300 border border-yellow-500"></div>
                                    <span>Question Narration</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-2 bg-orange-300 border border-orange-500"></div>
                                    <span>Retake Window</span>
                                </div>
                            </div>

                            {/* Event List */}
                            <div className="mt-3 max-h-32 overflow-y-auto">
                                <div className="space-y-1">
                                    {timelineMarkers.map((marker, index) => (
                                        <div
                                            key={marker.id}
                                            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer text-xs"
                                            onClick={() => handleTimelineClick(marker.time)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${getMarkerColor(marker.event)}`}></div>
                                            <span className="text-gray-600">{formatTime(marker.time)}</span>
                                            <span className="text-gray-800">
                                                {marker.event === 'question_narration_started' &&
                                                    (typeof marker.questionIndex === 'number'
                                                        ? `Q${marker.questionIndex + 1} Started`
                                                        : 'Question Started')}
                                                {marker.event === 'user_response_started' && 'Answer Started'}
                                                {marker.event === 'user_response_retake_started' && 'Answer Retake Started'}
                                                {marker.event === 'user_response_ended' && `Answer Ended (${marker.responseLength} chars)`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoPlayerWithTimeline;
