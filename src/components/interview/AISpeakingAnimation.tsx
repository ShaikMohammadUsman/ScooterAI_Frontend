import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingDots } from '@/components/ui/loadingDots';

interface AISpeakingAnimationProps {
    isSpeaking: boolean;
    isProcessing: boolean;
    currentQuestion?: string | null;
    isDarkTheme?: boolean;
    speechDuration?: number; // Duration of the current speech in milliseconds
}

const AISpeakingAnimation: React.FC<AISpeakingAnimationProps> = ({
    isSpeaking,
    isProcessing,
    currentQuestion,
    isDarkTheme = true,
    speechDuration
}) => {
    // Add a small delay after speech ends to ensure smooth transition
    const [showSpeakingAnimation, setShowSpeakingAnimation] = React.useState(false);

    useEffect(() => {
        if (isSpeaking || isProcessing) {
            setShowSpeakingAnimation(true);
        } else if (speechDuration && speechDuration > 0) {
            // Keep showing animation for the exact speech duration
            const timer = setTimeout(() => {
                setShowSpeakingAnimation(false);
            }, speechDuration);

            return () => clearTimeout(timer);
        } else {
            setShowSpeakingAnimation(false);
        }
    }, [isSpeaking, isProcessing, speechDuration]);

    return (
        <div className="flex-1 flex items-center justify-center p-3 sm:p-8">
            <div className="max-w-2xl w-full text-center">
                {/* Main Animation Container */}
                <AnimatePresence mode="wait">
                    {showSpeakingAnimation ? (
                        <motion.div
                            key="speaking"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="space-y-6"
                        >
                            {/* Active Speaking Animation - Using GIF */}
                            <div className="flex justify-center">
                                <img
                                    src="/assets/images/circularWavyAnimation.gif"
                                    alt="AI Speaking Animation"
                                    className="w-70 h-70 object-contain"
                                />
                            </div>

                            {/* Processing Animation */}
                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex justify-center"
                                >
                                    <div className="h-10 w-10 mb-2 bg-gray-500 rounded-full border border-l-0 animate-spin"></div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6 my-16"
                        >
                            {/* Idle State - Using PNG */}
                            <div className="flex justify-center">
                                <img
                                    src="/assets/images/circularWavyImage.png"
                                    alt="AI Idle State"
                                    className="w-40 h-40 object-contain"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Question Display - Separate from main animation */}
                <div className='hidden md:block w-fit mx-auto justify-center items-center mt-6'>
                    {currentQuestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-lg  p-6 rounded-2xl  ${isDarkTheme
                                ? 'bg-gray-800/50 border border-gray-600'
                                : 'bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <p className={`text-lg leading-relaxed ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                                {currentQuestion}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AISpeakingAnimation; 