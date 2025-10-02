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
    const [hasError, setHasError] = useState(false);
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const [hasAutoJumped, setHasAutoJumped] = useState<Set<number>>(new Set()); // Track which questions we've auto-jumped

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

    // Pre-calculate retake timestamps for smart jumping
    const retakeTimestamps = React.useMemo(() => {
        const retakeMap = new Map<number, number>(); // questionIndex -> retake timestamp
        if (!interviewEvents.length) return retakeMap;

        // Find the first question narration start as the reference point
        const firstQuestionEvent = interviewEvents.find(ev => ev.event === 'question_narration_started');
        const videoStartTs = firstQuestionEvent ? new Date(firstQuestionEvent.timestamp).getTime() : new Date(interviewEvents[0]?.timestamp).getTime();

        for (const ev of interviewEvents) {
            if (ev.event === 'answer_retake_started' && typeof ev.details?.questionIndex === 'number') {
                const eventTime = new Date(ev.timestamp).getTime();
                const relativeTime = (eventTime - videoStartTs) / 1000; // Convert to seconds
                retakeMap.set(ev.details.questionIndex, relativeTime);
            }
        }
        return retakeMap;
    }, [interviewEvents]);

    // Pre-calculate first attempt timestamps for comparison
    const firstAttemptTimestamps = React.useMemo(() => {
        const attemptMap = new Map<number, number>(); // questionIndex -> first attempt timestamp
        if (!interviewEvents.length) return attemptMap;

        // Find the first question narration start as the reference point
        const firstQuestionEvent = interviewEvents.find(ev => ev.event === 'question_narration_started');
        const videoStartTs = firstQuestionEvent ? new Date(firstQuestionEvent.timestamp).getTime() : new Date(interviewEvents[0]?.timestamp).getTime();

        // Track which questions we've seen the first attempt for
        const seenQuestions = new Set<number>();

        for (const ev of interviewEvents) {
            if (ev.event === 'user_response_started' && typeof ev.details?.questionIndex === 'number') {
                const questionIndex = ev.details.questionIndex;

                // Only store the FIRST user_response_started for each question
                if (!seenQuestions.has(questionIndex)) {
                    const eventTime = new Date(ev.timestamp).getTime();
                    const relativeTime = (eventTime - videoStartTs) / 1000; // Convert to seconds
                    attemptMap.set(questionIndex, relativeTime);
                    seenQuestions.add(questionIndex);
                }
            }
        }
        return attemptMap;
    }, [interviewEvents]);

    // Auto-jump logic: automatically jump to retake when reaching first attempt
    useEffect(() => {
        if (isDrive || !videoRef.current) return; // Skip for Drive previews

        const video = videoRef.current;

        // Debug logging
        if (currentTime > 0 && Math.floor(currentTime) % 5 === 0) { // Log every 5 seconds
            console.log(`Current time: ${currentTime.toFixed(2)}s`);
            console.log('First attempt timestamps:', Array.from(firstAttemptTimestamps.entries()));
            console.log('Retake timestamps:', Array.from(retakeTimestamps.entries()));
            console.log('Auto-jumped questions:', Array.from(hasAutoJumped));
        }

        // Check if we're at a first attempt timestamp that has a retake
        for (const [questionIndex, firstAttemptTime] of firstAttemptTimestamps.entries()) {
            // Check if this question has a retake and we haven't auto-jumped yet
            if (retakeTimestamps.has(questionIndex) && !hasAutoJumped.has(questionIndex)) {
                const retakeTime = retakeTimestamps.get(questionIndex)!;

                // Check if current time is within 1 second of the first attempt start
                if (Math.abs(currentTime - firstAttemptTime) <= 1.0) {
                    console.log(`🚀 Auto-jumping from first attempt (${firstAttemptTime}s) to retake (${retakeTime}s) for question ${questionIndex + 1}`);
                    console.log(`Current time: ${currentTime.toFixed(2)}s, First attempt: ${firstAttemptTime.toFixed(2)}s, Retake: ${retakeTime.toFixed(2)}s`);

                    // Jump to retake timestamp
                    video.currentTime = retakeTime;

                    // Mark this question as auto-jumped to prevent loops
                    setHasAutoJumped(prev => new Set(prev).add(questionIndex));

                    break; // Only handle one jump at a time
                }
            }
        }
    }, [currentTime, firstAttemptTimestamps, retakeTimestamps, hasAutoJumped, isDrive]);

    // Calculate timeline markers from interview events with smart jump priority
    const timelineMarkers = React.useMemo(() => {
        if (!interviewEvents.length || !computedDuration) return [];

        // Find the first question narration start as the reference point
        const firstQuestionEvent = interviewEvents.find(ev => ev.event === 'question_narration_started');
        const startTime = firstQuestionEvent ? new Date(firstQuestionEvent.timestamp).getTime() : new Date(interviewEvents[0]?.timestamp).getTime();

        // Create a map to track which questions have retakes
        const questionsWithRetakes = new Set<number>();
        for (const ev of interviewEvents) {
            if (ev.event === 'answer_retake_started' && typeof ev.details?.questionIndex === 'number') {
                questionsWithRetakes.add(ev.details.questionIndex);
            }
        }

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
                const questionIndex = event.details?.questionIndex;

                // Determine if this is the primary jump target for this question
                const isPrimaryJumpTarget = isRetake ||
                    (event.event === 'user_response_started' &&
                        typeof questionIndex === 'number' &&
                        !questionsWithRetakes.has(questionIndex));

                return {
                    id: index,
                    time: relativeTime,
                    percentage: Math.max(0, Math.min(100, percentage)),
                    event: isRetake ? 'user_response_retake_started' : event.event,
                    questionIndex: questionIndex,
                    question: event.details?.question,
                    responseLength: event.details?.responseLength,
                    isPrimaryJumpTarget,
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

                // Add timeout for HLS loading
                const hlsTimeout = setTimeout(() => {
                    console.log('HLS loading timeout, attempting fallback');
                    hls.destroy();
                    if (fallbackUrl && lastTriedUrlRef.current !== fallbackUrl) {
                        console.log('Attempting fallback to:', fallbackUrl);
                        lastTriedUrlRef.current = fallbackUrl;
                        setHasError(true);
                        setIsUsingFallback(true);
                        setErrorMessage('Processed video loading timeout, using original...');
                        video.src = fallbackUrl;
                        video.load();
                    }
                }, 10000); // 10 second timeout

                // Add error handling for HLS
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error:', data);
                    clearTimeout(hlsTimeout); // Clear timeout on error

                    if (data.fatal) {
                        // Check if it's a 404 error (manifest doesn't exist)
                        if (data.response && data.response.code === 404) {
                            console.log('HLS manifest not found (404), attempting fallback immediately');
                            hls.destroy();
                            if (fallbackUrl && lastTriedUrlRef.current !== fallbackUrl) {
                                console.log('Attempting fallback to:', fallbackUrl);
                                lastTriedUrlRef.current = fallbackUrl;
                                setHasError(true);
                                setIsUsingFallback(true);
                                setErrorMessage('Raw Video.....');
                                video.src = fallbackUrl;
                                video.load();
                            }
                            return;
                        }

                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('Fatal network error encountered, trying to recover...');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('Fatal media error encountered, trying to recover...');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.log('Fatal error, destroying HLS instance');
                                hls.destroy();
                                // Try fallback URL if available
                                if (fallbackUrl && lastTriedUrlRef.current !== fallbackUrl) {
                                    console.log('Attempting fallback to:', fallbackUrl);
                                    lastTriedUrlRef.current = fallbackUrl;
                                    setHasError(true);
                                    setIsUsingFallback(true);
                                    setErrorMessage('Using fallback video...');
                                    video.src = fallbackUrl;
                                    video.load();
                                }
                                break;
                        }
                    }
                });

                // Clear timeout when HLS loads successfully
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    clearTimeout(hlsTimeout);
                });

                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                return () => {
                    clearTimeout(hlsTimeout);
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
            setHasError(true);
            setErrorMessage('Failed to load video');

            if (!fallbackUrl) {
                setErrorMessage('Failed to load video and no fallback available');
                return;
            }

            // Prevent infinite retry loop
            if (lastTriedUrlRef.current === fallbackUrl) {
                setErrorMessage('Both primary and fallback videos failed to load');
                return;
            }

            console.log('Video error occurred, attempting fallback to:', fallbackUrl);
            lastTriedUrlRef.current = fallbackUrl;
            setIsUsingFallback(true);
            setErrorMessage('Using fallback video...');

            try {
                // Clear current source and load fallback
                video.src = '';
                video.load();
                video.src = fallbackUrl;
                video.load();
                video.play().catch(() => {/* ignore autoplay block */ });
            } catch (error) {
                console.error('Failed to load fallback video:', error);
                setErrorMessage('Failed to load both primary and fallback videos');
            }
        };

        video.addEventListener('error', handleError);
        return () => {
            video.removeEventListener('error', handleError);
        };
    }, [fallbackUrl, videoUrl]);

    // Reset error state when video URL changes
    useEffect(() => {
        setHasError(false);
        setIsUsingFallback(false);
        setErrorMessage(null);
        lastTriedUrlRef.current = null;
        setHasAutoJumped(new Set()); // Reset auto-jump tracking for new video
    }, [videoUrl]);

    // Smart jump logic: jump to retake answer if available, otherwise first attempt
    const getSmartJumpTime = (questionIndex: number): number | null => {
        // First check if there's a retake timestamp for this question
        if (retakeTimestamps.has(questionIndex)) {
            return retakeTimestamps.get(questionIndex)!;
        }
        // If no retake, check for first attempt timestamp
        if (firstAttemptTimestamps.has(questionIndex)) {
            return firstAttemptTimestamps.get(questionIndex)!;
        }
        return null;
    };

    const handleTimelineClick = (time: number, questionIndex?: number) => {
        if (isDrive) {
            // Seeking not supported for Drive preview; ignore clicks
            return;
        }

        // If questionIndex is provided, use smart jump logic
        if (typeof questionIndex === 'number') {
            const smartTime = getSmartJumpTime(questionIndex);
            if (smartTime !== null && videoRef.current) {
                videoRef.current.currentTime = smartTime;
                return;
            }
        }

        // Fallback to direct time jump
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
        // For Drive previews, we can't track currentTime, so show all segments
        // For native video, use currentTime for precise timing
        const visible = isDrive || (!isNaN(currentTime) && currentTime >= segment.start && currentTime <= segment.end);
        if (!visible) return null;

        const base = segment.question || (typeof segment.questionIndex === 'number' ? `Question ${segment.questionIndex + 1}` : 'Question');
        const hasRetake = segment.hasRetake || (typeof segment.questionIndex === 'number' && retakeTimestamps.has(segment.questionIndex));
        const text = hasRetake ? `[Retake Available] ${base}` : base;

        return (
            <div className="absolute inset-x-0 top-2 mx-auto max-w-3xl z-20">
                <div className={`px-3 py-2 text-white text-xs sm:text-sm md:text-base rounded shadow ${hasRetake ? 'bg-orange-600/80' : 'bg-black/60'
                    }`}>
                    {text}
                    {hasRetake && (
                        <div className="text-xs mt-1 text-yellow-200">
                            Click timeline to jump to retake answer
                        </div>
                    )}
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

        // Find the first question narration start as the reference point
        const firstQuestionEvent = interviewEvents.find(ev => ev.event === 'question_narration_started');
        const videoStartTs = firstQuestionEvent ? new Date(firstQuestionEvent.timestamp).getTime() : new Date(interviewEvents[0]?.timestamp).getTime();

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

            // Start display 5 seconds before narration actually starts
            const displayStartTs = entry.startTs - 0; // 0 seconds before
            const startSec = Math.max(0, (displayStartTs - videoStartTs) / 1000);

            // Calculate end time: minimum 5 seconds from display start, or until narration ends (whichever is longer)
            const narrationEndTs = typeof entry.endTs === 'number' ? entry.endTs : null;
            const minDisplayEndTs = displayStartTs + 10000; // 10 seconds minimum from display start

            let endTs;
            if (narrationEndTs) {
                // Use the longer of: narration end or 5 seconds from display start
                endTs = Math.max(narrationEndTs, minDisplayEndTs);
            } else {
                // No narration end event, use 5 seconds minimum from display start
                endTs = minDisplayEndTs;
            }

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
                hasRetake: retakeQuestions.has(qi) || retakeTimestamps.has(qi),
            });
        });

        return result;
    }, [interviewEvents, computedDuration, duration, questionEvaluations, retakeTimestamps]);

    // Build retake segments from retake start/end events
    const retakeSegments = React.useMemo(() => {
        type RetakeSegment = { id: string; start: number; end: number; percentageStart: number; percentageWidth: number; questionIndex?: number };
        const result: RetakeSegment[] = [];
        if (!interviewEvents.length) return result;
        const total = computedDuration || duration || 1;

        // Find the first question narration start as the reference point
        const firstQuestionEvent = interviewEvents.find(ev => ev.event === 'question_narration_started');
        const videoStartTs = firstQuestionEvent ? new Date(firstQuestionEvent.timestamp).getTime() : new Date(interviewEvents[0]?.timestamp).getTime();

        // Group retake events by questionIndex
        const retakeEvents = new Map<number, { startTs?: number; endTs?: number }>();
        for (const ev of interviewEvents) {
            if (ev.event === 'answer_retake_started' || ev.event === 'answer_retake_ended') {
                const qi = ev.details?.questionIndex ?? undefined;
                if (typeof qi !== 'number') continue;
                const entry = retakeEvents.get(qi) || {};
                if (ev.event === 'answer_retake_started') {
                    entry.startTs = new Date(ev.timestamp).getTime();
                } else if (ev.event === 'answer_retake_ended') {
                    entry.endTs = new Date(ev.timestamp).getTime();
                }
                retakeEvents.set(qi, entry);
            }
        }

        // Build retake segments
        retakeEvents.forEach((entry, qi) => {
            if (typeof entry.startTs !== 'number' || typeof entry.endTs !== 'number') return;

            const startSec = Math.max(0, (entry.startTs - videoStartTs) / 1000);
            const endSec = Math.max(startSec + 0.5, (entry.endTs - videoStartTs) / 1000);
            const pStart = Math.max(0, Math.min(100, (startSec / total) * 100));
            const pWidth = Math.max(0.5, Math.min(100 - pStart, ((endSec - startSec) / total) * 100));

            result.push({
                id: `retake-${qi}`,
                start: startSec,
                end: endSec,
                percentageStart: pStart,
                percentageWidth: pWidth,
                questionIndex: qi,
            });
        });

        return result;
    }, [interviewEvents, computedDuration, duration]);

    return (
        <div className="relative">
            {isDriveUrl(normalizeVideoUrl) ? (
                <div className={className} style={{ position: 'relative' }}>
                    {/* Question overlay for Drive during narration segments */}
                    {questionSegments.map(seg => (
                        <QuestionOverlay key={`qo-${seg.id}`} segment={seg} isDrive={true} />
                    ))}
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
                    {questionSegments.map(seg => (
                        <QuestionOverlay key={`qo-native-${seg.id}`} segment={seg} />
                    ))}
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

            {/* Error/Status Messages */}
            {errorMessage && (
                <div className={`absolute top-2 left-2 right-2 p-2 rounded text-sm z-30 ${hasError && !isUsingFallback
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : isUsingFallback
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                    {errorMessage}
                </div>
            )}

            {/* Auto-jump indicator */}
            {/* {hasAutoJumped.size > 0 && (
                <div className="absolute top-2 right-2 p-2 bg-green-100 text-green-800 border border-green-200 rounded text-xs z-30">
                    <div className="flex items-center gap-1">
                        <span>⚡</span>
                        <span>Auto-jumped {hasAutoJumped.size} retake{hasAutoJumped.size > 1 ? 's' : ''}</span>
                    </div>
                </div>
            )} */}

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
                                        className="absolute top-0 h-full bg-yellow-200/60 border-yellow-400 border-t border-b"
                                        style={{ left: `${seg.percentageStart}%`, width: `${seg.percentageWidth}%` }}
                                        title={(seg.hasRetake ? '[Retake] ' : '') + (seg.question ? seg.question : `Question ${((seg.questionIndex ?? 0) + 1)}`)}
                                    />
                                ))}

                                {/* Retake segments */}
                                {retakeSegments.map(seg => (
                                    <div
                                        key={`retake-${seg.id}`}
                                        className="absolute top-0 h-full bg-orange-200/70 border-orange-500 border-t border-b"
                                        style={{ left: `${seg.percentageStart}%`, width: `${seg.percentageWidth}%` }}
                                        title={`Retake - Question ${((seg.questionIndex ?? 0) + 1)}`}
                                    />
                                ))}

                                {/* Event Markers */}
                                {timelineMarkers.map((marker) => (
                                    <div
                                        key={marker.id}
                                        className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-125 ${marker.isPrimaryJumpTarget
                                            ? 'ring-2 ring-white shadow-lg'
                                            : ''
                                            } ${getMarkerColor(marker.event)}`}
                                        style={{ left: `${marker.percentage}%` }}
                                        onClick={() => handleTimelineClick(marker.time, marker.questionIndex)}
                                        onMouseEnter={() => setHoveredMarker(marker.id)}
                                        onMouseLeave={() => setHoveredMarker(null)}
                                    >
                                        {/* Tooltip */}
                                        {hoveredMarker === marker.id && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-pre-line z-10">
                                                {getMarkerTooltip(marker)}
                                                {marker.isPrimaryJumpTarget && (
                                                    <div className="text-yellow-300 mt-1">
                                                        ⭐ Primary Jump Target
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline Legend */}
                            <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Question Start</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Answer Start</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Retake Start</span>
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
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full ring-1 ring-yellow-400"></div>
                                    <span>⭐ Primary Jump Target</span>
                                </div>
                            </div>

                            {/* Event List */}
                            <div className="mt-3 max-h-32 overflow-y-auto">
                                <div className="space-y-1">
                                    {timelineMarkers.map((marker, index) => (
                                        <div
                                            key={marker.id}
                                            className={`flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer text-xs ${marker.isPrimaryJumpTarget ? 'bg-yellow-50 border border-yellow-200' : ''
                                                }`}
                                            onClick={() => handleTimelineClick(marker.time, marker.questionIndex)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${getMarkerColor(marker.event)} ${marker.isPrimaryJumpTarget ? 'ring-1 ring-yellow-400' : ''
                                                }`}></div>
                                            <span className="text-gray-600">{formatTime(marker.time)}</span>
                                            <span className="text-gray-800 flex items-center gap-1">
                                                {marker.event === 'question_narration_started' &&
                                                    (typeof marker.questionIndex === 'number'
                                                        ? `Q${marker.questionIndex + 1} Started`
                                                        : 'Question Started')}
                                                {marker.event === 'user_response_started' && 'Answer Started'}
                                                {marker.event === 'user_response_retake_started' && 'Answer Retake Started'}
                                                {marker.event === 'user_response_ended' && `Answer Ended (${marker.responseLength} chars)`}
                                                {marker.isPrimaryJumpTarget && (
                                                    <span className="text-yellow-600 text-xs">⭐</span>
                                                )}
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
