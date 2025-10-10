import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaHeadphones, FaClock, FaLock, FaTimes, FaPlay } from "react-icons/fa";
import { useState, useEffect } from "react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/lib/interviewService";
import { Button } from "@/components/ui/button";
import { ScheduleInterviewModal } from "@/components/candidate/ScheduleInterviewModal";
import VideoPlayer from "@/components/interview/VideoPlayer";
import { MdLock } from "react-icons/md";

interface AnimatedPlaceholderProps {
    onStart: (language: SupportedLanguageCode) => void;
    showIcons?: boolean;
    showScheduleLink?: boolean;
    title: string;
    description: string;
    buttonText: string;
    applicationId?: string;
    showVideo?: boolean;
    videoUrl?: string;
    videoTitle?: string;
}

export function AnimatedPlaceholder({ onStart, title, description, buttonText, showIcons, showScheduleLink, applicationId, showVideo = false, videoUrl, videoTitle }: AnimatedPlaceholderProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [hasSeenVideo, setHasSeenVideo] = useState(false);

    const handleStart = () => {
        onStart(selectedLanguage);
    };

    const handleScheduleClick = () => {
        if (applicationId) {
            setShowScheduleModal(true);
        } else {
            console.warn("No application ID available for scheduling");
        }
    };

    const handleSkipVideo = () => {
        setShowVideoModal(false);
        setHasSeenVideo(true);
    };

    const handlePlayVideo = () => {
        setShowVideoModal(true);
    };

    // Show video modal on first load if video is enabled
    useEffect(() => {
        if (showVideo && videoUrl && !hasSeenVideo) {
            setShowVideoModal(true);
        }
    }, [showVideo, videoUrl, hasSeenVideo]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full text-center px-6 py-8 bg-bg-main">
            {/* Video Modal */}
            <AnimatePresence>
                {showVideoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full max-w-xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
                        >
                            {/* Video Header */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {videoTitle || "Introduction Video"}
                                </h3>
                                <button
                                    onClick={handleSkipVideo}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <FaTimes className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Video Player */}
                            <div className="aspect-video bg-black">
                                {videoUrl && (
                                    <VideoPlayer
                                        videoUrl={videoUrl}
                                        autoPlay={true}
                                        controls={true}
                                        className="w-full h-full"
                                        showPoster={true}
                                    />
                                )}
                            </div>

                            {/* Skip Button */}
                            <div className="p-4 bg-gray-50 border-t">
                                <Button
                                    onClick={handleSkipVideo}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Skip
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Heading */}


            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-semibold text-gray-900 mb-4 max-w-2xl"
            >
                {title}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-gray-500 text-sm mb-12 max-w-2xl whitespace-pre-line"
            >
                {description}
            </motion.p>

            {showIcons && (
                // {/* Three Tips Sections */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-12 max-w-4xl">
                        {/* Tip 1: Find a quiet spot */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <FaClock className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-gray-700 text-lg">
                                Find a quiet spot, this<br />
                                only takes 5 minutes.
                            </p>
                        </motion.div>

                        {/* Tip 2: Grab headphones */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <FaHeadphones className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-gray-700 text-lg">
                                Grab your headphones<br />
                                for better audio.
                            </p>
                        </motion.div>

                        {/* Tip 3: Audio only */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <FaMicrophone className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-gray-700 text-lg">
                                Audio only-no<br />
                                camera required.
                            </p>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex items-start gap-2">
                        <MdLock className="w-6 h-6 text-yellow-500" />
                        <p className="text-gray-700 text-sm">PS : Your pitch is safe, private, and always reviewed by people.</p>
                    </motion.div>
                </div>

            )}

            {/* I'm Ready Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-8"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={handleStart}
                        variant="primary"
                        className="px-8 py-4 text-lg font-semibold shadow-lg"
                    >
                        {buttonText}
                    </Button>
                </motion.div>
            </motion.div>

            {showScheduleLink && (
                // {/* Schedule for later link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-center"
                >
                    <p className="text-gray-600 text-sm">
                        Unable to start now?<br />
                        <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                            onClick={handleScheduleClick}
                        >
                            Click here to schedule your assessment for later
                        </span>
                    </p>
                </motion.div>
            )}

            {/* Video Player Section */}
            {showVideo && videoUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="mt-12 w-full max-w-xl"
                >
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FaPlay className="w-5 h-5 text-element-3" />
                                {videoTitle || "Introduction Video"}
                            </h3>
                        </div>
                        <div className="aspect-video bg-black">
                            <VideoPlayer
                                videoUrl={videoUrl}
                                autoPlay={false}
                                controls={true}
                                className="w-full h-full"
                                showPoster={true}
                            />
                        </div>
                        <div className="p-4 bg-gray-50 border-t">
                            <Button
                                onClick={handlePlayVideo}
                                variant="outline"
                                className="w-full"
                            >
                                <FaPlay className="w-4 h-4 mr-2" />
                                Play Again
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Schedule Interview Modal */}
            {applicationId && (
                <ScheduleInterviewModal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    applicationId={applicationId}
                />
            )}
        </div>
    );
}
