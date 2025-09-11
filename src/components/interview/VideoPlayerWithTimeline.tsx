import React, { useEffect, useRef, useState } from "react";
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
    interviewEvents?: InterviewEvent[];
    poster?: string;
    autoPlay?: boolean;
    controls?: boolean;
    preload?: "auto" | "metadata" | "none";
    className?: string;
}

const VideoPlayerWithTimeline: React.FC<VideoPlayerWithTimelineProps> = ({
    videoUrl,
    interviewEvents = [],
    poster = "",
    autoPlay = false,
    controls = true,
    preload = "metadata",
    className = "w-full h-full rounded-lg shadow-lg",
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showTimeline, setShowTimeline] = useState(false);
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

    // Calculate timeline markers from interview events
    const timelineMarkers = React.useMemo(() => {
        if (!interviewEvents.length || !duration) return [];

        const startTime = new Date(interviewEvents[0]?.timestamp).getTime();

        return interviewEvents
            .filter(event =>
                event.event === 'question_narration_started' ||
                event.event === 'user_response_started' ||
                event.event === 'user_response_ended'
            )
            .map((event, index) => {
                const eventTime = new Date(event.timestamp).getTime();
                const relativeTime = (eventTime - startTime) / 1000; // Convert to seconds
                const percentage = (relativeTime / duration) * 100;

                return {
                    id: index,
                    time: relativeTime,
                    percentage: Math.max(0, Math.min(100, percentage)),
                    event: event.event,
                    questionIndex: event.details?.questionIndex,
                    question: event.details?.question,
                    responseLength: event.details?.responseLength,
                };
            })
            .filter(marker => marker.percentage >= 0 && marker.percentage <= 100);
    }, [interviewEvents, duration]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

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
    }, [videoUrl]);

    const handleTimelineClick = (time: number) => {
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
            case 'user_response_ended':
                return `Answer Ended\nLength: ${marker.responseLength} chars\nTime: ${formatTime(marker.time)}`;
            default:
                return `Event at ${formatTime(marker.time)}`;
        }
    };

    return (
        <div className="relative">
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
                                {/* Current Time Indicator */}
                                <div
                                    className="absolute top-0 h-full bg-blue-400 opacity-30"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />

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
