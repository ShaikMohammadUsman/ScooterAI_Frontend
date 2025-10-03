import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WavyAnimation from '@/components/manager/createJob/WavyAnimation';

interface AISpeakingAnimationProps {
    isSpeaking: boolean;
    isProcessing: boolean;
    currentQuestion?: string | null;
    isDarkTheme?: boolean;
    speechDuration?: number; // Duration of the current speech in milliseconds
    interviewType?: 'audio' | 'video';
}

const AISpeakingAnimation: React.FC<AISpeakingAnimationProps> = ({
    isSpeaking,
    isProcessing,
    currentQuestion,
    isDarkTheme = true,
    speechDuration,
    interviewType = 'audio'
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

                {/* Current Question Display - Separate from main animation */}
                <div className={`${interviewType === 'video' ? 'hidden md:block' : 'block'} w-fit mx-auto justify-center items-center mt-6`}>
                    {currentQuestion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-lg  p-6 rounded-2xl  ${isDarkTheme
                                ? 'bg-gray-800/50 border border-gray-600'
                                : 'bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {/* <p className={`text-lg text-gray-950 leading-relaxed ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}> */}
                            <p className={`text-lg text-gray-950 leading-relaxed`}>
                                {currentQuestion}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Main Animation Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    {/* Wavy Animation - Handles both speaking and idle states */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-64 h-auto min-h-40 flex items-center justify-center">
                            <WavyAnimation showAnimation={showSpeakingAnimation} />
                        </div>
                    </div>

                    {/* Processing Animation */}
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center"
                        >
                            <p className='text-bg-secondary-4 bg-muted-foreground p-2 rounded-lg'>Processing...</p>
                            {/* <div className="h-10 w-10 mb-2 bg-gray-500 rounded-full border border-l-0 animate-spin"></div> */}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AISpeakingAnimation; 