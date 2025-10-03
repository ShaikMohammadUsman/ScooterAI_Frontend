import { motion } from "framer-motion";
import { FaMicrophone, FaHeadphones, FaClock } from "react-icons/fa";
import { useState } from "react";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/lib/interviewService";
import { Button } from "@/components/ui/button";
import { ScheduleInterviewModal } from "@/components/candidate/ScheduleInterviewModal";

interface AnimatedPlaceholderProps {
    onStart: (language: SupportedLanguageCode) => void;
    showIcons?: boolean;
    showScheduleLink?: boolean;
    title: string;
    description: string;
    buttonText: string;
    applicationId?: string;
}

export function AnimatedPlaceholder({ onStart, title, description, buttonText, showIcons, showScheduleLink, applicationId }: AnimatedPlaceholderProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>("en-IN");
    const [showScheduleModal, setShowScheduleModal] = useState(false);

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

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen text-center px-6" style={{ background: 'var(--color-bg-main)' }}>
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
                className="text-gray-500 text-sm mb-12 max-w-2xl"
            >
                {description}
            </motion.p>

            {showIcons && (
                // {/* Three Tips Sections */}
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
