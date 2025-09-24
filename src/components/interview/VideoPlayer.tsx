import React, { useEffect, useMemo, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
    videoUrl: string;
    poster?: string;
    autoPlay?: boolean;
    controls?: boolean;
    preload?: "auto" | "metadata" | "none";
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    poster = "",
    autoPlay = false,
    controls = true,
    preload = "metadata",
    className = "w-full h-full rounded-lg shadow-lg",
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

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
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                return () => {
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

    return (
        isDriveUrl(normalizeVideoUrl) ? (
            <iframe
                title="Video"
                style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                src={normalizeVideoUrl}
                className={className}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
            />
        ) : (
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
        )
    );
};

export default VideoPlayer;
