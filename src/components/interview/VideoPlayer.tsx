import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
    videoUrl: string;
    fallbackUrl?: string | null;
    poster?: string;
    autoPlay?: boolean;
    controls?: boolean;
    preload?: "auto" | "metadata" | "none";
    className?: string;
    showPoster?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    fallbackUrl,
    poster = "/assets/images/newScooterLogo.png",
    autoPlay = false,
    controls = true,
    preload = "metadata",
    className = "w-full h-full rounded-lg shadow-lg",
    showPoster = false,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastTriedUrlRef = useRef<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isUsingFallback, setIsUsingFallback] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const isDriveUrl = (u: string) => {
        try { return new URL(u).hostname.includes('drive.google.com'); } catch { return false; }
    };

    const normalizeVideoUrl = useMemo(() => {
        try {
            const url = new URL(videoUrl);
            if (url.hostname.includes('drive.google.com')) {
                // Convert common share links to preview
                const fileIdMatch = url.pathname.match(/\/file\/d\/([^/]+)\//);
                if (fileIdMatch && fileIdMatch[1]) {
                    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                }
                const idParam = url.searchParams.get('id');
                if (idParam) {
                    return `https://drive.google.com/file/d/${idParam}/preview`;
                }
                if (url.pathname.includes('/file/d/') && url.pathname.endsWith('/preview')) {
                    return url.toString();
                }
            }
        } catch { /* ignore */ }
        return videoUrl;
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        if (isDriveUrl(normalizeVideoUrl)) {
            return; // handled via iframe render
        }

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
                };
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Safari native support
                video.src = videoUrl;
            }
        } else {
            // Other formats (mp4, webm, ogg)
            video.src = videoUrl;
        }
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
    }, [videoUrl]);

    return (
        <div className={`relative ${className}`}>
            {isDriveUrl(normalizeVideoUrl) ? (
                <>
                    {showPoster && !isVideoLoaded ? (
                        <div
                            className="w-full h-full bg-black flex items-center justify-center cursor-pointer"
                            onClick={() => setIsVideoLoaded(true)}
                        >
                            <img
                                src={poster}
                                alt="Video thumbnail"
                                className="w-full h-full object-contain px-2"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                    <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            title="Video"
                            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                            src={normalizeVideoUrl}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            allowFullScreen
                            onLoad={() => setIsVideoLoaded(true)}
                        />
                    )}
                </>
            ) : (
                <video
                    ref={videoRef}
                    className="w-full h-full"
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
            )}

            {/* Error/Status Messages */}
            {errorMessage && (
                <div className={`absolute top-2 left-2 right-2 p-2 rounded text-sm ${hasError && !isUsingFallback
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : isUsingFallback
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
