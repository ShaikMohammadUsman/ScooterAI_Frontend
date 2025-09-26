"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Hls from 'hls.js';

interface VideoData {
    id: string;
    url: string;
    title: string;
    candidateName: string;
}

interface VerticalVideoPlayerProps {
    videos: VideoData[];
    initialIndex?: number;
    onVideoChange?: (video: VideoData, index: number) => void;
    className?: string;
}

const VerticalVideoPlayer: React.FC<VerticalVideoPlayerProps> = ({
    videos,
    initialIndex = 0,
    onVideoChange,
    className = ""
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const hlsInstances = useRef<(Hls | null)[]>([]);
    const loadedVideos = useRef<Set<number>>(new Set()); // Track which videos are already loaded
    const touchStartY = useRef(0);
    const lastTouchY = useRef(0);

    // Normalize Google Drive links or other sources for playback
    const isDriveUrl = (u: string) => {
        try { return new URL(u).hostname.includes('drive.google.com'); } catch { return false; }
    };

    const extractDriveId = (rawUrl: string): string | null => {
        try {
            const url = new URL(rawUrl);
            const m = url.pathname.match(/\/file\/d\/([^/]+)\//);
            if (m && m[1]) return m[1];
            const id = url.searchParams.get('id');
            return id;
        } catch { return null; }
    };

    const normalizeVideoUrl = useCallback((rawUrl: string): string => {
        if (!rawUrl) return rawUrl;
        try {
            const url = new URL(rawUrl);
            const isDrive = url.hostname.includes('drive.google.com');
            if (isDrive) {
                // Handle formats like: /file/d/{id}/view?usp=sharing
                const fileIdMatch = url.pathname.match(/\/file\/d\/([^/]+)\//);
                if (fileIdMatch && fileIdMatch[1]) {
                    // Prefer preview embed for reliable playback inside iframe
                    return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                }
                // Handle formats like: /uc?id={id}&export=download
                const idParam = url.searchParams.get('id');
                if (idParam) {
                    return `https://drive.google.com/file/d/${idParam}/preview`;
                }
                // If already a preview URL, pass through
                if (url.pathname.includes('/file/d/') && url.pathname.endsWith('/preview')) {
                    return url.toString();
                }
            }
        } catch (_) { /* ignore */ }
        return rawUrl;
    }, []);

    const normalizedVideos = React.useMemo(() =>
        videos.map(v => ({ ...v, url: normalizeVideoUrl(v.url) })),
        [videos, normalizeVideoUrl]
    );

    const currentVideo = normalizedVideos[currentIndex];

    // Function to load video source with HLS support
    const loadVideoSource = useCallback((video: HTMLVideoElement, videoUrl: string, index: number) => {
        if (!video || !videoUrl) return;

        // Check if video source is already loaded to avoid reloading
        if (video.src === videoUrl || video.currentSrc === videoUrl) {
            // Video already loaded, just apply mute state
            video.muted = isMuted;
            return;
        }

        // Clean up existing HLS instance
        if (hlsInstances.current[index]) {
            hlsInstances.current[index]?.destroy();
            hlsInstances.current[index] = null;
        }

        // Handle HLS (.m3u8)
        if (videoUrl.endsWith(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                // Add HLS event listeners
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log(`HLS manifest parsed for video ${index}, current source:`, video.src);
                    console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, ready state: ${video.readyState}`);
                    // Try to play when HLS is ready (only for current video)
                    if (index === currentIndex) {
                        setTimeout(() => {
                            video.play().catch(error => {
                                console.error(`Error playing HLS video ${index}:`, error);
                            });
                        }, 100);
                    }
                });

                hlsInstances.current[index] = hls;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Safari native support
                video.src = videoUrl;
            }
        } else {
            // Other formats (mp4, webm, ogg)
            video.src = videoUrl;
        }

        // Apply current mute state to the video
        video.muted = isMuted;
    }, [currentIndex]);

    // Function to apply mute state without reloading video
    const applyMuteState = useCallback((video: HTMLVideoElement) => {
        if (video) {
            video.muted = isMuted;
        }
    }, [isMuted]);


    const stopAllVideos = useCallback(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                video.pause();
                // Don't reset currentTime here - let the play/pause effect handle it
                // Don't override mute state - let the mute effect handle it
            }
        });
    }, []);

    // Handle video change
    useEffect(() => {
        if (onVideoChange && currentVideo) {
            onVideoChange(currentVideo, currentIndex);
        }
        // Stop all videos and reset loading state when video changes
        stopAllVideos();
        setIsLoading(true);
    }, [currentIndex, currentVideo, onVideoChange, stopAllVideos]);

    // Handle video source loading for rendered videos
    useEffect(() => {
        // Load current video
        if (currentVideo && videoRefs.current[currentIndex] && !isDriveUrl(currentVideo.url)) {
            loadVideoSource(videoRefs.current[currentIndex], currentVideo.url, currentIndex);
        }

        // Load previous video if it exists
        if (currentIndex > 0 && normalizedVideos[currentIndex - 1] && videoRefs.current[currentIndex - 1] && !isDriveUrl(normalizedVideos[currentIndex - 1].url)) {
            const prevVideo = videoRefs.current[currentIndex - 1];
            if (prevVideo) {
                loadVideoSource(prevVideo, normalizedVideos[currentIndex - 1].url, currentIndex - 1);
            }
        }

        // Load next video if it exists
        if (currentIndex < normalizedVideos.length - 1 && normalizedVideos[currentIndex + 1] && videoRefs.current[currentIndex + 1] && !isDriveUrl(normalizedVideos[currentIndex + 1].url)) {
            const nextVideo = videoRefs.current[currentIndex + 1];
            if (nextVideo) {
                loadVideoSource(nextVideo, normalizedVideos[currentIndex + 1].url, currentIndex + 1);
            }
        }
    }, [currentIndex, normalizedVideos, currentVideo, loadVideoSource]);

    // Drive embed: ensure loading overlay clears shortly after mount
    useEffect(() => {
        if (currentVideo && isDriveUrl(currentVideo.url)) {
            const t = setTimeout(() => setIsLoading(false), 1200);
            return () => clearTimeout(t);
        }
    }, [currentVideo]);

    // Handle video play/pause
    useEffect(() => {
        // First, pause ALL videos and clean up HLS instances
        videoRefs.current.forEach((video, index) => {
            if (video) {
                video.pause();

                // Only reset currentTime for non-current videos
                if (index !== currentIndex) {
                    video.currentTime = 0; // Reset to beginning for non-current videos
                }

                // Clean up HLS instance for non-current videos
                if (index !== currentIndex && hlsInstances.current[index]) {
                    hlsInstances.current[index]?.destroy();
                    hlsInstances.current[index] = null;
                }
            }
        });

        // Add a small delay to ensure video is loaded
        const timeoutId = setTimeout(() => {
            videoRefs.current.forEach((video, index) => {
                if (video) {
                    if (index === currentIndex && isPlaying) {
                        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                            video.play().catch(error => {
                                console.error(`Error playing video ${index}:`, error);
                            });
                        } else {
                            // Wait for the video to be ready
                            const onCanPlay = () => {
                                video.play().catch(error => {
                                    console.error(`Error playing video ${index} after ready:`, error);
                                });
                                video.removeEventListener('canplay', onCanPlay);
                                video.removeEventListener('loadeddata', onCanPlay);
                            };

                            // Listen for both canplay and loadeddata events
                            video.addEventListener('canplay', onCanPlay);
                            video.addEventListener('loadeddata', onCanPlay);

                            // Also try to play after a longer delay as fallback
                            setTimeout(() => {
                                if (video.readyState >= 1) { // HAVE_METADATA or higher
                                    video.play().catch(error => {
                                        console.error(`Error playing video ${index} after timeout:`, error);
                                    });
                                } else {
                                    // Force try to play even if not ready (for HLS)
                                    video.play().catch(error => {
                                        console.error(`Error force playing video ${index}:`, error);
                                    });
                                }
                            }, 3000);
                        }
                    }
                }
            });
        }, 100); // Small delay to ensure video is loaded

        return () => clearTimeout(timeoutId);
    }, [currentIndex, isPlaying]);

    // Handle mute state
    useEffect(() => {
        videoRefs.current.forEach(video => {
            if (video) {
                applyMuteState(video);
            }
        });
    }, [isMuted, applyMuteState]);

    // Cleanup HLS instances and stop videos on unmount
    useEffect(() => {
        return () => {
            // Stop all videos
            stopAllVideos();

            // Clean up HLS instances
            hlsInstances.current.forEach(hls => {
                if (hls) {
                    hls.destroy();
                }
            });

            // Clear loaded videos tracking
            loadedVideos.current.clear();
        };
    }, [stopAllVideos]);

    const goToNext = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        const nextIndex = (currentIndex + 1) % videos.length;
        setCurrentIndex(nextIndex);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const goToPrevious = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
        lastTouchY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - lastTouchY.current;
        lastTouchY.current = currentY;

        setDragOffset(prev => prev + deltaY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);
        const threshold = 100;

        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setDragOffset(0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragStartY(e.clientY);
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaY = e.clientY - dragStartY;
        setDragOffset(deltaY);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        setIsDragging(false);
        const threshold = 100;

        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setDragOffset(0);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleVideoClick = () => {
        togglePlayPause();
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        if (isTransitioning) return;

        if (e.deltaY > 0) {
            goToNext();
        } else {
            goToPrevious();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            toggleMute();
        }
    };

    const handleVideoLoadStart = () => {
        setIsLoading(true);
    };

    const handleVideoCanPlay = () => {
        setIsLoading(false);
    };

    const handleVideoWaiting = () => {
        setIsLoading(true);
    };


    // Auto-hide loading after timeout
    useEffect(() => {
        if (isLoading) {
            const timeout = setTimeout(() => {
                setIsLoading(false);
            }, 10000); // Hide loading after 10 seconds max

            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    if (!videos.length) {
        return (
            <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
                <div className="text-center text-white">
                    <FaPlay className="text-4xl mx-auto mb-2 opacity-50" />
                    <p className="text-lg opacity-75">No videos available</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative bg-black overflow-hidden select-none ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Video Container */}
            <div
                className="relative w-full h-full"
                style={{
                    transform: `translateY(${dragOffset}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                {/* Previous Video (hidden) */}
                {currentIndex > 0 && (
                    <div className="absolute inset-0 -translate-y-full">
                        <video
                            ref={el => { videoRefs.current[currentIndex - 1] = el; }}
                            className="w-full h-full object-cover"
                            muted={isMuted}
                            playsInline
                            loop
                        >
                            {/* Provide fallback sources for broader compatibility */}
                            {normalizedVideos[currentIndex - 1]?.url.endsWith(".mp4") && (
                                <source src={normalizedVideos[currentIndex - 1].url} type="video/mp4" />
                            )}
                            {normalizedVideos[currentIndex - 1]?.url.endsWith(".webm") && (
                                <source src={normalizedVideos[currentIndex - 1].url} type="video/webm" />
                            )}
                            {normalizedVideos[currentIndex - 1]?.url.endsWith(".ogg") && (
                                <source src={normalizedVideos[currentIndex - 1].url} type="video/ogg" />
                            )}
                            {normalizedVideos[currentIndex - 1]?.url.endsWith(".m3u8") && (
                                <source src={normalizedVideos[currentIndex - 1].url} type="application/vnd.apple.mpegurl" />
                            )}
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {/* Current Video */}
                <div className="relative w-full h-full bg-gray-800">
                    {isDriveUrl(currentVideo?.url || '') ? (
                        <iframe
                            title={currentVideo?.title || 'Magic Video'}
                            src={currentVideo.url}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            allowFullScreen
                            onLoad={() => setIsLoading(false)}
                        />
                    ) : (
                        <video
                            ref={el => { videoRefs.current[currentIndex] = el; }}
                            className="w-full h-full object-cover cursor-pointer"
                            style={{ minHeight: '100%', minWidth: '100%' }}
                            muted={isMuted}
                            loop
                            playsInline
                            onClick={handleVideoClick}
                            onLoadStart={handleVideoLoadStart}
                            onCanPlay={handleVideoCanPlay}
                            onWaiting={handleVideoWaiting}
                        >
                            {/* Provide fallback sources for broader compatibility */}
                            {currentVideo?.url.endsWith(".mp4") && (
                                <source src={currentVideo.url} type="video/mp4" />
                            )}
                            {currentVideo?.url.endsWith(".webm") && (
                                <source src={currentVideo.url} type="video/webm" />
                            )}
                            {currentVideo?.url.endsWith(".ogg") && (
                                <source src={currentVideo.url} type="video/ogg" />
                            )}
                            {currentVideo?.url.endsWith(".m3u8") && (
                                <source src={currentVideo.url} type="application/vnd.apple.mpegurl" />
                            )}
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-30">
                            <div className="text-center text-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-lg font-medium">Loading video...</p>
                            </div>
                        </div>
                    )}

                    {/* Play Button - Only show when paused; for Drive, rely on iframe controls */}
                    {!isDriveUrl(currentVideo?.url || '') && !isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <button
                                onClick={handleVideoClick}
                                className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-4 transition-all pointer-events-auto"
                            >
                                <FaPlay className="text-white text-2xl ml-1" />
                            </button>
                        </div>
                    )}

                    {/* Playing Indicator - Show when playing */}
                    {(!isDriveUrl(currentVideo?.url || '') && isPlaying) && (
                        <div className="absolute top-4 left-4 bg-green-500 bg-opacity-80 rounded-full px-3 py-1 z-10">
                            <span className="text-white text-sm font-medium">● Playing</span>
                        </div>
                    )}

                    {/* Mute Status Indicator */}
                    {(!isDriveUrl(currentVideo?.url || '') && isMuted) && (
                        <div className="absolute top-4 right-20 bg-red-500 bg-opacity-80 rounded-full px-3 py-1 z-10">
                            <span className="text-white text-sm font-medium">🔇 Muted</span>
                        </div>
                    )}

                    {/* Video Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                        <h3 className="text-white text-lg font-semibold mb-1">
                            {currentVideo.title}
                        </h3>
                        <p className="text-white text-sm opacity-90">
                            {currentVideo.candidateName}
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition-all"
                        disabled={isTransitioning}
                    >
                        <FaChevronUp className="text-white text-xl" />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 transition-all"
                        disabled={isTransitioning}
                    >
                        <FaChevronDown className="text-white text-xl" />
                    </button>

                    {/* Mute Button */}
                    {!isDriveUrl(currentVideo?.url || '') && (
                        <button
                            onClick={toggleMute}
                            className="absolute top-16 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all z-20"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <FaVolumeMute className="text-white text-xl" />
                            ) : (
                                <FaVolumeUp className="text-white text-xl" />
                            )}
                        </button>
                    )}

                    {/* Video Counter */}
                    <div className="absolute top-4 left-4 bg-black bg-opacity-30 rounded-full px-3 py-1">
                        <span className="text-white text-sm">
                            {currentIndex + 1} / {videos.length}
                        </span>
                    </div>
                </div>

                {/* Next Video (hidden) */}
                {currentIndex < videos.length - 1 && (
                    <div className="absolute inset-0 translate-y-full">
                        <video
                            ref={el => { videoRefs.current[currentIndex + 1] = el; }}
                            className="w-full h-full object-cover"
                            muted={isMuted}
                            loop
                            playsInline
                        >
                            {/* Provide fallback sources for broader compatibility */}
                            {normalizedVideos[currentIndex + 1]?.url.endsWith(".mp4") && (
                                <source src={normalizedVideos[currentIndex + 1].url} type="video/mp4" />
                            )}
                            {normalizedVideos[currentIndex + 1]?.url.endsWith(".webm") && (
                                <source src={normalizedVideos[currentIndex + 1].url} type="video/webm" />
                            )}
                            {normalizedVideos[currentIndex + 1]?.url.endsWith(".ogg") && (
                                <source src={normalizedVideos[currentIndex + 1].url} type="video/ogg" />
                            )}
                            {normalizedVideos[currentIndex + 1]?.url.endsWith(".m3u8") && (
                                <source src={normalizedVideos[currentIndex + 1].url} type="application/vnd.apple.mpegurl" />
                            )}
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </div>

            {/* Scroll Indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {videos.map((_, index) => (
                    <div
                        key={index}
                        className={`w-1 h-8 rounded-full transition-all ${index === currentIndex
                            ? 'bg-white'
                            : 'bg-white bg-opacity-30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default VerticalVideoPlayer;
